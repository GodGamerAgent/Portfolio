/**
 * Terminal & Code Typing Simulation
 * Inspired by onlines.com.ar live typing and developer workstation terminals.
 * Powers the Hero Code Frame typing loop and the Interactive Terminal Playground.
 */
(function(window) {
  'use strict';

  var SNIPPETS = {
    python: [
      '# Quorum: meeting notes that stay on this machine',
      'from intelligence_engine import generate_post_meeting_synthesis',
      '',
      'LM_STUDIO = "http://localhost:1234/v1"',
      'MODEL = "google/gemma-4-26b-a4b-qat"',
      '',
      'def summarise(transcript: str) -> dict:',
      '    notes = generate_post_meeting_synthesis(',
      '        transcript, base_url=LM_STUDIO, model=MODEL',
      '    )',
      '    return {',
      '        "decisions": notes["decisions"],',
      '        "action_items": notes["action_items"],',
      '    }'
    ].join('\n'),

    kotlin: [
      '// I Can\'t Wake Up!: an alarm you have to think to stop',
      'fun scheduleAlarm(context: Context, alarm: Alarm) {',
      '    val manager = context.getSystemService(AlarmManager::class.java)',
      '    manager.setExactAndAllowWhileIdle(',
      '        AlarmManager.RTC_WAKEUP,',
      '        alarm.triggerAtMillis,',
      '        alarm.pendingIntent(context)',
      '    )',
      '}',
      '',
      'val challenges = listOf(Math, MemoryMatch, SimonSays, QrScan)'
    ].join('\n')
  };

  var currentSnippetKey = 'python';
  var heroTypingIndex = 0;
  var isTyping = false;
  var typingTimeout = null;

  function initHeroTyping() {
    var codeEl = document.getElementById('hero-code-typing');
    if (!codeEl) return;

    startTyping(currentSnippetKey);

    // Language tabs in Hero window
    var tabs = document.querySelectorAll('.code-lang-tab');
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        var lang = tab.getAttribute('data-lang');
        if (lang && SNIPPETS[lang]) {
          tabs.forEach(function(t) { t.classList.remove('is-active'); });
          tab.classList.add('is-active');
          currentSnippetKey = lang;
          startTyping(lang);
          if (window.SoundFX) window.SoundFX.click(1.1);
        }
      });
    });

    // Run Code Button in Hero window
    var runBtn = document.getElementById('hero-code-run');
    var outputEl = document.getElementById('hero-code-output');
    if (runBtn && outputEl) {
      runBtn.addEventListener('click', function() {
        runBtn.disabled = true;
        runBtn.textContent = 'Executing...';
        outputEl.style.display = 'block';
        outputEl.innerHTML = '<span class="term-dim">Connecting to NST GPU Cluster...</span>';

        if (window.SoundFX) window.SoundFX.modeShift();

        setTimeout(function() {
          outputEl.innerHTML = [
            '<span class="term-green">✓ Task Dispatched</span> [Status 200 OK]',
            '<span class="term-cyan">Model:</span> gemini-3.8-flash · <span class="term-cyan">Latency:</span> 24.8ms',
            '<span class="term-dim">Tokens: 1,480 | Throughput: 142 tps | Accuracy: 98.4%</span>'
          ].join('<br>');
          runBtn.disabled = false;
          runBtn.textContent = '▶ Run';
          if (window.SoundFX) window.SoundFX.click(1.3);
        }, 750);
      });
    }
  }

  function startTyping(snippetKey) {
    var codeEl = document.getElementById('hero-code-typing');
    if (!codeEl) return;

    clearTimeout(typingTimeout);
    heroTypingIndex = 0;
    codeEl.textContent = '';
    isTyping = true;

    var text = SNIPPETS[snippetKey];
    var cfg = window.PortfolioSettings ? window.PortfolioSettings.get() : { typingAnimation: true, typingSpeed: 30 };

    if (!cfg.typingAnimation) {
      codeEl.textContent = text;
      isTyping = false;
      return;
    }

    function typeChar() {
      if (heroTypingIndex < text.length) {
        var char = text.charAt(heroTypingIndex);
        codeEl.textContent += char;
        heroTypingIndex++;

        // Occasional typing sound click
        if (heroTypingIndex % 6 === 0 && window.SoundFX) {
          window.SoundFX.typeKey();
        }

        var speed = cfg.typingSpeed || 25;
        // Pause slightly on newlines
        if (char === '\n') speed = 120;
        else if (char === ' ') speed = 15;

        typingTimeout = setTimeout(typeChar, speed);
      } else {
        isTyping = false;
      }
    }

    typeChar();
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

      case 'projects':
        resp.innerHTML = [
          '1. <strong class="term-green">Quorum</strong>: private meeting notes, Whisper and Gemma 4 on-device (TypeScript, Python)',
          '2. <strong class="term-green">DocDrift AI</strong>: finds stale READMEs and opens a fix as a pull request (TypeScript)',
          '3. <strong class="term-green">I Can\'t Wake Up!</strong>: an Android alarm you cannot cheat (Kotlin)',
          '4. <strong class="term-green">Voice Assist AI</strong>: dictation and tone-aware replies in any Android app (Kotlin)',
          '5. <strong class="term-green">Wardrobe Brainy</strong>: an MCP server for your wardrobe (Python, SQLite)',
          '6. <strong class="term-green">MusicDownloaderCLI</strong>: hi-res audio from a pasted link (Python)'
        ].join('<br>');
        break;

      case 'stack':
        resp.innerHTML = [
          '<span class="term-cyan">Languages:</span> Kotlin 51%, TypeScript 31%, Python 12%, JavaScript 3%',
          '<span class="term-cyan">Android:</span> Jetpack Compose, Room, accessibility and overlay services',
          '<span class="term-cyan">AI:</span> Gemma 4 in LM Studio, Whisper, MCP with FastMCP',
          '<span class="term-cyan">Web:</span> Next.js, FastAPI, SeleniumBase'
        ].join('<br>');
        break;

      case 'nst':
        resp.innerHTML = 'Newton School of Technology: where I study Computer Science and AI, and where I came to learn by building instead of by rote.';
        break;

      case 'bio':
        resp.innerHTML = 'Srikanth Nagendran. I learn by building things, getting stuck and working out the fix. Life has had ups and downs; I keep the balance net positive and live without regrets.';
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
        resp.innerHTML = 'GitHub: <a href="https://github.com/GodGamerAgent" target="_blank" rel="noopener" class="term-link">github.com/GodGamerAgent</a>';
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

  window.TerminalTyping = {
    startHeroTyping: startTyping
  };
})(window);
