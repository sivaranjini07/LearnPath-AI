# LearnPath AI — Advanced Adaptive Learning Path Recommender

An academic-ready full-stack prototype that converts a learner's **career / learning goal** into a personalized, prerequisite-aware roadmap.

## Advanced capabilities

- Goal-first recommendation engine: the user's stated goal is the primary signal.
- Goal-domain detection for Web/Full-Stack, AI/ML, Data Science, Python and Software Development.
- Personalization using experience level, interests, current skills and assessment results.
- Prerequisite-aware sequencing rather than a flat list of courses.
- Relevance score and AI explanation for every roadmap step.
- Adaptive skill assessments with beginner → intermediate → advanced progression.
- Per-course progress starts at **0%** and grows from page scrolling.
- Course progress is saved to localStorage and the backend.
- Overall progress is calculated from every roadmap step, not hard-coded.
- Next milestone stays locked until the current milestone reaches 100%.
- Search, filtering, completion states and a resume-learning action.
- Skill capability map showing known skills and target skills.
- AI insight panel explaining the recommendation strategy.
- Export the personalized roadmap as JSON.
- Feedback loop to regenerate recommendations.
- MongoDB persistence with an in-memory demo fallback.
- Responsive dashboard and focused course-reading mode.

## Run locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at `http://localhost:5000`.

MongoDB is optional. Copy `backend/.env.example` to `.env` and set `MONGODB_URI` if you want persistent database storage.

## Demo flow

1. Enter a career goal such as **AI / ML Engineer** or **MERN Stack Developer**.
2. Add experience, interests and current skills.
3. Click **Generate Advanced Roadmap**.
4. Review the AI match, skill gaps, capability map and roadmap.
5. Open the first milestone.
6. Scroll through the full learning content — progress increases gradually from 0% toward 100%.
7. At 100%, the next milestone becomes unlocked.
8. Complete assessments to improve the learner model.
9. Give feedback to adapt the recommendations.
10. Export the final roadmap if needed.
