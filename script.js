// ==========================================================================
// Life Gutters — interactions
// ==========================================================================
document.addEventListener('DOMContentLoaded', function () {

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Header: solid background after scrolling past hero ----
  var header = document.getElementById('siteHeader');
  var scrollThreshold = 40;
  function onScroll() {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- Mobile nav toggle ----
  var navToggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');

  function closeMobileNav() {
    mobileNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }
  function openMobileNav() {
    mobileNav.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.contains('open');
      if (isOpen) { closeMobileNav(); } else { openMobileNav(); }
    });

    // Close nav when a link is tapped
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileNav);
    });
  }

  // ---- Scroll reveal ----
  var revealEls = document.querySelectorAll('.reveal');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  // ---- Process timeline fill (desktop signature detail) ----
  var processTrack = document.querySelector('.process-track');
  var processLineFill = document.querySelector('.process-line-fill');
  if (processTrack && processLineFill && 'IntersectionObserver' in window && !prefersReducedMotion) {
    var lineObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          processLineFill.classList.add('filled');
          lineObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    lineObserver.observe(processTrack);
  } else if (processLineFill) {
    processLineFill.classList.add('filled');
  }

  // ---- Hero photo carousel: auto-rotate through real job photos ----
  var heroSlides = document.querySelectorAll('.hero-slide');
  if (heroSlides.length > 1) {
    var currentSlide = 0;
    setInterval(function () {
      heroSlides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % heroSlides.length;
      heroSlides[currentSlide].classList.add('active');
    }, 5000);
  }

  // ---- Gallery: generate a card for every photo with one for loop ----
  // Just change this number to match how many gallery-NN.jpg files you have
  // in images/gallery/ — no HTML editing required.
  var GALLERY_PHOTO_COUNT = 68;

  var galleryTrack = document.getElementById('galleryTrack');
  var galleryWrap = galleryTrack ? galleryTrack.closest('.gallery-wrap') : null;

  if (galleryTrack) {
    for (var i = 1; i <= GALLERY_PHOTO_COUNT; i++) {
      var num = i < 10 ? '0' + i : String(i);

      var card = document.createElement('div');
      card.className = 'gallery-card';

      var img = document.createElement('img');
      img.src = 'images/gallery/gallery-' + num + '.jpg';
      img.alt = 'Life Gutters installation, KZN';
      img.loading = 'lazy';
      img.onerror = function () {
        this.style.display = 'none';
        this.closest('.gallery-card').classList.add('gallery-card--empty');
      };

      card.appendChild(img);
      galleryTrack.appendChild(card);
    }

    // ---- Infinite auto-scroll: duplicate the set once, then loop the
    // animation across exactly the width of one set, so it repeats seamlessly.
    // Skipped for reduced-motion users, who get the plain swipeable strip instead.
    if (!prefersReducedMotion && galleryWrap) {
      var originalCards = Array.prototype.slice.call(galleryTrack.children);
      originalCards.forEach(function (card) {
        galleryTrack.appendChild(card.cloneNode(true));
      });

      // measure after the browser has laid out the (now-loaded-enough) originals
      requestAnimationFrame(function () {
        var setWidth = 0;
        originalCards.forEach(function (card) { setWidth += card.offsetWidth; });
        var gapPx = parseFloat(getComputedStyle(galleryTrack).gap) || 20;
        setWidth += gapPx * originalCards.length;

        var pxPerSecond = 45; // gentle, steady drift
        var duration = setWidth / pxPerSecond;

        galleryTrack.style.setProperty('--marquee-distance', setWidth + 'px');
        galleryTrack.style.setProperty('--marquee-duration', duration + 's');
        galleryWrap.classList.add('is-marquee');
      });
    }
  }

  // ---- Gallery: arrow buttons scroll the photo strip (manual-swipe mode only) ----
  var galleryPrev = document.getElementById('galleryPrev');
  var galleryNext = document.getElementById('galleryNext');
  if (galleryTrack && galleryPrev && galleryNext) {
    function galleryScrollAmount() {
      var card = galleryTrack.querySelector('.gallery-card');
      return card ? card.offsetWidth + 20 : 300;
    }
    galleryPrev.addEventListener('click', function () {
      galleryTrack.scrollBy({ left: -galleryScrollAmount(), behavior: 'smooth' });
    });
    galleryNext.addEventListener('click', function () {
      galleryTrack.scrollBy({ left: galleryScrollAmount(), behavior: 'smooth' });
    });
  }

  // ---- Quote form: build a mailto with the details filled in ----
  var quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = quoteForm.name.value.trim();
      var phone = quoteForm.phone.value.trim();
      var area = quoteForm.area.value.trim();
      var message = quoteForm.message.value.trim();

      var subject = 'Quote request from ' + (name || 'website visitor');
      var bodyLines = [
        'Name: ' + name,
        'Phone/WhatsApp: ' + phone,
        'Suburb/Area: ' + (area || 'Not specified'),
        '',
        'Message:',
        message || '(No additional details provided)'
      ];
      var body = bodyLines.join('\n');

      var mailto = 'mailto:lifegutters@gmail.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      window.location.href = mailto;
    });
  }

});
