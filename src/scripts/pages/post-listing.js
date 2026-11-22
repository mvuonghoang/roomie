/**
 * Page: Post Listing (/roomie/dang-tin)
 * Form đăng tin tìm roommate dành cho sinh viên.
 */
(function () {
  const Data = window.RoomieData || {};
  const Core = window.RoomieCore || {};

  function initPostListingPage() {
    const purposeBtns = document.querySelectorAll(".post-purpose-btn");
    const typeBtns = document.querySelectorAll(".post-housing-btn");
    const habitBtns = document.querySelectorAll(".post-habit-btn");

    const schoolSelect = document.getElementById("post-school");
    const addressInput = document.getElementById("post-address");
    const areaSelect = document.getElementById("post-area-key");
    const priceInput = document.getElementById("post-price");
    const messageInput = document.getElementById("post-message");
    const verifyCheck = document.getElementById("verify-check");
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

    function updatePreview() {
      const hasRoom = selectedPurpose === "has-room";
      const priceVal = Core.parseCurrencyNumber(priceInput?.value || "");
      const budgetLabel = priceVal > 0 ? Core.formatVND(priceVal) : "Chưa nhập ngân sách";

      if (pvPrice) pvPrice.textContent = budgetLabel;
      if (pvTotalHint) {
        pvTotalHint.textContent = hasRoom
          ? `Tiền phòng ${budgetLabel}/người/tháng, chưa gồm tiện ích`
          : `Ngân sách tối đa ${budgetLabel}/người/tháng`;
      }
      if (pvDistance) {
        pvDistance.textContent = areaSelect?.selectedOptions?.[0]?.textContent.trim() || "Ưu tiên gần trường";
      }
      if (pvAddress) pvAddress.textContent = addressInput?.value.trim() || "Chọn khu vực mong muốn";
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
        addressInput.placeholder = hasRoom ? "Khu vực hoặc địa chỉ gần phòng" : "Ví dụ: Làng ĐHQG, Quận 5";
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
      }

      const customMsg = messageInput?.value.trim();
      if (pvTitle) {
        if (customMsg) {
          pvTitle.textContent = customMsg.slice(0, 68);
        } else {
          pvTitle.textContent =
            hasRoom
              ? `Tìm bạn ở ghép ${selectedType}`
              : `Tìm bạn cùng đi tìm ${selectedType.toLowerCase()}`;
        }
      }

      if (pvHabits) {
        const selectedTags = Array.from(habitBtns)
          .filter((b) => b.classList.contains("bg-primary"))
          .slice(0, 4)
          .map((b) => {
            if (b.dataset.label) return b.dataset.label;
            const clone = b.cloneNode(true);
            clone.querySelectorAll(".material-symbols-outlined").forEach((el) => el.remove());
            return clone.textContent.trim().replace(/\s+/g, " ");
          });
        pvHabits.innerHTML = selectedTags
          .map(
            (t) =>
              `<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant">${Core.escapeHTML(
                t
              )}</span>`
          )
          .join("");
      }
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

    purposeBtns.forEach((btn) => {
      btn.addEventListener("click", () => selectPurpose(btn.dataset.purpose));
    });

    typeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedType = btn.textContent.trim();
        typeBtns.forEach((b) => {
          b.className =
            b === btn
              ? "post-housing-btn py-space-sm px-space-xs rounded-xl bg-primary text-on-primary font-label-md text-label-md text-center transition-all cursor-pointer"
              : "post-housing-btn py-space-sm px-space-xs rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md text-center transition-all cursor-pointer";
        });
        updatePreview();
      });
    });

    habitBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const isSelected = btn.classList.contains("bg-primary");
        if (isSelected) {
          btn.classList.remove("bg-primary", "text-on-primary", "shadow-sm");
          btn.classList.add("bg-surface-container", "text-on-surface", "hover:bg-surface-container-high");
        } else {
          btn.classList.add("bg-primary", "text-on-primary", "shadow-sm");
          btn.classList.remove("bg-surface-container", "text-on-surface", "hover:bg-surface-container-high");
        }
        updatePreview();
      });
    });

    [schoolSelect, addressInput, areaSelect, priceInput, messageInput, verifyCheck].forEach(
      (el) => el?.addEventListener("input", updatePreview)
    );
    verifyCheck?.addEventListener("change", updatePreview);

    document.getElementById("post-save-draft-btn")?.addEventListener("click", () => {
      Core.writeJSON(Core.STORAGE_KEYS.LISTING_DRAFT, {
        postType: selectedPurpose,
        address: addressInput?.value || "",
        areaKey: areaSelect?.value || "thu-duc",
        price: priceInput?.value || "",
        message: messageInput?.value || ""
      });
      Core.showToast("Đã lưu bản nháp tin đăng trên trình duyệt!");
    });

    document.getElementById("post-submit-btn")?.addEventListener("click", async () => {
      if (Core.isLoggedIn && !Core.isLoggedIn()) {
        Core.showToast("Vui lòng đăng nhập hoặc đăng ký tài khoản sinh viên trước khi đăng tin.", "info");
        Core.openAuthModal?.("login", {
          subtitle: "Đăng nhập tài khoản sinh viên để đăng tin tìm roommate"
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
      if (!addr || !priceNum) {
        Core.showToast("Vui lòng nhập khu vực và ngân sách hợp lệ.", "error");
        return;
      }

      if (!currentUser.gender) {
        Core.showToast("Hồ sơ sinh viên chưa có giới tính. Vui lòng cập nhật hồ sơ trước khi đăng tin.", "error");
        return;
      }

      const criteria = Array.from(habitBtns)
        .filter((btn) => btn.classList.contains("bg-primary"))
        .map((btn) => {
          const clone = btn.cloneNode(true);
          clone.querySelectorAll(".material-symbols-outlined").forEach((el) => el.remove());
          return clone.textContent.trim().replace(/\s+/g, " ");
        });
      const listing = {
        postType: selectedPurpose,
        area: addr,
        areaKey: areaSelect?.value || "thu-duc",
        roomType: selectedType,
        schoolPreference: schoolSelect?.value || "",
        budget: priceNum,
        criteria,
        note: messageInput?.value.trim() || "",
        city: "TP.HCM"
      };

      const result = await Core.createRoommateListing?.(listing);
      if (!result || !result.ok || !result.roommate) {
        Core.showToast(result?.error || "Không thể đăng tin lúc này. Vui lòng thử lại.", "error");
        return;
      }

      Core.openModal({
        title: "Đăng tin thành công!",
        subtitle: "Tin của bạn đã được hiển thị trên Roomie",
        maxWidth: "max-w-md",
        bodyHtml: `
          <div class="flex flex-col gap-4 text-center items-center">
            <div class="w-16 h-16 rounded-full bg-secondary-container text-tertiary flex items-center justify-center">
              <span class="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <p class="text-sm text-on-surface-variant">Tin <strong>"${Core.escapeHTML(result.roommate.roomStatusTitle)}"</strong> đã xuất hiện trong danh sách tìm roommate.</p>
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
    (document.getElementById("pv-connect-btn") || document.getElementById("pv-chat-btn"))?.addEventListener("click", () => {
      Core.showToast("Nút Gửi lời mời kết nối 2 chiều (Double Opt-in) sẽ hiển thị tại đây khi tin được đăng.", "info");
    });

    const draft = Core.readJSON(Core.STORAGE_KEYS.LISTING_DRAFT, null);
    if (draft) {
      if (draft.postType === "has-room" || draft.postType === "find-room") {
        selectedPurpose = draft.postType;
      }
      if (addressInput && draft.address) addressInput.value = draft.address;
      if (areaSelect && draft.areaKey) areaSelect.value = draft.areaKey;
      if (priceInput && draft.price) priceInput.value = draft.price;
      if (messageInput && draft.message) messageInput.value = draft.message;
    }
    selectPurpose(selectedPurpose);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "dang-tin") initPostListingPage();
  });
})();
