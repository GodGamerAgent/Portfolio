/**
 * Settings App Controller
 * Powers the Granular Customization Studio (settings.html).
 * Manages two-way data binding, preset switches, custom token pickers,
 * section layout toggles, and live interactive preview.
 */
(function(window) {
  'use strict';

  function init() {
    if (!window.PortfolioSettings) return;

    bindPresetButtons();
    bindTokenPickers();
    bindTypographySelect();
    bindRadiusRadios();
    bindMotionRadios();
    bindCanvasControls();
    bindMultiplayerControls();
    bindAudioControls();
    bindSectionToggles();
    bindImportExport();
    syncUIWithState();

    window.addEventListener('portfolio:settings-changed', function() {
      syncUIWithState();
    });
  }

  function getState() {
    return window.PortfolioSettings.get();
  }

  /* ---------------- 1. Presets ---------------- */
  function bindPresetButtons() {
    var cards = document.querySelectorAll('.preset-card');
    cards.forEach(function(card) {
      card.addEventListener('click', function() {
        var presetId = card.getAttribute('data-preset');
        if (presetId) {
          window.PortfolioSettings.applyPreset(presetId);
          if (window.SoundFX) window.SoundFX.modeShift();
          showToast('Applied ' + card.querySelector('.preset-title').textContent);
        }
      });
    });
  }

  /* ---------------- 2. Color Token Pickers ---------------- */
  function bindTokenPickers() {
    var pickers = document.querySelectorAll('.token-picker');
    pickers.forEach(function(wrap) {
      var colorInput = wrap.querySelector('input[type="color"]');
      var textInput = wrap.querySelector('input[type="text"]');
      var key = wrap.getAttribute('data-token');

      if (!colorInput || !textInput || !key) return;

      function update(val) {
        if (!val.startsWith('#')) val = '#' + val;
        colorInput.value = val;
        textInput.value = val;

        var tokensUpdate = {};
        tokensUpdate[key] = val;
        window.PortfolioSettings.set({ tokens: tokensUpdate });
      }

      colorInput.addEventListener('input', function() {
        update(colorInput.value);
      });

      textInput.addEventListener('change', function() {
        update(textInput.value);
      });
    });
  }

  /* ---------------- 3. Typography ---------------- */
  function bindTypographySelect() {
    var select = document.getElementById('setting-font-pairing');
    if (!select) return;

    select.addEventListener('change', function() {
      window.PortfolioSettings.set({ fontPairing: select.value });
      if (window.SoundFX) window.SoundFX.click();
    });
  }

  /* ---------------- 4. Radius & Motion ---------------- */
  function bindRadiusRadios() {
    var radios = document.querySelectorAll('input[name="setting-radius"]');
    radios.forEach(function(r) {
      r.addEventListener('change', function() {
        if (r.checked) {
          window.PortfolioSettings.set({ radius: r.value });
          if (window.SoundFX) window.SoundFX.click();
        }
      });
    });
  }

  function bindMotionRadios() {
    var radios = document.querySelectorAll('input[name="setting-motion"]');
    radios.forEach(function(r) {
      r.addEventListener('change', function() {
        if (r.checked) {
          window.PortfolioSettings.set({ motion: r.value });
          if (window.SoundFX) window.SoundFX.click();
        }
      });
    });
  }

  /* ---------------- 5. Canvas Grid ---------------- */
  function bindCanvasControls() {
    var gridStyle = document.getElementById('setting-grid-style');
    var gridDensity = document.getElementById('setting-grid-density');
    var spotlight = document.getElementById('setting-canvas-spotlight');

    if (gridStyle) {
      gridStyle.addEventListener('change', function() {
        window.PortfolioSettings.set({ gridStyle: gridStyle.value });
        if (window.SoundFX) window.SoundFX.click();
      });
    }

    if (gridDensity) {
      gridDensity.addEventListener('input', function() {
        window.PortfolioSettings.set({ gridDensity: parseInt(gridDensity.value, 10) });
      });
    }

    if (spotlight) {
      spotlight.addEventListener('change', function() {
        window.PortfolioSettings.set({ canvasSpotlight: spotlight.checked });
        if (window.SoundFX) window.SoundFX.toggle(spotlight.checked);
      });
    }
  }

  /* ---------------- 6. Multiplayer & Figma Elements ---------------- */
  function bindMultiplayerControls() {
    var cursors = document.getElementById('setting-cursors');
    var cursorCount = document.getElementById('setting-cursor-count');
    var cursorSpeed = document.getElementById('setting-cursor-speed');
    var selectionBox = document.getElementById('setting-selection-box');
    var selectionDrag = document.getElementById('setting-selection-drag');
    var typingAnim = document.getElementById('setting-typing-anim');
    var floatBadges = document.getElementById('setting-float-badges');

    if (cursors) {
      cursors.addEventListener('change', function() {
        window.PortfolioSettings.set({ cursors: cursors.checked });
        if (window.SoundFX) window.SoundFX.toggle(cursors.checked);
      });
    }

    if (cursorCount) {
      cursorCount.addEventListener('input', function() {
        window.PortfolioSettings.set({ cursorCount: parseInt(cursorCount.value, 10) });
      });
    }

    if (cursorSpeed) {
      cursorSpeed.addEventListener('input', function() {
        window.PortfolioSettings.set({ cursorSpeed: parseFloat(cursorSpeed.value) });
      });
    }

    if (selectionBox) {
      selectionBox.addEventListener('change', function() {
        window.PortfolioSettings.set({ selectionBox: selectionBox.checked });
        if (window.SoundFX) window.SoundFX.toggle(selectionBox.checked);
      });
    }

    if (selectionDrag) {
      selectionDrag.addEventListener('change', function() {
        window.PortfolioSettings.set({ selectionDraggable: selectionDrag.checked });
        if (window.SoundFX) window.SoundFX.toggle(selectionDrag.checked);
      });
    }

    if (typingAnim) {
      typingAnim.addEventListener('change', function() {
        window.PortfolioSettings.set({ typingAnimation: typingAnim.checked });
        if (window.SoundFX) window.SoundFX.toggle(typingAnim.checked);
      });
    }

    if (floatBadges) {
      floatBadges.addEventListener('change', function() {
        window.PortfolioSettings.set({ floatingBadges: floatBadges.checked });
        if (window.SoundFX) window.SoundFX.toggle(floatBadges.checked);
      });
    }
  }

  /* ---------------- 7. Audio Synth ---------------- */
  function bindAudioControls() {
    var soundEnabled = document.getElementById('setting-sound-enabled');
    var soundVol = document.getElementById('setting-sound-vol');
    var typingClicks = document.getElementById('setting-typing-clicks');

    if (soundEnabled) {
      soundEnabled.addEventListener('change', function() {
        window.PortfolioSettings.set({ soundEnabled: soundEnabled.checked });
        if (window.SoundFX) window.SoundFX.toggle(soundEnabled.checked);
      });
    }

    if (soundVol) {
      soundVol.addEventListener('input', function() {
        window.PortfolioSettings.set({ soundVolume: parseFloat(soundVol.value) });
        if (window.SoundFX) window.SoundFX.click();
      });
    }

    if (typingClicks) {
      typingClicks.addEventListener('change', function() {
        window.PortfolioSettings.set({ typingClicks: typingClicks.checked });
        if (window.SoundFX) window.SoundFX.toggle(typingClicks.checked);
      });
    }
  }

  /* ---------------- 8. Modular Section Layout Manager ---------------- */
  function bindSectionToggles() {
    var sectionBoxes = document.querySelectorAll('.section-toggle-box');
    sectionBoxes.forEach(function(box) {
      var secKey = box.getAttribute('data-sec');
      var check = box.querySelector('input[type="checkbox"]');
      if (secKey && check) {
        check.addEventListener('change', function() {
          var state = getState();
          var sections = Object.assign({}, state.sections);
          sections[secKey] = check.checked;
          window.PortfolioSettings.set({ sections: sections });
          if (window.SoundFX) window.SoundFX.toggle(check.checked);
        });
      }
    });
  }

  /* ---------------- 9. Import / Export & Reset ---------------- */
  function bindImportExport() {
    var exportBtn = document.getElementById('btn-export-json');
    var importBtn = document.getElementById('btn-import-json');
    var resetBtn = document.getElementById('btn-reset-defaults');
    var jsonText = document.getElementById('setting-json-area');

    if (exportBtn && jsonText) {
      exportBtn.addEventListener('click', function() {
        jsonText.value = window.PortfolioSettings.exportJSON();
        showToast('Configuration exported to text box below!');
        if (window.SoundFX) window.SoundFX.click(1.2);
      });
    }

    if (importBtn && jsonText) {
      importBtn.addEventListener('click', function() {
        var str = jsonText.value.trim();
        if (!str) {
          showToast('Paste valid JSON configuration first.');
          return;
        }
        var ok = window.PortfolioSettings.importJSON(str);
        if (ok) {
          showToast('Configuration imported successfully! ✓');
          if (window.SoundFX) window.SoundFX.modeShift();
        } else {
          showToast('Invalid JSON format.');
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        if (confirm('Reset all portfolio customizations to default?')) {
          window.PortfolioSettings.reset();
          showToast('Reset to default Direction 1.');
          if (window.SoundFX) window.SoundFX.toggle(false);
        }
      });
    }
  }

  /* ---------------- Sync UI with State ---------------- */
  function syncUIWithState() {
    var state = getState();

    // Preset cards active state
    var cards = document.querySelectorAll('.preset-card');
    cards.forEach(function(c) {
      var pid = c.getAttribute('data-preset');
      if (pid === state.preset) {
        c.classList.add('is-active');
      } else {
        c.classList.remove('is-active');
      }
    });

    // Token inputs
    for (var tk in state.tokens) {
      var wrap = document.querySelector('.token-picker[data-token="' + tk + '"]');
      if (wrap) {
        var colorInput = wrap.querySelector('input[type="color"]');
        var textInput = wrap.querySelector('input[type="text"]');
        if (colorInput) colorInput.value = state.tokens[tk];
        if (textInput) textInput.value = state.tokens[tk];
      }
    }

    // Typography
    var fontSelect = document.getElementById('setting-font-pairing');
    if (fontSelect) fontSelect.value = state.fontPairing;

    // Radius
    var radRadio = document.querySelector('input[name="setting-radius"][value="' + state.radius + '"]');
    if (radRadio) radRadio.checked = true;

    // Motion
    var motRadio = document.querySelector('input[name="setting-motion"][value="' + state.motion + '"]');
    if (motRadio) motRadio.checked = true;

    // Grid
    var gridStyle = document.getElementById('setting-grid-style');
    if (gridStyle) gridStyle.value = state.gridStyle;

    var gridDensity = document.getElementById('setting-grid-density');
    if (gridDensity) {
      gridDensity.value = state.gridDensity || 24;
      var dVal = document.getElementById('density-value');
      if (dVal) dVal.textContent = state.gridDensity + 'px';
    }

    var spotlight = document.getElementById('setting-canvas-spotlight');
    if (spotlight) spotlight.checked = !!state.canvasSpotlight;

    // Cursors
    var cursors = document.getElementById('setting-cursors');
    if (cursors) cursors.checked = !!state.cursors;

    var cursorCount = document.getElementById('setting-cursor-count');
    if (cursorCount) {
      cursorCount.value = state.cursorCount || 3;
      var cVal = document.getElementById('cursor-count-value');
      if (cVal) cVal.textContent = state.cursorCount;
    }

    var cursorSpeed = document.getElementById('setting-cursor-speed');
    if (cursorSpeed) {
      cursorSpeed.value = state.cursorSpeed || 1.0;
      var sVal = document.getElementById('cursor-speed-value');
      if (sVal) sVal.textContent = state.cursorSpeed + 'x';
    }

    var selectionBox = document.getElementById('setting-selection-box');
    if (selectionBox) selectionBox.checked = !!state.selectionBox;

    var selectionDrag = document.getElementById('setting-selection-drag');
    if (selectionDrag) selectionDrag.checked = !!state.selectionDraggable;

    var typingAnim = document.getElementById('setting-typing-anim');
    if (typingAnim) typingAnim.checked = !!state.typingAnimation;

    var floatBadges = document.getElementById('setting-float-badges');
    if (floatBadges) floatBadges.checked = !!state.floatingBadges;

    // Audio
    var soundEnabled = document.getElementById('setting-sound-enabled');
    if (soundEnabled) soundEnabled.checked = !!state.soundEnabled;

    var soundVol = document.getElementById('setting-sound-vol');
    if (soundVol) {
      soundVol.value = state.soundVolume !== undefined ? state.soundVolume : 0.25;
      var vVal = document.getElementById('volume-value');
      if (vVal) vVal.textContent = Math.round((state.soundVolume || 0) * 100) + '%';
    }

    var typingClicks = document.getElementById('setting-typing-clicks');
    if (typingClicks) typingClicks.checked = !!state.typingClicks;

    // Sections
    if (state.sections) {
      for (var sec in state.sections) {
        var box = document.querySelector('.section-toggle-box[data-sec="' + sec + '"] input[type="checkbox"]');
        if (box) box.checked = !!state.sections[sec];
      }
    }

    // Update preview card badge
    var previewTag = document.getElementById('preview-tag');
    if (previewTag) {
      previewTag.textContent = 'Preset: ' + state.preset.toUpperCase();
    }
  }

  function showToast(msg) {
    var toast = document.getElementById('settings-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'settings-toast';
      toast.className = 'settings-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('is-shown');
    setTimeout(function() {
      toast.classList.remove('is-shown');
    }, 2400);
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);
