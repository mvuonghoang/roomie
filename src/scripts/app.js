(function () {
  const Data = window.RoomieData || {};

  const STORAGE_KEYS = {
    SAVED_ROOMS: "rm_saved_rooms",
    INVITED_ROOMMATES: "rm_invited_roommates",
    QUIZ_ANSWERS: "rm_quiz_answers",
    QUIZ_RESULT: "rm_quiz_result",
    CUSTOM_LISTINGS: "rm_custom_listings",
    LISTING_DRAFT: "rm_listing_draft",
    NOTIFICATIONS_READ: "rm_notifications_read",
    CHAT_HISTORY: "rm_chat_history",
    CHAT_CONTACTS: "rm_chat_contacts"
  };

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

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage quota errors in private mode
    }
  }

  function getAllRooms() {
    const custom = readJSON(STORAGE_KEYS.CUSTOM_LISTINGS, []);
    return [...custom, ...(Data.ROOMS || [])];
  }

  function isPrivateRoom(room) {
    return room && room.typeKey === "phong-rieng";
  }

  function getSavedRoomIds() {
    return readJSON(STORAGE_KEYS.SAVED_ROOMS, []);
  }

  function escapeHTML(value) {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(value == null ? "" : value).replace(/[&<>"']/g, (character) => entities[character]);
  }

  function saveChatContact(contact) {
    if (!contact || !contact.name) return;

    const storedContacts = readJSON(STORAGE_KEYS.CHAT_CONTACTS, []);
    const contacts = Array.isArray(storedContacts) ? storedContacts : [];
    const existing = contacts.find((item) => item.name === contact.name) || {};
    const updated = {
      ...existing,
      ...contact,
      meta: contact.meta || existing.meta || "",
      avatar: contact.avatar || existing.avatar || "",
      roomId: contact.roomId || existing.roomId || "",
      lastActivity: Date.now()
    };

    writeJSON(
      STORAGE_KEYS.CHAT_CONTACTS,
      [updated, ...contacts.filter((item) => item.name !== contact.name)]
    );
  }

  function getChatContacts() {
    const storedContacts = readJSON(STORAGE_KEYS.CHAT_CONTACTS, []);
    const contacts = Array.isArray(storedContacts) ? storedContacts : [];
    const contactsByName = new Map(
      contacts.filter((contact) => contact && contact.name).map((contact) => [contact.name, contact])
    );
    const storedHistory = readJSON(STORAGE_KEYS.CHAT_HISTORY, {});
    const historyMap = storedHistory && typeof storedHistory === "object" ? storedHistory : {};

    Object.keys(historyMap).forEach((name) => {
      if (!contactsByName.has(name)) {
        contactsByName.set(name, { name, activityType: "messaged", lastActivity: 0 });
      }
    });

    return Array.from(contactsByName.values()).sort(
      (a, b) =>
        Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) ||
        Number(b.lastActivity || 0) - Number(a.lastActivity || 0)
    );
  }

  function setChatContactPinned(contact, pinned) {
    const storedContacts = readJSON(STORAGE_KEYS.CHAT_CONTACTS, []);
    const contacts = Array.isArray(storedContacts) ? storedContacts : [];
    const updated = { ...contact, pinned };
    const exists = contacts.some((item) => item.name === contact.name);
    writeJSON(
      STORAGE_KEYS.CHAT_CONTACTS,
      exists
        ? contacts.map((item) => (item.name === contact.name ? { ...item, pinned } : item))
        : [updated, ...contacts]
    );
  }

  function deleteChatConversation(name) {
    const storedContacts = readJSON(STORAGE_KEYS.CHAT_CONTACTS, []);
    const contacts = Array.isArray(storedContacts) ? storedContacts : [];
    writeJSON(
      STORAGE_KEYS.CHAT_CONTACTS,
      contacts.filter((contact) => contact.name !== name)
    );

    const storedHistory = readJSON(STORAGE_KEYS.CHAT_HISTORY, {});
    const historyMap = storedHistory && typeof storedHistory === "object" ? storedHistory : {};
    delete historyMap[name];
    writeJSON(STORAGE_KEYS.CHAT_HISTORY, historyMap);
  }

  function toggleSavedRoom(id) {
    const strId = String(id);
    const saved = getSavedRoomIds();
    const exists = saved.includes(strId);
    const next = exists ? saved.filter((x) => x !== strId) : [...saved, strId];
    writeJSON(STORAGE_KEYS.SAVED_ROOMS, next);
    return !exists;
  }

  function formatVND(num) {
    const n = Number(String(num).replace(/[^\d]/g, "")) || 0;
    return n.toLocaleString("vi-VN") + "đ";
  }

  function parseCurrencyNumber(str) {
    return Number(String(str || "").replace(/[^\d]/g, "")) || 0;
  }

  // -------------------- Toast & Modals --------------------
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

    const icon =
      variant === "error" ? "error" : variant === "info" ? "info" : "check_circle";

    const toast = document.createElement("div");
    toast.className = `pointer-events-auto rm-animate-in flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-xl ${palette}`;
    toast.innerHTML = `
      <div class="flex items-center gap-2.5 text-sm font-medium">
        <span class="material-symbols-outlined text-[20px]">${icon}</span>
        <span>${message}</span>
      </div>
      <button type="button" class="opacity-75 hover:opacity-100 leading-none" aria-label="Đóng">
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
    `;

    const closeBtn = toast.querySelector("button");
    closeBtn.addEventListener("click", () => toast.remove());
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.25s ease";
      setTimeout(() => toast.remove(), 250);
    }, 3600);
  }

  function openModal({ title, subtitle = "", bodyHtml, maxWidth = "max-w-lg" }) {
    closeModal();
    const overlay = document.createElement("div");
    overlay.id = "rm-modal-overlay";
    overlay.className =
      "fixed inset-0 z-[90] bg-inverse-surface/55 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto";
    overlay.innerHTML = `
      <div class="rm-animate-in w-full ${maxWidth} bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden my-auto border border-surface-container">
        <div class="px-6 py-4 bg-surface-container-low flex items-start justify-between gap-4 border-b border-surface-container">
          <div>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${title}</h3>
            ${subtitle ? `<p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">${subtitle}</p>` : ""}
          </div>
          <button type="button" id="rm-modal-close" class="w-8 h-8 rounded-full bg-surface-container-lowest hover:bg-surface-container flex items-center justify-center text-on-surface-variant">
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

  function closeModal() {
    const existing = document.getElementById("rm-modal-overlay");
    if (existing) existing.remove();
  }

  function openChatModal(partnerName = "Hoàng Nam", partnerMeta = "Sinh viên HCMUS • Phản hồi trong 15 phút", presetText = "") {
    const key = partnerName;
    saveChatContact({ name: partnerName, meta: partnerMeta, activityType: "interested" });
    const historyMap = readJSON(STORAGE_KEYS.CHAT_HISTORY, {});
    const messages = historyMap[key] || [
      {
        sender: "them",
        text: `Chào Minh Thư! Mình là ${partnerName}. Bạn đang quan tâm tìm phòng / ghép roommate đúng không?`,
        time: "Vừa xong"
      }
    ];

    const renderMessages = (list) =>
      list
        .map((m) =>
          m.sender === "me"
            ? `<div class="flex justify-end"><div class="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-primary text-on-primary text-sm shadow-sm"><p>${m.text}</p><span class="block text-[10px] opacity-75 mt-1 text-right">${m.time}</span></div></div>`
            : `<div class="flex justify-start"><div class="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-surface-container-low text-on-surface text-sm"><p>${m.text}</p><span class="block text-[10px] text-on-surface-variant mt-1">${m.time}</span></div></div>`
        )
        .join("");

    const modal = openModal({
      title: `Nhắn tin với ${partnerName}`,
      subtitle: partnerMeta,
      maxWidth: "max-w-md",
      bodyHtml: `
        <div class="flex flex-col gap-4">
          <div class="px-3 py-2 rounded-xl bg-secondary-container/40 text-on-secondary-container text-xs flex items-center gap-2">
            <span class="material-symbols-outlined text-[16px]">shield</span>
            <span>SĐT & Zalo được bảo vệ ẩn danh cho tới khi cả 2 cùng bấm Xác nhận ghép đôi.</span>
          </div>
          <div id="rm-chat-messages" class="flex flex-col gap-2.5 h-60 overflow-y-auto p-3 rounded-2xl bg-surface border border-surface-container">
            ${renderMessages(messages)}
          </div>
          <div class="flex flex-wrap gap-1.5">
            <button type="button" class="rm-quick-reply px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-primary-fixed text-xs text-on-surface font-medium transition-colors">Phòng vẫn còn trống chứ?</button>
            <button type="button" class="rm-quick-reply px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-primary-fixed text-xs text-on-surface font-medium transition-colors">Cuối tuần mình qua xem phòng nhé</button>
          </div>
          <form id="rm-chat-form" class="flex items-center gap-2">
            <input id="rm-chat-input" type="text" required value="${presetText}" placeholder="Nhập tin nhắn làm quen..." class="flex-1 h-11 px-4 rounded-xl bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
            <button type="submit" class="h-11 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm flex items-center gap-1 transition-colors">
              <span class="material-symbols-outlined text-[18px]">send</span>
              <span>Gửi</span>
            </button>
          </form>
        </div>
      `
    });

    const box = modal.querySelector("#rm-chat-messages");
    const input = modal.querySelector("#rm-chat-input");
    const form = modal.querySelector("#rm-chat-form");
    box.scrollTop = box.scrollHeight;

    modal.querySelectorAll(".rm-quick-reply").forEach((btn) => {
      btn.addEventListener("click", () => {
        input.value = btn.textContent.trim();
        input.focus();
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      messages.push({ sender: "me", text, time: "Vừa gửi" });
      historyMap[key] = messages;
      writeJSON(STORAGE_KEYS.CHAT_HISTORY, historyMap);
      saveChatContact({ name: partnerName, meta: partnerMeta, activityType: "messaged" });
      box.innerHTML = renderMessages(messages);
      box.scrollTop = box.scrollHeight;
      input.value = "";

      setTimeout(() => {
        messages.push({
          sender: "them",
          text: "Mình đã nhận được tin nhắn nhé! Nếu tiện bạn có thể hẹn gặp xem phòng hoặc trao đổi thêm thói quen sinh hoạt vào tối nay lúc 19h nha.",
          time: "Tức thì"
        });
        historyMap[key] = messages;
        writeJSON(STORAGE_KEYS.CHAT_HISTORY, historyMap);
        if (document.getElementById("rm-chat-messages")) {
          box.innerHTML = renderMessages(messages);
          box.scrollTop = box.scrollHeight;
        }
      }, 650);
    });
  }

  function closeMessagesDrawer() {
    const overlay = document.getElementById("rm-messages-overlay");
    if (!overlay || overlay.dataset.closing) return;

    overlay.dataset.closing = "true";
    overlay.classList.add("opacity-0");
    overlay.querySelector("#rm-messages-drawer")?.classList.add("translate-x-full");
    document.body.classList.remove("overflow-hidden");
    document.removeEventListener("keydown", handleMessagesDrawerKeydown);
    setTimeout(() => overlay.remove(), 300);
  }

  function handleMessagesDrawerKeydown(event) {
    if (event.key === "Escape") closeMessagesDrawer();
  }

  function openMessagesDrawer() {
    if (document.getElementById("rm-messages-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "rm-messages-overlay";
    overlay.className = "fixed inset-0 z-[90] bg-inverse-surface/40 opacity-0 transition-opacity duration-300";
    overlay.innerHTML = `
      <aside id="rm-messages-drawer" role="dialog" aria-modal="true" aria-labelledby="rm-messages-title" class="absolute inset-y-0 right-0 flex w-full max-w-md translate-x-full flex-col border-l border-surface-container bg-surface-container-lowest shadow-2xl transition-transform duration-300 ease-out">
        <div class="flex items-center justify-between border-b border-surface-container px-5 py-4">
          <div>
            <h2 id="rm-messages-title" class="font-title-md text-title-md font-semibold text-on-surface">Tin nhắn</h2>
            <p class="mt-0.5 text-xs text-on-surface-variant">Các liên hệ bạn đã nhắn tin hoặc tìm hiểu</p>
          </div>
          <div class="flex items-center gap-1">
            <button type="button" id="rm-messages-edit" aria-label="Chỉnh sửa trò chuyện" aria-pressed="false" class="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button type="button" id="rm-messages-close" aria-label="Đóng tin nhắn" class="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
        <div id="rm-messages-contact-list" class="flex-1 overflow-y-auto divide-y divide-surface-container"></div>
      </aside>
    `;

    const drawer = overlay.querySelector("#rm-messages-drawer");
    const contactList = overlay.querySelector("#rm-messages-contact-list");
    const editButton = overlay.querySelector("#rm-messages-edit");
    let isEditing = false;

    const renderContacts = () => {
      const contacts = getChatContacts();
      const storedHistory = readJSON(STORAGE_KEYS.CHAT_HISTORY, {});
      const historyMap = storedHistory && typeof storedHistory === "object" ? storedHistory : {};

      if (!contacts.length) {
        contactList.innerHTML = `
          <div class="flex flex-col items-center text-center gap-2 px-6 py-12">
            <span class="material-symbols-outlined text-4xl text-outline">forum</span>
            <p class="font-label-md text-label-md font-semibold text-on-surface">Chưa có liên hệ</p>
            <p class="text-sm text-on-surface-variant">Liên hệ sẽ xuất hiện khi bạn xem tin phòng hoặc bắt đầu trò chuyện.</p>
          </div>
        `;
        return;
      }

      contactList.innerHTML = contacts
        .map((contact, index) => {
          const messages = Array.isArray(historyMap[contact.name]) ? historyMap[contact.name] : [];
          const lastMessage = messages[messages.length - 1];
          const preview =
            (lastMessage && lastMessage.text) ||
            (contact.activityType === "viewed" ? "Bạn đã xem phòng/hồ sơ này" : "Mở cuộc trò chuyện");
          const pinTitle = contact.pinned ? "Bỏ ghim cuộc trò chuyện" : "Ghim cuộc trò chuyện";
          return `
            <div class="flex items-center gap-2 p-2.5">
              <button type="button" data-contact-index="${index}" ${isEditing ? "disabled" : ""} class="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 text-left transition-colors hover:bg-surface-container-low disabled:cursor-default disabled:hover:bg-transparent">
                <img src="${escapeHTML(contact.avatar || "/assets/images/common/avatar-profile.jpg")}" alt="" class="w-11 h-11 rounded-full object-cover bg-surface-container shrink-0">
                <span class="min-w-0 flex-1">
                  <span class="flex items-center gap-1.5">
                    <span class="block font-label-md text-label-md font-semibold text-on-surface truncate">${escapeHTML(contact.name)}</span>
                    ${contact.pinned ? '<span class="material-symbols-outlined text-primary text-[15px]" aria-label="Đã ghim">push_pin</span>' : ""}
                  </span>
                  <span class="block text-xs text-on-surface-variant truncate">${escapeHTML(contact.meta || "Liên hệ Roomie")}</span>
                  <span class="block mt-1 text-xs text-on-surface-variant truncate">${escapeHTML(preview)}</span>
                </span>
                <span class="material-symbols-outlined text-on-surface-variant text-[20px]">chevron_right</span>
              </button>
              <div class="${isEditing ? "flex" : "hidden"} shrink-0 items-center gap-1">
                <button type="button" data-pin-contact="${index}" aria-label="${pinTitle}" title="${pinTitle}" class="flex h-9 w-9 items-center justify-center rounded-full ${contact.pinned ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container-low"}">
                  <span class="material-symbols-outlined text-[19px]">push_pin</span>
                </button>
                <button type="button" data-delete-contact="${index}" aria-label="Xóa cuộc trò chuyện với ${escapeHTML(contact.name)}" title="Xóa cuộc trò chuyện" class="flex h-9 w-9 items-center justify-center rounded-full text-error hover:bg-error-container/50">
                  <span class="material-symbols-outlined text-[19px]">delete</span>
                </button>
              </div>
            </div>
          `;
        })
        .join("");

      contactList.querySelectorAll("[data-contact-index]").forEach((button) => {
        button.addEventListener("click", () => {
          const contact = contacts[Number(button.dataset.contactIndex)];
          if (!contact) return;
          closeMessagesDrawer();
          openChatModal(contact.name, contact.meta || "Liên hệ Roomie");
        });
      });

      contactList.querySelectorAll("[data-pin-contact]").forEach((button) => {
        button.addEventListener("click", () => {
          const contact = contacts[Number(button.dataset.pinContact)];
          if (!contact) return;
          setChatContactPinned(contact, !contact.pinned);
          renderContacts();
        });
      });

      contactList.querySelectorAll("[data-delete-contact]").forEach((button) => {
        button.addEventListener("click", () => {
          const contact = contacts[Number(button.dataset.deleteContact)];
          if (!contact || !window.confirm(`Xóa cuộc trò chuyện với ${contact.name}?`)) return;
          deleteChatConversation(contact.name);
          renderContacts();
        });
      });
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeMessagesDrawer();
    });
    overlay.querySelector("#rm-messages-close").addEventListener("click", closeMessagesDrawer);
    editButton.addEventListener("click", () => {
      isEditing = !isEditing;
      editButton.setAttribute("aria-pressed", String(isEditing));
      editButton.setAttribute("aria-label", isEditing ? "Hoàn tất chỉnh sửa" : "Chỉnh sửa trò chuyện");
      editButton.title = isEditing ? "Hoàn tất chỉnh sửa" : "Chỉnh sửa trò chuyện";
      editButton.innerHTML = `<span class="material-symbols-outlined">${isEditing ? "edit_off" : "edit"}</span>`;
      renderContacts();
    });

    renderContacts();
    document.body.appendChild(overlay);
    document.body.classList.add("overflow-hidden");
    document.addEventListener("keydown", handleMessagesDrawerKeydown);
    requestAnimationFrame(() => {
      overlay.classList.remove("opacity-0");
      drawer.classList.remove("translate-x-full");
    });
    overlay.querySelector("#rm-messages-close").focus();
  }

  function openProfileModal(rm) {
    if (!rm) return;
    saveChatContact({
      name: rm.shortName || rm.name,
      meta: `${rm.school} · ${rm.major}`,
      avatar: rm.avatar,
      roomId: rm.linkedRoomId,
      activityType: "viewed"
    });
    const invited = readJSON(STORAGE_KEYS.INVITED_ROOMMATES, []);
    const isInvited = invited.includes(rm.id);

    const modal = openModal({
      title: `Hồ sơ sinh viên • ${rm.name}`,
      subtitle: `${rm.school} · ${rm.major}`,
      maxWidth: "max-w-xl",
      bodyHtml: `
        <div class="flex flex-col gap-5">
          <div class="flex items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low">
            <div class="flex items-center gap-3.5">
              <img src="${rm.avatar}" alt="${rm.name}" class="w-16 h-16 rounded-2xl object-cover ring-2 ring-secondary-container" />
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-title-md text-title-md font-bold text-on-surface">${rm.name}, ${rm.age}t</h4>
                  <span class="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-semibold">Đã xác thực SV</span>
                </div>
                <p class="text-xs text-on-surface-variant mt-0.5">${rm.school}</p>
                <p class="text-xs font-semibold text-primary mt-0.5">Ngân sách: ${rm.budget}</p>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1.5 shrink-0">
              <div class="text-center px-3.5 py-2 rounded-2xl bg-secondary-container text-on-secondary-container w-full">
                <div class="text-2xl font-bold leading-none">${rm.matchScore}%</div>
                <div class="text-[11px] font-semibold mt-1">Hợp gu</div>
              </div>
              <span class="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold w-full ${
                rm.gender === "Nam"
                  ? "bg-sky-100 text-sky-700 border border-sky-200"
                  : "bg-pink-100 text-pink-700 border border-pink-200"
              }">
                <span class="material-symbols-outlined text-[13px]">${rm.gender === "Nam" ? "male" : "female"}</span>
                ${rm.gender || "Sinh viên"}
              </span>
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-primary-fixed/30 text-sm text-on-primary-fixed-variant flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">apartment</span>
            <span><strong>${rm.roomStatusTitle}</strong> ${rm.roomStatusDetail}</span>
          </div>

          <div>
            <h5 class="text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-2">Thói quen & Tiêu chuẩn sống</h5>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${(rm.criteria || [])
                .map(
                  (c) => `<div class="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low text-sm text-on-surface">
                    <span class="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                    <span>${c}</span>
                  </div>`
                )
                .join("")}
            </div>
          </div>

          <blockquote class="p-3.5 rounded-xl bg-surface-container-low italic text-sm text-on-surface-variant border-l-4 border-primary">
            ${rm.quote || ""}
          </blockquote>

          <div class="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button type="button" id="rm-modal-chat-btn" class="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
              <span class="material-symbols-outlined text-[18px]">chat</span>
              <span>Nhắn tin làm quen</span>
            </button>
            <button type="button" id="rm-modal-invite-btn" class="flex-1 py-3 px-4 rounded-xl ${
              isInvited
                ? "bg-tertiary text-on-tertiary"
                : "bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed"
            } font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
              <span class="material-symbols-outlined text-[18px]">${isInvited ? "done_all" : "favorite"}</span>
              <span>${isInvited ? "Đã gửi lời mời ghép đôi" : "Mời ghép đôi"}</span>
            </button>
            ${
              rm.linkedRoomId
                ? `<a href="/roomie/phong-chi-tiet?id=${rm.linkedRoomId}" class="py-3 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-semibold text-sm flex items-center justify-center gap-1 transition-colors">
                    <span>Xem phòng</span>
                    <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>`
                : ""
            }
          </div>
        </div>
      `
    });

    modal.querySelector("#rm-modal-chat-btn").addEventListener("click", () => {
      openChatModal(rm.shortName || rm.name, `${rm.school} • ${rm.matchScore}% Hợp gu`);
    });

    modal.querySelector("#rm-modal-invite-btn").addEventListener("click", (e) => {
      const btn = e.currentTarget;
      const current = readJSON(STORAGE_KEYS.INVITED_ROOMMATES, []);
      if (!current.includes(rm.id)) {
        writeJSON(STORAGE_KEYS.INVITED_ROOMMATES, [...current, rm.id]);
        btn.className = "flex-1 py-3 px-4 rounded-xl bg-tertiary text-on-tertiary font-semibold text-sm flex items-center justify-center gap-2 transition-colors";
        btn.innerHTML = `<span class="material-symbols-outlined text-[18px]">done_all</span><span>Đã gửi lời mời ghép đôi</span>`;
        showToast(`Đã gửi lời mời ghép đôi tới ${rm.name}!`);
      } else {
        showToast(`Bạn đã gửi lời mời tới ${rm.name} trước đó rồi.`, "info");
      }
    });
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
              <div class="font-bold text-on-surface">${pkg.name}</div>
              <div class="text-xs text-on-surface-variant mt-0.5">${pkg.desc}</div>
            </div>
            <div class="text-right shrink-0 ml-3">
              <div class="text-xl font-bold text-primary">${pkg.price}</div>
              <div class="text-[11px] text-on-surface-variant">${pkg.period}</div>
            </div>
          </div>

          <div class="flex flex-col items-center p-5 rounded-2xl bg-surface border border-surface-container text-center">
            <div class="w-36 h-36 rounded-2xl bg-white p-3 shadow-sm border border-surface-container flex flex-col items-center justify-center mb-3">
              <span class="material-symbols-outlined text-primary text-[72px]">qr_code_2</span>
              <span class="text-[10px] font-semibold text-tertiary mt-1">VietQR · MoMo · ZaloPay</span>
            </div>
            <p class="text-xs text-on-surface-variant">Nội dung chuyển khoản: <strong class="text-on-surface">RM-${pkg.id.toUpperCase()}</strong></p>
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
      closeModal();
      showToast(`Đã kích hoạt gói ${pkg.name} thành công!`);
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
      subtitle: "Chuẩn sinh viên ĐHQG TP.HCM — Bảo vệ quyền lợi & tiền cọc",
      maxWidth: "max-w-2xl",
      bodyHtml: `
        <div class="flex flex-col gap-4">
          <pre class="whitespace-pre-wrap font-mono text-xs bg-surface-container-low p-4 rounded-2xl text-on-surface leading-relaxed border border-surface-container">${contentText}</pre>
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
    const modal = openModal({
      title: title || "Thư viện hình ảnh phòng trọ",
      subtitle: `${list.length} hình ảnh thực tế đã xác minh`,
      maxWidth: "max-w-3xl",
      bodyHtml: `
        <div class="flex flex-col gap-3">
          <div class="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-surface-container">
            <img id="rm-gallery-main" src="${list[0]}" class="w-full h-full object-cover" alt="Room photo" />
            <button type="button" id="rm-gallery-prev" class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-container-lowest/90 shadow-md flex items-center justify-center hover:bg-white">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <button type="button" id="rm-gallery-next" class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-container-lowest/90 shadow-md flex items-center justify-center hover:bg-white">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <div class="grid grid-cols-4 gap-2">
            ${list
              .map(
                (src, i) => `<button type="button" data-idx="${i}" class="rm-gallery-thumb aspect-[4/3] rounded-xl overflow-hidden ring-2 ${
                  i === 0 ? "ring-primary" : "ring-transparent opacity-70 hover:opacity-100"
                }"><img src="${src}" class="w-full h-full object-cover" /></button>`
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
      thumbs.forEach((t, i) => {
        t.classList.toggle("ring-primary", i === idx);
        t.classList.toggle("ring-transparent", i !== idx);
        t.classList.toggle("opacity-70", i !== idx);
      });
    };
    modal.querySelector("#rm-gallery-prev").addEventListener("click", () => updateIdx(idx - 1));
    modal.querySelector("#rm-gallery-next").addEventListener("click", () => updateIdx(idx + 1));
    thumbs.forEach((t) =>
      t.addEventListener("click", () => updateIdx(Number(t.dataset.idx)))
    );
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
      closeModal();
      showToast("Đã ghi nhận báo cáo! Ban An toàn Roomie sẽ kiểm tra ngay.");
    });
  }

  // -------------------- Global Shell (Nav, Links, Popovers, Images) --------------------
  function initGlobalShell() {
    // 1. Image fallback protection
    document.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => {
        if (img.dataset.fallbackApplied) return;
        img.dataset.fallbackApplied = "1";
        img.src = FALLBACK_SVG;
      });
    });

    // 2. Wire all data-path links to real routes
    const routes = Data.ROUTES || {};
    document.querySelectorAll("a[data-path]").forEach((a) => {
      const pathKey = a.getAttribute("data-path");
      if (routes[pathKey]) {
        a.setAttribute("href", routes[pathKey]);
      }
    });

    // 3. Highlight active nav tab cleanly
    const rawPath = window.location.pathname.replace(/\/+$/, "") || "/";
    const currentPath = rawPath.replace(/^\/roomie(?=\/|$)/, "") || "/";
    const nav = document.querySelector("header nav");
    if (nav) {
      const routeToNavPath = {
        "/": "trang-chu",
        "/index.html": "trang-chu",
        "/trang-chu": "trang-chu",
        "/tim-phong": "tim-phong",
        "/pages/tim-phong.html": "tim-phong",
        "/khu-vuc-lang-dai-hoc": "tim-phong",
        "/phong-chi-tiet": "tim-phong",
        "/pages/phong-chi-tiet.html": "tim-phong",
        "/tim-roommate": "tim-roommate",
        "/pages/tim-roommate.html": "tim-roommate",
        "/ket-qua-match": "tim-roommate",
        "/trac-nghiem": "trac-nghiem-hop-gu",
        "/pages/trac-nghiem.html": "trac-nghiem-hop-gu",
        "/trac-nghiem-hop-gu": "trac-nghiem-hop-gu",
        "/trac-nghiem-tinh-cach": "trac-nghiem-hop-gu",
        "/bang-gia": "dich-vu",
        "/pages/bang-gia.html": "dich-vu",
        "/dich-vu": "dich-vu",
        "/ve-chung-toi": "ve-chung-toi",
        "/pages/ve-chung-toi.html": "ve-chung-toi",
        "/an-toan": "ve-chung-toi",
        "/pages/an-toan.html": "ve-chung-toi"
      };
      const activeKey = routeToNavPath[currentPath] || "trang-chu";
      const activeClasses = (
        nav.getAttribute("data-active-classes") ||
        "bg-primary-container text-on-primary-container rounded-lg font-semibold"
      ).split(/\s+/);

      nav.querySelectorAll("a[data-path]").forEach((link) => {
        const isMatch =
          link.getAttribute("data-path") === activeKey ||
          (activeKey === "trac-nghiem-hop-gu" &&
            link.getAttribute("data-path") === "trac-nghiem-tinh-cach");

        activeClasses.forEach((cls) => link.classList.remove(cls));
        if (isMatch) {
          link.setAttribute("aria-current", "page");
          link.classList.remove("text-on-surface-variant", "hover:text-on-surface", "hover:bg-surface-container-low/70");
          activeClasses.forEach((cls) => link.classList.add(cls));
        } else {
          link.removeAttribute("aria-current");
          link.classList.add("text-on-surface-variant", "hover:text-on-surface", "hover:bg-surface-container-low/70");
        }
      });
    }

    // 3b. Navbar transitions to tinted surface on scroll (logo stays frameless)
    const headerEl = document.querySelector("header");
    const navPillEl = document.querySelector("header nav");
    const rightPillEl = document.querySelector("header > div")?.lastElementChild;
    if (headerEl) {
      const scrolledHeaderClasses = [
        "bg-primary-fixed/95",
        "backdrop-blur-xl",
        "shadow-[0_10px_30px_-8px_rgba(73,62,229,0.20)]",
        "border-b",
        "border-primary/20",
        "pointer-events-auto"
      ];
      const syncHeaderScroll = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const isScrolled = scrollTop > 24;
        headerEl.classList.toggle("pointer-events-none", !isScrolled);
        scrolledHeaderClasses.forEach((cls) => headerEl.classList.toggle(cls, isScrolled));
        [navPillEl, rightPillEl].forEach((pill) => {
          if (!pill) return;
          pill.classList.toggle("bg-surface-container-lowest", isScrolled);
          pill.classList.toggle("bg-surface-container-lowest/80", !isScrolled);
        });
      };
      syncHeaderScroll();
      window.addEventListener("scroll", syncHeaderScroll, { passive: true });
      document.addEventListener("scroll", syncHeaderScroll, { passive: true });
      window.addEventListener("load", syncHeaderScroll, { passive: true });
      window.addEventListener("hashchange", syncHeaderScroll, { passive: true });
    }

    // 4. Mobile drawer injection (for < lg screens)
    const headerContainer = document.querySelector("header > div");
    if (headerContainer && !document.getElementById("rm-mobile-menu-btn")) {
      const rightActions = headerContainer.lastElementChild;
      if (rightActions) {
        const menuBtn = document.createElement("button");
        menuBtn.id = "rm-mobile-menu-btn";
        menuBtn.type = "button";
        menuBtn.setAttribute("aria-label", "Mở menu điều hướng");
        menuBtn.className =
          "lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors";
        menuBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">menu</span>`;
        rightActions.appendChild(menuBtn);

        const drawer = document.createElement("div");
        drawer.id = "rm-mobile-drawer";
        drawer.className =
          "hidden lg:hidden fixed top-20 left-4 right-4 z-40 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-xl shadow-2xl border border-outline-variant/25 p-4";
        drawer.innerHTML = `
          <div class="flex flex-col gap-1.5 max-w-[1280px] mx-auto">
            <a href="/roomie" class="px-4 py-2.5 rounded-xl font-label-md text-on-surface hover:bg-surface-container-low">Trang chủ</a>
            <a href="/roomie/tim-phong" class="px-4 py-2.5 rounded-xl font-label-md text-on-surface hover:bg-surface-container-low">Tìm phòng trọ</a>
            <a href="/roomie/tim-roommate" class="px-4 py-2.5 rounded-xl font-label-md text-on-surface hover:bg-surface-container-low">Tìm roommate</a>
            <a href="/roomie/trac-nghiem" class="px-4 py-2.5 rounded-xl font-label-md text-on-surface hover:bg-surface-container-low">Trắc nghiệm hợp gu</a>
            <a href="/roomie/bang-gia" class="px-4 py-2.5 rounded-xl font-label-md text-on-surface hover:bg-surface-container-low">Bảng giá dịch vụ</a>
            <a href="/roomie/ve-chung-toi" class="px-4 py-2.5 rounded-xl font-label-md text-on-surface hover:bg-surface-container-low">Về chúng tôi</a>
            <a href="/roomie/an-toan" class="px-4 py-2.5 rounded-xl font-label-md text-on-surface hover:bg-surface-container-low">An toàn & Hỗ trợ</a>
            <a href="/roomie/dang-tin" class="mt-2 px-4 py-3 rounded-xl bg-primary text-on-primary font-label-md text-center font-semibold">Đăng tin miễn phí</a>
          </div>
        `;
        document.body.appendChild(drawer);

        menuBtn.addEventListener("click", () => {
          drawer.classList.toggle("hidden");
        });
      }
    }

    // 5. Notifications popover
    const notifBtn = document.querySelector('header button[aria-label="Thông báo"]');
    if (notifBtn) {
      notifBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const existing = document.getElementById("rm-notif-popover");
        if (existing) {
          existing.remove();
          return;
        }
        const readIds = readJSON(STORAGE_KEYS.NOTIFICATIONS_READ, []);
        const pop = document.createElement("div");
        pop.id = "rm-notif-popover";
        pop.className =
          "rm-animate-in fixed top-20 right-4 sm:right-8 z-[80] w-80 sm:w-96 bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container overflow-hidden";
        pop.innerHTML = `
          <div class="px-4 py-3 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
            <span class="font-title-md text-sm font-bold text-on-surface">Thông báo mới</span>
            <button type="button" id="rm-mark-all-read" class="text-xs font-semibold text-primary hover:underline">Đánh dấu đã đọc</button>
          </div>
          <div class="divide-y divide-surface-container max-h-80 overflow-y-auto">
            ${(Data.NOTIFICATIONS || [])
              .map((n) => {
                const isUnread = n.unread && !readIds.includes(n.id);
                return `<a href="${n.href}" class="flex items-start gap-3 p-3.5 hover:bg-surface-container-low transition-colors ${
                  isUnread ? "bg-primary-fixed/20" : ""
                }">
                  <span class="mt-1.5 w-2 h-2 rounded-full shrink-0 ${isUnread ? "bg-primary" : "bg-outline-variant"}"></span>
                  <div>
                    <p class="text-sm font-medium text-on-surface leading-snug">${n.title}</p>
                    <span class="text-xs text-on-surface-variant">${n.time}</span>
                  </div>
                </a>`;
              })
              .join("")}
          </div>
        `;
        document.body.appendChild(pop);

        pop.querySelector("#rm-mark-all-read").addEventListener("click", () => {
          writeJSON(
            STORAGE_KEYS.NOTIFICATIONS_READ,
            (Data.NOTIFICATIONS || []).map((n) => n.id)
          );
          pop.remove();
          const dot = notifBtn.querySelector("span.bg-primary, span.bg-error");
          if (dot) dot.classList.add("hidden");
          showToast("Đã đánh dấu tất cả thông báo đã đọc.", "info");
        });

        setTimeout(() => {
          document.addEventListener(
            "click",
            function handler(ev) {
              if (!pop.contains(ev.target)) {
                pop.remove();
                document.removeEventListener("click", handler);
              }
            },
            true
          );
        }, 10);
      });
    }

    // 6. Header chat button
    const chatBtn = document.querySelector('header button[aria-label="Tin nhắn"]');
    if (chatBtn) {
      chatBtn.addEventListener("click", () => {
        openMessagesDrawer();
      });
    }

    // 7. Header profile quick menu
    const profileImg = document.querySelector("header img[alt='Profile']");
    if (profileImg && profileImg.parentElement) {
      profileImg.parentElement.classList.add("cursor-pointer");
      profileImg.parentElement.title = "Tài khoản Minh Thư (HCMUS)";
      profileImg.parentElement.addEventListener("click", (e) => {
        e.stopPropagation();
        const existing = document.getElementById("rm-profile-popover");
        if (existing) {
          existing.remove();
          return;
        }
        const savedCount = getSavedRoomIds().length;
        const customCount = readJSON(STORAGE_KEYS.CUSTOM_LISTINGS, []).length;
        const pop = document.createElement("div");
        pop.id = "rm-profile-popover";
        pop.className =
          "rm-animate-in fixed top-20 right-4 sm:right-8 z-[80] w-72 bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container overflow-hidden";
        pop.innerHTML = `
          <div class="p-4 bg-surface-container-low border-b border-surface-container flex items-center gap-3">
            <img src="${Data.USER_PROFILE.avatar}" class="w-11 h-11 rounded-full object-cover ring-2 ring-secondary-container" alt="Minh Thư" />
            <div>
              <div class="font-bold text-sm text-on-surface">${Data.USER_PROFILE.name}</div>
              <div class="text-xs text-tertiary font-semibold">${Data.USER_PROFILE.school}</div>
            </div>
          </div>
          <div class="p-2 flex flex-col gap-0.5 text-sm">
            <a href="/roomie/tim-roommate" class="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-container-low text-on-surface">
              <span>Hồ sơ & Kết quả Match</span>
              <span class="text-xs text-primary font-semibold">42</span>
            </a>
            <a href="/roomie/tim-phong?saved=1" class="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-container-low text-on-surface">
              <span>Phòng đã lưu</span>
              <span class="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-xs font-bold">${savedCount}</span>
            </a>
            <a href="/roomie/dang-tin" class="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-container-low text-on-surface">
              <span>Tin đăng của tôi</span>
              <span class="text-xs text-on-surface-variant font-semibold">${customCount}</span>
            </a>
            <a href="/roomie/trac-nghiem" class="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-container-low text-on-surface">
              <span>Làm lại bài test hợp gu</span>
              <span class="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            </a>
            <a href="/roomie/an-toan" class="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-container-low text-on-surface">
              <span>Cẩm nang an toàn sinh viên</span>
              <span class="material-symbols-outlined text-[16px] text-outline">shield</span>
            </a>
          </div>
        `;
        document.body.appendChild(pop);
        setTimeout(() => {
          document.addEventListener(
            "click",
            function handler(ev) {
              if (!pop.contains(ev.target)) {
                pop.remove();
                document.removeEventListener("click", handler);
              }
            },
            true
          );
        }, 10);
      });
    }
  }

  // -------------------- Page: Home --------------------
  function initHeroCursorMotion() {
    const hero = document.getElementById("hero-stage");
    const centerpiece = document.getElementById("hero-centerpiece");
    if (!hero || !centerpiece) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (prefersReduced || !finePointer) return;

    const displayWord = document.getElementById("hero-display-text");
    const leftCard = document.getElementById("hero-left-card");
    const floatingCard = document.getElementById("hero-floating-card");
    const spotlight = document.getElementById("hero-spotlight");

    let targetX = 0;
    let targetY = 0;
    let targetActive = 0;
    let currentX = 0;
    let currentY = 0;
    let currentActive = 0;
    let rafId = null;
    let lastTime = 0;

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    function render(now) {
      if (!lastTime) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Frame-rate independent smooth damping (~60Hz/120Hz consistent)
      const ease = 1 - Math.exp(-8.5 * dt);
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      currentActive += (targetActive - currentActive) * ease;

      const tx = currentX * 28;
      const ty = currentY * 18;
      const rotY = currentX * 7.5;
      const rotX = -currentY * 5.5;
      const scale = 1 + currentActive * 0.018;

      centerpiece.style.transform =
        `perspective(1200px) translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) ` +
        `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(4)})`;

      if (displayWord) {
        displayWord.style.transform = `translate3d(${(currentX * -12).toFixed(2)}px, ${(currentY * -8).toFixed(2)}px, 0)`;
      }
      if (leftCard) {
        leftCard.style.transform = `translate3d(${(currentX * 8).toFixed(2)}px, ${(currentY * 6).toFixed(2)}px, 0)`;
      }
      if (floatingCard) {
        floatingCard.style.transform = `translate3d(${(currentX * 8).toFixed(2)}px, ${(currentY * 6).toFixed(2)}px, 0)`;
      }
      if (spotlight) {
        spotlight.style.transform = `translate3d(calc(-50% + ${(currentX * 36).toFixed(2)}px), calc(-25% + ${(currentY * 24).toFixed(2)}px), 0)`;
      }

      const settled =
        Math.abs(targetX - currentX) < 0.0008 &&
        Math.abs(targetY - currentY) < 0.0008 &&
        Math.abs(targetActive - currentActive) < 0.0008;

      if (settled) {
        rafId = null;
        lastTime = 0;
      } else {
        rafId = requestAnimationFrame(render);
      }
    }

    function ensureLoop() {
      if (!rafId) {
        lastTime = 0;
        rafId = requestAnimationFrame(render);
      }
    }

    window.addEventListener("mousemove", (e) => {
      const rect = hero.getBoundingClientRect();
      // Only track while hero is in view and cursor is within hero/header band
      if (rect.bottom <= 0 || e.clientY > rect.bottom + 80) {
        if (targetX !== 0 || targetY !== 0 || targetActive !== 0) {
          targetX = 0;
          targetY = 0;
          targetActive = 0;
          ensureLoop();
        }
        return;
      }
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetX = clamp((e.clientX - cx) / (rect.width * 0.5), -1, 1);
      targetY = clamp((e.clientY - cy) / (rect.height * 0.5), -1, 1);
      targetActive = 1;
      ensureLoop();
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
      targetX = 0;
      targetY = 0;
      targetActive = 0;
      ensureLoop();
    });
  }

  function initHeroStatCounters() {
    const counters = Array.from(document.querySelectorAll("[data-count-target]"));
    if (!counters.length) return;

    const formatStat = (val, el) => {
      const prefix = el.dataset.countPrefix || "";
      const suffix = el.dataset.countSuffix || "";
      const numStr = el.dataset.countLocale === "vi" ? val.toLocaleString("vi-VN") : String(val);
      return `${prefix}${numStr}${suffix}`;
    };

    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      counters.forEach((el) => {
        el.textContent = formatStat(Number(el.dataset.countTarget) || 0, el);
      });
      return;
    }

    counters.forEach((el) => {
      el.textContent = formatStat(0, el);
    });

    const animateCounter = (el) => {
      if (el.dataset.countDone === "1") return;
      el.dataset.countDone = "1";

      const target = Number(el.dataset.countTarget) || 0;
      const duration = 800;
      const startTime = performance.now();
      el.textContent = formatStat(0, el);

      const step = (now) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        el.textContent = formatStat(current, el);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = formatStat(target, el);
        }
      };

      window.requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      counters.forEach((el) => observer.observe(el));
    } else {
      counters.forEach(animateCounter);
    }
  }

  function createGraphemeSplitter() {
    if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
      const segmenter = new Intl.Segmenter("vi", { granularity: "grapheme" });
      return (word) => Array.from(segmenter.segment(word), (s) => s.segment);
    }
    return (word) => Array.from(word);
  }

  function splitElementIntoScrollChars(rootEl, options = {}) {
    if (!rootEl) return { chars: [], words: [] };
    if (rootEl.dataset.rmSplit === "1") {
      return {
        chars: Array.from(rootEl.querySelectorAll(".rm-scroll-char")),
        words: Array.from(rootEl.querySelectorAll(".rm-scroll-word")),
      };
    }

    const wrapWords = options.wrapWords !== false;
    const splitGraphemes = createGraphemeSplitter();
    const chars = [];
    const words = [];

    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue || "";
        if (!text.trim()) return;
        const frag = document.createDocumentFragment();
        const parts = text.split(/(\s+)/);
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
            return;
          }
          const targetParent = wrapWords ? document.createElement("span") : frag;
          if (wrapWords) {
            targetParent.className = "rm-scroll-word";
            words.push(targetParent);
          }
          splitGraphemes(part).forEach((g) => {
            const chSpan = document.createElement("span");
            chSpan.className = "rm-scroll-char";
            chSpan.textContent = g;
            chars.push(chSpan);
            targetParent.appendChild(chSpan);
          });
          if (wrapWords) {
            frag.appendChild(targetParent);
          }
        });
        node.parentNode.replaceChild(frag, node);
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList.contains("material-symbols-outlined")) return;
        if (node.getAttribute("aria-hidden") === "true" && node.tagName === "svg") return;
        Array.from(node.childNodes).forEach(walk);
      }
    };

    walk(rootEl);
    rootEl.dataset.rmSplit = "1";
    return { chars, words };
  }

  function applyCharOpacityWave(chars, progress, baseOpacity, windowWidth) {
    const count = chars.length;
    if (!count) return;
    if (progress >= 0.999) {
      chars.forEach((ch) => {
        if (ch.style.opacity !== "") ch.style.opacity = "";
      });
      return;
    }

    const spanWin = count <= 1 ? 1 : Math.max(0.18, windowWidth);
    const travel = Math.max(0.001, 1 - spanWin);
    for (let i = 0; i < count; i += 1) {
      const start = count <= 1 ? 0 : (i / (count - 1)) * travel;
      const local = Math.min(1, Math.max(0, (progress - start) / spanWin));
      const eased = 1 - Math.pow(1 - local, 2);
      chars[i].style.opacity = (baseOpacity + (1 - baseOpacity) * eased).toFixed(3);
    }
  }

  function applyWordRise(words, progress, startY, windowWidth) {
    const count = words.length;
    if (!count) return;
    if (progress >= 0.999) {
      words.forEach((w) => {
        if (w.style.transform !== "") w.style.transform = "";
      });
      return;
    }

    const spanWin = count <= 1 ? 1 : Math.max(0.28, windowWidth);
    const travel = Math.max(0.001, 1 - spanWin);
    for (let i = 0; i < count; i += 1) {
      const start = count <= 1 ? 0 : (i / (count - 1)) * travel;
      const local = Math.min(1, Math.max(0, (progress - start) / spanWin));
      const eased = 1 - Math.pow(1 - local, 3);
      const y = startY * (1 - eased);
      words[i].style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    }
  }

  function createTextTrack(el, cfg) {
    if (!el) return null;
    const { chars, words } = splitElementIntoScrollChars(el, { wrapWords: cfg.wrapWords !== false });
    if (!chars.length) return null;
    return {
      chars,
      words,
      riseEl: cfg.riseEl || null,
      delay: cfg.delay ?? 0,
      span: cfg.span ?? 0.65,
      baseOpacity: cfg.baseOpacity ?? 0.14,
      windowWidth: cfg.windowWidth ?? 0.3,
      startY: cfg.startY ?? 9,
    };
  }

  function buildFeaturedRoomsTracks(section) {
    const units = [];
    const header = document.getElementById("featured-rooms-header");
    if (header) {
      const h2 = header.querySelector("h2");
      const ctaText = header.querySelector("a > span:not(.material-symbols-outlined)");
      const ctaLink = header.querySelector("a[data-path]");
      units.push({
        anchorEl: header,
        startVh: 0.94,
        endVh: 0.44,
        delay: 0,
        tracks: [
          createTextTrack(h2, { delay: 0, span: 0.72, baseOpacity: 0.14, startY: 11, windowWidth: 0.34 }),
          createTextTrack(ctaText, { wrapWords: false, riseEl: ctaLink, delay: 0.28, span: 0.62, baseOpacity: 0.18, startY: 7, windowWidth: 0.32 }),
        ].filter(Boolean),
        fades: [],
      });
    }

    const cards = Array.from(section.querySelectorAll("article"));
    cards.forEach((card, idx) => {
      const locSpan = card.querySelector(".text-tertiary > span:not(.material-symbols-outlined)");
      const h3 = card.querySelector("h3");
      const specText = card.querySelector("p > span.truncate");
      const specRow = specText ? specText.parentElement : null;
      const priceVal = card.querySelector(".font-currency-md");
      const priceUnit = priceVal ? priceVal.nextElementSibling : null;
      const priceRow = priceVal ? priceVal.parentElement : null;
      const pills = Array.from(card.querySelectorAll(".absolute.top-3\\.5.left-3\\.5 > span"));

      units.push({
        anchorEl: card,
        cardEl: card,
        cardIdx: idx,
        startVh: 0.96,
        endVh: 0.48,
        tracks: [
          createTextTrack(locSpan, { delay: 0.06, span: 0.56, baseOpacity: 0.16, startY: 7, windowWidth: 0.3 }),
          createTextTrack(h3, { wrapWords: false, riseEl: h3, delay: 0.14, span: 0.62, baseOpacity: 0.14, startY: 8, windowWidth: 0.32 }),
          createTextTrack(specText, { wrapWords: false, riseEl: specRow, delay: 0.24, span: 0.62, baseOpacity: 0.16, startY: 7, windowWidth: 0.3 }),
          createTextTrack(priceVal, { wrapWords: false, riseEl: priceRow, delay: 0.34, span: 0.52, baseOpacity: 0.16, startY: 6, windowWidth: 0.28 }),
          createTextTrack(priceUnit, { wrapWords: false, delay: 0.44, span: 0.46, baseOpacity: 0.18, windowWidth: 0.28 }),
        ].filter(Boolean),
        fades: pills.map((p, pIdx) => ({ el: p, delay: 0.1 + pIdx * 0.08, span: 0.48, baseOpacity: 0.35, startY: 5 })),
      });
    });

    return units;
  }

  function buildRoommateMatchesTracks(section) {
    const units = [];
    const inner = section.querySelector(":scope > div");
    const header = inner ? inner.firstElementChild : null;
    if (header) {
      const h2 = header.querySelector("h2");
      const subtitle = header.querySelector("p");
      const ctaText = header.querySelector("a > span:not(.material-symbols-outlined)");
      const ctaLink = header.querySelector("a[data-path]");
      units.push({
        anchorEl: header,
        startVh: 0.94,
        endVh: 0.44,
        delay: 0,
        tracks: [
          createTextTrack(h2, { delay: 0, span: 0.68, baseOpacity: 0.14, startY: 11, windowWidth: 0.34 }),
          createTextTrack(subtitle, { delay: 0.14, span: 0.72, baseOpacity: 0.16, startY: 8, windowWidth: 0.3 }),
          createTextTrack(ctaText, { wrapWords: false, riseEl: ctaLink, delay: 0.28, span: 0.62, baseOpacity: 0.18, startY: 7, windowWidth: 0.32 }),
        ].filter(Boolean),
        fades: [],
      });
    }

    const cardUnits = [];
    const cards = Array.from(section.querySelectorAll(".grid > div"));
    cards.forEach((card, idx) => {
      const nameEl = card.querySelector("h3");
      const uniEl = card.querySelector("h3 + span");
      const bioEl = card.querySelector("p");
      const chips = Array.from(card.querySelectorAll(".flex-wrap > span"));
      const badgeCol = card.querySelector(".flex.flex-col.items-end.gap-1\\.5");
      const actionWrap = card.querySelector(".pt-1");

      const tracks = [
        createTextTrack(nameEl, { wrapWords: false, riseEl: nameEl, delay: 0.08, span: 0.56, baseOpacity: 0.14, startY: 8, windowWidth: 0.34 }),
        createTextTrack(uniEl, { wrapWords: false, riseEl: uniEl, delay: 0.16, span: 0.56, baseOpacity: 0.16, startY: 6, windowWidth: 0.3 }),
        createTextTrack(bioEl, { delay: 0.22, span: 0.64, baseOpacity: 0.15, startY: 8, windowWidth: 0.32 }),
        ...chips.map((chip, cIdx) =>
          createTextTrack(chip, { wrapWords: false, riseEl: chip, delay: 0.36 + cIdx * 0.08, span: 0.48, baseOpacity: 0.18, startY: 6, windowWidth: 0.3 })
        ),
      ].filter(Boolean);

      const fades = [
        badgeCol ? { el: badgeCol, delay: 0.14, span: 0.5, baseOpacity: 0.32, startY: 6 } : null,
        actionWrap ? { el: actionWrap, delay: 0.42, span: 0.5, baseOpacity: 0.42, startY: 8 } : null,
      ].filter(Boolean);

      const unit = {
        anchorEl: card,
        cardEl: card,
        cardIdx: idx,
        startVh: 0.96,
        endVh: 0.48,
        tracks,
        fades,
      };
      cardUnits.push(unit);
      units.push(unit);
    });

    const banner = inner ? inner.lastElementChild : null;
    if (banner && banner.contains(banner.querySelector(".material-symbols-outlined"))) {
      const bannerText = banner.querySelector("span:not(.material-symbols-outlined)");
      units.push({
        anchorEl: banner,
        startVh: 0.99,
        endVh: 0.84,
        companionUnits: cardUnits,
        tracks: [
          createTextTrack(bannerText, { delay: 0.05, span: 0.85, baseOpacity: 0.16, startY: 6, windowWidth: 0.32 }),
        ].filter(Boolean),
        fades: [],
      });
    }

    return units;
  }

  function initEditorialSectionsScrollReveal() {
    const featuredSection = document.getElementById("featured-rooms");
    const roommateSection = document.getElementById("roommate-matches");
    if (!featuredSection && !roommateSection) return;

    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const units = [
      ...(featuredSection ? buildFeaturedRoomsTracks(featuredSection) : []),
      ...(roommateSection ? buildRoommateMatchesTracks(roommateSection) : []),
    ];
    if (!units.length) return;

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const getColumns = () => {
      const w = window.innerWidth || 1280;
      if (w >= 1024) return 4;
      if (w >= 768) return 2;
      return 1;
    };

    const computeRawTarget = (unit, vh, cols) => {
      const rect = unit.anchorEl.getBoundingClientRect();
      const startY = vh * unit.startVh;
      const endY = vh * unit.endVh;
      const raw = clamp((startY - rect.top) / Math.max(1, startY - endY), 0, 1);
      const colStagger = typeof unit.cardIdx === "number" && cols > 1 ? (unit.cardIdx % cols) * 0.055 : 0;
      let progress = colStagger > 0 ? clamp((raw - colStagger) / (1 - colStagger), 0, 1) : raw;

      if (unit.companionUnits && unit.companionUnits.length && rect.top < vh * 0.99) {
        const lastCardsReady = unit.companionUnits.reduce((acc, cu) => Math.min(acc, cu.target), 1);
        if (lastCardsReady > progress) {
          progress = Math.max(progress, clamp((lastCardsReady - 0.6) / 0.4, 0, 1));
        }
      }
      return progress;
    };

    const vhInit = window.innerHeight || 800;
    const colsInit = getColumns();
    units.forEach((u) => {
      u.target = computeRawTarget(u, vhInit, colsInit);
      u.current = u.target;
    });
    // Re-evaluate companion banners once all cards have initial target
    units.forEach((u) => {
      if (u.companionUnits) {
        u.target = computeRawTarget(u, vhInit, colsInit);
        u.current = u.target;
      }
    });

    const applyUnit = (u) => {
      const p = u.current;
      if (u.cardEl) {
        if (p >= 0.999) {
          if (u.cardEl.style.opacity !== "") u.cardEl.style.opacity = "";
          if (u.cardEl.style.transform !== "") u.cardEl.style.transform = "";
          if (u.cardEl.style.transitionProperty !== "") u.cardEl.style.transitionProperty = "";
        } else {
          const cardLift = easeOutCubic(clamp(p / 0.55, 0, 1));
          const cardOp = 0.58 + 0.42 * easeOutCubic(clamp(p / 0.45, 0, 1));
          const y = 20 * (1 - cardLift);
          u.cardEl.style.transitionProperty = "box-shadow";
          u.cardEl.style.opacity = cardOp.toFixed(3);
          u.cardEl.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
        }
      }

      u.tracks.forEach((t) => {
        const local = clamp((p - t.delay) / t.span, 0, 1);
        applyCharOpacityWave(t.chars, local, t.baseOpacity, t.windowWidth);
        applyWordRise(t.words, local, t.startY, 0.42);
        if (t.riseEl) {
          if (local >= 0.999) {
            if (t.riseEl.style.transform !== "") t.riseEl.style.transform = "";
          } else {
            const eased = easeOutCubic(local);
            const ry = t.startY * (1 - eased);
            t.riseEl.style.transform = `translate3d(0, ${ry.toFixed(2)}px, 0)`;
          }
        }
      });

      u.fades.forEach((f) => {
        const local = clamp((p - f.delay) / f.span, 0, 1);
        if (local >= 0.999) {
          if (f.el.style.opacity !== "") f.el.style.opacity = "";
          if (f.el.style.transform !== "") f.el.style.transform = "";
        } else {
          const eased = easeOutCubic(local);
          const y = f.startY * (1 - eased);
          f.el.style.opacity = (f.baseOpacity + (1 - f.baseOpacity) * eased).toFixed(3);
          f.el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
        }
      });
    };

    let rafId = null;
    const tick = () => {
      let moving = false;
      units.forEach((u) => {
        const diff = u.target - u.current;
        if (Math.abs(diff) < 0.0012) {
          if (u.current !== u.target) {
            u.current = u.target;
            applyUnit(u);
          }
        } else {
          u.current += diff * 0.22;
          applyUnit(u);
          moving = true;
        }
      });

      if (moving) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };

    const scheduleUpdate = () => {
      const vh = window.innerHeight || 800;
      const cols = getColumns();
      units.forEach((u) => {
        u.target = computeRawTarget(u, vh, cols);
      });
      if (!rafId) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    units.forEach(applyUnit);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
  }

  function initHomePage() {
    initHeroCursorMotion();
    initHeroStatCounters();
    initEditorialSectionsScrollReveal();

    // Quick search form -> redirect to /tim-phong with query params
    const form = document.querySelector("main form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const loc = document.getElementById("search-location")?.value || "";
        const budget = document.getElementById("search-budget")?.value || "";
        const type = document.getElementById("search-type")?.value || "";
        const params = new URLSearchParams();
        if (loc) params.set("area", loc);
        if (budget) params.set("budget", budget);
        if (type) params.set("type", type);
        window.location.href = `/roomie/tim-phong?${params.toString()}`;
      });
    }

    // Bookmark toggle for featured cards
    const saved = getSavedRoomIds();
    const cards = document.querySelectorAll("main article");
    cards.forEach((article, idx) => {
      const roomId = String(idx + 1);
      const btn = article.querySelector('button[aria-label="Lưu bài"]');
      if (btn) {
        const icon = btn.querySelector(".material-symbols-outlined");
        if (saved.includes(roomId) && icon) {
          icon.style.fontVariationSettings = "'FILL' 1";
          btn.classList.add("text-error");
        }
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const nowSaved = toggleSavedRoom(roomId);
          if (icon) {
            icon.style.fontVariationSettings = nowSaved ? "'FILL' 1" : "'FILL' 0";
            btn.classList.toggle("text-error", nowSaved);
          }
          showToast(nowSaved ? "Đã lưu phòng vào danh sách yêu thích!" : "Đã bỏ lưu phòng.", nowSaved ? "success" : "info");
        });
      }

      // Clickable card title/image -> detail
      const link = article.querySelector("a[data-path]");
      if (link) {
        const targetHref = link.getAttribute("href");
        const img = article.querySelector("img");
        const title = article.querySelector("h3");
        [img, title].forEach((el) => {
          if (el && targetHref) {
            el.classList.add("cursor-pointer");
            el.addEventListener("click", () => {
              window.location.href = targetHref;
            });
          }
        });
      }
    });

    // Roommate preview cards ("Xem hồ sơ" buttons)
    const homeRoommateMap = ["minh-anh", "quoc-bao", "thao-vy", "gia-huy"];
    const profileBtns = Array.from(document.querySelectorAll("main button")).filter(
      (b) => b.textContent.trim() === "Xem hồ sơ"
    );
    profileBtns.forEach((btn, idx) => {
      const rmId = homeRoommateMap[idx];
      const rm = (Data.ROOMMATES || []).find((r) => r.id === rmId);
      if (rm) {
        btn.addEventListener("click", () => openProfileModal(rm));
      }
    });

    // Services section billing toggle & plan selection
    const servicesSection = document.getElementById("services-preview");
    if (servicesSection) {
      let billingMode = "standard";
      const toggleBtns = Array.from(servicesSection.querySelectorAll("#service-billing-toggle button[data-billing]"));
      const priceEls = Array.from(servicesSection.querySelectorAll(".plan-price"));
      const activeToggleCls = ["bg-white", "text-on-surface", "shadow-xs", "font-semibold"];
      const inactiveToggleCls = ["text-on-surface-variant", "hover:text-on-surface", "font-medium"];

      const syncBillingToggle = () => {
        toggleBtns.forEach((b) => {
          const isActive = b.dataset.billing === billingMode;
          activeToggleCls.forEach((c) => b.classList.toggle(c, isActive));
          inactiveToggleCls.forEach((c) => b.classList.toggle(c, !isActive));
        });
        priceEls.forEach((el) => {
          const nextPrice = billingMode === "student" ? el.dataset.priceSv : el.dataset.priceStd;
          if (nextPrice) el.textContent = nextPrice;
        });
      };

      toggleBtns.forEach((b) => {
        b.addEventListener("click", () => {
          const nextMode = b.dataset.billing || "standard";
          if (nextMode === billingMode) return;
          billingMode = nextMode;
          syncBillingToggle();
        });
      });

      const planBtns = Array.from(servicesSection.querySelectorAll(".plan-select-btn[data-plan-id]"));
      planBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const pkgId = btn.dataset.planId;
          const pkg = (Data.PRICING_PACKAGES || []).find((p) => p.id === pkgId);
          if (!pkg) return;
          if (pkg.id === "basic") {
            showToast("Bạn đang sử dụng Gói Cơ bản (0đ) miễn phí!");
            return;
          }
          const cardPriceEl = btn.closest("div")?.querySelector(".plan-price");
          const activePrice = billingMode === "student" && cardPriceEl?.dataset.priceSv
            ? cardPriceEl.dataset.priceSv
            : pkg.price;
          const activePeriod = billingMode === "student"
            ? `${pkg.period} (Ưu đãi Sinh viên -20%)`
            : pkg.period;
          openPaymentModal({ ...pkg, price: activePrice, period: activePeriod });
        });
      });
    }
  }

  // -------------------- Page: Find Rooms --------------------
  function initFindRoomsPage() {
    const grid = document.getElementById("rooms-grid");
    if (!grid) return;

    const searchInput = document.getElementById("campus-search");
    const pricePills = document.querySelectorAll(".price-pill");
    const priceDisplay = document.getElementById("price-display");
    const areaCheckboxes = document.querySelectorAll(".area-checkbox");
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

    if (areaList) {
      const areaOptions = Array.from(areaList.querySelectorAll(".area-option"));
      areaOptions.sort((a, b) => {
        const countA = Number(a.querySelector(".area-option-count")?.textContent.trim()) || 0;
        const countB = Number(b.querySelector(".area-option-count")?.textContent.trim()) || 0;
        const nameA = a.querySelector(".area-option-name")?.textContent.trim() || "";
        const nameB = b.querySelector(".area-option-name")?.textContent.trim() || "";
        return countB - countA || nameA.localeCompare(nameB, "vi");
      });
      areaOptions.forEach((option) => areaList.appendChild(option));
    }

    const state = {
      search: "",
      priceRange: "all",
      areas: [],
      type: "all",
      amenities: [],
      sort: "newest",
      savedOnly: false,
      page: 1,
      perPage: 6
    };

    // Read query params from URL (e.g. from Homepage search or Footer links)
    const params = new URLSearchParams(window.location.search);
    if (params.get("area")) {
      const areaParam = params.get("area");
      const mapped = areaParam === "quan-5-10" ? ["quan-5", "quan-10"] : [areaParam];
      state.areas = mapped;
      areaCheckboxes.forEach((cb) => {
        cb.checked = mapped.includes(cb.value);
      });
    }
    if (params.get("budget")) {
      const b = params.get("budget");
      if (b === "1-2") state.priceRange = "1.5-2.5";
      else if (b === "2-3") state.priceRange = "1.5-2.5";
      else if (b === "3-4") state.priceRange = ">3.5";
    }
    if (params.get("type")) {
      const t = params.get("type");
      if (t === "shared") state.type = "o-ghep";
      else if (t === "private") state.type = "phong-rieng";
    }
    if (params.get("saved") === "1") {
      state.savedOnly = true;
    }

    function syncPillUI() {
      pricePills.forEach((pill) => {
        const val = pill.dataset.price;
        const active = state.priceRange === val;
        pill.className = active
          ? "price-pill py-1.5 rounded-lg text-center bg-primary text-on-primary text-label-sm font-label-sm font-semibold transition-all cursor-pointer"
          : "price-pill py-1.5 rounded-lg text-center bg-surface-container-low hover:bg-surface-container text-label-sm font-label-sm text-on-surface transition-all cursor-pointer";
      });
      if (priceDisplay) {
        const labels = {
          all: "Tất cả mức giá",
          "<1.5": "< 1.5tr/th",
          "1.5-2.5": "1.5 - 2.5tr/th",
          "2.5-3.5": "2.5 - 3.5tr/th",
          ">3.5": "> 3.5tr/th"
        };
        priceDisplay.textContent = labels[state.priceRange] || "Tất cả mức giá";
      }

      housingBtns.forEach((btn) => {
        const active = btn.dataset.type === state.type;
        btn.className = active
          ? "housing-type-btn px-3 py-1 rounded-full text-label-sm font-label-sm bg-primary text-on-primary cursor-pointer"
          : "housing-type-btn px-3 py-1 rounded-full text-label-sm font-label-sm bg-surface-container-low text-on-surface hover:bg-surface-container cursor-pointer";
      });
    }

    function filterRooms() {
      const all = getAllRooms();
      const saved = getSavedRoomIds();
      const q = state.search.trim().toLowerCase();

      let list = all.filter((r) => {
        if (state.savedOnly && !saved.includes(String(r.id))) return false;
        if (q) {
          const hay = `${r.title} ${r.shortTitle} ${r.address} ${r.districtLabel} ${r.distanceLabel}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (state.areas.length > 0 && !state.areas.includes(r.areaKey)) return false;
        if (state.type !== "all" && r.typeKey !== state.type) return false;
        if (state.priceRange === "<1.5" && r.price >= 1500000) return false;
        if (state.priceRange === "1.5-2.5" && (r.price < 1500000 || r.price > 2500000)) return false;
        if (state.priceRange === "2.5-3.5" && (r.price < 2500000 || r.price > 3500000)) return false;
        if (state.priceRange === ">3.5" && r.price <= 3500000) return false;

        if (state.amenities.length > 0) {
          const hasAll = state.amenities.every((am) => (r.amenities || []).includes(am));
          if (!hasAll) return false;
        }
        return true;
      });

      if (state.sort === "price-asc") {
        list = [...list].sort((a, b) => a.price - b.price);
      } else if (state.sort === "match-desc") {
        list = [...list].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      }
      return list;
    }

    function render() {
      syncPillUI();
      const filtered = filterRooms();
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / state.perPage));
      if (state.page > totalPages) state.page = 1;

      const start = (state.page - 1) * state.perPage;
      const pageItems = filtered.slice(start, start + state.perPage);
      const saved = getSavedRoomIds();

      if (countLabel) {
        countLabel.textContent = state.savedOnly
          ? `${total} phòng đã lưu`
          : `${total} phòng trọ phù hợp`;
      }
      if (rangeLabel) {
        rangeLabel.textContent =
          total === 0
            ? "0 phòng hiển thị"
            : `${start + 1} - ${start + pageItems.length} trên ${total} phòng`;
      }

      if (pageItems.length === 0) {
        grid.innerHTML = `
          <div class="md:col-span-2 bg-surface-container-lowest rounded-2xl p-10 text-center border border-surface-container flex flex-col items-center gap-3">
            <span class="material-symbols-outlined text-5xl text-outline">search_off</span>
            <h3 class="font-title-md text-title-md font-bold text-on-surface">Chưa có phòng khớp bộ lọc hiện tại</h3>
            <p class="text-sm text-on-surface-variant max-w-md">Hãy thử nới rộng khu vực hoặc nhấn Đặt lại bộ lọc để xem toàn bộ phòng trọ sinh viên TP.HCM.</p>
            <button type="button" id="rm-empty-reset" class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm">Đặt lại bộ lọc</button>
          </div>
        `;
        grid.querySelector("#rm-empty-reset")?.addEventListener("click", resetAll);
      } else {
        grid.innerHTML = pageItems
          .map((room) => {
            const isSaved = saved.includes(String(room.id));
            const cover = (room.images && room.images[0]) || FALLBACK_SVG;
            return `
              <article class="flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 group border border-surface-container">
                <div class="relative w-full aspect-[16/10] bg-surface-container overflow-hidden cursor-pointer" data-room-nav="${room.id}">
                  <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="${cover}" alt="${room.title}" />
                  <div class="absolute top-3 left-3 flex items-center gap-1.5">
                    <span class="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm font-medium">${room.shortAddress}</span>
                    ${room.isNewUserPost ? `<span class="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold">MỚI ĐĂNG</span>` : ""}
                  </div>
                  <button aria-label="Lưu tin" data-save-room="${room.id}" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/85 backdrop-blur-md ${
                    isSaved ? "text-error" : "text-on-surface"
                  } hover:text-error flex items-center justify-center shadow-xs transition-colors" type="button">
                    <span class="material-symbols-outlined text-body-lg" style="font-variation-settings: 'FILL' ${isSaved ? 1 : 0};">favorite</span>
                  </button>
                </div>
                <div class="p-space-md flex flex-col justify-between gap-3 flex-1">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center justify-between text-body-sm text-on-surface-variant font-normal">
                      <span>${room.areaSqm}m² · ${room.spotsLabel}</span>
                      <span class="text-tertiary font-medium">${room.typeLabel}</span>
                    </div>
                    <h2 data-room-nav="${room.id}" class="font-title-md text-title-md text-on-surface font-semibold group-hover:text-primary transition-colors line-clamp-1 cursor-pointer">${room.title}</h2>
                  </div>
                  <div class="pt-2 border-t border-surface-container flex items-center justify-between">
                    <span class="font-currency-md text-title-md text-primary font-bold">${room.priceFormatted}<span class="text-xs font-normal text-on-surface-variant">${isPrivateRoom(room) ? "/tháng" : "/tháng/người"}</span></span>
                    <a href="/roomie/phong-chi-tiet?id=${room.id}" class="px-3 py-1 rounded-lg text-primary hover:bg-primary/5 font-label-sm font-semibold transition-colors flex items-center gap-0.5">
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
            img.src = FALLBACK_SVG;
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
            const nowSaved = toggleSavedRoom(btn.dataset.saveRoom);
            const icon = btn.querySelector(".material-symbols-outlined");
            btn.classList.toggle("text-error", nowSaved);
            if (icon) icon.style.fontVariationSettings = nowSaved ? "'FILL' 1" : "'FILL' 0";
            showToast(nowSaved ? "Đã lưu tin phòng trọ!" : "Đã bỏ lưu tin.", nowSaved ? "success" : "info");
          });
        });
      }

      if (paginationEl) {
        paginationEl.innerHTML = Array.from({ length: totalPages }, (_, i) => i + 1)
          .map(
            (p) => `<button type="button" data-page="${p}" class="w-8 h-8 rounded-lg font-label-sm text-label-sm ${
              p === state.page
                ? "bg-primary text-on-primary font-semibold"
                : "text-on-surface-variant hover:bg-surface-container-low"
            }">${p}</button>`
          )
          .join("");

        paginationEl.querySelectorAll("button").forEach((b) => {
          b.addEventListener("click", () => {
            state.page = Number(b.dataset.page);
            render();
            window.scrollTo({ top: 180, behavior: "smooth" });
          });
        });
      }
    }

    function resetAll() {
      state.search = "";
      state.priceRange = "all";
      state.areas = [];
      state.type = "all";
      state.amenities = [];
      state.savedOnly = false;
      state.page = 1;
      if (searchInput) searchInput.value = "";
      areaCheckboxes.forEach((cb) => (cb.checked = false));
      amenityCheckboxes.forEach((cb) => (cb.checked = false));
      render();
      showToast("Đã đặt lại toàn bộ bộ lọc.", "info");
    }

    searchInput?.addEventListener("input", () => {
      state.search = searchInput.value;
      state.page = 1;
      render();
    });

    pricePills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const val = pill.dataset.price;
        state.priceRange = state.priceRange === val ? "all" : val;
        state.page = 1;
        render();
      });
    });

    areaCheckboxes.forEach((cb) => {
      cb.addEventListener("change", () => {
        state.areas = Array.from(areaCheckboxes)
          .filter((x) => x.checked)
          .map((x) => x.value);
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
        state.amenities = Array.from(amenityCheckboxes)
          .filter((x) => x.checked)
          .map((x) => x.value);
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
      render();
      if (toast) {
        toast.classList.remove("hidden");
        setTimeout(() => toast.classList.add("hidden"), 3500);
      }
    });

    render();
  }

  // -------------------- Page: Room Detail --------------------
  function initRoomDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || "1";
    const rooms = getAllRooms();
    const room = rooms.find((r) => String(r.id) === String(id)) || rooms[0];
    if (!room) return;

    if (room.roommate) {
      saveChatContact({
        name: room.roommate.name,
        meta: room.roommate.bioTitle || room.districtLabel,
        avatar: room.roommate.avatar,
        roomId: room.id,
        activityType: "viewed"
      });
    }

    const setText = (idName, value) => {
      const el = document.getElementById(idName);
      if (el && value !== undefined && value !== null) el.textContent = value;
    };

    setText("rd-breadcrumb-district", room.districtLabel);
    setText("rd-breadcrumb-title", room.breadcrumbTitle || room.shortTitle);
    setText("rd-spots-badge", room.spotsLabel);
    setText("rd-school-badge", room.schoolDistanceBadge || room.distanceLabel);
    setText("rd-title", room.title);
    const isPrivate = isPrivateRoom(room);
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
      if (rmImg && room.roommate.avatar) rmImg.src = room.roommate.avatar;
      if (posterImg && room.roommate.avatar) posterImg.src = room.roommate.avatar;
    }

    if (room.description && room.description.length) {
      const descBox = document.getElementById("rd-description");
      if (descBox) {
        descBox.innerHTML = room.description.map((p) => `<p>${p}</p>`).join("");
      }
    }

    if (room.images && room.images.length) {
      const heroImg = document.getElementById("rd-gallery-hero");
      if (heroImg) heroImg.src = room.images[0];
      const subImgs = document.querySelectorAll(".rd-gallery-sub");
      subImgs.forEach((img, idx) => {
        if (room.images[idx + 1]) img.src = room.images[idx + 1];
      });
    }

    // Bookmark toggle synced with localStorage
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
      updateBookmarkUI(getSavedRoomIds().includes(String(room.id)));
      bookmarkBtn.addEventListener("click", () => {
        const nowSaved = toggleSavedRoom(room.id);
        updateBookmarkUI(nowSaved);
        showToast(nowSaved ? "Đã lưu tin phòng trọ!" : "Đã bỏ lưu tin.", nowSaved ? "success" : "info");
      });
    }

    // Visit type toggle
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

    // Share & Report & Gallery
    document.getElementById("rd-share-btn")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Đã sao chép link phòng trọ!");
      } catch {
        showToast("Link phòng: " + window.location.href, "info");
      }
    });

    document.getElementById("rd-report-btn")?.addEventListener("click", () => {
      openReportModal(room.title);
    });

    document.getElementById("rd-gallery-open-btn")?.addEventListener("click", () => {
      openGalleryModal(room.images, room.title);
    });

    document.getElementById("rd-chat-btn")?.addEventListener("click", () => {
      const date = document.getElementById("visitDate")?.value || "";
      const time = document.getElementById("visitTime")?.value || "";
      const preset = `Chào ${room.roommate?.name || "bạn"}, mình muốn hẹn ${visitMode.toLowerCase()} phòng "${room.shortTitle}" vào ngày ${date} lúc ${time}.`;
      openChatModal(room.roommate?.name || "Chủ phòng", room.roommate?.bioTitle || room.districtLabel, preset);
    });

    document.getElementById("test-hop-gu")?.addEventListener("click", () => {
      window.location.href = "/roomie/trac-nghiem";
    });

    document.getElementById("rd-support-btn")?.addEventListener("click", (e) => {
      e.preventDefault();
      openChatModal("CLB Hỗ trợ Sinh viên HCMUS", "Tư vấn hợp đồng & xem phòng miễn phí", "Mình cần hỗ trợ rà soát hợp đồng thuê trọ trước khi đặt cọc.");
    });
  }

  // -------------------- Page: Quiz (8 Interactive Questions) --------------------
  function initQuizPage() {
    const questions = Data.QUIZ_QUESTIONS || [];
    if (!questions.length) return;

    const savedAnswers = readJSON(STORAGE_KEYS.QUIZ_ANSWERS, {});
    let currentIdx = 0; // Start at Q1 (0-based)

    const qNumBadge = document.getElementById("quiz-q-num-badge");
    const qCounterText = document.getElementById("quiz-q-counter");
    const qPercentText = document.getElementById("quiz-q-percent");
    const qTimeLeftText = document.getElementById("quiz-time-left");
    const progressFill = document.getElementById("quiz-progress-fill");
    const pillarCards = document.querySelectorAll(".quiz-pillar-card");
    const badgeEl = document.getElementById("quiz-q-badge");
    const weightEl = document.getElementById("quiz-q-weight");
    const titleEl = document.getElementById("quiz-q-title");
    const subtitleEl = document.getElementById("quiz-q-subtitle");
    const optionsGrid = document.getElementById("quiz-options-grid");
    const prevBtn = document.getElementById("quiz-prev-btn");
    const skipBtn = document.getElementById("quiz-skip-btn");
    const saveBtn = document.getElementById("save-continue-btn");
    const finishBannerBtn = document.getElementById("quiz-finish-now-btn");

    const previewScores = [
      { id: "hoang-nam", el: document.getElementById("preview-score-0"), base: 90 },
      { id: "minh-anh", el: document.getElementById("preview-score-1"), base: 88 },
      { id: "quoc-bao", el: document.getElementById("preview-score-2"), base: 85 }
    ];

    function updatePreviewPredictions() {
      const answeredCount = Object.keys(savedAnswers).length;
      const aCount = Object.values(savedAnswers).filter((v) => v === "A").length;
      const bCount = Object.values(savedAnswers).filter((v) => v === "B").length;

      previewScores.forEach((p, i) => {
        if (!p.el) return;
        const delta = ((aCount * 2 + bCount + answeredCount - i) % 8);
        const val = Math.min(99, p.base + delta);
        p.el.textContent = `${val}%`;
      });
    }

    function finishQuiz() {
      const answeredVals = Object.values(savedAnswers);
      const isNightOwl = savedAnswers[1] === "C" || savedAnswers[1] === "D";
      const isNeat = savedAnswers[4] === "A" || savedAnswers[4] === "B" || !savedAnswers[4];

      const result = {
        archetype: isNightOwl
          ? '"Kỷ Luật Tự Do - Cú Đêm Tri Thức"'
          : isNeat
          ? '"Ngăn Nắp Văn Minh - Học Tập Tập Trung"'
          : '"Linh Hoạt Hòa Nhã - Sống Chung Bình Yên"',
        matchCount: 42,
        pillars: {
          sleep: savedAnswers[1] ? 95 : 90,
          clean: savedAnswers[4] === "A" ? 96 : 92,
          guests: savedAnswers[6] === "A" ? 91 : 88,
          finance: savedAnswers[8] === "A" ? 98 : 94
        },
        answeredCount: answeredVals.length,
        completedAt: new Date().toISOString()
      };
      writeJSON(STORAGE_KEYS.QUIZ_RESULT, result);
      showToast("Hoàn tất 8/8 câu hỏi! Đang mở danh sách Roommate hợp gu...");
      setTimeout(() => {
        window.location.href = "/roomie/tim-roommate?from=quiz";
      }, 450);
    }

    function renderQuestion() {
      const q = questions[currentIdx];
      const pct = Math.round(((currentIdx + 1) / questions.length) * 100);
      const minsLeft = Math.max(0.5, ((questions.length - currentIdx) * 0.35)).toFixed(1).replace(".0", "");

      if (qNumBadge) qNumBadge.textContent = String(q.number);
      if (qCounterText) qCounterText.textContent = `Câu ${q.number} / ${questions.length}`;
      if (qPercentText) qPercentText.textContent = `Hoàn thành ${pct}%`;
      if (qTimeLeftText) qTimeLeftText.textContent = `Còn lại khoảng ${minsLeft} phút`;
      if (progressFill) progressFill.style.width = `${pct}%`;

      if (badgeEl) badgeEl.textContent = q.badgeText;
      if (weightEl) weightEl.textContent = q.weightText;
      if (titleEl) titleEl.textContent = q.title;
      if (subtitleEl) subtitleEl.textContent = q.subtitle;

      // Update 4 pillar cards
      pillarCards.forEach((card, pIdx) => {
        const statusLabel = card.querySelector(".quiz-pillar-status");
        const iconWrap = card.querySelector(".quiz-pillar-icon");
        card.classList.remove("bg-primary-fixed/40", "bg-surface-container-low", "bg-surface-container-lowest", "opacity-75");
        if (pIdx < q.pillarIndex) {
          card.classList.add("bg-surface-container-low");
          if (statusLabel) {
            statusLabel.textContent = `Phần ${pIdx + 1} • Đã xong`;
            statusLabel.className = "quiz-pillar-status font-label-sm text-label-sm text-tertiary font-bold truncate";
          }
          if (iconWrap) {
            iconWrap.className = "quiz-pillar-icon w-8 h-8 rounded-lg bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center flex-shrink-0";
          }
        } else if (pIdx === q.pillarIndex) {
          card.classList.add("bg-primary-fixed/40");
          if (statusLabel) {
            statusLabel.textContent = `Phần ${pIdx + 1} • Đang trả lời`;
            statusLabel.className = "quiz-pillar-status font-label-sm text-label-sm text-primary font-bold truncate";
          }
          if (iconWrap) {
            iconWrap.className = "quiz-pillar-icon w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center flex-shrink-0 shadow-sm";
          }
        } else {
          card.classList.add("bg-surface-container-lowest", "opacity-75");
          if (statusLabel) {
            statusLabel.textContent = `Phần ${pIdx + 1} • Kế tiếp`;
            statusLabel.className = "quiz-pillar-status font-label-sm text-label-sm text-on-surface-variant font-medium truncate";
          }
          if (iconWrap) {
            iconWrap.className = "quiz-pillar-icon w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center flex-shrink-0";
          }
        }
      });

      const selectedKey = savedAnswers[q.number] || "A";
      if (optionsGrid) {
        optionsGrid.innerHTML = q.options
          .map((opt) => {
            const active = opt.key === selectedKey;
            return `
              <div class="quiz-option cursor-pointer rounded-2xl p-space-lg ${
                active ? "bg-[#f4f5fb] shadow-md ring-2 ring-primary/30" : "bg-surface-container-low hover:bg-surface-container"
              } transition-all duration-200 relative group flex flex-col justify-between" data-option="${opt.key}">
                <div class="flex items-start justify-between gap-space-sm mb-space-sm">
                  <div class="w-12 h-12 rounded-xl ${
                    active ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container-highest text-on-surface group-hover:bg-primary-fixed group-hover:text-primary"
                  } flex items-center justify-center flex-shrink-0 transition-colors">
                    <span class="material-symbols-outlined text-[24px]">${opt.icon}</span>
                  </div>
                  <div class="option-check w-7 h-7 rounded-full ${
                    active ? "bg-primary text-on-primary" : "bg-surface-variant text-transparent group-hover:text-outline-variant"
                  } flex items-center justify-center">
                    <span class="material-symbols-outlined text-[18px]">check</span>
                  </div>
                </div>
                <div>
                  <div class="flex items-center gap-space-xs mb-1">
                    <span class="font-label-md text-label-md ${active ? "text-primary font-bold" : "text-outline font-semibold"}">Lựa chọn ${opt.key}</span>
                    ${
                      opt.popular
                        ? `<span class="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">Phổ biến ${opt.popular}</span>`
                        : ""
                    }
                  </div>
                  <h3 class="font-title-md text-title-md text-on-surface font-bold mb-space-xs group-hover:text-primary transition-colors">${opt.title}</h3>
                  <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">${opt.desc}</p>
                </div>
              </div>
            `;
          })
          .join("");

        optionsGrid.querySelectorAll(".quiz-option").forEach((card) => {
          card.addEventListener("click", () => {
            savedAnswers[q.number] = card.dataset.option;
            writeJSON(STORAGE_KEYS.QUIZ_ANSWERS, savedAnswers);
            updatePreviewPredictions();
            renderQuestion();
          });
        });
      }

      if (prevBtn) {
        prevBtn.disabled = currentIdx === 0;
        prevBtn.classList.toggle("opacity-40", currentIdx === 0);
      }

      if (saveBtn) {
        const label = saveBtn.querySelector("span:first-child");
        if (label) {
          label.textContent =
            currentIdx === questions.length - 1 ? "Hoàn tất & Xem kết quả Match" : "Lưu & Tiếp tục";
        }
      }
      updatePreviewPredictions();
    }

    pillarCards.forEach((card, pIdx) => {
      card.classList.add("cursor-pointer");
      card.addEventListener("click", () => {
        currentIdx = pIdx * 2;
        renderQuestion();
      });
    });

    prevBtn?.addEventListener("click", () => {
      if (currentIdx > 0) {
        currentIdx -= 1;
        renderQuestion();
      }
    });

    skipBtn?.addEventListener("click", () => {
      if (currentIdx < questions.length - 1) {
        currentIdx += 1;
        renderQuestion();
      } else {
        finishQuiz();
      }
    });

    saveBtn?.addEventListener("click", () => {
      const q = questions[currentIdx];
      if (!savedAnswers[q.number]) {
        savedAnswers[q.number] = "A";
        writeJSON(STORAGE_KEYS.QUIZ_ANSWERS, savedAnswers);
      }
      if (currentIdx < questions.length - 1) {
        currentIdx += 1;
        renderQuestion();
      } else {
        finishQuiz();
      }
    });

    finishBannerBtn?.addEventListener("click", finishQuiz);

    // Wire preview profile links & contract PDF download
    const previewKeys = ["hoang-nam", "minh-anh", "quoc-bao"];
    document.querySelectorAll(".quiz-preview-profile-btn").forEach((btn, idx) => {
      const rm = (Data.ROOMMATES || []).find((r) => r.id === previewKeys[idx]);
      if (rm) btn.addEventListener("click", () => openProfileModal(rm));
    });

    document.getElementById("quiz-download-contract")?.addEventListener("click", openContractModal);

    renderQuestion();
  }

  // -------------------- Page: Match Results / Find Roommate --------------------
  function initMatchResultsPage() {
    const savedQuiz = readJSON(STORAGE_KEYS.QUIZ_RESULT, null);
    const hasQuizResult = Boolean(savedQuiz && savedQuiz.archetype && savedQuiz.pillars);
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
        const setPillar = (id, pct) => {
          const val = document.getElementById(`${id}-val`);
          const bar = document.getElementById(`${id}-bar`);
          if (val) val.textContent = `${pct}%`;
          if (bar) bar.style.width = `${pct}%`;
        };
        setPillar("mr-p1", savedQuiz.pillars.sleep);
        setPillar("mr-p2", savedQuiz.pillars.clean);
        setPillar("mr-p3", savedQuiz.pillars.guests);
        setPillar("mr-p4", savedQuiz.pillars.finance);
      }

      const matchCount = Number(savedQuiz.matchCount);
      if (Number.isFinite(matchCount)) {
        const matchCountEl = document.getElementById("mr-match-count");
        const connectionCountEl = document.getElementById("mr-connection-count");
        if (matchCountEl) matchCountEl.textContent = `${matchCount} bạn sinh viên`;
        if (connectionCountEl) connectionCountEl.textContent = String(matchCount);
      }
    } else {
      if (matchSectionEyebrow) matchSectionEyebrow.textContent = "Khám phá cộng đồng";
      if (matchSectionTitle) matchSectionTitle.textContent = "Các bạn cùng phòng nổi bật";
      if (matchSectionDescription) {
        matchSectionDescription.textContent =
          "Xem hồ sơ và thói quen sinh hoạt của các roommate đang tìm bạn ở ghép.";
      }
      if (roomRecommendationsTitle) roomRecommendationsTitle.textContent = "Phòng trọ đang tìm người ở cùng";
      if (roomRecommendationsDescription) {
        roomRecommendationsDescription.textContent =
          "Khám phá các phòng trọ có roommate đang tìm người dọn vào ở ngay.";
      }
    }

    const grid = document.getElementById("roommate-matches-grid");
    const loadMoreBtn = document.getElementById("mr-load-more-btn");
    const areaFilter = document.getElementById("mr-area-filter");
    const budgetFilter = document.getElementById("mr-budget-filter");
    const genderFilter = document.getElementById("mr-gender-filter");
    const tabBtns = document.querySelectorAll(".mr-tab-btn");

    const state = {
      tab: "all",
      area: "all",
      budget: "all",
      gender: "all",
      showAll: false
    };

    function renderMatches() {
      if (!grid) return;
      const invited = readJSON(STORAGE_KEYS.INVITED_ROOMMATES, []);
      let list = (Data.ROOMMATES || []).filter((rm) => {
        if (state.tab === "high" && rm.matchScore < 90) return false;
        if (state.tab === "vnu" && !rm.vnuMember) return false;
        if (state.tab === "has-room" && !rm.hasRoom) return false;
        if (state.area !== "all" && rm.areaKey !== state.area) return false;
        if (state.gender !== "all" && rm.gender !== state.gender) return false;
        return true;
      });

      const visible = state.showAll ? list : list.slice(0, 4);
      if (loadMoreBtn) {
        loadMoreBtn.classList.toggle("hidden", state.showAll || list.length <= 4);
      }

      if (visible.length === 0) {
        grid.innerHTML = `
          <div class="md:col-span-2 bg-surface-container-lowest rounded-2xl p-10 text-center shadow-sm">
            <span class="material-symbols-outlined text-5xl text-outline mb-2">person_search</span>
            <h3 class="font-title-md text-title-md font-bold text-on-surface mb-1">Chưa có ứng viên khớp bộ lọc</h3>
            <p class="text-sm text-on-surface-variant mb-4">Thử đổi khu vực hoặc chọn "Tất cả phù hợp" để xem toàn bộ hồ sơ.</p>
            <button type="button" id="mr-reset-filters" class="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold">Xem tất cả</button>
          </div>
        `;
        grid.querySelector("#mr-reset-filters")?.addEventListener("click", () => {
          state.tab = "all";
          state.area = "all";
          state.gender = "all";
          if (areaFilter) areaFilter.value = "all";
          if (genderFilter) genderFilter.value = "all";
          syncTabs();
          renderMatches();
        });
        return;
      }

      grid.innerHTML = visible
        .map((rm) => {
          const isInvited = invited.includes(rm.id);
          return `
            <article class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-space-lg relative overflow-hidden group">
              <div class="flex flex-col gap-space-md">
                <div class="flex items-start justify-between gap-space-sm">
                  <div class="flex items-center gap-space-md">
                    <div class="relative">
                      <img class="w-16 h-16 rounded-full object-cover" src="${rm.avatar}" alt="${rm.name}" />
                      <span class="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-sm text-[10px] font-bold">${rm.matchScore}%</span>
                    </div>
                    <div class="flex flex-col">
                      <div class="flex items-center gap-2">
                        <h3 class="font-title-md text-title-md font-bold text-on-surface group-hover:text-primary transition-colors">${rm.name}</h3>
                        <span class="font-body-sm text-body-sm text-on-surface-variant">· ${rm.age}t</span>
                      </div>
                      <span class="font-label-sm text-label-sm text-tertiary flex items-center gap-1 font-semibold">
                        <span class="material-symbols-outlined text-[14px]">school</span>
                        ${rm.school}
                      </span>
                      <span class="font-body-sm text-body-sm text-on-surface-variant">${rm.major}</span>
                    </div>
                  </div>
                  <span class="px-3 py-1.5 rounded-xl ${
                    rm.matchScore >= 95
                      ? "bg-secondary-container text-on-secondary-fixed-variant"
                      : "bg-surface-container text-on-surface"
                  } font-label-md text-label-md font-bold flex items-center gap-1 shrink-0">
                    ${rm.matchScore >= 95 ? `<span class="material-symbols-outlined text-[18px]">verified</span>` : ""}
                    ${rm.matchLabel}
                  </span>
                </div>

                <div class="p-3 rounded-xl ${
                  rm.hasRoom ? "bg-primary-fixed/40 text-on-primary-fixed-variant" : "bg-surface-container-low text-on-surface"
                } flex items-center gap-2 font-body-sm text-body-sm">
                  <span class="material-symbols-outlined text-[18px] ${rm.hasRoom ? "text-primary" : "text-tertiary"}">${
            rm.hasRoom ? "apartment" : "search"
          }</span>
                  <span><strong>${rm.roomStatusTitle}</strong> ${rm.roomStatusDetail}</span>
                </div>

                <div class="flex flex-col gap-space-xs">
                  <span class="font-label-sm text-label-sm text-outline uppercase font-semibold">Tiêu chí lối sống tương hợp:</span>
                  <div class="flex flex-wrap gap-1.5">
                    ${rm.criteria
                      .map(
                        (c) => `<span class="px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm flex items-center gap-1">
                          <span class="material-symbols-outlined text-tertiary text-[14px]">check</span>
                          ${c}
                        </span>`
                      )
                      .join("")}
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-space-xs pt-space-xs">
                <button type="button" data-chat-rm="${rm.id}" class="flex-1 py-2.5 px-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5">
                  <span class="material-symbols-outlined text-[18px]">chat</span>
                  Nhắn tin Zalo/Chat
                </button>
                <button type="button" data-invite-rm="${rm.id}" class="py-2.5 px-4 rounded-xl ${
                  isInvited
                    ? "bg-tertiary text-on-tertiary"
                    : "bg-secondary-container text-on-secondary-fixed-variant hover:bg-secondary-fixed"
                } font-label-md text-label-md font-semibold transition-colors flex items-center gap-1">
                  <span class="material-symbols-outlined text-[18px]">${isInvited ? "done_all" : "favorite"}</span>
                  ${isInvited ? "Đã mời" : "Mời ghép đôi"}
                </button>
                <button type="button" data-profile-rm="${rm.id}" class="p-2.5 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors" title="Xem hồ sơ chi tiết">
                  <span class="material-symbols-outlined text-[20px]">person</span>
                </button>
              </div>
            </article>
          `;
        })
        .join("");

      grid.querySelectorAll("[data-chat-rm]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const rm = Data.ROOMMATES.find((r) => r.id === btn.dataset.chatRm);
          if (rm) openChatModal(rm.shortName, `${rm.school} • ${rm.matchScore}% Hợp gu`);
        });
      });

      grid.querySelectorAll("[data-invite-rm]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const rm = Data.ROOMMATES.find((r) => r.id === btn.dataset.inviteRm);
          if (!rm) return;
          const current = readJSON(STORAGE_KEYS.INVITED_ROOMMATES, []);
          if (!current.includes(rm.id)) {
            writeJSON(STORAGE_KEYS.INVITED_ROOMMATES, [...current, rm.id]);
            showToast(`Đã gửi lời mời ghép đôi tới ${rm.name}!`);
            renderMatches();
          } else {
            showToast(`Bạn đã gửi lời mời ghép đôi tới ${rm.name}.`, "info");
          }
        });
      });

      grid.querySelectorAll("[data-profile-rm]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const rm = Data.ROOMMATES.find((r) => r.id === btn.dataset.profileRm);
          if (rm) openProfileModal(rm);
        });
      });
    }

    function syncTabs() {
      tabBtns.forEach((btn) => {
        const active = btn.dataset.tab === state.tab;
        btn.className = active
          ? "mr-tab-btn px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-sm whitespace-nowrap cursor-pointer"
          : "mr-tab-btn px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-label-md whitespace-nowrap transition-colors cursor-pointer";
      });
    }

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.tab = btn.dataset.tab;
        syncTabs();
        renderMatches();
      });
    });

    areaFilter?.addEventListener("change", () => {
      state.area = areaFilter.value;
      renderMatches();
    });
    budgetFilter?.addEventListener("change", () => {
      state.budget = budgetFilter.value;
      renderMatches();
    });
    genderFilter?.addEventListener("change", () => {
      state.gender = genderFilter.value;
      renderMatches();
    });

    loadMoreBtn?.addEventListener("click", () => {
      state.showAll = true;
      renderMatches();
      showToast("Đã hiển thị thêm các bạn sinh viên tương thích!", "info");
    });

    document.getElementById("mr-share-result-btn")?.addEventListener("click", async () => {
      const arch = document.getElementById("mr-archetype-title")?.textContent || "Kỷ Luật Tự Do";
      try {
        await navigator.clipboard.writeText(`Mình vừa làm Test Roomie và thuộc tuýp ${arch}! Xem bạn hợp gu: ${window.location.origin}/roomie/trac-nghiem`);
        showToast("Đã sao chép Thẻ cá tính ở trọ để chia sẻ!");
      } catch {
        showToast(`Bạn thuộc tuýp ${arch}`, "info");
      }
    });

    document.getElementById("mr-retake-quiz-btn")?.addEventListener("click", () => {
      window.location.href = "/roomie/trac-nghiem";
    });

    document.getElementById("mr-download-contract-btn")?.addEventListener("click", (e) => {
      e.preventDefault();
      openContractModal();
    });

    document.getElementById("mr-match-plus-btn")?.addEventListener("click", (e) => {
      e.preventDefault();
      const pkg = (Data.PRICING_PACKAGES || []).find((p) => p.id === "match-plus");
      if (pkg) openPaymentModal(pkg);
    });

    renderMatches();
  }

  // -------------------- Page: Post Listing --------------------
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

    // Live Preview elements
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
      const priceVal = parseCurrencyNumber(priceInput?.value || "2200000");
      const waterVal = parseCurrencyNumber(waterInput?.value || "50000");
      const serviceVal = parseCurrencyNumber(serviceInput?.value || "0");
      const estimatedTotal = priceVal + waterVal + serviceVal + 150000;

      if (pvPrice) pvPrice.textContent = formatVND(priceVal);
      if (pvTotalHint) pvTotalHint.textContent = `Tổng dự kiến ~ ${formatVND(estimatedTotal)}/tháng`;
      if (pvDistance) pvDistance.textContent = distanceInput?.value.trim() || "Cách KTX B ĐHQG 300m";
      if (pvAddress) pvAddress.textContent = addressInput?.value.trim() || "Đường số 6, Phường Linh Trung, TP. Thủ Đức";
      if (pvVerified) pvVerified.classList.toggle("hidden", !verifyCheck?.checked);
      if (pvServiceLabel) {
        pvServiceLabel.textContent =
          serviceVal === 0 ? "Wifi & Rác miễn phí" : `Phí dịch vụ ${formatVND(serviceVal)}/th`;
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
              `<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant">${t}</span>`
          )
          .join("");
      }
    }

    purposeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedPurpose = btn.dataset.purpose;
        purposeBtns.forEach((b) => {
          const active = b === btn;
          b.className = active
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
          const active = b === btn;
          b.className = active
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
        showToast(`Đã tải ảnh "${file.name}" lên xem trước!`);
      };
      reader.readAsDataURL(file);
    });

    document.getElementById("post-save-draft-btn")?.addEventListener("click", () => {
      writeJSON(STORAGE_KEYS.LISTING_DRAFT, {
        address: addressInput?.value || "",
        distance: distanceInput?.value || "",
        price: priceInput?.value || "",
        message: messageInput?.value || ""
      });
      showToast("Đã lưu bản nháp tin đăng trên trình duyệt!");
    });

    document.getElementById("post-boost-btn")?.addEventListener("click", (e) => {
      isBoosted = !isBoosted;
      e.currentTarget.classList.toggle("ring-2", isBoosted);
      e.currentTarget.classList.toggle("ring-tertiary", isBoosted);
      updatePreview();
      showToast(
        isBoosted ? "Đã bật Boost Listing (5.000đ/ngày) trong bản xem trước!" : "Đã tắt Boost Listing.",
        isBoosted ? "success" : "info"
      );
    });

    document.getElementById("post-submit-btn")?.addEventListener("click", () => {
      const addr = addressInput?.value.trim();
      const priceNum = parseCurrencyNumber(priceInput?.value || "2200000");
      if (!addr || !priceNum) {
        showToast("Vui lòng nhập đầy đủ địa chỉ và tiền phòng hợp lệ.", "error");
        return;
      }

      const schoolText = schoolSelect?.value || "";
      const areaKey = schoolText.includes("KTX") || schoolText.includes("Linh Trung")
        ? "thu-duc"
        : schoolText.includes("Bách Khoa") || schoolText.includes("UEH")
        ? "quan-10"
        : "quan-5";

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
        priceFormatted: formatVND(priceNum),
        totalRoomPrice: selectedPurpose === "roommate" ? formatVND(priceNum * 2) + "/tháng" : formatVND(priceNum) + "/tháng",
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
        images: [uploadedCover || pvCoverImg?.src || FALLBACK_SVG],
        roommate: {
          id: "minh-thu",
          name: "Minh Thư",
          age: "20 tuổi",
          bioTitle: "Sinh viên HCMUS • Đã xác thực thẻ SV",
          note: messageInput?.value.trim() || "Tìm bạn cùng phòng sạch sẽ, tôn trọng giờ giấc.",
          avatar: Data.USER_PROFILE.avatar
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
          estimatedTotal: formatVND(priceNum + 200000)
        },
        description: [
          messageInput?.value.trim() || "Phòng sạch sẽ thoáng mát, đầy đủ tiện nghi sinh viên, chủ nhà thân thiện.",
          `Địa chỉ cụ thể: ${addr} (${distanceInput?.value.trim() || ""}).`
        ]
      };

      const existing = readJSON(STORAGE_KEYS.CUSTOM_LISTINGS, []);
      writeJSON(STORAGE_KEYS.CUSTOM_LISTINGS, [newRoom, ...existing]);

      openModal({
        title: "Đăng tin thành công!",
        subtitle: "Tin của bạn đã được hiển thị trên Roomie",
        maxWidth: "max-w-md",
        bodyHtml: `
          <div class="flex flex-col gap-4 text-center items-center">
            <div class="w-16 h-16 rounded-full bg-secondary-container text-tertiary flex items-center justify-center">
              <span class="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <p class="text-sm text-on-surface-variant">Tin <strong>"${newRoom.title}"</strong> đã xuất hiện trong danh sách Tìm phòng trọ và sẵn sàng tiếp cận sinh viên.</p>
            <div class="flex flex-col sm:flex-row gap-2.5 w-full pt-2">
              <a href="/roomie/phong-chi-tiet?id=${newId}" class="flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary font-semibold text-sm">Xem chi tiết tin</a>
              <a href="/roomie/tim-phong" class="flex-1 py-3 px-4 rounded-xl bg-surface-container-high text-on-surface font-semibold text-sm">Về trang Tìm phòng</a>
            </div>
          </div>
        `
      });
    });

    document.getElementById("post-download-contract-btn")?.addEventListener("click", openContractModal);
    document.getElementById("post-quiz-cta-btn")?.addEventListener("click", () => {
      window.location.href = "/roomie/trac-nghiem";
    });
    document.getElementById("post-support-cta-btn")?.addEventListener("click", () => {
      openChatModal("Tư vấn viên Boost Listing", "Hỗ trợ sinh viên 24/7", "Mình cần tư vấn gói Boost tin để tìm roommate trong 48h.");
    });
    document.getElementById("pv-chat-btn")?.addEventListener("click", () => {
      openChatModal("Minh Thư (Xem trước)", "Tin xem trước của bạn");
    });

    // Restore saved draft if available
    const draft = readJSON(STORAGE_KEYS.LISTING_DRAFT, null);
    if (draft) {
      if (addressInput && draft.address) addressInput.value = draft.address;
      if (distanceInput && draft.distance) distanceInput.value = draft.distance;
      if (priceInput && draft.price) priceInput.value = draft.price;
      if (messageInput && draft.message) messageInput.value = draft.message;
    }
    updatePreview();
  }

  // -------------------- Page: Pricing --------------------
  function initPricingPage() {
    const packages = Data.PRICING_PACKAGES || [];
    const buttons = document.querySelectorAll(".pricing-cta-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const pkgId = btn.dataset.pkg;
        const pkg = packages.find((p) => p.id === pkgId);
        if (!pkg) return;
        if (pkg.id === "basic") {
          showToast("Bạn đang sử dụng Gói Cơ bản (0đ) miễn phí!");
        } else {
          openPaymentModal(pkg);
        }
      });
    });

    document.getElementById("pricing-support-chat")?.addEventListener("click", (e) => {
      e.preventDefault();
      openChatModal("Ban Hỗ trợ Sinh viên Roomie", "Sinh viên khóa trên • Trực tuyến 24/7", "Mình muốn được tư vấn chọn gói dịch vụ phù hợp nhất.");
    });
  }

  // -------------------- Page: Safety & Support --------------------
  function initSafetyPage() {
    const reportForm = document.getElementById("safety-report-form");
    reportForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      reportForm.reset();
      showToast("Đã gửi báo cáo an toàn! Đội ngũ Roomie HCMUS sẽ phản hồi trong 30 phút.");
    });
  }

  // -------------------- Bootstrap --------------------
  document.addEventListener("DOMContentLoaded", () => {
    initGlobalShell();
    const page = document.body.dataset.page;
    if (page === "home") initHomePage();
    else if (page === "tim-phong") initFindRoomsPage();
    else if (page === "phong-chi-tiet") initRoomDetailPage();
    else if (page === "trac-nghiem") initQuizPage();
    else if (page === "tim-roommate") initMatchResultsPage();
    else if (page === "dang-tin") initPostListingPage();
    else if (page === "bang-gia") initPricingPage();
    else if (page === "an-toan") initSafetyPage();
  });
})();
