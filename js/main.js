// js/main.js

document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const menuBtn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  const mobileMenu = document.getElementById('mobileMenu');

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
      mobileMenu.classList.toggle('hidden');
    });
  }

  // AJAX form submission for the contact form
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(form);
      fetch('/', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
      .then(response => {
        if (response.ok) {
          // Show inline success notification
          document.getElementById('form-notification').classList.remove('hidden');
          form.reset();
        } else {
          alert('There was a problem submitting your form.');
        }
      })
      .catch(error => {
        alert('There was a problem submitting your form.');
        console.error('Form submission error:', error);
      });
    });
  }

  // Header scroll effect: change header background on scroll
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('bg-green-800');
      header.classList.remove('bg-green-900');
    } else {
      header.classList.add('bg-green-900');
      header.classList.remove('bg-green-800');
    }
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const footer = document.querySelector('footer');
  if (footer) {
    footer.classList.remove('aos-animate');
    footer.classList.remove('aos-init');
  }
});