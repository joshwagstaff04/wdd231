(() => {
const btn = document.getElementById('menu-btn');
const nav = document.getElementById('primary-nav');
if (!btn || !nav) return;
const toggle = () => {
const isOpen = nav.classList.toggle('open');
btn.setAttribute('aria-expanded', String(isOpen));
btn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
};
btn.addEventListener('click', toggle);



const links = nav.querySelectorAll('a[href]');
const here = location.pathname.replace(/\/index\.html?$/, '/');
links.forEach(a => {
const href = new URL(a.href).pathname.replace(/\/index\.html?$/, '/');
if (href === here) {
a.classList.add('active');
a.setAttribute('aria-current', 'page');
}
});
})();