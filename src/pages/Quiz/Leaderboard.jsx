import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cacheOps } from "../../services/db";
import { useAuth } from "../../hooks/useAuth";
import "./Leaderboard.css";

const Leaderboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      const quizData = await cacheOps.getQuiz(id);
      if (!quizData) return navigate("/");

      const attempts = await cacheOps.getAttemptsByQuiz(id);
      const best = {};

      attempts.forEach((att) => {
        const prev = best[att.userId];
        if (
          !prev ||
          att.score > prev.score ||
          (att.score === prev.score && att.timeTakenSeconds < prev.timeTakenSeconds)
        ) {
          best[att.userId] = att;
        }
      });

      const sorted = Object.values(best).sort((a, b) => 
        b.score !== a.score ? b.score - a.score : a.timeTakenSeconds - b.timeTakenSeconds
      );

      const finalData = await Promise.all(
        sorted.map(async (att, index) => ({
          ...att,
          user: await cacheOps.getUser(att.userId),
          rank: index + 1,
        }))
      );

      setQuiz(quizData);
      setEntries(finalData);
      setLoading(false);
    };
    load();
  }, [id, navigate]);

  if (loading || !quiz) return <div className="loading">Loading Rankings...</div>;

  const podium = entries.slice(0, 3);

  return (
    <div className="leaderboard-container">
      <div className="header-leaderboard">
        <button className="back-btn" onClick={() => navigate(`/quiz/${quiz.id}`)}>← Back</button>
        <h1>Leaderboard: {quiz.title}</h1>
      </div>

      {entries.length > 0 && (
        <div className="podium">
          {podium[1] && (
            <div className="podium-card second">
              <span className="rank">#2</span>
              <h3>{podium[1].user?.displayName || "Anonymous"}</h3>
              <p>{podium[1].score}/{podium[1].totalQuestions}</p>
              <small>{podium[1].timeTakenSeconds}s</small>
            </div>
          )}
          {podium[0] && (
            <div className="podium-card first">
              <span className="rank gold">🥇 #1</span>
              <h2>{podium[0].user?.displayName || "Anonymous"}</h2>
              <p>{podium[0].score}/{podium[0].totalQuestions}</p>
              <small>{podium[0].timeTakenSeconds}s</small>
            </div>
          )}
          {podium[2] && (
            <div className="podium-card third">
              <span className="rank">#3</span>
              <h3>{podium[2].user?.displayName || "Anonymous"}</h3>
              <p>{podium[2].score}/{podium[2].totalQuestions}</p>
              <small>{podium[2].timeTakenSeconds}s</small>
            </div>
          )}
        </div>
      )}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Score</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className={currentUser?.id === entry.userId ? "highlight" : ""}>
                <td>{String(entry.rank).padStart(2, "0")}</td>
                <td>
                  {entry.user?.displayName || "Anonymous"}
                  {currentUser?.id === entry.userId && <span className="you">YOU</span>}
                </td>
                <td>{entry.score}/{entry.totalQuestions}</td>
                <td>{entry.timeTakenSeconds}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;