import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/AdminAssignTask.css";

const ROLE_NAMES = {
  1: "Admin",
  2: "Project Manager",
  3: "Developer",
  4: "Client",
};

export default function AdminAssignTask() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3001/admin/projects"),
      fetch("http://localhost:3001/admin/tasks"),
      fetch("http://localhost:3001/admin/users"),
    ])
      .then(async ([pRes, tRes, uRes]) => {
        const [pData, tData, uData] = await Promise.all([
          pRes.json(), tRes.json(), uRes.json()
        ]);
        setProjects(pData);
        setTasks(tData);
        setUsers(uData);
      })
      .catch(err => console.error("Error fetching admin data:", err));
  }, []);

  const handleProjectChange = (e) => {
    const pid = e.target.value;
    setSelectedProject(pid);
    setSelectedTask("");
    setFilteredTasks(pid ? tasks.filter(t => t.project_id === +pid) : []);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedTask || !selectedUser) {
      setMessage("❌ Please select both task and developer.");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:3001/admin/tasks/${selectedTask}/assign`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: selectedUser })
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Task assigned successfully!");
      } else {
        setMessage(data.error || "❌ Failed to assign task");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error assigning task");
    }
  };

  return (
    <div className="admin-assign-task">
      <div className="admin-assign-task-container">
        <h1 className="admin-assign-task-title">Assign Task</h1>

        <form onSubmit={handleAssign} className="admin-assign-task-form">
          <div className="admin-assign-task-form-group">
            <label className="admin-assign-task-label">Project</label>
            <select
              value={selectedProject}
              onChange={handleProjectChange}
              className="admin-assign-task-select"
              required
            >
              <option value="">Select Project</option>
              {projects.map(p => (
                <option key={p.project_id} value={p.project_id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-assign-task-form-group">
            <label className="admin-assign-task-label">Task</label>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              disabled={!filteredTasks.length}
              className="admin-assign-task-select"
              required
            >
              <option value="">Select Task</option>
              {filteredTasks.map(t => (
                <option key={t.task_id} value={t.task_id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-assign-task-form-group">
            <label className="admin-assign-task-label">Developer</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="admin-assign-task-select"
              required
            >
              <option value="">Select Developer</option>
              {users
                .filter(u => u.role_id === 3)
                .map(u => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.username} ({ROLE_NAMES[u.role_id]})
                  </option>
                ))}
            </select>
          </div>

          <button type="submit" className="admin-assign-task-button">
            Assign Task
          </button>

          {message && (
            <div className="admin-assign-task-error">
              {message}
            </div>
          )}
        </form>

        <button 
          onClick={() => navigate(-1)} 
          className="admin-assign-task-button"
          style={{ marginTop: '2rem' }}
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
}
