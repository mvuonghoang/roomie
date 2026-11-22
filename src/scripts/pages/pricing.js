/**
 * Page: Pricing (/roomie/bang-gia)
 * Kết nối widget bảng giá dùng chung và nút tư vấn Zalo/Hotline.
 */
(function () {
  const Core = window.RoomieCore || {};

  function initPricingPage() {
    const activeBanner = document.getElementById("pricing-active-plan-banner");
    const activeBannerTitle = document.getElementById("pricing-active-plan-title");

    if (window.RoomiePricingWidget) {
      window.RoomiePricingWidget.initBillingWidget({
        toggleContainer: document.getElementById("pricing-billing-toggle"),
        priceSelector: ".pricing-plan-price, .table-plan-price",
        noteSelector: ".pricing-subnote",
        ctaButtons: Array.from(document.querySelectorAll(".pricing-cta-btn")),
        pkgAttr: "pkg",
        activeToggleClasses: [
          "bg-gradient-to-b",
          "from-primary-container",
          "to-primary",
          "text-white",
          "shadow-[0_0_24px_rgba(99,91,255,0.55)]",
          "font-semibold"
        ],
        inactiveToggleClasses: ["text-[#c7c4d8]", "hover:text-white", "font-medium"],
        formatCtaLabel: (isActive, pkg, defLabel) => (isActive ? `✓ Đã kích hoạt • ${pkg?.name || ""}` : defLabel),
        onStateSync: ({ hasPredictionAccess, latestPlan }) => {
          if (!activeBanner) return;
          activeBanner.classList.toggle("hidden", !hasPredictionAccess);
          if (hasPredictionAccess && activeBannerTitle && latestPlan) {
            activeBannerTitle.textContent = `Đang kích hoạt gói ${latestPlan.name}`;
          }
        }
      });
    }

    document.getElementById("pricing-support-chat")?.addEventListener("click", (e) => {
      e.preventDefault();
      Core.openSupportContactModal(
        "Ban Hỗ trợ Sinh viên Roomie",
        "Sinh viên khóa trên HCMUS • Hỗ trợ qua Zalo & Hotline",
        "Mình muốn được tư vấn chọn gói dịch vụ phù hợp nhất."
      );
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "bang-gia") initPricingPage();
  });
})();
