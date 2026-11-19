/**
 * Page: Room Detail (/roomie/phong-chi-tiet)
 * Nạp dữ liệu chi tiết phòng theo ?id=, lưu tin, hẹn xem phòng, mở thư viện ảnh & kết nối Double Opt-in.
 */
(function () {
  const Core = window.RoomieCore || {};

  function initRoomDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || "1";
    const rooms = Core.getAllRooms();
    const room = rooms.find((r) => String(r.id) === String(id)) || rooms[0];
    if (!room) return;

    const setText = (idName, value) => {
      const el = document.getElementById(idName);
      if (el && value !== undefined && value !== null) el.textContent = value;
    };

    setText("rd-breadcrumb-district", room.districtLabel);
    setText("rd-breadcrumb-title", room.breadcrumbTitle || room.shortTitle);
    setText("rd-spots-badge", room.spotsLabel);
    setText("rd-school-badge", room.schoolDistanceBadge || room.distanceLabel);
    setText("rd-title", room.title);

    const isPrivate = Core.isPrivateRoom(room);
    setText("rd-price-main", room.priceFormatted);
    setText("rd-price-unit", isPrivate ? "/tháng" : "/người /tháng");
    setText("rd-price-side", room.priceFormatted);
    setText("rd-price-side-label", isPrivate ? "Giá thuê cả phòng" : "Giá ở ghép / người");
    setText("rd-address", room.address);
    setText("rd-area", `${room.areaSqm} m²`);
    setText("rd-capacity", room.capacityLabel);
    setText("rd-floor", room.floorLabel);
    setText("rd-deposit", room.depositLabel);
    setText("rd-badge-right", room.badgeText || "Còn chỗ");
    setText("rd-match-score", `${room.matchScore || 94}% Hợp gu`);
    setText("rd-cost-room-label", isPrivate ? "Tiền thuê nguyên phòng" : "Tiền thuê phòng (Mỗi người)");
    setText("rd-cost-room", room.priceFormatted);
    setText(
      "rd-cost-room-note",
      isPrivate ? "(Giá trọn phòng 1 tháng)" : `(Từ ${room.totalRoomPrice || room.priceFormatted})`
    );

    if (room.costs) {
      setText("rd-cost-electric", room.costs.electric);
      setText("rd-cost-electric-note", room.costs.electricNote);
      setText("rd-cost-water", room.costs.water);
      setText("rd-cost-water-note", room.costs.waterNote);
      setText("rd-cost-service", room.costs.service);
      setText("rd-cost-service-note", room.costs.serviceNote);
      setText("rd-cost-parking", room.costs.parking);
      setText("rd-cost-parking-note", room.costs.parkingNote);
      setText("rd-cost-total", room.costs.estimatedTotal);
    }

    if (room.roommate) {
      setText("rd-rm-name", room.roommate.name);
      setText("rd-rm-age", room.roommate.age);
      setText("rd-rm-bio", room.roommate.bioTitle);
      setText("rd-rm-note", room.roommate.note);
      setText("rd-poster-name", `${room.roommate.name} (Người đăng)`);
      setText("rd-test-btn-label", `Làm bài test hợp gu với ${room.roommate.name}`);
      const rmImg = document.getElementById("rd-rm-avatar");
      const posterImg = document.getElementById("rd-poster-avatar");
      if (rmImg && room.roommate.avatar) {
        rmImg.src = room.roommate.avatar;
        rmImg.alt = `Ảnh đại diện ${room.roommate.name}`;
      }
      if (posterImg && room.roommate.avatar) {
        posterImg.src = room.roommate.avatar;
        posterImg.alt = `Ảnh người đăng ${room.roommate.name}`;
      }
    }

    if (room.description?.length) {
      const descBox = document.getElementById("rd-description");
      if (descBox) {
        descBox.innerHTML = room.description.map((p) => `<p>${Core.escapeHTML(p)}</p>`).join("");
      }
    }

    if (room.images?.length) {
      const heroImg = document.getElementById("rd-gallery-hero");
      if (heroImg) {
        heroImg.src = room.images[0];
        heroImg.alt = `${room.title} - ảnh chính`;
      }
      document.querySelectorAll(".rd-gallery-sub").forEach((img, idx) => {
        if (room.images[idx + 1]) {
          img.src = room.images[idx + 1];
          img.alt = `${room.title} - ảnh chi tiết ${idx + 2}`;
        }
      });
    }

    const bookmarkBtn = document.getElementById("bookmarkBtn");
    if (bookmarkBtn) {
      const updateBookmarkUI = (isSaved) => {
        const icon = bookmarkBtn.querySelector(".material-symbols-outlined");
        const label = bookmarkBtn.querySelector("span:not(.material-symbols-outlined)");
        if (icon) {
          icon.style.fontVariationSettings = isSaved ? "'FILL' 1" : "'FILL' 0";
          icon.classList.toggle("text-error", isSaved);
        }
        if (label) label.textContent = isSaved ? "Đã lưu tin" : "Lưu tin";
      };
      updateBookmarkUI(Core.getSavedRoomIds().includes(String(room.id)));
      bookmarkBtn.addEventListener("click", () => {
        const nowSaved = Core.toggleSavedRoom(room.id);
        updateBookmarkUI(nowSaved);
        Core.showToast(nowSaved ? "Đã lưu tin phòng trọ!" : "Đã bỏ lưu tin.", nowSaved ? "success" : "info");
      });
    }

    let visitMode = "Xem trực tiếp";
    document.querySelectorAll(".visit-type-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        visitMode = this.textContent.trim();
        document.querySelectorAll(".visit-type-btn").forEach((b) => {
          b.classList.remove("active", "bg-surface-container-lowest", "text-primary", "font-semibold", "shadow-sm");
          b.classList.add("bg-transparent", "text-on-surface-variant");
        });
        this.classList.add("active", "bg-surface-container-lowest", "text-primary", "font-semibold", "shadow-sm");
        this.classList.remove("bg-transparent", "text-on-surface-variant");
      });
    });

    document.getElementById("rd-share-btn")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        Core.showToast("Đã sao chép link phòng trọ!");
      } catch {
        Core.showToast("Link phòng: " + window.location.href, "info");
      }
    });

    document.getElementById("rd-report-btn")?.addEventListener("click", () => Core.openReportModal(room.title));
    document.getElementById("rd-gallery-open-btn")?.addEventListener("click", () => Core.openGalleryModal(room.images, room.title));

    const connectDetailBtn = document.getElementById("rd-connect-btn") || document.getElementById("rd-chat-btn");
    const syncDetailConnectBtn = () => {
      if (!connectDetailBtn) return;
      const partnerId = room.roommate?.id || `room-${room.id}`;
      const partnerName = room.roommate?.name || "Chủ phòng";
      const conn = Core.getConnectionForPartner(partnerId, partnerName);
      if (conn?.status === "accepted" || conn?.status === "matched") {
        connectDetailBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">verified</span><span>Mở Zalo / SĐT của ${Core.escapeHTML(partnerName)}</span>`;
      } else if (conn?.status === "pending") {
        connectDetailBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">hourglass_top</span><span>Đã gửi lời mời (Chờ ${Core.escapeHTML(partnerName)} duyệt)</span>`;
      } else {
        connectDetailBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">handshake</span><span>Gửi lời mời kết nối &amp; Hẹn xem phòng</span>`;
      }
    };
    syncDetailConnectBtn();
    connectDetailBtn?.addEventListener("click", () => {
      const date = document.getElementById("visitDate")?.value || "";
      const time = document.getElementById("visitTime")?.value || "";
      const partnerId = room.roommate?.id || `room-${room.id}`;
      const partnerName = room.roommate?.name || "Chủ phòng";
      const preset = `Chào ${partnerName}, mình muốn gửi lời mời kết nối để hẹn ${visitMode.toLowerCase()} phòng "${room.shortTitle}" vào ngày ${date} lúc ${time}.`;
      Core.openConnectInviteModal({
        partnerId,
        name: partnerName,
        meta: room.roommate?.bioTitle || room.districtLabel,
        avatar: room.roommate?.avatar,
        roomId: room.id,
        contact: room.roommate?.contact,
        presetNote: preset,
        onUpdate: syncDetailConnectBtn
      });
    });

    document.getElementById("test-hop-gu")?.addEventListener("click", () => {
      window.location.href = "/roomie/trac-nghiem";
    });
    document.getElementById("rd-support-btn")?.addEventListener("click", (e) => {
      e.preventDefault();
      Core.openSupportContactModal(
        "CLB Hỗ trợ Sinh viên HCMUS",
        "Tư vấn hợp đồng & xem phòng qua Zalo / Hotline miễn phí",
        "Mình cần hỗ trợ rà soát hợp đồng thuê trọ trước khi đặt cọc."
      );
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "phong-chi-tiet") initRoomDetailPage();
  });
})();
