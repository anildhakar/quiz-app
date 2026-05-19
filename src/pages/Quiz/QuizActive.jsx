import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { cacheOps } from "../../services/db";
import { useAuth } from "../../hooks/useAuth";

import "./QuizActive.css";

const QuizActive = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [order, setOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime] = useState(new Date());

  
  const handleFinish = useCallback(async () => {
    if (!quiz || !user) return;

    let score = 0;
    answers.forEach((ans, i) => {
      const qIndex = order[i];
      if (ans === quiz.questions[qIndex].correctIndex) {
        score++;
      }
    });

    const attempt = {
      id: Date.now().toString(),
      quizId: quiz.id,
      userId: user.id,
      answers,
      score,
      totalQuestions: order.length,
      startedAt: startTime.toISOString(),
      completedAt: new Date().toISOString(),
      questionOrder: order,
      timeTakenSeconds: Math.floor((Date.now() - startTime.getTime()) / 1000),
    };

    await cacheOps.saveAttempt(attempt);
    navigate(`/quiz/${quiz.id}/results`, { state: { attemptId: attempt.id } });
  }, [quiz, user, answers, order, startTime, navigate]);

  
  useEffect(() => {
    const load = async () => {
      if (!user) return navigate(`/quiz/${id}`);

      const data = await cacheOps.getQuiz(id);
      if (!data || !data.isPublished) return navigate("/");

      let qOrder = data.questions.map((_, i) => i);
      const retryWrongOnly = location.state?.retryWrongOnly;
      const oldAttemptId = location.state?.attemptId;

      if (retryWrongOnly && oldAttemptId) {
        const oldAttempts = await cacheOps.getAttemptsByQuizAndUser(id, user.id);
        const oldAttempt = oldAttempts.find((a) => a.id === oldAttemptId);

        if (oldAttempt) {
          qOrder = [];
          oldAttempt.answers.forEach((ans, i) => {
            const qIndex = oldAttempt.questionOrder[i];
            if (ans !== data.questions[qIndex].correctIndex) {
              qOrder.push(qIndex);
            }
          });

          if (qOrder.length === 0) {
            alert("All questions already correct!");
            navigate(`/quiz/${id}/results`);
            return;
          }
        }
      }

      setQuiz(data);
      setOrder(qOrder);
      setAnswers(new Array(qOrder.length).fill(-1));

      if (data.timeLimitMinutes > 0) {
        setTimeLeft(data.timeLimitMinutes * 60);
      }
      setLoading(false);
    };
    load();
  }, [id, user, navigate, location.state]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleFinish]);

  const selectOption = (opt) => {
    const copy = [...answers];
    copy[currentIdx] = opt;
    setAnswers(copy);
  };

  if (loading || !quiz) {
    return <div className="loading">Loading Quiz...</div>;
  }

  const q = quiz.questions[order[currentIdx]];
  const progress = ((currentIdx + 1) / order.length) * 100;

  return (
    <div className="quiz-container">
    
      <div className="quiz-header">
        <div>
          <h1>{quiz.title}</h1>
          <p>Question {currentIdx + 1} of {order.length}</p>
        </div>

        <div className="timer">
          {timeLeft !== null
            ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`
            : "No Timer"}
        </div>
      </div>

      
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

    
      <div className="main">
        <div className="question-box">
          <h2>Question {currentIdx + 1}. {q.text}</h2>

          <div className="options">
            {q.options.map((opt, i) => (
              <div
                key={i}
                className={`option-row ${answers[currentIdx] === i ? "selected-row" : ""}`}
                onClick={() => selectOption(i)}
              >
                <div className={`option-box ${answers[currentIdx] === i ? "active" : ""}`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <div className="option-text">{opt}</div>
              </div>
            ))}
          </div>

          
          <div className="nav">
            <button
              className="Prev"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((p) => p - 1)}
            >
              Prev
            </button>

            {currentIdx === order.length - 1 ? (
              <button className="finish" onClick={handleFinish}>
                Finish Quiz
              </button>
            ) : (
              <button className="Next" onClick={() => setCurrentIdx((p) => p + 1)}>
                Next
              </button>
            )}
          </div>
        </div>  
      </div>
    </div>
  );
};

export default QuizActive;