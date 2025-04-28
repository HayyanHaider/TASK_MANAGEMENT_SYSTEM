import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLogoAnimating, setIsLogoAnimating] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentPath, setCurrentPath] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoClick = (e) => {
    e.preventDefault();
    setCurrentPath(location.pathname);
    setIsLogoAnimating(true);
    setShowAnimation(true);
    
    setTimeout(() => {
      setShowAnimation(false);
      if (currentPath) {
        navigate(currentPath);
      } else if (isAuthenticated) {
        navigate(getRoleBasedLink());
      }
    }, 2500);

    setTimeout(() => {
      setIsLogoAnimating(false);
    }, 2300);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getRoleBasedLink = () => {
    switch (localStorage.getItem("role_id")) {
      case "1":
        return "/admin";
      case "2":
        return "/project-manager";
      case "3":
        return "/developer";
      case "4":
        return "/client";
      default:
        return "/";
    }
  };

  return (
    <>
    <nav className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-container">
          <div className="navbar-left">
            <Link to={isAuthenticated ? getRoleBasedLink() : "/"} className="navbar-logo" onClick={handleLogoClick}>
              <div className={`navbar-logo-container ${isLogoAnimating ? 'animate-logo' : ''}`}>
                <img 
                  src="/images/task-logo.pnh.png"
                  alt="Jogi Logo" 
                  className="navbar-logo-image" 
                />
              </div>
          <span className="navbar-logo-text">Jogi</span>
          <span className="navbar-logo-accent">Task Manager</span>
        </Link>
          </div>

          <div className="navbar-right">
        <div className="navbar-links">
              <Link to="/" className="navbar-link navbar-link-home">
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to={getRoleBasedLink()} className="navbar-link">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="navbar-link navbar-link-logout">
                    Logout
                  </button>
                </>
              ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-link navbar-link-register">
                Register
              </Link>
            </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showAnimation && (
        <div className="animation-overlay">
          <div className="animation-content">
            <div className="animation-message">I love Jogi Bhai</div>
            <div className="firework-container">
              <div className="firework"></div>
              <div className="firework"></div>
              <div className="firework"></div>
              <div className="firework"></div>
              <div className="firework"></div>
            </div>
        </div>
      </div>
      )}
    </>
  );
};

export default Navbar;
