import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { cacheOps } from "../../services/db";
import { useAuth } from "../../hooks/useAuth";

import "./ReviewAnswer.css";

const ReviewAnswer = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (!id || !user) return;

      const quizData = await cacheOps.getQuiz(id);
      const attemptId = location.state?.attemptId;

      if (!quizData || !attemptId) {
        navigate(`/quiz/${id}`);
        return;
      }

      const allAttempts = await cacheOps.getAttemptsByUser(user.id);
      const myAttempt = allAttempts.find((a) => a.id === attemptId);

      setQuiz(quizData);
      setAttempt(myAttempt);
    }

    loadData();
  }, [id, user, location.state, navigate]);

  if (!quiz || !attempt) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="analysis-container">
      
      <div className="header-analysis">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h1>QUIZ REPORT</h1>

        <div className="score">
          {attempt.score}/{attempt.totalQuestions}
        </div>
      </div>

      <div className="questions">
        {attempt.questionOrder.map((qIdx, i) => {
          const question = quiz.questions[qIdx];
          const userAns = attempt.answers[i];
          const isCorrect = userAns === question.correctIndex;

          return (
            <div key={i} className="question-block">
              
              <div className="q-text">
                <span>Q{i + 1}.</span>
                <p>{question.text}</p>
              </div>

              <div className={isCorrect ? "answer-box correct" : "answer-box wrong"}>
                <p className="label">Your Answer:</p>
                <p>
                  {userAns === -1 ? "Not Answered" : question.options[userAns]}
                </p>
              </div>

              {!isCorrect && (
                <div className="correct-box">
                  <p className="label">Correct Answer:</p>
                  <p>{question.options[question.correctIndex]}</p>
                </div>
              )}

              {question.explanation && (
                <div className="explanation">
                  <strong>Explanation:</strong> {question.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewAnswer;