document.addEventListener('DOMContentLoaded', () => {

  // ===== BURGER MENU =====
  const burger = document.getElementById('burger');
  const nav = document.getElementById('navLinks');
  if (burger && nav) {
    burger.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  // ===== HEADER SCROLL =====
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', scrollY > 20);
    }, { passive: true });
  }

  // ===== BACK TO TOP =====
  const toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', () => toTop.classList.toggle('visible', scrollY > 400), { passive: true });
    toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ===== REVEAL ON SCROLL =====
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // ===== SEARCH OVERLAY =====
  const searchBtn = document.getElementById('searchBtn');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchClose = document.getElementById('searchClose');

  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.add('open');
    setTimeout(() => searchInput && searchInput.focus(), 100);
  }
  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove('open');
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.innerHTML = '';
  }

  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  if (searchClose) searchClose.addEventListener('click', closeSearch);
  if (searchOverlay) {
    searchOverlay.addEventListener('click', e => {
      if (e.target === searchOverlay) closeSearch();
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearch();
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });

  if (searchInput && searchResults && window.ARTICLES) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (q.length < 2) {
        searchResults.innerHTML = '<div class="search-empty">Начните вводить для поиска...</div>';
        return;
      }
      const matches = window.ARTICLES.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(q))
      );
      if (matches.length === 0) {
        searchResults.innerHTML = '<div class="search-empty">Ничего не найдено</div>';
        return;
      }
      searchResults.innerHTML = matches.map(a => {
        const imgHtml = a.image
          ? `<img class="search-result__img" src="${a.image}" alt="${a.title}">`
          : `<div class="search-result__img" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem;">&#x1F33F;</div>`;
        return `
          <a href="article.html?id=${a.id}" class="search-result">
            ${imgHtml}
            <div class="search-result__info">
              <div class="search-result__cat">${a.category}</div>
              <div class="search-result__title">${a.title}</div>
            </div>
          </a>`;
      }).join('');
    });
  }

  // ===== BLOG FILTERS (main page) =====
  const filterBar = document.getElementById('filterBar');
  const articlesGrid = document.getElementById('articlesGrid');
  if (filterBar && articlesGrid && window.ARTICLES) {
    articlesGrid.innerHTML = window.ARTICLES.map(a => createArticleCard(a)).join('');
  }

  // ===== ARTICLE PAGE =====
  const page = document.getElementById('articlePage');
  if (page && window.ARTICLES) {
    const id = new URLSearchParams(location.search).get('id');
    const a = window.ARTICLES.find(x => x.id === id);
    if (a) {
      document.title = `${a.title} — Экошарм`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && a.excerpt) metaDesc.setAttribute('content', a.excerpt);

      const cover = a.image
        ? `<div class="cover"><img src="${a.image}" alt="${a.title}"></div>`
        : '';

      const hasSourceByline = a.content.includes('article-byline');
      const hasSourceTags = a.content.includes('article-source-tags');
      const authorBlock = hasSourceByline ? '' : `
        <div class="signature signature--author">
          <div class="signature__avatar">Т</div>
          <div>
            <div class="signature__name">Татьяна Соколова</div>
            <div class="signature__role">Кандидат биологических наук, доцент</div>
          </div>
        </div>`;
      const tagsBlock = hasSourceTags ? '' : `
        <div class="article-meta-tags">
          ${a.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>`;

      const related = window.ARTICLES.filter(x =>
        x.id !== a.id && x.category === a.category && x.type === 'article'
      ).slice(0, 2);
      const relHtml = related.length ? `
        <div class="related">
          <h3>Читайте также</h3>
          <div class="related__grid">${related.map(r => `
            <a href="article.html?id=${r.id}" class="related__item">
              <span class="card__cat">${r.category}</span>
              <div class="card__title">${r.title}</div>
            </a>`).join('')}
          </div>
        </div>` : '';

      page.innerHTML = `
        <div class="article-hero">
          <div class="container container--narrow">
            <a href="blog.html" class="back-link">&larr; Все статьи</a>
            <div class="article-hero__meta">
              <span class="article-hero__cat">${a.category}</span>
              <span>${a.date}</span>
            </div>
            <h1>${a.title}</h1>
          </div>
        </div>
        ${cover}
        <div class="container">
          <div class="article-layout">
            <div class="content">
              ${a.content}
              ${authorBlock}
              ${tagsBlock}
              <div class="article-conversation">
                <span class="article-conversation__eyebrow">Продолжить разговор</span>
                <h3>А что думаете вы?</h3>
                <p>Расскажите о своём опыте или задайте вопрос под публикациями Татьяны. Автор читает комментарии и отвечает лично.</p>
                <div class="article-conversation__actions">
                  <a href="${a.vkLink || 'https://vk.com/pautinkainfo'}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm">Читать и обсуждать в VK</a>
                  <a href="contact.html" class="article-conversation__link">Другие способы связи &rarr;</a>
                </div>
              </div>
              ${relHtml}
            </div>
            <aside class="toc" id="toc">
              <div class="toc__title">Содержание</div>
              <div class="toc__list" id="tocList"></div>
            </aside>
          </div>
        </div>`;

      // Build Table of Contents
      const contentEl = page.querySelector('.content');
      const tocList = document.getElementById('tocList');
      if (contentEl && tocList) {
        const headings = contentEl.querySelectorAll(':scope > h2, :scope > h3');
        if (headings.length > 0) {
          headings.forEach((h, i) => {
            if (!h.id) h.id = 'section-' + i;
            const link = document.createElement('a');
            link.className = 'toc__link' + (h.tagName === 'H3' ? ' toc__link--h3' : '');
            link.href = '#' + h.id;
            link.textContent = h.textContent;
            link.addEventListener('click', e => {
              e.preventDefault();
              h.scrollIntoView({ behavior: 'smooth' });
            });
            tocList.appendChild(link);
          });

          // Highlight active TOC item on scroll
          const tocLinks = tocList.querySelectorAll('.toc__link');
          const tocObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const id = entry.target.id;
                tocLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
              }
            });
          }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });
          headings.forEach(h => tocObs.observe(h));
        } else {
          // No headings found — hide TOC
          const toc = document.getElementById('toc');
          if (toc) toc.style.display = 'none';
        }
      }

    } else {
      page.innerHTML = `
        <div class="container container--narrow" style="padding:4rem 0;text-align:center;">
          <h2>Статья не найдена</h2>
          <p style="color:var(--stone);margin:1rem 0 2rem;">Возможно, статья была перемещена или удалена.</p>
          <a href="blog.html" class="btn btn--primary">Вернуться в блог</a>
        </div>`;
    }
  }

  // ===== CONTACT FORM =====
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = fd.get('name'), msg = fd.get('message');
      if (!name || !msg) { alert('Пожалуйста, заполните имя и сообщение.'); return; }
      const subj = encodeURIComponent(`Экошарм: ${fd.get('topic') || 'Вопрос'}`);
      const body = encodeURIComponent(`Имя: ${name}\n\nТема: ${fd.get('topic')}\n\nСообщение:\n${msg}`);
      location.href = `mailto:tvoyuspeh@yahoo.com?subject=${subj}&body=${body}`;
      form.innerHTML = `
        <div style="text-align:center;padding:2rem;">
          <div style="font-size:2.5rem;margin-bottom:0.8rem;">&#x2705;</div>
          <h3 style="margin-bottom:0.4rem;">Сообщение готово!</h3>
          <p style="color:var(--stone);">Откроется почтовый клиент. Или напишите на <strong>tvoyuspeh@yahoo.com</strong></p>
        </div>`;
    });
  }

  // ===== ARTICLE INSIGHTS CAROUSEL =====
  const insightCarousel = document.getElementById('insightCarousel');
  const insightSlide = document.getElementById('insightSlide');
  const insightText = document.getElementById('insightText');
  const insightSource = document.getElementById('insightSource');
  const insightDots = document.getElementById('insightDots');
  const insightPrev = document.getElementById('insightPrev');
  const insightNext = document.getElementById('insightNext');
  if (insightCarousel && insightSlide && insightText && insightSource) {
    const insights = [
      {
        text: 'Вся промышленная косметика просто-напросто целиком из нефти состоит. Не добавки из нефти — а сама нефть, прошедшая через нефтехимическую промышленность.',
        source: '«Как связаны крем и нефть?»',
        href: 'article.html?id=cream-and-oil'
      },
      {
        text: 'Крепкие подошвы — не дефект, а эволюционное приспособление. Но трещины на пятках — это ворота для инфекции, и с ними нужно бороться.',
        source: '«Твёрдые стопы — это подарок эволюции»',
        href: 'article.html?id=solid-feet'
      },
      {
        text: 'Если в креме есть продукты пчеловодства — прополис, воск или мёд, — то там вполне могут быть и фрагменты пчёл. Это изнанка натуральности.',
        source: '«Чьи ноги торчат из крема для ног?»',
        href: 'article.html?id=bee-leg-cream'
      },
      {
        text: 'Не обижайтесь, друзья, но если это не ваша проблема, то, значит, это проблема окружающих!',
        source: '«Мёртвые не потеют»',
        href: 'article.html?id=dead-dont-sweat'
      }
    ];
    let insightIndex = 0;
    let insightTimer;
    let wheelLocked = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (insightDots) {
      insightDots.innerHTML = insights.map((_, i) =>
        `<button type="button" class="${i === 0 ? 'active' : ''}" aria-label="Показать цитату ${i + 1}"></button>`
      ).join('');
    }

    const stopInsightTimer = () => clearInterval(insightTimer);
    const startInsightTimer = () => {
      stopInsightTimer();
      if (!reducedMotion) insightTimer = setInterval(() => showInsight(insightIndex + 1), 7200);
    };
    const showInsight = nextIndex => {
      insightIndex = (nextIndex + insights.length) % insights.length;
      insightSlide.classList.add('is-changing');
      setTimeout(() => {
        const item = insights[insightIndex];
        insightText.textContent = item.text;
        insightSource.textContent = item.source;
        insightSource.href = item.href;
        insightSlide.classList.remove('is-changing');
        if (insightDots) insightDots.querySelectorAll('button').forEach((dot, i) => dot.classList.toggle('active', i === insightIndex));
      }, reducedMotion ? 0 : 180);
      startInsightTimer();
    };

    insightPrev?.addEventListener('click', () => showInsight(insightIndex - 1));
    insightNext?.addEventListener('click', () => showInsight(insightIndex + 1));
    insightDots?.querySelectorAll('button').forEach((dot, i) => dot.addEventListener('click', () => showInsight(i)));
    insightCarousel.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); showInsight(insightIndex - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); showInsight(insightIndex + 1); }
    });
    insightCarousel.addEventListener('wheel', e => {
      if (Math.abs(e.deltaY) < 8 && Math.abs(e.deltaX) < 8) return;
      e.preventDefault();
      if (wheelLocked) return;
      wheelLocked = true;
      showInsight(insightIndex + (e.deltaY > 0 || e.deltaX > 0 ? 1 : -1));
      setTimeout(() => { wheelLocked = false; }, 650);
    }, { passive: false });
    insightCarousel.addEventListener('mouseenter', stopInsightTimer);
    insightCarousel.addEventListener('mouseleave', startInsightTimer);
    insightCarousel.addEventListener('focusin', stopInsightTimer);
    insightCarousel.addEventListener('focusout', startInsightTimer);
    startInsightTimer();
  }

  // ===== ROTATING QUOTES =====
  const quote = document.getElementById('rotatingQuote');
  const quoteAuthor = document.getElementById('rotatingQuoteAuthor');
  const quoteDots = document.getElementById('quoteDots');
  if (quote && quoteAuthor) {
    const quotes = [
      {
        text: '«Целый день в жару клеил обои в душном помещении. Тем не менее, дезодорант работал 16 часов! Вплоть до вечернего душа.»',
        author: '— Дмитрий, о дезодоранте «Грейпфрут-Шалфей»'
      },
      {
        text: '«У вас получился отличный продукт: всё устраивает — и запах, и текстура, и рабочий момент. Спасибо за ваше трудолюбие.»',
        author: '— Лидия Т., после двух недель использования'
      }
    ];
    let quoteIndex = 0;
    if (quoteDots) {
      quoteDots.innerHTML = quotes.map((_, i) => `<span class="${i === 0 ? 'active' : ''}"></span>`).join('');
    }
    const showQuote = index => {
      quote.classList.add('is-changing');
      quoteAuthor.classList.add('is-changing');
      setTimeout(() => {
        quote.textContent = quotes[index].text;
        quoteAuthor.textContent = quotes[index].author;
        quote.classList.remove('is-changing');
        quoteAuthor.classList.remove('is-changing');
        if (quoteDots) quoteDots.querySelectorAll('span').forEach((dot, i) => dot.classList.toggle('active', i === index));
      }, 220);
    };
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInterval(() => {
        quoteIndex = (quoteIndex + 1) % quotes.length;
        showQuote(quoteIndex);
      }, 6500);
    }
  }

});
