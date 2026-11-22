/**
 * Roomie Core Utilities, Shared State & Modals
 * Quản lý lưu trữ cục bộ, định dạng tiền tệ, tìm kiếm chuẩn hóa, toast, modal và luồng Double Opt-in.
 */
(function () {
  const Data = window.RoomieData || {};
  const CONTACT = Data.CONTACT_INFO || {
    phone: "+84 777 639 593",
    tel: "+84777639593",
    zalo: "0777639593",
    email: "roomie2026@gmail.com",
    address: "227 Nguyễn Văn Cừ, Chợ Quán, TPHCM"
  };

  const STORAGE_KEYS = {
    SAVED_ROOMS: "rm_saved_rooms",
    INVITED_ROOMMATES: "rm_invited_roommates",
    QUIZ_ANSWERS: "rm_quiz_answers",
    QUIZ_RESULT: "rm_quiz_result",
    QUIZ_USER_ID: "rm_quiz_user_id",
    CUSTOM_LISTINGS: "rm_custom_listings",
    LISTING_DRAFT: "rm_listing_draft",
    NOTIFICATIONS_READ: "rm_notifications_read",
    CONNECTIONS: "rm_connections",
    ACTIVE_PLANS: "rm_active_plans",
    AUTH_SESSION: "rm_auth_session",
    AUTH_USERS: "rm_auth_users"
  };

  const MAX_CONTACT_SLOTS = 3;
  const RELEASE_REASONS = [
    "Khác giờ giấc / thói quen",
    "Không hợp ngân sách",
    "Phòng đã có người đặt",
    "Đã chọn được bạn khác"
  ];

  const FALLBACK_SVG =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#e2dfff"/>
            <stop offset="100%" stop-color="#b5efd2"/>
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#g)"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#493ee5" font-family="sans-serif" font-size="22" font-weight="700">Roomie</text>
      </svg>`
    );

  /** Read and parse JSON safely from localStorage. */
  function readJSON(key, fallback) {
    try {
      if (key === STORAGE_KEYS.QUIZ_ANSWERS || key === STORAGE_KEYS.QUIZ_RESULT) {
        ensureQuizDataBelongsToCurrentUser();
      }
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  /** Serialize and store JSON safely in localStorage. */
  function writeJSON(key, value) {
    try {
      if (key === STORAGE_KEYS.QUIZ_ANSWERS || key === STORAGE_KEYS.QUIZ_RESULT) {
        ensureQuizDataBelongsToCurrentUser();
      }
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage quota errors in private browsing mode
    }
  }

  function ensureQuizDataBelongsToCurrentUser() {
    try {
      const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTH_SESSION) || "null");
      const userId = session?.loggedIn && session.user?.id ? String(session.user.id) : "guest";
      const ownerId = localStorage.getItem(STORAGE_KEYS.QUIZ_USER_ID);
      if (ownerId === userId) return;

      localStorage.removeItem(STORAGE_KEYS.QUIZ_ANSWERS);
      localStorage.removeItem(STORAGE_KEYS.QUIZ_RESULT);
      localStorage.setItem(STORAGE_KEYS.QUIZ_USER_ID, userId);
    } catch {
      // Local storage may be unavailable in private browsing mode.
    }
  }

  function escapeHTML(value) {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => entities[ch]);
  }

  function formatVND(num) {
    const n = Number(String(num).replace(/[^\d]/g, "")) || 0;
    return n.toLocaleString("vi-VN") + "đ";
  }

  function parseCurrencyNumber(str) {
    return Number(String(str || "").replace(/[^\d]/g, "")) || 0;
  }

  /** Normalize Vietnamese text for accent-insensitive search matching. */
  function normalizeSearchText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/tp\.?\s*hcm/g, "tphcm")
      .replace(/tp\.?\s*ho\s+chi\s+minh/g, "tp ho chi minh tphcm")
      .replace(/\bq\.?\s*(\d{1,2})\b/g, "quan $1")
      .replace(/[.\-–—_/(),·]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getPurchasedPlans() {
    const raw = readJSON(STORAGE_KEYS.ACTIVE_PLANS, []);
    return Array.isArray(raw) ? raw.filter((p) => p && p.id && p.id !== "basic") : [];
  }

  function hasPurchasedPlan(pkgId) {
    return getPurchasedPlans().some((p) => p.id === pkgId);
  }

  function hasUnlockedPrediction() {
    return getPurchasedPlans().length > 0;
  }

  function getLatestPurchasedPlan() {
    return getPurchasedPlans()[0] || null;
  }

  function activatePurchasedPlan(pkg) {
    if (!pkg || !pkg.id || pkg.id === "basic") return;
    const current = getPurchasedPlans().filter((p) => p.id !== pkg.id);
    const nextRecord = {
      id: pkg.id,
      name: pkg.name || pkg.id,
      price: pkg.price || "",
      period: pkg.period || "",
      purchasedAt: Date.now()
    };
    writeJSON(STORAGE_KEYS.ACTIVE_PLANS, [nextRecord, ...current]);
    window.dispatchEvent(new CustomEvent("roomie:plan-updated", { detail: { pkg: nextRecord } }));
    apiFetch("/api/plans/purchase", { method: "POST", body: nextRecord });
  }

  function resetPurchasedPlans() {
    writeJSON(STORAGE_KEYS.ACTIVE_PLANS, []);
    window.dispatchEvent(new CustomEvent("roomie:plan-updated", { detail: { pkg: null } }));
    apiFetch("/api/plans/reset", { method: "POST" });
  }

  function onPlanStateChange(callback) {
    window.addEventListener("roomie:plan-updated", callback);
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEYS.ACTIVE_PLANS) callback();
    });
  }

  function getAllRooms() {
    const custom = readJSON(STORAGE_KEYS.CUSTOM_LISTINGS, []);
    const base = Data.ROOMS || [];
    const seen = new Set();
    const merged = [];
    [...custom, ...base].forEach((r) => {
      if (r && r.id !== undefined && !seen.has(String(r.id))) {
        seen.add(String(r.id));
        merged.push(r);
      }
    });
    return merged;
  }

  function isPrivateRoom(room) {
    return Boolean(room && room.typeKey === "phong-rieng");
  }

  function getSavedRoomIds() {
    return readJSON(STORAGE_KEYS.SAVED_ROOMS, []);
  }

  function toggleSavedRoom(id) {
    const strId = String(id);
    const saved = getSavedRoomIds();
    const exists = saved.includes(strId);
    const next = exists ? saved.filter((x) => x !== strId) : [...saved, strId];
    writeJSON(STORAGE_KEYS.SAVED_ROOMS, next);
    apiFetch(`/api/rooms/${encodeURIComponent(strId)}/save`, { method: "POST" });
    return !exists;
  }

  function resolvePartnerContact(partnerId, partnerName, explicitContact) {
    if (explicitContact && explicitContact.phone) return explicitContact;
    const fromRm = (Data.ROOMMATES || []).find(
      (r) => (partnerId && r.id === partnerId) || (partnerName && (r.shortName === partnerName || r.name === partnerName))
    );
    if (fromRm?.contact) return fromRm.contact;
    const fromRoom = (Data.ROOMS || []).find(
      (r) =>
        r.roommate &&
        ((partnerId && r.roommate.id === partnerId) || (partnerName && r.roommate.name === partnerName))
    );
    if (fromRoom?.roommate?.contact) return fromRoom.roommate.contact;
    return { phone: CONTACT.phone, zalo: CONTACT.zalo, facebook: "fb.com/roomie.student" };
  }

  function buildSeedIncomingConnection() {
    const rm = (Data.ROOMMATES || [])[0];
    if (!rm) return [];
    const contact = resolvePartnerContact(rm.id, rm.name, rm.contact);
    return [
      {
        id: `conn-${rm.id}`,
        partnerId: rm.id,
        name: rm.name,
        meta: `${rm.school} • ${rm.matchScore}% Hợp gu`,
        avatar: rm.avatar,
        roomId: rm.linkedRoomId || "1",
        status: "incoming",
        note: "Chào Minh Thư! Tụi mình hợp 98% thói quen học đêm và gọn gàng. Bạn kết nối để mình gửi ảnh phòng qua Zalo nhé?",
        phone: contact.phone,
        zalo: contact.zalo,
        facebook: contact.facebook,
        revertedOnce: false,
        createdAt: Date.now() - 3600000,
        updatedAt: Date.now() - 3600000
      }
    ];
  }

  function getConnections() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONNECTIONS);
      if (raw === null) {
        const seeded = buildSeedIncomingConnection();
        writeJSON(STORAGE_KEYS.CONNECTIONS, seeded);
        return seeded;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const rmMap = new Map((Data.ROOMMATES || []).map((r) => [r.id, r]));
      return parsed.map((c) => {
        const matchedRm = c?.partnerId ? rmMap.get(c.partnerId) : null;
        return matchedRm?.avatar ? { ...c, avatar: matchedRm.avatar } : c;
      });
    } catch {
      return [];
    }
  }

  function syncHeaderSlotBadge(list) {
    const badge = document.getElementById("rm-header-slot-badge");
    if (!badge) return;
    const all = list || getConnections();
    const activeCount = getActiveSlotConnections(all).length;
    const incomingCount = all.filter((c) => c.status === "incoming").length;
    if (activeCount > 0 || incomingCount > 0) {
      badge.textContent = `${activeCount}/${MAX_CONTACT_SLOTS}`;
      badge.classList.remove("hidden");
      badge.classList.toggle("bg-primary", activeCount > 0);
      badge.classList.toggle("text-on-primary", activeCount > 0);
      badge.classList.toggle("bg-secondary-container", activeCount === 0);
      badge.classList.toggle("text-on-secondary-fixed", activeCount === 0);
    } else {
      badge.classList.add("hidden");
    }
  }

  function saveConnections(list) {
    const clean = Array.isArray(list) ? list : [];
    writeJSON(STORAGE_KEYS.CONNECTIONS, clean);
    const activeIds = clean
      .filter((c) => ["pending", "accepted", "matched"].includes(c.status) && c.partnerId)
      .map((c) => c.partnerId);
    writeJSON(STORAGE_KEYS.INVITED_ROOMMATES, activeIds);
    syncHeaderSlotBadge(clean);
    return clean;
  }

  function getActiveSlotConnections(list) {
    const all = list || getConnections();
    return all.filter((c) => c.status === "pending" || c.status === "accepted");
  }

  function getConnectionForPartner(partnerId, partnerName, list) {
    const all = list || getConnections();
    return all.find(
      (c) =>
        (partnerId && c.partnerId === partnerId) ||
        (partnerName && c.name && (c.name === partnerName || c.name.endsWith(partnerName)))
    );
  }

  function upsertConnectionRecord(target, status, extra = {}) {
    const all = getConnections();
    const contact = resolvePartnerContact(target.partnerId, target.name, target.contact);
    const existing = getConnectionForPartner(target.partnerId, target.name, all);
    const now = Date.now();
    const nextRecord = {
      id: existing?.id || `conn-${target.partnerId || now}`,
      partnerId: target.partnerId || existing?.partnerId || "",
      name: target.name || existing?.name || "Sinh viên Roomie",
      meta: target.meta || existing?.meta || "Hồ sơ sinh viên Roomie",
      avatar: target.avatar || existing?.avatar || "/assets/images/common/avatar-profile.jpg",
      roomId: target.roomId || existing?.roomId || "",
      status,
      note: extra.note !== undefined ? extra.note : existing?.note || "",
      releaseReason: extra.releaseReason || "",
      revertedOnce: extra.revertedOnce ?? existing?.revertedOnce ?? false,
      phone: contact.phone,
      zalo: contact.zalo,
      facebook: contact.facebook,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };
    const filtered = all.filter((c) => c.id !== nextRecord.id);
    saveConnections([nextRecord, ...filtered]);
    apiFetch("/api/connections/invite", {
      method: "POST",
      body: {
        connId: nextRecord.id,
        partnerId: nextRecord.partnerId,
        name: nextRecord.name,
        meta: nextRecord.meta,
        avatar: nextRecord.avatar,
        roomId: nextRecord.roomId,
        status: nextRecord.status,
        note: nextRecord.note,
        releaseReason: nextRecord.releaseReason,
        revertedOnce: nextRecord.revertedOnce,
        contact
      }
    });
    return nextRecord;
  }

  function updateConnectionStatus(connId, nextStatus, extra = {}) {
    const all = getConnections();
    let updated = null;
    const nextList = all.map((c) => {
      if (c.id !== connId) return c;
      updated = { ...c, ...extra, status: nextStatus, updatedAt: Date.now() };
      return updated;
    });
    saveConnections(nextList);
    apiFetch(`/api/connections/${encodeURIComponent(connId)}`, {
      method: "PATCH",
      body: {
        status: nextStatus,
        releaseReason: extra.releaseReason,
        revertedOnce: extra.revertedOnce
      }
    });
    return updated;
  }

  /** Display a dismissible toast notification. */
  function showToast(message, variant = "success") {
    let container = document.getElementById("rm-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "rm-toast-container";
      container.className = "fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0";
      document.body.appendChild(container);
    }

    const palette =
      variant === "error"
        ? "bg-error text-on-error"
        : variant === "info"
        ? "bg-inverse-surface text-inverse-on-surface"
        : "bg-tertiary text-on-tertiary";
    const icon = variant === "error" ? "error" : variant === "info" ? "info" : "check_circle";

    const toast = document.createElement("div");
    toast.className = `pointer-events-auto rm-animate-in flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-xl ${palette}`;
    toast.innerHTML = `
      <div class="flex items-center gap-2.5 text-sm font-medium">
        <span class="material-symbols-outlined text-[20px]">${icon}</span>
        <span>${escapeHTML(message)}</span>
      </div>
      <button type="button" class="opacity-75 hover:opacity-100 leading-none" aria-label="Đóng thông báo">
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
    `;
    toast.querySelector("button").addEventListener("click", () => toast.remove());
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.25s ease";
      setTimeout(() => toast.remove(), 250);
    }, 3600);
  }

  function closeModal() {
    document.getElementById("rm-modal-overlay")?.remove();
  }

  function openModal({ title, subtitle = "", bodyHtml, maxWidth = "max-w-lg" }) {
    closeModal();
    const overlay = document.createElement("div");
    overlay.id = "rm-modal-overlay";
    overlay.className =
      "fixed inset-0 z-[90] bg-inverse-surface/55 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto";
    overlay.innerHTML = `
      <div role="dialog" aria-modal="true" class="rm-animate-in w-full ${maxWidth} bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden my-auto border border-surface-container">
        <div class="px-6 py-4 bg-surface-container-low flex items-start justify-between gap-4 border-b border-surface-container">
          <div>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${escapeHTML(title)}</h3>
            ${subtitle ? `<p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">${escapeHTML(subtitle)}</p>` : ""}
          </div>
          <button type="button" id="rm-modal-close" aria-label="Đóng hộp thoại" class="w-8 h-8 rounded-full bg-surface-container-lowest hover:bg-surface-container flex items-center justify-center text-on-surface-variant">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div class="p-6 max-h-[75vh] overflow-y-auto">${bodyHtml}</div>
      </div>
    `;

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    overlay.querySelector("#rm-modal-close").addEventListener("click", closeModal);
    document.body.appendChild(overlay);
    return overlay;
  }

  async function copyContactText(value, label = "số điện thoại") {
    try {
      await navigator.clipboard.writeText(value);
      showToast(`Đã sao chép ${label}: ${value}`);
    } catch {
      showToast(`${label}: ${value}`, "info");
    }
  }

  function buildSlotBarHtml(activeCount) {
    const segs = Array.from({ length: MAX_CONTACT_SLOTS }, (_, i) => {
      const filled = i < activeCount;
      return `<div class="h-2 flex-1 rounded-full ${filled ? "bg-primary" : "bg-surface-container-highest"} transition-colors"></div>`;
    }).join("");
    return `
      <div class="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/25 flex flex-col gap-2">
        <div class="flex items-center justify-between text-xs font-semibold">
          <span class="text-on-surface flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-primary">hub</span>
            Slot liên hệ song song đang dùng
          </span>
          <span class="${activeCount >= MAX_CONTACT_SLOTS ? "text-error" : "text-primary"} font-bold">${activeCount} / ${MAX_CONTACT_SLOTS} slot</span>
        </div>
        <div class="flex gap-1.5">${segs}</div>
        <p class="text-[11px] text-on-surface-variant leading-relaxed">
          Tối đa ${MAX_CONTACT_SLOTS} người đang trao đổi cùng lúc. Hãy cập nhật "Không phù hợp" hoặc "Đã chốt Roommate" để giải phóng slot mới.
        </p>
      </div>
    `;
  }

  function buildUnlockedContactCardHtml(conn) {
    const phoneDisplay = escapeHTML(conn.phone || CONTACT.phone);
    const zaloId = escapeHTML(conn.zalo || CONTACT.zalo);
    const fbLink = escapeHTML(conn.facebook || "fb.com/roomie.student");
    return `
      <div class="p-4 rounded-2xl bg-secondary-container/35 border border-tertiary/25 flex flex-col gap-3">
        <div class="flex items-center gap-2 text-xs font-bold text-tertiary">
          <span class="material-symbols-outlined text-[17px]">verified_user</span>
          <span>Double Opt-in thành công • Đã mở khóa Zalo &amp; SĐT</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
          <div class="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-between gap-2">
            <div class="min-w-0">
              <div class="text-[11px] text-on-surface-variant font-medium">Số điện thoại</div>
              <a href="tel:${zaloId}" class="text-[13.5px] font-bold text-on-surface hover:text-primary whitespace-nowrap block">${phoneDisplay}</a>
            </div>
            <button type="button" data-copy-phone="${phoneDisplay}" class="px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-primary-fixed text-primary text-[11.5px] font-semibold shrink-0">
              Sao chép
            </button>
          </div>
          <a href="https://zalo.me/${zaloId}" target="_blank" rel="noopener" class="p-3 rounded-xl bg-primary text-on-primary hover:bg-on-primary-fixed-variant flex items-center justify-between gap-2 transition-colors shadow-xs">
            <div class="min-w-0">
              <div class="text-[11px] opacity-85 font-medium">zalo.me/${zaloId}</div>
              <div class="text-[13.5px] font-bold whitespace-nowrap">Mở Zalo trao đổi</div>
            </div>
            <span class="material-symbols-outlined text-[20px] shrink-0">open_in_new</span>
          </a>
        </div>
        <div class="flex items-center justify-between text-xs text-on-surface-variant pt-0.5">
          <span>Facebook: <strong class="text-on-surface">${fbLink}</strong></span>
          <a href="tel:${zaloId}" class="text-primary font-semibold hover:underline">Gọi ngay</a>
        </div>
      </div>
    `;
  }

  function openSlotFullModal() {
    const activeCount = getActiveSlotConnections().length;
    const modal = openModal({
      title: "Đã dùng hết Slot liên hệ song song",
      subtitle: `Bạn đang giữ ${activeCount}/${MAX_CONTACT_SLOTS} slot chờ duyệt hoặc đang trao đổi`,
      maxWidth: "max-w-md",
      bodyHtml: `
        <div class="flex flex-col gap-4">
          ${buildSlotBarHtml(activeCount)}
          <div class="p-3.5 rounded-xl bg-error-container/40 text-on-error-container text-xs flex items-start gap-2 leading-relaxed">
            <span class="material-symbols-outlined text-[18px] shrink-0">info</span>
            <span>Để chống spam và không phải đóng phí lại, hãy vào quản lý kết nối cập nhật <strong>"Không phù hợp"</strong> (kèm lý do) hoặc <strong>"Đã chốt Roommate"</strong> để giải phóng slot trống.</span>
          </div>
          <div class="flex gap-2.5">
            <button type="button" id="rm-open-drawer-from-full" class="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-semibold text-sm flex items-center justify-center gap-1.5">
              <span class="material-symbols-outlined text-[18px]">tune</span>
              <span>Quản lý &amp; Giải phóng Slot</span>
            </button>
            <button type="button" id="rm-close-full-slot" class="px-4 py-3 rounded-xl bg-surface-container text-on-surface text-sm font-medium">Đóng</button>
          </div>
        </div>
      `
    });
    modal.querySelector("#rm-close-full-slot").addEventListener("click", closeModal);
    modal.querySelector("#rm-open-drawer-from-full").addEventListener("click", () => {
      closeModal();
      openConnectionsDrawer();
    });
  }

  function openContactUnlockedModal(conn, onUpdate) {
    if (!conn) return;
    const reasonOptions = RELEASE_REASONS.map((r) => `<option value="${escapeHTML(r)}">${escapeHTML(r)}</option>`).join("");
    const modal = openModal({
      title: `Kết nối 2 chiều • ${conn.name}`,
      subtitle: conn.meta || "Đã hoàn tất Double Opt-in",
      maxWidth: "max-w-lg",
      bodyHtml: `
        <div class="flex flex-col gap-4">
          ${buildUnlockedContactCardHtml(conn)}
          <div class="p-4 rounded-2xl bg-surface-container-low flex flex-col gap-3">
            <div class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Cập nhật kết quả sau khi trao đổi ngoài Zalo</div>
            <div class="flex flex-col sm:flex-row gap-2.5">
              <button type="button" id="rm-unlocked-match-btn" class="flex-1 py-2.5 px-3.5 rounded-xl bg-tertiary hover:bg-on-tertiary-fixed-variant text-on-tertiary font-semibold text-[13px] whitespace-nowrap flex items-center justify-center gap-1.5 transition-colors">
                <span class="material-symbols-outlined text-[18px]">done_all</span>
                <span>Đã chốt Roommate</span>
              </button>
              <button type="button" id="rm-unlocked-release-btn" class="flex-1 py-2.5 px-3.5 rounded-xl bg-surface-container-high hover:bg-error-container hover:text-on-error-container text-on-surface font-semibold text-[13px] whitespace-nowrap flex items-center justify-center gap-1.5 transition-colors">
                <span class="material-symbols-outlined text-[18px]">event_busy</span>
                <span>Không hợp (Mở slot)</span>
              </button>
            </div>
            <div class="flex items-center gap-2 text-xs text-on-surface-variant">
              <label for="rm-release-reason-select" class="shrink-0 font-medium">Lý do (nếu mở slot):</label>
              <select id="rm-release-reason-select" class="flex-1 h-9 px-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-xs text-on-surface">
                ${reasonOptions}
              </select>
            </div>
          </div>
        </div>
      `
    });

    modal.querySelectorAll("[data-copy-phone]").forEach((btn) => {
      btn.addEventListener("click", () => copyContactText(btn.dataset.copyPhone));
    });
    modal.querySelector("#rm-unlocked-match-btn").addEventListener("click", () => {
      updateConnectionStatus(conn.id, "matched");
      closeModal();
      onUpdate?.();
      showToast(`Chúc mừng! Đã chốt ở ghép cùng ${conn.name} và giải phóng slot.`);
      openContractModal();
    });
    modal.querySelector("#rm-unlocked-release-btn").addEventListener("click", () => {
      const reason = modal.querySelector("#rm-release-reason-select")?.value || RELEASE_REASONS[0];
      updateConnectionStatus(conn.id, "released", { releaseReason: reason });
      closeModal();
      onUpdate?.();
      showToast(`Đã giải phóng 1 slot (${reason}). Bạn có thể mời người mới!`, "info");
    });
  }

  function openPendingInviteModal(conn, onUpdate) {
    if (!conn) return;
    const activeCount = getActiveSlotConnections().length;
    const modal = openModal({
      title: `Đang chờ ${conn.name} đồng ý`,
      subtitle: `Đã gửi lời mời kết nối 2 chiều • Đang giữ ${activeCount}/${MAX_CONTACT_SLOTS} slot`,
      maxWidth: "max-w-md",
      bodyHtml: `
        <div class="flex flex-col gap-4">
          <div class="p-3.5 rounded-xl bg-primary-fixed/40 text-on-primary-fixed-variant text-xs flex items-start gap-2 leading-relaxed">
            <span class="material-symbols-outlined text-[18px] text-primary shrink-0">lock_clock</span>
            <span>SĐT &amp; Zalo của cả hai đang được ẩn. Ngay khi <strong>${escapeHTML(conn.name)}</strong> bấm <strong>Đồng ý kết nối</strong>, thông tin Zalo/SĐT sẽ mở khóa tức thì.</span>
          </div>
          ${
            conn.note
              ? `<div class="p-3.5 rounded-xl bg-surface-container-low text-sm text-on-surface">
                  <div class="text-[11px] font-bold uppercase text-on-surface-variant mb-1">Lời chào bạn đã gửi</div>
                  <p class="italic text-on-surface-variant">"${escapeHTML(conn.note)}"</p>
                </div>`
              : ""
          }
          <div class="flex flex-col gap-2">
            <button type="button" id="rm-demo-accept-btn" class="w-full py-3 px-4 rounded-xl bg-tertiary hover:bg-on-tertiary-fixed-variant text-on-tertiary font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
              <span class="material-symbols-outlined text-[18px]">verified</span>
              <span>Mô phỏng đối phương đồng ý (Mở Zalo/SĐT)</span>
            </button>
            <div class="flex gap-2">
              <button type="button" id="rm-pending-drawer-btn" class="flex-1 py-2.5 px-3 rounded-xl bg-surface-container-high text-on-surface font-semibold text-xs hover:bg-surface-container">
                Quản lý Slot (${activeCount}/${MAX_CONTACT_SLOTS})
              </button>
              <button type="button" id="rm-pending-cancel-btn" class="flex-1 py-2.5 px-3 rounded-xl bg-error-container/50 text-on-error-container font-semibold text-xs hover:bg-error-container">
                Hủy lời mời (Mở slot)
              </button>
            </div>
          </div>
        </div>
      `
    });

    modal.querySelector("#rm-demo-accept-btn").addEventListener("click", () => {
      const accepted = updateConnectionStatus(conn.id, "accepted");
      closeModal();
      onUpdate?.();
      showToast(`${conn.name} đã đồng ý kết nối! Zalo & SĐT đã được mở khóa.`);
      openContactUnlockedModal(accepted, onUpdate);
    });
    modal.querySelector("#rm-pending-drawer-btn").addEventListener("click", () => {
      closeModal();
      openConnectionsDrawer();
    });
    modal.querySelector("#rm-pending-cancel-btn").addEventListener("click", () => {
      updateConnectionStatus(conn.id, "released", { releaseReason: "Chủ động rút lời mời" });
      closeModal();
      onUpdate?.();
      showToast(`Đã hủy lời mời với ${conn.name} và giải phóng 1 slot.`, "info");
    });
  }

  function openConnectInviteModal(opts = {}) {
    const partnerId = opts.partnerId || "";
    const partnerName = opts.name || "Hoàng Nam";
    const partnerMeta = opts.meta || "Sinh viên HCMUS • Hợp gu >85%";
    const existing = getConnectionForPartner(partnerId, partnerName);

    if (existing && (existing.status === "accepted" || existing.status === "matched")) {
      openContactUnlockedModal(existing, opts.onUpdate);
      return;
    }
    if (existing && existing.status === "pending") {
      openPendingInviteModal(existing, opts.onUpdate);
      return;
    }

    const activeCount = getActiveSlotConnections().length;
    if (activeCount >= MAX_CONTACT_SLOTS) {
      openSlotFullModal();
      return;
    }

    const defaultNote =
      opts.presetNote ||
      `Chào ${partnerName}, mình thấy tụi mình rất khớp lối sống và ngân sách. Mình muốn gửi lời mời kết nối 2 chiều để trao đổi qua Zalo nhé!`;

    const modal = openModal({
      title: `Gửi lời mời kết nối với ${partnerName}`,
      subtitle: `${partnerMeta} • Cơ chế Double Opt-in`,
      maxWidth: "max-w-md",
      bodyHtml: `
        <form id="rm-connect-invite-form" class="flex flex-col gap-4">
          ${buildSlotBarHtml(activeCount)}
          <div class="px-3.5 py-2.5 rounded-xl bg-secondary-container/40 text-on-secondary-fixed-variant text-xs flex items-start gap-2">
            <span class="material-symbols-outlined text-[16px] shrink-0 mt-0.5">shield</span>
            <span>Không chat rác in-app: SĐT &amp; Zalo chỉ hiển thị khi <strong>${escapeHTML(partnerName)}</strong> bấm <strong>Đồng ý kết nối</strong>.</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <button type="button" class="rm-greet-chip px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-primary-fixed text-xs text-on-surface font-medium transition-colors">Hẹn xem phòng ban ngày cuối tuần</button>
            <button type="button" class="rm-greet-chip px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-primary-fixed text-xs text-on-surface font-medium transition-colors">Tụi mình hợp giờ giấc, kết nối Zalo nha</button>
          </div>
          <div>
            <label for="rm-connect-note" class="block text-xs font-semibold text-on-surface-variant mb-1">Lời chào kèm lời mời kết nối:</label>
            <textarea id="rm-connect-note" rows="3" required class="w-full p-3 rounded-xl bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">${escapeHTML(defaultNote)}</textarea>
          </div>
          <button type="submit" class="w-full py-3 px-4 rounded-xl bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm">
            <span class="material-symbols-outlined text-[18px]">handshake</span>
            <span>Gửi lời mời kết nối 2 chiều (Dùng 1 slot)</span>
          </button>
        </form>
      `
    });

    const noteInput = modal.querySelector("#rm-connect-note");
    modal.querySelectorAll(".rm-greet-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        noteInput.value = `Chào ${partnerName}, ${chip.textContent.trim().toLowerCase()} nhé!`;
        noteInput.focus();
      });
    });

    modal.querySelector("#rm-connect-invite-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const note = noteInput.value.trim();
      const saved = upsertConnectionRecord(opts, "pending", { note });
      closeModal();
      opts.onUpdate?.();
      showToast(`Đã gửi lời mời kết nối tới ${partnerName} (Đang giữ ${getActiveSlotConnections().length}/${MAX_CONTACT_SLOTS} slot).`);
      openPendingInviteModal(saved, opts.onUpdate);
    });
  }

  /** Support modal synced to canonical CONTACT_INFO (+84 777 639 593 / roomie2026@gmail.com). */
  function openSupportContactModal(
    title = "Ban Hỗ trợ Sinh viên Roomie",
    subtitle = "Sinh viên khóa trên HCMUS • Hỗ trợ qua Zalo & Hotline",
    presetTopic = ""
  ) {
    const modal = openModal({
      title,
      subtitle,
      maxWidth: "max-w-md",
      bodyHtml: `
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a href="https://zalo.me/${escapeHTML(CONTACT.zalo)}" target="_blank" rel="noopener" class="p-3.5 rounded-xl bg-primary text-on-primary flex items-center justify-between gap-2 hover:bg-on-primary-fixed-variant transition-colors">
              <div>
                <div class="text-[11px] opacity-85">Zalo Hỗ trợ chính thức</div>
                <div class="font-bold text-sm">Roomie Support</div>
              </div>
              <span class="material-symbols-outlined text-[20px]">open_in_new</span>
            </a>
            <a href="tel:${escapeHTML(CONTACT.tel)}" class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface flex items-center justify-between gap-2 hover:bg-surface-container transition-colors">
              <div>
                <div class="text-[11px] text-on-surface-variant">Hotline sinh viên</div>
                <div class="font-bold text-sm">${escapeHTML(CONTACT.phone)}</div>
              </div>
              <span class="material-symbols-outlined text-[20px] text-tertiary">call</span>
            </a>
          </div>
          <a href="mailto:${escapeHTML(CONTACT.email)}" class="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/25 text-xs text-on-surface-variant flex items-center justify-between hover:text-primary transition-colors">
            <span>Email: <strong class="text-on-surface">${escapeHTML(CONTACT.email)}</strong></span>
            <span>${escapeHTML(CONTACT.address)}</span>
          </a>
          <form id="rm-support-callback-form" class="flex flex-col gap-3 p-4 rounded-2xl bg-surface-container-low">
            <label for="rm-support-phone" class="text-xs font-semibold text-on-surface">Hoặc để lại SĐT / Zalo để Ban Hỗ trợ gọi lại trong 15 phút:</label>
            <input id="rm-support-phone" type="tel" required placeholder="Nhập SĐT / Zalo thử nghiệm (vd: 09xx...)" class="h-10 px-3.5 rounded-xl bg-surface-container-lowest text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary" />
            <input id="rm-support-topic" type="text" value="${escapeHTML(presetTopic)}" placeholder="Nội dung cần tư vấn..." class="h-10 px-3.5 rounded-xl bg-surface-container-lowest text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary" />
            <button type="submit" class="py-2.5 px-4 rounded-xl bg-tertiary hover:bg-on-tertiary-fixed-variant text-on-tertiary font-semibold text-sm transition-colors">
              Gửi yêu cầu kết nối Zalo Hỗ trợ
            </button>
          </form>
        </div>
      `
    });
    modal.querySelector("#rm-support-callback-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const phoneVal = modal.querySelector("#rm-support-phone")?.value.trim() || "";
      const topicVal = modal.querySelector("#rm-support-topic")?.value.trim() || title;
      const user = getCurrentUser();
      submitContactTicket({
        name: user?.name || "Sinh viên Roomie",
        email: user?.email || "",
        phone: phoneVal,
        topic: topicVal,
        message: "Yêu cầu gọi lại hỗ trợ qua Zalo trong 15 phút"
      });
      closeModal();
      showToast("Đã gửi yêu cầu! Ban Hỗ trợ Roomie sẽ liên hệ Zalo với bạn trong 15 phút.");
    });
  }

  function handleConnectionsDrawerKeydown(event) {
    if (event.key === "Escape") closeConnectionsDrawer();
  }

  function closeConnectionsDrawer() {
    const overlay = document.getElementById("rm-connections-overlay");
    if (!overlay || overlay.dataset.closing) return;
    overlay.dataset.closing = "true";
    overlay.classList.add("opacity-0");
    overlay.querySelector("#rm-connections-drawer")?.classList.add("translate-x-full");
    document.body.classList.remove("overflow-hidden");
    document.removeEventListener("keydown", handleConnectionsDrawerKeydown);
    setTimeout(() => overlay.remove(), 300);
  }

  function openConnectionsDrawer(onExternalChange) {
    if (document.getElementById("rm-connections-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "rm-connections-overlay";
    overlay.className = "fixed inset-0 z-[90] bg-inverse-surface/40 opacity-0 transition-opacity duration-300";
    overlay.innerHTML = `
      <aside id="rm-connections-drawer" role="dialog" aria-modal="true" aria-labelledby="rm-connections-title" class="absolute inset-y-0 right-0 flex w-full max-w-md translate-x-full flex-col border-l border-surface-container bg-surface-container-lowest shadow-2xl transition-transform duration-300 ease-out">
        <div class="flex items-center justify-between border-b border-surface-container px-5 py-4">
          <div>
            <h2 id="rm-connections-title" class="font-title-md text-title-md font-bold text-on-surface">Kết nối 2 chiều &amp; Slot</h2>
            <p class="mt-0.5 text-xs text-on-surface-variant">Double Opt-in mở Zalo / SĐT • Không chat nội bộ</p>
          </div>
          <button type="button" id="rm-connections-close" aria-label="Đóng quản lý kết nối" class="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div id="rm-connections-body" class="flex-1 overflow-y-auto p-4 flex flex-col gap-4"></div>
      </aside>
    `;

    const drawer = overlay.querySelector("#rm-connections-drawer");
    const bodyEl = overlay.querySelector("#rm-connections-body");

    const renderBody = () => {
      const all = getConnections();
      const activeSlots = getActiveSlotConnections(all);
      const incoming = all.filter((c) => c.status === "incoming");
      const accepted = all.filter((c) => c.status === "accepted");
      const pending = all.filter((c) => c.status === "pending");
      const matched = all.filter((c) => c.status === "matched");
      const released = all.filter((c) => c.status === "released");
      const reasonOpts = RELEASE_REASONS.map((r) => `<option value="${escapeHTML(r)}">${escapeHTML(r)}</option>`).join("");

      const incomingHtml = incoming.length
        ? `
          <div class="flex flex-col gap-2.5">
            <div class="text-xs font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-tertiary"></span>
              Lời mời kết nối đến bạn (${incoming.length})
            </div>
            ${incoming
              .map(
                (c) => `
              <div class="p-3.5 rounded-2xl bg-secondary-container/25 border border-tertiary/20 flex flex-col gap-2.5">
                <div class="flex items-center gap-3">
                  <img src="${escapeHTML(c.avatar)}" alt="Ảnh đại diện ${escapeHTML(c.name)}" class="w-11 h-11 rounded-full object-cover shrink-0" />
                  <div class="min-w-0 flex-1">
                    <div class="font-bold text-sm text-on-surface truncate">${escapeHTML(c.name)}</div>
                    <div class="text-xs text-on-surface-variant truncate">${escapeHTML(c.meta)}</div>
                  </div>
                </div>
                ${c.note ? `<p class="text-xs text-on-surface-variant italic bg-surface-container-lowest/80 p-2.5 rounded-xl">"${escapeHTML(c.note)}"</p>` : ""}
                <div class="flex gap-2">
                  <button type="button" data-accept-id="${c.id}" class="flex-1 py-2 px-3 rounded-xl bg-primary hover:bg-on-primary-fixed-variant text-on-primary text-xs font-semibold flex items-center justify-center gap-1">
                    <span class="material-symbols-outlined text-[15px]">handshake</span>
                    <span>Đồng ý &amp; Mở Zalo</span>
                  </button>
                  <button type="button" data-decline-id="${c.id}" class="py-2 px-3 rounded-xl bg-surface-container-high text-on-surface-variant text-xs font-medium hover:bg-error-container hover:text-on-error-container">
                    Từ chối
                  </button>
                </div>
              </div>`
              )
              .join("")}
          </div>`
        : "";

      const acceptedHtml = accepted
        .map(
          (c) => `
          <div class="p-3.5 rounded-2xl bg-surface-container-lowest border border-tertiary/30 shadow-xs flex flex-col gap-2.5">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <img src="${escapeHTML(c.avatar)}" alt="Ảnh đại diện ${escapeHTML(c.name)}" class="w-10 h-10 rounded-full object-cover shrink-0" />
                <div class="min-w-0">
                  <div class="font-bold text-sm text-on-surface truncate">${escapeHTML(c.name)}</div>
                  <div class="text-[11.5px] text-on-surface-variant truncate">${escapeHTML(c.meta)}</div>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[11px] font-bold shrink-0">Đã mở Zalo</span>
            </div>
            <div class="flex gap-2">
              <a href="https://zalo.me/${escapeHTML(c.zalo)}" target="_blank" rel="noopener" class="flex-1 py-2 px-3 rounded-xl bg-primary text-on-primary text-xs font-semibold text-center hover:bg-on-primary-fixed-variant">
                Mở Zalo (${escapeHTML(c.phone)})
              </a>
              <button type="button" data-drawer-copy="${escapeHTML(c.phone)}" class="py-2 px-3 rounded-xl bg-surface-container-low text-primary text-xs font-semibold hover:bg-primary-fixed">
                Copy SĐT
              </button>
            </div>
            <div class="pt-2 border-t border-surface-container flex flex-col gap-2">
              <div class="flex items-center gap-1.5">
                <select data-reason-for="${c.id}" class="flex-1 h-8 px-2 rounded-lg bg-surface-container-low text-[11.5px] text-on-surface border border-outline-variant/25">
                  ${reasonOpts}
                </select>
                <button type="button" data-release-id="${c.id}" class="px-2.5 h-8 rounded-lg bg-surface-container-high hover:bg-error-container hover:text-on-error-container text-[11.5px] font-semibold text-on-surface shrink-0">
                  Giải phóng slot
                </button>
              </div>
              <button type="button" data-match-id="${c.id}" class="w-full py-2 rounded-xl bg-tertiary hover:bg-on-tertiary-fixed-variant text-on-tertiary text-xs font-semibold flex items-center justify-center gap-1">
                <span class="material-symbols-outlined text-[15px]">done_all</span>
                <span>Đã chốt Roommate &amp; Tải hợp đồng</span>
              </button>
            </div>
          </div>`
        )
        .join("");

      const pendingHtml = pending
        .map(
          (c) => `
          <div class="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col gap-2.5">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <img src="${escapeHTML(c.avatar)}" alt="Ảnh đại diện ${escapeHTML(c.name)}" class="w-10 h-10 rounded-full object-cover shrink-0" />
                <div class="min-w-0">
                  <div class="font-bold text-sm text-on-surface truncate">${escapeHTML(c.name)}</div>
                  <div class="text-[11.5px] text-on-surface-variant truncate">${escapeHTML(c.meta)}</div>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-[11px] font-semibold shrink-0">Chờ đồng ý</span>
            </div>
            <div class="flex gap-2">
              <button type="button" data-demo-accept-id="${c.id}" class="flex-1 py-2 px-2.5 rounded-xl bg-secondary-container text-on-secondary-fixed text-xs font-semibold hover:bg-tertiary hover:text-on-tertiary transition-colors">
                Giả lập đồng ý (Demo)
              </button>
              <button type="button" data-release-id="${c.id}" class="py-2 px-3 rounded-xl bg-surface-container-high text-on-surface-variant text-xs font-medium hover:bg-error-container hover:text-on-error-container">
                Hủy slot
              </button>
            </div>
          </div>`
        )
        .join("");

      const matchedHtml = matched.length
        ? `
          <div class="flex flex-col gap-2.5">
            <div class="text-xs font-bold uppercase tracking-wider text-primary">Đã chốt ở ghép (${matched.length})</div>
            ${matched
              .map(
                (c) => `
              <div class="p-3.5 rounded-2xl bg-primary-fixed/25 border border-primary/20 flex flex-col gap-2">
                <div class="flex items-center justify-between gap-2">
                  <div class="font-bold text-sm text-on-surface">${escapeHTML(c.name)}</div>
                  <span class="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[11px] font-bold">Đã chốt</span>
                </div>
                <div class="text-xs text-on-surface-variant">Zalo / SĐT: <strong class="text-on-surface">${escapeHTML(c.phone)}</strong></div>
                <div class="flex gap-2">
                  <button type="button" data-open-contract="1" class="flex-1 py-1.5 px-3 rounded-lg bg-surface-container-lowest text-primary text-xs font-semibold border border-primary/20">Hợp đồng mẫu</button>
                  ${
                    !c.revertedOnce
                      ? `<button type="button" data-revert-match="${c.id}" class="py-1.5 px-3 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-medium hover:bg-error-container">Hủy kèo 48h</button>`
                      : ""
                  }
                </div>
              </div>`
              )
              .join("")}
          </div>`
        : "";

      bodyEl.innerHTML = `
        ${buildSlotBarHtml(activeSlots.length)}
        ${incomingHtml}
        <div class="flex flex-col gap-2.5">
          <div class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Slot đang giữ (${activeSlots.length}/${MAX_CONTACT_SLOTS})</div>
          ${
            acceptedHtml || pendingHtml
              ? acceptedHtml + pendingHtml
              : `<div class="p-6 rounded-2xl bg-surface-container-low text-center text-xs text-on-surface-variant">
                  Chưa có slot nào đang giữ. Chọn ứng viên phù hợp và bấm <strong>Gửi lời mời kết nối 2 chiều</strong>!
                </div>`
          }
        </div>
        ${matchedHtml}
        ${
          released.length
            ? `<div class="text-[11.5px] text-on-surface-variant text-center pt-1">Đã giải phóng ${released.length} liên hệ không phù hợp trước đó.</div>`
            : ""
        }
      `;

      bindDrawerEvents();
    };

    const bindDrawerEvents = () => {
      bodyEl.querySelectorAll("[data-accept-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (getActiveSlotConnections().length >= MAX_CONTACT_SLOTS) {
            showToast(`Đã đầy ${MAX_CONTACT_SLOTS}/${MAX_CONTACT_SLOTS} slot! Hãy giải phóng 1 slot trước.`, "error");
            return;
          }
          const updated = updateConnectionStatus(btn.dataset.acceptId, "accepted");
          renderBody();
          onExternalChange?.();
          showToast(`Đã đồng ý kết nối! Mở khóa Zalo & SĐT của ${updated?.name || "bạn mới"}.`);
        });
      });

      bodyEl.querySelectorAll("[data-decline-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          updateConnectionStatus(btn.dataset.declineId, "released", { releaseReason: "Từ chối lời mời đến" });
          renderBody();
          onExternalChange?.();
          showToast("Đã từ chối lời mời kết nối.", "info");
        });
      });

      bodyEl.querySelectorAll("[data-demo-accept-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const updated = updateConnectionStatus(btn.dataset.demoAcceptId, "accepted");
          renderBody();
          onExternalChange?.();
          showToast(`${updated?.name || "Đối phương"} đã đồng ý! Zalo & SĐT đã được mở khóa.`);
        });
      });

      bodyEl.querySelectorAll("[data-release-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.releaseId;
          const select = bodyEl.querySelector(`[data-reason-for="${id}"]`);
          const reason = select ? select.value : "Chủ động giải phóng slot";
          updateConnectionStatus(id, "released", { releaseReason: reason });
          renderBody();
          onExternalChange?.();
          showToast(`Đã giải phóng 1 slot (${reason})!`, "info");
        });
      });

      bodyEl.querySelectorAll("[data-match-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const updated = updateConnectionStatus(btn.dataset.matchId, "matched");
          closeConnectionsDrawer();
          onExternalChange?.();
          showToast(`Đã chốt Roommate với ${updated?.name || ""}! Slot đã hoàn tất.`);
          openContractModal();
        });
      });

      bodyEl.querySelectorAll("[data-drawer-copy]").forEach((btn) => {
        btn.addEventListener("click", () => copyContactText(btn.dataset.drawerCopy));
      });

      bodyEl.querySelectorAll("[data-open-contract]").forEach((btn) => {
        btn.addEventListener("click", () => {
          closeConnectionsDrawer();
          openContractModal();
        });
      });

      bodyEl.querySelectorAll("[data-revert-match]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (getActiveSlotConnections().length >= MAX_CONTACT_SLOTS) {
            showToast("Cần trống ít nhất 1 slot để hoàn tác bảo hành 48h.", "error");
            return;
          }
          updateConnectionStatus(btn.dataset.revertMatch, "accepted", { revertedOnce: true });
          renderBody();
          onExternalChange?.();
          showToast("Đã kích hoạt bảo hành hủy kèo 48h (tối đa 1 lần) và mở lại slot.", "info");
        });
      });
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeConnectionsDrawer();
    });
    overlay.querySelector("#rm-connections-close").addEventListener("click", closeConnectionsDrawer);

    renderBody();
    document.body.appendChild(overlay);
    document.body.classList.add("overflow-hidden");
    document.addEventListener("keydown", handleConnectionsDrawerKeydown);
    requestAnimationFrame(() => {
      overlay.classList.remove("opacity-0");
      drawer.classList.remove("translate-x-full");
    });
    overlay.querySelector("#rm-connections-close").focus();
  }

  function openProfileModal(rm, onUpdate, options = {}) {
    if (!rm) return;
    const renderProfile = () => {
      const conn = getConnectionForPartner(rm.id, rm.name);
      const status = conn?.status || "none";
      const activeCount = getActiveSlotConnections().length;
      const isAcceptedOrMatched = status === "accepted" || status === "matched";

      let statusBannerHtml = "";
      if (isAcceptedOrMatched) {
        statusBannerHtml = buildUnlockedContactCardHtml(conn);
      } else if (status === "pending") {
        statusBannerHtml = `
          <div class="p-3.5 rounded-xl bg-primary-fixed/40 text-on-primary-fixed-variant text-xs flex items-center justify-between gap-2">
            <span><strong>Đang chờ đồng ý kết nối</strong> • Chiếm 1/${MAX_CONTACT_SLOTS} slot liên hệ song song.</span>
            <button type="button" id="rm-profile-demo-accept" class="px-2.5 py-1 rounded-lg bg-tertiary text-on-tertiary font-semibold shrink-0">Demo đồng ý</button>
          </div>
        `;
      } else if (status === "incoming") {
        statusBannerHtml = `
          <div class="p-3.5 rounded-xl bg-secondary-container/45 text-on-secondary-fixed-variant text-xs flex items-center justify-between gap-2">
            <span><strong>${escapeHTML(rm.shortName || rm.name)}</strong> đã gửi lời mời kết nối tới bạn!</span>
            <button type="button" id="rm-profile-accept-in" class="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-semibold shrink-0">Đồng ý ngay</button>
          </div>
        `;
      } else {
        statusBannerHtml = `
          <div class="px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface-variant text-xs flex items-center gap-2">
            <span class="material-symbols-outlined text-[16px] text-primary">lock</span>
            <span>SĐT &amp; Zalo được bảo mật theo cơ chế <strong>Double Opt-in</strong> (${activeCount}/${MAX_CONTACT_SLOTS} slot đang dùng).</span>
          </div>
        `;
      }
      const matchScoreHtml =
        options.showMatchScore === false
          ? ""
          : `
            <div class="text-center px-3.5 py-2 rounded-2xl bg-secondary-container text-on-secondary-container w-full">
              <div class="text-2xl font-bold leading-none">${escapeHTML(rm.matchScore)}%</div>
              <div class="text-[11px] font-semibold mt-1">Hợp gu</div>
            </div>
          `;

      const modal = openModal({
        title: `Hồ sơ sinh viên • ${rm.name}`,
        subtitle: `${rm.school} · ${rm.major}`,
        maxWidth: "max-w-xl",
        bodyHtml: `
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low">
              <div class="flex items-center gap-3.5">
                <img src="${escapeHTML(rm.avatar)}" alt="Ảnh đại diện ${escapeHTML(rm.name)}" class="w-16 h-16 rounded-2xl object-cover ring-2 ring-secondary-container" />
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="font-title-md text-title-md font-bold text-on-surface">${escapeHTML(rm.name)}, ${escapeHTML(rm.age)}t</h4>
                    <span class="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-semibold">Đã xác thực SV</span>
                  </div>
                  <p class="text-xs text-on-surface-variant mt-0.5">${escapeHTML(rm.school)}</p>
                  <p class="text-xs font-semibold text-primary mt-0.5">Ngân sách: ${escapeHTML(rm.budget)}</p>
                </div>
              </div>
              <div class="flex flex-col items-end gap-1.5 shrink-0">
                ${matchScoreHtml}
                <span class="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold w-full ${
                  rm.gender === "Nam"
                    ? "bg-sky-100 text-sky-700 border border-sky-200"
                    : "bg-pink-100 text-pink-700 border border-pink-200"
                }">
                  <span class="material-symbols-outlined text-[13px]">${rm.gender === "Nam" ? "male" : "female"}</span>
                  ${escapeHTML(rm.gender || "Sinh viên")}
                </span>
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-primary-fixed/30 text-sm text-on-primary-fixed-variant flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">apartment</span>
              <span><strong>${escapeHTML(rm.roomStatusTitle)}</strong> ${escapeHTML(rm.roomStatusDetail)}</span>
            </div>

            <div>
              <h5 class="text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-2">Thói quen &amp; Tiêu chuẩn sống</h5>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${(rm.criteria || [])
                  .map(
                    (c) => `<div class="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low text-sm text-on-surface">
                      <span class="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                      <span>${escapeHTML(c)}</span>
                    </div>`
                  )
                  .join("")}
              </div>
            </div>

            <blockquote class="p-3.5 rounded-xl bg-surface-container-low italic text-sm text-on-surface-variant border-l-4 border-primary">
              ${escapeHTML(rm.quote || "")}
            </blockquote>

            ${statusBannerHtml}

            <div class="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button type="button" id="rm-modal-connect-btn" class="flex-1 py-3 px-4 rounded-xl ${
                isAcceptedOrMatched
                  ? "bg-tertiary hover:bg-on-tertiary-fixed-variant text-on-tertiary"
                  : status === "pending"
                  ? "bg-primary-fixed text-on-primary-fixed-variant hover:bg-primary-fixed-dim"
                  : "bg-primary hover:bg-on-primary-fixed-variant text-on-primary"
              } font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
                <span class="material-symbols-outlined text-[18px]">${isAcceptedOrMatched ? "verified" : status === "pending" ? "hourglass_top" : "handshake"}</span>
                <span>${
                  isAcceptedOrMatched
                    ? "Cập nhật kết quả / Chốt Roommate"
                    : status === "pending"
                    ? "Đang chờ đồng ý (Quản lý Slot)"
                    : "Gửi lời mời kết nối 2 chiều"
                }</span>
              </button>
              ${
                rm.linkedRoomId
                  ? `<a href="/roomie/phong-chi-tiet?id=${escapeHTML(rm.linkedRoomId)}" class="py-3 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-semibold text-sm flex items-center justify-center gap-1 transition-colors">
                      <span>Xem phòng</span>
                      <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </a>`
                  : ""
              }
            </div>
          </div>
        `
      });

      modal.querySelectorAll("[data-copy-phone]").forEach((btn) => {
        btn.addEventListener("click", () => copyContactText(btn.dataset.copyPhone));
      });
      modal.querySelector("#rm-profile-demo-accept")?.addEventListener("click", () => {
        updateConnectionStatus(conn.id, "accepted");
        closeModal();
        onUpdate?.();
        showToast(`${rm.name} đã đồng ý! Zalo & SĐT đã được mở khóa.`);
        renderProfile();
      });
      modal.querySelector("#rm-profile-accept-in")?.addEventListener("click", () => {
        if (getActiveSlotConnections().length >= MAX_CONTACT_SLOTS) {
          closeModal();
          openSlotFullModal();
          return;
        }
        updateConnectionStatus(conn.id, "accepted");
        closeModal();
        onUpdate?.();
        showToast(`Đã đồng ý kết nối với ${rm.name}!`);
        renderProfile();
      });
      modal.querySelector("#rm-modal-connect-btn").addEventListener("click", () => {
        openConnectInviteModal({
          partnerId: rm.id,
          name: rm.name,
          meta: `${rm.school} • ${rm.matchScore}% Hợp gu`,
          avatar: rm.avatar,
          roomId: rm.linkedRoomId,
          contact: rm.contact,
          onUpdate
        });
      });
    };

    renderProfile();
  }

  function openPaymentModal(pkg) {
    const modal = openModal({
      title: `Kích hoạt ${pkg.name}`,
      subtitle: `${pkg.price} ${pkg.period} • Thanh toán nhanh qua VietQR / Ví điện tử`,
      maxWidth: "max-w-md",
      bodyHtml: `
        <div class="flex flex-col gap-4">
          <div class="p-4 rounded-2xl bg-surface-container-low flex items-center justify-between">
            <div>
              <div class="font-bold text-on-surface">${escapeHTML(pkg.name)}</div>
              <div class="text-xs text-on-surface-variant mt-0.5">${escapeHTML(pkg.desc)}</div>
            </div>
            <div class="text-right shrink-0 ml-3">
              <div class="text-xl font-bold text-primary">${escapeHTML(pkg.price)}</div>
              <div class="text-[11px] text-on-surface-variant">${escapeHTML(pkg.period)}</div>
            </div>
          </div>

          <div class="flex flex-col items-center p-5 rounded-2xl bg-surface border border-surface-container text-center">
            <div class="w-36 h-36 rounded-2xl bg-white p-3 shadow-sm border border-surface-container flex flex-col items-center justify-center mb-3">
              <span class="material-symbols-outlined text-primary text-[72px]">qr_code_2</span>
              <span class="text-[10px] font-semibold text-tertiary mt-1">VietQR · MoMo · ZaloPay</span>
            </div>
            <p class="text-xs text-on-surface-variant">Nội dung chuyển khoản: <strong class="text-on-surface">RM-${escapeHTML(pkg.id.toUpperCase())}</strong></p>
          </div>

          <div class="flex gap-2.5">
            <button type="button" id="rm-confirm-pay" class="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm transition-colors">
              Xác nhận đã thanh toán
            </button>
            <button type="button" id="rm-cancel-pay" class="px-4 py-3 rounded-xl bg-surface-container text-on-surface text-sm font-medium hover:bg-surface-container-high">
              Đóng
            </button>
          </div>
        </div>
      `
    });

    modal.querySelector("#rm-cancel-pay").addEventListener("click", closeModal);
    modal.querySelector("#rm-confirm-pay").addEventListener("click", () => {
      activatePurchasedPlan(pkg);
      closeModal();
      showToast(`Đã kích hoạt gói ${pkg.name} thành công! Dự đoán gợi ý bạn cùng phòng đã được mở khóa.`);
    });
  }

  function openContractModal() {
    const contentText = `BIÊN BẢN THỎA THUẬN Ở GHÉP & CHIA CHI PHÍ PHÒNG TRỌ (MẪU CHUẨN ROOMIE)
---------------------------------------------------------------------------
1. THÔNG TIN CÁC BÊN Ở GHÉP:
   - Bên A (Chủ phòng / Người đứng tên): ................................... MSSV/CCCD: ...................
   - Bên B (Bạn cùng phòng): ............................................... MSSV/CCCD: ...................
   - Địa chỉ phòng trọ: ....................................................................................

2. MINH BẠCH CHI PHÍ HÀNG THÁNG:
   - Tiền thuê phòng: .................... đ/tháng (Chia đều ........ đ/người vào ngày 01-05 hàng tháng)
   - Tiền cọc: ........................... đ/người (Hoàn trả khi báo trước tối thiểu 30 ngày)
   - Tiền điện: ......... đ/kWh (Chốt chỉ số công tơ ngày ...... hàng tháng)
   - Tiền nước & Wifi & Rác & Gửi xe: ......................................................................

3. NỘI QUY SINH HOẠT CHUNG (CAM KẾT KHÔNG XUNG ĐỘT):
   - Giờ yên tĩnh học tập & nghỉ ngơi: Từ 23h00 đến 06h30 (Đeo tai nghe khi học/giải trí khuya).
   - Vệ sinh không gian chung: Rửa chén ngay sau ăn; lịch dọn phòng định kỳ vào sáng Chủ nhật.
   - Khách đến chơi: Thông báo trước ít nhất 6 tiếng; không tự ý cho người lạ ngủ qua đêm.
   - Đồ dùng cá nhân & chung: Đồ dùng chung ghi nhận rõ, đồ cá nhân hỏi trước khi mượn.
   - Xử lý hủy kèo / dọn ra sớm: Báo trước 30 ngày hoặc tìm người thay thế tương xứng để nhận lại cọc.

Chữ ký Bên A                                                    Chữ ký Bên B`;

    const modal = openModal({
      title: "Mẫu Thỏa thuận Ở ghép & Chia chi phí",
      subtitle: "Chuẩn cộng đồng Roomie — Bảo vệ quyền lợi & tiền cọc",
      maxWidth: "max-w-2xl",
      bodyHtml: `
        <div class="flex flex-col gap-4">
          <pre class="whitespace-pre-wrap font-mono text-xs bg-surface-container-low p-4 rounded-2xl text-on-surface leading-relaxed border border-surface-container">${escapeHTML(contentText)}</pre>
          <div class="flex flex-wrap gap-2.5 justify-end">
            <button type="button" id="rm-copy-contract" class="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface text-sm font-semibold flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px]">content_copy</span>
              <span>Sao chép nội dung</span>
            </button>
            <button type="button" id="rm-download-contract" class="px-4 py-2.5 rounded-xl bg-tertiary hover:bg-tertiary-container text-on-tertiary text-sm font-semibold flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px]">download</span>
              <span>Tải xuống (.txt)</span>
            </button>
          </div>
        </div>
      `
    });

    modal.querySelector("#rm-copy-contract").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(contentText);
        showToast("Đã sao chép mẫu thỏa thuận vào clipboard!");
      } catch {
        showToast("Hãy chọn đoạn văn bản và nhấn Ctrl+C để sao chép.", "info");
      }
    });

    modal.querySelector("#rm-download-contract").addEventListener("click", () => {
      const blob = new Blob([contentText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Roomie-Mau-Thoa-Thuan-O-Ghep.txt";
      a.click();
      URL.revokeObjectURL(url);
      showToast("Đã tải xuống mẫu thỏa thuận ở ghép!");
    });
  }

  function openGalleryModal(images, title) {
    let idx = 0;
    const list = images && images.length ? images : [FALLBACK_SVG];
    const safeTitle = title || "Hình ảnh phòng trọ Roomie";
    const modal = openModal({
      title: safeTitle,
      subtitle: `${list.length} hình ảnh thực tế đã xác minh`,
      maxWidth: "max-w-3xl",
      bodyHtml: `
        <div class="flex flex-col gap-3">
          <div class="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-surface-container">
            <img id="rm-gallery-main" src="${escapeHTML(list[0])}" class="w-full h-full object-cover" alt="${escapeHTML(safeTitle)} - ảnh 1" />
            <button type="button" id="rm-gallery-prev" aria-label="Ảnh trước" class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-container-lowest/90 shadow-md flex items-center justify-center hover:bg-white">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <button type="button" id="rm-gallery-next" aria-label="Ảnh tiếp theo" class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-container-lowest/90 shadow-md flex items-center justify-center hover:bg-white">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <div class="grid grid-cols-4 gap-2">
            ${list
              .map(
                (src, i) => `<button type="button" data-idx="${i}" aria-label="Xem ảnh ${i + 1}" class="rm-gallery-thumb aspect-[4/3] rounded-xl overflow-hidden ring-2 ${
                  i === 0 ? "ring-primary" : "ring-transparent opacity-70 hover:opacity-100"
                }"><img src="${escapeHTML(src)}" alt="${escapeHTML(safeTitle)} - ảnh thu nhỏ ${i + 1}" class="w-full h-full object-cover" /></button>`
              )
              .join("")}
          </div>
        </div>
      `
    });

    const mainImg = modal.querySelector("#rm-gallery-main");
    const thumbs = modal.querySelectorAll(".rm-gallery-thumb");
    const updateIdx = (nextIdx) => {
      idx = (nextIdx + list.length) % list.length;
      mainImg.src = list[idx];
      mainImg.alt = `${safeTitle} - ảnh ${idx + 1}`;
      thumbs.forEach((t, i) => {
        t.classList.toggle("ring-primary", i === idx);
        t.classList.toggle("ring-transparent", i !== idx);
        t.classList.toggle("opacity-70", i !== idx);
      });
    };
    modal.querySelector("#rm-gallery-prev").addEventListener("click", () => updateIdx(idx - 1));
    modal.querySelector("#rm-gallery-next").addEventListener("click", () => updateIdx(idx + 1));
    thumbs.forEach((t) => t.addEventListener("click", () => updateIdx(Number(t.dataset.idx))));
  }

  function openReportModal(targetTitle = "Tin đăng phòng trọ") {
    const modal = openModal({
      title: "Báo cáo tin giả / dấu hiệu lừa đảo",
      subtitle: `Đối tượng: ${targetTitle}`,
      maxWidth: "max-w-md",
      bodyHtml: `
        <form id="rm-report-form" class="flex flex-col gap-3.5">
          <div>
            <label class="block text-xs font-semibold text-on-surface mb-1">Lý do báo cáo</label>
            <select class="w-full h-11 px-3 rounded-xl bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Đòi chuyển tiền cọc trước khi xem phòng</option>
              <option>Phòng đã cho thuê nhưng vẫn treo tin (Phòng ma)</option>
              <option>Giá thực tế / phụ phí khác xa tin đăng</option>
              <option>Hình ảnh không đúng thực tế</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-on-surface mb-1">Mô tả thêm</label>
            <textarea rows="3" required placeholder="Mô tả chi tiết để đội ngũ xác minh xử lý trong 30 phút..." class="w-full p-3 rounded-xl bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"></textarea>
          </div>
          <button type="submit" class="w-full py-3 rounded-xl bg-error text-on-error font-semibold text-sm hover:opacity-90">
            Gửi báo cáo ngay
          </button>
        </form>
      `
    });

    modal.querySelector("#rm-report-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const reasonVal = modal.querySelector("select")?.value || "Báo cáo tin giả / phòng ma";
      const descVal = modal.querySelector("textarea")?.value.trim() || "";
      submitSafetyReport({
        targetTitle,
        reason: reasonVal,
        description: descVal
      });
      closeModal();
      showToast("Đã ghi nhận báo cáo! Ban An toàn Roomie sẽ kiểm tra ngay.");
    });
  }

  // =========================================================================
  // AUTHENTICATION SYSTEM (Sign Up, Login, Sign Out)
  // =========================================================================

  const DEFAULT_DEMO_USERS = [
    {
      id: "user-minhthu",
      name: "Minh Thư",
      email: "minhthu@student.hcmus.edu.vn",
      altEmail: "22120***@student.hcmus.edu.vn",
      password: "123",
      shortSchool: "HCMUS",
      school: "ĐH Khoa học Tự nhiên (HCMUS)",
      major: "Khoa CNTT • K22",
      gender: "Nữ",
      idCode: "#SV-8924",
      avatar: "/assets/images/common/avatar-profile.jpg",
      budgetRange: "1.8 - 2.5 tr/tháng",
      preferredAreas: "Làng ĐHQG / Quận 5",
      moveInTime: "Đầu tháng tới",
      verifiedStudent: true
    },
    {
      id: "user-hoangnam",
      name: "Hoàng Nam",
      email: "hoangnam@student.hcmus.edu.vn",
      altEmail: "22120512@student.hcmus.edu.vn",
      password: "123",
      shortSchool: "HCMUS",
      school: "ĐH Khoa học Tự nhiên (HCMUS)",
      major: "Khoa CNTT • K22",
      gender: "Nam",
      idCode: "#SV-5120",
      avatar: "/assets/images/phong-chi-tiet/avatar-1.jpg",
      budgetRange: "2.0 - 2.6 tr/tháng",
      preferredAreas: "Làng ĐHQG Thủ Đức",
      moveInTime: "Sẵn sàng ở ngay",
      verifiedStudent: true
    }
  ];

  const AUTH_SCHOOL_OPTIONS = [
    { code: "HCMUS", name: "ĐH Khoa học Tự nhiên (HCMUS)", area: "Làng ĐHQG / Quận 5" },
    { code: "HCMUT", name: "ĐH Bách khoa - ĐHQG TP.HCM (HCMUT)", area: "Làng ĐHQG / Quận 10" },
    { code: "UIT", name: "ĐH Công nghệ Thông tin (UIT)", area: "Làng ĐHQG Thủ Đức" },
    { code: "USSH", name: "ĐH KHXH & Nhân văn (HCMUSSH)", area: "Làng ĐHQG / Quận 1" },
    { code: "UEL", name: "ĐH Kinh tế - Luật (UEL)", area: "Làng ĐHQG Thủ Đức" },
    { code: "IU", name: "ĐH Quốc tế - ĐHQG TP.HCM (HCMIU)", area: "Làng ĐHQG Thủ Đức" },
    { code: "UEH", name: "ĐH Kinh tế TP.HCM (UEH)", area: "Quận 10 / Quận 3" },
    { code: "HUTECH", name: "ĐH Công nghệ TP.HCM (HUTECH)", area: "Bình Thạnh / Thủ Đức" },
    { code: "FTU2", name: "ĐH Ngoại thương CS2 (FTU2)", area: "Bình Thạnh" },
    { code: "RMIT", name: "ĐH RMIT Việt Nam", area: "Quận 7" },
    { code: "HUST", name: "ĐH Bách khoa Hà Nội (HUST)", area: "Hai Bà Trưng, Hà Nội" },
    { code: "VNU", name: "ĐH Quốc gia Hà Nội (VNU)", area: "Cầu Giấy, Hà Nội" },
    { code: "NEU", name: "ĐH Kinh tế Quốc dân (NEU)", area: "Hai Bà Trưng, Hà Nội" }
  ];

  function getRegisteredUsers() {
    const stored = readJSON(STORAGE_KEYS.AUTH_USERS, null);
    if (!Array.isArray(stored) || stored.length === 0) {
      writeJSON(STORAGE_KEYS.AUTH_USERS, DEFAULT_DEMO_USERS);
      return [...DEFAULT_DEMO_USERS];
    }
    const merged = [...stored];
    DEFAULT_DEMO_USERS.forEach((demo) => {
      if (!merged.some((u) => u && u.email && u.email.toLowerCase() === demo.email.toLowerCase())) {
        merged.push(demo);
      }
    });
    return merged;
  }

  function getAuthSession() {
    const raw = readJSON(STORAGE_KEYS.AUTH_SESSION, null);
    if (!raw || typeof raw !== "object") {
      const defaultUser = DEFAULT_DEMO_USERS[0];
      const initial = { loggedIn: true, user: defaultUser };
      writeJSON(STORAGE_KEYS.AUTH_SESSION, initial);
      return initial;
    }
    return raw;
  }

  function syncGlobalUserProfile(user) {
    if (!window.RoomieData) window.RoomieData = {};
    if (user) {
      window.RoomieData.USER_PROFILE = {
        ...DEFAULT_DEMO_USERS[0],
        ...user
      };
    } else {
      window.RoomieData.USER_PROFILE = null;
    }
  }

  function isLoggedIn() {
    const session = getAuthSession();
    return Boolean(session && session.loggedIn && session.user);
  }

  function getCurrentUser() {
    const session = getAuthSession();
    const user = session && session.loggedIn ? session.user : null;
    ensureQuizDataBelongsToCurrentUser();
    syncGlobalUserProfile(user);
    return user;
  }

  function emitAuthChange(user) {
    syncGlobalUserProfile(user);
    window.dispatchEvent(
      new CustomEvent("roomie:auth-changed", {
        detail: { loggedIn: Boolean(user), user }
      })
    );
  }

  function setLoggedInUser(user, token = "") {
    const cleanUser = { ...user };
    delete cleanUser.password;
    const prevSession = readJSON(STORAGE_KEYS.AUTH_SESSION, {});
    writeJSON(STORAGE_KEYS.AUTH_SESSION, {
      loggedIn: true,
      user: cleanUser,
      token: token || prevSession?.token || "",
      updatedAt: Date.now()
    });
    ensureQuizDataBelongsToCurrentUser();
    emitAuthChange(cleanUser);
    return cleanUser;
  }

  function logoutUser() {
    writeJSON(STORAGE_KEYS.AUTH_SESSION, {
      loggedIn: false,
      user: null,
      token: "",
      updatedAt: Date.now()
    });
    ensureQuizDataBelongsToCurrentUser();
    emitAuthChange(null);
    apiFetch("/api/auth/logout", { method: "POST" });
  }

  function loginUser(identifier, password) {
    const cleanId = String(identifier || "").trim().toLowerCase();
    const cleanPass = String(password || "").trim();
    if (!cleanId) {
      return { ok: false, error: "Vui lòng nhập email sinh viên hoặc tên đăng nhập." };
    }
    const users = getRegisteredUsers();
    const matched = users.find(
      (u) =>
        u.email?.toLowerCase() === cleanId ||
        u.altEmail?.toLowerCase() === cleanId ||
        u.id?.toLowerCase() === cleanId ||
        u.name?.toLowerCase() === cleanId
    );
    if (!matched) {
      return {
        ok: false,
        error: "Không tìm thấy tài khoản với email này. Bạn có thể chuyển qua tab Đăng ký để tạo mới!"
      };
    }
    if (matched.password && cleanPass && matched.password !== cleanPass && cleanPass !== "123456") {
      return { ok: false, error: "Mật khẩu chưa chính xác. Vui lòng kiểm tra lại." };
    }
    const activeUser = setLoggedInUser(matched);
    apiFetch("/api/auth/login", {
      method: "POST",
      body: { identifier: cleanId, password: cleanPass || "123" }
    }).then((res) => {
      if (res && res.ok && res.user) {
        setLoggedInUser(res.user, res.token);
        syncWithBackend();
      }
    });
    return { ok: true, user: activeUser };
  }

  function registerUser(payload = {}) {
    const name = String(payload.name || "").trim();
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "");
    const confirmPassword = String(payload.confirmPassword || "");
    const schoolCode = String(payload.schoolCode || "HCMUS").trim();
    const major = String(payload.major || "Sinh viên • K23").trim() || "Sinh viên • K23";
    const gender = payload.gender === "Nam" ? "Nam" : "Nữ";

    if (name.length < 2) {
      return { ok: false, error: "Vui lòng nhập họ và tên hợp lệ (tối thiểu 2 ký tự)." };
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "Vui lòng nhập địa chỉ email hợp lệ." };
    }
    if (password.length < 6) {
      return { ok: false, error: "Mật khẩu cần có tối thiểu 6 ký tự." };
    }
    if (confirmPassword && password !== confirmPassword) {
      return { ok: false, error: "Mật khẩu xác nhận không khớp." };
    }

    const users = getRegisteredUsers();
    if (users.some((u) => u.email?.toLowerCase() === email)) {
      return { ok: false, error: "Email này đã được đăng ký. Vui lòng chuyển sang Đăng nhập." };
    }

    const schoolObj =
      AUTH_SCHOOL_OPTIONS.find((s) => s.code === schoolCode) || {
        code: schoolCode || "SV",
        name: schoolCode || "Sinh viên Đại học",
        area: "TP.HCM"
      };
    const isEduEmail = /\.edu(\.vn)?$/i.test(email);
    const randomCode = "#SV-" + Math.floor(1000 + Math.random() * 9000);
    const avatar =
      gender === "Nam"
        ? "/assets/images/phong-chi-tiet/avatar-1.jpg"
        : "/assets/images/common/avatar-profile.jpg";

    const newUser = {
      id: "user-" + Date.now(),
      name,
      email,
      password,
      shortSchool: schoolObj.code,
      school: schoolObj.name,
      major,
      gender,
      idCode: randomCode,
      avatar,
      budgetRange: "1.8 - 2.5 tr/tháng",
      preferredAreas: schoolObj.area,
      moveInTime: "Đầu tháng tới",
      verifiedStudent: isEduEmail
    };

    writeJSON(STORAGE_KEYS.AUTH_USERS, [newUser, ...users]);
    const activeUser = setLoggedInUser(newUser);
    apiFetch("/api/auth/register", {
      method: "POST",
      body: {
        id: newUser.id,
        name,
        email,
        password,
        confirmPassword,
        schoolCode,
        major,
        gender,
        avatar
      }
    }).then((res) => {
      if (res && res.ok && res.user) {
        setLoggedInUser(res.user, res.token);
        syncWithBackend();
      }
    });
    return { ok: true, user: activeUser };
  }

  function onAuthStateChange(callback) {
    window.addEventListener("roomie:auth-changed", callback);
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEYS.AUTH_SESSION || event.key === STORAGE_KEYS.AUTH_USERS) {
        callback();
      }
    });
  }

  function openAuthModal(initialTab = "login", options = {}) {
    let activeTab = initialTab === "signup" ? "signup" : "login";
    const schoolOptionsHtml = AUTH_SCHOOL_OPTIONS.map(
      (s) => `<option value="${escapeHTML(s.code)}">${escapeHTML(s.name)}</option>`
    ).join("");

    const modal = openModal({
      title: activeTab === "login" ? "Đăng nhập Roomie" : "Đăng ký tài khoản sinh viên",
      subtitle:
        options.subtitle ||
        "Kết nối roommate hợp gu & tìm phòng trọ minh bạch dành riêng cho sinh viên",
      maxWidth: "max-w-md",
      bodyHtml: `
        <div class="flex flex-col gap-4">
          <!-- Tab Switcher -->
          <div class="grid grid-cols-2 p-1 rounded-2xl bg-surface-container-low border border-outline-variant/25">
            <button type="button" data-auth-tab="login" class="rm-auth-tab-btn py-2.5 px-4 rounded-xl text-xs font-bold transition-all">
              Đăng nhập
            </button>
            <button type="button" data-auth-tab="signup" class="rm-auth-tab-btn py-2.5 px-4 rounded-xl text-xs font-bold transition-all">
              Đăng ký mới
            </button>
          </div>

          <!-- Error / Feedback Banner -->
          <div id="rm-auth-error" class="hidden p-3 rounded-xl bg-error-container text-on-error-container text-xs font-medium flex items-start gap-2">
            <span class="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
            <span id="rm-auth-error-text"></span>
          </div>

          <!-- LOGIN PANEL -->
          <form id="rm-auth-login-form" class="flex flex-col gap-3.5" novalidate>
            <div>
              <label for="rm-login-email" class="block text-xs font-semibold text-on-surface mb-1">Email sinh viên hoặc tài khoản</label>
              <div class="relative">
                <span class="material-symbols-outlined text-[18px] text-outline absolute left-3.5 top-1/2 -translate-y-1/2">mail</span>
                <input
                  id="rm-login-email"
                  type="email"
                  required
                  autocomplete="username"
                  placeholder="vd: minhthu@student.hcmus.edu.vn"
                  class="w-full h-11 pl-10 pr-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label for="rm-login-password" class="block text-xs font-semibold text-on-surface">Mật khẩu</label>
                <button type="button" id="rm-forgot-pw-btn" class="text-[11.5px] font-semibold text-primary hover:underline">Quên mật khẩu?</button>
              </div>
              <div class="relative">
                <span class="material-symbols-outlined text-[18px] text-outline absolute left-3.5 top-1/2 -translate-y-1/2">lock</span>
                <input
                  id="rm-login-password"
                  type="password"
                  required
                  autocomplete="current-password"
                  placeholder="Nhập mật khẩu của bạn"
                  class="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-low border border-outline-variant/30 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="button" data-toggle-pw="rm-login-password" aria-label="Hiện hoặc ẩn mật khẩu" class=" absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                  <span class="material-symbols-outlined text-[18px]">visibility</span>
                </button>
              </div>
            </div>

            <button type="submit" class="mt-1 w-full py-3 px-4 rounded-xl bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm">
              <span class="material-symbols-outlined text-[18px]">login</span>
              <span>Đăng nhập vào Roomie</span>
            </button>

            <!-- Quick Demo Accounts -->
            <div class="pt-3 border-t border-surface-container flex flex-col gap-2">
              <span class="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Đăng nhập nhanh tài khoản sinh viên mẫu:</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button type="button" data-demo-login="minhthu@student.hcmus.edu.vn" class="p-2.5 rounded-xl bg-surface-container-low hover:bg-primary-fixed/60 border border-outline-variant/25 flex items-center gap-2.5 text-left transition-colors">
                  <img src="/assets/images/common/avatar-profile.jpg" alt="Minh Thư" class="w-8 h-8 rounded-full object-cover ring-1 ring-secondary-container shrink-0" />
                  <div class="min-w-0">
                    <div class="text-xs font-bold text-on-surface truncate">Minh Thư</div>
                    <div class="text-[10.5px] text-tertiary font-semibold truncate">HCMUS • Nữ</div>
                  </div>
                </button>
                <button type="button" data-demo-login="hoangnam@student.hcmus.edu.vn" class="p-2.5 rounded-xl bg-surface-container-low hover:bg-primary-fixed/60 border border-outline-variant/25 flex items-center gap-2.5 text-left transition-colors">
                  <img src="/assets/images/phong-chi-tiet/avatar-1.jpg" alt="Hoàng Nam" class="w-8 h-8 rounded-full object-cover ring-1 ring-secondary-container shrink-0" />
                  <div class="min-w-0">
                    <div class="text-xs font-bold text-on-surface truncate">Hoàng Nam</div>
                    <div class="text-[10.5px] text-primary font-semibold truncate">HCMUS • Nam</div>
                  </div>
                </button>
              </div>
            </div>
          </form>

          <!-- SIGN UP PANEL -->
          <form id="rm-auth-signup-form" class="hidden flex-col gap-3" novalidate>
            <div>
              <label for="rm-signup-name" class="block text-xs font-semibold text-on-surface mb-1">Họ và tên sinh viên</label>
              <input
                id="rm-signup-name"
                type="text"
                required
                placeholder="vd: Nguyễn Minh Anh"
                class="w-full h-10 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label for="rm-signup-email" class="block text-xs font-semibold text-on-surface mb-1">Email sinh viên (.edu.vn) hoặc cá nhân</label>
              <input
                id="rm-signup-email"
                type="email"
                required
                placeholder="vd: 23120001@student.hcmus.edu.vn"
                class="w-full h-10 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span class="block text-[11px] text-tertiary font-medium mt-1">
                * Email đuôi <strong>.edu.vn</strong> được cấp ngay huy hiệu Đã xác thực thẻ SV
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div class="sm:col-span-2">
                <label for="rm-signup-school" class="block text-xs font-semibold text-on-surface mb-1">Trường Đại học</label>
                <select
                  id="rm-signup-school"
                  class="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  ${schoolOptionsHtml}
                </select>
              </div>
              <div>
                <label for="rm-signup-gender" class="block text-xs font-semibold text-on-surface mb-1">Giới tính</label>
                <select
                  id="rm-signup-gender"
                  class="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Nữ">Nữ</option>
                  <option value="Nam">Nam</option>
                </select>
              </div>
            </div>

            <div>
              <label for="rm-signup-major" class="block text-xs font-semibold text-on-surface mb-1">Khoa / Khóa học</label>
              <input
                id="rm-signup-major"
                type="text"
                placeholder="vd: Khoa CNTT • K23"
                value="Khoa CNTT • K23"
                class="w-full h-10 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label for="rm-signup-password" class="block text-xs font-semibold text-on-surface mb-1">Mật khẩu (≥ 6 ký tự)</label>
                <div class="relative">
                  <input
                    id="rm-signup-password"
                    type="password"
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    class="w-full h-10 pl-3.5 pr-9 rounded-xl bg-surface-container-low border border-outline-variant/30 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button type="button" data-toggle-pw="rm-signup-password" aria-label="Hiện hoặc ẩn mật khẩu" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                    <span class="material-symbols-outlined text-[17px]">visibility</span>
                  </button>
                </div>
              </div>
              <div>
                <label for="rm-signup-confirm" class="block text-xs font-semibold text-on-surface mb-1">Nhập lại mật khẩu</label>
                <input
                  id="rm-signup-confirm"
                  type="password"
                  required
                  placeholder="Xác nhận mật khẩu"
                  class="w-full h-10 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <label class="flex items-start gap-2 text-xs text-on-surface-variant cursor-pointer pt-0.5">
              <input id="rm-signup-terms" type="checkbox" checked class="mt-0.5 w-4 h-4 rounded accent-primary" />
              <span>Tôi đồng ý với <a href="/roomie/an-toan" class="text-primary font-semibold hover:underline">Quy chuẩn cộng đồng &amp; Nguyên tắc an toàn</a> của Roomie.</span>
            </label>

            <button type="submit" class="mt-1 w-full py-3 px-4 rounded-xl bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm">
              <span class="material-symbols-outlined text-[18px]">person_add</span>
              <span>Đăng ký tài khoản Roomie</span>
            </button>
          </form>
        </div>
      `
    });

    const titleEl = modal.querySelector("h3");
    const errorBox = modal.querySelector("#rm-auth-error");
    const errorText = modal.querySelector("#rm-auth-error-text");
    const loginForm = modal.querySelector("#rm-auth-login-form");
    const signupForm = modal.querySelector("#rm-auth-signup-form");
    const tabBtns = modal.querySelectorAll("[data-auth-tab]");

    const showError = (msg) => {
      if (!msg) {
        errorBox.classList.add("hidden");
        return;
      }
      errorText.textContent = msg;
      errorBox.classList.remove("hidden");
    };

    const syncTabUI = (tab) => {
      activeTab = tab;
      showError("");
      if (titleEl) {
        titleEl.textContent = tab === "login" ? "Đăng nhập Roomie" : "Đăng ký tài khoản sinh viên";
      }
      tabBtns.forEach((btn) => {
        const isCurrent = btn.dataset.authTab === tab;
        btn.className = isCurrent
          ? "rm-auth-tab-btn py-2.5 px-4 rounded-xl text-xs font-bold bg-primary text-on-primary shadow-xs transition-all"
          : "rm-auth-tab-btn py-2.5 px-4 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-all";
      });
      loginForm.classList.toggle("hidden", tab !== "login");
      loginForm.classList.toggle("flex", tab === "login");
      signupForm.classList.toggle("hidden", tab !== "signup");
      signupForm.classList.toggle("flex", tab === "signup");
    };

    syncTabUI(activeTab);

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => syncTabUI(btn.dataset.authTab));
    });

    modal.querySelectorAll("[data-toggle-pw]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = modal.querySelector(`#${btn.dataset.togglePw}`);
        const icon = btn.querySelector(".material-symbols-outlined");
        if (!input) return;
        const isPw = input.type === "password";
        input.type = isPw ? "text" : "password";
        if (icon) icon.textContent = isPw ? "visibility_off" : "visibility";
      });
    });

    modal.querySelector("#rm-forgot-pw-btn")?.addEventListener("click", () => {
      const emailVal = modal.querySelector("#rm-login-email")?.value.trim();
      showToast(
        emailVal
          ? `Đã gửi hướng dẫn đặt lại mật khẩu tới ${emailVal}!`
          : "Hãy nhập email sinh viên hoặc chọn tài khoản mẫu bên dưới để đăng nhập nhanh.",
        "info"
      );
    });

    modal.querySelectorAll("[data-demo-login]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const res = loginUser(btn.dataset.demoLogin, "123");
        if (res.ok) {
          closeModal();
          options.onSuccess?.(res.user);
          showToast(`Chào mừng trở lại, ${res.user.name} (${res.user.shortSchool})!`);
        }
      });
    });

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = modal.querySelector("#rm-login-email")?.value;
      const password = modal.querySelector("#rm-login-password")?.value;
      const res = loginUser(email, password);
      if (!res.ok) {
        showError(res.error);
        return;
      }
      closeModal();
      options.onSuccess?.(res.user);
      showToast(`Đăng nhập thành công! Xin chào ${res.user.name}.`);
    });

    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const termsChecked = modal.querySelector("#rm-signup-terms")?.checked;
      if (!termsChecked) {
        showError("Vui lòng đồng ý với Quy chuẩn cộng đồng & Nguyên tắc an toàn.");
        return;
      }
      const res = registerUser({
        name: modal.querySelector("#rm-signup-name")?.value,
        email: modal.querySelector("#rm-signup-email")?.value,
        schoolCode: modal.querySelector("#rm-signup-school")?.value,
        gender: modal.querySelector("#rm-signup-gender")?.value,
        major: modal.querySelector("#rm-signup-major")?.value,
        password: modal.querySelector("#rm-signup-password")?.value,
        confirmPassword: modal.querySelector("#rm-signup-confirm")?.value
      });
      if (!res.ok) {
        showError(res.error);
        return;
      }
      closeModal();
      options.onSuccess?.(res.user);
      showToast(`Đăng ký thành công! Chào mừng ${res.user.name} (${res.user.shortSchool}) đến với Roomie.`);
    });
  }

  // =========================================================================
  // BACKEND API & SQLITE DATABASE SYNC LAYER
  // =========================================================================

  async function apiFetch(endpoint, options = {}) {
    try {
      const session = readJSON(STORAGE_KEYS.AUTH_SESSION, null);
      const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
      };
      if (session?.token) {
        headers.Authorization = `Bearer ${session.token}`;
      }
      if (session?.loggedIn && session?.user?.id) {
        headers["X-User-Id"] = session.user.id;
      } else if (session && session.loggedIn === false) {
        headers["X-User-Id"] = "guest";
      }

      const fetchOpts = {
        method: options.method || "GET",
        headers
      };
      if (options.body !== undefined) {
        fetchOpts.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
      }

      const response = await fetch(endpoint, fetchOpts);
      const data = await response.json().catch(() => null);
      return data;
    } catch {
      return null;
    }
  }

  async function syncWithBackend() {
    const data = await apiFetch("/api/bootstrap");
    if (!data || !data.ok) return null;

    if (Array.isArray(data.users) && data.users.length) {
      const localUsers = getRegisteredUsers();
      const byEmail = new Map(localUsers.map((u) => [u.email?.toLowerCase(), u]));
      data.users.forEach((dbUser) => {
        const key = dbUser.email?.toLowerCase();
        if (key) {
          const existing = byEmail.get(key) || {};
          byEmail.set(key, { ...existing, ...dbUser, password: existing.password || "123" });
        }
      });
      writeJSON(STORAGE_KEYS.AUTH_USERS, Array.from(byEmail.values()));
    }

    if (Array.isArray(data.rooms) && data.rooms.length) {
      Data.ROOMS = data.rooms;
    }
    if (Array.isArray(data.roommates) && data.roommates.length) {
      Data.ROOMMATES = markPersonalizedRoommateScores(data.roommates, data.quizAnswers);
    }
    if (Array.isArray(data.notifications) && data.notifications.length) {
      Data.NOTIFICATIONS = data.notifications;
    }
    if (Array.isArray(data.savedRoomIds)) {
      const localSaved = getSavedRoomIds();
      const mergedSaved = Array.from(new Set([...data.savedRoomIds, ...localSaved]));
      writeJSON(STORAGE_KEYS.SAVED_ROOMS, mergedSaved);
    }
    if (Array.isArray(data.connections) && data.connections.length) {
      saveConnections(data.connections);
    }
    if (Array.isArray(data.activePlans) && data.activePlans.length) {
      writeJSON(STORAGE_KEYS.ACTIVE_PLANS, data.activePlans);
      window.dispatchEvent(new CustomEvent("roomie:plan-updated", { detail: { pkg: data.activePlans[0] } }));
    }
    if (data.quizResult && data.quizResult.archetype) {
      writeJSON(STORAGE_KEYS.QUIZ_RESULT, data.quizResult);
      if (data.quizAnswers && Object.keys(data.quizAnswers).length) {
        writeJSON(STORAGE_KEYS.QUIZ_ANSWERS, data.quizAnswers);
      }
    }

    window.dispatchEvent(new CustomEvent("roomie:backend-synced", { detail: data }));
    window.dispatchEvent(new CustomEvent("roomie:connections-updated"));
    return data;
  }

  async function createRoomListing(newRoom) {
    const existing = readJSON(STORAGE_KEYS.CUSTOM_LISTINGS, []);
    writeJSON(STORAGE_KEYS.CUSTOM_LISTINGS, [newRoom, ...existing.filter((r) => r.id !== newRoom.id)]);
    const res = await apiFetch("/api/rooms", {
      method: "POST",
      body: newRoom
    });
    if (res && res.ok && Array.isArray(res.rooms)) {
      Data.ROOMS = res.rooms;
    }
    return res?.room || newRoom;
  }

  async function createRoommateListing(listing) {
    const res = await apiFetch("/api/roommates", {
      method: "POST",
      body: listing
    });
    if (res && res.ok && Array.isArray(res.roommates)) {
      Data.ROOMMATES = res.roommates;
    }
    return res;
  }

  async function submitQuizResult(answers, result) {
    writeJSON(STORAGE_KEYS.QUIZ_ANSWERS, answers);
    writeJSON(STORAGE_KEYS.QUIZ_RESULT, result);
    const res = await apiFetch("/api/quiz/submit", {
      method: "POST",
      body: { answers, result }
    });
    if (res && res.ok) {
      if (res.quizResult) writeJSON(STORAGE_KEYS.QUIZ_RESULT, res.quizResult);
      if (Array.isArray(res.roommates)) {
        Data.ROOMMATES = markPersonalizedRoommateScores(res.roommates, answers);
      }
    }
    return res;
  }

  function markPersonalizedRoommateScores(roommates, answers) {
    const questionCount = (Data.QUIZ_QUESTIONS || []).length;
    const hasCompleteAnswers = questionCount > 0 && Object.keys(answers || {}).length === questionCount;
    const genderOption = answers?.[1] || answers?.["1"];

    return roommates.map((roommate) => {
      const hasCompleteProfile = [2, 3, 4, 5, 6, 7, 8, 9].every(
        (question) => roommate.quizProfile?.[question] || roommate.quizProfile?.[String(question)]
      );
      const genderCompatible =
        (genderOption === "A" && roommate.gender === "Nam") ||
        (genderOption === "B" && roommate.gender === "Nữ") ||
        genderOption === "C" ||
        genderOption === "D";
      return {
        ...roommate,
        ...(genderOption && !genderCompatible ? { matchScore: null } : {}),
        hasPersonalizedMatchScore: Boolean(
          genderCompatible && (roommate.hasPersonalizedMatchScore || (hasCompleteAnswers && hasCompleteProfile))
        )
      };
    });
  }

  async function submitSafetyReport(payload) {
    return apiFetch("/api/reports", {
      method: "POST",
      body: payload
    });
  }

  async function submitContactTicket(payload) {
    return apiFetch("/api/contacts", {
      method: "POST",
      body: payload
    });
  }

  async function markAllNotificationsRead() {
    writeJSON(
      STORAGE_KEYS.NOTIFICATIONS_READ,
      (Data.NOTIFICATIONS || []).map((n) => n.id)
    );
    return apiFetch("/api/notifications/read-all", {
      method: "POST"
    });
  }

  // Initialize USER_PROFILE sync & Backend Database sync on script load
  getCurrentUser();
  syncWithBackend();

  window.RoomieCore = {
    CONTACT,
    STORAGE_KEYS,
    MAX_CONTACT_SLOTS,
    FALLBACK_SVG,
    apiFetch,
    syncWithBackend,
    createRoomListing,
    createRoommateListing,
    submitQuizResult,
    submitSafetyReport,
    submitContactTicket,
    markAllNotificationsRead,
    readJSON,
    writeJSON,
    escapeHTML,
    formatVND,
    parseCurrencyNumber,
    normalizeSearchText,
    getPurchasedPlans,
    hasPurchasedPlan,
    hasUnlockedPrediction,
    getLatestPurchasedPlan,
    activatePurchasedPlan,
    resetPurchasedPlans,
    onPlanStateChange,
    isLoggedIn,
    getCurrentUser,
    loginUser,
    registerUser,
    logoutUser,
    openAuthModal,
    onAuthStateChange,
    getAllRooms,
    isPrivateRoom,
    getSavedRoomIds,
    toggleSavedRoom,
    getConnections,
    getActiveSlotConnections,
    getConnectionForPartner,
    syncHeaderSlotBadge,
    updateConnectionStatus,
    showToast,
    openModal,
    closeModal,
    copyContactText,
    openSlotFullModal,
    openContactUnlockedModal,
    openConnectInviteModal,
    openSupportContactModal,
    openConnectionsDrawer,
    openProfileModal,
    openPaymentModal,
    openContractModal,
    openGalleryModal,
    openReportModal
  };
})();
