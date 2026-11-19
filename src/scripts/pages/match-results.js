/**
 * Page: Match Results & Roommate Finder (/roomie/tim-roommate)
 * Hiển thị kết quả trắc nghiệm, bộ lọc drawer đồng bộ TP.HCM/Hà Nội & Trường ĐH, và kết nối Double Opt-in.
 */
(function () {
  const Data = window.RoomieData || {};
  const Core = window.RoomieCore || {};
  const Picker = window.RoomieLocationPicker || {};
  const { escapeHTML, normalizeSearchText } = Core;

  const FILTER_GROUPS = {
    tab: [
      { value: "all", label: "Tất cả phù hợp" },
      { value: "high", label: "Tương thích cao >90%" },
      { value: "vnu", label: "Cùng trường ĐHQG" },
      { value: "has-room", label: "Đã có sẵn phòng" }
    ],
    gender: [
      { value: "all", label: "Tất cả" },
      { value: "Nữ", label: "Nữ" },
      { value: "Nam", label: "Nam" }
    ]
  };

  function createDefaultFilterState() {
    return {
      search: "",
      selectedUniversity: null,
      uniCityFilter: "all",
      areaCity: "TP.HCM",
      priceRange: "all",
      areas: [],
      tab: "all",
      gender: "all"
    };
  }

  function getRoommateCity(rm) {
    return Picker.inferLocationCity(`${rm?.school || ""} ${rm?.roomStatusDetail || ""}`, rm?.city);
  }

  function parseBudgetRange(budgetStr) {
    const matches = String(budgetStr || "").match(/\d+(?:[.,]\d+)?/g) || [];
    const nums = matches.map((m) => parseFloat(m.replace(",", "."))).filter((n) => Number.isFinite(n));
    if (nums.length === 0) return null;
    return nums.length === 1 ? [nums[0], nums[0]] : [Math.min(...nums), Math.max(...nums)];
  }

  function matchesBudgetFilter(rm, priceRange) {
    if (!priceRange || priceRange === "all") return true;
    const range = parseBudgetRange(rm.budget);
    if (!range) return true;
    const [min, max] = range;
    if (priceRange === "<1.5") return min < 1.5;
    if (priceRange === "1.5-2.5") return min <= 2.5 && max >= 1.5;
    if (priceRange === "2.5-3.5") return max > 2.5 && min <= 3.5;
    if (priceRange === ">3.5") return max > 3.5;
    return true;
  }

  function initQuizBannerState() {
    const savedQuiz = Core.readJSON(Core.STORAGE_KEYS.QUIZ_RESULT, null);
    const hasQuizResult = Boolean(savedQuiz?.archetype && savedQuiz?.pillars);
    document.getElementById("mr-quiz-complete-status")?.classList.toggle("hidden", !hasQuizResult);
    document.getElementById("mr-quiz-welcome")?.classList.toggle("hidden", hasQuizResult);
    document.getElementById("mr-quiz-results")?.classList.toggle("hidden", !hasQuizResult);

    const matchSectionEyebrow = document.getElementById("mr-match-section-eyebrow");
    const matchSectionTitle = document.getElementById("mr-match-section-title");
    const matchSectionDescription = document.getElementById("mr-match-section-description");
    const roomRecommendationsTitle = document.getElementById("mr-room-recommendations-title");
    const roomRecommendationsDescription = document.getElementById("mr-room-recommendations-description");

    if (hasQuizResult) {
      const archEl = document.getElementById("mr-archetype-title");
      if (archEl && savedQuiz.archetype) archEl.textContent = savedQuiz.archetype;
      if (savedQuiz.pillars) {
        [
          ["mr-p1", savedQuiz.pillars.sleep],
          ["mr-p2", savedQuiz.pillars.clean],
          ["mr-p3", savedQuiz.pillars.guests],
          ["mr-p4", savedQuiz.pillars.finance]
        ].forEach(([id, pct]) => {
          const val = document.getElementById(`${id}-val`);
          const bar = document.getElementById(`${id}-bar`);
          if (val) val.textContent = `${pct}%`;
          if (bar) bar.style.width = `${pct}%`;
        });
      }
      matchSectionDescription?.classList.remove("hidden");
      roomRecommendationsDescription?.classList.remove("hidden");
      const matchCount = Number(savedQuiz.matchCount);
      if (Number.isFinite(matchCount)) {
        const matchCountEl = document.getElementById("mr-match-count");
        const connectionCountEl = document.getElementById("mr-connection-count");
        if (matchCountEl) matchCountEl.textContent = `${matchCount} bạn sinh viên`;
        if (connectionCountEl) connectionCountEl.textContent = String(matchCount);
      }
    } else {
      if (matchSectionEyebrow) matchSectionEyebrow.textContent = "Khám phá cộng đồng";
      if (matchSectionTitle) {
        matchSectionTitle.innerHTML = 'Các bạn cùng phòng <span class="text-primary whitespace-nowrap">nổi bật</span>';
      }
      if (matchSectionDescription) {
        matchSectionDescription.textContent = "";
        matchSectionDescription.classList.add("hidden");
      }
      if (roomRecommendationsTitle) {
        roomRecommendationsTitle.innerHTML =
          '<span class="text-primary whitespace-nowrap">Phòng trọ</span> đang tìm <span class="text-primary whitespace-nowrap">người ở cùng</span>';
      }
      if (roomRecommendationsDescription) {
        roomRecommendationsDescription.textContent = "";
        roomRecommendationsDescription.classList.add("hidden");
      }
    }
  }

  function initMatchResultsPage() {
    initQuizBannerState();

    const grid = document.getElementById("roommate-matches-grid");
    const loadMoreBtn = document.getElementById("mr-load-more-btn");
    const loadMoreLabel = document.getElementById("mr-load-more-label");
    const resultsSummary = document.getElementById("mr-results-summary");
    const filterToggleBtn = document.getElementById("mr-filter-toggle-btn");
    const filterBadge = document.getElementById("mr-filter-active-badge");
    const activeFiltersBar = document.getElementById("mr-active-filters-bar");

    const districtsByCity = Picker.getSharedDistrictsByCity();
    const state = { ...createDefaultFilterState(), showAll: false };

    function getDistrictRoommateCount(city, district) {
      const normDistName = normalizeSearchText(district.name);
      return (Data.ROOMMATES || []).filter((rm) => {
        if (getRoommateCity(rm) !== city) return false;
        if (rm.areaKey) return rm.areaKey === district.key;
        return normalizeSearchText(`${rm.school || ""} ${rm.roomStatusDetail || ""}`).includes(normDistName);
      }).length;
    }

    function getRoommateSearchHaystack(rm) {
      const city = getRoommateCity(rm);
      const districtObj = (districtsByCity[city] || []).find((d) => d.key === rm.areaKey);
      return normalizeSearchText(
        `${rm.name} ${rm.school} ${rm.shortSchool || ""} ${rm.major} ${rm.roomStatusTitle} ${rm.roomStatusDetail} ${
          districtObj ? districtObj.name : ""
        } ${rm.quote || ""} ${(rm.tags || []).join(" ")} ${(rm.criteria || []).join(" ")}`
      );
    }

    function filterRoommates(criteria) {
      const normSearch = normalizeSearchText(criteria.search);
      return (Data.ROOMMATES || []).filter((rm) => {
        if (criteria.areaCity && getRoommateCity(rm) !== criteria.areaCity) return false;
        if (criteria.selectedUniversity) {
          const uni = criteria.selectedUniversity;
          if (getRoommateCity(rm) !== uni.city) return false;
          const hay = getRoommateSearchHaystack(rm);
          const matchesTerm = (uni.roomMatchTerms || []).some((term) => hay.includes(normalizeSearchText(term)));
          const matchesArea = Array.isArray(uni.areaKeys) && uni.areaKeys.includes(rm.areaKey);
          if (!matchesTerm && !matchesArea) return false;
        } else if (normSearch) {
          const hay = getRoommateSearchHaystack(rm);
          if (!normSearch.split(" ").filter(Boolean).every((tok) => hay.includes(tok))) return false;
        }
        if (criteria.areas.length > 0 && !criteria.areas.includes(rm.areaKey)) return false;
        if (!matchesBudgetFilter(rm, criteria.priceRange)) return false;
        if (criteria.tab === "high" && rm.matchScore < 90) return false;
        if (criteria.tab === "vnu" && !rm.vnuMember) return false;
        if (criteria.tab === "has-room" && !rm.hasRoom) return false;
        if (criteria.gender !== "all" && rm.gender !== criteria.gender) return false;
        return true;
      });
    }

    function getActiveFilterChips() {
      const chips = [];
      if (state.selectedUniversity) {
        chips.push({ key: "university", label: `Trường: ${state.selectedUniversity.code} (${state.selectedUniversity.city})` });
      } else if (state.search.trim()) {
        chips.push({ key: "search", label: `Từ khóa: "${state.search.trim()}"` });
      }
      if (state.priceRange !== "all") {
        chips.push({ key: "priceRange", label: `Mức giá: ${Picker.SHARED_PRICE_LABELS[state.priceRange] || state.priceRange}` });
      }
      if (state.areaCity !== "TP.HCM") {
        chips.push({ key: "areaCity", label: `Thành phố: ${state.areaCity}` });
      }
      if (state.areas.length > 0) {
        const districtMap = new Map((districtsByCity[state.areaCity] || []).map((d) => [d.key, d.name]));
        state.areas.forEach((areaKey) => {
          chips.push({ key: "area", value: areaKey, label: `Khu vực: ${districtMap.get(areaKey) || areaKey}` });
        });
      }
      if (state.tab !== "all") {
        const opt = FILTER_GROUPS.tab.find((item) => item.value === state.tab);
        if (opt) chips.push({ key: "tab", label: `Nhóm: ${opt.label}` });
      }
      if (state.gender !== "all") {
        chips.push({ key: "gender", label: `Giới tính: ${state.gender}` });
      }
      return chips;
    }

    function resetAllFilters() {
      Object.assign(state, createDefaultFilterState(), { showAll: false });
      renderMatches();
    }

    function syncFilterToolbarUI(filteredCount, totalCount) {
      const chips = getActiveFilterChips();
      const activeCount = chips.length;

      if (resultsSummary) {
        resultsSummary.textContent = activeCount > 0 ? `${filteredCount} / ${totalCount} ứng viên` : `${filteredCount} ứng viên`;
      }
      if (filterBadge) {
        filterBadge.textContent = String(activeCount);
        filterBadge.classList.toggle("hidden", activeCount === 0);
      }
      if (filterToggleBtn) {
        const isFiltered = activeCount > 0;
        filterToggleBtn.classList.toggle("ring-4", isFiltered);
        filterToggleBtn.classList.toggle("ring-primary-fixed", isFiltered);
      }
      if (!activeFiltersBar) return;

      if (activeCount === 0) {
        activeFiltersBar.classList.add("hidden");
        activeFiltersBar.classList.remove("flex");
        activeFiltersBar.innerHTML = "";
        return;
      }

      activeFiltersBar.classList.remove("hidden");
      activeFiltersBar.classList.add("flex");
      activeFiltersBar.innerHTML = `
        ${chips
          .map(
            (chip) => `
          <button type="button" data-clear-filter="${escapeHTML(chip.key)}" ${
              chip.value ? `data-clear-value="${escapeHTML(chip.value)}"` : ""
            } class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest border border-primary/25 text-on-surface font-label-sm text-label-sm font-semibold shadow-xs hover:border-error/40 hover:text-error transition-colors cursor-pointer">
            <span>${escapeHTML(chip.label)}</span>
            <span class="material-symbols-outlined text-[15px]">close</span>
          </button>`
          )
          .join("")}
        <button type="button" id="mr-clear-all-chips" class="px-2.5 py-1.5 rounded-full text-label-sm font-label-sm font-semibold text-primary hover:bg-primary-fixed/40 transition-colors cursor-pointer">
          Xóa tất cả
        </button>
      `;

      activeFiltersBar.querySelectorAll("[data-clear-filter]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const { clearFilter, clearValue } = btn.dataset;
          if (clearFilter === "university") {
            state.selectedUniversity = null;
            state.search = "";
          } else if (clearFilter === "search") state.search = "";
          else if (clearFilter === "priceRange") state.priceRange = "all";
          else if (clearFilter === "areaCity") {
            state.areaCity = "TP.HCM";
            state.areas = [];
          } else if (clearFilter === "area" && clearValue) {
            state.areas = state.areas.filter((a) => a !== clearValue);
          } else if (clearFilter === "tab") state.tab = "all";
          else if (clearFilter === "gender") state.gender = "all";
          state.showAll = false;
          renderMatches();
        });
      });

      activeFiltersBar.querySelector("#mr-clear-all-chips")?.addEventListener("click", resetAllFilters);
    }

    function openRoommateFilterDrawer() {
      if (document.getElementById("rm-mr-filter-overlay")) return;
      const draft = { ...state, areas: [...state.areas] };
      const allRoommates = Data.ROOMMATES || [];
      const tabCounts = {
        all: allRoommates.length,
        high: allRoommates.filter((rm) => rm.matchScore >= 90).length,
        vnu: allRoommates.filter((rm) => rm.vnuMember).length,
        "has-room": allRoommates.filter((rm) => rm.hasRoom).length
      };

      const overlay = document.createElement("div");
      overlay.id = "rm-mr-filter-overlay";
      overlay.className = "fixed inset-0 z-[90] bg-inverse-surface/40 opacity-0 transition-opacity duration-300";
      overlay.innerHTML = buildFilterDrawerHtml(draft, tabCounts);

      const drawer = overlay.querySelector("#mr-filter-drawer");
      const searchInput = overlay.querySelector("#mr-campus-search");
      const pricePills = overlay.querySelectorAll(".mr-price-pill");
      const priceDisplay = overlay.querySelector("#mr-price-display");
      const areaCityBtns = overlay.querySelectorAll(".mr-area-city-btn");
      const areaCityCount = overlay.querySelector("#mr-area-city-count");
      const areaSelectedClear = overlay.querySelector("#mr-area-selected-clear");
      const areaList = overlay.querySelector("#mr-area-filter-options");
      const tabPills = overlay.querySelectorAll(".mr-tab-pill");
      const genderPills = overlay.querySelectorAll(".mr-gender-pill");
      const applyBtn = overlay.querySelector("#mr-drawer-apply-btn");
      const resetBtn = overlay.querySelector("#mr-drawer-reset-btn");
      const closeBtn = overlay.querySelector("#mr-filter-close");

      const closeDrawer = () => {
        if (overlay.dataset.closing) return;
        overlay.dataset.closing = "true";
        overlay.classList.add("opacity-0");
        drawer?.classList.add("translate-x-full");
        document.body.classList.remove("overflow-hidden");
        document.removeEventListener("keydown", handleKeydown);
        filterToggleBtn?.setAttribute("aria-expanded", "false");
        setTimeout(() => {
          overlay.remove();
          filterToggleBtn?.focus();
        }, 300);
      };

      const uniAutocomplete = Picker.createUniversityAutocomplete({
        wrapper: overlay.querySelector("#mr-campus-search-wrapper"),
        input: searchInput,
        clearBtn: overlay.querySelector("#mr-campus-search-clear"),
        dropdown: overlay.querySelector("#mr-university-suggestions"),
        listEl: overlay.querySelector("#mr-university-suggestions-list"),
        countEl: overlay.querySelector("#mr-uni-dropdown-count"),
        cityTabs: overlay.querySelectorAll(".mr-uni-city-tab"),
        selectedChip: overlay.querySelector("#mr-selected-university-chip"),
        selectedLabel: overlay.querySelector("#mr-selected-university-label"),
        selectedRemoveBtn: overlay.querySelector("#mr-selected-university-remove"),
        tabClassBase: "mr-uni-city-tab",
        getState: () => draft,
        onSelect: (uni) => {
          draft.selectedUniversity = uni;
          draft.search = uni.name;
          if (uni.city && districtsByCity[uni.city] && draft.areaCity !== uni.city) {
            setAreaCity(uni.city, { preserveUniversity: true });
          }
          syncFooterUI();
        },
        onClear: () => {
          draft.selectedUniversity = null;
          draft.search = "";
          syncFooterUI();
        },
        onInput: (val) => {
          if (draft.selectedUniversity && val !== draft.selectedUniversity.name) {
            draft.selectedUniversity = null;
          }
          draft.search = val;
          syncFooterUI();
        }
      });

      const syncAreaCityUI = () => {
        areaCityBtns.forEach((btn) => {
          const active = btn.dataset.areaCity === draft.areaCity;
          btn.setAttribute("aria-selected", active ? "true" : "false");
          btn.className = active
            ? "mr-area-city-btn py-1.5 px-3 rounded-lg text-label-sm font-label-sm font-semibold bg-primary text-on-primary shadow-xs transition-all cursor-pointer"
            : "mr-area-city-btn py-1.5 px-3 rounded-lg text-label-sm font-label-sm font-medium text-on-surface-variant hover:text-on-surface transition-all cursor-pointer";
        });
        const list = districtsByCity[draft.areaCity] || [];
        if (areaCityCount) {
          areaCityCount.textContent = Picker.formatAreaCityCountLabel(draft.areaCity, list, draft.areas.length);
        }
        areaSelectedClear?.classList.toggle("hidden", draft.areas.length === 0);
      };

      const renderAreaOptions = () => {
        syncAreaCityUI();
        if (!areaList) return;
        const districts = districtsByCity[draft.areaCity] || [];
        areaList.innerHTML = Picker.buildDistrictCheckboxOptionsHtml(districts, draft.areas, (d) =>
          getDistrictRoommateCount(draft.areaCity, d)
        );
        areaList.querySelectorAll(".area-checkbox").forEach((cb) => {
          cb.addEventListener("change", () => {
            draft.areas = Array.from(areaList.querySelectorAll(".area-checkbox"))
              .filter((x) => x.checked)
              .map((x) => x.value);
            renderAreaOptions();
            syncFooterUI();
          });
        });
      };

      const setAreaCity = (nextCity, options = {}) => {
        if (!nextCity || !districtsByCity[nextCity]) return;
        if (draft.areaCity !== nextCity) {
          draft.areaCity = nextCity;
          draft.areas = [];
        }
        if (!options.preserveUniversity && draft.selectedUniversity && draft.selectedUniversity.city !== nextCity) {
          draft.selectedUniversity = null;
          draft.search = "";
          if (searchInput) searchInput.value = "";
          uniAutocomplete.syncUI();
        }
        renderAreaOptions();
        syncFooterUI();
      };

      const syncPillsUI = () => {
        pricePills.forEach((pill) => {
          const active = draft.priceRange === pill.dataset.price;
          pill.className = active
            ? "mr-price-pill py-1.5 rounded-lg text-center bg-primary text-on-primary text-label-sm font-label-sm font-semibold transition-all cursor-pointer"
            : "mr-price-pill py-1.5 rounded-lg text-center bg-surface-container-low hover:bg-surface-container text-label-sm font-label-sm text-on-surface transition-all cursor-pointer";
        });
        if (priceDisplay) priceDisplay.textContent = Picker.SHARED_PRICE_LABELS[draft.priceRange] || "Tất cả mức giá";

        tabPills.forEach((btn) => {
          const active = draft.tab === btn.dataset.tab;
          btn.setAttribute("aria-pressed", active ? "true" : "false");
          btn.className = active
            ? "mr-tab-pill px-3 py-2 rounded-xl border border-primary bg-primary text-on-primary text-left text-body-sm font-semibold shadow-xs transition-all cursor-pointer flex items-center justify-between gap-2"
            : "mr-tab-pill px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface hover:border-primary/40 hover:bg-surface-container text-left text-body-sm font-medium transition-all cursor-pointer flex items-center justify-between gap-2";
          const badge = btn.querySelector(".mr-tab-count");
          if (badge) {
            badge.className = active
              ? "mr-tab-count px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-on-primary"
              : "mr-tab-count px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-surface-container-highest text-on-surface-variant";
          }
        });

        genderPills.forEach((btn) => {
          const active = draft.gender === btn.dataset.gender;
          btn.setAttribute("aria-pressed", active ? "true" : "false");
          btn.className = active
            ? "mr-gender-pill py-1.5 px-3 rounded-lg text-center bg-primary text-on-primary text-label-sm font-label-sm font-semibold transition-all cursor-pointer"
            : "mr-gender-pill py-1.5 px-3 rounded-lg text-center bg-surface-container-low hover:bg-surface-container text-label-sm font-label-sm text-on-surface transition-all cursor-pointer";
        });
      };

      const syncFooterUI = () => {
        const previewMatches = filterRoommates(draft);
        applyBtn.textContent = `Xem ${previewMatches.length} ứng viên`;
        const hasDraftFilter =
          Boolean(draft.selectedUniversity) ||
          Boolean(draft.search.trim()) ||
          draft.areaCity !== "TP.HCM" ||
          draft.priceRange !== "all" ||
          draft.areas.length > 0 ||
          draft.tab !== "all" ||
          draft.gender !== "all";
        resetBtn.disabled = !hasDraftFilter;
        resetBtn.classList.toggle("opacity-50", !hasDraftFilter);
        resetBtn.classList.toggle("cursor-not-allowed", !hasDraftFilter);
      };

      const handleKeydown = (event) => {
        if (event.key === "Escape") {
          if (uniAutocomplete.isOpen()) uniAutocomplete.close();
          else closeDrawer();
        }
      };

      pricePills.forEach((pill) => {
        pill.addEventListener("click", () => {
          draft.priceRange = draft.priceRange === pill.dataset.price ? "all" : pill.dataset.price;
          syncPillsUI();
          syncFooterUI();
        });
      });
      areaCityBtns.forEach((btn) => btn.addEventListener("click", () => setAreaCity(btn.dataset.areaCity || "TP.HCM")));
      areaSelectedClear?.addEventListener("click", () => {
        draft.areas = [];
        renderAreaOptions();
        syncFooterUI();
      });
      tabPills.forEach((btn) => {
        btn.addEventListener("click", () => {
          draft.tab = btn.dataset.tab || "all";
          syncPillsUI();
          syncFooterUI();
        });
      });
      genderPills.forEach((btn) => {
        btn.addEventListener("click", () => {
          draft.gender = btn.dataset.gender || "all";
          syncPillsUI();
          syncFooterUI();
        });
      });
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeDrawer();
        else if (uniAutocomplete.isOpen() && !uniAutocomplete.contains(event.target)) uniAutocomplete.close();
      });
      closeBtn.addEventListener("click", closeDrawer);
      resetBtn.addEventListener("click", () => {
        Object.assign(draft, createDefaultFilterState());
        if (searchInput) searchInput.value = "";
        uniAutocomplete.close();
        uniAutocomplete.syncUI();
        renderAreaOptions();
        syncPillsUI();
        syncFooterUI();
      });
      applyBtn.addEventListener("click", () => {
        uniAutocomplete.close();
        Object.assign(state, { ...draft, areas: [...draft.areas], showAll: false });
        renderMatches();
        closeDrawer();
      });

      uniAutocomplete.syncUI();
      renderAreaOptions();
      syncPillsUI();
      syncFooterUI();

      document.body.appendChild(overlay);
      document.body.classList.add("overflow-hidden");
      filterToggleBtn?.setAttribute("aria-expanded", "true");
      document.addEventListener("keydown", handleKeydown);
      requestAnimationFrame(() => {
        overlay.classList.remove("opacity-0");
        drawer?.classList.remove("translate-x-full");
      });
      closeBtn.focus();
    }

    function buildEmptyMatchHtml() {
      const districtMap = new Map((districtsByCity[state.areaCity] || []).map((d) => [d.key, d.name]));
      const selectedDistrictLabels = state.areas.map((k) => districtMap.get(k)).filter(Boolean);

      let emptyTitle = "Chưa có ứng viên khớp bộ lọc hiện tại";
      let emptyDesc = "Hãy thử nới rộng khu vực hoặc nhấn Đặt lại bộ lọc để xem toàn bộ hồ sơ.";

      if (state.selectedUniversity) {
        emptyTitle = `Chưa có ứng viên phù hợp gần ${escapeHTML(state.selectedUniversity.name)}`;
        emptyDesc = `Khu vực ${escapeHTML(state.selectedUniversity.district)}, ${escapeHTML(
          state.selectedUniversity.city
        )} hiện chưa có hồ sơ khả dụng khớp các tiêu chí đã chọn.`;
      } else if (selectedDistrictLabels.length > 0) {
        emptyTitle = `Chưa có ứng viên tại ${escapeHTML(selectedDistrictLabels.join(", "))} (${escapeHTML(state.areaCity)})`;
        emptyDesc = "Hiện chưa có hồ sơ phù hợp trong các quận đã chọn. Hãy chọn thêm quận khác hoặc Đặt lại bộ lọc.";
      } else if (state.areaCity === "Hà Nội") {
        emptyTitle = "Chưa có ứng viên tại khu vực Hà Nội";
        emptyDesc = "Hiện chưa có hồ sơ khả dụng tại khu vực này. Bạn có thể chọn khu vực khác hoặc Đặt lại bộ lọc.";
      }

      return `
        <div class="md:col-span-2 bg-surface-container-lowest rounded-2xl p-10 text-center shadow-sm flex flex-col items-center">
          <span class="material-symbols-outlined text-5xl text-outline mb-2">person_search</span>
          <h3 class="font-title-md text-title-md font-bold text-on-surface mb-1">${emptyTitle}</h3>
          <p class="text-sm text-on-surface-variant mb-4 max-w-md">${emptyDesc}</p>
          <div class="flex flex-wrap items-center justify-center gap-2.5">
            <button type="button" id="mr-reopen-filters" class="px-5 py-2.5 rounded-xl bg-surface-container-high text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors cursor-pointer">Điều chỉnh bộ lọc</button>
            <button type="button" id="mr-reset-filters" class="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-on-primary-fixed-variant transition-colors cursor-pointer">Đặt lại bộ lọc</button>
          </div>
        </div>
      `;
    }

    function renderMatches() {
      if (!grid) return;
      const allRoommates = Data.ROOMMATES || [];
      const list = filterRoommates(state);
      syncFilterToolbarUI(list.length, allRoommates.length);

      const visible = state.showAll ? list : list.slice(0, 4);
      const remaining = Math.max(0, list.length - 4);
      if (loadMoreBtn) {
        loadMoreBtn.classList.toggle("hidden", state.showAll || remaining === 0);
        if (loadMoreLabel && remaining > 0) {
          loadMoreLabel.textContent = `Xem thêm ${remaining} bạn sinh viên phù hợp khác`;
        }
      }

      if (visible.length === 0) {
        grid.innerHTML = buildEmptyMatchHtml();
        grid.querySelector("#mr-reset-filters")?.addEventListener("click", resetAllFilters);
        grid.querySelector("#mr-reopen-filters")?.addEventListener("click", openRoommateFilterDrawer);
        return;
      }

      grid.innerHTML = visible.map((rm) => buildRoommateCardHtml(rm)).join("");

      grid.querySelectorAll("[data-connect-rm]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const rm = Data.ROOMMATES.find((r) => r.id === btn.dataset.connectRm);
          if (!rm) return;
          const existing = Core.getConnectionForPartner(rm.id, rm.name);
          if (existing?.status === "incoming") {
            if (Core.getActiveSlotConnections().length >= Core.MAX_CONTACT_SLOTS) {
              Core.openSlotFullModal();
              return;
            }
            const accepted = Core.updateConnectionStatus(existing.id, "accepted");
            renderMatches();
            Core.showToast(`Đã đồng ý kết nối với ${rm.name}! Zalo & SĐT đã được mở khóa.`);
            Core.openContactUnlockedModal(accepted, renderMatches);
            return;
          }
          Core.openConnectInviteModal({
            partnerId: rm.id,
            name: rm.name,
            meta: `${rm.school} • ${rm.matchScore}% Hợp gu`,
            avatar: rm.avatar,
            roomId: rm.linkedRoomId,
            contact: rm.contact,
            onUpdate: renderMatches
          });
        });
      });

      grid.querySelectorAll("[data-profile-rm]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const rm = Data.ROOMMATES.find((r) => r.id === btn.dataset.profileRm);
          if (rm) Core.openProfileModal(rm, renderMatches);
        });
      });
    }

    filterToggleBtn?.addEventListener("click", openRoommateFilterDrawer);
    window.addEventListener("roomie:connections-updated", renderMatches);
    loadMoreBtn?.addEventListener("click", () => {
      state.showAll = true;
      renderMatches();
      Core.showToast("Đã hiển thị thêm các bạn sinh viên tương thích!", "info");
    });

    document.getElementById("mr-share-result-btn")?.addEventListener("click", async () => {
      const arch = document.getElementById("mr-archetype-title")?.textContent || "Kỷ Luật Tự Do";
      try {
        await navigator.clipboard.writeText(
          `Mình vừa làm Test Roomie và thuộc tuýp ${arch}! Xem bạn hợp gu: ${window.location.origin}/roomie/trac-nghiem`
        );
        Core.showToast("Đã sao chép Thẻ cá tính ở trọ để chia sẻ!");
      } catch {
        Core.showToast(`Bạn thuộc tuýp ${arch}`, "info");
      }
    });
    document.getElementById("mr-retake-quiz-btn")?.addEventListener("click", () => {
      window.location.href = "/roomie/trac-nghiem";
    });
    document.getElementById("mr-download-contract-btn")?.addEventListener("click", () => {
      Core.showToast("Đang tải mẫu thỏa thuận nội quy (.PDF)!");
    });

    const matchPlusBtn = document.getElementById("mr-match-plus-btn");
    if (matchPlusBtn) {
      const defaultMatchPlusLabel = matchPlusBtn.textContent.trim();
      const syncMatchPlusBtn = () => {
        const unlocked = Core.hasPurchasedPlan("match-plus") || Core.hasPurchasedPlan("combo");
        matchPlusBtn.textContent = unlocked ? "✓ Đã kích hoạt Match Plus" : defaultMatchPlusLabel;
      };
      matchPlusBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const pkg = (Data.PRICING_PACKAGES || []).find((p) => p.id === "match-plus");
        if (pkg) Core.openPaymentModal(pkg);
      });
      syncMatchPlusBtn();
      Core.onPlanStateChange(syncMatchPlusBtn);
    }

    renderMatches();
  }

  function buildRoommateCardHtml(rm) {
    const conn = Core.getConnectionForPartner(rm.id, rm.name);
    const status = conn?.status || "none";
    const primaryLabel =
      status === "accepted"
        ? "Mở Zalo / SĐT"
        : status === "matched"
        ? "Đã chốt Roommate"
        : status === "pending"
        ? "Chờ đồng ý (1 slot)"
        : status === "incoming"
        ? "Đồng ý kết nối"
        : "Gửi lời mời kết nối";
    const primaryIcon =
      status === "accepted" ? "verified" : status === "matched" ? "done_all" : status === "pending" ? "hourglass_top" : "handshake";
    const primaryCls =
      status === "accepted" || status === "matched"
        ? "bg-tertiary hover:bg-on-tertiary-fixed-variant text-on-tertiary"
        : status === "pending"
        ? "bg-primary-fixed text-on-primary-fixed-variant hover:bg-primary-fixed-dim"
        : "bg-primary text-on-primary hover:bg-on-primary-fixed-variant";

    return `
      <article class="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md border border-outline-variant/20 transition-shadow flex flex-col justify-between gap-6 sm:gap-7 relative overflow-hidden group">
        <div class="flex flex-col gap-5">
          <div class="flex items-start justify-between gap-space-sm">
            <div class="flex items-center gap-4 sm:gap-5">
              <div class="relative shrink-0">
                <img class="w-[74px] h-[74px] sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-primary-fixed" src="${escapeHTML(
                  rm.avatar
                )}" alt="Ảnh đại diện ${escapeHTML(rm.name)}" />
                <span class="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-sm text-[11px] font-bold shadow-xs">${escapeHTML(
                  rm.matchScore
                )}%</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="font-headline-sm text-[20px] leading-[28px] font-bold text-on-surface group-hover:text-primary transition-colors">${escapeHTML(
                    rm.name
                  )}</h3>
                  <span class="font-body-md text-[14px] text-on-surface-variant">· ${escapeHTML(rm.age)}t</span>
                </div>
                <span class="font-label-md text-[13px] text-tertiary flex items-center gap-1.5 font-semibold">
                  <span class="material-symbols-outlined text-[16px]">school</span>
                  ${escapeHTML(rm.school)}
                </span>
                <span class="font-body-md text-[13.5px] text-on-surface-variant">${escapeHTML(rm.major)}</span>
              </div>
            </div>
            <span class="px-3.5 py-2 rounded-xl ${
              rm.matchScore >= 95 ? "bg-secondary-container text-on-secondary-fixed-variant" : "bg-surface-container text-on-surface"
            } font-label-md text-[13.5px] font-bold flex items-center gap-1.5 shrink-0">
              ${rm.matchScore >= 95 ? `<span class="material-symbols-outlined text-[18px]">verified</span>` : ""}
              ${escapeHTML(rm.matchLabel)}
            </span>
          </div>

          <div class="p-3.5 sm:p-4 rounded-2xl ${
            rm.hasRoom ? "bg-primary-fixed/40 text-on-primary-fixed-variant" : "bg-surface-container-low text-on-surface"
          } flex items-center gap-2.5 font-body-md text-[13.5px] leading-relaxed">
            <span class="material-symbols-outlined text-[20px] shrink-0 ${rm.hasRoom ? "text-primary" : "text-tertiary"}">${
      rm.hasRoom ? "apartment" : "search"
    }</span>
            <span><strong>${escapeHTML(rm.roomStatusTitle)}</strong> ${escapeHTML(rm.roomStatusDetail)}</span>
          </div>

          <div class="flex flex-col gap-2">
            <span class="font-label-sm text-[11.5px] text-outline uppercase tracking-wide font-semibold">Tiêu chí lối sống tương hợp:</span>
            <div class="flex flex-wrap gap-2">
              ${(rm.criteria || [])
                .map(
                  (c) => `<span class="px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface font-body-md text-[13px] flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-tertiary text-[15px]">check</span>
                    ${escapeHTML(c)}
                  </span>`
                )
                .join("")}
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 pt-1">
          <button type="button" data-connect-rm="${escapeHTML(rm.id)}" class="flex-1 py-3 px-5 rounded-xl ${primaryCls} font-label-md text-[14px] font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer">
            <span class="material-symbols-outlined text-[19px]">${primaryIcon}</span>
            <span>${primaryLabel}</span>
          </button>
          <button type="button" data-profile-rm="${escapeHTML(rm.id)}" class="py-3 px-5 rounded-xl bg-surface-container-high text-on-surface font-label-md text-[14px] font-semibold hover:bg-surface-container transition-colors flex items-center gap-1.5 cursor-pointer" title="Xem hồ sơ chi tiết">
            <span class="material-symbols-outlined text-[19px]">person</span>
            <span>Hồ sơ</span>
          </button>
        </div>
      </article>
    `;
  }

  function buildFilterDrawerHtml(draft, tabCounts) {
    return `
      <aside id="mr-filter-drawer" role="dialog" aria-modal="true" aria-labelledby="mr-filter-drawer-title" class="absolute inset-y-0 right-0 flex w-full max-w-md translate-x-full flex-col border-l border-surface-container bg-surface-container-lowest shadow-2xl transition-transform duration-300 ease-out">
        <div class="flex items-center justify-between border-b border-surface-container px-5 py-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-primary-fixed/70 text-primary flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">tune</span>
            </div>
            <div>
              <h2 id="mr-filter-drawer-title" class="font-title-md text-title-md font-bold text-on-surface">Bộ lọc</h2>
              <p class="text-xs text-on-surface-variant">Đồng bộ trường ĐH, khu vực &amp; mức giá với Tìm phòng</p>
            </div>
          </div>
          <button type="button" id="mr-filter-close" aria-label="Đóng bộ lọc" class="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div id="mr-filter-drawer-body" class="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          <div class="flex flex-col gap-1.5" id="mr-campus-search-wrapper">
            <label class="font-label-md text-label-md text-on-surface font-medium" for="mr-campus-search">Khu vực, trường học</label>
            <div class="relative">
              <div class="relative flex items-center">
                <span class="material-symbols-outlined absolute left-3 text-on-surface-variant text-body-lg pointer-events-none">search</span>
                <input autocomplete="off" aria-autocomplete="list" aria-controls="mr-university-suggestions" aria-expanded="false" class="w-full pl-9 pr-9 py-2 rounded-xl bg-surface-container-low text-body-md text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" id="mr-campus-search" placeholder="Nhập tên trường (TP.HCM, Hà Nội), khu vực..." role="combobox" type="text" value="${escapeHTML(
                  draft.search
                )}" />
                <button aria-label="Xóa tìm kiếm" class="hidden absolute right-2 w-6 h-6 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors cursor-pointer" id="mr-campus-search-clear" type="button">
                  <span class="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <div class="hidden absolute left-0 right-0 top-[calc(100%+6px)] z-40 bg-surface-container-lowest rounded-2xl shadow-[0_16px_32px_-8px_rgba(24,28,35,0.16)] border border-outline-variant/40 overflow-hidden" id="mr-university-suggestions" role="listbox">
                <div class="flex items-center justify-between gap-2 px-3 py-2 bg-surface-container-low/80 border-b border-surface-container">
                  <span class="text-[11px] font-semibold text-on-surface-variant truncate" id="mr-uni-dropdown-count">Trường ĐH tại TP.HCM &amp; Hà Nội</span>
                  <div class="flex items-center gap-1 shrink-0" id="mr-uni-city-tabs">
                    <button class="mr-uni-city-tab px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary text-on-primary transition-colors cursor-pointer" data-city="all" type="button">Tất cả</button>
                    <button class="mr-uni-city-tab px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" data-city="TP.HCM" type="button">TP.HCM</button>
                    <button class="mr-uni-city-tab px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" data-city="Hà Nội" type="button">Hà Nội</button>
                  </div>
                </div>
                <div class="max-h-60 overflow-y-auto divide-y divide-surface-container/60" id="mr-university-suggestions-list"></div>
              </div>
            </div>
            <div class="hidden items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-primary-fixed/60 border border-primary/20 text-on-primary-fixed text-xs" id="mr-selected-university-chip">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="material-symbols-outlined text-[15px] text-primary shrink-0">school</span>
                <span class="font-medium truncate" id="mr-selected-university-label"></span>
              </div>
              <button aria-label="Bỏ chọn trường" class="shrink-0 w-5 h-5 rounded-full hover:bg-primary/15 flex items-center justify-center text-on-primary-fixed-variant transition-colors cursor-pointer" id="mr-selected-university-remove" type="button">
                <span class="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="font-label-md text-label-md text-on-surface font-medium">Mức giá</span>
              <span class="font-label-sm text-label-sm text-primary font-semibold" id="mr-price-display">Tất cả mức giá</span>
            </div>
            <div class="grid grid-cols-4 gap-1.5">
              ${(Picker.SHARED_PRICE_OPTIONS || [])
                .map(
                  (opt) =>
                    `<button class="mr-price-pill py-1.5 rounded-lg text-center bg-surface-container-low hover:bg-surface-container text-label-sm font-label-sm text-on-surface transition-all cursor-pointer" data-price="${escapeHTML(
                      opt.value
                    )}" type="button">${escapeHTML(opt.pillLabel)}</button>`
                )
                .join("")}
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between gap-2">
              <span class="font-label-md text-label-md text-on-surface font-medium">Khu vực</span>
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-medium text-on-surface-variant" id="mr-area-city-count">17 quận / TP</span>
                <button class="hidden font-label-sm text-label-sm text-primary hover:underline transition-colors cursor-pointer" id="mr-area-selected-clear" type="button">Bỏ chọn</button>
              </div>
            </div>
            <div aria-label="Chọn thành phố" class="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface-container-low" id="mr-area-city-toggle" role="tablist">
              <button aria-selected="true" class="mr-area-city-btn py-1.5 px-3 rounded-lg text-label-sm font-label-sm font-semibold bg-primary text-on-primary shadow-xs transition-all cursor-pointer" data-area-city="TP.HCM" role="tab" type="button">TP.HCM</button>
              <button aria-selected="false" class="mr-area-city-btn py-1.5 px-3 rounded-lg text-label-sm font-label-sm font-medium text-on-surface-variant hover:text-on-surface transition-all cursor-pointer" data-area-city="Hà Nội" role="tab" type="button">Hà Nội</button>
            </div>
            <div class="flex max-h-44 flex-col gap-0.5 overflow-y-auto rounded-xl bg-surface-container-low p-1.5" id="mr-area-filter-options"></div>
          </div>

          <div class="flex flex-col gap-2">
            <span class="font-label-md text-label-md text-on-surface font-medium">Nhóm ứng viên</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              ${FILTER_GROUPS.tab
                .map(
                  (opt) => `
                <button type="button" class="mr-tab-pill px-3 py-2 rounded-xl border text-left text-body-sm font-medium transition-all cursor-pointer flex items-center justify-between gap-2" data-tab="${escapeHTML(
                  opt.value
                )}">
                  <span>${escapeHTML(opt.label)}</span>
                  <span class="mr-tab-count px-1.5 py-0.5 rounded-full text-[11px] font-bold">${tabCounts[opt.value] ?? 0}</span>
                </button>`
                )
                .join("")}
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <span class="font-label-md text-label-md text-on-surface font-medium">Giới tính</span>
            <div class="grid grid-cols-3 gap-1.5">
              ${FILTER_GROUPS.gender
                .map(
                  (opt) =>
                    `<button type="button" class="mr-gender-pill py-1.5 px-3 rounded-lg text-center text-label-sm font-label-sm transition-all cursor-pointer" data-gender="${escapeHTML(
                      opt.value
                    )}">${escapeHTML(opt.label)}</button>`
                )
                .join("")}
            </div>
          </div>
        </div>
        <div class="border-t border-surface-container bg-surface-container-low/60 px-5 py-4 flex items-center gap-3">
          <button type="button" id="mr-drawer-reset-btn" class="px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors cursor-pointer">Đặt lại</button>
          <button type="button" id="mr-drawer-apply-btn" class="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-sm transition-colors cursor-pointer">Áp dụng bộ lọc</button>
        </div>
      </aside>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "tim-roommate") initMatchResultsPage();
  });
})();
