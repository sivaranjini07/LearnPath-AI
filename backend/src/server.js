import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import Profile from "./models/Profile.js";
import { generateLearningPath } from "./services/recommender.js";
import {
  calculateAssessmentResult
} from "./services/assessmentService.js";
import questionBank from "./questionBank.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

let memoryProfiles = new Map();
let mongoReady = false;

async function connectMongo() {
  if (!process.env.MONGODB_URI) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    mongoReady = true;

    console.log("MongoDB connected");
  } catch (err) {
    console.log(
      "MongoDB unavailable; using in-memory demo mode."
    );
  }
}

connectMongo();


// ===============================
// ADAPTIVE ASSESSMENT HELPERS
// ===============================

const ASSESSMENT_LEVELS = ["beginner", "intermediate", "advanced"];

function getQuestionDifficulty(index, total) {
  // Existing question banks are intentionally divided into three stages.
  if (total <= 3) {
    if (index === 0) return "beginner";
    if (index === total - 1) return "advanced";
    return "intermediate";
  }

  if (index < Math.ceil(total / 3)) return "beginner";
  if (index < Math.ceil((total * 2) / 3)) return "intermediate";
  return "advanced";
}

function getAdaptiveState(profile, skill) {
  return (
    profile?.assessmentState?.[skill] || {
      level: "beginner",
      answered: {}
    }
  );
}

function calculateAdaptiveProgress(profile) {
  const states = profile?.assessmentState || {};
  const activeSkills = Object.keys(states);

  // Progress is based on skills the learner has actually started,
  // rather than unrelated question banks in the application.
  if (!activeSkills.length) return 0;

  let answered = 0;
  let total = 0;

  for (const skill of activeSkills) {
    const questions = questionBank[skill] || [];
    total += questions.length;
    answered += Object.keys(states[skill]?.answered || {}).length;
  }

  return total === 0 ? 0 : Math.min(100, Math.round((answered / total) * 100));
}

function advanceAdaptiveLevel(state, questions) {
  let level = state.level || "beginner";

  const currentQuestions = questions.filter(
    (_, index) => getQuestionDifficulty(index, questions.length) === level
  );

  const currentComplete = currentQuestions.length > 0 &&
    currentQuestions.every(
      (_, index) => {
        const originalIndex = questions.findIndex(
          q => q === currentQuestions[index]
        );
        return state.answered?.[String(originalIndex)]?.correct;
      }
    );

  if (!currentComplete) return { level, unlockedLevel: null, completed: false };

  const currentLevelIndex = ASSESSMENT_LEVELS.indexOf(level);

  if (currentLevelIndex < ASSESSMENT_LEVELS.length - 1) {
    const unlockedLevel = ASSESSMENT_LEVELS[currentLevelIndex + 1];
    return {
      level: unlockedLevel,
      unlockedLevel,
      completed: false
    };
  }

  const allComplete = questions.every((_, index) =>
    state.answered?.[String(index)]?.correct
  );

  return {
    level: "advanced",
    unlockedLevel: null,
    completed: allComplete
  };
}

// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (_, res) => {
  res.json({
    ok: true,
    database: mongoReady
      ? "mongodb"
      : "memory-demo"
  });
});


// ===============================
// CREATE PROFILE
// ===============================

