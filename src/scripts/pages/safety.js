/**
 * Page: Safety & Support (/roomie/an-toan)
 * Xử lý biểu mẫu báo cáo tin giả / phòng ma / lừa cọc.
 */
(function () {
  const Core = window.RoomieCore || {};

  function initSafetyPage() {
    const reportForm = document.getElementById("safety-report-form");
    reportForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const targetTitle = reportForm.querySelector('input[type="text"]')?.value.trim() || "Tin đăng phòng trọ";
      const reason = reportForm.querySelector("select")?.value || "Nghi ngờ tin giả / phòng ma";
      const description = reportForm.querySelector("textarea")?.value.trim() || "";
      const res = await Core.submitSafetyReport?.({
        targetTitle,
        reason,
        description
      });
      if (!res?.ok) {
        Core.showToast(res?.error || "Không thể gửi báo cáo lúc này.", "error");
        return;
      }
      reportForm.reset();
      Core.showToast("Đã gửi báo cáo an toàn vào cơ sở dữ liệu! Đội ngũ Roomie sẽ kiểm tra trong 30 phút.");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "an-toan") initSafetyPage();
  });
})();
