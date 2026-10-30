const filters = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('[data-project]');
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(item => {item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button));});
  projects.forEach(item => {item.hidden = button.dataset.filter !== 'all' && item.dataset.category !== button.dataset.filter;});
}));
const rotation = document.querySelector('#rotation');
rotation?.addEventListener('input', () => {
  document.querySelector('.cube').style.transform = `rotateX(-22deg) rotateY(${Number(rotation.value)}deg)`;
  document.querySelector('#rotation-value').textContent = `${rotation.value}°`;
});
const studies = [
  ['The space between', 'Một thử nghiệm bố cục với những mặt phẳng bê tông, khoảng trống và ánh sáng lạnh. Hình minh họa được dựng bằng đồ họa vector cho bản thiết kế website.'],
  ['Objects of silence', 'Một nghiên cứu hình khối trừu tượng. Bề mặt, bóng đổ và khoảng rỗng tạo nên nhịp điệu thị giác.'],
  ['A quiet threshold', 'Một thử nghiệm về ngưỡng cửa, chiều sâu và sự chuyển tiếp giữa sáng và tối.']
];
const dialog = document.querySelector('#project-dialog');
projects.forEach(project => project.addEventListener('click', () => {
  const study = studies[Number(project.dataset.project)];
  document.querySelector('#dialog-title').textContent = window.translateText(study[0]);
  document.querySelector('#dialog-description').textContent = window.translateText(study[1]);
  dialog.showModal();
}));
document.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => {if (event.target === dialog) {const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();}});
const menu = document.querySelector('#scene-menu');
const triggers = document.querySelectorAll('.menu-toggle, .explore-trigger');
let menuAnimation;
let menuClosing = false;
const reducedMenuMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
triggers.forEach(trigger => trigger.addEventListener('click', () => {
  if (menu.open) return;
  menuClosing = false;
  menuAnimation?.cancel();
  menu.showModal();
  triggers.forEach(button => button.setAttribute('aria-expanded', 'true'));
  if (!reducedMenuMotion()) {
    menuAnimation = menu.animate([{opacity:0}, {opacity:1}], {
      duration:1800, easing:'ease-in-out'
    });
  }
}));
async function closeMenu() {
  if (!menu.open || menuClosing) return;
  menuClosing = true;
  const opacity = getComputedStyle(menu).opacity;
  menuAnimation?.cancel();
  if (!reducedMenuMotion()) {
    menuAnimation = menu.animate([{opacity}, {opacity:0}], {
      duration:800, easing:'ease-in-out', fill:'forwards'
    });
    await menuAnimation.finished.catch(() => {});
  }
  menu.close();
  menuAnimation?.cancel();
  menuClosing = false;
}
document.querySelector('.menu-close').addEventListener('click', closeMenu);
menu.addEventListener('cancel', event => {event.preventDefault(); closeMenu();});
menu.addEventListener('close', () => triggers.forEach(button => button.setAttribute('aria-expanded', 'false')));
// Preview the two requested typography colors without changing the chosen URL.
if (new URLSearchParams(location.search).get('ink') === 'black') {
  document.body.dataset.ink = 'black';
} else {
  document.body.dataset.ink = 'white';
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    const url = new URL(link.href);
    url.searchParams.set('ink', 'white');
    link.href = url.href;
  });
}
const intro = document.querySelector('.brand-intro');
if (intro) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const content = [...document.querySelectorAll('body > header, body > main')];
  content.forEach(element => {element.inert = true;});
  let finished = false;
  const finishIntro = () => {
    if (finished) return;
    finished = true;
    document.body.classList.add('home-revealed');
    intro.classList.add('is-complete');
    intro.setAttribute('aria-hidden', 'true');
    intro.inert = true;
    content.forEach(element => {element.inert = false;});
  };
  const image = intro.querySelector('img');
  const imageReady = image?.decode ? image.decode() : Promise.resolve();
  const fontsReady = document.fonts?.ready || Promise.resolve();
  // Give assets a bounded chance to settle, then hold the ident briefly.
  const ready = Promise.race([
    Promise.allSettled([imageReady, fontsReady]),
    new Promise(resolve => setTimeout(resolve, 3000))
  ]);
  ready.then(() => setTimeout(finishIntro, reduced ? 0 : 1250));
  // Always reveal the page even if an asset or browser API stalls.
  setTimeout(finishIntro, 4500);
}
