import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../../styles/PMProjectDetails.css";

export default function PMProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ project: null, tasks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [developers, setDevelopers] = useState([]);

  const [openSub, setOpenSub] = useState({});
  const [subTitle, setSubTitle] = useState({});

  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskData, setEditTaskData] = useState({ title: '', description: '', priority: 'Medium', assigned_to: '', status: 'Pending' });

  const [editSubtaskId, setEditSubtaskId] = useState(null);
  const [editSubtaskTitle, setEditSubtaskTitle] = useState('');
  const [editSubtaskStatus, setEditSubtaskStatus] = useState('Pending');

  const token = localStorage.getItem('token');

  const loadDetails = () => {
    setLoading(true);
    axios
      .get(`http://localhost:3001/pm/projects/${projectId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load project details');
        setLoading(false);
      });
  };

  const loadDevelopers = () => {
    axios
      .get('http://localhost:3001/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const devs = res.data.filter(u => u.role_id === 3);
        setDevelopers(devs);
      })
      .catch(err => console.error('Failed to load developers', err));
  };

  useEffect(() => {
    loadDetails();
    loadDevelopers();
  }, [projectId]);

  const handleCreateTask = async e => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return alert('Enter a task title');
    if (!assignedTo) return alert('Please assign the task to a developer');

    const status = 'Pending';

    try {
      await axios.post(
        `http://localhost:3001/pm/projects/${projectId}/tasks`,
        {
          title: newTaskTitle,
          description: newTaskDesc,
          priority: 'Medium',
          assigned_to: assignedTo,
          status
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTaskTitle('');
      setNewTaskDesc('');
      setAssignedTo('');
      setShowTaskForm(false);
      loadDetails();
    } catch (err) {
      console.error(err);
      alert('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId, e) => {
    e.preventDefault();

    const status = editTaskData.status || 'Pending';

    try {
      await axios.put(
        `http://localhost:3001/pm/tasks/${taskId}`,
        {
          title: editTaskData.title,
          description: editTaskData.description,
          priority: editTaskData.priority,
          assigned_to: editTaskData.assigned_to,
          status
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditTaskId(null);
      loadDetails();
    } catch (err) {
      console.error(err);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleCreateSubtask = async (taskId, e) => {
    e.preventDefault();
    const title = subTitle[taskId] || '';
    if (!title.trim()) return alert('Enter a subtask title');
    try {
      await axios.post(
        `http://localhost:3001/pm/tasks/${taskId}/subtasks`,
        { title, status: 'Pending' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubTitle(prev => ({ ...prev, [taskId]: '' }));
      setOpenSub(prev => ({ ...prev, [taskId]: false }));
      loadDetails();
    } catch (err) {
      console.error(err);
      alert('Failed to create subtask');
    }
  };

  const handleUpdateSubtask = async (subtaskId, e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:3001/pm/subtasks/${subtaskId}`,
        { title: editSubtaskTitle, status: editSubtaskStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditSubtaskId(null);
      loadDetails();
    } catch (err) {
      console.error(err);
      alert('Failed to update subtask');
    }
  };

  const handleDeleteTask = async taskId => {
    if (!window.confirm(`Delete task #${taskId}?`)) return;
    try {
      await axios.delete(`http://localhost:3001/pm/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadDetails();
    } catch (err) {
      console.error(err);
      alert('Failed to delete task');
    }
  };

  const handleDeleteSubtask = async (taskId, subId) => {
    if (!window.confirm(`Delete subtask #${subId}?`)) return;
    try {
      await axios.delete(`http://localhost:3001/pm/subtasks/${subId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadDetails();
    } catch (err) {
      console.error(err);
      alert('Failed to delete subtask');
    }
  };

  if (loading) return <div className="pm-details-loading">Loading…</div>;
  if (error) return <div className="pm-details-error">{error}</div>;

  const { project, tasks } = data;
  if (!project) return <div className="pm-details-error">Project not found.</div>;

  return (
    <div className="pm-details-container">
      <div className="pm-details-wrapper">
        <div className="pm-details-header">
          <div className="pm-details-title-section">
            <h1 className="pm-details-title">{project.name}</h1>
            <p className="pm-details-description">{project.description}</p>
          </div>
          <button className="pm-details-button" onClick={() => navigate('/pm/projects')}>
            ← Back to My Projects
          </button>
        </div>

        <button 
          className="pm-details-button"
          onClick={() => setShowTaskForm(v => !v)}
        >
          {showTaskForm ? 'Cancel' : '+ Add New Task'}
        </button>

        {showTaskForm && (
          <form onSubmit={handleCreateTask} className="pm-details-form">
            <input
              type="text"
              placeholder="Task Title"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="pm-details-input"
              required
            />
            <textarea
              placeholder="Task Description (optional)"
              value={newTaskDesc}
              onChange={e => setNewTaskDesc(e.target.value)}
              className="pm-details-textarea"
              rows={3}
            />
            <select
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              className="pm-details-select"
              required
            >
              <option value="">-- Select Developer --</option>
              {developers.map(dev => (
                <option key={dev.user_id} value={dev.user_id}>
                  {dev.username} ({dev.email})
                </option>
              ))}
            </select>
            <button type="submit" className="pm-details-button">Save Task</button>
          </form>
        )}

        <div className="pm-details-tasks">
          {tasks.map(task => (
            <div key={task.task_id} className="pm-details-task-card">
              <div className="pm-details-task-header">
                <h2 className="pm-details-task-title">Task: {task.title}</h2>
                <div className="pm-details-task-actions">
                  <button
                    className="pm-details-button secondary"
                    onClick={() => {
                      setEditTaskId(task.task_id);
                      setEditTaskData({
                        title: task.title,
                        description: task.description || '',
                        priority: task.priority || 'Medium',
                        assigned_to: task.assigned_to || '',
                        status: task.status || 'Pending'
                      });
                    }}
                  >
                    Edit Task
                  </button>
                  <button
                    className="pm-details-button delete"
                    onClick={() => handleDeleteTask(task.task_id)}
                  >
                    Delete Task
                  </button>
                </div>
              </div>

              <div className="pm-details-task-content">
                <p><strong>Status:</strong> {task.status}</p>
                <p><strong>Priority:</strong> {task.priority}</p>
                <p><strong>Assigned To:</strong> {task.username ? `${task.username} (${task.email})` : 'Unassigned'}</p>
                <p><strong>Created At:</strong> {new Date(task.created_at).toLocaleString()}</p>
                {task.description && <p><strong>Description:</strong> {task.description}</p>}

                {editTaskId === task.task_id && (
                  <form onSubmit={e => handleUpdateTask(task.task_id, e)} className="pm-details-form">
                    <input
                      type="text"
                      value={editTaskData.title}
                      onChange={e => setEditTaskData({ ...editTaskData, title: e.target.value })}
                      className="pm-details-input"
                      required
                    />
                    <textarea
                      value={editTaskData.description}
                      onChange={e => setEditTaskData({ ...editTaskData, description: e.target.value })}
                      className="pm-details-textarea"
                      rows={2}
                    />
                    <select
                      value={editTaskData.priority}
                      onChange={e => setEditTaskData({ ...editTaskData, priority: e.target.value })}
                      className="pm-details-select"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <select
                      value={editTaskData.assigned_to}
                      onChange={e => setEditTaskData({ ...editTaskData, assigned_to: e.target.value })}
                      className="pm-details-select"
                    >
                      <option value="">-- Select Developer --</option>
                      {developers.map(dev => (
                        <option key={dev.user_id} value={dev.user_id}>
                          {dev.username} ({dev.email})
                        </option>
                      ))}
                    </select>
                    <div className="pm-details-button-group">
                      <button type="submit" className="pm-details-button">Update Task</button>
                      <button
                        type="button"
                        className="pm-details-button secondary"
                        onClick={() => setEditTaskId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {task.subtasks?.length > 0 && (
                  <div className="pm-details-subtasks">
                    <h3 className="pm-details-subtasks-title">Subtasks:</h3>
                    {task.subtasks.map(sub => (
                      <div key={sub.subtask_id} className="pm-details-subtask">
                        <span>{sub.title} <em className="pm-details-subtask-status">({sub.status})</em></span>
                        <div className="pm-details-subtask-actions">
                          <button
                            className="pm-details-button secondary"
                            onClick={() => {
                              setEditSubtaskId(sub.subtask_id);
                              setEditSubtaskTitle(sub.title);
                              setEditSubtaskStatus(sub.status);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="pm-details-button delete"
                            onClick={() => handleDeleteSubtask(task.task_id, sub.subtask_id)}
                          >
                            Delete
                          </button>
                        </div>

                        {editSubtaskId === sub.subtask_id && (
                          <form onSubmit={e => handleUpdateSubtask(sub.subtask_id, e)} className="pm-details-form">
                            <input
                              type="text"
                              value={editSubtaskTitle}
                              onChange={e => setEditSubtaskTitle(e.target.value)}
                              className="pm-details-input"
                              required
                            />
                            <select
                              value={editSubtaskStatus}
                              onChange={e => setEditSubtaskStatus(e.target.value)}
                              className="pm-details-select"
                              required
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                            <div className="pm-details-button-group">
                              <button type="submit" className="pm-details-button">Update Subtask</button>
                              <button
                                type="button"
                                className="pm-details-button secondary"
                                onClick={() => setEditSubtaskId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pm-details-add-subtask">
                  <button
                    className="pm-details-button secondary"
                    onClick={() => setOpenSub(prev => ({ ...prev, [task.task_id]: !prev[task.task_id] }))}
                  >
                    {openSub[task.task_id] ? 'Cancel' : '+ Add Subtask'}
                  </button>
                  {openSub[task.task_id] && (
                    <form onSubmit={e => handleCreateSubtask(task.task_id, e)} className="pm-details-form">
                      <input
                        type="text"
                        placeholder="Subtask Title"
                        value={subTitle[task.task_id] || ''}
                        onChange={e => setSubTitle(prev => ({ ...prev, [task.task_id]: e.target.value }))}
                        className="pm-details-input"
                        required
                      />
                      <button type="submit" className="pm-details-button">Save Subtask</button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
