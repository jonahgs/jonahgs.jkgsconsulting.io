document.addEventListener('DOMContentLoaded', () => {
  // Helper function: Hide the mobile menu with a fade-out and upward slide effect
  const hideMobileMenu = (menu) => {
    if (!menu.classList.contains('hidden')) {
      menu.classList.add('fade-out-up');
      setTimeout(() => {
        menu.classList.add('hidden');
        menu.classList.remove('fade-out-up');
      }, 300); // This duration should match your CSS transition duration (300ms)
    }
  };

  // ----- Mobile Menu Toggle with Fade Effect -----
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      if (mobileMenu.classList.contains('hidden')) {
        // Show the mobile menu: Remove 'hidden' and any fade-out class; ensure full opacity
        mobileMenu.classList.remove('hidden', 'fade-out-up');
        mobileMenu.classList.add('opacity-100');
      } else {
        // Hide the mobile menu with the fade-out-up effect
        hideMobileMenu(mobileMenu);
      }
    });

    // Hide the mobile menu when any mobile link is clicked
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hideMobileMenu(mobileMenu);
      });
    });
  }

  // ----- Universal Anchor Click Handler with Scroll Offset -----
  // This intercepts clicks on any <a> with an href starting with '#' and scrolls the entire section into view.
  // It uses a default offset (150px) unless a custom data-offset is provided.
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').substring(1);
      let targetElement = document.getElementById(targetId);
      if (targetElement) {
        // If the target element is not a <section>, try to find its closest section ancestor.
        if (targetElement.tagName.toLowerCase() !== 'section') {
          const sectionParent = targetElement.closest('section');
          if (sectionParent) {
            targetElement = sectionParent;
          }
        }
        e.preventDefault();
        // Hide the mobile menu if it's open.
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
          hideMobileMenu(mobileMenu);
        }
        // Check for a custom offset via data-offset; default to 150px.
        const defaultOffset = 150;
        const customOffset = this.dataset.offset ? parseInt(this.dataset.offset, 10) : defaultOffset;
        const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - customOffset,
          behavior: 'smooth'
        });
      }
    });
  });

  // ----- Header Scroll Effect: Change Header Background on Scroll -----
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('bg-green-800');
        header.classList.remove('bg-green-900');
      } else {
        header.classList.add('bg-green-900');
        header.classList.remove('bg-green-800');
      }
    });
  }

  // ----- Footer Adjustments: Remove AOS Classes (if needed) -----
  const footer = document.querySelector('footer');
  if (footer) {
    footer.classList.remove('aos-animate', 'aos-init');
  }

  // ----- AJAX Form Submission for the Contact Form -----
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      fetch('/', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
        .then(response => {
          if (response.ok) {
            // Show inline success notification and reset the form
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
});