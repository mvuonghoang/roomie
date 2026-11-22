/**
 * Roomie Shared Layout Component (Header & Footer)
 * Render Header & Footer thống nhất trên mọi trang từ Data.NAV_ITEMS, Data.FOOTER_COLUMNS và Data.CONTACT_INFO.
 */
(function () {
  const Data = window.RoomieData || {};
  const Core = window.RoomieCore || {};

  const escapeHTML = Core.escapeHTML || ((v) => String(v || ""));
  const CONTACT = Data.CONTACT_INFO || {
    brandName: "Roomie",
    slogan: "Tìm đúng phòng - Ghép đúng người — Sống chung bình yên",
    badge: "Gen Z Housing",
    copyrightYear: "2026"
  };

  const ROUTE_TO_NAV_KEY = {
    "/": "trang-chu",
    "/index.html": "trang-chu",
    "/trang-chu": "trang-chu",
    "/tim-phong": "tim-phong",
    "/pages/tim-phong.html": "tim-phong",
    "/khu-vuc-lang-dai-hoc": "tim-phong",
    "/phong-chi-tiet": "tim-phong",
    "/pages/phong-chi-tiet.html": "tim-phong",
    "/tim-roommate": "tim-roommate",
    "/pages/tim-roommate.html": "tim-roommate",
    "/ket-qua-match": "tim-roommate",
    "/trac-nghiem": "trac-nghiem-hop-gu",
    "/pages/trac-nghiem.html": "trac-nghiem-hop-gu",
    "/trac-nghiem-hop-gu": "trac-nghiem-hop-gu",
    "/trac-nghiem-tinh-cach": "trac-nghiem-hop-gu",
    "/bang-gia": "dich-vu",
    "/pages/bang-gia.html": "dich-vu",
    "/dich-vu": "dich-vu",
    "/ve-chung-toi": "ve-chung-toi",
    "/pages/ve-chung-toi.html": "ve-chung-toi",
    "/lien-he": "lien-he",
    "/pages/lien-he.html": "lien-he",
    "/dang-tin": "dang-tin",
    "/dang-tin-mien-phi": "dang-tin",
    "/tin-da-dang": "dang-tin",
    "/pages/dang-tin.html": "dang-tin",
    "/an-toan": "ve-chung-toi",
    "/pages/an-toan.html": "ve-chung-toi"
  };

  /** Build right-side header action pill content depending on authentication state. */
  function buildHeaderRightInnerHtml() {
    const loggedIn = Core.isLoggedIn ? Core.isLoggedIn() : true;
    const profile = (Core.getCurrentUser ? Core.getCurrentUser() : Data.USER_PROFILE) || {};
    const avatarUrl = profile.avatar || "/assets/images/common/avatar-profile.jpg";
    const profileName = profile.name || "Minh Thư";
    const shortSchool = profile.shortSchool || "HCMUS";

    if (!loggedIn) {
      return `
        <a class="hidden sm:inline-flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-full bg-secondary-container/80 text-on-secondary-container hover:bg-primary hover:text-on-primary font-label-md text-[12.5px] xl:text-[13px] font-semibold transition-all whitespace-nowrap" data-path="dang-tin" href="/roomie/dang-tin">
          <span class="material-symbols-outlined text-[15px] xl:text-[16px]">add_circle</span>
          <span>Đăng tin</span>
        </a>
        <button id="rm-header-login-btn" type="button" class="px-3 xl:px-3.5 py-1.5 rounded-full text-on-surface hover:bg-surface-container-low font-label-md text-[12.5px] xl:text-[13px] font-semibold transition-colors whitespace-nowrap">
          Đăng nhập
        </button>
        <button id="rm-header-signup-btn" type="button" class="px-3 xl:px-3.5 py-1.5 rounded-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md text-[12.5px] xl:text-[13px] font-semibold shadow-xs transition-colors whitespace-nowrap">
          Đăng ký
        </button>
      `.trim();
    }

    return `
        <a class="hidden sm:inline-flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-full bg-secondary-container/80 text-on-secondary-container hover:bg-primary hover:text-on-primary font-label-md text-[12.5px] xl:text-[13px] font-semibold transition-all whitespace-nowrap" data-path="dang-tin" href="/roomie/dang-tin">
          <span class="material-symbols-outlined text-[15px] xl:text-[16px]">add_circle</span>
          <span>Đăng tin</span>
        </a>
        <button aria-label="Thông báo" class="w-8 h-8 xl:w-9 xl:h-9 rounded-full text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors relative flex items-center justify-center" type="button">
          <span class="material-symbols-outlined text-[19px] xl:text-[20px]">notifications</span>
          <span class="absolute top-1.5 right-1.5 xl:top-2 xl:right-2 w-2 h-2 rounded-full bg-primary"></span>
        </button>
        <button aria-label="Kết nối" title="Quản lý kết nối 2 chiều &amp; Slot liên hệ" class="w-8 h-8 xl:w-9 xl:h-9 rounded-full text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors relative flex items-center justify-center" type="button">
          <span class="material-symbols-outlined text-[19px] xl:text-[20px]">handshake</span>
          <span id="rm-header-slot-badge" class="hidden absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-secondary-container text-on-secondary-fixed text-[10px] font-bold leading-4 text-center"></span>
        </button>
        <div class="flex items-center pl-0.5">
          <div id="rm-profile-trigger" class="relative flex items-center gap-1.5 p-0.5 pr-0.5 xl:pr-2.5 rounded-full hover:bg-surface-container-low/80 transition-colors cursor-pointer">
            <img alt="Ảnh đại diện ${escapeHTML(profileName)}" class="w-7 h-7 xl:w-8 xl:h-8 rounded-full object-cover ring-2 ring-secondary-container" src="${escapeHTML(avatarUrl)}" />
            <span class="hidden xl:inline-flex items-center text-tertiary font-label-sm text-label-sm font-bold">${escapeHTML(shortSchool)}</span>
          </div>
        </div>
    `.trim();
  }

  /** Build canonical Header markup matching Roomie architectural pill navbar. */
  function buildHeaderHtml() {
    const navItems = Array.isArray(Data.NAV_ITEMS) ? Data.NAV_ITEMS : [];
    const logoUrl = Data.LOGO_URL || "/assets/images/common/logo.png";

    const navLinksHtml = navItems
      .map(
        (item) =>
          `<a class="px-2 xl:px-3 py-1.5 rounded-full font-label-md text-[12.5px] xl:text-[13px] text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/70 transition-all whitespace-nowrap" data-path="${escapeHTML(
            item.key
          )}" href="${escapeHTML(item.href)}">${escapeHTML(item.label)}</a>`
      )
      .join("\n        ");

    return `
  <header class="fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-300">
    <div class="h-20 max-w-[1280px] mx-auto px-margin md:px-margin-md lg:px-6 xl:px-margin-lg flex items-center justify-between gap-2 xl:gap-space-sm">
      <a id="rm-brand-pill" class="pointer-events-auto flex items-center shrink-0" data-path="trang-chu" href="/roomie">
        <img alt="Logo ${escapeHTML(CONTACT.brandName)}" class="h-8 xl:h-9 w-auto object-contain" src="${escapeHTML(logoUrl)}" />
      </a>

      <nav aria-label="Điều hướng chính" class="pointer-events-auto hidden lg:flex items-center gap-0.5 p-1 xl:p-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_8px_24px_-6px_rgba(24,28,35,0.08)] border border-outline-variant/25" data-active-classes="bg-primary text-on-primary rounded-full font-semibold shadow-sm">
        ${navLinksHtml}
      </nav>

      <div id="rm-header-actions" class="pointer-events-auto flex items-center gap-0.5 xl:gap-1 p-1 xl:p-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_8px_24px_-6px_rgba(24,28,35,0.08)] border border-outline-variant/25 shrink-0">
        ${buildHeaderRightInnerHtml()}
      </div>
    </div>
  </header>`.trim();
  }

  /** Build canonical Footer markup shared across all pages. */
  function buildFooterHtml() {
    const columns = Array.isArray(Data.FOOTER_COLUMNS) ? Data.FOOTER_COLUMNS : [];
    const logoUrl = Data.FOOTER_LOGO_URL || Data.LOGO_URL || "/assets/images/common/logo.png";

    const columnsHtml = columns
      .map(
        (col) => `
        <div class="flex flex-col gap-space-sm">
          <span class="font-label-md text-label-md text-on-surface uppercase tracking-wider font-semibold">${escapeHTML(col.title)}</span>
          <ul class="flex flex-col gap-space-xs font-body-md text-body-md text-on-surface-variant">
            ${(col.links || [])
              .map(
                (l) =>
                  `<li class="hover:text-primary transition-colors"><a data-path="${escapeHTML(l.key)}" href="${escapeHTML(
                    l.href
                  )}">${escapeHTML(l.label)}</a></li>`
              )
              .join("\n            ")}
          </ul>
        </div>`
      )
      .join("\n");

    return `
  <footer class="w-full bg-surface-container-low mt-space-2xl">
    <div class="max-w-[1280px] mx-auto px-margin md:px-margin-md lg:px-margin-lg pt-space-2xl pb-space-xl">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gutter-lg">
        <div class="lg:col-span-2 flex flex-col gap-space-md pr-0 lg:pr-space-xl">
          <div class="flex items-center gap-space-sm">
            <img alt="Logo ${escapeHTML(CONTACT.brandName)}" class="h-11 sm:h-12 w-auto object-contain" src="${escapeHTML(logoUrl)}" />
            <span class="px-space-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">${escapeHTML(
              CONTACT.badge
            )}</span>
          </div>
          <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Nền tảng tìm phòng trọ và kết nối roommate chuẩn phong cách sống sinh viên
          </p>
        </div>
        ${columnsHtml}
      </div>
      <div class="mt-space-2xl pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md bg-surface-container rounded-xl p-space-md">
        <div class="flex flex-col md:flex-row items-center gap-space-xs text-center md:text-left">
          <span class="font-body-sm text-body-sm text-on-surface-variant">${escapeHTML(
            `${CONTACT.copyrightYear} ${CONTACT.brandName}`
          )}</span>
          <span class="font-body-sm text-body-sm text-on-surface-variant font-medium">${escapeHTML(CONTACT.slogan)}</span>
        </div>
      </div>
    </div>
  </footer>`.trim();
  }

  /** Inject shared Header and Footer into placeholders (or prepend/append around <main>). */
  function mountLayout() {
    const headerRoot = document.getElementById("rm-header-root");
    if (headerRoot) {
      headerRoot.outerHTML = buildHeaderHtml();
    } else if (!document.querySelector("header")) {
      document.body.insertAdjacentHTML("afterbegin", buildHeaderHtml());
    }

    const footerRoot = document.getElementById("rm-footer-root");
    if (footerRoot) {
      footerRoot.outerHTML = buildFooterHtml();
    } else if (!document.querySelector("footer")) {
      document.body.insertAdjacentHTML("beforeend", buildFooterHtml());
    }
  }

  function highlightActiveNavLink() {
    const rawPath = window.location.pathname.replace(/\/+$/, "") || "/";
    const currentPath = rawPath.replace(/^\/roomie(?=\/|$)/, "") || "/";
    const nav = document.querySelector("header nav");
    if (!nav) return;

    const activeKey = ROUTE_TO_NAV_KEY[currentPath] || "trang-chu";
    const activeClasses = (
      nav.getAttribute("data-active-classes") || "bg-primary text-on-primary rounded-full font-semibold shadow-sm"
    ).split(/\s+/);

    nav.querySelectorAll("a[data-path]").forEach((link) => {
      const pathVal = link.getAttribute("data-path");
      const isMatch = pathVal === activeKey || (activeKey === "trac-nghiem-hop-gu" && pathVal === "trac-nghiem-tinh-cach");
      activeClasses.forEach((cls) => link.classList.remove(cls));
      if (isMatch) {
        link.setAttribute("aria-current", "page");
        link.classList.remove("text-on-surface-variant", "hover:text-on-surface", "hover:bg-surface-container-low/70");
        activeClasses.forEach((cls) => link.classList.add(cls));
      } else {
        link.removeAttribute("aria-current");
        link.classList.add("text-on-surface-variant", "hover:text-on-surface", "hover:bg-surface-container-low/70");
      }
    });
  }

  function initHeaderScrollEffect() {
    const headerEl = document.querySelector("header");
    const navPillEl = document.querySelector("header nav");
    const rightPillEl = document.querySelector("header > div")?.lastElementChild;
    if (!headerEl) return;

    const scrolledHeaderClasses = [
      "bg-primary-fixed/95",
      "backdrop-blur-xl",
      "shadow-[0_10px_30px_-8px_rgba(73,62,229,0.20)]",
      "border-b",
      "border-primary/20",
      "pointer-events-auto"
    ];

    const syncHeaderScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const isScrolled = scrollTop > 24;
      headerEl.classList.toggle("pointer-events-none", !isScrolled);
      scrolledHeaderClasses.forEach((cls) => headerEl.classList.toggle(cls, isScrolled));
      [navPillEl, rightPillEl].forEach((pill) => {
        if (!pill) return;
        pill.classList.toggle("bg-surface-container-lowest", isScrolled);
        pill.classList.toggle("bg-surface-container-lowest/80", !isScrolled);
      });
    };

    syncHeaderScroll();
    window.addEventListener("scroll", syncHeaderScroll, { passive: true });
    document.addEventListener("scroll", syncHeaderScroll, { passive: true });
    window.addEventListener("load", syncHeaderScroll, { passive: true });
    window.addEventListener("hashchange", syncHeaderScroll, { passive: true });
  }

  function buildMobileDrawerInnerHtml() {
    const navItems = Array.isArray(Data.NAV_ITEMS) ? Data.NAV_ITEMS : [];
    const loggedIn = Core.isLoggedIn ? Core.isLoggedIn() : true;
    const profile = (Core.getCurrentUser ? Core.getCurrentUser() : Data.USER_PROFILE) || {};

    const authFooterHtml = loggedIn
      ? `
        <div class="mt-2 pt-3 border-t border-surface-container flex items-center justify-between gap-2 px-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <img src="${escapeHTML(profile.avatar || "/assets/images/common/avatar-profile.jpg")}" alt="${escapeHTML(profile.name || "Sinh viên")}" class="w-9 h-9 rounded-full object-cover ring-2 ring-secondary-container shrink-0" />
            <div class="min-w-0">
              <div class="text-xs font-bold text-on-surface truncate">${escapeHTML(profile.name || "Minh Thư")}</div>
              <div class="text-[11px] text-tertiary font-semibold truncate">${escapeHTML(profile.school || "HCMUS")}</div>
            </div>
          </div>
          <button type="button" id="rm-mobile-signout-btn" class="px-3 py-1.5 rounded-xl bg-error-container/60 hover:bg-error-container text-on-error-container text-xs font-semibold shrink-0 flex items-center gap-1 transition-colors">
            <span class="material-symbols-outlined text-[15px]">logout</span>
            <span>Đăng xuất</span>
          </button>
        </div>`
      : `
        <div class="mt-2 pt-3 border-t border-surface-container grid grid-cols-2 gap-2">
          <button type="button" id="rm-mobile-login-btn" class="py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-xs font-semibold text-center">
            Đăng nhập
          </button>
          <button type="button" id="rm-mobile-signup-btn" class="py-2.5 px-3 rounded-xl bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md text-xs font-semibold text-center">
            Đăng ký mới
          </button>
        </div>`;

    const drawerLinksHtml = [
      ...navItems.map(
        (item) =>
          `<a href="${escapeHTML(item.href)}" data-path="${escapeHTML(
            item.key
          )}" class="px-4 py-2.5 rounded-xl font-label-md text-on-surface hover:bg-surface-container-low">${escapeHTML(
            item.mobileLabel || item.label
          )}</a>`
      ),
      `<a href="/roomie/an-toan" data-path="nguyen-tac-an-toan" class="px-4 py-2.5 rounded-xl font-label-md text-on-surface hover:bg-surface-container-low">An toàn &amp; Hỗ trợ</a>`,
      `<a href="/roomie/dang-tin" data-path="dang-tin" class="mt-1 px-4 py-3 rounded-xl bg-secondary-container text-on-secondary-container font-label-md text-center font-semibold">Đăng tin miễn phí</a>`,
      authFooterHtml
    ].join("\n        ");

    return `<div class="flex flex-col gap-1.5 max-w-[1280px] mx-auto">${drawerLinksHtml}</div>`;
  }

  function bindMobileDrawerAuthEvents(drawer, menuBtn) {
    if (!drawer) return;
    const closeDrawer = () => {
      drawer.classList.add("hidden");
      menuBtn?.setAttribute("aria-expanded", "false");
    };
    drawer.querySelector("#rm-mobile-login-btn")?.addEventListener("click", () => {
      closeDrawer();
      Core.openAuthModal?.("login");
    });
    drawer.querySelector("#rm-mobile-signup-btn")?.addEventListener("click", () => {
      closeDrawer();
      Core.openAuthModal?.("signup");
    });
    drawer.querySelector("#rm-mobile-signout-btn")?.addEventListener("click", () => {
      closeDrawer();
      Core.logoutUser?.();
      Core.showToast?.("Đã đăng xuất khỏi tài khoản Roomie.", "info");
    });
  }

  function ensureMobileMenuButton() {
    const rightActions = document.getElementById("rm-header-actions") || document.querySelector("header > div")?.lastElementChild;
    if (!rightActions) return null;
    let menuBtn = document.getElementById("rm-mobile-menu-btn");
    if (!menuBtn) {
      menuBtn = document.createElement("button");
      menuBtn.id = "rm-mobile-menu-btn";
      menuBtn.type = "button";
      menuBtn.setAttribute("aria-label", "Mở menu điều hướng");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.className =
        "lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors";
      menuBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">menu</span>`;
      rightActions.appendChild(menuBtn);

      menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const drawer = document.getElementById("rm-mobile-drawer");
        if (!drawer) return;
        const willOpen = drawer.classList.contains("hidden");
        drawer.classList.toggle("hidden", !willOpen);
        menuBtn.setAttribute("aria-expanded", willOpen ? "true" : "false");
      });
    }
    return menuBtn;
  }

  function initMobileDrawer() {
    const menuBtn = ensureMobileMenuButton();
    if (!menuBtn) return;

    let drawer = document.getElementById("rm-mobile-drawer");
    if (!drawer) {
      drawer = document.createElement("div");
      drawer.id = "rm-mobile-drawer";
      drawer.className =
        "hidden lg:hidden fixed top-20 left-4 right-4 z-40 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-xl shadow-2xl border border-outline-variant/25 p-4";
      document.body.appendChild(drawer);

      document.addEventListener("click", (e) => {
        const currentBtn = document.getElementById("rm-mobile-menu-btn");
        if (!drawer.classList.contains("hidden") && !drawer.contains(e.target) && (!currentBtn || !currentBtn.contains(e.target))) {
          drawer.classList.add("hidden");
          currentBtn?.setAttribute("aria-expanded", "false");
        }
      });
    }
    drawer.innerHTML = buildMobileDrawerInnerHtml();
    bindMobileDrawerAuthEvents(drawer, menuBtn);
  }

  function initNotificationsPopover() {
    const notifBtn = document.querySelector('header button[aria-label="Thông báo"]');
    if (!notifBtn) return;

    notifBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const existing = document.getElementById("rm-notif-popover");
      if (existing) {
        existing.remove();
        return;
      }

      const readIds = Core.readJSON(Core.STORAGE_KEYS.NOTIFICATIONS_READ, []);
      const pop = document.createElement("div");
      pop.id = "rm-notif-popover";
      pop.className =
        "rm-animate-in fixed top-20 right-4 sm:right-8 z-[80] w-80 sm:w-96 bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container overflow-hidden";
      pop.innerHTML = `
        <div class="px-4 py-3 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
          <span class="font-title-md text-sm font-bold text-on-surface">Thông báo mới</span>
          <button type="button" id="rm-mark-all-read" class="text-xs font-semibold text-primary hover:underline">Đánh dấu đã đọc</button>
        </div>
        <div class="divide-y divide-surface-container max-h-80 overflow-y-auto">
          ${(Data.NOTIFICATIONS || [])
            .map((n) => {
              const isUnread = n.unread && !readIds.includes(n.id);
              return `<a href="${escapeHTML(n.href)}" class="flex items-start gap-3 p-3.5 hover:bg-surface-container-low transition-colors ${
                isUnread ? "bg-primary-fixed/20" : ""
              }">
                <span class="mt-1.5 w-2 h-2 rounded-full shrink-0 ${isUnread ? "bg-primary" : "bg-outline-variant"}"></span>
                <div>
                  <p class="text-sm font-medium text-on-surface leading-snug">${escapeHTML(n.title)}</p>
                  <span class="text-xs text-on-surface-variant">${escapeHTML(n.time)}</span>
                </div>
              </a>`;
            })
            .join("")}
        </div>
      `;
      document.body.appendChild(pop);

      pop.querySelector("#rm-mark-all-read").addEventListener("click", () => {
        if (Core.markAllNotificationsRead) {
          Core.markAllNotificationsRead();
        } else {
          Core.writeJSON(
            Core.STORAGE_KEYS.NOTIFICATIONS_READ,
            (Data.NOTIFICATIONS || []).map((n) => n.id)
          );
        }
        pop.remove();
        const dot = notifBtn.querySelector("span.bg-primary, span.bg-error");
        if (dot) dot.classList.add("hidden");
        Core.showToast("Đã đánh dấu tất cả thông báo đã đọc.", "info");
      });

      setTimeout(() => {
        document.addEventListener(
          "click",
          function handler(ev) {
            if (!pop.contains(ev.target)) {
              pop.remove();
              document.removeEventListener("click", handler);
            }
          },
          true
        );
      }, 10);
    });
  }

  function initProfileQuickMenu() {
    const loginBtn = document.getElementById("rm-header-login-btn");
    const signupBtn = document.getElementById("rm-header-signup-btn");
    loginBtn?.addEventListener("click", () => Core.openAuthModal?.("login"));
    signupBtn?.addEventListener("click", () => Core.openAuthModal?.("signup"));

    const trigger = document.getElementById("rm-profile-trigger") || document.querySelector("header img[alt^='Ảnh đại diện']")?.parentElement;
    if (!trigger) return;

    const profile = (Core.getCurrentUser ? Core.getCurrentUser() : Data.USER_PROFILE) || {};
    trigger.classList.add("cursor-pointer");
    trigger.title = `Tài khoản ${profile.name || "Minh Thư"} (${profile.shortSchool || "HCMUS"})`;

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const existing = document.getElementById("rm-profile-popover");
      if (existing) {
        existing.remove();
        return;
      }

      const currentProfile = (Core.getCurrentUser ? Core.getCurrentUser() : Data.USER_PROFILE) || {};
      const savedCount = Core.getSavedRoomIds().length;
      const customCount = (Data.ROOMMATES || []).filter(
        (roommate) => roommate.userId && String(roommate.userId) === String(currentProfile.id)
      ).length;
      const activePlan = Core.getLatestPurchasedPlan();
      const pop = document.createElement("div");
      pop.id = "rm-profile-popover";
      pop.className =
        "rm-animate-in fixed top-20 right-4 sm:right-8 z-[80] w-72 bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container overflow-hidden";
      pop.innerHTML = `
        <div class="p-4 bg-surface-container-low border-b border-surface-container flex items-center gap-3">
          <img src="${escapeHTML(currentProfile.avatar || "/assets/images/common/avatar-profile.jpg")}" class="w-11 h-11 rounded-full object-cover ring-2 ring-secondary-container shrink-0" alt="Ảnh đại diện ${escapeHTML(currentProfile.name)}" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <div class="font-bold text-sm text-on-surface truncate">${escapeHTML(currentProfile.name)}</div>
              ${
                currentProfile.verifiedStudent !== false
                  ? `<span class="material-symbols-outlined text-[15px] text-tertiary shrink-0" title="Đã xác thực thẻ sinh viên">verified</span>`
                  : ""
              }
            </div>
            <div class="text-xs text-tertiary font-semibold truncate">${escapeHTML(currentProfile.school)}</div>
            ${
              currentProfile.email
                ? `<div class="text-[11px] text-on-surface-variant truncate mt-0.5">${escapeHTML(currentProfile.email)}</div>`
                : ""
            }
          </div>
        </div>
        <div class="px-4 py-2.5 bg-surface border-b border-surface-container flex items-center justify-between gap-2 text-xs">
          <a href="/roomie/bang-gia" class="flex items-center gap-1.5 min-w-0 hover:underline">
            <span class="material-symbols-outlined text-[16px] ${activePlan ? "text-tertiary" : "text-primary"}">${activePlan ? "workspace_premium" : "sell"}</span>
            <span class="font-semibold text-on-surface truncate">${activePlan ? `Gói: ${escapeHTML(activePlan.name)}` : "Gói Cơ bản (Miễn phí)"}</span>
          </a>
          ${
            activePlan
              ? `<button type="button" id="rm-reset-plans-btn" title="Quay về Gói Cơ bản (Demo)" class="px-2 py-0.5 rounded-md bg-surface-container-high hover:bg-error-container text-on-surface-variant hover:text-on-error-container font-semibold shrink-0 transition-colors">Đặt lại</button>`
              : `<a href="/roomie/bang-gia" class="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-bold shrink-0">Nâng cấp</a>`
          }
        </div>
        <div class="p-2 flex flex-col gap-0.5 text-sm">
          <a href="/roomie/tim-roommate" class="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-container-low text-on-surface">
            <span>Hồ sơ &amp; Kết quả Match</span>
            <span class="text-xs text-primary font-semibold">42</span>
          </a>
          <a href="/roomie/tim-phong?saved=1" class="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-container-low text-on-surface">
            <span>Phòng đã lưu</span>
            <span class="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-xs font-bold">${savedCount}</span>
          </a>
          <a href="/roomie/tin-da-dang" class="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-container-low text-on-surface">
            <span>Tin đăng của tôi</span>
            <span class="text-xs text-on-surface-variant font-semibold">${customCount}</span>
          </a>
          <a href="/roomie/trac-nghiem" class="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-container-low text-on-surface">
            <span>Làm lại bài test hợp gu</span>
            <span class="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          </a>
          <a href="/roomie/an-toan" class="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-container-low text-on-surface">
            <span>Cẩm nang an toàn sinh viên</span>
            <span class="material-symbols-outlined text-[16px] text-outline">shield</span>
          </a>
        </div>
        <div class="p-2 border-t border-surface-container bg-surface-container-low/50 flex flex-col gap-1">
          <button type="button" id="rm-switch-account-btn" class="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-container text-xs font-semibold text-on-surface transition-colors">
            <span class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[17px] text-primary">switch_account</span>
              <span>Đổi tài khoản / Đăng ký mới</span>
            </span>
            <span class="material-symbols-outlined text-[15px] text-outline">chevron_right</span>
          </button>
          <button type="button" id="rm-signout-btn" class="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-error-container text-xs font-semibold text-error hover:text-on-error-container transition-colors">
            <span class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[17px]">logout</span>
              <span>Đăng xuất</span>
            </span>
          </button>
        </div>
      `;
      document.body.appendChild(pop);

      pop.querySelector("#rm-reset-plans-btn")?.addEventListener("click", () => {
        Core.resetPurchasedPlans();
        pop.remove();
        Core.showToast("Đã đặt lại về Gói Cơ bản miễn phí.", "info");
      });

      pop.querySelector("#rm-switch-account-btn")?.addEventListener("click", () => {
        pop.remove();
        Core.openAuthModal?.("login");
      });

      pop.querySelector("#rm-signout-btn")?.addEventListener("click", () => {
        pop.remove();
        Core.logoutUser?.();
        Core.showToast?.("Đã đăng xuất khỏi tài khoản Roomie.", "info");
      });

      setTimeout(() => {
        document.addEventListener(
          "click",
          function handler(ev) {
            if (!pop.contains(ev.target)) {
              pop.remove();
              document.removeEventListener("click", handler);
            }
          },
          true
        );
      }, 10);
    });
  }

  function refreshHeaderAuthUI() {
    document.getElementById("rm-profile-popover")?.remove();
    document.getElementById("rm-notif-popover")?.remove();

    const actionsContainer = document.getElementById("rm-header-actions");
    if (actionsContainer) {
      actionsContainer.innerHTML = buildHeaderRightInnerHtml();
    }

    initMobileDrawer();
    initNotificationsPopover();
    Core.syncHeaderSlotBadge?.();

    const connectBtn = document.querySelector('header button[aria-label="Kết nối"], header button[aria-label="Tin nhắn"]');
    connectBtn?.addEventListener("click", () => {
      Core.openConnectionsDrawer(() => {
        window.dispatchEvent(new CustomEvent("roomie:connections-updated"));
      });
    });

    initProfileQuickMenu();
    syncPageUserElements();
  }

  function syncPageUserElements() {
    const user = Core.getCurrentUser ? Core.getCurrentUser() : Data.USER_PROFILE;

    // Sync any elements tagged with data-auth-user-*
    document.querySelectorAll("[data-auth-name]").forEach((el) => {
      el.textContent = user ? `${user.name}${el.dataset.authSuffix || ""}` : "Khách (Chưa đăng nhập)";
    });
    document.querySelectorAll("[data-auth-school]").forEach((el) => {
      el.textContent = user ? user.school : "Đăng nhập để đồng bộ trường ĐH";
    });
    document.querySelectorAll("[data-auth-major]").forEach((el) => {
      el.textContent = user ? user.major || "Sinh viên Đại học" : "Chưa xác thực thẻ SV";
    });
    document.querySelectorAll("[data-auth-idcode]").forEach((el) => {
      el.textContent = user ? `ID: ${user.idCode || "#SV-8924"}` : "Chưa đăng nhập";
    });
    document.querySelectorAll("[data-auth-email]").forEach((el) => {
      el.textContent = user ? user.altEmail || user.email : "sinhvien@student.edu.vn";
    });
    document.querySelectorAll("img[data-auth-avatar]").forEach((img) => {
      if (user?.avatar) img.src = user.avatar;
    });
  }

  function showDemoStorageNotice() {
    if (document.getElementById("roomie-demo-storage-notice")) return;
    const notice = document.createElement("aside");
    notice.id = "roomie-demo-storage-notice";
    notice.className =
      "fixed bottom-3 left-3 z-40 flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-xl border border-primary/20 bg-surface-container-lowest px-3 py-2 text-xs text-on-surface shadow-lg";
    notice.setAttribute("role", "status");

    const message = document.createElement("span");
    message.textContent = "Chế độ demo: dữ liệu chỉ lưu trên trình duyệt này.";
    notice.appendChild(message);

    const dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.className = "rounded-md px-1 text-on-surface-variant hover:bg-surface-container";
    dismiss.setAttribute("aria-label", "Ẩn thông báo demo");
    dismiss.textContent = "×";
    dismiss.addEventListener("click", () => notice.remove());
    notice.appendChild(dismiss);
    document.body.appendChild(notice);
  }

  /** Initialize global shell: Header/Footer mount, routes, fallback images, popovers, drawers. */
  function initGlobalShell() {
    mountLayout();
    showDemoStorageNotice();

    document.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => {
        if (img.dataset.fallbackApplied) return;
        img.dataset.fallbackApplied = "1";
        img.src = Core.FALLBACK_SVG;
      });
    });

    const routes = Data.ROUTES || {};
    document.querySelectorAll("a[data-path]").forEach((a) => {
      const pathKey = a.getAttribute("data-path");
      if (routes[pathKey]) {
        a.setAttribute("href", routes[pathKey]);
      }
    });

    highlightActiveNavLink();
    initHeaderScrollEffect();
    refreshHeaderAuthUI();

    Core.onAuthStateChange?.(() => {
      refreshHeaderAuthUI();
    });
  }

  window.RoomieLayout = { initGlobalShell, refreshHeaderAuthUI };
  document.addEventListener("DOMContentLoaded", initGlobalShell);
})();
