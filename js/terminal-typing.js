/**
 * Terminal & Code Typing Simulation
 * Inspired by onlines.com.ar live typing and developer workstation terminals.
 * Powers the Hero Code Frame typing loop and the Interactive Terminal Playground.
 */
(function(window) {
  'use strict';

  var SNIPPETS = {
    typescript: [
      '// NST AI Lab — Agent Orchestrator',
      'import { AgentEngine, GraphRAG } from "@nst/core";',
      '',
      'export async function dispatchTask(prompt: string) {',
      '  const graph = new GraphRAG({ maxDepth: 4 });',
      '  const agent = new AgentEngine({',
      '    model: "gemini-3.8-flash",',
      '    telemetry: true,',
      '    stream: true',
      '  });',
      '',
      '  const context = await graph.retrieve(prompt);',
      '  return agent.execute({ prompt, context });',
      '}'
    ].join('\n'),

    python: [
      '# Newton School of Technology — Model Inspector',
      'import torch',
      'from nst_lab import AttentionAnalyzer',
      '',
      'def inspect_activations(weights_path: str):',
      '    device = "cuda" if torch.cuda.is_available() else "cpu"',
      '    model = torch.load(weights_path, map_location=device)',
      '    analyzer = AttentionAnalyzer(model, heads=32)',
      '    metrics = analyzer.evaluate_entropy(tokens=2048)',
      '    print(f"✓ Cluster Latency: {metrics.latency_ms:.2f}ms")',
      '    return metrics'
    ].join('\n')
  };

  var heroTypingIndex = 0;
  var currentSnippetKey = 'typescript';
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
          '  <span class="term-cyan">projects</span>    — List featured engineering projects',
          '  <span class="term-cyan">stack</span>       — View technical proficiencies',
          '  <span class="term-cyan">nst</span>         — Newton School of Technology details & AI Lab',
          '  <span class="term-cyan">bio</span>         — Read Srikanth\'s story & focus',
          '  <span class="term-cyan">ai</span>          — Toggle interactive AI Mode switch',
          '  <span class="term-cyan">sound</span>       — Toggle tactile Web Audio synth',
          '  <span class="term-cyan">contact</span>     — Display contact endpoints',
          '  <span class="term-cyan">clear</span>       — Wipe the terminal screen'
        ].join('<br>');
        break;

      case 'projects':
        resp.innerHTML = [
          '1. <strong class="term-green">OmniGraph AI</strong> — Graph-RAG Multi-Agent Orchestrator (FastAPI, Neo4j, LangGraph)',
          '2. <strong class="term-green">HyperCanvas WebGL</strong> — GPU-Accelerated Node Graph Physics Engine (Three.js, WebGL)',
          '3. <strong class="term-green">NST Pulse</strong> — Real-time GPU Lab Telemetry & Distributed Experiment Tracker (Go, PyTorch, Redis)',
          '4. <strong class="term-green">LatentDiff</strong> — Latent Diffusion Activation Heatmap Inspector (PyTorch, React, Python)'
        ].join('<br>');
        break;

      case 'stack':
        resp.innerHTML = [
          '<span class="term-cyan">Languages:</span> TypeScript, Python, C++, SQL, Go, Rust',
          '<span class="term-cyan">Frontend:</span> React, Next.js, WebGL, Three.js, GSAP, Tailwind CSS',
          '<span class="term-cyan">AI & Systems:</span> PyTorch, LangChain/LangGraph, Hugging Face, TensorRT, Docker, PostgreSQL'
        ].join('<br>');
        break;

      case 'nst':
        resp.innerHTML = [
          '<strong class="term-cyan">Newton School of Technology (NST)</strong>',
          'Program: B.Tech Computer Science & Artificial Intelligence',
          'Focus: Distributed Systems, Autonomous Agent Architectures & LLM Inference',
          'Lab: NST Deep Learning & High-Performance Computing Cluster'
        ].join('<br>');
        break;

      case 'bio':
        resp.innerHTML = 'Srikanth is a developer & AI engineer studying at Newton School of Technology. Blends frontend craft, interactive graphics, and AI agent orchestration to build software with substance.';
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
          'Email: <a href="mailto:srikanth@example.com" class="term-link">srikanth@example.com</a>',
          'GitHub: <a href="https://github.com" target="_blank" rel="noopener" class="term-link">github.com/srikanth-nst</a>',
          'LinkedIn: <a href="https://linkedin.com" target="_blank" rel="noopener" class="term-link">linkedin.com/in/srikanth</a>',
          'Location: Newton School of Technology Campus'
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

  window.TerminalTyping = {
    startHeroTyping: startTyping
  };
})(window);
