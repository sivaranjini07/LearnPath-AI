import React, { useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, useNavigate, useParams, Link } from "react-router-dom";
import { createProfile, getProfile, recommend, saveCourseProgress, sendFeedback } from "./api";
import Assessment from "./Assessment";
import { getCourseContent } from "./courseContent";

const initial = {
  name: "",
  goal: "",
  experienceLevel: "beginner",
  interests: "AI, problem solving",
  skills: "HTML, CSS",
  completedCourses: ""
};

const GOAL_PRESETS = [
  "AI / ML Engineer",
  "Data Scientist",
  "MERN Stack Developer",
  "Frontend Developer",
  "Python Developer",
  "Software Engineer"
];

const STORAGE = {
  result: "learnpath_result",
  profile: "learnpath_profileId",
  progress: "learnpath_courseProgress",
  name: "learnpath_name",
  form: "learnpath_form"
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/roadmap/:id" element={<StepDetail />} />
    </Routes>
  );
}

function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => readJSON(STORAGE.form, initial));
  const [profileId, setProfileId] = useState(localStorage.getItem(STORAGE.profile));
  const [result, setResult] = useState(() => readJSON(STORAGE.result, null));
  const [courseProgress, setCourseProgress] = useState(() => readJSON(STORAGE.progress, {}));
  const [feedback, setFeedback] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE.form, JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    async function hydrate() {
      if (!profileId) return;
      try {
        const profile = await getProfile(profileId);
        if (profile?.courseProgress) setCourseProgress(profile.courseProgress);
        if (profile?.name) localStorage.setItem(STORAGE.name, profile.name);
      } catch {
        // Local storage remains the fallback demo state.
      }
    }
    hydrate();
  }, [profileId]);

  const overall = useMemo(() => {
    if (!result?.path?.length) return 0;
    return Math.round(result.path.reduce((sum, item) => sum + Number(courseProgress[item.id] || 0), 0) / result.path.length);
  }, [result, courseProgress]);

  const completedCount = useMemo(() => result?.path?.filter(x => Number(courseProgress[x.id] || 0) >= 100).length || 0, [result, courseProgress]);
  const nextItem = useMemo(() => result?.path?.find(x => Number(courseProgress[x.id] || 0) < 100), [result, courseProgress]);
  const filteredPath = useMemo(() => {
    if (!result?.path) return [];
    const q = query.trim().toLowerCase();
    return result.path.filter(item => {
      const matchesFilter = filter === "all" || item.type === filter || (filter === "completed" && Number(courseProgress[item.id] || 0) >= 100) || (filter === "active" && Number(courseProgress[item.id] || 0) > 0 && Number(courseProgress[item.id] || 0) < 100);
      const matchesQuery = !q || `${item.title} ${item.description} ${item.skills.join(" ")}`.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [result, query, filter, courseProgress]);

  function update(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function generate() {
    setLoading(true); setError(""); setNotice("");
    try {
      const parsed = {
        name: form.name || "Learner",
        goal: form.goal.trim(),
        experienceLevel: form.experienceLevel,
        interests: split(form.interests),
        skills: split(form.skills),
        completedCourses: split(form.completedCourses)
      };
      const saved = await createProfile(parsed);
      const path = await recommend({ profileId: saved.id });
      const freshProgress = path.courseProgress || saved.profile?.courseProgress || Object.fromEntries(path.path.map(x => [x.id, 0]));
      setProfileId(saved.id);
      setResult(path);
      setCourseProgress(freshProgress);
      localStorage.setItem(STORAGE.result, JSON.stringify(path));
      localStorage.setItem(STORAGE.profile, saved.id);
      localStorage.setItem(STORAGE.progress, JSON.stringify(freshProgress));
      localStorage.setItem(STORAGE.name, parsed.name);
      setNotice(`Roadmap ready — ${path.path.length} steps selected specifically for your goal.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitFeedback() {
    if (!feedback.trim() || !profileId) return;
    try {
      const data = await sendFeedback({ profileId, feedback, progress: overall });
      setResult(data.path);
      localStorage.setItem(STORAGE.result, JSON.stringify(data.path));
      setFeedback("");
      setNotice("Your feedback was used to refresh the recommendation.");
    } catch (e) { setError(e.message); }
  }

  function exportPlan() {
    const payload = { learner: form, generatedAt: new Date().toISOString(), overallProgress: overall, roadmap: result };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "learnpath-ai-roadmap.json"; a.click(); URL.revokeObjectURL(url);
  }

  function reset() {
    if (!window.confirm("Start a new learning profile? Your current local roadmap will be cleared.")) return;
    Object.values(STORAGE).forEach(key => localStorage.removeItem(key));
    setForm(initial); setProfileId(null); setResult(null); setCourseProgress({}); setNotice("Ready for a new goal.");
  }

  return (
    <div className="app">
      <TopNav overall={overall} hasPlan={!!result} onProfile={() => setShowProfile(v => !v)} />
      <main className="shell">
        <section className="hero">
          <div className="heroCopy">
            <span className="eyebrow">ADAPTIVE CAREER INTELLIGENCE</span>
            <h1>Build the <span>right skills</span> for the career you want.</h1>
            <p>LearnPath AI converts your career goal, current skills, interests and assessment signals into a prerequisite-aware roadmap that adapts as you learn.</p>
            <div className="heroPills"><span>🎯 Goal-first</span><span>🧠 Skill-gap aware</span><span>📈 Progress tracked</span><span>🔁 Adaptive</span></div>
          </div>
          <div className="heroOrb"><div className="orbCore">{overall}<small>% complete</small></div><div className="orbRing ringA"/><div className="orbRing ringB"/></div>
        </section>

        <div className="workspace">
          <aside className="panel profilePanel">
            <div className="sectionTitle"><div><span className="eyebrow">01 · PROFILE</span><h2>Tell us where you're going</h2></div><span className="miniDot">●</span></div>
            <label>Name<input value={form.name} onChange={e => update("name", e.target.value)} placeholder="Your name" /></label>
            <label>Learning / career goal<textarea value={form.goal} onChange={e => update("goal", e.target.value)} placeholder="e.g. I want to become an AI/ML Engineer" /></label>
            <div className="presetRow">{GOAL_PRESETS.map(goal => <button className="preset" key={goal} onClick={() => update("goal", goal)}>{goal}</button>)}</div>
            <div className="grid">
              <label>Experience<select value={form.experienceLevel} onChange={e => update("experienceLevel", e.target.value)}><option>beginner</option><option>intermediate</option><option>advanced</option></select></label>
              <label>Interests<input value={form.interests} onChange={e => update("interests", e.target.value)} placeholder="AI, data, cloud" /></label>
            </div>
            <label>Current skills<input value={form.skills} onChange={e => update("skills", e.target.value)} placeholder="Python, HTML, CSS" /></label>
            <label>Completed course IDs<input value={form.completedCourses} onChange={e => update("completedCourses", e.target.value)} placeholder="python-basics, ml-foundations" /></label>
            <button className="primary" onClick={generate} disabled={loading || !form.goal.trim()}>{loading ? "🧠 Analyzing your profile…" : "✨ Generate Advanced Roadmap"}</button>
            {error && <div className="error">{error}</div>}
            {notice && <div className="notice">✓ {notice}</div>}
          </aside>

          <section className="dashboard">
            {!result ? <EmptyState /> : <>
              <div className="dashboardHero panel">
                <div className="dashboardGoal"><span className="eyebrow">PERSONALIZED ROADMAP</span><h2>{result.goal}</h2><p>{result.summary}</p><div className="matchLine"><span>🎯 {result.goalDomainLabel}</span><b>{result.matchConfidence || 90}% AI match</b></div></div>
                <div className="heroActions"><button className="ghost" onClick={exportPlan}>⇩ Export</button><button className="ghost" onClick={reset}>＋ New goal</button></div>
              </div>

              <div className="metricGrid">
                <Metric label="Overall progress" value={`${overall}%`} hint={`${completedCount}/${result.path.length} steps complete`} progress={overall} />
                <Metric label="Estimated journey" value={`${result.estimatedWeeks || "—"} w`} hint="At the recommended pace" />
                <Metric label="Skill gaps" value={result.skillGaps.length} hint="Prioritized by the recommender" />
                <Metric label="Learning streak" value="0 d" hint="Keep learning daily" />
              </div>

              <div className="twoCol">
                <section className="panel insightPanel"><div className="sectionTitle"><div><span className="eyebrow">AI INSIGHTS</span><h3>Why this path fits you</h3></div><span className="spark">✦</span></div><p className="strategy">{result.learningStrategy}</p><div className="signalList">{(result.personalizedSignals || []).map(signal => <div key={signal}><span>✓</span>{signal}</div>)}</div></section>
                <section className="panel nextPanel"><span className="eyebrow">NEXT BEST ACTION</span><h3>{nextItem ? nextItem.title : "Roadmap completed 🎉"}</h3><p>{nextItem ? nextItem.description : "You have completed every recommended step."}</p>{nextItem && <button className="primary" onClick={() => navigate(`/roadmap/${nextItem.id}`)}>Continue learning →</button>}</section>
              </div>

              <section className="panel skillPanel"><div className="sectionTitle"><div><span className="eyebrow">SKILL GRAPH</span><h3>Your capability map</h3></div><span className="muted">Known vs target</span></div><div className="skillGrid">{(result.skillMap || []).map(skill => <div className="skillItem" key={skill.skill}><div className="skillTop"><span>{skill.skill}</span><span className={skill.status}>{skill.status === "known" ? "Known" : "To learn"}</span></div><div className="skillBar"><i style={{ width: `${skill.status === "known" ? 100 : Math.min(88, 25 + skill.relatedSteps * 18)}%` }}/></div><small>{skill.relatedSteps} roadmap step{skill.relatedSteps === 1 ? "" : "s"}</small></div>)}</div></section>

              <section className="panel roadmapPanel">
                <div className="roadmapToolbar"><div><span className="eyebrow">02 · ROADMAP</span><h3>Goal-aligned learning sequence</h3></div><div className="toolbarControls"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search roadmap…" /><select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All</option><option value="course">Courses</option><option value="project">Projects</option><option value="assessment">Assessments</option><option value="active">In progress</option><option value="completed">Completed</option></select></div></div>
                <div className="roadmapAdvanced">{filteredPath.map((item, index) => <RoadmapCard key={item.id} item={item} index={item.milestone - 1} progress={Number(courseProgress[item.id] || 0)} locked={item.milestone > 1 && Number(courseProgress[result.path[item.milestone - 2]?.id] || 0) < 100} onOpen={() => navigate(`/roadmap/${item.id}`)} />)}</div>
                {!filteredPath.length && <div className="noResults">No roadmap steps match your search.</div>}
              </section>

              <section className="twoCol"><section className="panel feedback"><span className="eyebrow">03 · ADAPT</span><h3>Tell the recommender what to change</h3><textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Example: I already know JavaScript, but I need more backend practice." /><button className="secondary" onClick={submitFeedback}>Refresh recommendations ↻</button></section><section className="panel completionPanel"><span className="eyebrow">LEARNING HABITS</span><h3>Suggested routine</h3><div className="routine"><div><b>25 min</b><span>Concept learning</span></div><div><b>20 min</b><span>Hands-on practice</span></div><div><b>10 min</b><span>Review & recall</span></div></div><p className="muted">Consistency matters more than long sessions. Finish one roadmap section at a time.</p></section></section>
            </>}
          </section>
        </div>
      </main>
      {showProfile && <ProfileDrawer form={form} onClose={() => setShowProfile(false)} />}
      <footer>LearnPath AI · Advanced adaptive learning prototype · Goal → Skills → Learning → Assessment → Projects</footer>
    </div>
  );
}

function StepDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(() => readJSON(STORAGE.result, null));
  const [item, setItem] = useState(null);
  const [progress, setProgress] = useState(() => readJSON(STORAGE.progress, {})[id] || 0);
  const [saving, setSaving] = useState(false);
  const [learnerName] = useState(localStorage.getItem(STORAGE.name) || "Learner");
  const profileId = localStorage.getItem(STORAGE.profile);
  const lastSaved = useRef(0);
  const saveTimer = useRef(null);
  const progressMapRef = useRef(readJSON(STORAGE.progress, {}));
  const progressRef = useRef(progress);

  useEffect(() => {
    const saved = readJSON(STORAGE.result, null);
    setResult(saved);
    const found = saved?.path?.find(x => String(x.id) === String(id));
    setItem(found || null);
    const savedProgress = Number(readJSON(STORAGE.progress, {})[id] || 0);
    progressRef.current = savedProgress;
    progressMapRef.current = readJSON(STORAGE.progress, {});
    setProgress(savedProgress);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [id]);

  useEffect(() => {
    if (!item || item.type === "assessment") return undefined;
    let frame = 0;
    let lastUiProgress = progressRef.current;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const doc = document.documentElement;
        const max = Math.max(1, doc.scrollHeight - window.innerHeight);
        const raw = Math.round((window.scrollY / max) * 100);
        const next = Math.max(progressRef.current, Math.min(100, raw >= 96 ? 100 : raw));

        // Update React only when progress visibly changes. The scroll handler
        // never performs network I/O, JSON parsing, or layout-heavy work.
        if (next !== progressRef.current && (next === 100 || Math.abs(next - lastUiProgress) >= 1)) {
          progressRef.current = next;
          lastUiProgress = next;
          setProgress(next);

          progressMapRef.current = { ...progressMapRef.current, [id]: next };
          localStorage.setItem(STORAGE.progress, JSON.stringify(progressMapRef.current));

          // Debounce backend writes so fast scrolling cannot create a request storm.
          if (profileId) {
            clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => {
              lastSaved.current = Date.now();
              persistProgress(next);
            }, 1200);
          }
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      clearTimeout(saveTimer.current);
    };
  }, [id, item, profileId]);

  async function persistProgress(value) {
    if (!profileId) return;
    setSaving(true);
    try {
      const ids = result?.path?.map(x => x.id) || [];
      const data = await saveCourseProgress({ profileId, courseId: id, progress: value, roadmapIds: ids });
      const map = data.courseProgress || progressMapRef.current;
      progressMapRef.current = { ...map, [id]: value };
      localStorage.setItem(STORAGE.progress, JSON.stringify(progressMapRef.current));
    } catch {
      // Local persistence keeps the experience usable if the backend is offline.
    } finally { setSaving(false); }
  }

  function updateAssessmentProgress(value) {
    const next = Math.max(0, Math.min(100, Number(value)));
    progressRef.current = next; setProgress(next);
    const map = readJSON(STORAGE.progress, {}); map[id] = next; localStorage.setItem(STORAGE.progress, JSON.stringify(map));
    if (next >= 100) persistProgress(100);
  }

  if (!item) return <div className="app"><main className="shell"><section className="panel empty"><h2>Step not found</h2><Link to="/">Return to roadmap</Link></section></main></div>;
  const pathIndex = result.path.findIndex(x => x.id === id);
  const prev = result.path[pathIndex - 1]; const next = result.path[pathIndex + 1];
  const nextUnlocked = !next || progress >= 100;
  const content = getCourseContent(item.id);

  return <div className="app learningPage">
    <div className="courseTopbar"><Link to="/" className="backLink">← Roadmap</Link><div className="courseTopTitle"><span>{item.type}</span><b>{item.title}</b></div><div className="courseProgressMini"><b>{progress}%</b><div><i style={{ width: `${progress}%` }}/></div>{saving && <small>saving…</small>}</div></div>
    <div className="readingProgress"><i style={{ width: `${progress}%` }}/></div>
    <main className="courseShell">
      <aside className="courseAside panel"><span className="eyebrow">MILESTONE {item.milestone}</span><h2>{item.title}</h2><p>{item.description}</p><div className="courseScore"><span>AI relevance</span><b>{item.score}%</b></div><div className="courseRing" style={{ "--p": `${progress}%` }}><div>{progress}<small>% complete</small></div></div><div className="chips">{item.skills.map(s => <span key={s}>{s}</span>)}</div><div className="lockMessage">{progress >= 100 ? "✓ Next step unlocked" : "↳ Scroll through the full lesson to unlock Next"}</div></aside>
      <section className="courseMain">
        <div className="courseIntro panel"><span className="contentBadge">📚 LEARNING MODE</span><h1>{content?.headline || item.title}</h1><p>{content?.intro || item.description}</p><div className="reason">🤖 <b>Why this step:</b> {item.reason}</div></div>
        {item.type === "assessment" ? <Assessment skills={item.skills} stepId={item.id} profileId={profileId} learnerName={learnerName} onProgressChange={updateAssessmentProgress} /> : <CourseLearningContent item={item} />}
        <div className="courseFooter panel"><div><span className="eyebrow">MILESTONE COMPLETION</span><h3>{progress >= 100 ? "Milestone complete 🎉" : `${100 - progress}% remaining`}</h3><p>{progress >= 100 ? "You can move to the next milestone." : "Keep scrolling, review the examples and complete the practice tasks."}</p></div><div className="courseNav"><button className="ghost" onClick={() => prev && navigate(`/roadmap/${prev.id}`)} disabled={!prev}>← Previous</button><button className="primary" onClick={() => next && navigate(`/roadmap/${next.id}`)} disabled={!next || !nextUnlocked}>{next ? (nextUnlocked ? "Next milestone →" : "Complete this step first") : "Roadmap complete ✓"}</button></div></div>
      </section>
    </main>
  </div>;
}

const CourseLearningContent = React.memo(function CourseLearningContent({ item }) {
  const content = getCourseContent(item.id);
  return <div className="learningContent">
    {(content?.lessons || []).map((lesson, index) => <article className="lessonCard panel" key={lesson.title}><div className="lessonNumber">{String(index + 1).padStart(2, "0")}</div><div className="lessonBody"><div className="lessonMeta">LESSON {index + 1} · CORE CONCEPT</div><h2>{lesson.title}</h2><p>{lesson.explanation}</p>{lesson.points?.length > 0 && <ul className="lessonPoints">{lesson.points.map(point => <li key={point}>{point}</li>)}</ul>}{lesson.code && <div className="codeExample"><div className="codeHeader"><span>Example</span><span>{lesson.language || "Code"}</span></div><pre><code>{lesson.code}</code></pre></div>}{lesson.output && <div className="outputBox"><b>Expected result</b>{lesson.output}</div>}{lesson.practice?.length > 0 && <div className="practiceBox"><h4>✏️ Practice checkpoint</h4><ol>{lesson.practice.map(q => <li key={q}>{q}</li>)}</ol></div>}</div></article>)}
    {content?.checklist?.length > 0 && <div className="completionBox panel"><span className="eyebrow">SELF-CHECK</span><h2>Before you move on</h2><ul>{content.checklist.map(x => <li key={x}>✓ {x}</li>)}</ul></div>}
    {content?.resources?.length > 0 && <div className="resourceBox panel"><span className="eyebrow">CURATED RESOURCES</span><h2>Go deeper</h2>{content.resources.map(resource => <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer"><span>{resource.title}</span><span>↗</span></a>)}</div>}
  </div>;
});

function RoadmapCard({ item, index, progress, locked, onOpen }) {
  const complete = progress >= 100;
  return <article className={`roadmapCard ${locked ? "locked" : ""} ${complete ? "complete" : ""}`} onClick={onOpen}>
    <div className="timeline"><span>{complete ? "✓" : item.milestone}</span>{index < 20 && <i/>}</div>
    <div className="roadmapCardBody"><div className="cardMeta"><span className={`type type-${item.type}`}>{item.type}</span><span>{item.duration}</span><span>{progress}% done</span></div><h4>{item.title}</h4><p>{item.description}</p><div className="reason">🤖 {item.reason}</div><div className="cardProgress"><i style={{ width: `${progress}%` }}/></div><div className="cardBottom"><div className="chips">{item.skills.slice(0, 4).map(s => <span key={s}>{s}</span>)}</div><b>{locked ? "Locked" : complete ? "Completed" : "Open →"}</b></div></div><div className="relevance"><b>{item.score}%</b><small>match</small></div>
  </article>;
}

function Metric({ label, value, hint, progress }) {
  return <div className="metric panel"><span>{label}</span><b>{value}</b>{progress !== undefined && <div className="metricBar"><i style={{ width: `${progress}%` }}/></div>}<small>{hint}</small></div>;
}

function EmptyState() {
  return <section className="panel emptyDashboard"><div className="emptyIcon">✦</div><span className="eyebrow">READY TO PERSONALIZE</span><h2>Your career intelligence dashboard</h2><p>Enter a goal on the left. LearnPath AI will identify the right domain, prioritize prerequisites, surface skill gaps and create a step-by-step path.</p><div className="emptyFlow"><span>Goal</span><i>→</i><span>Skill analysis</span><i>→</i><span>Learning path</span><i>→</i><span>Projects</span></div></section>;
}

function ProfileDrawer({ form, onClose }) {
  return <div className="drawerBackdrop" onClick={onClose}><aside className="profileDrawer" onClick={e => e.stopPropagation()}><button className="close" onClick={onClose}>×</button><span className="eyebrow">LEARNER PROFILE</span><h2>{form.name || "Learner"}</h2><p>{form.goal || "No goal set"}</p><div className="drawerRow"><span>Experience</span><b>{form.experienceLevel}</b></div><div className="drawerRow"><span>Interests</span><b>{form.interests || "—"}</b></div><div className="drawerRow"><span>Skills</span><b>{form.skills || "—"}</b></div></aside></div>;
}

function TopNav({ overall, hasPlan, onProfile }) {
  return <header className="topNav"><Link to="/" className="brand"><span className="brandMark">✦</span><span>LearnPath <b>AI</b></span></Link><nav><a href="#dashboard">Dashboard</a><a href="#roadmap">Roadmap</a><a href="#skills">Skills</a></nav><div className="navRight"><div className="navProgress"><span>{overall}%</span><div><i style={{ width: `${overall}%` }}/></div></div>{hasPlan && <button className="profileButton" onClick={onProfile}>Learner ◉</button>}</div></header>;
}

function split(value = "") { return String(value).split(",").map(x => x.trim()).filter(Boolean); }
function readJSON(key, fallback) { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
