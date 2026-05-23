import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { loginAdmin, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      navigate("/admin/dashboard");
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = await loginAdmin(password);

    if (success) {
      navigate("/admin/dashboard");
    } else {
      setError("Invalid passkey");
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <h1 className="title">Admin Access</h1>

        <form onSubmit={handleSubmit} className="form">

          <label className="label">Credentials</label>

          <input
            type="password"
            placeholder="Enter passkey..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn">
            Authenticate
          </button>

        </form>


        <button className="back-btn" onClick={() => navigate("/")}>
          Back to Public Home page View
        </button>

      </div>


      <div className="footer">
        Strictly restricted access. Activities are logged locally.
      </div>

    </div>
  );
};

export default AdminLogin;