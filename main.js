const toggle=document.querySelector('.menu-button');
const menu=document.querySelector('#mobile-menu');
function closeMenu(){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.querySelector('span').textContent='+';}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';menu.hidden=open;toggle.setAttribute('aria-expanded',String(!open));toggle.querySelector('span').textContent=open?'+':'−';});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();toggle.focus();}});
document.querySelector('#year').textContent=new Date().getFullYear();
