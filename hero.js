(function () {
  'use strict';

  var stage = document.getElementById('portfolioStage');
  var word = document.getElementById('portfolioWord');
  var wheel = document.getElementById('portfolioWheel');
  if (!stage || !word || !wheel) return;

  var projects = [
    { offset: -4, title: 'Portfolio case study', detail: 'A faster homepage', image: 'img/portfolio-homepage.png', href: 'case-portfolio.html' },
    { offset: -3, title: 'Minimal Analysis', detail: 'Stock prediction', image: 'img/minimal-analysis.webp', href: 'https://github.com/Muhammad-Qasim-Akram/Stock-Price-Prediction', external: true },
    { offset: -2, title: 'EyeSpy', detail: 'Computer vision assistant', image: 'img/favicon.svg', icon: true, href: 'https://github.com/Muhammad-Qasim-Akram/EyeSpy', external: true },
    { offset: -1, contact: true },
    { offset: 0, title: 'About me', detail: 'Muhammad Qasim Akram', image: 'img/profile.webp', href: '#contact' },
    { offset: 1, title: 'ChatRoom', detail: 'Real-time systems', image: 'img/chatroom.webp', href: 'case-chatroom.html' },
    { offset: 2, title: 'DevChat', detail: 'AI for developers', image: 'img/devchat.webp', href: 'https://dev-chat-seven.vercel.app/', external: true },
    { offset: 3, title: 'yourOwn Store', detail: 'E-commerce platform', image: 'img/yourown.webp', href: 'https://yourown-store.azurewebsites.net/', external: true }
  ];
  var step = 360 / projects.length;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var paused = false;
  var visible = true;
  var elapsed = 0;
  var lastFrame = 0;
  var frameId = 0;

  function makeContactCard(angle) {
    var card = document.createElement('div');
    card.className = 'portfolio-card portfolio-card-contact';
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-label', 'Contact Qasim Akram');
    card.style.setProperty('--card-angle', angle + 'deg');

    var name = document.createElement('strong');
    name.className = 'portfolio-contact-name';
    name.appendChild(document.createTextNode('Qasim'));
    name.appendChild(document.createElement('br'));
    name.appendChild(document.createTextNode('Akram'));
    card.appendChild(name);

    var role = document.createElement('span');
    role.className = 'portfolio-contact-role';
    role.textContent = 'Full Stack Engineer · AI Engineer';
    card.appendChild(role);

    var line = document.createElement('span');
    line.className = 'portfolio-contact-line';
    line.setAttribute('aria-hidden', 'true');
    card.appendChild(line);

    [
      { label: 'GitHub', href: 'https://github.com/Muhammad-Qasim-Akram' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/qasimakram/' },
      { label: 'Email', href: 'mailto:qasimakram46@hotmail.com' }
    ].forEach(function (item) {
      var link = document.createElement('a');
      link.className = 'portfolio-contact-link';
      link.href = item.href;
      link.textContent = item.label;
      if (item.href.indexOf('https://') === 0) {
        link.target = '_blank';
        link.rel = 'noopener';
      }

      var arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      link.appendChild(arrow);
      card.appendChild(link);
    });

    return card;
  }

  projects.forEach(function (project, index) {
    var angle = project.offset * step;
    var card;
    if (project.contact) {
      card = makeContactCard(angle);
    } else {
      card = document.createElement('a');
      card.className = 'portfolio-card';
      card.href = project.href;
      card.setAttribute('role', 'listitem');
      card.setAttribute('aria-label', project.title + ': ' + project.detail);
      if (project.external) {
        card.target = '_blank';
        card.rel = 'noopener';
      }

      var image = document.createElement('img');
      image.className = 'portfolio-card-image';
      image.src = project.image;
      image.alt = '';
      image.decoding = 'async';
      if (project.icon) image.classList.add('portfolio-card-icon');
      if (index === 3) image.fetchPriority = 'high';
      card.appendChild(image);

      var caption = document.createElement('span');
      caption.className = 'portfolio-card-caption';
      var title = document.createElement('b');
      title.textContent = project.title;
      var detail = document.createElement('span');
      detail.textContent = project.detail;
      caption.appendChild(title);
      caption.appendChild(detail);
      card.appendChild(caption);
    }

    card.style.setProperty('--card-angle', angle + 'deg');
    card.addEventListener('pointerenter', function () { paused = true; });
    card.addEventListener('pointerleave', function () { paused = false; });
    card.addEventListener('focusin', function () { paused = true; });
    card.addEventListener('focusout', function (event) {
      if (!card.contains(event.relatedTarget)) paused = false;
    });
    wheel.appendChild(card);
  });

  'PORTFOLIO'.split('').forEach(function (character) {
    var letter = document.createElement('span');
    letter.className = 'portfolio-letter';

    var placeholder = document.createElement('span');
    placeholder.className = 'portfolio-letter-placeholder';
    placeholder.textContent = character;
    letter.appendChild(placeholder);

    var cube = document.createElement('span');
    cube.className = 'portfolio-letter-cube';
    for (var faceIndex = 0; faceIndex < 4; faceIndex += 1) {
      var face = document.createElement('b');
      face.className = 'portfolio-letter-face ' + (faceIndex % 2 ? 'outline' : 'solid');
      face.textContent = character;
      face.style.transform = 'rotateX(' + (faceIndex * 90) + 'deg) translateZ(var(--portfolio-letter-depth, 28px))';
      cube.appendChild(face);
    }
    letter.appendChild(cube);
    word.appendChild(letter);
  });

  function fit() {
    var heading = document.querySelector('.portfolio-heading');
    var placeholders = word.querySelectorAll('.portfolio-letter-placeholder');
    var width = 0;
    placeholders.forEach(function (placeholder) {
      width += placeholder.getBoundingClientRect().width;
    });
    if (width > 0 && heading) {
      var fontSize = parseFloat(window.getComputedStyle(heading).fontSize);
      heading.style.setProperty('--portfolio-letter-depth', (fontSize / 2) + 'px');
      heading.style.setProperty('--portfolio-word-scale', Math.min(1, heading.clientWidth / width));
    }
  }

  function update(time) {
    var turn = reducedMotion ? 0 : (1 - Math.cos(time * Math.PI * 2 / 9)) * step / 2;
    wheel.style.transform = 'rotate(' + turn + 'deg)';
    word.querySelectorAll('.portfolio-letter-cube').forEach(function (cube, index) {
      var angle = time * 80 + index * 38;
      var skew = -9 + 9 * Math.sin(time * 1.4 + index * .7);
      cube.style.transform = 'rotateX(' + angle + 'deg) skewX(' + skew + 'deg)';
    });
  }

  function draw(now) {
    frameId = 0;
    var delta = lastFrame ? Math.min(.05, (now - lastFrame) / 1000) : 0;
    lastFrame = now;
    if (!paused) elapsed += delta;
    update(elapsed);
    if (!reducedMotion && visible && !document.hidden) {
      frameId = window.requestAnimationFrame(draw);
    }
  }

  function start() {
    if (!reducedMotion && visible && !document.hidden && !frameId) {
      frameId = window.requestAnimationFrame(draw);
    } else if (reducedMotion) {
      update(0);
    }
  }

  function stop() {
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
    lastFrame = 0;
  }

  window.addEventListener('resize', fit, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries.some(function (entry) { return entry.isIntersecting; });
      if (visible) start();
      else stop();
    }).observe(document.getElementById('top'));
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fit);
  }
  fit();
  start();
}());
