/**
 * Page: Personality Quiz (/roomie/trac-nghiem)
 * Trắc nghiệm tính cách & gợi ý roommate; chọn/kết nối trực tiếp thuộc gói dịch vụ.
 */
(function () {
  const Data = window.RoomieData || {};
  const Core = window.RoomieCore || {};
  const { escapeHTML } = Core;

  function hasPersonalizedQuizResults() {
    const questions = Data.QUIZ_QUESTIONS || [];
    const result = Core.readJSON(Core.STORAGE_KEYS.QUIZ_RESULT, null);
    const answers = Core.readJSON(Core.STORAGE_KEYS.QUIZ_ANSWERS, {});
    const genderOption = answers?.[1] || answers?.["1"];
    return (
      questions.length > 0 &&
      Number(result?.answeredCount) === questions.length &&
      Object.keys(answers || {}).length === questions.length &&
      ["A", "B", "C", "D"].includes(genderOption) &&
      (Data.ROOMMATES || []).some((rm) => rm.hasPersonalizedMatchScore)
    );
  }

  function initQuizPage() {
    const questions = Data.QUIZ_QUESTIONS || [];
    if (!questions.length) return;

    const savedAnswers = Core.readJSON(Core.STORAGE_KEYS.QUIZ_ANSWERS, {});
    let currentIdx = 0;

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
      {
        id: "hoang-nam",
        el: document.getElementById("preview-score-0"),
        labelEl: document.getElementById("preview-match-label-0")
      },
      {
        id: "minh-anh",
        el: document.getElementById("preview-score-1"),
        labelEl: document.getElementById("preview-match-label-1")
      },
      {
        id: "quoc-bao",
        el: document.getElementById("preview-score-2"),
        labelEl: document.getElementById("preview-match-label-2")
      }
    ];

    function updatePreviewPredictions() {
      const hasCompletedQuiz = hasPersonalizedQuizResults();
      const canViewScores = Core.hasUnlockedPrediction();

      previewScores.forEach((p) => {
        if (!p.el) return;
        const roommate = (Data.ROOMMATES || []).find((rm) => rm.id === p.id);
        const hasCompleteProfile = [2, 3, 4, 5, 6, 7, 8, 9].every(
          (question) => roommate?.quizProfile?.[question] || roommate?.quizProfile?.[String(question)]
        );
        const hasMatchScore =
          canViewScores && hasCompletedQuiz && hasCompleteProfile && roommate?.hasPersonalizedMatchScore;
        p.el.textContent = hasMatchScore ? `${roommate.matchScore}%` : "—";
        if (p.labelEl) {
          p.labelEl.textContent = hasMatchScore
            ? String(roommate.matchLabel || "").replace(/^\d+%\s*/, "")
            : hasCompletedQuiz
            ? canViewScores
              ? "Chưa đủ dữ liệu đối chiếu"
              : "Mở gói dịch vụ để xem"
            : "Hoàn thành trắc nghiệm để xem";
        }
      });
    }

    async function finishQuiz() {
      const genderOption = savedAnswers[1] || savedAnswers["1"];
      if (!["A", "B", "C", "D"].includes(genderOption)) {
        Core.showToast("Câu giới tính là điều kiện bắt buộc. Vui lòng chọn một phương án.", "info");
        return;
      }

      const answeredVals = Object.values(savedAnswers);
      const userGender = genderOption === "B" || genderOption === "D" ? "Nữ" : "Nam";
      const preferredGender = genderOption === "A" ? "Nam" : genderOption === "B" ? "Nữ" : "all";
      const isNightOwl = savedAnswers[2] === "C" || savedAnswers[2] === "D";
      const isNeat = savedAnswers[5] === "A" || savedAnswers[5] === "B" || !savedAnswers[5];

      const result = {
        gender: userGender,
        preferredGender,
        genderOption,
        archetype: isNightOwl
          ? '"Kỷ Luật Tự Do - Cú Đêm Tri Thức"'
          : isNeat
          ? '"Ngăn Nắp Văn Minh - Học Tập Tập Trung"'
          : '"Linh Hoạt Hòa Nhã - Sống Chung Bình Yên"',
        matchCount: 42,
        pillars: {
          sleep: savedAnswers[2] ? 95 : 90,
          clean: savedAnswers[5] === "A" ? 96 : 92,
          guests: savedAnswers[7] === "A" ? 91 : 88,
          finance: savedAnswers[9] === "A" ? 98 : 94
        },
        answeredCount: answeredVals.length,
        completedAt: new Date().toISOString()
      };
      let submissionSucceeded = true;
      if (Core.submitQuizResult) {
        const submission = await Core.submitQuizResult(savedAnswers, result);
        submissionSucceeded = Boolean(submission?.ok);
      } else {
        Core.writeJSON(Core.STORAGE_KEYS.QUIZ_RESULT, result);
      }
      const hasAnsweredEveryQuestion = answeredVals.length === questions.length;
      const toastMessage = !submissionSucceeded
        ? "Chưa đồng bộ được kết quả. Phần trăm hợp gu sẽ hiện sau khi kết nối lại."
        : hasAnsweredEveryQuestion
        ? "Đã hoàn thành trắc nghiệm! Mở gói dịch vụ để xem phần trăm hợp gu."
        : "Bạn chưa trả lời đủ câu nên chưa có phần trăm hợp gu.";
      Core.showToast(toastMessage, submissionSucceeded && hasAnsweredEveryQuestion ? undefined : "info");
      window.dispatchEvent(new CustomEvent("roomie:quiz-results-updated"));
      if (submissionSucceeded && hasAnsweredEveryQuestion) {
        const predictionSection = document.getElementById("quiz-prediction-section");
        if (predictionSection) {
          window.history.replaceState(null, "", "#quiz-prediction-section");
          predictionSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }

    function renderQuestion() {
      const q = questions[currentIdx];
      const pct = Math.round(((currentIdx + 1) / questions.length) * 100);
      const minsLeft = Math.max(0.5, (questions.length - currentIdx) * 0.35).toFixed(1).replace(".0", "");

      if (qNumBadge) qNumBadge.textContent = String(q.number);
      if (qCounterText) qCounterText.textContent = `Câu ${q.number} / ${questions.length}`;
      if (qPercentText) qPercentText.textContent = `Hoàn thành ${pct}%`;
      if (qTimeLeftText) qTimeLeftText.textContent = `Còn lại khoảng ${minsLeft} phút`;
      if (progressFill) progressFill.style.width = `${pct}%`;

      if (badgeEl) badgeEl.textContent = q.badgeText;
      if (weightEl) weightEl.textContent = q.weightText;
      if (titleEl) titleEl.textContent = q.title;
      if (subtitleEl) subtitleEl.textContent = q.subtitle;

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

      const selectedKey = savedAnswers[q.number] || (q.number === 1 ? null : "A");
      if (optionsGrid) {
        optionsGrid.innerHTML = q.options
          .map((opt) => {
            const active = opt.key === selectedKey;
            return `
              <div class="quiz-option cursor-pointer rounded-2xl p-space-lg ${
                active ? "bg-[#f4f5fb] shadow-md ring-2 ring-primary/30" : "bg-surface-container-low hover:bg-surface-container"
              } transition-all duration-200 relative group flex flex-col justify-between" data-option="${escapeHTML(opt.key)}">
                <div class="flex items-start justify-between gap-space-sm mb-space-sm">
                  <div class="w-12 h-12 rounded-xl ${
                    active ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container-highest text-on-surface group-hover:bg-primary-fixed group-hover:text-primary"
                  } flex items-center justify-center flex-shrink-0 transition-colors">
                    <span class="material-symbols-outlined text-[24px]">${escapeHTML(opt.icon)}</span>
                  </div>
                  <div class="option-check w-7 h-7 rounded-full ${
                    active ? "bg-primary text-on-primary" : "bg-surface-variant text-transparent group-hover:text-outline-variant"
                  } flex items-center justify-center">
                    <span class="material-symbols-outlined text-[18px]">check</span>
                  </div>
                </div>
                <div>
                  <div class="flex items-center gap-space-xs mb-1">
                    <span class="font-label-md text-label-md ${active ? "text-primary font-bold" : "text-outline font-semibold"}">Lựa chọn ${escapeHTML(opt.key)}</span>
                    ${
                      opt.popular
                        ? `<span class="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">Phổ biến ${escapeHTML(opt.popular)}</span>`
                        : ""
                    }
                  </div>
                  <h3 class="font-title-md text-title-md text-on-surface font-bold mb-space-xs group-hover:text-primary transition-colors">${escapeHTML(opt.title)}</h3>
                  <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">${escapeHTML(opt.desc)}</p>
                </div>
              </div>
            `;
          })
          .join("");

        optionsGrid.querySelectorAll(".quiz-option").forEach((card) => {
          card.addEventListener("click", () => {
            savedAnswers[q.number] = card.dataset.option;
            Core.writeJSON(Core.STORAGE_KEYS.QUIZ_ANSWERS, savedAnswers);
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
          label.textContent = currentIdx === questions.length - 1 ? "Hoàn tất & Xem kết quả Match" : "Lưu & Tiếp tục";
        }
      }
      if (skipBtn) skipBtn.classList.toggle("hidden", q.number === 1);
      updatePreviewPredictions();
    }

    pillarCards.forEach((card, pIdx) => {
      card.classList.add("cursor-pointer");
      card.addEventListener("click", () => {
        const firstQuestionIdx = questions.findIndex((q) => q.pillarIndex === pIdx);
        currentIdx = firstQuestionIdx >= 0 ? firstQuestionIdx : 0;
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
      if (questions[currentIdx].number === 1) {
        Core.showToast("Câu giới tính là điều kiện bắt buộc.", "info");
        return;
      }
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
        if (q.number === 1) {
          Core.showToast("Vui lòng chọn giới tính và mong muốn ghép phòng trước.", "info");
          return;
        }
        savedAnswers[q.number] = "A";
        Core.writeJSON(Core.STORAGE_KEYS.QUIZ_ANSWERS, savedAnswers);
      }
      if (currentIdx < questions.length - 1) {
        currentIdx += 1;
        renderQuestion();
      } else {
        finishQuiz();
      }
    });
    finishBannerBtn?.addEventListener("click", finishQuiz);

    initQuizPredictionSection();
    window.addEventListener("roomie:backend-synced", updatePreviewPredictions);
    window.addEventListener("roomie:plan-updated", updatePreviewPredictions);
    window.addEventListener("roomie:quiz-results-updated", updatePreviewPredictions);
    renderQuestion();
  }

  function initQuizPredictionSection() {
    const predictionContent = document.getElementById("quiz-prediction-content");
    const predictionOverlay = document.getElementById("quiz-prediction-lock-overlay");
    const statusPill = document.getElementById("quiz-preview-status-pill");
    const statusDot = document.getElementById("quiz-preview-status-dot");
    const statusLabel = document.getElementById("quiz-preview-status-label");
    const previewCards = Array.from(document.querySelectorAll(".quiz-preview-card[data-preview-card]"));
    const previewSelectBtns = Array.from(document.querySelectorAll(".quiz-preview-select-btn[data-preview-select]"));
    const previewProfileBtns = Array.from(document.querySelectorAll(".quiz-preview-profile-btn[data-preview-profile]"));

    const findRoommateById = (rmId) => (Data.ROOMMATES || []).find((r) => r.id === rmId);
    const hasPersonalizedScore = (rm) => hasPersonalizedQuizResults() && Boolean(rm?.hasPersonalizedMatchScore);
    const canViewPredictions = () => Core.hasUnlockedPrediction();

    const statusStyleMap = {
      matched: { cls: "bg-tertiary text-on-tertiary", icon: "done_all", text: "Đã chốt Roommate" },
      accepted: { cls: "bg-tertiary text-on-tertiary", icon: "chat", text: "Đã mở Zalo / SĐT" },
      pending: { cls: "bg-primary-fixed text-on-primary-fixed-variant", icon: "hourglass_top", text: "Đang chờ phản hồi" },
      incoming: {
        cls: "bg-secondary-container text-on-secondary-fixed hover:bg-tertiary hover:text-on-tertiary",
        icon: "handshake",
        text: "Đồng ý & Mở Zalo"
      },
      default: {
        cls: "bg-primary/10 hover:bg-primary text-primary hover:text-on-primary",
        icon: "handshake",
        text: "Chọn bạn cùng phòng này"
      }
    };
    const allStateClasses = Array.from(new Set(Object.values(statusStyleMap).flatMap((v) => v.cls.split(" "))));

    function syncPreviewCardStates() {
      const unlocked = canViewPredictions();
      const completedQuiz = hasPersonalizedQuizResults();
      const preferredGender = Core.readJSON(Core.STORAGE_KEYS.QUIZ_RESULT, null)?.preferredGender || "all";
      const rankedCards = previewCards
        .map((card) => ({ card, roommate: findRoommateById(card.dataset.previewCard) }))
        .filter(({ roommate }) => !completedQuiz || preferredGender === "all" || roommate?.gender === preferredGender)
        .sort((a, b) => (completedQuiz ? (b.roommate?.matchScore || 0) - (a.roommate?.matchScore || 0) : 0));

      previewCards.forEach((card) => {
        card.classList.toggle("cursor-pointer", unlocked);
        card.classList.toggle("hover:-translate-y-1", unlocked);
        card.classList.toggle("hover:ring-2", unlocked);
        card.classList.toggle("hover:ring-primary/30", unlocked);
        const roommate = findRoommateById(card.dataset.previewCard);
        card.classList.toggle(
          "hidden",
          completedQuiz && preferredGender !== "all" && roommate?.gender !== preferredGender
        );
      });
      if (completedQuiz && previewCards[0]?.parentElement) {
        rankedCards.forEach(({ card }) => previewCards[0].parentElement.appendChild(card));
      }

      previewSelectBtns.forEach((btn) => {
        const rm = findRoommateById(btn.dataset.previewSelect);
        const conn = rm ? Core.getConnectionForPartner(rm.id, rm.name) : null;
        const statusKey = conn && statusStyleMap[conn.status] ? conn.status : "default";
        const cfg = statusStyleMap[statusKey];

        allStateClasses.forEach((c) => btn.classList.remove(c));
        cfg.cls.split(" ").forEach((c) => btn.classList.add(c));
        btn.innerHTML = `<span class="material-symbols-outlined text-[17px]">${cfg.icon}</span><span>${cfg.text}</span>`;

        const card = btn.closest("[data-preview-card]");
        if (card) {
          const isChosen = ["pending", "accepted", "matched"].includes(statusKey);
          card.classList.toggle("ring-2", unlocked && isChosen);
          card.classList.toggle("ring-primary/40", unlocked && isChosen);
        }
      });
    }

    function syncPredictionLockState() {
      const planUnlocked = Core.hasUnlockedPrediction();
      const quizComplete = hasPersonalizedQuizResults();
      const unlocked = planUnlocked;
      const activePlan = Core.getLatestPurchasedPlan();
      const blurClasses = ["blur-[8px]", "opacity-65", "select-none", "pointer-events-none"];

      if (predictionContent) {
        blurClasses.forEach((cls) => predictionContent.classList.toggle(cls, !unlocked));
        if (unlocked) {
          predictionContent.removeAttribute("aria-hidden");
          predictionContent.removeAttribute("inert");
        } else {
          predictionContent.setAttribute("aria-hidden", "true");
          predictionContent.setAttribute("inert", "");
        }
      }
      predictionOverlay?.classList.toggle("hidden", unlocked);

      if (statusPill && statusDot && statusLabel) {
        if (planUnlocked) {
          statusPill.className =
            "inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-bold mb-space-xs";
          statusDot.className = "w-2 h-2 rounded-full bg-tertiary animate-pulse";
          statusLabel.textContent = `Đã mở khóa kết quả (${activePlan?.name || "Gói dịch vụ"})`;
        } else if (quizComplete) {
          statusPill.className =
            "inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold mb-space-xs";
          statusDot.className = "w-2 h-2 rounded-full bg-primary";
          statusLabel.textContent = "Đã hoàn thành • Mở gói để xem kết quả";
        } else {
          statusPill.className =
            "inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold mb-space-xs";
          statusDot.className = "w-2 h-2 rounded-full bg-primary";
          statusLabel.textContent = "Hoàn thành trắc nghiệm và mở gói để xem kết quả";
        }
      }
      syncPreviewCardStates();
    }

    const bindUnlockPlanButton = (btnId, pkgId) => {
      document.getElementById(btnId)?.addEventListener("click", () => {
        const pkg = (Data.PRICING_PACKAGES || []).find((p) => p.id === pkgId);
        if (pkg) Core.openPaymentModal(pkg);
      });
    };
    bindUnlockPlanButton("quiz-unlock-match-plus-btn", "match-plus");
    bindUnlockPlanButton("quiz-unlock-combo-btn", "combo");

    previewProfileBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!canViewPredictions()) return;
        const rm = findRoommateById(btn.dataset.previewProfile);
        if (rm) {
          Core.openProfileModal(rm, syncPreviewCardStates, {
            showMatchScore: hasPersonalizedScore(rm)
          });
        }
      });
    });

    previewSelectBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const rm = findRoommateById(btn.dataset.previewSelect);
        if (!rm) return;
        if (!Core.hasUnlockedPrediction()) {
          const pkg = (Data.PRICING_PACKAGES || []).find((p) => p.id === "match-plus");
          if (pkg) Core.openPaymentModal(pkg);
          return;
        }
        const existing = Core.getConnectionForPartner(rm.id, rm.name);
        if (existing?.status === "incoming") {
          if (Core.getActiveSlotConnections().length >= Core.MAX_CONTACT_SLOTS) {
            Core.openSlotFullModal();
            return;
          }
          const accepted = Core.updateConnectionStatus(existing.id, "accepted");
          syncPreviewCardStates();
          Core.showToast(`Đã đồng ý kết nối với ${rm.name}! Zalo & SĐT đã được mở khóa.`);
          Core.openContactUnlockedModal(accepted, syncPreviewCardStates);
          return;
        }
        Core.openConnectInviteModal({
          partnerId: rm.id,
          name: rm.name,
          meta: hasPersonalizedScore(rm) ? `${rm.school} • ${rm.matchScore}% Hợp gu` : rm.school,
          avatar: rm.avatar,
          roomId: rm.linkedRoomId,
          contact: rm.contact,
          onUpdate: syncPreviewCardStates
        });
      });
    });

    previewCards.forEach((card) => {
      card.addEventListener("click", () => {
        if (!canViewPredictions()) return;
        const rm = findRoommateById(card.dataset.previewCard);
        if (rm) {
          Core.openProfileModal(rm, syncPreviewCardStates, {
            showMatchScore: hasPersonalizedScore(rm)
          });
        }
      });
    });

    syncPredictionLockState();
    Core.onPlanStateChange(syncPredictionLockState);
    window.addEventListener("roomie:backend-synced", syncPredictionLockState);
    window.addEventListener("roomie:quiz-results-updated", syncPredictionLockState);
    window.addEventListener("roomie:connections-updated", syncPreviewCardStates);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "trac-nghiem") initQuizPage();
  });
})();
