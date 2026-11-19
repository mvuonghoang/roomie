/**
 * Roomie Shared Pricing Toggle & Plan Sync Widget
 * Dùng chung cho section Dịch vụ trên Trang chủ và trang Bảng giá.
 */
(function () {
  const Data = window.RoomieData || {};
  const Core = window.RoomieCore || {};

  /**
   * Bind billing toggle (Theo gói lẻ / Thẻ Sinh viên -20%), price display sync, and CTA buttons.
   */
  function initBillingWidget({
    toggleContainer,
    priceSelector,
    noteSelector,
    ctaButtons,
    pkgAttr = "pkg",
    activeToggleClasses,
    inactiveToggleClasses,
    formatCtaLabel,
    onStateSync
  }) {
    const packages = Data.PRICING_PACKAGES || [];
    let billingMode = "standard";

    const toggleBtns = toggleContainer
      ? Array.from(toggleContainer.querySelectorAll("button[data-billing]"))
      : [];
    const priceEls = Array.from(document.querySelectorAll(priceSelector));
    const noteEls = noteSelector ? Array.from(document.querySelectorAll(noteSelector)) : [];

    const syncBillingUI = () => {
      toggleBtns.forEach((btn) => {
        const isActive = btn.dataset.billing === billingMode;
        activeToggleClasses.forEach((c) => btn.classList.toggle(c, isActive));
        inactiveToggleClasses.forEach((c) => btn.classList.toggle(c, !isActive));
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      priceEls.forEach((el) => {
        const nextPrice = billingMode === "student" ? el.dataset.priceSv : el.dataset.priceStd;
        if (nextPrice) el.textContent = nextPrice;
      });

      noteEls.forEach((el) => {
        const nextNote = billingMode === "student" ? el.dataset.noteSv : el.dataset.noteStd;
        if (nextNote) el.textContent = nextNote;
      });
    };

    toggleBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextMode = btn.dataset.billing || "standard";
        if (nextMode === billingMode) return;
        billingMode = nextMode;
        syncBillingUI();
      });
    });

    const syncPlanButtons = () => {
      const anyPaidActive = Core.hasUnlockedPrediction();
      const latestPlan = Core.getLatestPurchasedPlan();

      ctaButtons.forEach((btn) => {
        if (!btn.dataset.defaultLabel) btn.dataset.defaultLabel = btn.textContent.trim();
        const pkgId = btn.dataset[pkgAttr];
        if (pkgId === "basic") {
          btn.textContent = anyPaidActive ? "Gói miễn phí" : btn.dataset.defaultLabel;
          return;
        }
        const pkg = packages.find((p) => p.id === pkgId);
        const isActive = Core.hasPurchasedPlan(pkgId);
        btn.textContent = formatCtaLabel(isActive, pkg, btn.dataset.defaultLabel);
        if (btn.classList.contains("pricing-cta-btn")) {
          btn.classList.toggle("ring-2", isActive);
          btn.classList.toggle("ring-tertiary-fixed", isActive);
        }
      });

      onStateSync?.({ anyPaidActive, latestPlan });
    };

    ctaButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const pkgId = btn.dataset[pkgAttr];
        const pkg = packages.find((p) => p.id === pkgId);
        if (!pkg) return;
        if (pkg.id === "basic") {
          Core.showToast("Bạn đang sử dụng Gói Cơ bản (0đ) miễn phí!");
          return;
        }
        const activePrice = billingMode === "student" && pkg.studentPrice ? pkg.studentPrice : pkg.price;
        const activePeriod =
          billingMode === "student" ? `${pkg.period} (Ưu đãi Sinh viên -20%)` : pkg.period;
        Core.openPaymentModal({ ...pkg, price: activePrice, period: activePeriod });
      });
    });

    syncBillingUI();
    syncPlanButtons();
    Core.onPlanStateChange(syncPlanButtons);
  }

  window.RoomiePricingWidget = { initBillingWidget };
})();
