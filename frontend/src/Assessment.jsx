import React, { useEffect, useMemo, useState } from "react";
import {
  getAssessmentQuestions,
  getProfile,
  submitAssessmentAnswer
} from "./api";

const LEVELS = ["beginner", "intermediate", "advanced"];

const levelLabel = (level) =>
  level.charAt(0).toUpperCase() + level.slice(1);

export default function Assessment({ skills, stepId, profileId, learnerName = "Learner", onProgressChange }) {
  const [questionsBySkill, setQuestionsBySkill] = useState({});
  const [assessmentState, setAssessmentState] = useState({});
  const [skillIndex, setSkillIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [finished, setFinished] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError("");

      try {
        const bySkill = {};

        for (const skill of skills || []) {
          try {
            const data = await getAssessmentQuestions(skill);
            bySkill[data.skill] = data.questions;
          } catch {
            // A roadmap step can contain a skill without an assessment bank.
          }
        }

        let profile = null;
        if (profileId) {
          try {
            profile = await getProfile(profileId);
          } catch {
            // The assessment still works with fresh local state.
          }
        }

        if (!cancelled) {
          const savedState = profile?.assessmentState || {};
          const skillNames = Object.keys(bySkill);
          const firstIncomplete = skillNames.findIndex(
            skill => !isSkillComplete(skill, bySkill, savedState)
          );

          setQuestionsBySkill(bySkill);
          setAssessmentState(savedState);
          setProgress(profile?.progress || 0);

          if (firstIncomplete >= 0) {
            setSkillIndex(firstIncomplete);
            setFinished(false);
          } else if (skillNames.length > 0) {
            setSkillIndex(0);
            setFinished(true);
          }

          if (profile?.progress !== undefined && onProgressChange) {
            onProgressChange(profile.progress);
          }

          if (Object.keys(bySkill).length === 0) {
            setLoadError("No assessment questions are available for this step yet.");
          }
        }
      } catch (e) {
        if (!cancelled) setLoadError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [skills, profileId, onProgressChange]);

  const availableSkills = useMemo(
    () => Object.keys(questionsBySkill),
    [questionsBySkill]
  );

  const currentSkill = availableSkills[skillIndex];

  const currentState = currentSkill
    ? assessmentState[currentSkill] || { level: "beginner", answered: {} }
    : null;

  const currentLevel = currentState?.level || "beginner";

  const currentQuestions = currentSkill
    ? (questionsBySkill[currentSkill] || []).filter(
        q => q.difficulty === currentLevel
      )
    : [];

  const currentQuestionIndex = currentQuestions.findIndex(
    q => !currentState?.answered?.[String(q.index)]?.correct
  );

  const currentQuestion =
    currentQuestions[currentQuestionIndex >= 0 ? currentQuestionIndex : 0];

  const levelCompleted =
    currentQuestions.length > 0 &&
    currentQuestions.every(
      q => currentState?.answered?.[String(q.index)]?.correct
    );

  function moveToNextSkillOrFinish(nextState, nextProgress) {
    const nextAssessmentState = {
      ...assessmentState,
      [currentSkill]: nextState
    };

    setAssessmentState(nextAssessmentState);
    setProgress(nextProgress);

    if (onProgressChange) onProgressChange(nextProgress);

    const nextSkillIndex = availableSkills.findIndex(
      (skill, index) =>
        index > skillIndex &&
        !isSkillComplete(
          skill,
          questionsBySkill,
          nextAssessmentState
        )
    );

    if (nextSkillIndex !== -1) {
      setSkillIndex(nextSkillIndex);
      setSelectedAnswer(null);
      setMessage("");
      return;
    }

    const currentComplete = isSkillComplete(
      currentSkill,
      questionsBySkill,
      nextAssessmentState
    );

    if (currentComplete && availableSkills.every(
      skill => isSkillComplete(skill, questionsBySkill, nextAssessmentState)
    )) {
      setFinished(true);
      setMessage("Assessment completed. Your progress has been updated automatically.");
      setMessageType("success");
    }
  }

  async function answerQuestion() {
    if (!currentQuestion || selectedAnswer === null || checking || !profileId) return;

    setChecking(true);
    setMessage("");

    try {
      const data = await submitAssessmentAnswer({
        profileId,
        skill: currentSkill,
        questionIndex: currentQuestion.index,
        answer: selectedAnswer,
        difficulty: currentQuestion.difficulty
      });

      const nextState = data.assessment;
      const nextProgress = data.progress;

      setAssessmentState(prev => ({
        ...prev,
        [currentSkill]: nextState
      }));
      setProgress(nextProgress);

      if (onProgressChange) onProgressChange(nextProgress);

      localStorage.setItem(
        "learnpath_progress",
        String(nextProgress)
      );

      if (data.correct) {
        setMessage(
          data.unlockedLevel
            ? `Correct! ${levelLabel(data.unlockedLevel)} level unlocked.`
            : data.completed
              ? "Correct! This skill assessment is complete."
              : "Correct! Moving to the next question."
        );
        setMessageType("success");
        setSelectedAnswer(null);

        if (data.completed) {
          moveToNextSkillOrFinish(nextState, nextProgress);
        }
      } else {
        setMessage(
          `Not quite. You will stay at ${levelLabel(currentLevel)} level. Try this question again.`
        );
        setMessageType("error");
      }
    } catch (e) {
      setMessage(e.message);
      setMessageType("error");
    } finally {
      setChecking(false);
    }
  }

  function restartSkill() {
    setAssessmentState(prev => ({
      ...prev,
      [currentSkill]: { level: "beginner", answered: {} }
    }));
    setSelectedAnswer(null);
    setMessage("");
    setFinished(false);
  }

  if (loading) {
    return (
      <div className="assessmentBox">
        <h3>Skill Assessment</h3>
        <p>Loading one-by-one questions...</p>
      </div>
    );
  }

  if (availableSkills.length === 0) {
    return (
      <div className="assessmentBox">
        <h3>Skill Assessment</h3>
        <p>{loadError}</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="assessmentBox">
        <div className="assessmentHeader">
          <div>
            <span className="contentBadge">🎯 ASSESSMENT COMPLETE</span>
            <h3>Great work, {learnerName}!</h3>
          </div>
          <div className="assessmentProgress">{progress}%</div>
        </div>
        <p>Your learning progress was updated automatically from your assessment actions.</p>
        <button className="secondary" onClick={restartSkill}>Restart current skill</button>
      </div>
    );
  }

  if (!currentQuestion || levelCompleted) {
    return (
      <div className="assessmentBox">
        <h3>Assessment</h3>
        <p>This level is complete. Loading the next level...</p>
      </div>
    );
  }

  const levelPosition = LEVELS.indexOf(currentLevel);
  const answeredAtLevel = Object.keys(currentState?.answered || {})
    .filter(key => currentState.answered[key]?.difficulty === currentLevel).length;

  return (
    <div className="assessmentBox">
      <div className="assessmentHeader">
        <div>
          <span className="contentBadge">🎯 ADAPTIVE ASSESSMENT</span>
          <h3>{learnerName}'s {currentSkill} Assessment</h3>
        </div>
        <div className="assessmentProgress">{progress}%</div>
      </div>

      <div className="assessmentLevels">
        {LEVELS.map((level, index) => (
          <div
            key={level}
            className={`assessmentLevel ${
              index < levelPosition ? "done" :
              index === levelPosition ? "active" : "locked"
            }`}
          >
            <span>{index < levelPosition ? "✓" : index + 1}</span>
            {levelLabel(level)}
          </div>
        ))}
      </div>

      <div className="assessmentRule">
        <strong>Current level: {levelLabel(currentLevel)}</strong>
        <span>
          {levelPosition < 2
            ? "Answer the current question correctly to unlock the next level."
            : "Answer the advanced questions correctly to complete the assessment."}
        </span>
      </div>

      <div className="assessmentQuestion">
        <div className="questionMeta">
          <span>{levelLabel(currentLevel)} • Question {answeredAtLevel + 1}</span>
          <span>{currentQuestionIndex + 1} / {currentQuestions.length}</span>
        </div>

        <p className="questionText">
          <b>{currentQuestion.question}</b>
        </p>

        <div className="answerList">
          {currentQuestion.options.map((option, index) => (
            <label
              key={index}
              className={`answer ${selectedAnswer === index ? "selected" : ""}`}
            >
              <input
                type="radio"
                name={`assessment-${currentSkill}-${currentQuestion.index}`}
                checked={selectedAnswer === index}
                onChange={() => setSelectedAnswer(index)}
                disabled={checking}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      {message && (
        <div className={`assessmentMessage ${messageType}`}>
          {message}
        </div>
      )}

      <div className="assessmentButtons">
        <button onClick={answerQuestion} disabled={selectedAnswer === null || checking}>
          {checking ? "Checking..." : "Submit Answer →"}
        </button>
      </div>

      <div className="assessmentFooter">
        Skill {skillIndex + 1} of {availableSkills.length}
      </div>
    </div>
  );
}

function isSkillComplete(skill, questionsBySkill, state) {
  const questions = questionsBySkill[skill] || [];
  return questions.length > 0 &&
    questions.every(q => state?.[skill]?.answered?.[String(q.index)]?.correct);
}
