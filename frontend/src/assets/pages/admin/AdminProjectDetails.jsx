// src/assets/pages/admin/AdminProjectDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../../styles/AdminProjectDetails.css";

export default function AdminProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ project: null, tasks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`http://localhost:3001/admin/projects/${projectId}/details`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load project details');
        setLoading(false);
      });
  }, [projectId]);

  if (loading) return <div className="admin-project-details-loading">Loading…</div>;
  if (error) return <div className="admin-project-details-error">{error}</div>;

  const { project, tasks } = data;

  return (
    <div className="admin-project-details">
      <div className="admin-project-details-container">
        <h1 className="admin-project-details-title">Project Details</h1>

        <div className="admin-project-details-card">
          <h2 className="admin-project-details-card-title">{project.name}</h2>
          <div className="admin-project-details-card-content">
            <p className="admin-project-details-text">
              <strong>Description:</strong> {project.description}
            </p>
            <p className="admin-project-details-text">
              <strong>Created By (User ID):</strong> {project.created_by}
            </p>
            <p className="admin-project-details-text">
              <strong>Created At:</strong> {new Date(project.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <h2 className="admin-project-details-subtitle">Tasks</h2>

        {tasks.length ? (
          <div className="admin-project-details-tasks">
            {tasks.map(task => (
              <div key={task.task_id} className="admin-project-details-task-card">
                <h3 className="admin-project-details-task-title">{task.title}</h3>
                <div className="admin-project-details-task-content">
                  <p className="admin-project-details-text">
                    <strong>Description:</strong> {task.description}
                  </p>
                  <p className="admin-project-details-text">
                    <strong>Status:</strong> {task.status}
                  </p>
                  <p className="admin-project-details-text">
                    <strong>Priority:</strong> {task.priority}
                  </p>
                  <p className="admin-project-details-text">
                    <strong>Assigned To:</strong> {task.username ? `${task.username} (${task.email})` : 'Unassigned'}
                  </p>
                  <p className="admin-project-details-text">
                    <strong>Created At:</strong> {new Date(task.created_at).toLocaleString()}
                  </p>

                  {/* Subtasks */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="admin-project-details-subtasks">
                      <h4 className="admin-project-details-subtasks-title">Subtasks</h4>
                      {task.subtasks.map(sub => (
                        <div key={sub.subtask_id} className="admin-project-details-subtask-card">
                          <h5 className="admin-project-details-subtask-title">{sub.title}</h5>
                          <div className="admin-project-details-subtask-content">
                            <p className="admin-project-details-text">
                              <strong>Status:</strong> {sub.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="admin-project-details-no-tasks">No tasks for this project.</p>
        )}

        <button 
          onClick={() => navigate('/admin/manage-projects')} 
          className="admin-project-details-button"
          style={{ marginTop: '2rem' }}
        >
          ← Back to Manage Projects
        </button>
      </div>
    </div>
  );
}
