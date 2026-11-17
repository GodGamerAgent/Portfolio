/* The code frame can move within the space reserved for it in the hero. */
(function () {
  'use strict';

  function init() {
    var selection = document.getElementById('hero-selection-box');
    if (!selection) return;

    var hero = selection.closest('.sec-hero');
    var wrap = selection.closest('.wrap');
    var copy = hero.querySelector('.hero-text');
    var handle = selection.querySelector('.selection-drag-handle');
    var hud = selection.querySelector('.selection-hud');
    var drag = null;
    var x = 0;
    var y = 0;

    function updateHud() {
      var rect = selection.getBoundingClientRect();
      hud.textContent = Math.round(rect.width) + ' × ' + Math.round(rect.height);
    }

    function position(nextX, nextY) {
      x = nextX;
      y = nextY;
      selection.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    }

    function syncSettings() {
      var settings = window.PortfolioSettings.get();
      selection.classList.toggle('is-plain', !settings.selectionBox);
      handle.classList.toggle('is-draggable', settings.selectionBox && settings.selectionDraggable);
      if (!handle.classList.contains('is-draggable')) position(0, 0);
      updateHud();
    }

    handle.addEventListener('pointerdown', function (event) {
      if (drag || event.button !== 0 || event.target.closest('button')) return;
      if (!handle.classList.contains('is-draggable')) return;

      var frame = selection.getBoundingClientRect();
      var text = copy.getBoundingClientRect();
      var bounds = wrap.getBoundingClientRect();
      var stacked = text.bottom <= frame.top - y;
      var top = frame.top - y;
      var left = frame.left - x;
      var hudHeight = hud.offsetHeight + 8;
      var headerBottom = hero.getBoundingClientRect().top + document.querySelector('.site-nav').offsetHeight;

      drag = {
        id: event.pointerId,
        startX: event.clientX - x,
        startY: event.clientY - y,
        minX: stacked ? 0 : Math.min(0, text.right + 8 - left),
        maxX: Math.max(0, bounds.right - left - frame.width),
        minY: Math.min(0, Math.max(stacked ? text.bottom + 8 : bounds.top - 32, headerBottom) + hudHeight - top),
        maxY: Math.max(0, Math.min(48, hero.getBoundingClientRect().bottom - top - frame.height - 8))
      };
      selection.classList.add('is-dragging');
      handle.setPointerCapture(event.pointerId);
      if (window.SoundFX) window.SoundFX.click(1.2);
    });

    handle.addEventListener('pointermove', function (event) {
      if (!drag || event.pointerId !== drag.id) return;
      position(
        Math.max(drag.minX, Math.min(drag.maxX, event.clientX - drag.startX)),
        Math.max(drag.minY, Math.min(drag.maxY, event.clientY - drag.startY))
      );
    });

    handle.addEventListener('lostpointercapture', function () {
      drag = null;
      selection.classList.remove('is-dragging');
    });

    handle.addEventListener('dblclick', function (event) {
      if (!event.target.closest('button')) position(0, 0);
    });

    window.addEventListener('resize', function () { position(0, 0); });
    window.addEventListener('portfolio:settings-changed', syncSettings);
    if ('ResizeObserver' in window) new ResizeObserver(updateHud).observe(selection);
    syncSettings();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
