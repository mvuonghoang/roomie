/**
 * Roomie Shared Location, District & University Autocomplete Helpers
 * Dùng chung cho Tìm phòng, Tìm roommate và Liên hệ nhằm loại bỏ lặp code.
 */
(function () {
  const Data = window.RoomieData || {};
  const Core = window.RoomieCore || {};
  const { escapeHTML, normalizeSearchText } = Core;

  const SHARED_PRICE_OPTIONS = [
    { value: "<1.5", pillLabel: "<1.5tr", displayLabel: "< 1.5tr/th" },
    { value: "1.5-2.5", pillLabel: "1.5 - 2.5tr", displayLabel: "1.5 - 2.5tr/th" },
    { value: "2.5-3.5", pillLabel: "2.5 - 3.5tr", displayLabel: "2.5 - 3.5tr/th" },
    { value: ">3.5", pillLabel: ">3.5tr", displayLabel: "> 3.5tr/th" }
  ];

  const SHARED_PRICE_LABELS = {
    all: "Tất cả mức giá",
    "<1.5": "< 1.5tr/th",
    "1.5-2.5": "1.5 - 2.5tr/th",
    "2.5-3.5": "2.5 - 3.5tr/th",
    ">3.5": "> 3.5tr/th"
  };

  function getSharedDistrictsByCity() {
    return (
      Data.DISTRICTS_BY_CITY || {
        "TP.HCM": [
          { key: "thu-duc", name: "TP. Thủ Đức / ĐHQG" },
          { key: "binh-thanh", name: "Quận Bình Thạnh" },
          { key: "quan-5", name: "Quận 5" },
          { key: "quan-10", name: "Quận 10" },
          { key: "go-vap", name: "Quận Gò Vấp" }
        ],
        "Hà Nội": []
      }
    );
  }

  function highlightMatchedText(text, query) {
    const raw = String(text || "");
    const normQuery = normalizeSearchText(query);
    if (!normQuery) return escapeHTML(raw);

    const charMap = [];
    let stripped = "";
    for (let i = 0; i < raw.length; i++) {
      const n = raw[i]
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");
      for (let j = 0; j < n.length; j++) {
        charMap.push(i);
        stripped += n[j];
      }
    }

    const tokens = Array.from(new Set(normQuery.split(" ").filter((t) => t.length >= 2)));
    if (tokens.length === 0) tokens.push(normQuery);

    const ranges = [];
    tokens.forEach((tok) => {
      let idx = stripped.indexOf(tok);
      while (idx !== -1) {
        ranges.push([charMap[idx], charMap[idx + tok.length - 1] + 1]);
        idx = stripped.indexOf(tok, idx + tok.length);
      }
    });

    if (ranges.length === 0) return escapeHTML(raw);
    ranges.sort((a, b) => a[0] - b[0]);
    const merged = [];
    ranges.forEach(([s, e]) => {
      if (!merged.length || s > merged[merged.length - 1][1]) merged.push([s, e]);
      else merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e);
    });

    let out = "";
    let cursor = 0;
    merged.forEach(([s, e]) => {
      if (s > cursor) out += escapeHTML(raw.slice(cursor, s));
      out += `<mark class="bg-primary-fixed text-on-primary-fixed rounded px-0.5 font-semibold">${escapeHTML(
        raw.slice(s, e)
      )}</mark>`;
      cursor = e;
    });
    if (cursor < raw.length) out += escapeHTML(raw.slice(cursor));
    return out;
  }

  let cachedIndexedUniversities = null;
  function getIndexedUniversities() {
    if (cachedIndexedUniversities) return cachedIndexedUniversities;
    const rawUniversities = Array.isArray(Data.UNIVERSITIES_HCM_HN) ? Data.UNIVERSITIES_HCM_HN : [];
    cachedIndexedUniversities = rawUniversities.map((u) => {
      const cityTokens =
        u.city === "TP.HCM" ? "tp.hcm tphcm thanh pho ho chi minh hcm sai gon" : "ha noi hn thu do";
      const normName = normalizeSearchText(u.name);
      const normShortName = normName.replace(/^(truong\s+)?(dai\s+hoc|hoc\s+vien)\s+/, "");
      const normCode = normalizeSearchText(u.code);
      const normAliases = (u.aliases || []).map(normalizeSearchText);
      const normDistrict = normalizeSearchText(u.district);
      const normCity = normalizeSearchText(`${u.city} ${cityTokens}`);
      return {
        ...u,
        _normName: normName,
        _normShortName: normShortName,
        _normCode: normCode,
        _normAliases: normAliases,
        _normDistrict: normDistrict,
        _normCity: normCity,
        _combined: `${normName} ${normCode} ${normAliases.join(" ")} ${normDistrict} ${normCity}`
      };
    });
    return cachedIndexedUniversities;
  }

  function scoreUniversity(uni, normQuery, tokens) {
    if (!normQuery) return 1;
    for (let i = 0; i < tokens.length; i++) {
      if (!uni._combined.includes(tokens[i])) return 0;
    }

    let score = 15;
    if (uni._normCode === normQuery) score += 120;
    else if (uni._normAliases.some((a) => a === normQuery)) score += 105;
    else if (uni._normCode.startsWith(normQuery) || uni._normAliases.some((a) => a.startsWith(normQuery))) {
      score += 85;
    }

    if (uni._normName.startsWith(normQuery) || uni._normShortName.startsWith(normQuery)) score += 75;
    else if (uni._normName.includes(normQuery) || uni._normAliases.some((a) => a.includes(normQuery))) score += 50;

    if (uni._normDistrict.includes(normQuery)) score += 25;
    if (uni._normCity.includes(normQuery)) score += 10;
    return score;
  }

  function getMatchingUniversities(queryText, cityFilter) {
    const indexedUniversities = getIndexedUniversities();
    const normQuery = normalizeSearchText(queryText);
    const tokens = normQuery ? normQuery.split(" ").filter(Boolean) : [];
    const pool =
      cityFilter && cityFilter !== "all"
        ? indexedUniversities.filter((u) => u.city === cityFilter)
        : indexedUniversities;

    if (!normQuery) return pool;

    const scored = [];
    for (let i = 0; i < pool.length; i++) {
      const u = pool[i];
      const s = scoreUniversity(u, normQuery, tokens);
      if (s > 0) scored.push({ uni: u, score: s });
    }
    scored.sort((a, b) => b.score - a.score || a.uni.name.localeCompare(b.uni.name, "vi"));
    return scored.map((item) => item.uni);
  }

  function buildUniversitySuggestionsHtml(suggestions, selectedUniversity, activeIndex, queryText) {
    if (suggestions.length === 0) {
      return `
        <div class="px-3.5 py-5 text-center flex flex-col items-center gap-1.5">
          <span class="material-symbols-outlined text-2xl text-outline">school</span>
          <p class="text-xs font-medium text-on-surface">Không tìm thấy trường đại học phù hợp</p>
          <p class="text-[11px] text-on-surface-variant">Thử nhập tên tắt (HCMUS, HUST, UEH, NEU, FPT...) hoặc quận/khu vực tại TP.HCM &amp; Hà Nội.</p>
        </div>
      `;
    }
    const highlightQuery = String(queryText || "").trim();
    return suggestions
      .map((u, idx) => {
        const isSelected = selectedUniversity && selectedUniversity.id === u.id;
        const isActive = idx === activeIndex;
        const cityBadgeClass =
          u.city === "TP.HCM"
            ? "bg-secondary-container/70 text-on-secondary-fixed"
            : "bg-primary-fixed/80 text-on-primary-fixed";
        return `
          <button
            type="button"
            role="option"
            aria-selected="${isActive || isSelected ? "true" : "false"}"
            data-uni-idx="${idx}"
            class="w-full text-left px-3 py-2.5 flex items-start justify-between gap-2.5 hover:bg-surface-container-low/90 transition-colors cursor-pointer ${
              isActive ? "bg-primary-fixed/40" : isSelected ? "bg-primary-fixed/25" : ""
            }"
          >
            <div class="min-w-0 flex-1 flex flex-col gap-0.5">
              <div class="text-[13px] font-medium text-on-surface leading-snug">
                ${highlightMatchedText(u.name, highlightQuery)}
              </div>
              <div class="flex items-center gap-1.5 flex-wrap text-[11px] text-on-surface-variant">
                <span class="font-semibold text-primary">${highlightMatchedText(u.code, highlightQuery)}</span>
                <span>·</span>
                <span>${highlightMatchedText(u.district, highlightQuery)}</span>
              </div>
            </div>
            <span class="shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cityBadgeClass}">
              ${escapeHTML(u.city)}
            </span>
          </button>
        `;
      })
      .join("");
  }

  function buildDistrictCheckboxOptionsHtml(districts, selectedAreas, getCountFn) {
    return districts
      .map((d) => {
        const checked = selectedAreas.includes(d.key);
        const count = getCountFn(d);
        const countClass = count > 0 ? "text-on-surface-variant font-medium" : "text-outline/70";
        return `
          <label class="area-option flex items-center justify-between py-1 px-2 rounded-lg hover:bg-surface-container-lowest/80 cursor-pointer transition-colors text-body-sm ${
            checked ? "bg-surface-container-lowest/90" : ""
          }">
            <div class="flex items-center gap-2 min-w-0">
              <input class="area-checkbox w-4 h-4 rounded text-primary accent-primary cursor-pointer shrink-0" type="checkbox" value="${escapeHTML(
                d.key
              )}"${checked ? " checked" : ""} />
              <span class="area-option-name truncate ${checked ? "font-medium text-primary" : ""}">${escapeHTML(
          d.name
        )}</span>
            </div>
            <span class="area-option-count text-xs shrink-0 ${countClass}">${count}</span>
          </label>
        `;
      })
      .join("");
  }

  function inferLocationCity(locText, explicitCity) {
    if (explicitCity) return explicitCity;
    return normalizeSearchText(locText).includes("ha noi") ? "Hà Nội" : "TP.HCM";
  }

  function formatAreaCityCountLabel(city, districtsList, selectedCount) {
    if (selectedCount > 0) return `Đã chọn ${selectedCount}`;
    return city === "TP.HCM" ? `${districtsList.length} quận / TP` : `${districtsList.length} quận`;
  }

  /**
   * Bind a reusable University Autocomplete dropdown controller to DOM elements.
   * Eliminates duplicate keyboard navigation and chip synchronization across pages.
   */
  function createUniversityAutocomplete({
    wrapper,
    input,
    clearBtn,
    dropdown,
    listEl,
    countEl,
    cityTabs,
    selectedChip,
    selectedLabel,
    selectedRemoveBtn,
    tabClassBase,
    getState,
    onSelect,
    onClear,
    onInput
  }) {
    let suggestions = [];
    let activeIdx = -1;
    let isOpen = false;

    const activeTabCls = `${tabClassBase} px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary text-on-primary transition-colors cursor-pointer`;
    const inactiveTabCls = `${tabClassBase} px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer`;

    const syncUI = () => {
      const state = getState();
      clearBtn?.classList.toggle("hidden", !Boolean((input?.value || "").trim()));
      if (selectedChip && selectedLabel) {
        if (state.selectedUniversity) {
          const u = state.selectedUniversity;
          selectedLabel.textContent = `${u.code} · ${u.city} · ${u.district}`;
          selectedChip.classList.remove("hidden");
          selectedChip.classList.add("flex");
        } else {
          selectedChip.classList.add("hidden");
          selectedChip.classList.remove("flex");
        }
      }
      cityTabs.forEach((tab) => {
        tab.className = tab.dataset.city === state.uniCityFilter ? activeTabCls : inactiveTabCls;
      });
    };

    const updateActiveVisual = () => {
      if (!listEl) return;
      listEl.querySelectorAll("[data-uni-idx]").forEach((el, idx) => {
        const isActive = idx === activeIdx;
        el.classList.toggle("bg-primary-fixed/40", isActive);
        el.setAttribute("aria-selected", isActive ? "true" : "false");
        if (isActive) el.scrollIntoView({ block: "nearest" });
      });
    };

    const renderDropdown = () => {
      if (!dropdown || !listEl) return;
      syncUI();
      const state = getState();
      const query = state.selectedUniversity ? "" : input?.value || "";
      suggestions = getMatchingUniversities(query, state.uniCityFilter);
      if (activeIdx >= suggestions.length) activeIdx = -1;

      if (countEl) {
        const scope = state.uniCityFilter === "all" ? "TP.HCM & HN" : state.uniCityFilter;
        countEl.textContent = query.trim()
          ? `${suggestions.length} trường phù hợp`
          : `${suggestions.length} trường (${scope})`;
      }

      listEl.innerHTML = buildUniversitySuggestionsHtml(suggestions, state.selectedUniversity, activeIdx, query);
      listEl.querySelectorAll("[data-uni-idx]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const picked = suggestions[Number(btn.dataset.uniIdx)];
          if (picked) select(picked);
        });
      });
    };

    const open = () => {
      if (!dropdown) return;
      isOpen = true;
      dropdown.classList.remove("hidden");
      input?.setAttribute("aria-expanded", "true");
      renderDropdown();
    };

    const close = () => {
      if (!dropdown) return;
      isOpen = false;
      activeIdx = -1;
      dropdown.classList.add("hidden");
      input?.setAttribute("aria-expanded", "false");
    };

    const select = (uni) => {
      if (input) input.value = uni.name;
      close();
      onSelect(uni);
      syncUI();
    };

    const clear = (keepFocus = false) => {
      if (input) {
        input.value = "";
        if (keepFocus) input.focus();
      }
      onClear();
      syncUI();
      if (isOpen) renderDropdown();
    };

    input?.addEventListener("focus", open);
    input?.addEventListener("input", () => {
      const val = input.value;
      activeIdx = -1;
      onInput?.(val);
      open();
    });
    input?.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!isOpen) open();
        if (suggestions.length > 0) {
          activeIdx = (activeIdx + 1) % suggestions.length;
          updateActiveVisual();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen) open();
        if (suggestions.length > 0) {
          activeIdx = activeIdx <= 0 ? suggestions.length - 1 : activeIdx - 1;
          updateActiveVisual();
        }
      } else if (e.key === "Enter" && isOpen && suggestions.length > 0) {
        const state = getState();
        if (activeIdx >= 0 && suggestions[activeIdx]) {
          e.preventDefault();
          select(suggestions[activeIdx]);
        } else if (suggestions.length === 1 && !state.selectedUniversity) {
          e.preventDefault();
          select(suggestions[0]);
        } else {
          close();
        }
      } else if (e.key === "Escape") {
        close();
      }
    });

    clearBtn?.addEventListener("click", () => clear(true));
    selectedRemoveBtn?.addEventListener("click", () => clear(true));
    cityTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        getState().uniCityFilter = tab.dataset.city || "all";
        activeIdx = -1;
        renderDropdown();
        input?.focus();
      });
    });

    return {
      syncUI,
      renderDropdown,
      open,
      close,
      isOpen: () => isOpen,
      contains: (target) => Boolean(wrapper && wrapper.contains(target))
    };
  }

  window.RoomieLocationPicker = {
    SHARED_PRICE_OPTIONS,
    SHARED_PRICE_LABELS,
    getSharedDistrictsByCity,
    highlightMatchedText,
    getMatchingUniversities,
    buildUniversitySuggestionsHtml,
    buildDistrictCheckboxOptionsHtml,
    inferLocationCity,
    formatAreaCityCountLabel,
    createUniversityAutocomplete
  };
})();
