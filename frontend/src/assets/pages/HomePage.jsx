import React from "react";
import { useAuth } from "../../context/AuthContext";
import '../../styles/HomePage.css';

export default function HomePage() {
  return (
    <div className="homepage">
      <main className="homepage-hero">
        <div className="homepage-content">
          <h1 className="homepage-title">JOGI TASK MANAGER</h1>
          <p className="homepage-subtitle">
            A comprehensive project management system where Project Managers can create and assign tasks, 
            Developers can efficiently manage their work, and Clients can track project progress. 
            From task creation to completion, we streamline your project workflow for maximum productivity.
          </p>
        </div>
      </main>

      <footer className="homepage-footer">
        © 2025 Jogi Task Manager
      </footer>
    </div>
  );
}
