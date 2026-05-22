import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cacheOps } from "../../services/db";
import { formatTime } from "../../services/utils";
import "./QuizStats.css";

const QuizStats = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const quizData = await cacheOps.getQuiz(id);
      if (!quizData) return navigate("/admin/dashboard");

      const quizAttempts = await cacheOps.getAttemptsByQuiz(id);
      const attemptsWithUsers = await Promise.all(
        quizAttempts.map(async (a) => ({
          ...a,
          user: await cacheOps.getUser(a.userId),
        }))
      );

      const sorted = attemptsWithUsers.sort(
        (a, b) => b.score - a.score || a.timeTakenSeconds - b.timeTakenSeconds
      );

      setQuiz(quizData);
      setAttempts(sorted);
      setLoading(false);
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return <div className="loading">Loading Stats...</div>;

  const total = attempts.length;
  const avgScore = total > 0 ? ((attempts.reduce((s, a) => s + a.score, 0) / (total * quiz.questions.length)) * 100).toFixed(1) : 0;
  const bestScore = total > 0 ? Math.max(...attempts.map((a) => a.score)) : 0;
  const avgTime = total > 0 ? formatTime(Math.round(attempts.reduce((t, a) => t + a.timeTakenSeconds, 0) / total)) : "00:00";

  return (
    <div className="stats-container">
      <div className="header-quiz">
        <button className="back-btn" onClick={() => navigate("/admin/dashboard")}>← Back</button>
        <h1>Results: {quiz.title}</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-box"><p>Total Attempts</p><h2>{total}</h2></div>
        <div className="stat-box"><p>Avg Score</p><h2>{avgScore}%</h2></div>
        <div className="stat-box"><p>Best Score</p><h2>{bestScore}/{quiz.questions.length}</h2></div>
        <div className="stat-box"><p>Avg Time</p><h2>{avgTime}</h2></div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Score</th>
              <th>Time</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((item, i) => (
              <tr key={item.id}>
                <td>{String(i + 1).padStart(2, "0")}</td>
                <td>
                  <div className="name">{item.user?.displayName || "Unknown Student"}</div>
                  <div className="username">@{item.user?.username || "deleted_user"}</div>
                </td>
                <td>{item.score}/{item.totalQuestions} ({Math.round((item.score / item.totalQuestions) * 100)}%)</td>
                <td>{formatTime(item.timeTakenSeconds)}</td>
                <td>{new Date(item.completedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {total === 0 && <div className="empty">No attempts yet.</div>}
      </div>
    </div>
  );
};

export default QuizStats;