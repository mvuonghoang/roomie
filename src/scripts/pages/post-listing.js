/**
 * Page: Post Listing (/roomie/dang-tin)
 * Form đăng tin tìm roommate dành cho sinh viên (hỗ trợ TP.HCM & Hà Nội).
 */
(function () {
  const Data = window.RoomieData || {};
  const Core = window.RoomieCore || {};
  const { escapeHTML } = Core;

  function initPostListingPage() {
    const purposeBtns = document.querySelectorAll(".post-purpose-btn");
    const typeBtns = document.querySelectorAll(".post-housing-btn");
    const habitBtns = document.querySelectorAll(".post-habit-btn");

    const citySelect = document.getElementById("post-city");
    const schoolSelect = document.getElementById("post-school");
    const addressInput = document.getElementById("post-address");
    const areaSelect = document.getElementById("post-area-key");
    const priceInput = document.getElementById("post-price");
    const messageInput = document.getElementById("post-message");
    const verifyCheck = document.getElementById("verify-check");
    const quotaBadge = document.getElementById("post-quota-badge");

    const pvDistance = document.getElementById("pv-distance");
    const pvPrice = document.getElementById("pv-price");
    const pvTotalHint = document.getElementById("pv-total-hint");
    const pvTitle = document.getElementById("pv-title");
    const pvAddress = document.getElementById("pv-address");
    const pvHabits = document.getElementById("pv-habits");
    const pvVerified = document.getElementById("pv-verified");
    const pvCoverImg = document.getElementById("pv-cover-img");
    const pvServiceLabel = document.getElementById("pv-service-label");
    const pvSecondaryLabel = document.getElementById("pv-secondary-label");
    const pvBoostBadge = document.getElementById("pv-boost-badge");
    const pvPurposeBadge = document.getElementById("pv-purpose-badge");
    const addressLabel = document.getElementById("post-address-label");
    const priceLabel = document.getElementById("post-price-label");
    const priceHelp = document.getElementById("post-price-help");

    let selectedPurpose = "has-room";
    let selectedType = "Phòng Studio";
    const defaultCover = pvCoverImg?.src || "";

    function populateLocationFields(city, preferredAreaKey, preferredSchool) {
      const targetCity = city === "Hà Nội" ? "Hà Nội" : "TP.HCM";
      const districts = (Data.DISTRICTS_BY_CITY && Data.DISTRICTS_BY_CITY[targetCity]) || [];
      if (areaSelect && districts.length) {
        areaSelect.innerHTML = districts
          .map((d) => {
            const val = d.key || d.value || "";
            const lbl = d.name || d.label || val;
            return `<option value="${escapeHTML(val)}">${escapeHTML(lbl)}</option>`;
          })
          .join("");
        const hasPreferred = districts.some((d) => (d.key || d.value) === preferredAreaKey);
        const fallbackKey = districts.some((d) => (d.key || d.value) === "thu-duc")
          ? "thu-duc"
          : districts[0].key || districts[0].value;
        areaSelect.value = hasPreferred ? preferredAreaKey : fallbackKey;
      }

      const universities = (Data.UNIVERSITIES_HCM_HN || []).filter((u) => u.city === targetCity);
      if (schoolSelect) {
        const defaultOpt = `<option value="">Tất cả trường đại học (${escapeHTML(targetCity)})</option>`;
        const uniOpts = universities
          .map((u) => {
            const code = u.code || u.shortName || "";
            const label = code ? `${u.name} (${code})` : u.name;
            return `<option value="${escapeHTML(code || u.name)}">${escapeHTML(label)}</option>`;
          })
          .join("");
        schoolSelect.innerHTML = defaultOpt + uniOpts;
        if (preferredSchool) {
          const matchOpt = Array.from(schoolSelect.options || []).find((o) => o.value === preferredSchool);
          if (matchOpt) schoolSelect.value = preferredSchool;
        }
      }
    }

    function syncQuotaBadge() {
      if (!quotaBadge || !Core.getRoommatePostQuotaStatus) return;
      const quota = Core.getRoommatePostQuotaStatus();
      quotaBadge.textContent = `Còn ${quota.remaining}/${quota.dailyLimit} lượt đăng hôm nay`;
    }

    function refreshPostState() {
      syncQuotaBadge();
      updatePreview();
    }

    function updateStepIndicators(selectedTags) {
      const priceVal = Core.parseCurrencyNumber(priceInput?.value || "");
      const hasAddress = Boolean(addressInput?.value.trim()) && Boolean(areaSelect?.value);
      const hasBudget = priceVal >= 500000;
      const hasHabits = selectedTags.length > 0;
      const verifiedReady = Boolean(Core.isLoggedIn?.() && verifyCheck?.checked);

      const states = [
        { done: hasAddress, active: !hasAddress, num: 1 },
        { done: hasBudget, active: hasAddress && !hasBudget, num: 2 },
        { done: hasHabits && hasBudget, active: hasAddress && hasBudget && !hasHabits, num: 3 },
        { done: verifiedReady && hasAddress && hasBudget, active: hasAddress && hasBudget && hasHabits, num: 4 }
      ];

      states.forEach((st, idx) => {
        const el = document.getElementById(`post-step-${idx + 1}`);
        if (!el) return;
        const icon = el.querySelector(".post-step-icon");
        const status = el.querySelector(".post-step-status");
        const title = el.querySelector(".post-step-title");

        el.classList.remove("bg-primary-fixed/40", "opacity-75");
        if (st.done) {
          if (icon) {
            icon.className = "post-step-icon w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0";
            icon.innerHTML = `<span class="material-symbols-outlined text-[18px] font-bold">check</span>`;
          }
          if (status) {
            status.className = "post-step-status font-label-sm text-label-sm text-tertiary uppercase tracking-wider font-semibold";
            status.textContent = `Bước ${st.num} • Xong`;
          }
          if (title) title.className = "post-step-title font-label-md text-label-md text-on-surface font-semibold truncate";
        } else if (st.active) {
          el.classList.add("bg-primary-fixed/40");
          if (icon) {
            icon.className = "post-step-icon w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 font-bold text-label-md shadow-sm";
            icon.textContent = String(st.num);
          }
          if (status) {
            status.className = "post-step-status font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold";
            status.textContent = `Bước ${st.num} • Đang điền`;
          }
          if (title) title.className = "post-step-title font-label-md text-label-md text-primary font-semibold truncate";
        } else {
          el.classList.add("opacity-75");
          if (icon) {
            icon.className = "post-step-icon w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0 font-medium text-label-md";
            icon.textContent = String(st.num);
          }
          if (status) {
            status.className = "post-step-status font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider";
            status.textContent = `Bước ${st.num}`;
          }
          if (title) title.className = "post-step-title font-label-md text-label-md text-on-surface truncate";
        }
      });
    }

    function getSelectedCriteria() {
      return Array.from(habitBtns)
        .filter((b) => b.classList.contains("bg-primary"))
        .map((b) => {
          if (b.dataset.label) return b.dataset.label;
          const clone = b.cloneNode(true);
          clone.querySelectorAll(".material-symbols-outlined").forEach((el) => el.remove());
          return clone.textContent.trim().replace(/\s+/g, " ");
        });
    }

    function updatePreview() {
      const hasRoom = selectedPurpose === "has-room";
      const priceVal = Core.parseCurrencyNumber(priceInput?.value || "");
      const budgetLabel = priceVal > 0 ? Core.formatVND(priceVal) : "Chưa nhập ngân sách";
      const cityVal = citySelect?.value || "TP.HCM";

      if (pvPrice) pvPrice.textContent = budgetLabel;
      if (pvTotalHint) {
        pvTotalHint.textContent = hasRoom
          ? `Tiền phòng ${budgetLabel}/người/tháng, chưa gồm tiện ích`
          : `Ngân sách tối đa ${budgetLabel}/người/tháng`;
      }
      if (pvDistance) {
        const districtName = areaSelect?.selectedOptions?.[0]?.textContent.trim() || "Ưu tiên gần trường";
        pvDistance.textContent = `${districtName} (${cityVal})`;
      }
      if (pvAddress) pvAddress.textContent = addressInput?.value.trim() || `Khu vực tại ${cityVal}`;
      if (pvVerified) pvVerified.classList.toggle("hidden", !verifyCheck?.checked);
      if (pvServiceLabel) {
        pvServiceLabel.textContent = hasRoom
          ? "Chưa gồm điện, nước và phí dịch vụ"
          : "Cùng tìm phòng sau khi ghép bạn";
      }
      if (pvSecondaryLabel) {
        pvSecondaryLabel.textContent = hasRoom ? "Thông tin người đăng là sinh viên" : "Ưu tiên khu vực & ngân sách";
      }
      if (pvBoostBadge) pvBoostBadge.classList.add("hidden");
      if (pvPurposeBadge) pvPurposeBadge.textContent = hasRoom ? "Đã có phòng" : "Cùng tìm phòng";
      if (addressLabel) {
        addressLabel.textContent = hasRoom ? "Khu vực / địa chỉ gần phòng hiện có" : "Khu vực mong muốn tìm phòng";
      }
      if (addressInput) {
        addressInput.placeholder =
          cityVal === "Hà Nội"
            ? hasRoom
              ? "Ví dụ: Ngõ 165 Xuân Thủy, Cầu Giấy"
              : "Ví dụ: Gần ĐH Bách khoa / Cầu Giấy"
            : hasRoom
            ? "Ví dụ: Đường Vành Đai, Linh Trung, Thủ Đức"
            : "Ví dụ: Làng ĐHQG hoặc Quận 5";
      }
      if (priceHelp) {
        priceHelp.textContent = hasRoom
          ? "Tiền phòng hiện tại tính trên mỗi người mỗi tháng"
          : "Mức ngân sách tối đa bạn dự kiến chi mỗi tháng";
      }
      if (priceLabel) {
        priceLabel.textContent = hasRoom ? "Tiền phòng / người" : "Ngân sách / người";
      }

      const currentUser = (Core.getCurrentUser ? Core.getCurrentUser() : Data.USER_PROFILE) || {};
      if (pvCoverImg) {
        pvCoverImg.src = hasRoom ? defaultCover : currentUser.avatar || "/assets/images/common/avatar-profile.jpg";
        pvCoverImg.alt = hasRoom ? "Ảnh minh họa phòng ở ghép" : "Ảnh đại diện sinh viên đăng tin";
        pvCoverImg.classList.toggle("object-top", !hasRoom);
      }

      const customMsg = messageInput?.value.trim();
      if (pvTitle) {
        if (customMsg) {
          pvTitle.textContent = customMsg.slice(0, 68);
        } else {
          pvTitle.textContent = hasRoom
            ? `Tìm bạn ở ghép ${selectedType}`
            : `Tìm bạn cùng đi tìm ${selectedType.toLowerCase()}`;
        }
      }

      const selectedTags = getSelectedCriteria();
      if (pvHabits) {
        pvHabits.innerHTML = selectedTags
          .slice(0, 4)
          .map(
            (t) =>
              `<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant">${escapeHTML(
                t
              )}</span>`
          )
          .join("");
      }
      updateStepIndicators(selectedTags);
    }

    function selectPurpose(purpose) {
      selectedPurpose = purpose;
      purposeBtns.forEach((btn) => {
        btn.className =
          btn.dataset.purpose === purpose
            ? "post-purpose-btn flex items-center justify-center gap-space-sm px-space-lg py-space-md rounded-xl bg-surface-container-lowest text-primary shadow-sm font-label-md text-label-md transition-all text-left cursor-pointer"
            : "post-purpose-btn flex items-center justify-center gap-space-sm px-space-lg py-space-md rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest/60 transition-all text-left cursor-pointer";
      });
      updatePreview();
    }

    function setRoomTypeUI(typeName) {
      selectedType = typeName;
      typeBtns.forEach((b) => {
        const isCurrent = b.textContent.trim() === typeName;
        b.className = isCurrent
          ? "post-housing-btn py-space-sm px-space-xs rounded-xl bg-primary text-on-primary font-label-md text-label-md text-center transition-all cursor-pointer"
          : "post-housing-btn py-space-sm px-space-xs rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md text-center transition-all cursor-pointer";
      });
    }

    function setHabitBtnState(btn, isSelected) {
      if (isSelected) {
        btn.classList.add("bg-primary", "text-on-primary", "shadow-sm");
        btn.classList.remove("bg-surface-container", "text-on-surface", "hover:bg-surface-container-high");
      } else {
        btn.classList.remove("bg-primary", "text-on-primary", "shadow-sm");
        btn.classList.add("bg-surface-container", "text-on-surface", "hover:bg-surface-container-high");
      }
    }

    purposeBtns.forEach((btn) => {
      btn.addEventListener("click", () => selectPurpose(btn.dataset.purpose));
    });

    typeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        setRoomTypeUI(btn.textContent.trim());
        updatePreview();
      });
    });

    habitBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        setHabitBtnState(btn, !btn.classList.contains("bg-primary"));
        updatePreview();
      });
    });

    citySelect?.addEventListener("change", () => {
      populateLocationFields(citySelect.value);
      updatePreview();
    });

    [schoolSelect, addressInput, areaSelect, priceInput, messageInput].forEach((el) =>
      el?.addEventListener("input", updatePreview)
    );
    areaSelect?.addEventListener("change", updatePreview);
    schoolSelect?.addEventListener("change", updatePreview);
    verifyCheck?.addEventListener("change", updatePreview);

    document.getElementById("post-save-draft-btn")?.addEventListener("click", () => {
      Core.writeJSON(Core.STORAGE_KEYS.LISTING_DRAFT, {
        postType: selectedPurpose,
        roomType: selectedType,
        city: citySelect?.value || "TP.HCM",
        areaKey: areaSelect?.value || "thu-duc",
        schoolPreference: schoolSelect?.value || "",
        address: addressInput?.value || "",
        price: priceInput?.value || "",
        criteria: getSelectedCriteria(),
        message: messageInput?.value || ""
      });
      Core.showToast("Đã lưu đầy đủ bản nháp tin đăng trên trình duyệt!");
    });

    document.getElementById("post-submit-btn")?.addEventListener("click", async () => {
      if (Core.isLoggedIn && !Core.isLoggedIn()) {
        Core.showToast("Vui lòng đăng nhập hoặc đăng ký tài khoản sinh viên trước khi đăng tin.", "info");
        Core.openAuthModal?.("login", {
          subtitle: "Đăng nhập tài khoản sinh viên để đăng tin tìm roommate",
          onSuccess: refreshPostState
        });
        return;
      }

      const currentUser = (Core.getCurrentUser ? Core.getCurrentUser() : Data.USER_PROFILE) || {};
      if (String(currentUser.role || "student").toLowerCase() !== "student") {
        Core.showToast("Chỉ tài khoản sinh viên mới được đăng tin tìm roommate.", "error");
        return;
      }

      const addr = addressInput?.value.trim();
      const priceNum = Core.parseCurrencyNumber(priceInput?.value || "");
      if (!addr || priceNum < 500000 || priceNum > 50000000) {
        Core.showToast("Vui lòng nhập địa chỉ/khu vực và ngân sách hợp lệ (từ 500.000đ/tháng).", "error");
        return;
      }

      if (!currentUser.gender) {
        Core.showToast("Hồ sơ sinh viên chưa có giới tính. Vui lòng cập nhật hồ sơ trước khi đăng tin.", "error");
        return;
      }

      const listing = {
        postType: selectedPurpose,
        area: addr,
        areaKey: areaSelect?.value || "thu-duc",
        roomType: selectedType,
        schoolPreference: schoolSelect?.value || "",
        budget: priceNum,
        criteria: getSelectedCriteria(),
        note: messageInput?.value.trim() || "",
        city: citySelect?.value || "TP.HCM"
      };

      const result = await Core.createRoommateListing?.(listing);
      if (!result || !result.ok || !result.roommate) {
        Core.showToast(result?.error || "Không thể đăng tin lúc này. Vui lòng thử lại.", "error");
        return;
      }

      Core.writeJSON(Core.STORAGE_KEYS.LISTING_DRAFT, null);
      syncQuotaBadge();

      Core.openModal({
        title: "Đăng tin thành công!",
        subtitle: "Tin của bạn đã được hiển thị trên Roomie",
        maxWidth: "max-w-md",
        bodyHtml: `
          <div class="flex flex-col gap-4 text-center items-center">
            <div class="w-16 h-16 rounded-full bg-secondary-container text-tertiary flex items-center justify-center">
              <span class="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <p class="text-sm text-on-surface-variant">Tin <strong>"${escapeHTML(result.roommate.roomStatusTitle)}"</strong> đã xuất hiện trong danh sách tìm roommate.</p>
            <div class="flex flex-col sm:flex-row gap-2.5 w-full pt-2">
              <a href="/roomie/tim-roommate" class="flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary font-semibold text-sm">Xem danh sách roommate</a>
              <a href="/roomie/tin-da-dang" class="flex-1 py-3 px-4 rounded-xl bg-surface-container-high text-on-surface font-semibold text-sm">Quản lý tin của tôi</a>
            </div>
          </div>
        `
      });
    });

    document.getElementById("post-download-contract-btn")?.addEventListener("click", Core.openContractModal);
    document.getElementById("post-quiz-cta-btn")?.addEventListener("click", () => {
      window.location.href = "/roomie/trac-nghiem";
    });
    document.getElementById("post-support-cta-btn")?.addEventListener("click", () => {
      Core.openSupportContactModal(
        "Hỗ trợ sinh viên Roomie",
        "Liên hệ hỗ trợ qua các kênh Roomie hiện có",
        "Mình cần hỗ trợ về bài đăng tìm roommate."
      );
    });
    document.getElementById("pv-connect-btn")?.addEventListener("click", () => {
      Core.showToast("Nút Gửi lời mời kết nối 2 chiều (Double Opt-in) sẽ hiển thị tại đây khi tin được đăng.", "info");
    });

    // Hydrate saved draft and location dropdowns cleanly
    const draft = Core.readJSON(Core.STORAGE_KEYS.LISTING_DRAFT, null);
    const initialCity = draft?.city === "Hà Nội" ? "Hà Nội" : "TP.HCM";
    if (citySelect) citySelect.value = initialCity;
    populateLocationFields(initialCity, draft?.areaKey, draft?.schoolPreference);

    if (draft) {
      if (draft.postType === "has-room" || draft.postType === "find-room") {
        selectedPurpose = draft.postType;
      }
      if (draft.roomType) setRoomTypeUI(draft.roomType);
      if (addressInput && draft.address) addressInput.value = draft.address;
      if (priceInput && draft.price) priceInput.value = draft.price;
      if (messageInput && draft.message) messageInput.value = draft.message;
      if (Array.isArray(draft.criteria)) {
        habitBtns.forEach((btn) => {
          const clone = btn.cloneNode(true);
          clone.querySelectorAll(".material-symbols-outlined").forEach((el) => el.remove());
          const label = clone.textContent.trim().replace(/\s+/g, " ");
          setHabitBtnState(btn, draft.criteria.includes(label));
        });
      }
    }

    syncQuotaBadge();
    Core.ready?.then(refreshPostState);
    Core.onPlanStateChange?.(syncQuotaBadge);
    Core.onAuthStateChange?.(refreshPostState);
    selectPurpose(selectedPurpose);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "dang-tin") {
      (Core.ready || Promise.resolve()).then(initPostListingPage);
    }
  });
})();
