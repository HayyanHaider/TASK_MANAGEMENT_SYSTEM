// src/assets/pages/developer/DeveloperSubtasks.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import "../../../styles/DeveloperSubtasks.css";

export default function DeveloperSubtasks() {
  const { taskId } = useParams();
  const [subs, setSubs] = useState([]);
  const [editStatus, setEditStatus] = useState({});
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const loadSubs = () => {
    axios
      .get(`http://localhost:3001/developer/tasks/${taskId}/subtasks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSubs(res.data))
      .catch((err) => console.error('Failed to load subtasks:', err));
  };

  useEffect(() => {
    if (taskId) loadSubs();
  }, [taskId]);

  const startEditing = (subtask) => {
    setEditStatus({
      subtask_id: subtask.subtask_id,
      newStatus: subtask.status,
    });
  };

  const cancelEditing = () => {
    setEditStatus({});
  };

  const saveStatus = () => {
    axios
      .put(
        `http://localhost:3001/developer/subtasks/${editStatus.subtask_id}`,
        { status: editStatus.newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setEditStatus({});
        loadSubs();
      })
      .catch((err) => console.error('Failed to update subtask:', err));
  };

  return (
    <div className="developer-subtasks">
      <div className="developer-subtasks-container">
        <h2 className="developer-subtasks-title">Subtasks</h2>

        <div className="developer-subtasks-list">
          {subs.map((sub) => (
            <div key={sub.subtask_id} className="developer-subtasks-item">
              <div className="developer-subtasks-item-header">
                <span className="developer-subtasks-item-title">{sub.title}</span>
                <span className="developer-subtasks-item-status">
                  {editStatus.subtask_id === sub.subtask_id ? (
                    <select
                      value={editStatus.newStatus}
                      onChange={(e) =>
                        setEditStatus((prev) => ({
                          ...prev,
                          newStatus: e.target.value,
                        }))
                      }
                      className="developer-subtasks-input"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  ) : (
                    <>Status: {sub.status}</>
                  )}
                </span>
              </div>
              <div className="developer-subtasks-item-description">
                {sub.description}
              </div>
              <div className="developer-subtasks-item-actions">
                {editStatus.subtask_id === sub.subtask_id ? (
                  <>
                    <button className="developer-subtasks-button" onClick={saveStatus}>
                      Save
                    </button>
                    <button className="developer-subtasks-button" onClick={cancelEditing}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="developer-subtasks-button" onClick={() => startEditing(sub)}>
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}

          {!subs.length && (
            <p className="developer-subtasks-text">No subtasks available for this task.</p>
          )}
        </div>

        <button
          className="developer-subtasks-button"
          onClick={() => navigate(-1)}
        >
          Go Back to Task Details
        </button>
      </div>
    </div>
  );
}
