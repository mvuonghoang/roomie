/**
 * Page: Post Listing (/roomie/dang-tin)
 * Form đăng tin minh bạch chi phí, xem trước thời gian thực, tải ảnh và lưu bản nháp cục bộ.
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
    const distanceInput = document.getElementById("post-distance");
    const priceInput = document.getElementById("post-price");
    const electricInput = document.getElementById("post-electric");
    const waterInput = document.getElementById("post-water");
    const serviceInput = document.getElementById("post-service");
    const messageInput = document.getElementById("post-message");
    const verifyCheck = document.getElementById("verify-check");
    const photoInput = document.getElementById("post-photo-input");
    const uploadBtn = document.getElementById("post-upload-btn");

    const pvDistance = document.getElementById("pv-distance");
    const pvPrice = document.getElementById("pv-price");
    const pvTotalHint = document.getElementById("pv-total-hint");
    const pvTitle = document.getElementById("pv-title");
    const pvAddress = document.getElementById("pv-address");
    const pvHabits = document.getElementById("pv-habits");
    const pvVerified = document.getElementById("pv-verified");
    const pvCoverImg = document.getElementById("pv-cover-img");
    const pvServiceLabel = document.getElementById("pv-service-label");
    const pvBoostBadge = document.getElementById("pv-boost-badge");

    let selectedPurpose = "roommate";
    let selectedType = "Phòng Studio";
    let isBoosted = false;
    let uploadedCover = "";

    function updatePreview() {
      const priceVal = Core.parseCurrencyNumber(priceInput?.value || "2200000");
      const waterVal = Core.parseCurrencyNumber(waterInput?.value || "50000");
      const serviceVal = Core.parseCurrencyNumber(serviceInput?.value || "0");
      const estimatedTotal = priceVal + waterVal + serviceVal + 150000;

      if (pvPrice) pvPrice.textContent = Core.formatVND(priceVal);
      if (pvTotalHint) pvTotalHint.textContent = `Tổng dự kiến ~ ${Core.formatVND(estimatedTotal)}/tháng`;
      if (pvDistance) pvDistance.textContent = distanceInput?.value.trim() || "Cách KTX B ĐHQG 300m";
      if (pvAddress) pvAddress.textContent = addressInput?.value.trim() || "Đường số 6, Phường Linh Trung, TP. Thủ Đức";
      if (pvVerified) pvVerified.classList.toggle("hidden", !verifyCheck?.checked);
      if (pvServiceLabel) {
        pvServiceLabel.textContent =
          serviceVal === 0 ? "Wifi & Rác miễn phí" : `Phí dịch vụ ${Core.formatVND(serviceVal)}/th`;
      }
      if (pvBoostBadge) pvBoostBadge.classList.toggle("hidden", !isBoosted);

      const customMsg = messageInput?.value.trim();
      if (pvTitle) {
        if (customMsg) {
          pvTitle.textContent = customMsg.slice(0, 68);
        } else {
          pvTitle.textContent =
            selectedPurpose === "roommate"
              ? `Tìm 1 bạn ở ghép ${selectedType} sạch đẹp full nội thất`
              : `Cho thuê ${selectedType} chính chủ, giờ tự do`;
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

    purposeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedPurpose = btn.dataset.purpose;
        purposeBtns.forEach((b) => {
          b.className =
            b === btn
              ? "post-purpose-btn flex items-center justify-center gap-space-sm px-space-lg py-space-md rounded-xl bg-surface-container-lowest text-primary shadow-sm font-label-md text-label-md transition-all text-left cursor-pointer"
              : "post-purpose-btn flex items-center justify-center gap-space-sm px-space-lg py-space-md rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest/60 transition-all text-left cursor-pointer";
        });
        updatePreview();
      });
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

    [schoolSelect, addressInput, distanceInput, priceInput, electricInput, waterInput, serviceInput, messageInput, verifyCheck].forEach(
      (el) => el?.addEventListener("input", updatePreview)
    );
    verifyCheck?.addEventListener("change", updatePreview);

    uploadBtn?.addEventListener("click", () => photoInput?.click());
    photoInput?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        uploadedCover = String(reader.result);
        if (pvCoverImg) pvCoverImg.src = uploadedCover;
        Core.showToast(`Đã tải ảnh "${file.name}" lên xem trước!`);
      };
      reader.readAsDataURL(file);
    });

    document.getElementById("post-save-draft-btn")?.addEventListener("click", () => {
      Core.writeJSON(Core.STORAGE_KEYS.LISTING_DRAFT, {
        address: addressInput?.value || "",
        distance: distanceInput?.value || "",
        price: priceInput?.value || "",
        message: messageInput?.value || ""
      });
      Core.showToast("Đã lưu bản nháp tin đăng trên trình duyệt!");
    });

    document.getElementById("post-boost-btn")?.addEventListener("click", (e) => {
      isBoosted = !isBoosted;
      e.currentTarget.classList.toggle("ring-2", isBoosted);
      e.currentTarget.classList.toggle("ring-tertiary", isBoosted);
      updatePreview();
      Core.showToast(
        isBoosted ? "Đã bật Boost Listing (5.000đ/ngày) trong bản xem trước!" : "Đã tắt Boost Listing.",
        isBoosted ? "success" : "info"
      );
    });

    document.getElementById("post-submit-btn")?.addEventListener("click", () => {
      if (Core.isLoggedIn && !Core.isLoggedIn()) {
        Core.showToast("Vui lòng đăng nhập hoặc đăng ký tài khoản sinh viên trước khi đăng tin.", "info");
        Core.openAuthModal?.("login", {
          subtitle: "Đăng nhập để đăng tin tìm phòng & roommate chính chủ"
        });
        return;
      }

      const addr = addressInput?.value.trim();
      const priceNum = Core.parseCurrencyNumber(priceInput?.value || "2200000");
      if (!addr || !priceNum) {
        Core.showToast("Vui lòng nhập đầy đủ địa chỉ và tiền phòng hợp lệ.", "error");
        return;
      }

      const schoolText = schoolSelect?.value || "";
      const areaKey =
        schoolText.includes("KTX") || schoolText.includes("Linh Trung")
          ? "thu-duc"
          : schoolText.includes("Bách Khoa") || schoolText.includes("UEH")
          ? "quan-10"
          : "quan-5";

      const currentUser = (Core.getCurrentUser ? Core.getCurrentUser() : Data.USER_PROFILE) || {};
      const newId = "user-" + Date.now();
      const newRoom = {
        id: newId,
        title: pvTitle?.textContent || `Phòng ${selectedType} - ${addr}`,
        shortTitle: addr,
        breadcrumbTitle: addr,
        districtLabel: areaKey === "thu-duc" ? "TP. Thủ Đức" : areaKey === "quan-10" ? "Quận 10" : "Quận 5",
        areaKey,
        address: addr,
        shortAddress: areaKey === "thu-duc" ? "TP. Thủ Đức" : areaKey === "quan-10" ? "Quận 10" : "Quận 5",
        distanceLabel: distanceInput?.value.trim() || "Gần trường ĐH",
        schoolDistanceBadge: distanceInput?.value.trim() || "Gần trường ĐH",
        price: priceNum,
        priceFormatted: Core.formatVND(priceNum),
        totalRoomPrice: selectedPurpose === "roommate" ? Core.formatVND(priceNum * 2) + "/tháng" : Core.formatVND(priceNum) + "/tháng",
        areaSqm: 28,
        capacityLabel: "Tối đa 2 người",
        spotsLabel: selectedPurpose === "roommate" ? "Còn 1 chỗ ở ghép" : "Nguyên phòng riêng",
        badgeText: isBoosted ? "NỔI BẬT" : "Mới đăng",
        floorLabel: "Tầng 2",
        depositLabel: "1 tháng cọc",
        typeKey: selectedPurpose === "roommate" ? "o-ghep" : "phong-rieng",
        typeLabel: selectedType,
        matchScore: 96,
        isNewUserPost: true,
        amenities: ["Máy lạnh", "Giờ linh hoạt"],
        images: [uploadedCover || pvCoverImg?.src || Core.FALLBACK_SVG],
        roommate: {
          id: currentUser.id || "minh-thu",
          name: currentUser.name || "Minh Thư",
          age: "20 tuổi",
          bioTitle: `Sinh viên ${currentUser.shortSchool || "HCMUS"} • Đã xác thực thẻ SV`,
          note: messageInput?.value.trim() || "Tìm bạn cùng phòng sạch sẽ, tôn trọng giờ giấc.",
          avatar: currentUser.avatar || "/assets/images/common/avatar-profile.jpg"
        },
        costs: {
          electric: (electricInput?.value || "3.500") + "đ / kWh",
          electricNote: "Đồng hồ điện riêng",
          water: (waterInput?.value || "50.000") + "đ / người / tháng",
          waterNote: "Nước máy sạch",
          service: serviceInput?.value || "Miễn phí",
          serviceNote: "Wifi + Rác",
          parking: "Miễn phí",
          parkingNote: "Nhà xe an ninh",
          estimatedTotal: Core.formatVND(priceNum + 200000)
        },
        description: [
          messageInput?.value.trim() || "Phòng sạch sẽ thoáng mát, đầy đủ tiện nghi sinh viên, chủ nhà thân thiện.",
          `Địa chỉ cụ thể: ${addr} (${distanceInput?.value.trim() || ""}).`
        ]
      };

      if (Core.createRoomListing) {
        Core.createRoomListing(newRoom);
      } else {
        const existing = Core.readJSON(Core.STORAGE_KEYS.CUSTOM_LISTINGS, []);
        Core.writeJSON(Core.STORAGE_KEYS.CUSTOM_LISTINGS, [newRoom, ...existing]);
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
            <p class="text-sm text-on-surface-variant">Tin <strong>"${Core.escapeHTML(newRoom.title)}"</strong> đã xuất hiện trong danh sách Tìm phòng trọ và sẵn sàng tiếp cận sinh viên.</p>
            <div class="flex flex-col sm:flex-row gap-2.5 w-full pt-2">
              <a href="/roomie/phong-chi-tiet?id=${Core.escapeHTML(newId)}" class="flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary font-semibold text-sm">Xem chi tiết tin</a>
              <a href="/roomie/tim-phong" class="flex-1 py-3 px-4 rounded-xl bg-surface-container-high text-on-surface font-semibold text-sm">Về trang Tìm phòng</a>
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
        "Tư vấn viên Boost Listing",
        "Hỗ trợ sinh viên qua Zalo & Hotline",
        "Mình cần tư vấn gói Boost tin để tìm roommate trong 48h."
      );
    });
    (document.getElementById("pv-connect-btn") || document.getElementById("pv-chat-btn"))?.addEventListener("click", () => {
      Core.showToast("Nút Gửi lời mời kết nối 2 chiều (Double Opt-in) sẽ hiển thị tại đây khi tin được đăng.", "info");
    });

    const draft = Core.readJSON(Core.STORAGE_KEYS.LISTING_DRAFT, null);
    if (draft) {
      if (addressInput && draft.address) addressInput.value = draft.address;
      if (distanceInput && draft.distance) distanceInput.value = draft.distance;
      if (priceInput && draft.price) priceInput.value = draft.price;
      if (messageInput && draft.message) messageInput.value = draft.message;
    }
    updatePreview();
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "dang-tin") initPostListingPage();
  });
})();
