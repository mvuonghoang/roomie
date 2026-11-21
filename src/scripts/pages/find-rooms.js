/**
 * Page: Find Rooms (/roomie/tim-phong)
 * Bộ lọc phòng trọ theo trường ĐH (TP.HCM & Hà Nội), mức giá, khu vực, loại phòng, tiện ích và phân trang.
 */
(function () {
  const Core = window.RoomieCore || {};
  const Picker = window.RoomieLocationPicker || {};
  const { escapeHTML, normalizeSearchText } = Core;

  function initFindRoomsPage() {
    const grid = document.getElementById("rooms-grid");
    if (!grid) return;

    const searchInput = document.getElementById("campus-search");
    const pricePills = document.querySelectorAll(".price-pill");
    const priceDisplay = document.getElementById("price-display");
    const areaCityBtns = document.querySelectorAll(".area-city-btn");
    const areaCityCount = document.getElementById("area-city-count");
    const areaSelectedClear = document.getElementById("area-selected-clear");
    const areaList = document.getElementById("area-filter-options");
    const housingBtns = document.querySelectorAll(".housing-type-btn");
    const amenityCheckboxes = document.querySelectorAll(".amenity-checkbox");
    const sortSelect = document.getElementById("rooms-sort");
    const countLabel = document.getElementById("rooms-count-label");
    const rangeLabel = document.getElementById("rooms-range-label");
    const paginationEl = document.getElementById("rooms-pagination");
    const resetBtn = document.getElementById("reset-filter-btn");
    const applyBtn = document.getElementById("apply-filter-trigger");
    const toast = document.getElementById("filter-toast");

    const districtsByCity = Picker.getSharedDistrictsByCity();

    const state = {
      search: "",
      selectedUniversity: null,
      uniCityFilter: "all",
      areaCity: "TP.HCM",
      priceRange: "all",
      areas: [],
      type: "all",
      amenities: [],
      sort: "newest",
      savedOnly: false,
      page: 1,
      perPage: 6
    };

    function applyQueryParams() {
      const params = new URLSearchParams(window.location.search);
      if (params.get("city") === "Hà Nội" || params.get("city") === "ha-noi") {
        state.areaCity = "Hà Nội";
      }
      if (params.get("area")) {
        const areaParam = params.get("area");
        const mapped = areaParam === "quan-5-10" ? ["quan-5", "quan-10"] : [areaParam];
        state.areas = mapped;
        const hnKeys = new Set((districtsByCity["Hà Nội"] || []).map((d) => d.key));
        if (mapped.some((k) => hnKeys.has(k))) state.areaCity = "Hà Nội";
      }
      if (params.get("budget")) {
        const b = params.get("budget");
        if (b === "1-2" || b === "2-3") state.priceRange = "1.5-2.5";
        else if (b === "3-4") state.priceRange = ">3.5";
      }
      if (params.get("type")) {
        const t = params.get("type");
        if (t === "shared") state.type = "o-ghep";
        else if (t === "private") state.type = "phong-rieng";
      }
      if (params.get("saved") === "1") state.savedOnly = true;
      if (params.get("q")) {
        state.search = params.get("q");
        if (searchInput) searchInput.value = state.search;
      }
    }

    const uniAutocomplete = Picker.createUniversityAutocomplete({
      wrapper: document.getElementById("campus-search-wrapper"),
      input: searchInput,
      clearBtn: document.getElementById("campus-search-clear"),
      dropdown: document.getElementById("university-suggestions"),
      listEl: document.getElementById("university-suggestions-list"),
      countEl: document.getElementById("uni-dropdown-count"),
      cityTabs: document.querySelectorAll(".uni-city-tab"),
      selectedChip: document.getElementById("selected-university-chip"),
      selectedLabel: document.getElementById("selected-university-label"),
      selectedRemoveBtn: document.getElementById("selected-university-remove"),
      tabClassBase: "uni-city-tab",
      getState: () => state,
      onSelect: (uni) => {
        state.selectedUniversity = uni;
        state.search = uni.name;
        state.page = 1;
        if (uni.city && districtsByCity[uni.city] && state.areaCity !== uni.city) {
          setAreaCity(uni.city, { preserveUniversity: true, skipRender: true });
        }
        render();
      },
      onClear: () => {
        state.selectedUniversity = null;
        state.search = "";
        state.page = 1;
        render();
      },
      onInput: (val) => {
        if (state.selectedUniversity && val !== state.selectedUniversity.name) {
          state.selectedUniversity = null;
        }
        state.search = val;
        state.page = 1;
        render();
      }
    });

    function getRoomCity(room) {
      return Picker.inferLocationCity(`${room?.address || ""} ${room?.districtLabel || ""}`, room?.city);
    }

    function getDistrictRoomCount(city, district) {
      const all = Core.getAllRooms();
      const normDistName = normalizeSearchText(district.name);
      return all.filter((r) => {
        if (getRoomCity(r) !== city) return false;
        if (r.areaKey) return r.areaKey === district.key;
        return normalizeSearchText(r.districtLabel).includes(normDistName);
      }).length;
    }

    function syncAreaCityUI() {
      areaCityBtns.forEach((btn) => {
        const active = btn.dataset.areaCity === state.areaCity;
        btn.setAttribute("aria-selected", active ? "true" : "false");
        btn.className = active
          ? "area-city-btn py-1.5 px-3 rounded-lg text-label-sm font-label-sm font-semibold bg-primary text-on-primary shadow-xs transition-all cursor-pointer"
          : "area-city-btn py-1.5 px-3 rounded-lg text-label-sm font-label-sm font-medium text-on-surface-variant hover:text-on-surface transition-all cursor-pointer";
      });
      const list = districtsByCity[state.areaCity] || [];
      if (areaCityCount) {
        areaCityCount.textContent = Picker.formatAreaCityCountLabel(state.areaCity, list, state.areas.length);
      }
      areaSelectedClear?.classList.toggle("hidden", state.areas.length === 0);
    }

    function renderAreaOptions() {
      syncAreaCityUI();
      if (!areaList) return;
      const districts = districtsByCity[state.areaCity] || [];
      areaList.innerHTML = Picker.buildDistrictCheckboxOptionsHtml(districts, state.areas, (d) =>
        getDistrictRoomCount(state.areaCity, d)
      );
      areaList.querySelectorAll(".area-checkbox").forEach((cb) => {
        cb.addEventListener("change", () => {
          state.areas = Array.from(areaList.querySelectorAll(".area-checkbox"))
            .filter((x) => x.checked)
            .map((x) => x.value);
          state.page = 1;
          renderAreaOptions();
          render();
        });
      });
    }

    function setAreaCity(nextCity, options = {}) {
      if (!nextCity || !districtsByCity[nextCity]) return;
      if (state.areaCity !== nextCity) {
        state.areaCity = nextCity;
        state.areas = [];
        state.page = 1;
      }
      if (!options.preserveUniversity && state.selectedUniversity && state.selectedUniversity.city !== nextCity) {
        state.selectedUniversity = null;
        state.search = "";
        if (searchInput) searchInput.value = "";
        uniAutocomplete.syncUI();
      }
      renderAreaOptions();
      if (!options.skipRender) render();
    }

    function syncPillUI() {
      pricePills.forEach((pill) => {
        const active = state.priceRange === pill.dataset.price;
        pill.className = active
          ? "price-pill py-1.5 rounded-lg text-center bg-primary text-on-primary text-label-sm font-label-sm font-semibold transition-all cursor-pointer"
          : "price-pill py-1.5 rounded-lg text-center bg-surface-container-low hover:bg-surface-container text-label-sm font-label-sm text-on-surface transition-all cursor-pointer";
      });
      if (priceDisplay) {
        priceDisplay.textContent = Picker.SHARED_PRICE_LABELS[state.priceRange] || "Tất cả mức giá";
      }
      housingBtns.forEach((btn) => {
        const active = btn.dataset.type === state.type;
        btn.className = active
          ? "housing-type-btn px-3 py-1 rounded-full text-label-sm font-label-sm bg-primary text-on-primary cursor-pointer"
          : "housing-type-btn px-3 py-1 rounded-full text-label-sm font-label-sm bg-surface-container-low text-on-surface hover:bg-surface-container cursor-pointer";
      });
    }

    function getRoomSearchHaystack(room) {
      const descText = Array.isArray(room.description) ? room.description.join(" ") : room.description || "";
      const rmText = room.roommate ? `${room.roommate.bioTitle || ""} ${room.roommate.note || ""}` : "";
      return normalizeSearchText(
        `${room.title} ${room.shortTitle} ${room.address} ${room.districtLabel} ${room.shortAddress} ${room.distanceLabel} ${room.schoolDistanceBadge || ""} ${descText} ${rmText}`
      );
    }

    function filterRooms() {
      const all = Core.getAllRooms();
      const saved = Core.getSavedRoomIds();
      const normSearch = normalizeSearchText(state.search);

      let list = all.filter((r) => {
        if (state.savedOnly && !saved.includes(String(r.id))) return false;
        if (state.areaCity && getRoomCity(r) !== state.areaCity) return false;
        if (state.selectedUniversity) {
          const uni = state.selectedUniversity;
          if (getRoomCity(r) !== uni.city) return false;
          const hay = getRoomSearchHaystack(r);
          const matchesTerm = (uni.roomMatchTerms || []).some((term) => hay.includes(normalizeSearchText(term)));
          const matchesArea = Array.isArray(uni.areaKeys) && uni.areaKeys.includes(r.areaKey);
          if (!matchesTerm && !matchesArea) return false;
        } else if (normSearch) {
          const hay = getRoomSearchHaystack(r);
          if (!normSearch.split(" ").filter(Boolean).every((tok) => hay.includes(tok))) return false;
        }
        if (state.areas.length > 0 && !state.areas.includes(r.areaKey)) return false;
        if (state.type !== "all" && r.typeKey !== state.type) return false;
        if (state.priceRange === "<1.5" && r.price >= 1500000) return false;
        if (state.priceRange === "1.5-2.5" && (r.price < 1500000 || r.price > 2500000)) return false;
        if (state.priceRange === "2.5-3.5" && (r.price < 2500000 || r.price > 3500000)) return false;
        if (state.priceRange === ">3.5" && r.price <= 3500000) return false;
        if (state.amenities.length > 0 && !state.amenities.every((am) => (r.amenities || []).includes(am))) {
          return false;
        }
        return true;
      });

      if (state.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
      return list;
    }

    function buildEmptyStateHtml() {
      const districtMap = new Map((districtsByCity[state.areaCity] || []).map((d) => [d.key, d.name]));
      const selectedDistrictLabels = state.areas.map((k) => districtMap.get(k)).filter(Boolean);

      let emptyTitle = "Chưa có phòng khớp bộ lọc hiện tại";
      let emptyDesc = "Hãy thử nới rộng khu vực hoặc nhấn Đặt lại bộ lọc để xem toàn bộ phòng trọ sinh viên.";

      if (state.selectedUniversity) {
        emptyTitle = `Chưa có phòng trống gần ${escapeHTML(state.selectedUniversity.name)}`;
        emptyDesc = `Khu vực ${escapeHTML(state.selectedUniversity.district)}, ${escapeHTML(
          state.selectedUniversity.city
        )} hiện chưa có phòng khả dụng khớp các tiêu chí đã chọn. Bạn có thể bỏ chọn trường hoặc đặt lại bộ lọc.`;
      } else if (selectedDistrictLabels.length > 0) {
        emptyTitle = `Chưa có phòng trống tại ${escapeHTML(selectedDistrictLabels.join(", "))} (${escapeHTML(state.areaCity)})`;
        emptyDesc = "Hiện chưa có phòng khả dụng trong các quận đã chọn. Hãy chọn thêm quận khác hoặc nhấn Đặt lại bộ lọc.";
      } else if (state.areaCity === "Hà Nội") {
        emptyTitle = "Chưa có phòng trống tại khu vực Hà Nội";
        emptyDesc = "Hiện chưa có phòng khả dụng tại khu vực này. Bạn có thể chọn khu vực khác hoặc nhấn Đặt lại bộ lọc.";
      }

      return `
        <div class="md:col-span-2 bg-surface-container-lowest rounded-2xl p-10 text-center border border-surface-container flex flex-col items-center gap-3">
          <span class="material-symbols-outlined text-5xl text-outline">search_off</span>
          <h3 class="font-title-md text-title-md font-bold text-on-surface">${emptyTitle}</h3>
          <p class="text-sm text-on-surface-variant max-w-md">${emptyDesc}</p>
          <button type="button" id="rm-empty-reset" class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm">Đặt lại bộ lọc</button>
        </div>
      `;
    }

    function renderPagination(total, totalPages) {
      if (!paginationEl) return;
      if (total === 0) {
        paginationEl.innerHTML = "";
        return;
      }

      const canPrev = state.page > 1;
      const canNext = state.page < totalPages;
      const prevBtnClass = canPrev
        ? "w-10 h-10 rounded-full border border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary shadow-xs transition-all flex items-center justify-center cursor-pointer"
        : "w-10 h-10 rounded-full border border-surface-container bg-surface-container-low text-outline/50 flex items-center justify-center cursor-not-allowed transition-all";
      const nextBtnClass = canNext
        ? "w-10 h-10 rounded-full border border-primary bg-primary text-on-primary hover:bg-primary-container hover:border-primary-container shadow-sm transition-all flex items-center justify-center cursor-pointer"
        : "w-10 h-10 rounded-full border border-surface-container bg-surface-container-low text-outline/50 flex items-center justify-center cursor-not-allowed transition-all";

      paginationEl.innerHTML = `
        <button type="button" data-page-nav="prev" aria-label="Quay về trang trước" title="Trang trước" ${canPrev ? "" : "disabled"} class="${prevBtnClass}">
          <span class="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        <button type="button" data-page-nav="next" aria-label="Xem tiếp phòng" title="Trang tiếp theo" ${canNext ? "" : "disabled"} class="${nextBtnClass}">
          <span class="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      `;

      paginationEl.querySelector('[data-page-nav="prev"]')?.addEventListener("click", () => {
        if (state.page <= 1) return;
        state.page -= 1;
        render();
        window.scrollTo({ top: 180, behavior: "smooth" });
      });
      paginationEl.querySelector('[data-page-nav="next"]')?.addEventListener("click", () => {
        if (state.page >= totalPages) return;
        state.page += 1;
        render();
        window.scrollTo({ top: 180, behavior: "smooth" });
      });
    }

    function render() {
      syncPillUI();
      uniAutocomplete.syncUI();
      syncAreaCityUI();

      const filtered = filterRooms();
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / state.perPage));
      if (state.page > totalPages) state.page = 1;

      const start = (state.page - 1) * state.perPage;
      const pageItems = filtered.slice(start, start + state.perPage);
      const saved = Core.getSavedRoomIds();

      if (countLabel) {
        countLabel.textContent = state.savedOnly ? `${total} phòng đã lưu` : `${total} phòng trọ phù hợp`;
      }
      if (rangeLabel) {
        rangeLabel.textContent =
          total === 0
            ? "0 phòng hiển thị"
            : `${start + 1} - ${start + pageItems.length} trên ${total} phòng · Trang ${state.page} / ${totalPages}`;
      }

      if (pageItems.length === 0) {
        grid.innerHTML = buildEmptyStateHtml();
        grid.querySelector("#rm-empty-reset")?.addEventListener("click", resetAll);
      } else {
        grid.innerHTML = pageItems
          .map((room) => {
            const isSaved = saved.includes(String(room.id));
            const cover = (room.images && room.images[0]) || Core.FALLBACK_SVG;
            return `
              <article class="flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 group border border-surface-container">
                <div class="relative w-full aspect-[16/10] bg-surface-container overflow-hidden cursor-pointer" data-room-nav="${escapeHTML(room.id)}">
                  <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="${escapeHTML(cover)}" alt="${escapeHTML(room.title)}" />
                  <div class="absolute top-3 left-3 flex items-center gap-1.5">
                    <span class="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm font-medium">${escapeHTML(room.shortAddress)}</span>
                    ${room.isNewUserPost ? `<span class="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold">MỚI ĐĂNG</span>` : ""}
                  </div>
                  <button aria-label="Lưu tin" data-save-room="${escapeHTML(room.id)}" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/85 backdrop-blur-md ${
                    isSaved ? "text-error" : "text-on-surface"
                  } hover:text-error flex items-center justify-center shadow-xs transition-colors" type="button">
                    <span class="material-symbols-outlined text-body-lg" style="font-variation-settings: 'FILL' ${isSaved ? 1 : 0};">favorite</span>
                  </button>
                </div>
                <div class="p-space-md flex flex-col justify-between gap-3 flex-1">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center justify-between text-body-sm text-on-surface-variant font-normal">
                      <span>${escapeHTML(room.areaSqm)}m² · ${escapeHTML(room.spotsLabel)}</span>
                      <span class="text-tertiary font-medium">${escapeHTML(room.typeLabel)}</span>
                    </div>
                    <h2 data-room-nav="${escapeHTML(room.id)}" class="font-title-md text-title-md text-on-surface font-semibold group-hover:text-primary transition-colors line-clamp-1 cursor-pointer">${escapeHTML(room.title)}</h2>
                  </div>
                  <div class="pt-2 border-t border-surface-container flex items-center justify-between">
                    <span class="font-currency-md text-title-md text-primary font-bold">${escapeHTML(room.priceFormatted)}<span class="text-xs font-normal text-on-surface-variant">${
              Core.isPrivateRoom(room) ? "/tháng" : "/tháng/người"
            }</span></span>
                    <a href="/roomie/phong-chi-tiet?id=${escapeHTML(room.id)}" class="px-3 py-1 rounded-lg text-primary hover:bg-primary/5 font-label-sm font-semibold transition-colors flex items-center gap-0.5">
                      Xem <span class="material-symbols-outlined text-sm">arrow_forward</span>
                    </a>
                  </div>
                </div>
              </article>
            `;
          })
          .join("");

        grid.querySelectorAll("img").forEach((img) => {
          img.addEventListener("error", () => {
            img.src = Core.FALLBACK_SVG;
          });
        });
        grid.querySelectorAll("[data-room-nav]").forEach((el) => {
          el.addEventListener("click", () => {
            window.location.href = `/roomie/phong-chi-tiet?id=${el.dataset.roomNav}`;
          });
        });
        grid.querySelectorAll("[data-save-room]").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const nowSaved = Core.toggleSavedRoom(btn.dataset.saveRoom);
            const icon = btn.querySelector(".material-symbols-outlined");
            btn.classList.toggle("text-error", nowSaved);
            if (icon) icon.style.fontVariationSettings = nowSaved ? "'FILL' 1" : "'FILL' 0";
            Core.showToast(nowSaved ? "Đã lưu tin phòng trọ!" : "Đã bỏ lưu tin.", nowSaved ? "success" : "info");
          });
        });
      }

      renderPagination(total, totalPages);
    }

    function resetAll() {
      Object.assign(state, {
        search: "",
        selectedUniversity: null,
        uniCityFilter: "all",
        areaCity: "TP.HCM",
        priceRange: "all",
        areas: [],
        type: "all",
        amenities: [],
        savedOnly: false,
        page: 1
      });
      if (searchInput) searchInput.value = "";
      uniAutocomplete.close();
      renderAreaOptions();
      amenityCheckboxes.forEach((cb) => (cb.checked = false));
      render();
      Core.showToast("Đã đặt lại toàn bộ bộ lọc.", "info");
    }

    areaCityBtns.forEach((btn) => {
      btn.addEventListener("click", () => setAreaCity(btn.dataset.areaCity || "TP.HCM"));
    });
    areaSelectedClear?.addEventListener("click", () => {
      state.areas = [];
      state.page = 1;
      renderAreaOptions();
      render();
    });
    document.addEventListener("click", (e) => {
      if (uniAutocomplete.isOpen() && !uniAutocomplete.contains(e.target)) uniAutocomplete.close();
    });
    pricePills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const val = pill.dataset.price;
        state.priceRange = state.priceRange === val ? "all" : val;
        state.page = 1;
        render();
      });
    });
    housingBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.type = btn.dataset.type;
        state.page = 1;
        render();
      });
    });
    amenityCheckboxes.forEach((cb) => {
      cb.addEventListener("change", () => {
        state.amenities = Array.from(amenityCheckboxes).filter((x) => x.checked).map((x) => x.value);
        state.page = 1;
        render();
      });
    });
    sortSelect?.addEventListener("change", () => {
      state.sort = sortSelect.value;
      render();
    });
    resetBtn?.addEventListener("click", resetAll);
    applyBtn?.addEventListener("click", () => {
      uniAutocomplete.close();
      render();
      if (toast) {
        toast.classList.remove("hidden");
        setTimeout(() => toast.classList.add("hidden"), 3500);
      }
    });

    applyQueryParams();
    renderAreaOptions();
    render();
    window.addEventListener("roomie:backend-synced", () => {
      renderAreaOptions();
      render();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "tim-phong") initFindRoomsPage();
  });
})();
