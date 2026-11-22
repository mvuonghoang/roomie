/**
 * Page: Personality Quiz (/roomie/trac-nghiem)
 * Trắc nghiệm tính cách & gợi ý roommate; kết quả bị làm mờ khóa toàn bộ cho tới khi mua Gói 4/5.
 */
(function () {
  const Data = window.RoomieData || {};
  const Core = window.RoomieCore || {};
  const { escapeHTML } = Core;

  function hasPersonalizedQuizResults() {
    const questions = Data.QUIZ_QUESTIONS || [];
    const result = Core.getQuizResult ? Core.getQuizResult() : Core.readJSON(Core.STORAGE_KEYS.QUIZ_RESULT, null);
    const answers = Core.getQuizAnswers ? Core.getQuizAnswers() : Core.readJSON(Core.STORAGE_KEYS.QUIZ_ANSWERS, {});
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

    const savedAnswers = { ...(Core.getQuizAnswers ? Core.getQuizAnswers() : Core.readJSON(Core.STORAGE_KEYS.QUIZ_ANSWERS, {})) };
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

    const canViewPredictions = () => Boolean(Core.hasUnlockedPrediction?.());

    async function finishQuiz() {
      const genderOption = savedAnswers[1] || savedAnswers["1"];
      if (!["A", "B", "C", "D"].includes(genderOption)) {
        currentIdx = 0;
        renderQuestion();
        Core.showToast("Câu 1 (Giới tính) là điều kiện bắt buộc. Vui lòng chọn một phương án.", "info");
        return;
      }

      const missingIdx = questions.findIndex((q) => !savedAnswers[q.number]);
      if (missingIdx >= 0) {
        currentIdx = missingIdx;
        renderQuestion();
        Core.showToast(
          `Vui lòng trả lời Câu ${questions[missingIdx].number} để hoàn thành đủ 9 câu trắc nghiệm.`,
          "info"
        );
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
        matchCount: (Data.ROOMMATES || []).length,
        pillars: {
          sleep: savedAnswers[2] ? 95 : 90,
          clean: savedAnswers[5] === "A" ? 96 : 92,
          guests: savedAnswers[7] === "A" ? 91 : 88,
          finance: savedAnswers[9] === "A" ? 98 : 94
        },
        answeredCount: answeredVals.length,
        completedAt: new Date().toISOString()
      };

      let submission = null;
      if (Core.submitQuizResult) {
        submission = await Core.submitQuizResult(savedAnswers, result);
      }
      if (submission?.code === "AUTH_REQUIRED") {
        Core.openAuthModal?.("login", {
          subtitle: "Đăng nhập để lưu hồ sơ 9 câu trắc nghiệm của bạn",
          onSuccess: () => finishQuiz()
        });
        return;
      }

      const submissionSucceeded = Boolean(submission?.ok);
      const unlocked = canViewPredictions();
      Core.showToast(
        !submissionSucceeded
          ? submission?.error || "Chưa lưu được kết quả. Vui lòng thử lại."
          : unlocked
          ? "Đã hoàn thành 9 câu trắc nghiệm! Xem kết quả gợi ý bên dưới."
          : "Đã lưu hồ sơ 9 câu trắc nghiệm lên hệ thống! Kích hoạt Gói 4 hoặc Gói 5 bên dưới để mở khóa kết quả hợp gu.",
        submissionSucceeded ? undefined : "error"
      );
      if (!submissionSucceeded) {
        window.dispatchEvent(new CustomEvent("roomie:quiz-results-updated"));
      }

      const predictionSection = document.getElementById("quiz-prediction-section");
      if (submissionSucceeded && predictionSection) {
        window.history.replaceState(null, "", "#quiz-prediction-section");
        predictionSection.scrollIntoView({ behavior: "smooth", block: "start" });
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

      const selectedKey = savedAnswers[q.number] || null;
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
          label.textContent = currentIdx === questions.length - 1 ? "Hoàn tất trắc nghiệm" : "Lưu & Tiếp tục";
        }
      }
      if (skipBtn) skipBtn.classList.toggle("hidden", q.number === 1);
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
        Core.showToast(
          q.number === 1
            ? "Vui lòng chọn giới tính và mong muốn ghép phòng trước."
            : "Vui lòng chọn 1 phương án hoặc bấm 'Bỏ qua câu này' để quay lại sau.",
          "info"
        );
        return;
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
    renderQuestion();
  }

  function initQuizPredictionSection() {
    const predictionContent = document.getElementById("quiz-prediction-content");
    const predictionOverlay = document.getElementById("quiz-prediction-lock-overlay");
    const cardsGrid = document.getElementById("quiz-prediction-cards-grid");
    const poolCountEl = document.getElementById("quiz-preview-pool-count");
    const statusPill = document.getElementById("quiz-preview-status-pill");
    const statusDot = document.getElementById("quiz-preview-status-dot");
    const statusLabel = document.getElementById("quiz-preview-status-label");

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

    const canViewPredictions = () => Boolean(Core.hasUnlockedPrediction?.());
    const hasPersonalizedScore = (rm) => hasPersonalizedQuizResults() && Boolean(rm?.hasPersonalizedMatchScore);

    function getPreviewCandidates() {
      const currentUser = Core.getCurrentUser?.();
      const all = (Data.ROOMMATES || []).filter(
        (rm) => !currentUser?.id || String(rm.userId || "") !== String(currentUser.id)
      );
      if (poolCountEl) poolCountEl.textContent = String(all.length);

      const completedQuiz = hasPersonalizedQuizResults();
      const quizResultObj = Core.getQuizResult ? Core.getQuizResult() : Core.readJSON(Core.STORAGE_KEYS.QUIZ_RESULT, null);
      const preferredGender = quizResultObj?.preferredGender || "all";

      const filtered =
        completedQuiz && preferredGender !== "all"
          ? all.filter((rm) => rm.gender === preferredGender)
          : all;

      return [...filtered]
        .sort((a, b) => {
          if (completedQuiz) {
            return (Number(b.matchScore) || 0) - (Number(a.matchScore) || 0);
          }
          return 0;
        })
        .slice(0, 3);
    }

    function renderPredictionCards() {
      if (!cardsGrid) return;
      const unlocked = canViewPredictions();
      const completedQuiz = hasPersonalizedQuizResults();
      const candidates = getPreviewCandidates();

      if (!candidates.length) {
        cardsGrid.innerHTML = `
          <div class="col-span-full rounded-2xl bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant">
            Chưa có hồ sơ phù hợp tiêu chí giới tính bạn chọn. Hãy thử mở rộng tùy chọn ở Câu 1 hoặc xem danh sách tại <a href="/roomie/tim-roommate" class="font-semibold text-primary underline">Tìm roommate</a>.
          </div>
        `;
        return;
      }

      cardsGrid.innerHTML = candidates
        .map((rm) => {
          const showScore = unlocked && hasPersonalizedScore(rm);
          const scoreText = showScore ? `${rm.matchScore}%` : "—";
          const labelText = showScore
            ? String(rm.matchLabel || "").replace(/^\d+%\s*/, "") || "Hợp gu"
            : unlocked
            ? "Hoàn thành đủ 9 câu để chấm điểm"
            : "Mở khóa với Gói 4 / Gói 5";
          const conn = Core.getConnectionForPartner?.(rm.id, rm.name);
          const statusKey = conn && statusStyleMap[conn.status] ? conn.status : "default";
          const cfg = statusStyleMap[statusKey];
          const isChosen = ["pending", "accepted", "matched"].includes(statusKey);
          const criteriaTags = (rm.criteria || rm.tags || []).slice(0, 3);

          return `
            <article data-preview-card="${escapeHTML(rm.id)}" class="quiz-preview-card bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between ${
              unlocked ? "cursor-pointer hover:-translate-y-1 hover:ring-2 hover:ring-primary/30" : ""
            } ${unlocked && isChosen ? "ring-2 ring-primary/40" : ""}">
              <div>
                <div class="flex items-start justify-between gap-space-sm mb-space-md">
                  <div class="relative">
                    <img loading="lazy" decoding="async" alt="Ảnh đại diện ${escapeHTML(rm.name)}" class="w-16 h-16 rounded-2xl object-cover object-top ring-2 ring-tertiary-fixed shadow-sm" src="${escapeHTML(rm.avatar || "/assets/images/common/avatar-profile.jpg")}" />
                    <span class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center text-[12px]">
                      <span class="material-symbols-outlined text-[13px]">school</span>
                    </span>
                  </div>
                  <div class="text-right">
                    <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ecfdf5] text-tertiary font-title-md text-title-md font-bold">
                      <span class="material-symbols-outlined text-[18px]">favorite</span>
                      <span>${escapeHTML(scoreText)}</span>
                    </div>
                    <span class="block font-label-sm text-label-sm text-tertiary font-semibold mt-0.5">${escapeHTML(labelText)}</span>
                  </div>
                </div>
                <div class="mb-space-sm">
                  <div class="flex items-center gap-space-xs">
                    <h3 class="font-title-md text-title-md text-on-surface font-bold">${escapeHTML(rm.name)}</h3>
                    <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">${escapeHTML(rm.age || 20)} tuổi</span>
                  </div>
                  <span class="font-body-sm text-body-sm text-primary font-semibold">${escapeHTML(rm.school)}</span>
                </div>
                <div class="flex flex-wrap gap-1.5 mb-space-md">
                  ${criteriaTags
                    .map(
                      (tag) => `<span class="px-2.5 py-1 rounded-full bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant">${escapeHTML(tag)}</span>`
                    )
                    .join("")}
                </div>
                ${
                  rm.quote
                    ? `<p class="font-body-sm text-body-sm text-on-surface-variant italic mb-space-md line-clamp-2">${escapeHTML(rm.quote)}</p>`
                    : ""
                }
              </div>
              <div class="pt-space-sm border-t border-surface-container flex flex-col gap-3">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-label-sm text-label-sm text-on-surface-variant">
                    Ngân sách: ${escapeHTML(rm.budget)}
                  </span>
                  <button type="button" data-preview-profile="${escapeHTML(rm.id)}" class="quiz-preview-profile-btn font-label-md text-label-md text-primary font-bold hover:underline cursor-pointer flex items-center gap-0.5">
                    Hồ sơ sơ bộ
                    <span class="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
                <button type="button" data-preview-select="${escapeHTML(rm.id)}" class="quiz-preview-select-btn w-full py-2.5 px-4 rounded-xl ${cfg.cls} font-label-md text-label-md font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                  <span class="material-symbols-outlined text-[17px]">${cfg.icon}</span>
                  <span>${escapeHTML(cfg.text)}</span>
                </button>
              </div>
            </article>
          `;
        })
        .join("");

      const findRm = (id) => (Data.ROOMMATES || []).find((r) => r.id === id);

      cardsGrid.querySelectorAll(".quiz-preview-profile-btn[data-preview-profile]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (!canViewPredictions()) return;
          const rm = findRm(btn.dataset.previewProfile);
          if (rm) {
            Core.openProfileModal(rm, syncPredictionLockState, {
              showMatchScore: hasPersonalizedScore(rm)
            });
          }
        });
      });

      cardsGrid.querySelectorAll(".quiz-preview-select-btn[data-preview-select]").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const rm = findRm(btn.dataset.previewSelect);
          if (!rm) return;
          if (!canViewPredictions()) {
            const pkg = (Data.PRICING_PACKAGES || []).find((p) => p.id === "unlimited-matches-day");
            if (pkg) Core.openPaymentModal(pkg);
            return;
          }
          const existing = Core.getConnectionForPartner(rm.id, rm.name);
          if (existing?.status === "incoming") {
            if (Core.getActiveSlotConnections().length >= Core.MAX_CONTACT_SLOTS) {
              Core.openSlotFullModal();
              return;
            }
            const accepted = await Core.updateConnectionStatus(existing.id, "accepted");
            if (!accepted) return;
            syncPredictionLockState();
            Core.showToast(`Đã đồng ý kết nối với ${rm.name}! Zalo & SĐT đã được mở khóa.`);
            Core.openContactUnlockedModal(accepted, syncPredictionLockState);
            return;
          }
          Core.openConnectInviteModal({
            partnerId: rm.id,
            name: rm.name,
            meta: hasPersonalizedScore(rm) ? `${rm.school} • ${rm.matchScore}% Hợp gu` : rm.school,
            avatar: rm.avatar,
            roomId: rm.linkedRoomId,
            onUpdate: syncPredictionLockState
          });
        });
      });

      cardsGrid.querySelectorAll(".quiz-preview-card[data-preview-card]").forEach((card) => {
        card.addEventListener("click", () => {
          if (!canViewPredictions()) return;
          const rm = findRm(card.dataset.previewCard);
          if (rm) {
            Core.openProfileModal(rm, syncPredictionLockState, {
              showMatchScore: hasPersonalizedScore(rm)
            });
          }
        });
      });
    }

    function syncPredictionLockState() {
      const unlocked = canViewPredictions();
      const quizComplete = hasPersonalizedQuizResults();
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
        if (unlocked && quizComplete) {
          statusPill.className =
            "inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-bold mb-space-xs";
          statusDot.className = "w-2 h-2 rounded-full bg-tertiary animate-pulse";
          statusLabel.textContent = `Đã mở khóa kết quả (${activePlan?.name || "Gói 4 / Gói 5"})`;
        } else if (unlocked) {
          statusPill.className =
            "inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-bold mb-space-xs";
          statusDot.className = "w-2 h-2 rounded-full bg-tertiary";
          statusLabel.textContent = "Đã mở khóa gói • Hãy hoàn thành 9 câu để xem % hợp gu";
        } else if (quizComplete) {
          statusPill.className =
            "inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold mb-space-xs";
          statusDot.className = "w-2 h-2 rounded-full bg-primary";
          statusLabel.textContent = "Đã hoàn thành 9 câu • Mua Gói 4 hoặc Gói 5 để mở khóa kết quả";
        } else {
          statusPill.className =
            "inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold mb-space-xs";
          statusDot.className = "w-2 h-2 rounded-full bg-primary";
          statusLabel.textContent = "Hoàn thành trắc nghiệm & mở Gói 4/5 để xem kết quả";
        }
      }
      renderPredictionCards();
    }

    const bindUnlockPlanButton = (btnId, pkgId) => {
      document.getElementById(btnId)?.addEventListener("click", () => {
        const pkg = (Data.PRICING_PACKAGES || []).find((p) => p.id === pkgId);
        if (pkg) Core.openPaymentModal(pkg);
      });
    };
    bindUnlockPlanButton("quiz-unlock-unlimited-matches-btn", "unlimited-matches-day");
    bindUnlockPlanButton("quiz-unlock-all-in-one-btn", "all-in-one");

    let predictionSyncQueued = false;
    const scheduleSyncPredictionLockState = () => {
      if (predictionSyncQueued) return;
      predictionSyncQueued = true;
      queueMicrotask(() => {
        predictionSyncQueued = false;
        syncPredictionLockState();
      });
    };

    syncPredictionLockState();
    Core.onPlanStateChange(scheduleSyncPredictionLockState);
    window.addEventListener("roomie:demo-ready", scheduleSyncPredictionLockState);
    window.addEventListener("roomie:quiz-results-updated", scheduleSyncPredictionLockState);
    window.addEventListener("roomie:connections-updated", scheduleSyncPredictionLockState);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "trac-nghiem") {
      (Core.ready || Promise.resolve()).then(initQuizPage);
    }
  });
})();
