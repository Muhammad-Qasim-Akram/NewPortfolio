const CHARS = 'z0156789!@#$§]⌈⟫※¥↨▩▭▤∄⋿∑:)%&~<>/|}{[]';

function shouldScrambleText() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const BOT_DATA = {
  name: "Muhammad Qasim Akram",
  role: "Full Stack Developer & AI Engineer",
  intro: "Hey, I'm Qasim, a full stack developer from Pakistan. I build useful products across React frontends, ASP.NET, Node.js and Django backends, computer vision, and language-model tools. I'm currently building SmartSpend, an expense-tracking app backend with ASP.NET and PostgreSQL.",
  stack: {
    frontend: ["React.js", "JavaScript", "TypeScript", "HTML", "CSS"],
    backend: ["ASP.NET", "Node.js", "Django", "Python", "REST APIs", "WebSockets", "PostgreSQL", "MongoDB", "Redis"],
    ai: ["YOLOv8", "OpenCV", "Computer Vision", "LLM APIs", "LLaMA 3"],
    tools: ["Git & GitHub", "Azure", "Vercel", "Netlify", "GitHub Actions", "Railway"]
  },
  projects: [
    {
      name: "SmartSpend — Expense Tracking Backend (In Progress)",
      description: "The backend for an expense-tracking app with categorized spending and budgets, built with ASP.NET and PostgreSQL.",
      link: "https://github.com/Muhammad-Qasim-Akram/Smartspend.Api"
    },
    {
      name: "ChatRoom — Real-Time Chat App",
      description: "A real-time room-based chat app built with Django Channels, WebSockets, and Redis.",
      link: "https://chat-room-two-pi.vercel.app/"
    },
    {
      name: "DevChat — Developer Chat Assistant",
      description: "A language-model developer assistant with context memory and streaming, using LLaMA 3 via Ollama.",
      link: "https://dev-chat-gilt.vercel.app/"
    },
    {
      name: "EyeSpy — Blind Assistance System",
      description: "Real-time object detection and audio feedback using YOLOv8 on a live camera.",
      link: "https://github.com/Muhammad-Qasim-Akram/EyeSpy"
    },
    {
      name: "YOUROWN — E-Commerce Platform",
      description: "A storefront with a cart, JWT authentication, order tracking, Azure hosting, and GitHub Actions CI/CD.",
      link: "https://qasim-ecommerce.azurewebsites.net/"
    },
    {
      name: "Minimal Analysis — Stock Predictor",
      description: "Stock analysis with live market data and generated insights.",
      link: "https://github.com/Muhammad-Qasim-Akram/Stock-Price-Prediction"
    }
  ],
  education: "I'm pursuing a BS in Computer Science at The Islamia University of Bahawalpur. I'm currently in my 7th semester and expect to graduate in 2027.",
  certs: [
    "Advanced MySQL Topics — Meta (September 2025)",
    "Supervised Machine Learning: Regression & Classification — Stanford / DeepLearning.AI (December 2025)",
    "Python for Data Science, AI & Development — IBM (October 2025)"
  ],
  contact: {
    email: "qasimakram46@hotmail.com",
    github: "https://github.com/Muhammad-Qasim-Akram",
    linkedin: "https://linkedin.com/in/qasimakram",
    whatsapp: "https://wa.me/923126442266"
  },
  resumeUrl: "img/Muhammad_Qasim_Akram_Resume.pdf",
  availability: "I'm open to internships and junior full-stack or AI engineering roles, freelance projects, and collaborations. I'm based in Pakistan and happy to connect about remote opportunities."
};

