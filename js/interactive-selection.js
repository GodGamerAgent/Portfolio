/**
 * Interactive Selection HUD (Figma Bounding Box)
 * Inspired by onlines.com.ar home-hero__seleccion and Figma canvas selection.
 * Adds interactive resize handles, coordinate HUD, and draggable positioning.
 */
(function(window) {
  'use strict';

  var selectionEl = null;
  var hudEl = null;
  var isDragging = false;
  var startX = 0, startY = 0;
  var currentX = 0, currentY = 0;

  function init() {
    selectionEl = document.getElementById('hero-selection-box');
    if (!selectionEl) return;

    hudEl = selectionEl.querySelector('.selection-hud');

    setupInteraction();

    window.addEventListener('portfolio:settings-changed', function() {
      var cfg = window.PortfolioSettings ? window.PortfolioSettings.get() : { selectionBox: true };
      if (selectionEl) {
        selectionEl.style.display = cfg.selectionBox ? '' : 'none';
      }
    });
  }

  function setupInteraction() {
    if (!selectionEl) return;

    var handle = selectionEl.querySelector('.selection-drag-handle') || selectionEl;

    handle.addEventListener('mousedown', onPointerDown);
    handle.addEventListener('touchstart', onTouchStart, { passive: false });

    // Double-click to reset position
    selectionEl.addEventListener('dblclick', function(e) {
      e.stopPropagation();
      currentX = 0;
      currentY = 0;
      selectionEl.style.transform = 'translate3d(0, 0, 0)';
      updateHud();
      if (window.SoundFX) window.SoundFX.toggle(true);
    });

    updateHud();
  }

  function onPointerDown(e) {
    var cfg = window.PortfolioSettings ? window.PortfolioSettings.get() : { selectionDraggable: true };
    if (!cfg.selectionDraggable) return;

    // Don't drag if clicking buttons inside selection
    if (e.target.closest('button, a, input, select, textarea')) return;

    isDragging = true;
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;

    selectionEl.classList.add('is-dragging');
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);

    if (window.SoundFX) window.SoundFX.click(1.2);
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;

    // Clamp within reasonable boundaries
    currentX = Math.max(-200, Math.min(200, currentX));
    currentY = Math.max(-150, Math.min(150, currentY));

    selectionEl.style.transform = 'translate3d(' + currentX.toFixed(1) + 'px, ' + currentY.toFixed(1) + 'px, 0)';
    updateHud();
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    selectionEl.classList.remove('is-dragging');
    document.removeEventListener('mousemove', onPointerMove);
    document.removeEventListener('mouseup', onPointerUp);

    if (window.SoundFX) window.SoundFX.click(0.9);
  }

  function onTouchStart(e) {
    var cfg = window.PortfolioSettings ? window.PortfolioSettings.get() : { selectionDraggable: true };
    if (!cfg.selectionDraggable || e.touches.length !== 1) return;
    if (e.target.closest('button, a, input, select, textarea')) return;

    var touch = e.touches[0];
    isDragging = true;
    startX = touch.clientX - currentX;
    startY = touch.clientY - currentY;

    selectionEl.classList.add('is-dragging');
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  }

  function onTouchMove(e) {
    if (!isDragging || e.touches.length !== 1) return;
    var touch = e.touches[0];
    currentX = touch.clientX - startX;
    currentY = touch.clientY - startY;

    currentX = Math.max(-100, Math.min(100, currentX));
    currentY = Math.max(-100, Math.min(100, currentY));

    selectionEl.style.transform = 'translate3d(' + currentX.toFixed(1) + 'px, ' + currentY.toFixed(1) + 'px, 0)';
    updateHud();
    e.preventDefault();
  }

  function onTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    selectionEl.classList.remove('is-dragging');
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
  }

  function updateHud() {
    if (!hudEl || !selectionEl) return;
    var rect = selectionEl.getBoundingClientRect();
    var w = Math.round(rect.width);
    var h = Math.round(rect.height);
    var x = Math.round(rect.left);
    var y = Math.round(rect.top);

    // a narrow frame (a phone) drops the position and frame name so the label stays inside it
    hudEl.textContent = w < 420
      ? w + ' × ' + h
      : 'x: ' + x + '  y: ' + y + ' · ' + w + ' × ' + h + ' · FRAME: SRIKANTH_HERO';
  }

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('resize', updateHud);

  window.InteractiveSelection = {
    updateHud: updateHud
  };
})(window);
