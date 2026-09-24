(() => {
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.mobile-nav');
  const closeMenu = () => {
    if (!menu || !navigation) return;
    menu.setAttribute('aria-expanded', 'false');
    menu.textContent = 'Menu';
    navigation.hidden = true;
  };
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? 'Close' : 'Menu';
    navigation.hidden = !open;
  });
  navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('pending-reveal');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.08 });
    document.documentElement.classList.add('motion-ready');
    document.querySelectorAll('.reveal').forEach(element => {
      if (element.getBoundingClientRect().top > window.innerHeight) element.classList.add('pending-reveal');
      observer.observe(element);
    });
  }

  const form = document.querySelector('#enquiry-form');
  if (!form) return;
  const select = form.querySelector('#service');
  const service = new URLSearchParams(window.location.search).get('service');
  if (Array.from(select.options).some(option => option.value === service)) select.value = service;
  const review = document.querySelector('#draft-review');
  const content = document.querySelector('#draft-content');
  const status = document.querySelector('#copy-status');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const business = String(data.get('business') || '').trim();
    const message = String(data.get('message') || '').trim();
    const support = select.options[select.selectedIndex].text;
    const draft = `Hi Jonah,\n\n${message}\n\nSupport I am considering: ${support}\n${business ? `Business: ${business}\n` : ''}\n${name}\n${email}`;
    content.textContent = draft;
    const subject = `JKGS consulting enquiry${business ? ' - ' + business : ''}`;
    document.querySelector('#open-email').href = `mailto:info@jkgsconsulting.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draft)}`;
    status.textContent = '';
    form.hidden = true;
    review.hidden = false;
    document.querySelector('#draft-heading').focus();
  });
  document.querySelector('#edit-draft').addEventListener('click', () => {
    review.hidden = true;
    form.hidden = false;
    form.querySelector('#message').focus();
  });
  document.querySelector('#copy-draft').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(content.textContent);
      status.textContent = 'Message copied. You can paste it into your email.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(content);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'The message is selected. Use your usual copy command, then paste it into your email.';
    }
  });
  form.querySelector('button[type="submit"]').disabled = false;
})();
