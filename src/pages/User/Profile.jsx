import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cacheOps } from "../../services/db";
import { useAuth } from "../../hooks/useAuth";

import "./Profile.css";

const Profile = () => {
  const { user, updateUserDisplayName, isInitialized } = useAuth();
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) return navigate("/"); 

    async function loadData() {
      const history = await cacheOps.getAttemptsByUser(user.id);

      const fullHistory = await Promise.all(
        history.map(async (a) => {
          const quiz = await cacheOps.getQuiz(a.quizId);
          return { ...a, quiz };
        })
      );

      setAttempts(
        fullHistory.sort(
          (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
        )
      );

      setNewName(user.displayName || user.username);
      setLoading(false);
    }

    loadData();
  }, [user, isInitialized, navigate]);

  const saveName = async () => {
    if (newName.trim() && newName !== user?.displayName) {
      await updateUserDisplayName(newName);
    }
    setIsEditing(false);
  };

  if (loading) {
    return <div className="loading">Loading Profile...</div>;
  }

  return (
    <div className="profile-container">

      <div className="profile-card">
        <div className="avatar">👤</div>
        
        <div className="profile-info">
          {isEditing ? (
            <div className="edit-box">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="input"
              />
              <button onClick={saveName} className="btn save">✔</button>
              <button onClick={() => setIsEditing(false)} className="btn cancel">✖</button>
            </div>
          ) : (
            <div className="name-box">
              <h2>{user.displayName || user.username}</h2>
              <span className="edit-icon" onClick={() => setIsEditing(true)}>✏️</span>
            </div>
          )}
          <p className="username">@{user.username}</p>
        </div>
      </div>

    
      <h3 className="section-title">Recent Activity</h3>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Quiz</th>
              <th>Score</th>
              <th>Date</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((a) => {
              const percent = Math.round((a.score / a.totalQuestions) * 100);

              return (
                <tr key={a.id}>
                  <td>{a.quiz?.title || "Unknown Quiz"}</td>
                  <td>
                    {a.score}/{a.totalQuestions}
                    <span className={percent >= 70 ? "badge good" : "badge low"}>
                      {percent}%
                    </span>
                  </td>
                  <td>
                    {new Date(a.completedAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {/* App.jsx ke naye route se exact match karta hua path */}
                    <Link to={`/quiz/${a.quizId}/review`} className="review-link">
                      Review
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {attempts.length === 0 && (
          <div className="empty">No quizzes taken yet.</div>
        )}
      </div>

    </div>
  );
};

export default Profile;