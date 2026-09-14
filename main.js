const toggle=document.querySelector('.menu-button');
const menu=document.querySelector('#mobile-menu');
function closeMenu(){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.querySelector('span').textContent='+';}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';menu.hidden=open;toggle.setAttribute('aria-expanded',String(!open));toggle.querySelector('span').textContent=open?'+':'−';});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();toggle.focus();}});
document.querySelector('#year').textContent=new Date().getFullYear();

/* Photo-quote request
   ---------------------------------------------------------------
   This site has no server, so submissions go through a free
   form-to-email service that accepts file uploads (Web3Forms).
   To switch it on:
     1. Go to https://web3forms.com, enter Dan's email, and copy
        the Access Key it sends you (no account/login needed).
     2. Paste that key below, replacing the PASTE_... placeholder.
   Until a real key is in place, the form tells the customer to
   call or email Dan directly instead of failing silently.
   If you'd rather use a different provider (e.g. Formspree), swap
   QUOTE_ENDPOINT and the field names in the submit handler below
   to match that provider's docs. */
const QUOTE_ENDPOINT = 'https://api.web3forms.com/submit';
const QUOTE_ACCESS_KEY = 'PASTE_WEB3FORMS_ACCESS_KEY_HERE';

const quoteDialog = document.querySelector('#quote-dialog');
const quoteForm = document.querySelector('#quote-form');
const quoteStatus = document.querySelector('#quote-status');
const quoteSubmit = quoteForm.querySelector('.quote-submit');
const fileInput = document.querySelector('#quote-photos');
const photoList = document.querySelector('#quote-photo-list');
const photoHint = document.querySelector('#quote-photo-hint');

const MAX_PHOTOS = 3;
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.75;
const defaultPhotoHint = photoHint.textContent;

let selectedPhotos = [];
let lastFocused = null;

function openQuoteDialog(){
  lastFocused = document.activeElement;
  quoteDialog.showModal();
  quoteForm.querySelector('input[name=name]').focus();
}
document.querySelectorAll('[data-open-quote]').forEach(btn => btn.addEventListener('click', openQuoteDialog));
quoteDialog.querySelector('[data-close-quote]').addEventListener('click', () => quoteDialog.close());
quoteDialog.addEventListener('close', () => lastFocused && lastFocused.focus());
quoteDialog.addEventListener('click', e => {
  const r = quoteDialog.getBoundingClientRect();
  const insideDialog = e.clientY >= r.top && e.clientY <= r.bottom && e.clientX >= r.left && e.clientX <= r.right;
  if (!insideDialog) quoteDialog.close();
});

// Shrink each photo client-side before upload, so a few full-size phone
// photos don't turn "add photos" into a slow, data-hungry step.
async function compressPhoto(file){
  if (!file.type.startsWith('image/')) return file;
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file; // if anything about compression fails, fall back to the original file
  } finally {
    URL.revokeObjectURL(url);
  }
}

function renderPhotoList(){
  photoList.innerHTML = '';
  selectedPhotos.forEach((entry, i) => {
    const li = document.createElement('li');
    const img = document.createElement('img');
    img.src = entry.previewUrl;
    img.alt = '';
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'quote-photo-remove';
    remove.setAttribute('aria-label', 'Remove photo ' + (i + 1));
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      URL.revokeObjectURL(entry.previewUrl);
      selectedPhotos.splice(i, 1);
      renderPhotoList();
    });
    li.append(img, remove);
    photoList.append(li);
  });
  photoHint.textContent = selectedPhotos.length
    ? `${selectedPhotos.length} of ${MAX_PHOTOS} photos added`
    : defaultPhotoHint;
}

fileInput.addEventListener('change', async () => {
  const incoming = Array.from(fileInput.files || []).filter(f => f.type.startsWith('image/'));
  fileInput.value = ''; // reset so choosing the same file again still fires "change"
  for (const file of incoming) {
    if (selectedPhotos.length >= MAX_PHOTOS) break;
    const compressed = await compressPhoto(file);
    selectedPhotos.push({ file: compressed, previewUrl: URL.createObjectURL(compressed) });
  }
  renderPhotoList();
});

quoteForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (quoteForm.botcheck.value) return; // honeypot tripped — say nothing, do nothing

  if (QUOTE_ACCESS_KEY.startsWith('PASTE_')) {
    quoteStatus.textContent = 'This form isn’t switched on yet — please call or email Dan directly.';
    quoteStatus.className = 'quote-status error';
    return;
  }

  quoteSubmit.disabled = true;
  quoteSubmit.textContent = 'Sending…';
  quoteStatus.textContent = '';
  quoteStatus.className = 'quote-status';

  const data = new FormData();
  data.append('access_key', QUOTE_ACCESS_KEY);
  data.append('subject', 'New quote request — Dan’s Garden Care website');
  data.append('name', quoteForm.name.value.trim());
  data.append('contact', quoteForm.contact.value.trim());
  data.append('location', quoteForm.location.value.trim());
  data.append('message', quoteForm.message.value.trim());
  selectedPhotos.forEach(entry => data.append('attachment', entry.file, entry.file.name));

  try {
    const res = await fetch(QUOTE_ENDPOINT, { method: 'POST', body: data });
    const result = await res.json().catch(() => ({ success: res.ok }));
    if (!res.ok || result.success === false) throw new Error('submit failed');

    quoteForm.reset();
    selectedPhotos.forEach(entry => URL.revokeObjectURL(entry.previewUrl));
    selectedPhotos = [];
    renderPhotoList();
    quoteStatus.textContent = 'Thanks — that’s with Dan now. He’ll get back to you.';
    quoteStatus.className = 'quote-status success';
    setTimeout(() => quoteDialog.close(), 2200);
  } catch {
    quoteStatus.textContent = 'That didn’t send — please try again, or call/email Dan directly.';
    quoteStatus.className = 'quote-status error';
  } finally {
    quoteSubmit.disabled = false;
    quoteSubmit.textContent = 'Send request';
  }
});
