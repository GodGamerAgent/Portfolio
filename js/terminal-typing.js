/**
 * Terminal & Code Typing Simulation
 * Inspired by onlines.com.ar live typing and developer workstation terminals.
 * Powers the Hero Code Frame typing loop and the Interactive Terminal Playground.
 */
(function(window) {
  'use strict';

  var SNIPPETS = {
    python: {
      full: [
        '# Quorum · local meeting notes',
        'def meeting_notes(tab_audio):',
        '    transcript = whisper.transcribe(tab_audio)',
        '    return gemma.extract(',
        '        transcript,',
        '        fields=["decisions", "action_items"],',
        '        include_owners=True,',
        '    )'
      ].join('\n'),
      compact: [
        '# Quorum · local notes',
        'text = whisper.transcribe(audio)',
        'notes = gemma.extract(text)',
        'show(notes)'
      ].join('\n')
    },
    kotlin: {
      full: [
        "// I Can't Wake Up! · alarm dismissal",
        'fun dismissAlarm(alarm: Alarm) {',
        '    val challenge = alarm.wakeUpChallenge',
        '',
        '    if (challenge.isComplete) {',
        '        alarm.dismiss()',
        '        scheduleAwakeCheck(alarm)',
        '    }',
        '}'
      ].join('\n'),
      compact: [
        '// Alarm dismissal',
        'if (challenge.isComplete) {',
        '    scheduleAwakeCheck(alarm)',
        '}'
      ].join('\n')
    }
  };

  function initHeroTyping() {
    var code = document.getElementById('hero-code-typing');
    if (!code) return;

    var cursor = code.nextElementSibling;
    var tabs = document.querySelectorAll('.code-lang-tab');
    var compact = window.matchMedia('(max-width: 639px)');
    var language = 'python';
    var timeout;
    var animationMode;

    function render() {
      clearTimeout(timeout);
      var settings = window.PortfolioSettings.get();
      var snippet = SNIPPETS[language][compact.matches ? 'compact' : 'full'];
      animationMode = settings.typingAnimation && !window.PortfolioSettings.isMotionReduced();
      cursor.hidden = !animationMode;
      if (!animationMode) {
        code.textContent = snippet;
        return;
      }

      var index = 0;
      function typeChar() {
        index++;
        code.textContent = snippet.slice(0, index);
        if (index % 6 === 0 && window.SoundFX) window.SoundFX.typeKey();
        if (index < snippet.length) {
          var delay = snippet.charAt(index - 1) === '\n' ? 90 : settings.typingSpeed;
          timeout = setTimeout(typeChar, delay);
        } else {
          cursor.hidden = true;
        }
      }

      typeChar();
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        language = tab.dataset.lang;
        tabs.forEach(function (item) {
          item.classList.toggle('is-active', item === tab);
          item.setAttribute('aria-pressed', String(item === tab));
        });
        render();
        if (window.SoundFX) window.SoundFX.click(1.1);
      });
    });

    compact.addEventListener('change', render);
    window.addEventListener('portfolio:settings-changed', function () {
      var animate = window.PortfolioSettings.get().typingAnimation && !window.PortfolioSettings.isMotionReduced();
      if (animate !== animationMode) render();
    });
    render();
  }

  /* ---------------- Interactive Terminal Playground ---------------- */
  function initTerminalPlayground() {
    var termInput = document.getElementById('term-input');
    var termBody = document.getElementById('term-body');
    if (!termInput || !termBody) return;

    var history = [];
    var historyIndex = -1;

    termInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var val = termInput.value.trim();
        if (val) {
          history.push(val);
          historyIndex = history.length;
          handleCommand(val, termBody);
          termInput.value = '';
          termBody.scrollTop = termBody.scrollHeight;
          if (window.SoundFX) window.SoundFX.click(1.0);
        }
      } else if (e.key === 'ArrowUp') {
        if (historyIndex > 0) {
          historyIndex--;
          termInput.value = history[historyIndex];
        }
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        if (historyIndex < history.length - 1) {
          historyIndex++;
          termInput.value = history[historyIndex];
        } else {
          historyIndex = history.length;
          termInput.value = '';
        }
        e.preventDefault();
      }
    });
  }

  function handleCommand(cmd, container) {
    var clean = cmd.toLowerCase().trim();

    // Echo user line
    var userLine = document.createElement('div');
    userLine.className = 'term-line term-user-line';
    userLine.innerHTML = '<span class="term-prompt">srikanth@nst:~$</span> ' + escapeHtml(cmd);
    container.appendChild(userLine);

    var resp = document.createElement('div');
    resp.className = 'term-line term-response';

    switch (clean) {
      case 'help':
        resp.innerHTML = [
          'Available commands:',
          '  <span class="term-cyan">projects</span>    — The six repositories',
          '  <span class="term-cyan">stack</span>       — Languages and tools',
          '  <span class="term-cyan">nst</span>         — Why Newton School of Technology',
          '  <span class="term-cyan">bio</span>         — Who I am',
          '  <span class="term-cyan">ai</span>          — Toggle interactive AI Mode switch',
          '  <span class="term-cyan">sound</span>       — Toggle tactile Web Audio synth',
          '  <span class="term-cyan">contact</span>     — Where to find me',
          '  <span class="term-cyan">clear</span>       — Wipe the terminal screen'
        ].join('<br>');
        break;

      case 'ls projects':
      case 'projects':
        resp.innerHTML = [
          '1. <strong class="term-green">Quorum</strong>: private meeting notes, Whisper and Gemma 4 on-device (TypeScript, Python)',
          '2. <strong class="term-green">DocDrift AI</strong>: finds stale READMEs and opens a fix as a pull request (TypeScript)',
          '3. <strong class="term-green">I Can\'t Wake Up!</strong>: an Android alarm with eight wake-up challenges (Kotlin)',
          '4. <strong class="term-green">Voice Assist AI</strong>: dictation and tone-aware replies in any Android app (Kotlin)',
          '5. <strong class="term-green">Wardrobe Brainy</strong>: an MCP server for your wardrobe (Python, SQLite)',
          '6. <strong class="term-green">MusicDownloaderCLI</strong>: hi-res audio from a pasted link (Python)'
        ].join('<br>');
        break;

      case 'stack':
        resp.innerHTML = [
          '<span class="term-cyan">Languages:</span> Kotlin, TypeScript and Python',
          '<span class="term-cyan">Android:</span> Jetpack Compose, Room and Android KeyStore',
          '<span class="term-cyan">AI:</span> Gemma 4 in LM Studio, Whisper large-v3-turbo and FastMCP',
          '<span class="term-cyan">Web:</span> Next.js, FastAPI, Starlette, SQLite and SeleniumBase'
        ].join('<br>');
        break;

      case 'nst':
        resp.innerHTML = 'Newton School of Technology: where I study Computer Science and AI, and where I came to learn by building instead of by rote.';
        break;

      case 'whoami':
      case 'bio':
        resp.innerHTML = 'Srikanth Nagendran. I study Computer Science and AI at Newton School of Technology in India. I learn by building things, getting stuck and working out the fix. Life has had ups and downs; I keep the balance net positive and live without regrets.';
        break;

      case 'ai':
        var cfg = window.PortfolioSettings ? window.PortfolioSettings.get() : { aiMode: false };
        var newMode = !cfg.aiMode;
        if (window.PortfolioSettings) {
          window.PortfolioSettings.set({ aiMode: newMode });
        }
        resp.innerHTML = 'AI Mode is now: <span class="' + (newMode ? 'term-green">ENABLED</span>' : 'term-dim">DISABLED</span>');
        if (window.SoundFX) window.SoundFX.toggle(newMode);
        break;

      case 'sound':
        var scfg = window.PortfolioSettings ? window.PortfolioSettings.get() : { soundEnabled: true };
        var newSound = !scfg.soundEnabled;
        if (window.PortfolioSettings) {
          window.PortfolioSettings.set({ soundEnabled: newSound });
        }
        resp.innerHTML = 'Tactile Audio Synthesizer: <span class="' + (newSound ? 'term-green">ACTIVE</span>' : 'term-dim">MUTED</span>');
        break;

      case 'contact':
        resp.innerHTML = [
          'Email <a href="mailto:SrikanthofficialEH@gmail.com" class="term-link">SrikanthofficialEH@gmail.com</a>',
          'GitHub <a href="https://github.com/GodGamerAgent" class="term-link">github.com/GodGamerAgent</a>'
        ].join('<br>');
        break;

      case 'clear':
        container.innerHTML = '';
        return;

      default:
        resp.innerHTML = 'Command not recognized: "' + escapeHtml(cmd) + '". Type <span class="term-cyan">help</span> for a list of commands.';
        break;
    }

    container.appendChild(resp);
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  document.addEventListener('DOMContentLoaded', function() {
    initHeroTyping();
    initTerminalPlayground();
  });

})(window);
