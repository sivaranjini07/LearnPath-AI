function calculateLevel(score) {
  if (score < 40) {
    return "beginner";
  }

  if (score < 70) {
    return "intermediate";
  }

  return "advanced";
}

export function calculateAssessmentResult(
  questions,
  answers
) {
  let correct = 0;

  questions.forEach((question, index) => {
    if (
      Number(answers[index]) ===
      question.correctIndex
    ) {
      correct++;
    }
  });

  const total = questions.length;

  const score =
    total === 0
      ? 0
      : Math.round(
          (correct / total) * 100
        );

  return {
    score,
    correct,
    total,
    level: calculateLevel(score)
  };
}

export { calculateLevel };