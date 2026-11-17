/* Portfolio interactions that work when index.html is opened directly. */
(function () {
  'use strict';

  function setupWordHighlight() {
    var statement = document.querySelector('.statement-text');
    if (!statement) return;

    var textNodes = document.createTreeWalker(statement, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (textNodes.nextNode()) nodes.push(textNodes.currentNode);

    var words = [];
    nodes.forEach(function (node) {
      var fragment = document.createDocumentFragment();
      node.data.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.append(part);
        } else {
          var word = document.createElement('span');
          word.className = 'hl-word';
          word.textContent = part;
          fragment.append(word);
          words.push(word);
        }
      });
      node.replaceWith(fragment);
    });

    var previous = -1;
    var frame;
    function paint() {
      frame = null;
      var rect = statement.getBoundingClientRect();
      var progress = (window.innerHeight * 0.88 - rect.top) / (rect.height + window.innerHeight * 0.24);
      var reduced = window.PortfolioSettings.isMotionReduced();
      var count = reduced ? words.length : Math.round(Math.max(0, Math.min(1, progress)) * words.length);
      if (count === previous) return;
      words.forEach(function (word, index) { word.classList.toggle('is-lit', index < count); });
      previous = count;
    }

    function schedulePaint() {
      if (frame == null) frame = requestAnimationFrame(paint);
    }

    window.addEventListener('scroll', schedulePaint, { passive: true });
    window.addEventListener('resize', schedulePaint);
    window.addEventListener('portfolio:settings-changed', schedulePaint);
    paint();
  }

  function setupQuickSoundToggle() {
    var button = document.getElementById('nav-sound-toggle');
    if (!button) return;

    function paint() {
      var enabled = window.PortfolioSettings.get().soundEnabled;
      button.setAttribute('aria-pressed', String(enabled));
      button.title = enabled ? 'Mute sound effects' : 'Enable sound effects';
      button.querySelector('.sound-icon').textContent = enabled ? '🔊' : '🔇';
    }

    button.addEventListener('click', function () {
      window.PortfolioSettings.set({ soundEnabled: !window.PortfolioSettings.get().soundEnabled });
    });
    window.addEventListener('portfolio:settings-changed', paint);
    paint();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupWordHighlight();
    setupQuickSoundToggle();
  });
})();
