// src/assets/pages/developer/DeveloperDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../../styles/DeveloperDashboard.css"; // ✅ Correct import

export default function DeveloperDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedStatuses, setUpdatedStatuses] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const loadTasks = () => {
    setLoading(true);
    axios
      .get('http://localhost:3001/developer/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setTasks(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch tasks:', err);
        setError('Failed to load tasks');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!token) {
      setError('Unauthorized. Please log in.');
      setLoading(false);
      return;
    }
    loadTasks();
  }, []);

  const handleStatusChange = (taskId, newStatus) => {
    setUpdatedStatuses(prev => ({ ...prev, [taskId]: newStatus }));
  };

  const updateStatus = async (taskId) => {
    const newStatus = updatedStatuses[taskId];
    if (!newStatus || newStatus === tasks.find(t => t.task_id === taskId)?.status) return;

    try {
      await axios.put(
        `http://localhost:3001/developer/tasks/${taskId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Status updated successfully!');
      loadTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
      console.error('Status update error:', err);
    }
  };

  if (loading) return <div className="developer-dashboard"><div className="developer-dashboard-container">Loading tasks…</div></div>;
  if (error) return <div className="developer-dashboard"><div className="developer-dashboard-container developer-dashboard-error">{error}</div></div>;

  return (
    <div className="developer-dashboard">
      <div className="developer-dashboard-container">
        <h1 className="developer-dashboard-title">My Tasks</h1>

        {!tasks.length && <p className="developer-dashboard-text">No tasks assigned yet.</p>}

        <div className="developer-dashboard-tasks">
          {tasks.map(task => (
            <div key={task.task_id} className="developer-dashboard-task-card">
              <h3 className="developer-dashboard-task-title">
                {task.title}
              </h3>
              <div className="developer-dashboard-task-details">
                <p>{task.description}</p>
                <p><strong>Priority:</strong> {task.priority}</p>
                <p><strong>Created:</strong> {new Date(task.created_at).toLocaleString()}</p>
                <p><strong>Status:</strong> {task.status}</p>

                <select
                  value={updatedStatuses[task.task_id] || task.status}
                  onChange={e => handleStatusChange(task.task_id, e.target.value)}
                  className="developer-dashboard-input"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <div className="developer-dashboard-actions">
                  <button className="developer-dashboard-button" onClick={() => updateStatus(task.task_id)}>
                    Update Status
                  </button>
                  <button className="developer-dashboard-button" onClick={() => navigate(`/developer/subtasks/${task.task_id}`)}>
                    View Subtasks
                  </button>
                  <button className="developer-dashboard-button" onClick={() => navigate(`/developer/time/${task.task_id}`)}>
                    Track Time
                  </button>
                  <button className="developer-dashboard-button" onClick={() => navigate(`/developer/attachments/${task.task_id}`)}>
                    Upload Attachment
                  </button>
                  <button className="developer-dashboard-button" onClick={() => navigate(`/developer/comments/${task.task_id}`)}>
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