(() => {
  const panel = document.getElementById("qbot-panel");
  const launcher = document.getElementById("qbot-launcher");
  const closeButton = document.getElementById("qbot-close");
  const messages = document.getElementById("qbot-messages");
  const chips = document.getElementById("qbot-chips");
  const suggestions = document.getElementById("qbot-suggestions");
  const form = document.getElementById("qbot-form");
  const input = document.getElementById("qbot-input");
  const botTitle = document.getElementById("qbot-title");
  botTitle.textContent = "Ask Qasim";
  const commandNames = [
    "/help", "/intro", "/stack", "/projects", "/education",
    "/certs", "/contact", "/resume", "/hire", "/clear", "/coffee"
  ];
  const quickCommands = ["/intro", "/stack", "/projects", "/education", "/certs", "/contact", "/resume", "/hire"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let hasOpened = false;
  let titleScrambled = false;
  let replyId = 0;

  function addMessage(kind, content) {
    const message = document.createElement("div");
    message.className = `qbot-message qbot-${kind}`;
    if (typeof content === "string") {
      if (kind === "bot" && shouldScrambleText()) {
        appendScrambledText(message, content);
      } else {
        message.textContent = content;
      }
    } else {
      content.forEach((part) => {
        if (part.url) {
          const link = document.createElement("a");
          link.className = "qbot-link";
          link.href = part.url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = part.text;
          message.append(link);
        } else {
          if (kind === "bot" && shouldScrambleText()) {
            appendScrambledText(message, part.text);
          } else {
            message.append(document.createTextNode(part.text));
          }
        }
      });
    }
    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
    return message;
  }

  function appendScrambledText(parent, text) {
    const tokens = text.match(/\s+|[^\s]+/g) || [];
    const wordSpans = [];
    const visualText = document.createElement("span");
    visualText.className = "qbot-scramble-visual";
    visualText.setAttribute("aria-hidden", "true");
    tokens.forEach((token) => {
      if (/^\s+$/.test(token)) {
        visualText.append(document.createTextNode(token));
        return;
      }
      const word = document.createElement("span");
      word.className = "qbot-scramble-word";
      word.dataset.finalText = token;
      word.textContent = token.replace(/[^\s]/g, () =>
        CHARS[Math.floor(Math.random() * CHARS.length)],
      );
      visualText.append(word);
      wordSpans.push(word);
    });
    parent.append(visualText);
    const accessibleText = document.createElement("span");
    accessibleText.className = "qbot-sr-only";
    accessibleText.textContent = text;
    parent.append(accessibleText);

    const interval = wordSpans.length
      ? Math.min(500, Math.max(1, Math.floor(500 / wordSpans.length)))
      : 0;
    wordSpans.forEach((word, index) => {
      window.setTimeout(() => {
        word.textContent = word.dataset.finalText;
      }, interval * index);
    });
  }

  function scrambleBotTitle() {
    if (!shouldScrambleText()) return;
    const finalText = botTitle.textContent;
    let frame = 0;
    const totalFrames = 10;
    const timer = window.setInterval(() => {
      const resolvedWords = Math.floor((frame / totalFrames) * 2);
      botTitle.textContent = ["Ask", "Qasim"]
        .map((word, index) => index < resolvedWords
          ? word
          : word.replace(/[^\s]/g, () => CHARS[Math.floor(Math.random() * CHARS.length)]))
        .join(" ");
      frame += 1;
      if (frame > totalFrames) {
        window.clearInterval(timer);
        botTitle.textContent = finalText;
      }
    }, 50);
  }
  function setChips(commands) {
    chips.replaceChildren();
    commands.forEach((command) => {
      const chip = document.createElement("button");
      chip.className = "qbot-chip";
      chip.type = "button";
      chip.textContent = command;
      chip.addEventListener("click", () => runCommand(command));
      chips.append(chip);
    });
  }

  function showSuggestions(value) {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed.startsWith("/")) {
      suggestions.hidden = true;
      suggestions.replaceChildren();
      return;
    }
    const matches = commandNames.filter((command) => command.startsWith(trimmed));
    suggestions.replaceChildren();
    matches.forEach((command) => {
      const option = document.createElement("button");
      option.className = "qbot-suggestion";
      option.type = "button";
      option.setAttribute("role", "option");
      option.textContent = command;
      option.addEventListener("click", () => runCommand(command));
      suggestions.append(option);
    });
    suggestions.hidden = matches.length === 0;
  }

  function getReply(command) {
    switch (command) {
      case "/help":
        return {
          text: "I can tell you about my work, skills, projects, education, and contact details. Try /intro, /stack, /projects, /education, /certs, /contact, /resume, or /hire.",
          chips: quickCommands
        };
      case "/intro":
        return { text: BOT_DATA.intro, chips: quickCommands };
      case "/stack":
        return {
          parts: [
            { text: "Here's what I work with:\nFrontend: " + BOT_DATA.stack.frontend.join(", ") +
              "\nBackend: " + BOT_DATA.stack.backend.join(", ") +
              "\nComputer vision & language tools: " + BOT_DATA.stack.ai.join(", ") +
              "\nTools: " + BOT_DATA.stack.tools.join(", ") }
          ],
          chips: ["/projects", "/intro", "/contact"]
        };
      case "/projects":
        return {
          parts: BOT_DATA.projects.flatMap((project, index) => [
            { text: `${index ? "\n\n" : "Here are a few things I've built:\n"}${project.name}: ${project.description} ` },
            { text: "View project ↗", url: project.link }
          ]),
          chips: ["/stack", "/contact", "/hire"]
        };
      case "/education":
        return { text: BOT_DATA.education, chips: ["/certs", "/contact"] };
      case "/certs":
        return {
          text: BOT_DATA.certs.length ? BOT_DATA.certs.join("\n") : "I haven't listed any certifications yet.",
          chips: ["/education", "/stack"]
        };
      case "/contact":
        return {
          parts: [
            { text: "Email me at " },
            { text: BOT_DATA.contact.email, url: `mailto:${BOT_DATA.contact.email}` },
            { text: ", or find my work on " },
            { text: "GitHub", url: BOT_DATA.contact.github },
            { text: " and " },
            { text: "LinkedIn", url: BOT_DATA.contact.linkedin },
            { text: ", or message me on " },
            { text: "WhatsApp ↗", url: BOT_DATA.contact.whatsapp },
            { text: "." }
          ],
          chips: ["/hire", "/projects", "/resume"]
        };
      case "/resume":
        return {
          parts: [
            { text: "Here's my " },
            { text: "resume ↗", url: BOT_DATA.resumeUrl },
            { text: ". Feel free to get in touch if you'd like to talk." }
          ],
          chips: ["/contact", "/hire"]
        };
      case "/hire":
        return {
          parts: [
            { text: `${BOT_DATA.availability} Email me at ` },
            { text: BOT_DATA.contact.email, url: `mailto:${BOT_DATA.contact.email}` },
            { text: " and let's talk." }
          ],
          chips: ["/projects", "/resume", "/contact"]
        };
      case "/coffee":
        return { text: "Good idea. I’ll bring the code; you bring the coffee. What are we building?", chips: ["/projects", "/hire"] };
      default:
        return null;
    }
  }

  function runCommand(rawCommand) {
    const command = rawCommand.trim().toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/^\/\s*/, "/");
    input.value = "";
    showSuggestions("");
    if (command === "/clear") {
      replyId++;
      messages.replaceChildren();
      setChips(quickCommands);
      showBotReply({
        text: "I cleared the chat. What would you like to know?",
        chips: quickCommands
      });
      return;
    }
    const reply = getReply(command);
    if (!reply) {
      showBotReply({
        text: "I’m not sure about that one. Try /help and I’ll point you in the right direction.",
        chips: quickCommands
      });
      return;
    }
    showBotReply(reply);
  }

  function showBotReply(reply) {
    const currentReply = ++replyId;
    messages.querySelectorAll(".qbot-typing").forEach((indicator) => indicator.remove());
    chips.replaceChildren();
    const typing = document.createElement("div");
    typing.className = "qbot-message qbot-bot qbot-typing";
    typing.setAttribute("aria-label", "Assistant is typing");
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.append(typing);
    messages.scrollTop = messages.scrollHeight;
    const delay = 600 + Math.floor(Math.random() * 301);

    window.setTimeout(() => {
      if (currentReply !== replyId) return;
      typing.remove();
      const content = reply.parts || reply.text;
      const message = addMessage("bot", content);
      setChips(reply.chips);
    }, delay);
  }

  function normalizePlainText(value) {
    const text = value.toLowerCase();
    if (/\b(project|work|portfolio)\b/.test(text)) return "/projects";
    if (/\b(skill|stack|tech|technology|technologies)\b/.test(text)) return "/stack";
    if (/\b(contact|email|github|linkedin|whatsapp)\b/.test(text)) return "/contact";
    if (/\b(hire|hiring|job|freelance|available)\b/.test(text)) return "/hire";
    if (/\b(education|study|degree|university)\b/.test(text)) return "/education";
    if (/\b(resume|cv)\b/.test(text)) return "/resume";
    if (/\b(hello|hi|hey)\b/.test(text)) return "/intro";
    return null;
  }

  function submitMessage(value) {
    const text = value.trim();
    if (!text) return;
    addMessage("user", text);
    if (text.startsWith("/")) {
      runCommand(text);
      return;
    }
    const command = normalizePlainText(text);
    if (command) {
      runCommand(command);
    } else {
      showBotReply({
        text: "I’m not sure I have that detail, but I’m happy to help. Try /help to see what I can tell you.",
        chips: quickCommands
      });
    }
  }

  function openPanel() {
    panel.hidden = false;
    panel.setAttribute("aria-hidden", "false");
    launcher.setAttribute("aria-expanded", "true");
    launcher.classList.add("qbot-clicked");
    window.requestAnimationFrame(() => panel.classList.add("qbot-open"));
    window.setTimeout(() => input.focus(), reduceMotion.matches ? 0 : 180);
    if (!titleScrambled) {
      titleScrambled = true;
      scrambleBotTitle();
    }
    if (!hasOpened) {
      hasOpened = true;
      setChips(quickCommands);
      showBotReply({
        text: "Hey, I'm Qasim. Ask me about my work, projects, or how to get in touch.",
        chips: quickCommands
      });
    }
  }

  function closePanel() {
    panel.classList.remove("qbot-open");
    panel.hidden = true;
    panel.setAttribute("aria-hidden", "true");
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  }

  launcher.addEventListener("click", () => {
    if (panel.hidden) openPanel();
    else closePanel();
  });
  closeButton.addEventListener("click", closePanel);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value;
    input.value = "";
    showSuggestions("");
    submitMessage(value);
  });
  input.addEventListener("input", () => showSuggestions(input.value));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) closePanel();
  });
})();


