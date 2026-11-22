/**
 * Page: Pricing (/roomie/bang-gia)
 * Kết nối widget bảng giá dùng chung và nút tư vấn Zalo/Hotline.
 */
(function () {
  const Core = window.RoomieCore || {};

  function resolvePlanAction(latestPlan, hasPredictionAccess) {
    if (!latestPlan) return null;
    if (hasPredictionAccess) {
      return {
        desc: "Phần Dự đoán gợi ý bạn cùng phòng tại trang Trắc nghiệm đã được mở khóa.",
        href: "/roomie/trac-nghiem#quiz-prediction-section",
        cta: "Xem Dự đoán gợi ý"
      };
    }
    if (latestPlan.id === "extra-posts-day") {
      return {
        desc: "Bạn có tối đa 4 lượt đăng tin tìm roommate trong ngày hôm nay.",
        href: "/roomie/dang-tin",
        cta: "Đăng tin ngay"
      };
    }
    return {
      desc: "Bài đăng bạn chọn đã được ưu tiên đẩy lên đầu danh sách tìm roommate.",
      href: "/roomie/tin-da-dang",
      cta: "Quản lý tin của tôi"
    };
  }

  function initPricingPage() {
    const activeBanner = document.getElementById("pricing-active-plan-banner");
    const activeBannerTitle = document.getElementById("pricing-active-plan-title");
    const activeBannerDesc = document.getElementById("pricing-active-plan-desc");
    const activeBannerCta = document.getElementById("pricing-active-plan-cta");

    if (window.RoomiePricingWidget) {
      window.RoomiePricingWidget.initBillingWidget({
        toggleContainer: null,
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
          activeBanner.classList.toggle("hidden", !latestPlan);
          if (latestPlan) {
            if (activeBannerTitle) {
              activeBannerTitle.textContent = `Đang kích hoạt gói ${latestPlan.name}`;
            }
            const action = resolvePlanAction(latestPlan, hasPredictionAccess);
            if (activeBannerDesc && action) activeBannerDesc.textContent = action.desc;
            if (activeBannerCta && action) {
              activeBannerCta.href = action.href;
              const labelSpan = activeBannerCta.querySelector("span:first-child");
              if (labelSpan) labelSpan.textContent = action.cta;
            }
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
    if (document.body.dataset.page === "bang-gia") {
      (Core.ready || Promise.resolve()).then(initPricingPage);
    }
  });
})();
