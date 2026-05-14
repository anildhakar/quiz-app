import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cacheOps } from "../../services/db";
import { generateId } from "../../services/utils";
import "./QuizEditor.css";

const QuizEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [quiz, setQuiz] = useState({
    id: generateId(),
    title: "",
    description: "",
    timeLimitMinutes: "", 
    visibility: "public",
    passScore: "", 
    isPublished: false,
    createdAt: new Date().toISOString(),
    questions: [],
  });

  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    const loadQuiz = async () => {
      if (isEdit) {
        const data = await cacheOps.getQuiz(id);
        if (data) {
          setQuiz({
            ...data,
            questions: data.questions || [],
          });
        }
        setLoading(false);
      }
    };
    loadQuiz();
  }, [id, isEdit]);

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      explanation: "",
    };
    setQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const removeQuestion = (index) => {
    const updated = [...quiz.questions];
    updated.splice(index, 1);
    setQuiz((prev) => ({ ...prev, questions: updated }));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...quiz.questions];
    updated[index][field] = value;
    setQuiz((prev) => ({ ...prev, questions: updated }));
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...quiz.questions];
    updated[qIndex].options[oIndex] = value;
    setQuiz((prev) => ({ ...prev, questions: updated }));
  };

  const handleSave = async (publish) => {
    if (!quiz.title.trim()) {
      alert("Title required");
      return;
    }
    const cleanQuestions = quiz.questions.filter((q) => q.text && q.text.trim() !== "");
    if (cleanQuestions.length === 0) {
      alert("Add at least one valid question");
      return;
    }

    const finalQuiz = {
      ...quiz,
      timeLimitMinutes: Number(quiz.timeLimitMinutes) || 0,
      passScore: Number(quiz.passScore) || null,
      questions: cleanQuestions,
      isPublished: publish || quiz.isPublished,
    };

    await cacheOps.saveQuiz(finalQuiz);
    navigate("/admin/dashboard");
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="quiz-container">
      <div className="header">
        <button className="back" onClick={() => navigate("/admin/dashboard")}>← Back</button>
        <h1>{isEdit ? "Edit Quiz" : "Create Quiz"}</h1>
      </div>

      <div className="section">
        <h2>Quiz Details</h2>
        <input
          className="input"
          placeholder="Quiz Title"
          value={quiz.title}
          onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
        />
        <textarea
          className="textarea"
          placeholder="Description"
          value={quiz.description}
          onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
        />
        
        <input
          type="number"
          className="input"
          placeholder="Enter Time limit in minutes"
          value={quiz.timeLimitMinutes}
          onChange={(e) => setQuiz({ ...quiz, timeLimitMinutes: e.target.value })}
        />

        <input
          type="number"
          className="input"
          placeholder="Enter Passing Score %"
          value={quiz.passScore}
          onChange={(e) => setQuiz({ ...quiz, passScore: e.target.value })}
        />
      </div>

      <div className="section">
        <h2>Questions ({quiz.questions.length})</h2>
        {quiz.questions.map((q, qIndex) => (
          <div key={q.id} className="card">
            <div className="card-header">
              <span>Q{qIndex + 1}</span>
              <button className="delete" onClick={() => removeQuestion(qIndex)}>Delete</button>
            </div>
            <textarea
              className="textarea"
              placeholder="Question"
              value={q.text}
              onChange={(e) => updateQuestion(qIndex, "text", e.target.value)}
            />
            <div className="options">
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="option-row">
                  <button
                    className={q.correctIndex === oIndex ? "option active" : "option"}
                    onClick={() => updateQuestion(qIndex, "correctIndex", oIndex)}
                  >
                    {String.fromCharCode(65 + oIndex)}
                  </button>
                  <input
                    className="input"
                    value={opt}
                    placeholder={`Option ${oIndex + 1}`}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <input
              className="input"
              placeholder="Explanation"
              value={q.explanation}
              onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
            />
          </div>
        ))}
        <button className="add-btn" onClick={addQuestion}>+ Add Question</button>
      </div>

      <div className="actions">
        <button className="draft" onClick={() => handleSave(false)}>Save Draft</button>
        <button className="publish" onClick={() => handleSave(true)}>Save & Publish</button>
      </div>
    </div>
  );
};

export default QuizEditor;