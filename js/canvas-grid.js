/**
 * Canvas Grid & Halftone Dynamics
 * Inspired by onlines.com.ar grilla-celdas, patron-puntos, and shader-halftone.
 * Renders an interactive dot matrix or blueprint grid that reacts to cursor proximity.
 */
(function(window) {
  'use strict';

  var canvas, ctx;
  var width = 0, height = 0;
  var mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false };
  var animFrameId = null;
  var isVisible = true;
  var time = 0;

  function init() {
    canvas = document.getElementById('canvas-grid');
    if (!canvas) return;

    ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    resize();
    window.addEventListener('resize', debounce(resize, 150));

    // Track mouse on canvas container or hero
    var hero = document.getElementById('sec-hero') || document.body;
    hero.addEventListener('mousemove', function(e) {
      var rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    });

    hero.addEventListener('mouseleave', function() {
      mouse.active = false;
    });

    // Visibility observer to save CPU
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        isVisible = entries[0].isIntersecting;
        if (isVisible && !animFrameId) {
          loop();
        }
      }, { threshold: 0.05 });
      observer.observe(canvas);
    }

    window.addEventListener('portfolio:settings-changed', function() {
      // Redraw immediately when settings change
      draw();
    });

    loop();
  }

  function resize() {
    if (!canvas) return;
    var rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    draw();
  }

  function loop() {
    if (!isVisible) {
      animFrameId = null;
      return;
    }

    var cfg = window.PortfolioSettings ? window.PortfolioSettings.get() : { motion: 'full' };
    if (cfg.motion === 'reduced') {
      draw();
      animFrameId = null;
      return;
    }

    // Smooth cursor interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.12;
    mouse.y += (mouse.targetY - mouse.y) * 0.12;
    time += 0.02;

    draw();
    animFrameId = requestAnimationFrame(loop);
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    var cfg = window.PortfolioSettings ? window.PortfolioSettings.get() : {
      gridStyle: 'dot-matrix',
      gridDensity: 24,
      canvasSpotlight: true,
      tokens: { accent: '#1a4be0', border: '#e4e7ec', ink: '#111111' }
    };

    if (cfg.gridStyle === 'none') return;

    var step = cfg.gridDensity || 24;
    var accentHex = cfg.tokens.accent || '#1a4be0';
    var borderHex = cfg.tokens.border || '#e4e7ec';
    var inkHex = cfg.tokens.ink || '#111111';

    var cols = Math.ceil(width / step) + 1;
    var rows = Math.ceil(height / step) + 1;

    // 1. Soft radial spotlight if enabled
    if (cfg.canvasSpotlight && mouse.active) {
      var spotGrad = ctx.createRadialGradient(mouse.x, mouse.y, 10, mouse.x, mouse.y, 280);
      spotGrad.addColorStop(0, hexToRgba(accentHex, 0.08));
      spotGrad.addColorStop(0.5, hexToRgba(accentHex, 0.03));
      spotGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = spotGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Render grid based on style
    if (cfg.gridStyle === 'dot-matrix') {
      drawDotMatrix(cols, rows, step, accentHex, borderHex);
    } else if (cfg.gridStyle === 'blueprint') {
      drawBlueprint(cols, rows, step, accentHex, borderHex);
    } else if (cfg.gridStyle === 'halftone') {
      drawHalftone(cols, rows, step, accentHex, inkHex);
    }
  }

  function drawDotMatrix(cols, rows, step, accentHex, borderHex) {
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        var x = i * step;
        var y = j * step;

        var dist = Math.hypot(x - mouse.x, y - mouse.y);
        var radius = 1.2;
        var alpha = 0.25;
        var fill = borderHex;

        if (mouse.active && dist < 180) {
          var factor = 1 - (dist / 180);
          radius = 1.2 + factor * 2.6;
          alpha = 0.3 + factor * 0.7;
          fill = accentHex;
        }

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(fill, alpha);
        ctx.fill();
      }
    }
  }

  function drawBlueprint(cols, rows, step, accentHex, borderHex) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = hexToRgba(borderHex, 0.4);

    // Vertical lines
    for (var i = 0; i < cols; i++) {
      var x = i * step;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (var j = 0; j < rows; j++) {
      var y = j * step;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Crosshairs on intersections near mouse
    if (mouse.active) {
      for (var ci = 0; ci < cols; ci++) {
        for (var cj = 0; cj < rows; cj++) {
          var cx = ci * step;
          var cy = cj * step;
          var d = Math.hypot(cx - mouse.x, cy - mouse.y);
          if (d < 140) {
            var f = 1 - (d / 140);
            ctx.strokeStyle = hexToRgba(accentHex, f * 0.9);
            ctx.beginPath();
            ctx.moveTo(cx - 4, cy);
            ctx.lineTo(cx + 4, cy);
            ctx.moveTo(cx, cy - 4);
            ctx.lineTo(cx, cy + 4);
            ctx.stroke();
          }
        }
      }
    }
  }

  function drawHalftone(cols, rows, step, accentHex, inkHex) {
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        var x = i * step;
        var y = j * step;

        // Wave propagation
        var wave = Math.sin((x * 0.02) + (y * 0.02) + time) * 0.5 + 0.5;
        var dist = Math.hypot(x - mouse.x, y - mouse.y);

        var radius = 1.0 + wave * 1.5;
        var fill = inkHex;
        var alpha = 0.15 + wave * 0.15;

        if (mouse.active && dist < 160) {
          var factor = 1 - (dist / 160);
          radius += factor * 3.5;
          alpha += factor * 0.6;
          fill = accentHex;
        }

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(fill, alpha);
        ctx.fill();
      }
    }
  }

  function hexToRgba(hex, alpha) {
    if (!hex) return 'rgba(0,0,0,' + alpha + ')';
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    var num = parseInt(hex, 16);
    var r = (num >> 16) & 255;
    var g = (num >> 8) & 255;
    var b = num & 255;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function debounce(fn, ms) {
    var timer;
    return function() {
      clearTimeout(timer);
      timer = setTimeout(fn, ms);
    };
  }

  document.addEventListener('DOMContentLoaded', init);

  window.CanvasGrid = {
    redraw: draw,
    resize: resize
  };
})(window);
