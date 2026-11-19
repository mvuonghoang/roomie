/**
 * Page: Contact (/roomie/lien-he)
 * Hiệu ứng hero/thẻ liên hệ, chọn chủ đề, chọn khu vực & trường ĐH (dùng chung LocationPicker), và gửi form liên hệ.
 */
(function () {
  const Core = window.RoomieCore || {};
  const Picker = window.RoomieLocationPicker || {};
  const { escapeHTML } = Core;

  function initContactMotionEffects() {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia?.("(pointer: fine)").matches;

    const revealEls = Array.from(document.querySelectorAll(".rm-reveal"));
    if (revealEls.length) {
      if (prefersReduced || !("IntersectionObserver" in window)) {
        revealEls.forEach((el) => el.classList.add("is-visible"));
      } else {
        document.documentElement.classList.add("rm-motion-ready");
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -24px 0px" }
        );
        revealEls.forEach((el) => observer.observe(el));
      }
    }

    const heroStage = document.getElementById("contact-hero-stage");
    const heroCursorGlow = document.getElementById("contact-hero-cursor-glow");
    if (heroStage && heroCursorGlow && finePointer && !prefersReduced) {
      heroStage.addEventListener(
        "mousemove",
        (e) => {
          const rect = heroStage.getBoundingClientRect();
          heroCursorGlow.style.left = `${(e.clientX - rect.left).toFixed(1)}px`;
          heroCursorGlow.style.top = `${(e.clientY - rect.top).toFixed(1)}px`;
          heroCursorGlow.style.opacity = "1";
        },
        { passive: true }
      );
      heroStage.addEventListener("mouseleave", () => {
        heroCursorGlow.style.opacity = "0";
      });
    }

    if (finePointer && !prefersReduced) {
      document.querySelectorAll(".rm-contact-spotlight-card").forEach((card) => {
        card.addEventListener(
          "mousemove",
          (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty("--mx", `${x.toFixed(1)}px`);
            card.style.setProperty("--my", `${y.toFixed(1)}px`);
            const nx = (x / rect.width - 0.5) * 2;
            const ny = (y / rect.height - 0.5) * 2;
            card.style.transform = `perspective(900px) translateY(-4px) rotateX(${(-ny * 3.5).toFixed(
              2
            )}deg) rotateY(${(nx * 3.5).toFixed(2)}deg)`;
          },
          { passive: true }
        );
        card.addEventListener("mouseleave", () => {
          card.style.transform = "";
        });
      });
    }
  }

  function initContactPage() {
    initContactMotionEffects();

    document.querySelectorAll("[data-copy-value]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const val = btn.dataset.copyValue || "";
        const label = btn.dataset.copyLabel || "thông tin";
        await Core.copyContactText(val, label);
        const textSpan = btn.querySelector("span:not(.material-symbols-outlined)");
        const iconSpan = btn.querySelector(".material-symbols-outlined");
        if (textSpan && !btn.dataset.origText) btn.dataset.origText = textSpan.textContent;
        if (iconSpan && !btn.dataset.origIcon) btn.dataset.origIcon = iconSpan.textContent;
        if (textSpan && btn.dataset.copyLabel) textSpan.textContent = "Đã sao chép!";
        if (iconSpan) iconSpan.textContent = "check";
        clearTimeout(btn._copyTimer);
        btn._copyTimer = setTimeout(() => {
          if (textSpan && btn.dataset.origText) textSpan.textContent = btn.dataset.origText;
          if (iconSpan && btn.dataset.origIcon) iconSpan.textContent = btn.dataset.origIcon;
        }, 1800);
      });
    });

    const topicGroup = document.getElementById("contact-topic-group");
    const topicInput = document.getElementById("contact-topic-input");
    const msgInput = document.getElementById("contact-message");
    const charCountEl = document.getElementById("contact-char-count");

    if (topicGroup) {
      const topicBtns = Array.from(topicGroup.querySelectorAll("[data-contact-topic]"));
      const activeTopicCls = ["bg-gradient-to-r", "from-[#493ee5]", "to-[#635bff]", "text-white", "shadow-sm"];
      const inactiveTopicCls = ["bg-surface-container-low", "text-on-surface-variant", "hover:bg-primary-fixed", "hover:text-primary"];

      topicBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          if (topicInput) topicInput.value = btn.dataset.contactTopic || "";
          if (msgInput && btn.dataset.placeholder) msgInput.placeholder = btn.dataset.placeholder;
          topicBtns.forEach((b) => {
            const active = b === btn;
            activeTopicCls.forEach((c) => b.classList.toggle(c, active));
            inactiveTopicCls.forEach((c) => b.classList.toggle(c, !active));
          });
        });
      });
    }

    if (msgInput && charCountEl) {
      const syncCharCount = () => {
        charCountEl.textContent = `${msgInput.value.length} / 500`;
      };
      msgInput.addEventListener("input", syncCharCount);
      syncCharCount();
    }

    const districtsByCity = Picker.getSharedDistrictsByCity();
    const areaCityBtns = document.querySelectorAll(".contact-area-city-btn");
    const areaCityCount = document.getElementById("contact-area-city-count");
    const districtSelect = document.getElementById("contact-district");
    const uniInput = document.getElementById("contact-uni-search");

    const locationState = {
      areaCity: "TP.HCM",
      uniCityFilter: "all",
      selectedUniversity: null
    };

    function renderContactDistricts(preferredDistrictKey = "") {
      const list = districtsByCity[locationState.areaCity] || [];
      areaCityBtns.forEach((btn) => {
        const active = btn.dataset.areaCity === locationState.areaCity;
        btn.setAttribute("aria-selected", active ? "true" : "false");
        btn.className = active
          ? "contact-area-city-btn rounded-lg text-xs font-semibold bg-primary text-on-primary shadow-xs transition-all cursor-pointer"
          : "contact-area-city-btn rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface transition-all cursor-pointer";
      });
      if (areaCityCount) {
        areaCityCount.textContent = Picker.formatAreaCityCountLabel(locationState.areaCity, list, 0);
      }
      if (districtSelect) {
        const prevVal = preferredDistrictKey || districtSelect.value;
        districtSelect.innerHTML = [
          `<option value="">Tất cả khu vực tại ${escapeHTML(locationState.areaCity)}</option>`,
          ...list.map((d) => `<option value="${escapeHTML(d.key)}">${escapeHTML(d.name)}</option>`)
        ].join("");
        if (prevVal && list.some((d) => d.key === prevVal)) districtSelect.value = prevVal;
      }
    }

    const uniAutocomplete = Picker.createUniversityAutocomplete({
      wrapper: document.getElementById("contact-uni-wrapper"),
      input: uniInput,
      clearBtn: document.getElementById("contact-uni-clear"),
      dropdown: document.getElementById("contact-uni-suggestions"),
      listEl: document.getElementById("contact-uni-suggestions-list"),
      countEl: document.getElementById("contact-uni-count"),
      cityTabs: document.querySelectorAll(".contact-uni-city-tab"),
      selectedChip: document.getElementById("contact-selected-uni-chip"),
      selectedLabel: document.getElementById("contact-selected-uni-label"),
      selectedRemoveBtn: document.getElementById("contact-selected-uni-remove"),
      tabClassBase: "contact-uni-city-tab",
      getState: () => locationState,
      onSelect: (uni) => {
        locationState.selectedUniversity = uni;
        const firstAreaKey = Array.isArray(uni.areaKeys) && uni.areaKeys.length ? uni.areaKeys[0] : "";
        if (uni.city && districtsByCity[uni.city]) {
          setContactAreaCity(uni.city, { preserveUniversity: true, preferredDistrictKey: firstAreaKey });
        }
      },
      onClear: () => {
        locationState.selectedUniversity = null;
      },
      onInput: (val) => {
        if (locationState.selectedUniversity && val !== locationState.selectedUniversity.name) {
          locationState.selectedUniversity = null;
        }
      }
    });

    function setContactAreaCity(nextCity, options = {}) {
      if (!nextCity || !districtsByCity[nextCity]) return;
      const changed = locationState.areaCity !== nextCity;
      locationState.areaCity = nextCity;
      if (!options.preserveUniversity && locationState.selectedUniversity && locationState.selectedUniversity.city !== nextCity) {
        locationState.selectedUniversity = null;
        if (uniInput) uniInput.value = "";
        uniAutocomplete.syncUI();
      }
      renderContactDistricts(changed ? options.preferredDistrictKey || "" : options.preferredDistrictKey);
    }

    areaCityBtns.forEach((btn) => btn.addEventListener("click", () => setContactAreaCity(btn.dataset.areaCity)));
    document.addEventListener("click", (e) => {
      if (uniAutocomplete.isOpen() && !uniAutocomplete.contains(e.target)) uniAutocomplete.close();
    });

    renderContactDistricts();
    uniAutocomplete.syncUI();

    const form = document.getElementById("contact-main-form");
    const successPanel = document.getElementById("contact-success-panel");
    const sendAnotherBtn = document.getElementById("contact-send-another");

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameVal = document.getElementById("contact-name")?.value.trim() || "bạn";
      const topicVal = topicInput?.value || "Hỗ trợ chung";
      const ticketId = `#RM-${Math.floor(1000 + Math.random() * 9000)}`;

      const selectedDistLabel = districtSelect?.value
        ? districtSelect.options[districtSelect.selectedIndex]?.textContent
        : "";
      const areaSummary = selectedDistLabel ? `${selectedDistLabel}, ${locationState.areaCity}` : locationState.areaCity;
      const uniSummary = locationState.selectedUniversity ? locationState.selectedUniversity.name : uniInput?.value.trim() || "";
      const locParts = [areaSummary, uniSummary].filter(Boolean);

      const setElText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      };
      setElText("contact-success-name", nameVal);
      setElText("contact-success-topic", topicVal);
      setElText("contact-success-location", locParts.length ? ` (khu vực ${locParts.join(" · ")})` : "");
      setElText("contact-ticket-badge", `Mã tiếp nhận ${ticketId}`);

      form.classList.add("hidden");
      if (successPanel) {
        successPanel.classList.remove("hidden");
        successPanel.classList.add("flex", "rm-animate-in");
      }
      Core.showToast(`Đã gửi lời nhắn (${ticketId})! Roomie sẽ phản hồi sớm nhất.`);
    });

    sendAnotherBtn?.addEventListener("click", () => {
      form?.reset();
      locationState.uniCityFilter = "all";
      locationState.selectedUniversity = null;
      setContactAreaCity("TP.HCM", { preferredDistrictKey: "" });
      if (uniInput) uniInput.value = "";
      uniAutocomplete.close();
      uniAutocomplete.syncUI();
      if (charCountEl) charCountEl.textContent = "0 / 500";
      if (successPanel) {
        successPanel.classList.add("hidden");
        successPanel.classList.remove("flex");
      }
      form?.classList.remove("hidden");
      form?.classList.add("rm-animate-in");
    });

    const landmarkGroup = document.getElementById("map-landmark-buttons");
    const landmarkDetail = document.getElementById("map-landmark-detail");
    if (landmarkGroup && landmarkDetail) {
      const lmBtns = Array.from(landmarkGroup.querySelectorAll("[data-map-landmark]"));
      const activeLmCls = ["bg-white", "text-primary", "font-bold"];
      const inactiveLmCls = ["bg-white/12", "hover:bg-white/22", "text-white", "font-semibold"];

      lmBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const title = btn.dataset.mapLandmark || "";
          const dist = btn.dataset.mapDist || "";
          landmarkDetail.innerHTML = `<strong class="text-secondary-container">${escapeHTML(title)}:</strong> ${escapeHTML(dist)}`;
          lmBtns.forEach((b) => {
            const active = b === btn;
            activeLmCls.forEach((c) => b.classList.toggle(c, active));
            inactiveLmCls.forEach((c) => b.classList.toggle(c, !active));
          });
        });
      });
    }

    const mapCard = document.getElementById("roomie-map-card");
    const jumpMapBtn = document.getElementById("jump-to-map-btn");
    if (mapCard && jumpMapBtn) {
      jumpMapBtn.addEventListener("click", () => {
        mapCard.classList.add("ring-4", "ring-primary-fixed");
        setTimeout(() => mapCard.classList.remove("ring-4", "ring-primary-fixed"), 1600);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "lien-he") initContactPage();
  });
})();