app.post("/api/profile", async (req, res) => {
  try {
    const data = {
      name: req.body.name || "Learner",

      goal: String(req.body.goal || "").trim(),

      experienceLevel:
        req.body.experienceLevel ||
        "beginner",

      interests:
        req.body.interests || [],

      skills:
        req.body.skills || [],

      completedCourses:
        req.body.completedCourses || [],

      assessmentResults: [],

      progress: 0,

      feedback: [],
      courseProgress: {},
      roadmapIds: [],
      streak: 0,
      lastActiveAt: null
    };

    if (!data.goal) {
      return res.status(400).json({ error: "A learning or career goal is required" });
    }

    if (mongoReady) {
      const profile =
        await Profile.create(data);

      return res.json({
        id: profile._id.toString(),
        profile
      });
    }

    const id = `demo-${Date.now()}`;

    memoryProfiles.set(id, {
      _id: id,
      ...data
    });

    res.json({
      id,
      profile: memoryProfiles.get(id)
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});


// ===============================
// GET PROFILE
// ===============================

app.get(
  "/api/profile/:id",
  async (req, res) => {

    try {

      if (mongoReady) {

        const profile =
          await Profile.findById(
            req.params.id
          );

        if (!profile) {
          return res.status(404).json({
            error: "Profile not found"
          });
        }

        return res.json(profile);
      }

      const profile =
        memoryProfiles.get(
          req.params.id
        );

      if (!profile) {
        return res.status(404).json({
          error: "Profile not found"
        });
      }

      res.json(profile);

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }
  }
);


// ===============================
// GET ASSESSMENT QUESTIONS
// ===============================

app.get(
  "/api/assessment/questions/:skill",
  (req, res) => {

    const skill =
      Object.keys(questionBank).find(
        (key) =>
          key.toLowerCase() ===
          req.params.skill.toLowerCase()
      );

    if (!skill) {
      return res.status(404).json({
        error:
          "No assessment available for this skill"
      });
    }

    const questions = questionBank[skill].map((question, index) => ({
      index,
      question: question.question,
      options: question.options,
      skill,
      difficulty: getQuestionDifficulty(index, questionBank[skill].length)
    }));

    res.json({
      skill,
      questions
    });
  }
);


// ===============================
// SUBMIT ONE ADAPTIVE ANSWER
// ===============================

app.post("/api/assessment/answer", async (req, res) => {
  try {
    const { profileId, skill, questionIndex, answer } = req.body;

    if (!profileId || !skill || questionIndex === undefined || answer === undefined) {
      return res.status(400).json({
        error: "profileId, skill, questionIndex and answer are required"
      });
    }

    const actualSkill = Object.keys(questionBank).find(
      key => key.toLowerCase() === String(skill).toLowerCase()
    );

    if (!actualSkill) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const questions = questionBank[actualSkill];
    const index = Number(questionIndex);
    const question = questions[index];

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const difficulty = getQuestionDifficulty(index, questions.length);
    let profile;

    if (mongoReady) {
      profile = await Profile.findById(profileId);
    } else {
      profile = memoryProfiles.get(profileId);
    }

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const currentState = getAdaptiveState(profile, actualSkill);

    // Do not allow users to skip the adaptive order.
    if (difficulty !== currentState.level) {
      return res.status(400).json({
        error: `Complete the ${currentState.level} level before attempting ${difficulty} questions.`
      });
    }

    const correct = Number(answer) === question.correctIndex;

    const nextState = {
      ...currentState,
      answered: {
        ...(currentState.answered || {}),
        [String(index)]: {
          answer: Number(answer),
          correct,
          difficulty,
          answeredAt: new Date().toISOString()
        }
      }
    };

    const transition = advanceAdaptiveLevel(nextState, questions);
    nextState.level = transition.level;

    if (!profile.assessmentState) profile.assessmentState = {};
    profile.assessmentState[actualSkill] = nextState;

    const newProgress = calculateAdaptiveProgress(profile);
    if (!profile.courseProgress) profile.courseProgress = {};
    const assessmentStepId = (profile.roadmapIds || []).find(id => String(id).toLowerCase().includes("assessment"));
    if (assessmentStepId) {
      profile.courseProgress[assessmentStepId] = newProgress;
      profile.progress = calculateRoadmapProgress(profile);
    } else {
      profile.progress = newProgress;
    }

    if (mongoReady) {
      profile.markModified("assessmentState");
      await profile.save();
    }

    const plainProfile = profile.toObject ? profile.toObject() : profile;

    res.json({
      correct,
      difficulty,
      unlockedLevel: correct ? transition.unlockedLevel : null,
      completed: transition.completed,
      assessment: nextState,
      progress: newProgress,
      profile: plainProfile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ===============================
// SUBMIT ASSESSMENT
// ===============================

app.post(
  "/api/assessment/submit",
  async (req, res) => {

    try {

      const {
        profileId,
        skill,
        answers
      } = req.body;

      if (
        !profileId ||
        !skill ||
        !answers
      ) {
        return res.status(400).json({
          error:
            "profileId, skill and answers are required"
        });
      }

      const actualSkill =
        Object.keys(questionBank).find(
          (key) =>
            key.toLowerCase() ===
            skill.toLowerCase()
        );

      if (!actualSkill) {
        return res.status(404).json({
          error:
            "Assessment not found"
        });
      }

      const questions =
        questionBank[actualSkill];

      const result =
        calculateAssessmentResult(
          questions,
          answers
        );

      const assessmentResult = {
        skill: actualSkill,
        score: result.score,
        level: result.level,
        completedAt: new Date()
      };

      let profile;

      if (mongoReady) {

        profile =
          await Profile.findByIdAndUpdate(
            profileId,
            {
              $push: {
                assessmentResults:
                  assessmentResult
              }
            },
            {
              new: true
            }
          );

      } else {

        profile =
          memoryProfiles.get(
            profileId
          );

        if (profile) {

          profile.assessmentResults =
            profile.assessmentResults || [];

          profile.assessmentResults.push(
            assessmentResult
          );
        }
      }

      if (!profile) {
        return res.status(404).json({
          error: "Profile not found"
        });
      }

      if (!profile.courseProgress) profile.courseProgress = {};
      const assessmentStepId = (profile.roadmapIds || []).find(id => String(id).toLowerCase().includes("assessment"));
      if (assessmentStepId) profile.courseProgress[assessmentStepId] = 100;
      profile.progress = profile.roadmapIds?.length ? calculateRoadmapProgress(profile) : profile.progress;
      if (mongoReady) { profile.markModified("courseProgress"); await profile.save(); }

      const plainProfile = profile.toObject ? profile.toObject() : profile;
      const path = generateLearningPath(plainProfile);

      res.json({
        result,
        profile: plainProfile,
        path
      });

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }
  }
);


// ===============================
// COURSE PROGRESS HELPERS
// ===============================
function clampProgress(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function calculateRoadmapProgress(profile) {
  const ids = Array.isArray(profile?.roadmapIds) ? profile.roadmapIds : [];
  const map = profile?.courseProgress || {};
  if (!ids.length) return 0;
  const total = ids.reduce((sum, id) => sum + clampProgress(map[id]), 0);
  return Math.round(total / ids.length);
}

function updateLearningStreak(profile) {
  const now = new Date();
  const previous = profile.lastActiveAt ? new Date(profile.lastActiveAt) : null;
  if (!previous) profile.streak = Math.max(1, Number(profile.streak || 0));
  else {
    const a = new Date(previous); a.setHours(0, 0, 0, 0);
    const b = new Date(now); b.setHours(0, 0, 0, 0);
    const days = Math.round((b - a) / 86400000);
    if (days === 1) profile.streak = Number(profile.streak || 0) + 1;
    else if (days > 1) profile.streak = 1;
  }
  profile.lastActiveAt = now;
}

// ===============================
// SAVE COURSE PROGRESS
// ===============================
app.post("/api/progress/course", async (req, res) => {
  try {
    const { profileId, courseId, progress, roadmapIds } = req.body;
    if (!profileId || !courseId) return res.status(400).json({ error: "profileId and courseId are required" });

    let profile = mongoReady ? await Profile.findById(profileId) : memoryProfiles.get(profileId);
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    if (!profile.courseProgress) profile.courseProgress = {};
    if (Array.isArray(roadmapIds) && roadmapIds.length) profile.roadmapIds = roadmapIds.map(String);
    profile.courseProgress[String(courseId)] = clampProgress(progress);
    profile.progress = calculateRoadmapProgress(profile);
    updateLearningStreak(profile);

    if (mongoReady) {
      profile.markModified("courseProgress");
      await profile.save();
    }

    const plainProfile = profile.toObject ? profile.toObject() : profile;
    res.json({
      courseId: String(courseId),
      courseProgress: plainProfile.courseProgress || {},
      progress: plainProfile.progress || 0,
      streak: plainProfile.streak || 0,
      profile: plainProfile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// RECOMMENDATION
// ===============================

app.post(
  "/api/recommend",
  async (req, res) => {

    try {

      let profile =
        req.body;

      if (req.body.profileId) {

        if (mongoReady) {

          profile = await Profile.findById(req.body.profileId);

        } else {

          profile =
            memoryProfiles.get(
              req.body.profileId
            );
        }
      }

      if (!profile?.goal) {
        return res.status(400).json({
          error:
            "Goal is required"
        });
      }

      const path = generateLearningPath(profile);
      const roadmapIds = path.path.map(item => String(item.id));

      if (profile) {
        profile.roadmapIds = roadmapIds;
        if (!profile.courseProgress) profile.courseProgress = {};
        for (const id of roadmapIds) {
          if (profile.courseProgress[id] === undefined) profile.courseProgress[id] = 0;
        }
        profile.progress = calculateRoadmapProgress(profile);
        if (mongoReady && profile.save) {
          profile.markModified("courseProgress");
          await profile.save();
        }
      }

      res.json({ ...path, courseProgress: profile.courseProgress || {}, progress: profile.progress || 0 });

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }
  }
);


// ===============================
// FEEDBACK
// ===============================
app.post("/api/feedback", async (req, res) => {
  const { profileId, feedback, progress } = req.body;
  if (!profileId || !feedback) return res.status(400).json({ error: "profileId and feedback are required" });

  try {
    let profile = mongoReady ? await Profile.findById(profileId) : memoryProfiles.get(profileId);
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    profile.feedback = [...(profile.feedback || []), String(feedback).trim()];
    if (!profile.roadmapIds?.length && progress !== undefined) profile.progress = clampProgress(progress);
    if (profile.roadmapIds?.length) profile.progress = calculateRoadmapProgress(profile);
    updateLearningStreak(profile);

    if (mongoReady) await profile.save();
    const plain = profile.toObject ? profile.toObject() : profile;
    const path = generateLearningPath(plain);
    res.json({ profile: plain, path, progress: plain.progress || 0, courseProgress: plain.courseProgress || {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () =>
    console.log(
      `Backend running on http://localhost:${PORT}`
    )
);