import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cacheOps } from "../../services/db";
import { useAuth } from "../../hooks/useAuth";

import "./QuizLanding.css";

const QuizLanding = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loginUser, registerUser, isInitialized } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    username: "",
    password: "",
    
  });
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    if (!isInitialized) return;

    const load = async () => {
      const data = await cacheOps.getQuiz(id);

      if (!data || !data.isPublished) {
        navigate("/");
        return;
      }

      setQuiz(data);

      if (user) {
        const history = await cacheOps.getAttemptsByQuizAndUser(
          id,
          user.id
        );
        setAttempts(history);
      }

      setLoading(false);
    };

    load();
  }, [id, user, isInitialized, navigate]);


  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");

    const { username, password} = form;

    if (isLogin) {
      const ok = await loginUser(username, password);
      if (!ok) setError("Invalid login details");
    } else {
      const ok = await registerUser(
        username,
        password,
         username
      );
      if (!ok) setError("User already exists");
    }
  };

  if (loading || !isInitialized) {
    return <div className="loading">Loading...</div>;
  }

  if (!quiz) return null;

  return (
    <div className="landing-container">

      <div className="left">

        <span className="badge">
          {quiz.visibility.toUpperCase()} QUIZ
        </span>

        <h1>{quiz.title}</h1>

        <p className="desc">
          {quiz.description || "No description available"}
        </p>

        <div className="stats">

          <div className="card">
            <p>Questions</p>
            <h3>{quiz.questions.length}</h3>
          </div>

          <div className="card">
            <p>Time Limit</p>
            <h3>
              {quiz.timeLimitMinutes > 0
                ? `${quiz.timeLimitMinutes} min`
                : "No Limit"}
            </h3>
          </div>

        </div>

      </div>


      <div className="right">

        {!user ? (
          <div className="auth-box">

            <h2>
              {quiz.visibility === "public"
                ? "Login to Continue"
                : "Private Quiz Login"}
            </h2>

            <div className="tabs">
              <button
                className={isLogin ? "active" : ""}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>

              <button
                className={!isLogin ? "active" : ""}
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuth}>

              <input
                placeholder="Username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />

              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />

              {error && <p className="error">{error}</p>}

              <button type="submit" className="Continue-btn">
                Continue
              </button>

            </form>

          </div>
        ) : (

          <div className="start-box">

            <h2>Ready to Start?</h2>

            <p className="small">
              Logged in as {user.displayName}
            </p>

            {attempts.length > 0 && !quiz.allowRetake ? (
              <button
                className="btn secondary"
                onClick={() =>
                  navigate(`/quiz/${id}/results`)
                }
              >
                View Result
              </button>
            ) : (
              <button
                className="btn primary"
                onClick={() =>
                  navigate(`/quiz/${id}/attempt`)
                }
              >
                Start Quiz
              </button>
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default QuizLanding;