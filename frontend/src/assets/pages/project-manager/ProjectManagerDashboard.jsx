import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../../styles/ProjectManagerDashboard.css"

export default function ProjectManagerDashboard() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:3001/pm/projects", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setProjects(res.data))
    .catch(err => {
      console.error(err);
      setError("Failed to load projects");
    });
  }, []);

  if (error) {
    return <div className="pm-error-message">{error}</div>;
  }

  return (
    <div className="pm-dashboard-container">
      <div className="pm-dashboard-header">
        <h1 className="pm-dashboard-title">My Projects</h1>
        <button
          className="pm-dashboard-button"
          onClick={() => navigate("/pm/projects/new")}
        >
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="pm-error-message">No projects found.</p>
      ) : (
        <div className="pm-projects-list">
          {projects.map(proj => (
            <div key={proj.project_id} className="pm-project-card">
              <div className="pm-project-info">
                <h2 className="pm-project-name">{proj.name}</h2>
                <p className="pm-project-description">{proj.description}</p>
                <p className="pm-project-date">
                  {new Date(proj.created_at).toLocaleString()}
                </p>
              </div>
              <div className="pm-project-actions">
                <button
                  className="pm-project-action-button"
                  onClick={() => navigate(`/pm/projects/${proj.project_id}/edit`)}
                >
                  Edit
                </button>
                <button
                  className="pm-project-action-button"
                  onClick={async () => {
                    if (!confirm("Delete project?")) return;
                    try {
                      const token = localStorage.getItem("token");
                      await axios.delete(
                        `http://localhost:3001/pm/projects/${proj.project_id}`,
                        { headers: { Authorization: `Bearer ${token}` }
                      });
                      setProjects(p => p.filter(x => x.project_id !== proj.project_id));
                    } catch {
                      alert("Delete failed");
                    }
                  }}
                >
                  Delete
                </button>
                <button
                  className="pm-project-action-button"
                  onClick={() => navigate(`/pm/projects/${proj.project_id}`)}
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
