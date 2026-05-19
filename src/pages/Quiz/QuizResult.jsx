import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { cacheOps } from "../../services/db";
import { useAuth } from "../../hooks/useAuth";

import "./QuizResult.css";

const QuizResult = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isInitialized } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);

  useEffect(() => {
    if (!isInitialized || !user) return;

    const load = async () => {
      const quizData = await cacheOps.getQuiz(id);

      if (!quizData) {
        navigate("/");
        return;
      }

      const attemptId = location.state?.attemptId;
      const all = await cacheOps.getAttemptsByQuizAndUser(id, user.id);

      const current =
        all.find((a) => a.id === attemptId) ||
        all.sort(
          (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
        )[0];

      if (!current) {
        navigate(`/quiz/${id}`);
        return;
      }

      setQuiz(quizData);
      setAttempt(current);
    };

    load();
  }, [id, user, isInitialized, navigate, location.state]);

  if (!quiz || !attempt) {
    return <div className="loading">Loading Result...</div>;
  }

  const percent = Math.round((attempt.score / attempt.totalQuestions) * 100);
  const pass = quiz.passScore !== null ? percent >= quiz.passScore : null;
  const wrongAnswers = attempt.totalQuestions - attempt.score;

  return (
    <div className="result-container">
      
      <div className="score-box">
        <h1>{percent}%</h1>

        {pass !== null && (
          <span className={pass ? "badge-pass success" : "badge-pass error"}>
            {pass ? "PASSED" : "FAILED"}
          </span>
        )}
      </div>

    
      <div className="stats">
        <div className="card">
          <p>Time Taken</p>
          <h3>{attempt.timeTakenSeconds}s</h3>
        </div>

        <div className="card">
          <p>Score</p>
          <h3>
            {attempt.score}/{attempt.totalQuestions}
          </h3>
        </div>
      </div>

    
      <div className="result-box">
        <div className="result-correct">
          <span>Correct </span>
          <b>{attempt.score}</b>
        </div>

        <div className="result-wrong">
          <span>Wrong </span>
          <b>{wrongAnswers}</b>
        </div>
      </div>

      
      <div className="result-actions">
        <button
          className="leaderboard-btn"
          onClick={() => navigate(`/quiz/${id}/leaderboard`)}
        >
          Leaderboard
        </button>

        <button
  className="preview-btn"
  onClick={() =>
    navigate(`/quiz/${id}/review`, {  
      state: { attemptId: attempt.id },
    })
  }
>
  Review Answers
</button>

        {wrongAnswers > 0 && (
          <button
            className="secondary"
            onClick={() =>
              navigate(`/quiz/${id}/attempt`, {
                state: {
                  retryWrongOnly: true,
                  attemptId: attempt.id,
                },
              })
            }
          >
            Retry Wrong Questions
          </button>
        )}
      </div>

      <div className="result-back">
        <Link to="/"> Back to Home </Link>
      </div>
    </div>
  );
};

export default QuizResult;