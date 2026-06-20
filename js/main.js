// ============================================
// MOBILE NAVIGATION TOGGLE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      navLinks.classList.toggle('open');
    });
  }

  // Close mobile nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });

  console.log('✅ Monica R. Amer · Personal Profile loaded');
  console.log('📌 Built with HTML, CSS, JavaScript');
  console.log('🤖 AI-assisted development');
});

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// ============================================
// UPDATE SOCIAL MEDIA LINKS (Replace with your actual links)
// ============================================
// You can update these with your actual profile URLs
const socialLinks = {
  github: 'https://github.com/your-username',
  facebook: 'https://facebook.com/your-profile',
  linkedin: 'https://linkedin.com/in/your-profile',
  twitter: 'https://twitter.com/your-handle'
};

document.querySelectorAll('.footer-social a').forEach((link, index) => {
  const keys = ['github', 'facebook', 'linkedin', 'twitter'];
  if (index < keys.length) {
    link.href = socialLinks[keys[index]] || '#';
  }
});

// ============================================
// FORM HANDLING (Contact page)
// ============================================
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');

    if (name && email && message) {
      if (name.value.trim() && email.value.trim() && message.value.trim()) {
        alert('✅ Thank you, ' + name.value + '! Your message has been sent.\n\n(Note: This is a demo. Add backend functionality to actually send emails.)');
        this.reset();
      } else {
        alert('⚠️ Please fill in all fields.');
      }
    }
  });
}

// ============================================
// YEAR AUTO-UPDATE IN FOOTER
// ============================================
const footerYear = document.querySelector('footer p');
if (footerYear) {
  const currentYear = new Date().getFullYear();
  footerYear.innerHTML = footerYear.innerHTML.replace('2026', currentYear);
}

console.log('✅ JavaScript initialized successfully.');