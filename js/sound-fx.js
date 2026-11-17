/**
 * Sound FX — Web Audio Synthesizer
 * Generates tactile micro-interactions (UI clicks, switches, keyboard clacks)
 * without loading external sound files. Controlled by PortfolioSettings.
 */
(function(window) {
  'use strict';

  var audioCtx = null;

  function getContext() {
    if (!audioCtx) {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function isEnabled() {
    var cfg = window.PortfolioSettings ? window.PortfolioSettings.get() : { soundEnabled: true, soundVolume: 0.25 };
    return cfg.soundEnabled && cfg.soundVolume > 0;
  }

  function getVolume() {
    var cfg = window.PortfolioSettings ? window.PortfolioSettings.get() : { soundVolume: 0.25 };
    return cfg.soundVolume !== undefined ? cfg.soundVolume : 0.25;
  }

  var SoundFX = {
    // Subtle crisp UI click
    click: function(pitchMultiplier) {
      if (!isEnabled()) return;
      var ctx = getContext();
      if (!ctx) return;

      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      var filter = ctx.createBiquadFilter();

      var mult = pitchMultiplier || 1.0;
      var now = ctx.currentTime;
      var vol = getVolume() * 0.35;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420 * mult, now);
      osc.frequency.exponentialRampToValueAtTime(110 * mult, now + 0.04);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(200, now);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    },

    // Mechanical toggle / switch snap
    toggle: function(isOn) {
      if (!isEnabled()) return;
      var ctx = getContext();
      if (!ctx) return;

      var now = ctx.currentTime;
      var vol = getVolume() * 0.4;
      var freqStart = isOn ? 320 : 540;
      var freqEnd = isOn ? 680 : 280;

      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqStart, now);
      osc.frequency.exponentialRampToValueAtTime(freqEnd, now + 0.06);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    },

    // Keystroke typing click
    typeKey: function() {
      if (!isEnabled()) return;
      var cfg = window.PortfolioSettings ? window.PortfolioSettings.get() : { typingClicks: true };
      if (!cfg.typingClicks) return;

      var ctx = getContext();
      if (!ctx) return;

      var now = ctx.currentTime;
      var vol = getVolume() * 0.15;
      var randomPitch = 1200 + Math.random() * 800;

      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(randomPitch, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.02);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    },

    // Futuristic mode-switch chord
    modeShift: function() {
      if (!isEnabled()) return;
      var ctx = getContext();
      if (!ctx) return;

      var now = ctx.currentTime;
      var vol = getVolume() * 0.25;
      var notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      notes.forEach(function(freq, index) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.03);

        gain.gain.setValueAtTime(vol / (index + 1), now + index * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.03 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.03);
        osc.stop(now + index * 0.03 + 0.36);
      });
    }
  };

  // Wire automatic sound to buttons and links on click
  document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
      var target = e.target.closest('button, a, input[type="checkbox"], input[type="radio"], .js-sound-click');
      if (target) {
        if (target.type === 'checkbox' || target.getAttribute('role') === 'switch') {
          SoundFX.toggle(target.checked || target.getAttribute('aria-checked') === 'true');
        } else {
          SoundFX.click();
        }
      }
    });
  });

  window.SoundFX = SoundFX;
})(window);
