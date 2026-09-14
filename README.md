# Dan’s Garden Care — Website-Entwurf

Statische Website mit HTML, CSS, JavaScript und lokalen Bildern. Kein Build und keine Paketinstallation erforderlich.

## Dateien
- index.html: Inhalte und Seitenstruktur
- style.css: Gestaltung und responsive Ansichten
- main.js: mobiles Menü, Jahreszahl und das Offerte-Formular (Dialog, Fotokomprimierung, Versand)
- send-quote.php: eigener, selbstgehosteter Endpoint, der das Offerte-Formular per E-Mail an Dan zustellt (siehe „Offerte-Formular einrichten“)
- assets/: Logo und alle verwendeten Bilder

## GitHub-Upload
1. ZIP entpacken.
2. Repository öffnen und Add file > Upload files wählen.
3. index.html, style.css, main.js, send-quote.php, README.md und den gesamten Ordner assets gemeinsam hochladen. Nicht die ZIP-Datei hochladen.
4. Mit Commit changes speichern.

## Vorschau und Bearbeitung
index.html im Browser öffnen. Alternativ im Projektordner mit PHP: php -S localhost:8000 und http://localhost:8000 öffnen (nötig, damit das Offerte-Formular lokal gegen send-quote.php testbar ist; ein reiner Static-Server wie python3 -m http.server kann PHP nicht ausführen).
Für Claude Code den Repository-Ordner als Projekt verwenden. Die Dateien sind direkt editierbar.
Für klassisches Webhosting index.html, style.css, main.js, send-quote.php und assets gemeinsam ins Webverzeichnis kopieren.

## Entwurfsstand
Farben: Grün #14452F, Terrakotta #B5401E, Creme #F5F2E9.
Das Hero-Bild zeigt Dan bei der Gartenarbeit. Die Projektvergleiche verwenden Daniels echte Arbeitsfotos. Logo und Bilder sind enthalten.
Kontaktlinks öffnen Telefon bzw. E-Mail. Zusätzlich gibt es ein Offerte-Formular mit Foto-Upload (siehe unten) – ein klassisches serverseitiges Kontaktformular gibt es weiterhin nicht, da die Seite statisch bleibt.

## Offerte-Formular einrichten
Der Button „Get a quote with photos“ (im Hero und im Kontaktbereich) öffnet ein Formular, in dem Interessenten Name, Kontakt, Standort, eine kurze Beschreibung und bis zu 3 Gartenfotos direkt aus dem Browser senden können. Fotos werden vor dem Versand im Browser verkleinert (lange Kante max. 1600 px, JPEG), damit auch auf mobilen Daten schnell gesendet wird.

Der Versand läuft **vollständig selbst gehostet** über `send-quote.php` auf Daniels eigenem Hostpoint-Hosting – kein externer Formular-Dienst, kein Drittanbieter-Account, keine Kundendaten verlassen den eigenen Server. Das Skript baut die E-Mail samt Foto-Anhängen selbst zusammen (kein PHPMailer, keine Library) und verschickt sie über PHPs eingebaute `mail()`-Funktion, die auf Hostpoint-Hosting standardmässig funktioniert.

Einrichtung:
1. `send-quote.php` zusammen mit den anderen Dateien in Daniels Hostpoint-Webverzeichnis hochladen (gleicher Ordner wie index.html).
2. In `send-quote.php` ganz oben `$toEmail` (wohin die Anfragen gehen) und `$fromEmail` prüfen/anpassen. `$fromEmail` muss ein echtes Postfach auf Daniels eigener Hosting-Domain sein – sonst weist Hostpoints Mailserver die Nachricht unter Umständen ab oder sie landet im Spam.
3. Testanfrage über das Live-Formular senden (inkl. Foto) und prüfen, ob sie im Zielpostfach ankommt; ggf. auch den Spam-Ordner prüfen.
4. Falls Fotos nicht ankommen: im Hostpoint-Kundencenter die PHP-Werte `upload_max_filesize` und `post_max_size` prüfen (sollten je mind. 8–10 MB erlauben, für 3 komprimierte Fotos reicht das üblich vorhandene Limit meist bereits).

Solange `send-quote.php` noch nicht hochgeladen ist oder ein Versand fehlschlägt, zeigt das Formular „That didn't send – please try again, or call/email Dan directly.“ an, statt sang- und klanglos zu scheitern.

Serverseitig geprüft wird zusätzlich: Pflichtfelder vorhanden, maximal 3 Fotos, jedes Foto tatsächlich ein Bild (JPEG/PNG/WebP, per Dateiinhalt geprüft, nicht nur am Dateinamen) und höchstens 6 MB, ein verstecktes Honeypot-Feld gegen einfache Spam-Bots, sowie Schutz gegen E-Mail-Header-Injection über die Formularfelder.
Vor einer öffentlichen Veröffentlichung: Daniels Freigabe für Darstellung und Arbeitskleidung, Bildnutzung und Vorher-nachher-Zuordnung einholen; Leistungsangaben und Kontakt prüfen; rechtliche Angaben prüfen/ergänzen. Der Entwurf enthält absichtlich noindex,nofollow — erst für die finale öffentliche Seite entfernen.

## Hosting
Dieser Export ist unabhängig vom bestehenden privaten Sites-Entwurf. GitHub-Uploads aktualisieren dessen veröffentlichte Version nicht automatisch. Es wurden keine Zugangsdaten oder internen Hosting-Konfigurationen exportiert.

## Bilder weboptimiert integrieren
- Fotos als komprimiertes WebP exportieren; Originaldateien nicht direkt in die Seite einbinden.
- Für jedes Foto passende Breiten über `srcset` und zur CSS-Spaltenbreite passende `sizes` angeben. Nicht über die Originalauflösung hinaus vergrössern.
- Hero: 640 / 1024 / 1672 px, Qualitätsstufe 82. Das Motiv zeigt Daniel mit khakifarbenen Arbeitshosen und schwarzen Knieverstärkungen.
- Breite Arbeitsfotos: 480 / 800 / 1400 px; schmale Vergleichsfotos: 320 / 640 / maximal 960 px, Qualitätsstufe 78. Bei kleineren Originalen endet die Reihe früher.
- `width` und `height` müssen dem Seitenverhältnis der Datei entsprechen, damit der Browser Platz reserviert.
- Hero mit `fetchpriority="high"` und `loading="eager"`; Bilder unterhalb des Einstiegs mit `loading="lazy"`. Fotos verwenden `decoding="async"`.
- Nach Bildwechsel Desktop und Mobilansicht auf Bildausschnitt, Schärfe und Ladegrösse prüfen.
