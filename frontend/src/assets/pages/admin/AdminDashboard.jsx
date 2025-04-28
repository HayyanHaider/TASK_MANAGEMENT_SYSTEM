import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [u, p, t] = await Promise.all([
        axios.get("http://localhost:3001/admin/users"),
        axios.get("http://localhost:3001/admin/projects"),
        axios.get("http://localhost:3001/admin/tasks"),
      ]);
      setUsers(u.data);
      setProjects(p.data);
      setTasks(t.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => navigate("/admin/add-user");
  const handleAssignTasks = () => navigate("/admin/assign-tasks");
  const handleManageProjects = () => navigate("/admin/manage-projects");

  if (loading) {
    return <div className="admin-dashboard-loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-container">
        <h1 className="admin-dashboard-title">Admin Dashboard</h1>

        <div className="admin-dashboard-stats">
          {/* Users Card */}
          <div className="admin-dashboard-stat">
            <div className="admin-dashboard-stat-number">{users.length}</div>
            <div className="admin-dashboard-stat-label">Total Users</div>
            <button className="admin-dashboard-button" onClick={handleAddUser}>
              Add New User
            </button>
          </div>

          {/* Projects Card */}
          <div className="admin-dashboard-stat">
            <div className="admin-dashboard-stat-number">{projects.length}</div>
            <div className="admin-dashboard-stat-label">Total Projects</div>
            <button className="admin-dashboard-button" onClick={handleManageProjects}>
              Manage Projects
            </button>
          </div>

          {/* Tasks Card */}
          <div className="admin-dashboard-stat">
            <div className="admin-dashboard-stat-number">{tasks.length}</div>
            <div className="admin-dashboard-stat-label">Total Tasks</div>
            <button className="admin-dashboard-button" onClick={handleAssignTasks}>
              Assign Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
