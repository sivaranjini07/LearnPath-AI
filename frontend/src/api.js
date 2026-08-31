const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(API + path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text || "Request failed" }; }

  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const createProfile = (profile) => request("/profile", { method: "POST", body: JSON.stringify(profile) });
export const getProfile = (id) => request(`/profile/${id}`);
export const recommend = (profile) => request("/recommend", { method: "POST", body: JSON.stringify(profile) });
export const getAssessmentQuestions = (skill) => request(`/assessment/questions/${encodeURIComponent(skill)}`);
export const submitAssessment = (body) => request("/assessment/submit", { method: "POST", body: JSON.stringify(body) });
export const submitAssessmentAnswer = (body) => request("/assessment/answer", { method: "POST", body: JSON.stringify(body) });
export const sendFeedback = (body) => request("/feedback", { method: "POST", body: JSON.stringify(body) });
export const saveCourseProgress = (body) => request("/progress/course", { method: "POST", body: JSON.stringify(body) });
