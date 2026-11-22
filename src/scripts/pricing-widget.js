/**
 * Roomie Shared Pricing Toggle & Plan Sync Widget
 * Dùng chung cho section Dịch vụ trên Trang chủ và trang Bảng giá.
 */
(function () {
  const Data = window.RoomieData || {};
  const Core = window.RoomieCore || {};

  /**
   * Bind billing toggle, price display sync, and available plan buttons.
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
      const hasPredictionAccess = Core.hasUnlockedPrediction();
      const latestPlan = Core.getLatestPurchasedPlan();

      ctaButtons.forEach((btn) => {
        if (!btn.dataset.defaultLabel) btn.dataset.defaultLabel = btn.textContent.trim();
        const pkgId = btn.dataset[pkgAttr];
        if (pkgId === "basic") {
          btn.disabled = false;
          btn.removeAttribute("aria-disabled");
          btn.textContent = hasPredictionAccess ? "Gói miễn phí" : btn.dataset.defaultLabel;
          return;
        }
        const pkg = packages.find((p) => p.id === pkgId);
        const unavailable = !pkg || pkg.available !== true;
        const isActive = Core.hasPurchasedPlan(pkgId);
        btn.disabled = unavailable;
        btn.setAttribute("aria-disabled", unavailable ? "true" : "false");
        btn.textContent = unavailable ? "Sắp ra mắt" : formatCtaLabel(isActive, pkg, btn.dataset.defaultLabel);
        if (btn.classList.contains("pricing-cta-btn")) {
          btn.classList.toggle("ring-2", isActive);
          btn.classList.toggle("ring-tertiary-fixed", isActive);
        }
      });

      onStateSync?.({ hasPredictionAccess, latestPlan });
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
        if (pkg.available !== true) return;
        const activePrice = billingMode === "student" && pkg.studentPrice ? pkg.studentPrice : pkg.price;
        Core.openPaymentModal({ ...pkg, price: activePrice, period: pkg.period });
      });
    });

    syncBillingUI();
    syncPlanButtons();
    Core.onPlanStateChange(syncPlanButtons);
  }

  window.RoomiePricingWidget = { initBillingWidget };
})();
