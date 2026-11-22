/**
 * Roomie Match - 2-Layer Compatibility Engine
 * Lớp 1: Lọc cứng theo giới tính mong muốn ở câu 1.
 * Lớp 2: Chấm điểm trọng số các tiêu chí lối sống ở câu 2-9.
 */

const QUESTION_WEIGHTS = {
  2: 20, // Giờ ngủ / thức dậy
  3: 15, // Mức độ tiếng ồn
  4: 10, // Thói quen bếp núc
  5: 25, // Vệ sinh không gian chung
  6: 15, // Hút thuốc & thú cưng
  7: 10, // Khách đến phòng
  8: 10, // Tổng ngân sách
  9: 15  // Chia hóa đơn & đồ dùng
};

const ORD_INDEX = { A: 0, B: 1, C: 2, D: 3 };

/**
 * Compute similarity between two option keys ('A', 'B', 'C', 'D') for a specific question.
 * Applies deal-breaker sensitivity for smoking/pets (Q6) and budget tiers (Q8).
 */
function compareOptionPair(qNum, userOpt, targetOpt) {
  if (!userOpt || !targetOpt) return null;
  if (userOpt === targetOpt) return 1.0;

  const pair = [userOpt, targetOpt].sort().join('');
  if (qNum === 2) {
    if (pair.includes('D')) return 0.9;
    if (pair === 'AB' || pair === 'BC') return 0.82;
    if (pair === 'AC') return 0.52;
  }
  if (qNum === 3) {
    if (pair.includes('D')) return 0.86;
    if (pair === 'AB' || pair === 'BC') return 0.8;
    if (pair === 'AC') return 0.48;
  }
  if (qNum === 4) {
    if (pair === 'AB' || pair === 'BD' || pair === 'AD') return 0.85;
    if (pair === 'BC' || pair === 'CD') return 0.72;
    return 0.62;
  }
  if (qNum === 5) {
    if (pair === 'AB' || pair === 'AC' || pair === 'BC') return 0.86;
    if (pair === 'BD') return 0.76;
    return 0.56;
  }
  if (qNum === 6) {
    if (pair === 'BD') return 0.9;
    if (pair === 'AD' || pair === 'CD') return 0.62;
    if (pair === 'AB') return 0.45;
    if (pair === 'AC' || pair === 'BC') return 0.35;
  }
  if (qNum === 7) {
    if (pair === 'AC' || pair === 'CD') return 0.55;
    if (pair === 'AB' || pair === 'AD' || pair === 'BD') return 0.84;
    return 0.78;
  }
  if (qNum === 8) {
    const diff = Math.abs((ORD_INDEX[userOpt] ?? 1) - (ORD_INDEX[targetOpt] ?? 1));
    if (diff === 1) return 0.78;
    if (diff === 2) return 0.48;
    return 0.25;
  }
  if (qNum === 9) {
    return ['AB', 'BC', 'CD'].includes(pair) ? 0.84 : 0.66;
  }
  return ['AB', 'BC', 'CD', 'AD'].includes(pair) ? 0.84 : 0.72;
}

/**
 * Evaluate full quiz submission and compute archetype + 4 lifestyle pillars.
 */
