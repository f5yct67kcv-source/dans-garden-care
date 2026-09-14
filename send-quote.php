<?php
/**
 * send-quote.php — receives the "Get a quote with photos" form and emails
 * it straight to Dan. Runs entirely on this hosting account (Hostpoint);
 * no third-party form service or external API is involved. Uploading this
 * file next to index.html is all the setup it needs beyond the two values
 * below — see README.md, "Offerte-Formular einrichten".
 */

declare(strict_types=1);

// ---- the two things to check before going live ------------------------
$toEmail   = 'relax@butterfly-cottage.co.uk'; // where quote requests land
$fromEmail = 'relax@butterfly-cottage.co.uk'; // must be a real mailbox on
                                               // this hosting account, or
                                               // Hostpoint's mail servers
                                               // may reject/spam-filter it
// -------------------------------------------------------------------

header('Content-Type: application/json; charset=utf-8');

function fail(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Method not allowed.', 405);
}

// Honeypot: a real visitor never fills in this hidden field.
if (!empty($_POST['botcheck'])) {
    echo json_encode(['success' => true]);
    exit;
}

// Strip characters that could be used for header injection, since a
// couple of these values are reused inside the email headers below.
function cleanField(string $value, int $maxLength): string {
    $value = preg_replace('/[\r\n]+/', ' ', $value) ?? '';
    return mb_substr(trim($value), 0, $maxLength);
}

$name     = cleanField((string)($_POST['name'] ?? ''), 200);
$contact  = cleanField((string)($_POST['contact'] ?? ''), 200);
$location = cleanField((string)($_POST['location'] ?? ''), 200);
$message  = cleanField((string)($_POST['message'] ?? ''), 4000);

if ($name === '' || $contact === '' || $location === '') {
    fail('Please fill in name, contact and location.');
}

// ---- photos: up to 3, JPEG/PNG/WebP only, sanity-checked size ----------
$maxPhotos    = 3;
$maxBytesEach = 6 * 1024 * 1024; // the browser already compresses to ~1600px JPEGs
$allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];

$attachments = [];
if (!empty($_FILES['attachment']) && is_array($_FILES['attachment']['name'] ?? null)) {
    $files = $_FILES['attachment'];
    $count = count($files['name']);
    if ($count > $maxPhotos) {
        fail("Please attach up to $maxPhotos photos.");
    }
    for ($i = 0; $i < $count; $i++) {
        if ($files['error'][$i] === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        if ($files['error'][$i] !== UPLOAD_ERR_OK) {
            fail('One of the photos failed to upload — please try again.');
        }
        if ($files['size'][$i] > $maxBytesEach) {
            fail('One of the photos is too large.');
        }
        $tmpPath = $files['tmp_name'][$i];
        if (!is_uploaded_file($tmpPath)) {
            fail('One of the photos failed to upload — please try again.');
        }
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($tmpPath);
        if (!isset($allowedTypes[$mime])) {
            fail('Photos must be JPEG, PNG or WebP.');
        }
        $attachments[] = [
            'data' => file_get_contents($tmpPath),
            'mime' => $mime,
            'name' => 'photo-' . ($i + 1) . '.' . $allowedTypes[$mime],
        ];
    }
}

// ---- build and send a MIME email by hand (no library, no service) ------
function mimeEncodedWord(string $text): string {
    return '=?UTF-8?B?' . base64_encode($text) . '?=';
}

$boundary = 'b_' . bin2hex(random_bytes(16));
$subject  = mimeEncodedWord('New quote request - Dan\'s Garden Care website');

$bodyText = "Name: $name\r\n"
    . "Contact: $contact\r\n"
    . "Location: $location\r\n\r\n"
    . "What needs doing:\r\n"
    . ($message !== '' ? $message : '(not provided)') . "\r\n";

$headers = [
    'From: ' . mimeEncodedWord("Dan's Garden Care website") . " <$fromEmail>",
    'MIME-Version: 1.0',
    "Content-Type: multipart/mixed; boundary=\"$boundary\"",
];
// Only set Reply-To when the customer actually left an email address —
// a phone number there would make an invalid header.
if (filter_var($contact, FILTER_VALIDATE_EMAIL)) {
    $headers[] = "Reply-To: $contact";
}

$body = "--$boundary\r\n"
    . "Content-Type: text/plain; charset=UTF-8\r\n"
    . "Content-Transfer-Encoding: 8bit\r\n\r\n"
    . $bodyText . "\r\n";

foreach ($attachments as $file) {
    $body .= "--$boundary\r\n"
        . "Content-Type: {$file['mime']}; name=\"{$file['name']}\"\r\n"
        . "Content-Transfer-Encoding: base64\r\n"
        . "Content-Disposition: attachment; filename=\"{$file['name']}\"\r\n\r\n"
        . chunk_split(base64_encode($file['data'])) . "\r\n";
}
$body .= "--$boundary--";

$sent = mail($toEmail, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    fail('Could not send the request just now — please try again shortly.', 502);
}

echo json_encode(['success' => true]);
