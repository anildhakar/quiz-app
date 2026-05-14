import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import "./Navbar.css";

export const Navbar = () => {
  const { isAdmin, user, logoutAdmin, logoutUser, isInitialized } =
    useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (isAdmin) {
      await logoutAdmin();
      navigate("/admin/login");
    } else {
      logoutUser();
      navigate("/");
    }
  };

  if (!isInitialized) {
    return <header className="navbar-skeleton"></header>;
  }

  return (
    <header className="navbar">

      <div className="navbar-container">

        
        <Link to="/" className="logo">
          <div className="logo-box">🔷</div>
          <span className="logo-text">quizapp</span>
        </Link>

        
        <nav className="nav-links">

          
          {isAdmin ? (
            <>
              <Link to="/admin/dashboard" className="nav-item">
               Dashboard
              </Link>

              <button className="btn logout" onClick={handleLogout}>
              Logout
              </button>
            </>
          ) : (
            <>
            
              {user ? (
                <>
                  <Link to="/profile" className="nav-item">
                     {user.displayName}
                  </Link>

                  <button className="btn logout" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                
                <Link to="/admin/login" className="nav-item">
                  Admin Login 
                </Link>
              )}
            </>
          )}

        </nav>
      </div>
    </header>
  );
};