// ============================================
// API HOST RESOLUTION
// ============================================
const API_HOSTS = {
  local: 'http://localhost:5000',
  hosted: 'https://monica-profile-backend.onrender.com'
};

function getApiOrigin() {
  if (window.location.protocol === 'file:') {
    return API_HOSTS.local;
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return API_HOSTS.local;
  }

  return API_HOSTS.hosted;
}

function getApiUrl(path) {
  const origin = getApiOrigin();
  return `${origin}/api/${path}`;
}

// ============================================
// LOAD PROFILE DATA
// ============================================
async function loadProfileData() {
  try {
    const response = await fetch(getApiUrl('profile'));
    if (!response.ok) throw new Error('Profile API unavailable');

    const profile = await response.json();
    const heroName = document.getElementById('heroName');
    const heroSubtitle = document.getElementById('heroSubtitle');
    const heroInstitution = document.getElementById('heroInstitution');
    const statEducation = document.getElementById('statEducation');
    const statExperience = document.getElementById('statExperience');
    const statSkills = document.getElementById('statSkills');
    const statCertifications = document.getElementById('statCertifications');
    const techStackList = document.getElementById('techStackList');
    const aboutDetails = document.getElementById('aboutDetails');

    if (heroName && profile.name) heroName.textContent = profile.name;
    if (heroSubtitle && profile.course) heroSubtitle.textContent = profile.course;
    if (heroInstitution && profile.university) heroInstitution.innerHTML = `<i class="fas fa-university"></i> ${profile.university}`;
    if (statEducation && Array.isArray(profile.education)) statEducation.textContent = profile.education.length;
    if (statExperience && Array.isArray(profile.experience)) statExperience.textContent = profile.experience.length;
    if (statSkills && Array.isArray(profile.skills)) statSkills.textContent = profile.skills.length;
    if (statCertifications && Array.isArray(profile.certifications)) statCertifications.textContent = profile.certifications.length;
    if (techStackList && Array.isArray(profile.techStack)) {
      techStackList.textContent = 'Technologies used: ' + profile.techStack.join(', ') + '.';
    }

    if (aboutDetails) {
      const skillList = Array.isArray(profile.skills) ? profile.skills.join(', ') : 'HTML, CSS, JavaScript, Python';
      aboutDetails.innerHTML = `
        <div><strong>Location:</strong> ${profile.location || 'Aringay, La Union'}</div>
        <div><strong>Field:</strong> ${profile.course || 'Computer Science'}</div>
        <div><strong>Skills:</strong> ${skillList}</div>
        <div><strong>Interests:</strong> Web apps, UX/UI, AI, software design</div>
      `;
    }
  } catch (error) {
    console.warn('Unable to load profile data:', error);
  }
}

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

    // Close mobile nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }

  // Load profile data on page load
  loadProfileData();

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
// UPDATE SOCIAL MEDIA LINKS
// ============================================
// UPDATE THESE WITH YOUR ACTUAL PROFILE URLS!
const socialLinks = {
  github: 'https://github.com/monicaamer10',        // ← UPDATE
  facebook: 'https://facebook.com/monica.amer',     // ← UPDATE
  linkedin: 'https://linkedin.com/in/monica-amer',  // ← UPDATE
  twitter: 'https://twitter.com/monica_amer'        // ← UPDATE
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
    const statusBox = document.getElementById('formStatus');

    if (name && email && message && statusBox) {
      statusBox.className = 'form-status';
      statusBox.textContent = 'Sending...';

      if (name.value.trim() && email.value.trim() && message.value.trim()) {
        const apiUrl = getApiUrl('contact');

        const payload = {
          name: name.value.trim(),
          email: email.value.trim(),
          message: message.value.trim(),
        };

        const saveLocalMessage = (messageData) => {
          const savedMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
          savedMessages.unshift({
            id: `local-${Date.now()}`,
            ...messageData,
            sentAt: new Date().toISOString(),
          });
          localStorage.setItem('contactMessages', JSON.stringify(savedMessages));
        };

        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
          .then(async response => {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              return response.json();
            }
            const text = await response.text();
            return { success: response.ok, error: text || 'Unable to send message.' };
          })
          .then(data => {
            if (data.success) {
              statusBox.className = 'form-status success';
              statusBox.textContent = data.message || '✅ Your message was sent successfully. Thank you!';
              this.reset();
            } else {
              statusBox.className = 'form-status error';
              statusBox.textContent = '⚠️ ' + (data.error || 'Unable to send message.');
            }
          })
          .catch(error => {
            saveLocalMessage(payload);

            console.error('Contact submit error:', error);
            statusBox.className = 'form-status success';
            statusBox.textContent = '✅ Your message was saved locally. It will appear in Messages.';
            this.reset();
          });
      } else {
        statusBox.className = 'form-status error';
        statusBox.textContent = '⚠️ Please fill in all fields.';
      }
    }
  });
}

// ============================================
// DISPLAY SAVED MESSAGES (Admin view)
// ============================================
function displaySavedMessages() {
  const messagesContainer = document.getElementById('savedMessages');
  if (!messagesContainer) return;

  const savedMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
  
  if (savedMessages.length === 0) {
    messagesContainer.innerHTML = `
      <div class="empty-messages">
        <i class="fas fa-inbox"></i>
        <p>No messages saved yet.</p>
        <p style="font-size: 0.9rem; margin-top: 0.5rem;">Messages from the contact form will appear here.</p>
      </div>
    `;
    return;
  }

  messagesContainer.innerHTML = savedMessages.map((msg, index) => `
    <div class="message-item">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;">
        <div>
          <strong>${msg.name || 'Unknown'}</strong>
          <span class="message-email">(${msg.email || 'No email'})</span>
          <span class="message-badge">#${index + 1}</span>
        </div>
        <span class="message-date">${msg.sentAt ? new Date(msg.sentAt).toLocaleString() : 'Unknown date'}</span>
      </div>
      <div class="message-text">${msg.message || 'No message content'}</div>
    </div>
  `).join('');
}

// Call this on pages that have a messages container
if (document.getElementById('savedMessages')) {
  displaySavedMessages();
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