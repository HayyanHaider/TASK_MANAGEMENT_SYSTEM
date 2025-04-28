import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../../styles/ClientDashboard.css";

export default function ClientDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:3001/client/projects", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading projects", err);
        setError("Failed to load projects");
        setLoading(false);
      });
  }, []);

  // Helper function to extract percentage number from progress string
  const getProgressNumber = (progress) => {
    if (!progress) return '0';
    return progress.replace('%', '');
  };

  if (loading) return <div className="client-dashboard-loading">Loading…</div>;
  if (error) return <div className="client-dashboard-error">{error}</div>;

  return (
    <div className="client-dashboard">
      <div className="client-dashboard-container">
        <h1 className="client-dashboard-title">Your Projects</h1>

        {projects.length === 0 ? (
          <p className="client-dashboard-text">You have no projects assigned yet.</p>
        ) : (
          <div className="client-dashboard-grid">
            {projects.map(proj => (
              <div key={proj.project_id} className="client-dashboard-card">
                <h2 className="client-dashboard-card-title">{proj.name}</h2>
                <div className="client-dashboard-text">
                  <p>{proj.description}</p>
                  <p><strong>Status:</strong> {proj.status || 'In Progress'}</p>
                  <p><strong>Created:</strong> {new Date(proj.created_at).toLocaleString()}</p>
                </div>

                {/* Progress Stats */}
                <div className="client-dashboard-stats">
                  <div className="client-dashboard-stat">
                    <div className="client-dashboard-stat-number">
                      {getProgressNumber(proj.progress)}%
                    </div>
                    <div className="client-dashboard-stat-label">
                      Completed
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/client/projects/${proj.project_id}`)}
                  className="client-dashboard-button"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