function evaluateQuizSubmission(answers = {}) {
  const cleanAnswers = {};
  for (let i = 1; i <= 9; i += 1) {
    if (answers[i] || answers[String(i)]) {
      cleanAnswers[i] = String(answers[i] || answers[String(i)]).toUpperCase();
    }
  }

  const answeredVals = Object.values(cleanAnswers);
  const genderOption = cleanAnswers[1] || null;
  const userGender = genderOption
    ? genderOption === 'B' || genderOption === 'D'
      ? 'Nữ'
      : 'Nam'
    : null;
  const preferredGender =
    genderOption === 'A'
      ? 'Nam'
      : genderOption === 'B'
      ? 'Nữ'
      : ['C', 'D'].includes(genderOption)
      ? 'all'
      : null;
  const isNightOwl = cleanAnswers[2] === 'C' || cleanAnswers[2] === 'D';
  const isNeat = cleanAnswers[5] === 'A' || cleanAnswers[5] === 'B' || !cleanAnswers[5];

  const archetype = isNightOwl
    ? '"Kỷ Luật Tự Do - Cú Đêm Tri Thức"'
    : isNeat
    ? '"Ngăn Nắp Văn Minh - Học Tập Tập Trung"'
    : '"Linh Hoạt Hòa Nhã - Sống Chung Bình Yên"';

  const pillars = {
    sleep: cleanAnswers[2] === 'A' || cleanAnswers[2] === 'B' ? 96 : cleanAnswers[2] ? 94 : 90,
    clean: cleanAnswers[5] === 'A' ? 97 : cleanAnswers[5] === 'B' ? 94 : 92,
    guests: cleanAnswers[7] === 'A' ? 93 : cleanAnswers[7] === 'D' ? 95 : 89,
    finance: cleanAnswers[9] === 'A' || cleanAnswers[9] === 'D' ? 98 : 94
  };

  return {
    answers: cleanAnswers,
    gender: userGender,
    preferredGender,
    genderOption,
    archetype,
    matchCount: 42,
    pillars,
    answeredCount: answeredVals.length,
    completedAt: new Date().toISOString()
  };
}

/**
 * Calculate realistic compatibility percentage between user's quiz answers and a roommate profile.
 */
function computeRoommateMatchScore(userAnswers, roommate) {
  if (!userAnswers || Object.keys(userAnswers).length === 0) {
    return {
      matchScore: null,
      matchLabel: 'Chưa làm trắc nghiệm hợp gu',
      isGenderCompatible: false,
      hasLifestyleData: false
    };
  }

  const genderOption = userAnswers[1] || userAnswers['1'];
  const requiredGender = genderOption === 'A' ? 'Nam' : genderOption === 'B' ? 'Nữ' : null;
  if (!['A', 'B', 'C', 'D'].includes(genderOption) || (requiredGender && roommate.gender !== requiredGender)) {
    return {
      matchScore: null,
      matchLabel: 'Không phù hợp giới tính',
      isGenderCompatible: false,
      hasLifestyleData: false
    };
  }

  const targetProfile = roommate.quizProfile || {};
  let weightedSum = 0;
  let totalWeight = 0;
  let dealBreakerCap = 99;

  Object.entries(QUESTION_WEIGHTS).forEach(([qStr, weight]) => {
    const qNum = Number(qStr);
    const uAns = userAnswers[qNum] || userAnswers[qStr];
    const tAns = targetProfile[qNum] || targetProfile[qStr];
    const sim = compareOptionPair(qNum, uAns, tAns);
    if (sim !== null) {
      weightedSum += sim * weight;
      totalWeight += weight;
      if (qNum === 6 && sim < 0.5) {
        dealBreakerCap = Math.min(dealBreakerCap, 72);
      }
      if (qNum === 8 && sim <= 0.3) {
        dealBreakerCap = Math.min(dealBreakerCap, 75);
      }
    }
  });

  const rawScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : null;
  const score =
    rawScore !== null
      ? Math.max(35, Math.min(dealBreakerCap, rawScore))
      : null;
  const label =
    score === null
      ? 'Chưa đủ dữ liệu lối sống'
      : score >= 92
      ? `${score}% Cực hợp gu`
      : score >= 82
      ? `${score}% Rất hợp gu`
      : score >= 70
      ? `${score}% Hòa hợp`
      : `${score}% Cần trao đổi thêm`;

  return {
    matchScore: score,
    matchLabel: label,
    isGenderCompatible: true,
    hasLifestyleData: totalWeight > 0
  };
}

module.exports = {
  evaluateQuizSubmission,
  computeRoommateMatchScore
};
