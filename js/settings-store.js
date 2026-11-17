/**
 * Settings Store — Granular Configuration & Modular Engine
 * Synchronizes user customizations across the portfolio and settings page.
 * Persists to localStorage and dynamically updates CSS custom properties.
 */
(function(window) {
  'use strict';

  var STORAGE_KEY = 'srikanth_portfolio_config_v1';

  var PRESETS = {
    'canvas-studio': {
      id: 'canvas-studio',
      name: 'Interactive Studio & Canvas',
      tagline: 'Light canvas with Figma-style multi-cursor & electric blue',
      tokens: {
        bg: '#ffffff',
        surface: '#f6f7f9',
        surfaceHover: '#edeef2',
        ink: '#111318',
        muted: '#5e6573',
        accent: '#1a4be0',
        accentMuted: '#e8eeff',
        accentInk: '#ffffff',
        border: '#e4e7ec',
        codeBg: '#13151b',
        codeInk: '#f0f2f5'
      },
      fontPairing: 'funnel',
      radius: 'soft',
      gridStyle: 'dot-matrix',
      cursors: true,
      cursorCount: 3,
      cursorSpeed: 1.0,
      selectionBox: true,
      soundEnabled: true,
      soundVolume: 0.25,
      motion: 'full'
    },
    'ai-kernel': {
      id: 'ai-kernel',
      name: 'AI Lab & Kernel Console',
      tagline: 'Dark graphite with safety orange telemetry & terminal HUD',
      tokens: {
        bg: '#121417',
        surface: '#1a1d22',
        surfaceHover: '#23272e',
        ink: '#f0f2f5',
        muted: '#8b949e',
        accent: '#ff4a1f',
        accentMuted: '#3d1c14',
        accentInk: '#ffffff',
        border: '#2a2f38',
        codeBg: '#0b0d0f',
        codeInk: '#00f5a0'
      },
      fontPairing: 'urbanist',
      radius: 'sharp',
      gridStyle: 'blueprint',
      cursors: true,
      cursorCount: 4,
      cursorSpeed: 1.2,
      selectionBox: true,
      soundEnabled: true,
      soundVolume: 0.35,
      motion: 'full'
    },
    'cybernetic-matrix': {
      id: 'cybernetic-matrix',
      name: 'Cybernetic Editorial',
      tagline: 'Deep obsidian with acid lime luminescence & kinetic flow',
      tokens: {
        bg: '#0a0d0a',
        surface: '#121713',
        surfaceHover: '#1a221b',
        ink: '#f5faf5',
        muted: '#829283',
        accent: '#c6f19d',
        accentMuted: '#1f2e1b',
        accentInk: '#0a0d0a',
        border: '#1f2b20',
        codeBg: '#050805',
        codeInk: '#c6f19d'
      },
      fontPairing: 'bricolage',
      radius: 'soft',
      gridStyle: 'halftone',
      cursors: true,
      cursorCount: 3,
      cursorSpeed: 0.9,
      selectionBox: true,
      soundEnabled: true,
      soundVolume: 0.2,
      motion: 'full'
    }
  };

  var DEFAULT_CONFIG = {
    preset: 'canvas-studio',
    tokens: Object.assign({}, PRESETS['canvas-studio'].tokens),
    fontPairing: 'funnel',
    radius: 'soft', // sharp, soft, round
    motion: 'full', // full, gentle, reduced
    layoutDensity: 'comfortable', // comfortable, compact
    
    // Canvas & Dynamics
    gridStyle: 'dot-matrix', // dot-matrix, blueprint, halftone, none
    gridDensity: 24, // 16 to 48
    canvasSpotlight: true,
    aiMode: false,
    
    // Multiplayer & Figma Elements
    cursors: true,
    cursorCount: 3,
    cursorSpeed: 1.0,
    cursorNames: ['Srikanth', 'NST Mentor', 'AI Reviewer', 'Kernel Bot'],
    selectionBox: true,
    selectionDraggable: true,
    typingAnimation: true,
    typingSpeed: 32,
    floatingBadges: true,

    // Audio Synth
    soundEnabled: true,
    soundVolume: 0.25,
    typingClicks: true,

    // Modular Section Toggles
    sections: {
      hero: true,
      statement: true,
      projects: true,
      stack: true,
      nst_lab: true,
      terminal: true,
      metrics: true,
      contact: true
    }
  };

  var state = Object.assign({}, DEFAULT_CONFIG);

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        state = deepMerge(Object.assign({}, DEFAULT_CONFIG), parsed);
      }
    } catch (e) {
      console.warn('Failed to parse portfolio settings, using defaults.', e);
      state = Object.assign({}, DEFAULT_CONFIG);
    }
    applyToDOM();
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save portfolio settings.', e);
    }
    applyToDOM();
    broadcast();
  }

  function deepMerge(target, source) {
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          target[key] = deepMerge(target[key] || {}, source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
    return target;
  }

  function applyPreset(presetId) {
    if (!PRESETS[presetId]) return;
    var p = PRESETS[presetId];
    state.preset = presetId;
    state.tokens = Object.assign({}, p.tokens);
    state.fontPairing = p.fontPairing;
    state.radius = p.radius;
    state.gridStyle = p.gridStyle;
    state.cursors = p.cursors;
    state.cursorCount = p.cursorCount;
    state.cursorSpeed = p.cursorSpeed;
    state.selectionBox = p.selectionBox;
    state.soundEnabled = p.soundEnabled;
    state.soundVolume = p.soundVolume;
    state.motion = p.motion;
    save();
  }

  function applyToDOM() {
    var root = document.documentElement;
    var t = state.tokens;

    // Apply color tokens
    root.style.setProperty('--p-bg', t.bg);
    root.style.setProperty('--p-surface', t.surface);
    root.style.setProperty('--p-surface-hover', t.surfaceHover || t.surface);
    root.style.setProperty('--p-ink', t.ink);
    root.style.setProperty('--p-muted', t.muted);
    root.style.setProperty('--p-accent', t.accent);
    root.style.setProperty('--p-accent-muted', t.accentMuted || t.accent);
    root.style.setProperty('--p-accent-ink', t.accentInk || '#ffffff');
    root.style.setProperty('--p-action', t.accent);
    root.style.setProperty('--p-action-ink', t.accentInk || '#ffffff');
    root.style.setProperty('--p-border', t.border);
    root.style.setProperty('--p-code-bg', t.codeBg || '#13151b');
    root.style.setProperty('--p-code-ink', t.codeInk || '#f0f2f5');

    // Radius scale
    var radiusVal = '6px';
    var radiusLg = '12px';
    var radiusSm = '4px';
    if (state.radius === 'sharp') {
      radiusVal = '0px';
      radiusLg = '0px';
      radiusSm = '0px';
    } else if (state.radius === 'round') {
      radiusVal = '16px';
      radiusLg = '24px';
      radiusSm = '8px';
    }
    root.style.setProperty('--r-base', radiusVal);
    root.style.setProperty('--r-lg', radiusLg);
    root.style.setProperty('--r-sm', radiusSm);

    // Font pairings
    if (state.fontPairing === 'funnel') {
      root.style.setProperty('--font-display', '"Funnel Display", system-ui, sans-serif');
      root.style.setProperty('--font-text', '"Funnel Sans", system-ui, sans-serif');
      root.style.setProperty('--display-weight', '500');
    } else if (state.fontPairing === 'urbanist') {
      root.style.setProperty('--font-display', '"Urbanist", system-ui, sans-serif');
      root.style.setProperty('--font-text', '"Urbanist", system-ui, sans-serif');
      root.style.setProperty('--display-weight', '600');
    } else if (state.fontPairing === 'bricolage') {
      root.style.setProperty('--font-display', '"Bricolage Grotesque", system-ui, sans-serif');
      root.style.setProperty('--font-text', '"Figtree", system-ui, sans-serif');
      root.style.setProperty('--display-weight', '600');
    } else if (state.fontPairing === 'mono') {
      root.style.setProperty('--font-display', '"DM Mono", monospace');
      root.style.setProperty('--font-text', '"DM Mono", monospace');
      root.style.setProperty('--display-weight', '500');
    }
    root.style.setProperty('--font-mono', '"DM Mono", ui-monospace, Menlo, monospace');

    // Attributes for CSS targeting
    root.setAttribute('data-theme-preset', state.preset);
    root.setAttribute('data-radius', state.radius);
    root.setAttribute('data-grid', state.gridStyle);
    root.setAttribute('data-motion', state.motion);
    root.setAttribute('data-ai-mode', state.aiMode ? 'true' : 'false');

    // Section visibility
    if (state.sections) {
      for (var s in state.sections) {
        var el = document.getElementById('sec-' + s);
        if (el) {
          el.style.display = state.sections[s] ? '' : 'none';
        }
      }
    }
  }

  function broadcast() {
    var ev = new CustomEvent('portfolio:settings-changed', { detail: state });
    window.dispatchEvent(ev);
  }

  function resetToDefault() {
    state = deepMerge(Object.assign({}, DEFAULT_CONFIG), {});
    save();
  }

  function exportJSON() {
    return JSON.stringify(state, null, 2);
  }

  function importJSON(jsonStr) {
    try {
      var parsed = JSON.parse(jsonStr);
      state = deepMerge(Object.assign({}, DEFAULT_CONFIG), parsed);
      save();
      return true;
    } catch (e) {
      console.error('Invalid JSON configuration.', e);
      return false;
    }
  }

  // Auto-init on load
  load();

  // Expose API
  window.PortfolioSettings = {
    get: function() { return state; },
    set: function(updates) {
      state = deepMerge(state, updates);
      if (updates.tokens) {
        state.preset = 'custom';
      }
      save();
    },
    getPresets: function() { return PRESETS; },
    applyPreset: applyPreset,
    reset: resetToDefault,
    exportJSON: exportJSON,
    importJSON: importJSON,
    reload: load
  };

  // Sync across tabs
  window.addEventListener('storage', function(e) {
    if (e.key === STORAGE_KEY) {
      load();
      broadcast();
    }
  });

})(window);
