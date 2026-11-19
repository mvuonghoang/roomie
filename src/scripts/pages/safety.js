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
      reportForm.reset();
      Core.showToast("Đã gửi báo cáo an toàn! Đội ngũ Roomie HCMUS sẽ phản hồi trong 30 phút.");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "an-toan") initSafetyPage();
  });
})();
