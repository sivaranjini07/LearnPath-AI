import { courses } from "../data/courses.js";

const normalize = (value) => String(value || "").trim().toLowerCase();
const words = (value) => normalize(value).split(/[^a-z0-9+#.]+/).filter(Boolean);

// The goal is the primary signal. Interests, skills and assessments personalize
// the path only after the system has identified the learner's goal domain.
const GOAL_PROFILES = {
  web: {
    label: "Web / Full-Stack Development",
    keywords: ["mern", "full stack", "fullstack", "web developer", "web development", "frontend", "front end", "backend", "back end", "react", "node", "javascript"],
    order: ["js-basics", "js-async", "react", "node", "mongodb", "mern-project", "web-assessment"],
    ids: new Set(["js-basics", "js-async", "react", "node", "mongodb", "mern-project", "web-assessment"]),
    skills: ["javascript", "react", "node.js", "mongodb", "rest apis", "frontend", "backend", "async programming"]
  },
  ai: {
    label: "AI / Machine Learning",
    keywords: ["ai", "artificial intelligence", "machine learning", "ml", "deep learning", "nlp", "computer vision", "data scientist", "ai engineer", "ml engineer"],
    order: ["python-basics", "ml-foundations", "ml-project", "student-performance-project", "ai-chatbot-project"],
    ids: new Set(["python-basics", "ml-foundations", "ml-project", "student-performance-project", "ai-chatbot-project"]),
    skills: ["python", "machine learning", "statistics"]
  },
  data: {
    label: "Data Science / Analytics",
    keywords: ["data science", "data scientist", "data analyst", "data analytics", "analytics", "data analysis", "business intelligence", "bi"],
    order: ["python-basics", "ml-foundations", "student-performance-project", "ml-project"],
    ids: new Set(["python-basics", "ml-foundations", "student-performance-project", "ml-project"]),
    skills: ["python", "statistics", "machine learning"]
  },
  python: {
    label: "Python Development",
    keywords: ["python developer", "python programming", "python", "automation"],
    order: ["python-basics", "ml-foundations", "ml-project"],
    ids: new Set(["python-basics", "ml-foundations", "ml-project"]),
    skills: ["python", "programming"]
  },
  software: {
    label: "Software Development",
    keywords: ["software developer", "software development", "application developer", "programmer", "coding"],
    order: ["python-basics", "js-basics", "js-async", "mern-project"],
    ids: new Set(["python-basics", "js-basics", "js-async", "mern-project"]),
    skills: ["programming", "javascript", "python"]
  }
};

function scoreKeywordMatch(text, keyword) {
  const source = normalize(text);
  const key = normalize(keyword);
  if (!source || !key) return 0;
  if (source.includes(key)) return key.includes(" ") ? 4 : 3;
  return words(source).includes(key) ? 3 : 0;
}

function detectGoalProfile(profile) {
  const goal = normalize(profile.goal);
  const interests = (profile.interests || []).join(" ");
  const combined = `${goal} ${interests}`;

  let best = { key: "software", profile: GOAL_PROFILES.software, score: 0 };

  for (const [key, candidate] of Object.entries(GOAL_PROFILES)) {
    let score = 0;
    for (const keyword of candidate.keywords) score += scoreKeywordMatch(goal, keyword) * 3;
    for (const keyword of candidate.keywords) score += scoreKeywordMatch(interests, keyword);
    if (score > best.score) best = { key, profile: candidate, score };
  }

  // If the user explicitly wrote a goal, do not let generic interests override it.
  if (goal) {
    for (const [key, candidate] of Object.entries(GOAL_PROFILES)) {
      const direct = candidate.keywords.reduce((sum, keyword) => sum + scoreKeywordMatch(goal, keyword), 0);
      if (direct > 0 && direct * 3 >= best.score) {
        best = { key, profile: candidate, score: direct * 3 };
      }
    }
  }

  return best;
}

function getAssessmentScore(profile, skill) {
  const result = (profile.assessmentResults || []).find(
    (item) => normalize(item.skill) === normalize(skill)
  );
  return result ? Number(result.score) : null;
}

function calculateSkillMatch(course, profile) {
  const currentSkills = new Set((profile.skills || []).map(normalize));
  if (!course.skills.length) return 0;
  return course.skills.filter((skill) => currentSkills.has(normalize(skill))).length / course.skills.length;
}

function calculateInterestMatch(course, profile) {
  const interests = (profile.interests || []).map(normalize);
  let matches = 0;
  for (const interest of interests) {
    for (const skill of course.skills) {
      const s = normalize(skill);
      if (s.includes(interest) || interest.includes(s)) matches++;
    }
    if (normalize(course.title).includes(interest)) matches++;
  }
  return matches;
}

function calculateAssessmentMatch(course, profile) {
  let score = 0;
  for (const skill of course.skills) {
    const assessmentScore = getAssessmentScore(profile, skill);
    if (assessmentScore === null) continue;
    if (assessmentScore < 40) score += 18;
    else if (assessmentScore < 70) score += 10;
    else score += 3;
  }
  return score;
}

function courseGoalScore(course, goalProfile) {
  if (goalProfile.profile.ids.has(course.id)) return 55;
  const relevantSkills = new Set(goalProfile.profile.skills.map(normalize));
  return course.skills.some((skill) => relevantSkills.has(normalize(skill))) ? 8 : -30;
}

function scoreCourse(course, profile, goalProfile) {
  let score = 0;
  score += courseGoalScore(course, goalProfile);
  score += calculateSkillMatch(course, profile) * 15;
  score += calculateInterestMatch(course, profile) * 5;
  score += calculateAssessmentMatch(course, profile);

  if (normalize(course.level) === normalize(profile.experienceLevel)) score += 8;
  if (normalize(profile.experienceLevel) === "beginner" && normalize(course.level) === "intermediate") score += 4;

  if ((profile.completedCourses || []).some((id) => normalize(id) === normalize(course.id))) score -= 100;

  const position = goalProfile.profile.order.indexOf(course.id);
  if (position >= 0) score += Math.max(0, 18 - position * 2);
  return Math.round(score);
}

function prerequisitesSatisfied(course, ownedSkills) {
  return (course.prerequisites || []).every((p) => ownedSkills.has(normalize(p)));
}

function buildReason(course, profile, goalProfile, score) {
  const reasons = [`aligned with your ${goalProfile.profile.label} goal`];
  for (const skill of course.skills) {
    const assessmentScore = getAssessmentScore(profile, skill);
    if (assessmentScore !== null && assessmentScore < 70) {
      reasons.push(`helps improve your ${skill} skill gap`);
    }
  }
  if (calculateInterestMatch(course, profile) > 0) reasons.push("matches your interests");
  return `${reasons.slice(0, 3).map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(". ")}. Relevance score: ${Math.min(99, Math.max(50, score))}%.`;
}

export function generateLearningPath(profile) {
  const goalProfile = detectGoalProfile(profile);
  const completed = new Set((profile.completedCourses || []).map(normalize));
  const ownedSkills = new Set((profile.skills || []).map(normalize));

  for (const result of profile.assessmentResults || []) {
    if (result.score >= 70) ownedSkills.add(normalize(result.skill));
  }

  // Only courses belonging to the detected goal are eligible. This prevents
  // unrelated courses from appearing just because they have a high generic score.
  const eligible = courses.filter((course) => goalProfile.profile.ids.has(course.id) && !completed.has(normalize(course.id)));
  const ranked = eligible
    .map((course) => ({ course, score: scoreCourse(course, profile, goalProfile) }))
    .sort((a, b) => {
      const ai = goalProfile.profile.order.indexOf(a.course.id);
      const bi = goalProfile.profile.order.indexOf(b.course.id);
      if (ai !== bi) return ai - bi;
      return b.score - a.score;
    });

  const selected = [];
  const addCourse = (course, score) => {
    if (selected.length >= 7 || selected.some((x) => x.course.id === course.id)) return;
    selected.push({ course, score });
    course.skills.forEach((skill) => ownedSkills.add(normalize(skill)));
  };

  // Walk the goal-specific sequence first so the learning is genuinely a path,
  // not merely a list of similarly scored courses.
  for (const id of goalProfile.profile.order) {
    const candidate = ranked.find((x) => x.course.id === id);
    if (!candidate) continue;

    for (const prerequisite of candidate.course.prerequisites || []) {
      if (ownedSkills.has(normalize(prerequisite))) continue;
      const prerequisiteCourse = ranked.find((x) =>
        x.course.skills.some((skill) => normalize(skill) === normalize(prerequisite))
      );
      if (prerequisiteCourse) addCourse(prerequisiteCourse.course, prerequisiteCourse.score);
    }

    if (prerequisitesSatisfied(candidate.course, ownedSkills)) addCourse(candidate.course, candidate.score);
    if (selected.length >= 7) break;
  }

  // Fill remaining slots only with courses from the same goal profile.
  for (const item of ranked) {
    if (selected.length >= 7) break;
    if (prerequisitesSatisfied(item.course, ownedSkills)) addCourse(item.course, item.score);
  }

  const path = selected.map((item, index) => ({
    milestone: index + 1,
    ...item.course,
    score: Math.min(99, Math.max(50, item.score)),
    reason: buildReason(item.course, profile, goalProfile, item.score)
  }));

  const currentSkills = new Set((profile.skills || []).map(normalize));
  const skillGaps = [...new Set(path.flatMap((course) => course.skills))].filter((skill) => !currentSkills.has(normalize(skill)));

  for (const result of profile.assessmentResults || []) {
    if (result.score < 70 && !skillGaps.some((skill) => normalize(skill) === normalize(result.skill))) skillGaps.push(result.skill);
  }

  const totalWeeks = path.reduce((sum, item) => {
    const match = String(item.duration || "").match(/(\d+)/);
    return sum + (match ? Number(match[1]) : 1);
  }, 0);

  const assessmentSignals = (profile.assessmentResults || []).length;
  const skillSignals = (profile.skills || []).length;
  const interestSignals = (profile.interests || []).length;
  const matchConfidence = Math.min(98, Math.max(72, 78 + Math.min(10, skillSignals * 2) + Math.min(6, assessmentSignals * 2) + Math.min(4, interestSignals)));

  const skillMap = [...new Set(path.flatMap(course => course.skills))].map(skill => ({
    skill,
    status: currentSkills.has(normalize(skill)) ? "known" : "target",
    relatedSteps: path.filter(course => course.skills.some(s => normalize(s) === normalize(skill))).length
  }));

  const nextAction = path[0]
    ? `Start with ${path[0].title}`
    : "Review your profile and generate a fresh roadmap";

  return {
    goal: profile.goal,
    goalDomain: goalProfile.key,
    goalDomainLabel: goalProfile.profile.label,
    skillGaps,
    skillMap,
    path,
    matchConfidence,
    estimatedWeeks: totalWeeks,
    nextAction,
    learningStrategy: profile.experienceLevel === "beginner"
      ? "Foundation-first: build core concepts, then practice, then projects."
      : profile.experienceLevel === "intermediate"
        ? "Skill-gap-first: reinforce weak areas and move quickly into applied projects."
        : "Outcome-first: focus on advanced gaps, production practices and portfolio projects.",
    personalizedSignals: [
      `Goal: ${goalProfile.profile.label}`,
      `Experience: ${profile.experienceLevel}`,
      `${skillSignals} current skill${skillSignals === 1 ? "" : "s"} supplied`,
      `${assessmentSignals} assessment result${assessmentSignals === 1 ? "" : "s"} available`
    ],
    summary: `Learning path personalized for “${profile.goal}”. ${path.length} goal-aligned steps were selected using your experience, current skills, interests, assessments and prerequisites.`
  };
}
