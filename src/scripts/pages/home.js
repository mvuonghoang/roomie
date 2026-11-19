/**
 * Page: Home (/roomie)
 * Xử lý chuyển động hero, đếm số liệu, hiệu ứng scroll editorial, tìm kiếm nhanh, lưu phòng & gói dịch vụ.
 */
(function () {
  const Data = window.RoomieData || {};
  const Core = window.RoomieCore || {};

  function initHeroCursorMotion() {
    const hero = document.getElementById("hero-stage");
    const centerpiece = document.getElementById("hero-centerpiece");
    if (!hero || !centerpiece) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (prefersReduced || !finePointer) return;

    const displayWord = document.getElementById("hero-display-text");
    const leftCard = document.getElementById("hero-left-card");
    const floatingCard = document.getElementById("hero-floating-card");
    const spotlight = document.getElementById("hero-spotlight");

    let targetX = 0;
    let targetY = 0;
    let targetActive = 0;
    let currentX = 0;
    let currentY = 0;
    let currentActive = 0;
    let rafId = null;
    let lastTime = 0;

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    function render(now) {
      if (!lastTime) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const ease = 1 - Math.exp(-8.5 * dt);
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      currentActive += (targetActive - currentActive) * ease;

      const tx = currentX * 28;
      const ty = currentY * 18;
      const rotY = currentX * 7.5;
      const rotX = -currentY * 5.5;
      const scale = 1 + currentActive * 0.018;

      centerpiece.style.transform =
        `perspective(1200px) translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) ` +
        `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(4)})`;

      if (displayWord) {
        displayWord.style.transform = `translate3d(${(currentX * -12).toFixed(2)}px, ${(currentY * -8).toFixed(2)}px, 0)`;
      }
      if (leftCard) {
        leftCard.style.transform = `translate3d(${(currentX * 8).toFixed(2)}px, ${(currentY * 6).toFixed(2)}px, 0)`;
      }
      if (floatingCard) {
        floatingCard.style.transform = `translate3d(${(currentX * 8).toFixed(2)}px, ${(currentY * 6).toFixed(2)}px, 0)`;
      }
      if (spotlight) {
        spotlight.style.transform = `translate3d(calc(-50% + ${(currentX * 36).toFixed(2)}px), calc(-25% + ${(currentY * 24).toFixed(2)}px), 0)`;
      }

      const settled =
        Math.abs(targetX - currentX) < 0.0008 &&
        Math.abs(targetY - currentY) < 0.0008 &&
        Math.abs(targetActive - currentActive) < 0.0008;

      if (settled) {
        rafId = null;
        lastTime = 0;
      } else {
        rafId = requestAnimationFrame(render);
      }
    }

    function ensureLoop() {
      if (!rafId) {
        lastTime = 0;
        rafId = requestAnimationFrame(render);
      }
    }

    window.addEventListener(
      "mousemove",
      (e) => {
        const rect = hero.getBoundingClientRect();
        if (rect.bottom <= 0 || e.clientY > rect.bottom + 80) {
          if (targetX !== 0 || targetY !== 0 || targetActive !== 0) {
            targetX = 0;
            targetY = 0;
            targetActive = 0;
            ensureLoop();
          }
          return;
        }
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        targetX = clamp((e.clientX - cx) / (rect.width * 0.5), -1, 1);
        targetY = clamp((e.clientY - cy) / (rect.height * 0.5), -1, 1);
        targetActive = 1;
        ensureLoop();
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", () => {
      targetX = 0;
      targetY = 0;
      targetActive = 0;
      ensureLoop();
    });
  }

  function initHeroStatCounters() {
    const counters = Array.from(document.querySelectorAll("[data-count-target]"));
    if (!counters.length) return;

    const formatStat = (val, el) => {
      const prefix = el.dataset.countPrefix || "";
      const suffix = el.dataset.countSuffix || "";
      const numStr = el.dataset.countLocale === "vi" ? val.toLocaleString("vi-VN") : String(val);
      return `${prefix}${numStr}${suffix}`;
    };

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      counters.forEach((el) => {
        el.textContent = formatStat(Number(el.dataset.countTarget) || 0, el);
      });
      return;
    }

    counters.forEach((el) => {
      el.textContent = formatStat(0, el);
    });

    const animateCounter = (el) => {
      if (el.dataset.countDone === "1") return;
      el.dataset.countDone = "1";

      const target = Number(el.dataset.countTarget) || 0;
      const duration = 800;
      const startTime = performance.now();

      const step = (now) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = formatStat(Math.round(target * eased), el);
        if (progress < 1) window.requestAnimationFrame(step);
        else el.textContent = formatStat(target, el);
      };
      window.requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      counters.forEach((el) => observer.observe(el));
    } else {
      counters.forEach(animateCounter);
    }
  }

  function createGraphemeSplitter() {
    if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
      const segmenter = new Intl.Segmenter("vi", { granularity: "grapheme" });
      return (word) => Array.from(segmenter.segment(word), (s) => s.segment);
    }
    return (word) => Array.from(word);
  }

  function splitElementIntoScrollChars(rootEl, options = {}) {
    if (!rootEl) return { chars: [], words: [] };
    if (rootEl.dataset.rmSplit === "1") {
      return {
        chars: Array.from(rootEl.querySelectorAll(".rm-scroll-char")),
        words: Array.from(rootEl.querySelectorAll(".rm-scroll-word"))
      };
    }

    const wrapWords = options.wrapWords !== false;
    const splitGraphemes = createGraphemeSplitter();
    const chars = [];
    const words = [];

    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue || "";
        if (!text.trim()) return;
        const frag = document.createDocumentFragment();
        text.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
            return;
          }
          const targetParent = wrapWords ? document.createElement("span") : frag;
          if (wrapWords) {
            targetParent.className = "rm-scroll-word";
            words.push(targetParent);
          }
          splitGraphemes(part).forEach((g) => {
            const chSpan = document.createElement("span");
            chSpan.className = "rm-scroll-char";
            chSpan.textContent = g;
            chars.push(chSpan);
            targetParent.appendChild(chSpan);
          });
          if (wrapWords) frag.appendChild(targetParent);
        });
        node.parentNode.replaceChild(frag, node);
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList.contains("material-symbols-outlined")) return;
        if (node.getAttribute("aria-hidden") === "true" && node.tagName === "svg") return;
        Array.from(node.childNodes).forEach(walk);
      }
    };

    walk(rootEl);
    rootEl.dataset.rmSplit = "1";
    return { chars, words };
  }

  function applyCharOpacityWave(chars, progress, baseOpacity, windowWidth) {
    const count = chars.length;
    if (!count) return;
    if (progress >= 0.999) {
      chars.forEach((ch) => {
        if (ch.style.opacity !== "") ch.style.opacity = "";
      });
      return;
    }

    const spanWin = count <= 1 ? 1 : Math.max(0.18, windowWidth);
    const travel = Math.max(0.001, 1 - spanWin);
    for (let i = 0; i < count; i += 1) {
      const start = count <= 1 ? 0 : (i / (count - 1)) * travel;
      const local = Math.min(1, Math.max(0, (progress - start) / spanWin));
      const eased = 1 - Math.pow(1 - local, 2);
      chars[i].style.opacity = (baseOpacity + (1 - baseOpacity) * eased).toFixed(3);
    }
  }

  function applyWordRise(words, progress, startY, windowWidth) {
    const count = words.length;
    if (!count) return;
    if (progress >= 0.999) {
      words.forEach((w) => {
        if (w.style.transform !== "") w.style.transform = "";
      });
      return;
    }

    const spanWin = count <= 1 ? 1 : Math.max(0.28, windowWidth);
    const travel = Math.max(0.001, 1 - spanWin);
    for (let i = 0; i < count; i += 1) {
      const start = count <= 1 ? 0 : (i / (count - 1)) * travel;
      const local = Math.min(1, Math.max(0, (progress - start) / spanWin));
      const eased = 1 - Math.pow(1 - local, 3);
      words[i].style.transform = `translate3d(0, ${(startY * (1 - eased)).toFixed(2)}px, 0)`;
    }
  }

  function createTextTrack(el, cfg) {
    if (!el) return null;
    const { chars, words } = splitElementIntoScrollChars(el, { wrapWords: cfg.wrapWords !== false });
    if (!chars.length) return null;
    return {
      chars,
      words,
      riseEl: cfg.riseEl || null,
      delay: cfg.delay ?? 0,
      span: cfg.span ?? 0.65,
      baseOpacity: cfg.baseOpacity ?? 0.14,
      windowWidth: cfg.windowWidth ?? 0.3,
      startY: cfg.startY ?? 9
    };
  }

  function buildFeaturedRoomsTracks(section) {
    const units = [];
    const header = document.getElementById("featured-rooms-header");
    if (header) {
      const h2 = header.querySelector("h2");
      const ctaText = header.querySelector("a > span:not(.material-symbols-outlined)");
      const ctaLink = header.querySelector("a[data-path]");
      units.push({
        anchorEl: header,
        startVh: 0.94,
        endVh: 0.44,
        delay: 0,
        tracks: [
          createTextTrack(h2, { delay: 0, span: 0.72, baseOpacity: 0.14, startY: 11, windowWidth: 0.34 }),
          createTextTrack(ctaText, { wrapWords: false, riseEl: ctaLink, delay: 0.28, span: 0.62, baseOpacity: 0.18, startY: 7, windowWidth: 0.32 })
        ].filter(Boolean),
        fades: []
      });
    }

    Array.from(section.querySelectorAll("article")).forEach((card, idx) => {
      const locSpan = card.querySelector(".text-tertiary > span:not(.material-symbols-outlined)");
      const h3 = card.querySelector("h3");
      const specText = card.querySelector("p > span.truncate");
      const specRow = specText ? specText.parentElement : null;
      const priceVal = card.querySelector(".font-currency-md");
      const priceUnit = priceVal ? priceVal.nextElementSibling : null;
      const priceRow = priceVal ? priceVal.parentElement : null;
      const pills = Array.from(card.querySelectorAll(".absolute.top-3\\.5.left-3\\.5 > span"));

      units.push({
        anchorEl: card,
        cardEl: card,
        cardIdx: idx,
        startVh: 0.96,
        endVh: 0.48,
        tracks: [
          createTextTrack(locSpan, { delay: 0.06, span: 0.56, baseOpacity: 0.16, startY: 7, windowWidth: 0.3 }),
          createTextTrack(h3, { wrapWords: false, riseEl: h3, delay: 0.14, span: 0.62, baseOpacity: 0.14, startY: 8, windowWidth: 0.32 }),
          createTextTrack(specText, { wrapWords: false, riseEl: specRow, delay: 0.24, span: 0.62, baseOpacity: 0.16, startY: 7, windowWidth: 0.3 }),
          createTextTrack(priceVal, { wrapWords: false, riseEl: priceRow, delay: 0.34, span: 0.52, baseOpacity: 0.16, startY: 6, windowWidth: 0.28 }),
          createTextTrack(priceUnit, { wrapWords: false, delay: 0.44, span: 0.46, baseOpacity: 0.18, windowWidth: 0.28 })
        ].filter(Boolean),
        fades: pills.map((p, pIdx) => ({ el: p, delay: 0.1 + pIdx * 0.08, span: 0.48, baseOpacity: 0.35, startY: 5 }))
      });
    });

    return units;
  }

  function buildRoommateMatchesTracks(section) {
    const units = [];
    const inner = section.querySelector(":scope > div");
    const header = inner ? inner.firstElementChild : null;
    if (header) {
      const h2 = header.querySelector("h2");
      const subtitle = header.querySelector("p");
      const ctaText = header.querySelector("a > span:not(.material-symbols-outlined)");
      const ctaLink = header.querySelector("a[data-path]");
      units.push({
        anchorEl: header,
        startVh: 0.94,
        endVh: 0.44,
        delay: 0,
        tracks: [
          createTextTrack(h2, { delay: 0, span: 0.68, baseOpacity: 0.14, startY: 11, windowWidth: 0.34 }),
          createTextTrack(subtitle, { delay: 0.14, span: 0.72, baseOpacity: 0.16, startY: 8, windowWidth: 0.3 }),
          createTextTrack(ctaText, { wrapWords: false, riseEl: ctaLink, delay: 0.28, span: 0.62, baseOpacity: 0.18, startY: 7, windowWidth: 0.32 })
        ].filter(Boolean),
        fades: []
      });
    }

    const cardUnits = [];
    Array.from(section.querySelectorAll(".grid > div")).forEach((card, idx) => {
      const nameEl = card.querySelector("h3");
      const uniEl = card.querySelector("h3 + span");
      const bioEl = card.querySelector("p");
      const chips = Array.from(card.querySelectorAll(".flex-wrap > span"));
      const badgeCol = card.querySelector(".flex.flex-col.items-end.gap-1\\.5");
      const actionWrap = card.querySelector(".pt-1");

      const unit = {
        anchorEl: card,
        cardEl: card,
        cardIdx: idx,
        startVh: 0.96,
        endVh: 0.48,
        tracks: [
          createTextTrack(nameEl, { wrapWords: false, riseEl: nameEl, delay: 0.08, span: 0.56, baseOpacity: 0.14, startY: 8, windowWidth: 0.34 }),
          createTextTrack(uniEl, { wrapWords: false, riseEl: uniEl, delay: 0.16, span: 0.56, baseOpacity: 0.16, startY: 6, windowWidth: 0.3 }),
          createTextTrack(bioEl, { delay: 0.22, span: 0.64, baseOpacity: 0.15, startY: 8, windowWidth: 0.32 }),
          ...chips.map((chip, cIdx) =>
            createTextTrack(chip, { wrapWords: false, riseEl: chip, delay: 0.36 + cIdx * 0.08, span: 0.48, baseOpacity: 0.18, startY: 6, windowWidth: 0.3 })
          )
        ].filter(Boolean),
        fades: [
          badgeCol ? { el: badgeCol, delay: 0.14, span: 0.5, baseOpacity: 0.32, startY: 6 } : null,
          actionWrap ? { el: actionWrap, delay: 0.42, span: 0.5, baseOpacity: 0.42, startY: 8 } : null
        ].filter(Boolean)
      };
      cardUnits.push(unit);
      units.push(unit);
    });

    const banner = inner ? inner.lastElementChild : null;
    if (banner && banner.contains(banner.querySelector(".material-symbols-outlined"))) {
      const bannerText = banner.querySelector("span:not(.material-symbols-outlined)");
      units.push({
        anchorEl: banner,
        startVh: 0.99,
        endVh: 0.84,
        companionUnits: cardUnits,
        tracks: [
          createTextTrack(bannerText, { delay: 0.05, span: 0.85, baseOpacity: 0.16, startY: 6, windowWidth: 0.32 })
        ].filter(Boolean),
        fades: []
      });
    }

    return units;
  }

  function initEditorialSectionsScrollReveal() {
    const featuredSection = document.getElementById("featured-rooms");
    const roommateSection = document.getElementById("roommate-matches");
    if (!featuredSection && !roommateSection) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const units = [
      ...(featuredSection ? buildFeaturedRoomsTracks(featuredSection) : []),
      ...(roommateSection ? buildRoommateMatchesTracks(roommateSection) : [])
    ];
    if (!units.length) return;

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const getColumns = () => {
      const w = window.innerWidth || 1280;
      return w >= 1024 ? 4 : w >= 768 ? 2 : 1;
    };

    const computeRawTarget = (unit, vh, cols) => {
      const rect = unit.anchorEl.getBoundingClientRect();
      const startY = vh * unit.startVh;
      const endY = vh * unit.endVh;
      const raw = clamp((startY - rect.top) / Math.max(1, startY - endY), 0, 1);
      const colStagger = typeof unit.cardIdx === "number" && cols > 1 ? (unit.cardIdx % cols) * 0.055 : 0;
      let progress = colStagger > 0 ? clamp((raw - colStagger) / (1 - colStagger), 0, 1) : raw;

      if (unit.companionUnits?.length && rect.top < vh * 0.99) {
        const lastCardsReady = unit.companionUnits.reduce((acc, cu) => Math.min(acc, cu.target), 1);
        if (lastCardsReady > progress) {
          progress = Math.max(progress, clamp((lastCardsReady - 0.6) / 0.4, 0, 1));
        }
      }
      return progress;
    };

    const vhInit = window.innerHeight || 800;
    const colsInit = getColumns();
    units.forEach((u) => {
      u.target = computeRawTarget(u, vhInit, colsInit);
      u.current = u.target;
    });
    units.forEach((u) => {
      if (u.companionUnits) {
        u.target = computeRawTarget(u, vhInit, colsInit);
        u.current = u.target;
      }
    });

    const applyUnit = (u) => {
      const p = u.current;
      if (u.cardEl) {
        if (p >= 0.999) {
          if (u.cardEl.style.opacity !== "") u.cardEl.style.opacity = "";
          if (u.cardEl.style.transform !== "") u.cardEl.style.transform = "";
          if (u.cardEl.style.transitionProperty !== "") u.cardEl.style.transitionProperty = "";
        } else {
          const cardLift = easeOutCubic(clamp(p / 0.55, 0, 1));
          const cardOp = 0.58 + 0.42 * easeOutCubic(clamp(p / 0.45, 0, 1));
          u.cardEl.style.transitionProperty = "box-shadow";
          u.cardEl.style.opacity = cardOp.toFixed(3);
          u.cardEl.style.transform = `translate3d(0, ${(20 * (1 - cardLift)).toFixed(2)}px, 0)`;
        }
      }

      u.tracks.forEach((t) => {
        const local = clamp((p - t.delay) / t.span, 0, 1);
        applyCharOpacityWave(t.chars, local, t.baseOpacity, t.windowWidth);
        applyWordRise(t.words, local, t.startY, 0.42);
        if (t.riseEl) {
          if (local >= 0.999) {
            if (t.riseEl.style.transform !== "") t.riseEl.style.transform = "";
          } else {
            const ry = t.startY * (1 - easeOutCubic(local));
            t.riseEl.style.transform = `translate3d(0, ${ry.toFixed(2)}px, 0)`;
          }
        }
      });

      u.fades.forEach((f) => {
        const local = clamp((p - f.delay) / f.span, 0, 1);
        if (local >= 0.999) {
          if (f.el.style.opacity !== "") f.el.style.opacity = "";
          if (f.el.style.transform !== "") f.el.style.transform = "";
        } else {
          const eased = easeOutCubic(local);
          f.el.style.opacity = (f.baseOpacity + (1 - f.baseOpacity) * eased).toFixed(3);
          f.el.style.transform = `translate3d(0, ${(f.startY * (1 - eased)).toFixed(2)}px, 0)`;
        }
      });
    };

    let rafId = null;
    const tick = () => {
      let moving = false;
      units.forEach((u) => {
        const diff = u.target - u.current;
        if (Math.abs(diff) < 0.0012) {
          if (u.current !== u.target) {
            u.current = u.target;
            applyUnit(u);
          }
        } else {
          u.current += diff * 0.22;
          applyUnit(u);
          moving = true;
        }
      });
      rafId = moving ? window.requestAnimationFrame(tick) : null;
    };

    const scheduleUpdate = () => {
      const vh = window.innerHeight || 800;
      const cols = getColumns();
      units.forEach((u) => {
        u.target = computeRawTarget(u, vh, cols);
      });
      if (!rafId) rafId = window.requestAnimationFrame(tick);
    };

    units.forEach(applyUnit);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
  }

  function initHomePage() {
    initHeroCursorMotion();
    initHeroStatCounters();
    initEditorialSectionsScrollReveal();

    const form = document.querySelector("main form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const loc = document.getElementById("search-location")?.value || "";
        const budget = document.getElementById("search-budget")?.value || "";
        const type = document.getElementById("search-type")?.value || "";
        const params = new URLSearchParams();
        if (loc) params.set("area", loc);
        if (budget) params.set("budget", budget);
        if (type) params.set("type", type);
        window.location.href = `/roomie/tim-phong?${params.toString()}`;
      });
    }

    const saved = Core.getSavedRoomIds();
    document.querySelectorAll("main article").forEach((article, idx) => {
      const roomId = String(idx + 1);
      const btn = article.querySelector('button[aria-label="Lưu bài"]');
      if (btn) {
        const icon = btn.querySelector(".material-symbols-outlined");
        if (saved.includes(roomId) && icon) {
          icon.style.fontVariationSettings = "'FILL' 1";
          btn.classList.add("text-error");
        }
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const nowSaved = Core.toggleSavedRoom(roomId);
          if (icon) {
            icon.style.fontVariationSettings = nowSaved ? "'FILL' 1" : "'FILL' 0";
            btn.classList.toggle("text-error", nowSaved);
          }
          Core.showToast(nowSaved ? "Đã lưu phòng vào danh sách yêu thích!" : "Đã bỏ lưu phòng.", nowSaved ? "success" : "info");
        });
      }

      const link = article.querySelector("a[data-path]");
      if (link) {
        const targetHref = link.getAttribute("href");
        [article.querySelector("img"), article.querySelector("h3")].forEach((el) => {
          if (el && targetHref) {
            el.classList.add("cursor-pointer");
            el.addEventListener("click", () => {
              window.location.href = targetHref;
            });
          }
        });
      }
    });

    const homeRoommateMap = ["minh-anh", "quoc-bao", "thao-vy", "gia-huy"];
    Array.from(document.querySelectorAll("main button"))
      .filter((b) => b.textContent.trim() === "Xem hồ sơ")
      .forEach((btn, idx) => {
        const rm = (Data.ROOMMATES || []).find((r) => r.id === homeRoommateMap[idx]);
        if (rm) btn.addEventListener("click", () => Core.openProfileModal(rm));
      });

    const servicesSection = document.getElementById("services-preview");
    if (servicesSection && window.RoomiePricingWidget) {
      window.RoomiePricingWidget.initBillingWidget({
        toggleContainer: servicesSection.querySelector("#service-billing-toggle"),
        priceSelector: "#services-preview .plan-price",
        ctaButtons: Array.from(servicesSection.querySelectorAll(".plan-select-btn[data-plan-id]")),
        pkgAttr: "planId",
        activeToggleClasses: ["bg-white", "text-on-surface", "shadow-xs", "font-semibold"],
        inactiveToggleClasses: ["text-on-surface-variant", "hover:text-on-surface", "font-medium"],
        formatCtaLabel: (isActive, _pkg, defLabel) => (isActive ? "✓ Đã kích hoạt" : defLabel)
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "home") initHomePage();
  });
})();
