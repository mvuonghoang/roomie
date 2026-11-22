/**
 * Page: My roommate listings (/roomie/tin-da-dang)
 */
(function () {
  const Core = window.RoomieCore || {};

  function formatDate(timestamp) {
    const date = new Date(Number(timestamp));
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("vi-VN");
  }

  function renderEmptyState(container) {
    container.innerHTML = `
      <div class="rounded-2xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
        <span class="material-symbols-outlined text-4xl text-outline">article</span>
        <h2 class="font-title-md text-title-md text-on-surface font-bold mt-2">Bạn chưa có tin đăng nào</h2>
        <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">Tạo tin để tìm bạn ở cùng hoặc cùng đi tìm phòng.</p>
        <a href="/roomie/dang-tin" class="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold">
          <span class="material-symbols-outlined text-[18px]">add</span>
          Đăng tin tìm roommate
        </a>
      </div>
    `;
  }

  function renderListings(container, listings) {
    if (!listings.length) {
      renderEmptyState(container);
      return;
    }

    container.innerHTML = listings
      .map((listing) => {
        const hasRoom = Boolean(listing.hasRoom);
        const criteria = (listing.criteria || [])
          .map(
            (item) =>
              `<span class="px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface-variant text-xs">${Core.escapeHTML(
                item
              )}</span>`
          )
          .join("");
        const note = listing.quote
          ? `<p class="text-sm text-on-surface-variant mt-3">${Core.escapeHTML(listing.quote)}</p>`
          : "";

        return `
          <article class="rounded-2xl bg-surface-container-lowest p-space-lg sm:p-space-xl shadow-sm border border-outline-variant/20">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-space-md">
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined p-2 rounded-xl ${
                  hasRoom ? "bg-primary-fixed text-primary" : "bg-secondary-container text-on-secondary-container"
                }">${hasRoom ? "home" : "search"}</span>
                <div>
                  <h2 class="font-title-md text-title-md font-bold text-on-surface">${Core.escapeHTML(
                    listing.roomStatusTitle || (hasRoom ? "Đang tìm bạn ở ghép" : "Cùng đi tìm phòng")
                  )}</h2>
                  <p class="text-sm text-on-surface-variant mt-1">${Core.escapeHTML(listing.roomStatusDetail || "")}</p>
                  <p class="text-xs text-outline mt-1">${formatDate(listing.createdAt)}</p>
                </div>
              </div>
              <button type="button" data-delete-roommate="${Core.escapeHTML(listing.id)}" class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-error bg-error-container/60 hover:bg-error-container font-label-md text-label-md font-semibold transition-colors">
                <span class="material-symbols-outlined text-[18px]">delete</span>
                Xóa tin
              </button>
            </div>
            ${note}
            ${criteria ? `<div class="flex flex-wrap gap-1.5 mt-3">${criteria}</div>` : ""}
          </article>
        `;
      })
      .join("");
  }

  async function loadMyListings() {
    const container = document.getElementById("my-roommate-listings");
    const status = document.getElementById("my-roommate-listings-status");
    if (!container || !status) return;

    if (!Core.isLoggedIn?.()) {
      status.innerHTML = `<p class="rounded-xl bg-error-container/50 px-4 py-3 text-sm text-on-error-container">Đăng nhập tài khoản sinh viên để xem tin của bạn.</p>`;
      container.innerHTML = "";
      return;
    }

    status.innerHTML = "";
    container.innerHTML = `<div class="rounded-2xl bg-surface-container-lowest p-space-xl text-center text-on-surface-variant">Đang tải tin đăng...</div>`;
    const result = await Core.apiFetch("/api/roommates?mine=1");
    if (!result || !result.ok || !Array.isArray(result.roommates)) {
      status.innerHTML = `<p class="rounded-xl bg-error-container/50 px-4 py-3 text-sm text-on-error-container">${Core.escapeHTML(
        result?.error || "Không thể tải tin đăng. Vui lòng thử lại."
      )}</p>`;
      container.innerHTML = `
        <button id="my-roommate-listings-retry" type="button" class="rounded-xl bg-surface-container-lowest px-4 py-3 text-primary font-semibold hover:bg-surface-container-low">
          Thử tải lại
        </button>
      `;
      container.querySelector("#my-roommate-listings-retry")?.addEventListener("click", loadMyListings);
      return;
    }

    const currentUser = Core.getCurrentUser?.();
    const myListings = result.roommates.filter(
      (listing) => currentUser?.id && String(listing.userId) === String(currentUser.id)
    );
    renderListings(container, myListings);
    container.querySelectorAll("[data-delete-roommate]").forEach((button) => {
      button.addEventListener("click", async () => {
        const listingId = button.dataset.deleteRoommate;
        if (!listingId || !window.confirm("Bạn chắc chắn muốn xóa bài đăng này?")) return;

        button.disabled = true;
        const deleted = await Core.deleteRoommateListing?.(listingId);
        if (!deleted?.ok || !Array.isArray(deleted.roommates)) {
          button.disabled = false;
          Core.showToast(deleted?.error || "Không thể xóa tin lúc này. Vui lòng thử lại.", "error");
          return;
        }

        Core.showToast("Đã xóa bài đăng của bạn.", "success");
        const remainingListings = deleted.roommates.filter(
          (listing) => currentUser?.id && String(listing.userId) === String(currentUser.id)
        );
        renderListings(container, remainingListings);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "tin-da-dang") loadMyListings();
  });
})();
