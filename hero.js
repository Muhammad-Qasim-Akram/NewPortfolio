(function () {
  'use strict';

  var stage = document.getElementById('portfolioStage');
  var content = document.getElementById('portfolioContent');
  var word = document.getElementById('portfolioWord');
  var wrap = document.getElementById('portfolioWrap');
  var wheel = document.getElementById('portfolioWheel');
  var cardsContainer = document.getElementById('portfolioCards');
  var welcome = stage && stage.querySelector('.portfolio-welcome');
  var description = document.getElementById('portfolioDescription');
  if (!stage || !content || !word || !wrap || !wheel || !cardsContainer || !welcome || !description) return;

  var progress = [
    0, 0, 0, .001, .001, .001, 0, 0, 0, .001, .002, .002, .003, .004, .007,
    .009, .012, .015, .019, .024, .029, .035, .042, .049, .057, .067, .078,
    .091, .106, .124, .144, .168, .198, .235, .282, .34, .41, .488, .569,
    .641, .7, .748, .787, .819, .845, .868, .887, .904, .918, .931, .942,
    .951, .96, .967, .973, .978, .983, .987, .991, .994, .996, .997, .997,
    .998, .999, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, .999,
    .998, .996, .995, .994, .992, .988, .984, .979, .973, .968, .96, .95,
    .941, .93, .917, .903, .886, .867, .844, .816, .782, .741, .689, .624,
    .549, .467, .386, .316, .262, .221, .186, .158, .134, .114, .097, .082,
    .069, .059, .052, .044, .036, .03, .024, .02, .015, .012, .009, .007,
    .005, .003, .001, .001, .001
  ];
  var loopDuration = 4.5;
  var orbitRadius = 284;
  var angleStep = 30;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wheelScale = 1;
  var horizontalScale = 1;
  var titleMargin = 97;
  var titleCenterY = 152;
  var mobileTextOffset = 0;
  var stageCenterX = 348;
  var hoveredCard = null;
  var focusedCard = null;
  var pinnedCard = null;
  var activeCard = null;
  var visible = true;
  var wheelElapsed = 0;
  var speed = 1.9;
  var titleRollDuration = 1.8;
  var titleStagger = -0.076;
  var titleFaceCount = 4.02;
  var lastFrame = 0 ;
  var frameId = 0;

  var projectCards = [
    { offset: -4, key: 'face', title: 'Portfolio case study', detail: 'A faster homepage', image: 'img/hero/face.jpg', href: 'case-portfolio.html' },
    { offset: -3, key: 'deep', title: 'Minimal Analysis', detail: 'Stock prediction', image: 'img/hero/deep.jpg', href: 'https://github.com/Muhammad-Qasim-Akram/Stock-Price-Prediction', external: true },
    { offset: -2, key: 'devchat', title: 'DevChat', detail: 'AI for developers', image: 'img/devchat.webp', href: 'https://dev-chat-seven.vercel.app/', external: true },
    { offset: -1, key: 'contact', contact: true },
    { offset: 0, key: 'portrait', title: 'About me', detail: 'Muhammad Qasim Akram', image: 'img/hero/portrait.jpg', href: '#contact' },
    { offset: 1, key: 'yourown', title: 'yourOwn Store', detail: 'E-commerce platform', image: 'img/yourown.webp', href: 'https://yourown-store.azurewebsites.net/', external: true },
    { offset: 2, key: 'orb', title: 'EyeSpy', detail: 'Computer vision assistant', image: 'img/hero/orb.jpg', href: 'https://github.com/Muhammad-Qasim-Akram/EyeSpy', external: true },
    { offset: 3, key: 'polestar', title: 'ChatRoom', detail: 'Real-time systems', image: 'img/hero/polestar.jpg', href: 'case-chatroom.html' }
  ];

  function makeContactCard() {
    var card = document.createElement('div');
    card.className = 'portfolio-card portfolio-card-contact';
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-label', 'Contact Muhammad Qasim Akram');

    var name = document.createElement('strong');
    name.className = 'portfolio-contact-name';
    name.appendChild(document.createTextNode('Muhammad'));
    name.appendChild(document.createElement('br'));
    name.appendChild(document.createTextNode('Qasim Akram'));
    card.appendChild(name);

    var role = document.createElement('span');
    role.className = 'portfolio-contact-role';
    role.appendChild(document.createTextNode('Full Stack Engineer'));
    role.appendChild(document.createElement('br'));
    role.appendChild(document.createTextNode('· AI Engineer'));
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
      link.setAttribute('aria-label', item.label === 'Email' ? 'Email Qasim at qasimakram46@hotmail.com' : item.label);
      link.appendChild(document.createTextNode(item.label));
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

  function refreshCards(cards) {
    activeCard = pinnedCard || hoveredCard || focusedCard;
    cards.forEach(function (card) {
      var isActive = card === activeCard;
      card.classList.toggle('hot', isActive);
      card.style.setProperty('--s', isActive ? card.dataset.big : 1);
      card.style.zIndex = isActive ? '50' : card.dataset.z;
    });
  }

  var cards = projectCards.map(function (project, index) {
    var card = project.contact ? makeContactCard() : document.createElement('a');
    card.classList.add('portfolio-card');
    card.dataset.z = String(index + 1);
    card.dataset.big = project.contact ? '1.3' : '1.12';
    card.style.zIndex = String(index + 1);
    card.style.transform = 'rotate(' + (project.offset * angleStep) + 'deg) translateY(-' + orbitRadius + 'px) scale(var(--s, 1))';

    if (!project.contact) {
      card.href = project.href;
      card.setAttribute('role', 'listitem');
      card.setAttribute('aria-label', project.title + ': ' + project.detail);
      if (project.key === 'devchat' || project.key === 'yourown') {
        card.classList.add('portfolio-card-screenshot');
      }
      if (project.external) {
        card.target = '_blank';
        card.rel = 'noopener';
      }

      var image = document.createElement('img');
      image.className = 'portfolio-card-image';
      if (project.key === 'portrait') card.classList.add('portfolio-card-portrait');
      image.src = project.image;
      image.alt = '';
      image.decoding = 'async';
      if (project.key === 'portrait') image.fetchPriority = 'high';
      card.appendChild(image);
    }

    card.addEventListener('pointerenter', function () {
      hoveredCard = card;
      refreshCards(cards);
    });
    card.addEventListener('pointerleave', function () {
      if (hoveredCard === card) hoveredCard = null;
      refreshCards(cards);
    });
    card.addEventListener('focusin', function () {
      focusedCard = card;
      refreshCards(cards);
    });
    card.addEventListener('focusout', function (event) {
      if (!card.contains(event.relatedTarget) && focusedCard === card) {
        focusedCard = null;
        refreshCards(cards);
      }
    });
    card.addEventListener('click', function (event) {
      if (event.target.closest('a')) return;
      pinnedCard = pinnedCard === card ? null : card;
      refreshCards(cards);
    });

    cardsContainer.appendChild(card);
    return card;
  });

  'PORTFOLIO'.split('').forEach(function (character, index) {
    var letter = document.createElement('span');
    letter.className = 'portfolio-letter';

    var placeholder = document.createElement('span');
    placeholder.className = 'portfolio-letter-placeholder';
    placeholder.textContent = character;
    letter.appendChild(placeholder);

    var cube = document.createElement('span');
    cube.className = 'portfolio-letter-cube';
    cube.style.animationDuration = (titleRollDuration * titleFaceCount) + 's';
    cube.style.animationDelay = (index * titleStagger) + 's';
    for (var faceIndex = 0; faceIndex < titleFaceCount; faceIndex += 1) {
      var face = document.createElement('b');
      face.className = 'portfolio-letter-face ' + (faceIndex % 2 ? 'outline' : 'solid');
      face.textContent = character;
      face.style.transform = 'rotateX(' + (faceIndex * (360 / titleFaceCount)) + 'deg) translateZ(28px)';
      cube.appendChild(face);
    }
    letter.appendChild(cube);
    word.appendChild(letter);
  });

  function fitWord() {
    var placeholders = word.querySelectorAll('.portfolio-letter-placeholder');
    var totalWidth = 0;
    placeholders.forEach(function (placeholder) {
      totalWidth += placeholder.offsetWidth;
    });
    if (totalWidth < 10) return;

    var width = stage.offsetWidth;
    var scale = horizontalScale >= 1 ? 1 + (horizontalScale - 1) * .42 : 1;
    scale = Math.min(scale, (width - 2 * titleMargin) / 500) * .75;
    wrap.style.left = (stageCenterX - 250 * scale) + 'px';
    wrap.style.top = (titleCenterY - 12 + mobileTextOffset) + 'px';
    welcome.style.top = (titleCenterY - 45 + mobileTextOffset) + 'px';
    wrap.style.transform = 'scale(' + scale + ') scaleX(' + (500 / totalWidth) + ')';
  }

  function fit() {
    var viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    var viewportHeight = window.innerHeight;
    var stageScale = viewportHeight / 744;
    var width = viewportWidth / stageScale;
    var height = 744;

    if (width < 440) {
      stageScale = viewportWidth / 440;
      width = 440;
      height = viewportHeight / stageScale;
    }
    mobileTextOffset = width < 560 ? 15 / stageScale : 0;

    horizontalScale = width / 696;
    var mobileScale = Math.max(0, Math.min(1, (horizontalScale - .63) / .37));
    var barScale = horizontalScale < 1 ? .75 + .25 * mobileScale : 1;
    wheelScale = horizontalScale >= 1 ? 1 + (horizontalScale - 1) * .38 : .86 + .14 * mobileScale;
    titleMargin = horizontalScale >= 1 ? 97 * horizontalScale : 24 + (97 * horizontalScale - 24) * mobileScale;
    var extraHeight = Math.max(0, height - 744);

    stage.style.width = width + 'px';
    stage.style.height = height + 'px';
    stage.style.transform = 'scale(' + stageScale + ')';
    content.style.top = (extraHeight * .35) + 'px';

    var centerX = width / 2 + (window.innerWidth - viewportWidth) / (2 * stageScale);
    stageCenterX = centerX;
    var barHeight = 228 * barScale;
    var barBottom = 40 + barHeight;
    titleCenterY = 40 + barHeight / 2 - 2;
    stage.style.setProperty('--m', titleMargin + 'px');
    stage.style.setProperty('--cx', centerX + 'px');
    stage.style.setProperty('--bk', barScale);

    var crossPositions = {
      L: horizontalScale < 1 ? 12 : 26,
      M1: centerX - 92 * (horizontalScale < 1 ? barScale : horizontalScale),
      M2: centerX + 92 * (horizontalScale < 1 ? barScale : horizontalScale),
      R: width - (horizontalScale < 1 ? 14 : 29)
    };
    stage.querySelectorAll('.portfolio-cross').forEach(function (cross) {
      cross.style.left = crossPositions[cross.dataset.x] + 'px';
      cross.style.top = (cross.dataset.y === 'B' ? barBottom : 40) + 'px';
    });

    var triangleTop = titleCenterY - 5;
    var triangleInset = horizontalScale < 1 ? 10 : 25;
    document.getElementById('portfolioTriangleLeft').style.top = triangleTop + 'px';
    document.getElementById('portfolioTriangleRight').style.top = triangleTop + 'px';
    document.getElementById('portfolioTriangleLeft').style.left = triangleInset + 'px';
    document.getElementById('portfolioTriangleRight').style.right = triangleInset + 'px';

    document.getElementById('portfolioName').style.top = (barBottom - 6 + mobileTextOffset) + 'px';
    var role = document.getElementById('portfolioRole');
    role.style.top = (barBottom - 6 + mobileTextOffset) + 'px';
    if (width < 560) {
      role.style.right = 'auto';
      role.style.left = titleMargin + 'px';
      role.style.top = (barBottom + 7 + mobileTextOffset) + 'px';
      description.style.top = (barBottom + 30 + mobileTextOffset) + 'px';
      description.style.left = titleMargin + 'px';
      description.style.right = 'auto';
      description.style.width = (width - 2 * titleMargin) + 'px';
      description.style.textAlign = 'left';
      description.style.transform = 'none';
    } else {
      role.style.left = 'auto';
      role.style.right = (titleMargin - 1) + 'px';
      description.style.top = (barBottom + 16 + mobileTextOffset) + 'px';
      description.style.left = 'auto';
      description.style.right = (titleMargin - 1) + 'px';
      description.style.width = Math.min(520, width - 2 * titleMargin) + 'px';
      description.style.textAlign = 'right';
      description.style.transform = 'none';
    }

    wheel.style.top = (barBottom + 227 + orbitRadius * wheelScale + extraHeight * .3) + 'px';
    fitWord();
  }

  var lastWheelTransform = '';

  function update(wheelTime) {
    var position = (wheelTime % loopDuration) * 30;
    var firstIndex = Math.floor(position) % progress.length;
    var nextIndex = (firstIndex + 1) % progress.length;
    var fraction = position - Math.floor(position);
    var turn = progress[firstIndex] + (progress[nextIndex] - progress[firstIndex]) * fraction;
    var transform = 'scale(' + wheelScale + ') rotate(' + (angleStep * turn) + 'deg)';
    if (transform !== lastWheelTransform) {
      wheel.style.transform = transform;
      lastWheelTransform = transform;
    }
  }

  function draw(now) {
    frameId = 0;
    var delta = lastFrame ? Math.min(.05, (now - lastFrame) / 1000) : 0;
    lastFrame = now;
    var targetSpeed = activeCard ? 0 : 1;
    speed += (targetSpeed - speed) * Math.min(1, delta * 9);
    if (speed < .003 && activeCard) speed = 0;
    wheelElapsed += delta * speed;
    update(wheelElapsed);
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
      visible = entries.some(function (entry) { return entry.isIntersecting && entry.intersectionRatio >= .1; });
      stage.parentElement.classList.toggle('portfolio-visible', visible);
      if (visible) start();
      else stop();
    }, { threshold: .1 }).observe(document.getElementById('top'));
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitWord);
  }
  fit();
  window.setTimeout(fitWord, 300);
  start();
}());
