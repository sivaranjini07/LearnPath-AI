import mongoose from "mongoose";

const AssessmentResultSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  score: { type: Number, required: true },
  level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  completedAt: { type: Date, default: Date.now }
}, { _id: false });

const ProfileSchema = new mongoose.Schema({
  name: { type: String, default: "Learner" },
  goal: { type: String, required: true },
  experienceLevel: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  interests: { type: [String], default: [] },
  skills: { type: [String], default: [] },
  completedCourses: { type: [String], default: [] },
  assessmentResults: { type: [AssessmentResultSchema], default: [] },
  assessmentState: { type: mongoose.Schema.Types.Mixed, default: {} },
  courseProgress: { type: mongoose.Schema.Types.Mixed, default: {} },
  roadmapIds: { type: [String], default: [] },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  feedback: { type: [String], default: [] },
  streak: { type: Number, default: 0, min: 0 },
  lastActiveAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model("Profile", ProfileSchema);
