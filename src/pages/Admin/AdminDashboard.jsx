import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cacheOps } from "../../services/db";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    const data = await cacheOps.getAllQuizzes();

    const sorted = data.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    setQuizzes(sorted);
    setLoading(false);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-container">
      
      <div className="header">
        <h1>Admin Dashboard</h1>

        <button
          className="create-btn"
          onClick={() => navigate("/admin/quiz/new")}
        >
          + Create Quiz
        </button>
      </div>

      
      {quizzes.length === 0 ? (
        <div className="empty">
          <p>No quizzes yet. Create your first one!</p>

          <button
            className="secondary-btn"
            onClick={() => navigate("/admin/quiz/new")}
          >
            Get Started
          </button>
        </div>
      ) : (
      
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Questions</th>
                <th>Status</th>
                <th>Visibility</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id}>
                  {/* TITLE */}
                  <td>
                    <div className="title">{quiz.title}</div>
                    <div className="date">
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                
                  <td>
                    <div>{quiz.questions?.length || 0}</div>

                    <div 
                    style={{
                        fontSize: "14px",
                        color: "#010101",
                        marginTop: "28px",
                      }}
                    >
                      {quiz.questions?.map((q, i) => (
                        <div key={i}>
                          Q{i + 1}: {q.text || "No question text"}
                        </div>
                      ))}
                    </div>
                  </td>

                  
                  <td>
                    <button
                      onClick={() => togglePublish(quiz)}
                      className={
                        quiz.isPublished ? "status published" : "status draft"
                      }
                    >
                      {quiz.isPublished ? "Published" : "Draft"}
                    </button>
                  </td>

                
                  <td>
                    <span
                      className={
                        quiz.visibility === "public"
                          ? "badge public"
                          : "badge private"
                      }
                    >
                      {quiz.visibility}
                    </span>
                  </td>

                  
                  <td>
                    <div className="actions">

                      <button className="result-btn">Results</button>

                      <button className="edit-btn" onClick={() => navigate(`/admin/quiz/${quiz.id}/edit`)}>Edit</button>

                      <button className="delete" onClick={() => {
                           if(window.confirm("Delete this quiz?")) {
                               cacheOps.deleteQuiz(quiz.id);
                                  window.location.reload(); // Refresh to update list
                                }}}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
