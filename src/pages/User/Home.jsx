import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cacheOps } from "../../services/db";
import { useAuth } from "../../hooks/useAuth";

import "./Home.css";

const Home = () => {
  const { user, isInitialized } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized) return;

    async function loadPageData() {
      const data = await cacheOps.getAllQuizzes();

      setQuizzes((data || []).filter((q) => q.isPublished));

      if (user) {
        const myHistory = await cacheOps.getAttemptsByUser(user.id);
        setAttempts(myHistory || []);
      }

      setLoading(false);
    }

    loadPageData();
  }, [isInitialized, user]);

  const filteredList = quizzes.filter((quiz) => {
    const done = attempts.some((a) => a.quizId === quiz.id);

    if (filter === "attempted") return done;
    if (filter === "not-attempted") return !done;
    return true;
  });

  if (loading) {
    return <div className="loading">Loading Quizzes...</div>;
  }

  return (
    <div className="home-container">

      <h1 className="title">AVAILABLE QUIZZES</h1>

      
      <div className="filter-box">
        {["all", "attempted", "not-attempted"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`filter-btn ${filter === f ? "active" : ""}`}
          >
            {f.replace("-", " ").toUpperCase()}
          </button>
        ))}
      </div>

      
      {filteredList.length === 0 ? (
        <div className="empty-box">
          No quizzes found here.
        </div>
      ) : (
        <div className="grid">
          {filteredList.map((quiz) => {
            const safeQuestions = quiz.questions || [];

            const myScores = attempts
              .filter((a) => a.quizId === quiz.id)
              .map((a) => a.score);

            const highscore =
              myScores.length > 0 ? Math.max(...myScores) : null;

            return (
              <div key={quiz.id} className="card">

                <div className="card-header">
                  <h2>{quiz.title}</h2>

                  {highscore !== null && (
                    <span className="badge">
                      Best: {highscore}/{safeQuestions.length}
                    </span>
                  )}
                </div>

                <p className="desc">
                  {quiz.description ||
                    "Challenge yourself with this quick quiz."}
                </p>

                <div className="question-preview">
                  <div className="question-time-row">
                    <div>
                      {safeQuestions.slice(0, 2).map((q, i) => (
                        <div key={i}>
                          Q{i + 1}: {q.text}
                        </div>
                      ))}
                    </div>

                    <div className="meta">
                      <span>{quiz.timeLimitMinutes || "∞"} min</span>
                    </div>
                  </div>
                </div>

                <div className="actions">
                  <Link to={`/quiz/${quiz.id}`}>
                    <button className="btn-primary1">
                      {highscore !== null ? "Retake Quiz" : "Start Quiz"}
                    </button>
                  </Link>

                  <Link to={`/quiz/${quiz.id}/leaderboard`}>
                    <button className="btn-outline1">
                      Leaderboard
                    </button>
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;