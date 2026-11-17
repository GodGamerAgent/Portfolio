/**
 * Multiplayer Cursors Simulation
 * Inspired by onlines.com.ar & Figma multiplayer real-time collaboration.
 * Generates organic peer cursors moving along splines with name tags and click blips.
 */
(function(window) {
  'use strict';

  var container = null;
  var cursors = [];
  var isRunning = false;
  var rafId = null;

  var PEER_DATA = [
    { name: 'Srikanth (Dev)', color: '#1a4be0', pathScale: 1.0, offset: 0 },
    { name: 'NST AI Mentor', color: '#f59e0b', pathScale: 0.9, offset: 1.5 },
    { name: 'AI Copilot', color: '#10b981', pathScale: 1.1, offset: 3.2 },
    { name: 'Code Reviewer', color: '#ff4a1f', pathScale: 0.85, offset: 4.8 },
    { name: 'Kernel Bot', color: '#8b5cf6', pathScale: 1.05, offset: 2.1 }
  ];

  function init() {
    container = document.getElementById('multiplayer-cursors-layer');
    if (!container) return;

    setupCursors();

    window.addEventListener('portfolio:settings-changed', function() {
      setupCursors();
    });

    start();
  }

  function setupCursors() {
    if (!container) return;
    container.innerHTML = '';
    cursors = [];

    var cfg = window.PortfolioSettings ? window.PortfolioSettings.get() : { cursors: true, cursorCount: 3 };
    if (!cfg.cursors) {
      stop();
      return;
    }

    var count = Math.min(cfg.cursorCount || 3, PEER_DATA.length);

    for (var i = 0; i < count; i++) {
      var data = PEER_DATA[i];
      var el = document.createElement('div');
      el.className = 'mp-cursor';
      el.style.setProperty('--cursor-color', data.color);
      el.innerHTML = [
        '<svg class="mp-cursor__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">',
        '  <path d="M0 0L14 5.5L7.5 7.5L5.5 14L0 0Z" fill="' + data.color + '"/>',
        '  <path d="M0 0L14 5.5L7.5 7.5L5.5 14L0 0Z" stroke="#ffffff" stroke-width="1.2"/>',
        '</svg>',
        '<div class="mp-cursor__label">' + data.name + '</div>',
        '<div class="mp-cursor__ripple"></div>'
      ].join('');

      container.appendChild(el);

      cursors.push({
        el: el,
        data: data,
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        t: data.offset,
        baseSpeed: 0.003 * (0.8 + Math.random() * 0.4),
        nextClickTime: 2 + Math.random() * 5
      });
    }

    if (!isRunning) {
      start();
    }
  }

  function update() {
    if (!container || cursors.length === 0) return;

    var cfg = window.PortfolioSettings ? window.PortfolioSettings.get() : { cursorSpeed: 1.0, motion: 'full' };
    if (cfg.motion === 'reduced') {
      stop();
      return;
    }

    var speedMult = cfg.cursorSpeed || 1.0;
    var rect = container.getBoundingClientRect();
    var w = rect.width;
    var h = rect.height;

    if (w === 0 || h === 0) {
      rafId = requestAnimationFrame(update);
      return;
    }

    for (var i = 0; i < cursors.length; i++) {
      var c = cursors[i];
      c.t += c.baseSpeed * speedMult;

      // Parametric Lissajous & Lemniscate trajectories for organic paths
      var cx = w * 0.5;
      var cy = h * 0.5;
      var rx = w * 0.38 * c.data.pathScale;
      var ry = h * 0.36 * c.data.pathScale;

      // Trajectory variations
      if (i % 3 === 0) {
        c.targetX = cx + Math.sin(c.t) * rx + Math.cos(c.t * 2.3) * (rx * 0.2);
        c.targetY = cy + Math.sin(c.t * 1.7) * ry + Math.sin(c.t * 0.5) * (ry * 0.2);
      } else if (i % 3 === 1) {
        c.targetX = cx + Math.cos(c.t * 1.2) * rx + Math.sin(c.t * 0.8) * (rx * 0.3);
        c.targetY = cy + Math.sin(c.t * 2.1) * (ry * 0.7) + Math.cos(c.t) * (ry * 0.3);
      } else {
        c.targetX = cx + Math.sin(c.t * 0.9) * (rx * 0.8) + Math.cos(c.t * 1.5) * (rx * 0.25);
        c.targetY = cy + Math.cos(c.t * 1.4) * ry + Math.sin(c.t * 0.6) * (ry * 0.2);
      }

      // Smooth lerp
      c.x += (c.targetX - c.x) * 0.08;
      c.y += (c.targetY - c.y) * 0.08;

      c.el.style.transform = 'translate3d(' + c.x.toFixed(1) + 'px, ' + c.y.toFixed(1) + 'px, 0)';

      // Periodic simulated click/touch blip
      if (c.t > c.nextClickTime) {
        c.el.classList.add('is-clicking');
        setTimeout(removeClickClass(c.el), 350);
        c.nextClickTime = c.t + 4 + Math.random() * 6;
      }
    }

    rafId = requestAnimationFrame(update);
  }

  function removeClickClass(el) {
    return function() {
      if (el) el.classList.remove('is-clicking');
    };
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    rafId = requestAnimationFrame(update);
  }

  function stop() {
    isRunning = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  window.MultiplayerCursors = {
    start: start,
    stop: stop,
    refresh: setupCursors
  };
})(window);
