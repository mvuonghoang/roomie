/**
 * Page: Safety & Support (/roomie/an-toan)
 * Xử lý biểu mẫu báo cáo tin giả / phòng ma / lừa cọc.
 */
(function () {
  const Core = window.RoomieCore || {};

  function initSafetyPage() {
    const reportForm = document.getElementById("safety-report-form");
    reportForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const targetTitle = reportForm.querySelector('input[type="text"]')?.value.trim() || "Tin đăng phòng trọ";
      const reason = reportForm.querySelector("select")?.value || "Nghi ngờ tin giả / phòng ma";
      const description = reportForm.querySelector("textarea")?.value.trim() || "";
      Core.submitSafetyReport?.({
        targetTitle,
        reason,
        description
      });
      reportForm.reset();
      Core.showToast("Đã gửi báo cáo an toàn! Đội ngũ Roomie HCMUS sẽ phản hồi trong 30 phút.");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "an-toan") initSafetyPage();
  });
})();
