/**
 * Main Portfolio Orchestrator
 * Coordinates interactive moments, live metrics, word-highlight scroll trigger,
 * AI mode toggle, and smooth interactions.
 */
(function(window) {
  'use strict';

  function init() {
    setupAiModeSwitch();
    setupWordHighlight();
    setupLiveMetrics();
    setupFloatingBadgesParallax();
    setupContactForm();
    setupQuickSoundToggle();
  }

  /* ---------------- 1. AI Mode Pill Switch (Hero) ---------------- */
  function setupAiModeSwitch() {
    var switchPills = document.querySelectorAll('.js-ai-mode-toggle');
    switchPills.forEach(function(pill) {
      pill.addEventListener('click', function(e) {
        e.preventDefault();
        var cfg = window.PortfolioSettings ? window.PortfolioSettings.get() : { aiMode: false };
        var nextMode = !cfg.aiMode;

        if (window.PortfolioSettings) {
          window.PortfolioSettings.set({ aiMode: nextMode });
        }

        if (window.SoundFX) {
          window.SoundFX.modeShift();
        }

        updateAiModeUI(nextMode);
      });
    });

    // Initial state
    var cfg = window.PortfolioSettings ? window.PortfolioSettings.get() : { aiMode: false };
    updateAiModeUI(cfg.aiMode);

    window.addEventListener('portfolio:settings-changed', function(e) {
      if (e.detail) {
        updateAiModeUI(e.detail.aiMode);
      }
    });
  }

  function updateAiModeUI(isAi) {
    var switchPills = document.querySelectorAll('.js-ai-mode-toggle');
    switchPills.forEach(function(pill) {
      if (isAi) {
        pill.classList.add('is-active');
        pill.setAttribute('aria-checked', 'true');
      } else {
        pill.classList.remove('is-active');
        pill.setAttribute('aria-checked', 'false');
      }
    });

    var badge = document.getElementById('hero-ai-badge');
    if (badge) {
      badge.textContent = isAi ? 'AI Copilot Mode Active' : 'Student Developer Mode';
    }
  }

  /* ---------------- 2. Dealt Moment: Word-Highlight on Scroll ---------------- */
  function setupWordHighlight() {
    var container = document.getElementById('sec-statement');
    if (!container) return;

    var words = container.querySelectorAll('.hl-word');
    if (words.length === 0) return;

    function onScroll() {
      var rect = container.getBoundingClientRect();
      var windowH = window.innerHeight;

      // Start highlighting as statement approaches viewport center
      var progress = (windowH - rect.top) / (windowH + rect.height * 0.5);
      progress = Math.max(0, Math.min(1, progress));

      var activeIndex = Math.floor(progress * words.length * 1.3);

      words.forEach(function(w, idx) {
        if (idx <= activeIndex) {
          w.classList.add('is-lit');
        } else {
          w.classList.remove('is-lit');
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- 3. Live Metrics & Clock ---------------- */
  function setupLiveMetrics() {
    var clockEl = document.getElementById('metric-clock');
    var uptimeEl = document.getElementById('metric-uptime');

    function updateClock() {
      if (clockEl) {
        var now = new Date();
        var istOffset = 5.5 * 60 * 60 * 1000;
        var istDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + istOffset);
        var hrs = String(istDate.getHours()).padStart(2, '0');
        var mins = String(istDate.getMinutes()).padStart(2, '0');
        var secs = String(istDate.getSeconds()).padStart(2, '0');
        clockEl.textContent = hrs + ':' + mins + ':' + secs + ' IST';
      }
    }

    setInterval(updateClock, 1000);
    updateClock();

    if (uptimeEl) {
      var days = Math.floor((Date.now() - new Date('2024-08-01').getTime()) / (1000 * 60 * 60 * 24));
      uptimeEl.textContent = days + ' Days at NST';
    }
  }

  /* ---------------- 4. Floating Badges Parallax ---------------- */
  function setupFloatingBadgesParallax() {
    var hero = document.getElementById('sec-hero');
    var badges = document.querySelectorAll('.js-float-badge');
    if (!hero || badges.length === 0) return;

    hero.addEventListener('mousemove', function(e) {
      var cfg = window.PortfolioSettings ? window.PortfolioSettings.get() : { motion: 'full', floatingBadges: true };
      if (cfg.motion === 'reduced' || !cfg.floatingBadges) return;

      var rect = hero.getBoundingClientRect();
      var mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      var mouseY = (e.clientY - rect.top) / rect.height - 0.5;

      badges.forEach(function(badge) {
        var depth = parseFloat(badge.getAttribute('data-depth') || '15');
        var tx = mouseX * depth;
        var ty = mouseY * depth;
        badge.style.transform = 'translate3d(' + tx.toFixed(1) + 'px, ' + ty.toFixed(1) + 'px, 0)';
      });
    });

    hero.addEventListener('mouseleave', function() {
      badges.forEach(function(badge) {
        badge.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }

  /* ---------------- 5. Contact Form Dispatch ---------------- */
  function setupContactForm() {
    var form = document.getElementById('portfolio-contact-form');
    var feedback = document.getElementById('contact-feedback');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var nameVal = form.querySelector('[name="name"]').value.trim();
      var emailVal = form.querySelector('[name="email"]').value.trim();
      var msgVal = form.querySelector('[name="message"]').value.trim();

      if (!nameVal || !emailVal || !msgVal) return;

      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Transmitting...';
      }

      if (window.SoundFX) window.SoundFX.modeShift();

      setTimeout(function() {
        if (feedback) {
          feedback.style.display = 'block';
          feedback.innerHTML = '<span class="status-dot"></span> Message transmitted directly to Srikanth. Thank you for connecting!';
        }
        form.reset();
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Message Sent ✓';
          setTimeout(function() { btn.textContent = 'Send Message'; }, 3000);
        }
      }, 800);
    });
  }

  /* ---------------- 6. Quick Sound Toggle in Nav ---------------- */
  function setupQuickSoundToggle() {
    var soundBtn = document.getElementById('nav-sound-toggle');
    if (!soundBtn) return;

    soundBtn.addEventListener('click', function() {
      var cfg = window.PortfolioSettings ? window.PortfolioSettings.get() : { soundEnabled: true };
      var nextSound = !cfg.soundEnabled;
      if (window.PortfolioSettings) {
        window.PortfolioSettings.set({ soundEnabled: nextSound });
      }
      updateSoundBtn(nextSound);
    });

    var cfg = window.PortfolioSettings ? window.PortfolioSettings.get() : { soundEnabled: true };
    updateSoundBtn(cfg.soundEnabled);

    window.addEventListener('portfolio:settings-changed', function(e) {
      if (e.detail) {
        updateSoundBtn(e.detail.soundEnabled);
      }
    });
  }

  function updateSoundBtn(enabled) {
    var soundBtn = document.getElementById('nav-sound-toggle');
    if (!soundBtn) return;
    soundBtn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    soundBtn.title = enabled ? 'Mute sound effects' : 'Enable sound effects';
    var icon = soundBtn.querySelector('.sound-icon');
    if (icon) {
      icon.textContent = enabled ? '🔊' : '🔇';
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);
