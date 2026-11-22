/**
 * Page: Room Detail (/roomie/phong-chi-tiet)
 * Nạp dữ liệu chi tiết phòng theo ?id=, tiện ích, thói quen, bản đồ, gallery & Double Opt-in.
 */
(function () {
  const Core = window.RoomieCore || {};
  const { escapeHTML } = Core;

  const AMENITY_META = [
    { key: "máy lạnh", icon: "ac_unit", color: "text-primary", note: "Mát mẻ, tiết kiệm điện" },
    { key: "tủ lạnh", icon: "kitchen", color: "text-tertiary", note: "Bảo quản đồ ăn riêng" },
    { key: "máy giặt", icon: "local_laundry_service", color: "text-primary", note: "Giặt phơi thuận tiện" },
    { key: "nước nóng", icon: "water_heater", color: "text-tertiary", note: "Tắm nước ấm quanh năm" },
    { key: "vân tay", icon: "fingerprint", color: "text-primary", note: "An ninh ra vào 24/7" },
    { key: "wifi", icon: "wifi", color: "text-tertiary", note: "Internet tốc độ cao" },
    { key: "ban công", icon: "balcony", color: "text-primary", note: "Thông thoáng đón sáng" },
    { key: "tự do", icon: "schedule", color: "text-tertiary", note: "Không chung chủ" },
    { key: "gác lửng", icon: "stairs", color: "text-primary", note: "Tăng không gian sinh hoạt" },
    { key: "bảo vệ", icon: "shield_person", color: "text-tertiary", note: "Bảo vệ & camera 24/7" },
    { key: "tủ giày", icon: "inventory_2", color: "text-primary", note: "Gọn gàng ngay lối vào" },
    { key: "thang máy", icon: "elevator", color: "text-tertiary", note: "Di chuyển nhanh chóng" },
    { key: "bếp", icon: "skillet", color: "text-primary", note: "Thoải mái nấu ăn" },
    { key: "cửa sổ", icon: "window", color: "text-tertiary", note: "Đón gió và ánh sáng" }
  ];

  const HABIT_ICON_MAP = [
    { match: /ngủ|giờ|thức|khuya/i, icon: "bedtime", color: "text-primary" },
    { match: /thuốc|khói/i, icon: "smoke_free", color: "text-tertiary" },
    { match: /yên|tai nghe|ồn|trật tự/i, icon: "volume_off", color: "text-primary" },
    { match: /nấu|bếp|ăn/i, icon: "skillet", color: "text-tertiary" },
    { match: /thú cưng|mèo|chó/i, icon: "pets", color: "text-outline" },
    { match: /dọn|sạch|ngăn nắp|vệ sinh/i, icon: "cleaning_services", color: "text-primary" },
    { match: /hóa đơn|chi phí|tiền/i, icon: "receipt_long", color: "text-tertiary" }
  ];

  function resolveAmenityMeta(label) {
    const lower = String(label || "").toLowerCase();
    const hit = AMENITY_META.find((item) => lower.includes(item.key));
    if (hit) return hit;
    return { icon: "check_circle", color: "text-primary", note: "Trang bị đầy đủ" };
  }

  function resolveHabitIcon(label) {
    const text = String(label || "");
    return HABIT_ICON_MAP.find((item) => item.match.test(text)) || { icon: "check_circle", color: "text-tertiary" };
  }

  function toISODateLocal(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

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

    const syncRoomMatchBadge = () => {
      const latestRoom = Core.getAllRooms().find((r) => String(r.id) === String(room.id)) || room;
      const unlockedScore = Boolean(Core.hasUnlockedPrediction?.() && Core.hasCompletedQuiz?.());
      const matchScoreVal = unlockedScore ? Number(latestRoom.matchScore) || 0 : 0;
      setText("rd-match-score", matchScoreVal > 0 ? `${matchScoreVal}% Hợp gu` : "Khóa theo Gói 4/5");
      const matchRing = document.getElementById("rd-match-ring");
      if (matchRing) {
        matchRing.setAttribute("stroke-dasharray", `${matchScoreVal}, 100`);
      }
    };
    syncRoomMatchBadge();
    Core.onPlanStateChange?.(syncRoomMatchBadge);
    window.addEventListener("roomie:demo-ready", syncRoomMatchBadge);
    window.addEventListener("roomie:quiz-results-updated", syncRoomMatchBadge);

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

    const matchSection = document.getElementById("rd-roommate-match-section");
    const testBtn = document.getElementById("test-hop-gu");
    if (isPrivate) {
      matchSection?.classList.add("hidden");
      testBtn?.classList.add("hidden");
    } else {
      matchSection?.classList.remove("hidden");
      testBtn?.classList.remove("hidden");
    }

    if (room.roommate) {
      setText("rd-rm-name", room.roommate.name);
      setText("rd-rm-age", room.roommate.age || "Chủ nhà");
      setText("rd-rm-bio", room.roommate.bioTitle);
      setText("rd-rm-note", room.roommate.note);
      setText("rd-poster-name", isPrivate ? room.roommate.name : `${room.roommate.name} (Người đăng)`);
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

      const habitsEl = document.getElementById("rd-rm-habits");
      if (habitsEl && Array.isArray(room.roommate.habits) && room.roommate.habits.length) {
        habitsEl.innerHTML = room.roommate.habits
          .map((habit) => {
            const cfg = resolveHabitIcon(habit);
            return `
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-body-sm text-body-sm shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <span class="material-symbols-outlined text-[16px] ${cfg.color}">${cfg.icon}</span>
                ${escapeHTML(habit)}
              </span>
            `;
          })
          .join("");
      }
    }

    if (room.description?.length) {
      const descBox = document.getElementById("rd-description");
      if (descBox) {
        descBox.innerHTML = room.description.map((p) => `<p>${escapeHTML(p)}</p>`).join("");
      }
    }

    // Dynamic Amenities Grid
    const amenitiesEl = document.getElementById("rd-amenities-grid");
    const amenitiesCountEl = document.getElementById("rd-amenities-count");
    if (amenitiesEl && Array.isArray(room.amenities) && room.amenities.length) {
      if (amenitiesCountEl) {
        amenitiesCountEl.textContent = `${room.amenities.length} tiện nghi nổi bật`;
      }
      amenitiesEl.innerHTML = room.amenities
        .map((label) => {
          const meta = resolveAmenityMeta(label);
          return `
            <div class="p-space-md rounded-xl bg-surface-container-lowest shadow-[0_1px_4px_rgba(32,36,43,0.03)] flex flex-col gap-2">
              <span class="material-symbols-outlined ${meta.color} text-[24px]">${meta.icon}</span>
              <span class="font-label-md text-label-md text-on-surface font-semibold">${escapeHTML(label)}</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant">${escapeHTML(meta.note)}</span>
            </div>
          `;
        })
        .join("");
    }

    // Dynamic Map Box & Google Maps Search Link
    const mapBox = document.getElementById("rd-map-box");
    const mapAddr = document.getElementById("rd-map-address");
    const mapLink = document.getElementById("rd-map-link");
    if (mapBox) mapBox.setAttribute("data-location", room.address || room.districtLabel || "");
    if (mapAddr) mapAddr.textContent = room.address || room.districtLabel || "";
    if (mapLink && room.address) {
      mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(room.address)}`;
    }

    // Dynamic Gallery Mosaic (avoids stale photos on rooms with fewer than 4 images)
    const imgs = Array.isArray(room.images) && room.images.length ? room.images : [Core.FALLBACK_SVG];
    setText("rd-gallery-count", `Xem tất cả ${imgs.length} ảnh phòng`);
    const heroWrap = document.getElementById("rd-gallery-hero-wrap");
    const col1Wrap = document.getElementById("rd-gallery-col-1");
    const col2Wrap = document.getElementById("rd-gallery-col-2");
    const heroImg = document.getElementById("rd-gallery-hero");
    if (heroImg) {
      heroImg.src = imgs[0];
      heroImg.alt = `${room.title} - ảnh chính`;
    }
    const subImgs = Array.from(document.querySelectorAll(".rd-gallery-sub"));
    subImgs.forEach((img, idx) => {
      const url = imgs[idx + 1];
      const tile = img.closest(".rd-gallery-tile") || img.parentElement;
      if (url) {
        img.src = url;
        img.alt = `${room.title} - ảnh chi tiết ${idx + 2}`;
        tile?.classList.remove("hidden");
      } else {
        tile?.classList.add("hidden");
      }
    });

    if (heroWrap && col1Wrap && col2Wrap) {
      const hasCol1 = Boolean(imgs[1]);
      const hasCol2 = Boolean(imgs[2] || imgs[3]);
      col1Wrap.classList.toggle("md:block", hasCol1);
      col1Wrap.classList.toggle("md:col-span-2", hasCol1 && !hasCol2);
      col2Wrap.classList.toggle("md:flex", hasCol2);
      heroWrap.classList.remove("md:col-span-2", "md:col-span-4");
      heroWrap.classList.add(hasCol1 || hasCol2 ? "md:col-span-2" : "md:col-span-4");

      const col2Tiles = col2Wrap.querySelectorAll(".rd-gallery-tile");
      if (col2Tiles.length === 2 && imgs[2] && !imgs[3]) {
        col2Tiles[0].classList.remove("h-1/2");
        col2Tiles[0].classList.add("h-full");
      }
    }

    const openGallery = () => Core.openGalleryModal(imgs, room.title);
    document.getElementById("rd-gallery-open-btn")?.addEventListener("click", openGallery);
    heroWrap?.addEventListener("click", openGallery);
    col1Wrap?.addEventListener("click", openGallery);
    col2Wrap?.querySelectorAll(".rd-gallery-tile").forEach((tile) => tile.addEventListener("click", openGallery));

    // Set default visitDate to tomorrow cleanly
    const visitDateEl = document.getElementById("visitDate");
    if (visitDateEl) {
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 86400000);
      visitDateEl.min = toISODateLocal(today);
      if (!visitDateEl.value) {
        visitDateEl.value = toISODateLocal(tomorrow);
      }
    }

    // Bookmark button
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
      const syncBookmarkState = () => {
        updateBookmarkUI(Core.getSavedRoomIds().includes(String(room.id)));
      };
      syncBookmarkState();
      Core.onAuthStateChange?.(syncBookmarkState);
      bookmarkBtn.addEventListener("click", () => {
        if (!Core.isLoggedIn?.()) {
          Core.toggleSavedRoom(room.id);
          return;
        }
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

    document.getElementById("rd-report-btn")?.addEventListener("click", () => Core.openReportModal(room.title, room.id));

    // Double Opt-in connect button
    const connectDetailBtn = document.getElementById("rd-connect-btn");
    const partnerId = room.roommate?.id || `room-${room.id}`;
    const partnerName = room.roommate?.name || "Chủ phòng";

    const syncDetailConnectBtn = () => {
      if (!connectDetailBtn) return;
      const conn = Core.getConnectionForPartner(partnerId, partnerName);
      if (conn?.status === "accepted" || conn?.status === "matched") {
        connectDetailBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">verified</span><span>Mở Zalo / SĐT của ${escapeHTML(partnerName)}</span>`;
      } else if (conn?.status === "pending") {
        connectDetailBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">hourglass_top</span><span>Đã gửi lời mời (Chờ ${escapeHTML(partnerName)} duyệt)</span>`;
      } else if (conn?.status === "incoming") {
        connectDetailBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">handshake</span><span>${escapeHTML(partnerName)} đã mời bạn • Đồng ý &amp; Mở Zalo</span>`;
      } else {
        const defaultLabel = isPrivate
          ? "Gửi lời mời liên hệ chủ trọ & Hẹn xem phòng"
          : "Gửi lời mời kết nối & Hẹn xem phòng";
        connectDetailBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">handshake</span><span>${defaultLabel}</span>`;
      }
    };
    syncDetailConnectBtn();
    window.addEventListener("roomie:connections-updated", syncDetailConnectBtn);

    connectDetailBtn?.addEventListener("click", () => {
      const date = document.getElementById("visitDate")?.value || "";
      const time = document.getElementById("visitTime")?.value || "";
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

    testBtn?.addEventListener("click", () => {
      window.location.href = "/roomie/trac-nghiem";
    });
    document.getElementById("rd-support-btn")?.addEventListener("click", (e) => {
      e.preventDefault();
      Core.openSupportContactModal(
        "Ban Hỗ trợ Sinh viên Roomie",
        "Tư vấn hợp đồng & xem phòng qua Zalo / Hotline miễn phí",
        "Mình cần hỗ trợ rà soát hợp đồng thuê trọ trước khi đặt cọc."
      );
    });

    // Dynamic Similar Listings (matches city/district cleanly across TP.HCM & Hà Nội)
    const similarGrid = document.getElementById("rd-similar-grid");
    const similarMoreLink = document.getElementById("rd-similar-more-link");
    const similarMoreText = document.getElementById("rd-similar-more-text");
    if (similarMoreLink) {
      const targetCity = room.city || "TP.HCM";
      similarMoreLink.href = `/roomie/tim-phong?city=${encodeURIComponent(targetCity)}&area=${encodeURIComponent(room.areaKey || "")}`;
      if (similarMoreText) {
        similarMoreText.textContent = `Xem thêm phòng ${room.districtLabel || targetCity}`;
      }
    }
    if (similarGrid) {
      const others = rooms
        .filter((r) => String(r.id) !== String(room.id))
        .sort((a, b) => {
          const score = (x) =>
            (x.areaKey === room.areaKey ? 4 : 0) +
            ((x.city || "TP.HCM") === (room.city || "TP.HCM") ? 2 : 0) +
            (x.typeKey === room.typeKey ? 1 : 0);
          return score(b) - score(a);
        })
        .slice(0, 3);

      similarGrid.innerHTML = others
        .map(
          (item) => `
          <a href="/roomie/phong-chi-tiet?id=${escapeHTML(item.id)}" class="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(32,36,43,0.04)] hover:shadow-[0_12px_24px_-4px_rgba(99,91,255,0.08)] transition-all flex flex-col">
            <div class="relative h-48 overflow-hidden">
              <img loading="lazy" decoding="async" alt="${escapeHTML(item.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${escapeHTML(item.image || item.images?.[0] || Core.FALLBACK_SVG)}" />
              <span class="absolute top-3 left-3 px-space-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                ${escapeHTML(item.badgeText || item.spotsLabel)}
              </span>
              <span class="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-inverse-surface/80 text-inverse-on-surface backdrop-blur-sm font-label-sm text-label-sm">
                ${escapeHTML(item.areaSqm)} m²
              </span>
            </div>
            <div class="p-space-md flex flex-col justify-between flex-1 gap-space-sm">
              <div class="flex flex-col gap-1">
                <span class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px] text-tertiary">near_me</span>
                  ${escapeHTML(item.distanceLabel)}
                </span>
                <h3 class="font-title-md text-title-md text-on-surface font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                  ${escapeHTML(item.shortTitle)}
                </h3>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span class="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                    ${escapeHTML(item.amenities?.[0] || item.districtLabel)}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                    ${escapeHTML(item.city || "TP.HCM")}
                  </span>
                </div>
              </div>
              <div class="flex items-baseline justify-between pt-space-xs border-t border-surface-container">
                <span class="font-currency-md text-currency-md text-primary font-bold">
                  ${escapeHTML(item.priceFormatted)}
                </span>
                <span class="font-body-sm text-body-sm text-on-surface-variant">
                  ${Core.isPrivateRoom(item) ? "/tháng" : "/người/tháng"}
                </span>
              </div>
            </div>
          </a>
        `
        )
        .join("");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "phong-chi-tiet") {
      (Core.ready || Promise.resolve()).then(initRoomDetailPage);
    }
  });
})();
