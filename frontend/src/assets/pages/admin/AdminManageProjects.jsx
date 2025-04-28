import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../../styles/AdminManageProjects.css";

export default function AdminManageProjects() {
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "", description: "", created_at: ""
  });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:3001/admin/projects");
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const startEdit = (proj) => {
    setEditingId(proj.project_id);
    setFormData({
      name: proj.name,
      description: proj.description,
      created_at: new Date(proj.created_at).toISOString().slice(0, 16),
    });
    setMsg("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveUpdate = async (id) => {
    try {
      await axios.put(
        `http://localhost:3001/admin/projects/${id}`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );
      setMsg("✅ Project updated");
      setEditingId(null);
      fetchProjects();
    } catch (err) {
      console.error("Update failed:", err);
      setMsg("❌ Failed to update");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete project #" + id + "?")) return;
    try {
      await axios.delete(`http://localhost:3001/admin/projects/${id}`);
      setMsg("✅ Project deleted");
      fetchProjects();
    } catch (err) {
      console.error("Error deleting project:", err);
      setMsg("❌ Delete failed");
    }
  };

  const handleDetails = (id) => {
    navigate(`/admin/projects/${id}/details`);
  };

  return (
    <div className="admin-manage-projects">
      <div className="admin-manage-projects-container">
        <h1 className="admin-manage-projects-title">Manage Projects</h1>
        {msg && <div className="admin-manage-projects-error">{msg}</div>}

        <div className="admin-manage-projects-list">
          {projects.map((proj) => (
            <div key={proj.project_id} className="admin-manage-projects-card">
              <h2 className="admin-manage-projects-card-title">{proj.name}</h2>
              <div className="admin-manage-projects-card-content">
                {editingId === proj.project_id ? (
                  <div className="admin-manage-projects-form">
                    <div className="admin-manage-projects-form-group">
                      <label className="admin-manage-projects-label">Name</label>
                      <input
                        name="name"
                        className="admin-manage-projects-input"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="admin-manage-projects-form-group">
                      <label className="admin-manage-projects-label">Description</label>
                      <textarea
                        name="description"
                        className="admin-manage-projects-textarea"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                      />
                    </div>

                    <div className="admin-manage-projects-form-group">
                      <label className="admin-manage-projects-label">Created At</label>
                      <input
                        type="datetime-local"
                        name="created_at"
                        className="admin-manage-projects-input"
                        value={formData.created_at}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="admin-manage-projects-button-group">
                      <button 
                        onClick={() => saveUpdate(proj.project_id)}
                        className="admin-manage-projects-button"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="admin-manage-projects-button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="admin-manage-projects-text">
                      <strong>Description:</strong> {proj.description}
                    </p>
                    <p className="admin-manage-projects-text">
                      <strong>Created At:</strong> {new Date(proj.created_at).toLocaleString()}
                    </p>
                    <div className="admin-manage-projects-button-group">
                      <button 
                        onClick={() => startEdit(proj)}
                        className="admin-manage-projects-button"
                      >
                        Update
                      </button>
                      <button 
                        onClick={() => handleDelete(proj.project_id)}
                        className="admin-manage-projects-button admin-manage-projects-button-delete"
                      >
                        Delete
                      </button>
                      <button 
                        onClick={() => handleDetails(proj.project_id)}
                        className="admin-manage-projects-button"
                      >
                        Details
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => navigate('/admin')} 
          className="admin-manage-projects-button"
          style={{ marginTop: '2rem', width: '100%' }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
