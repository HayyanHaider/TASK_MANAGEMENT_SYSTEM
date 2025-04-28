import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../../../styles/ProjectManagerEdit.css";

export default function ProjectManagerEdit() {
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { projectId } = useParams();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3001/pm/projects/${projectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { name, description } = response.data;
        setForm({ name, description });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch project details.");
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3001/pm/projects/${projectId}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/pm/projects");
    } catch (err) {
      console.error(err);
      setError("Failed to update project. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="pm-edit-container">
        <div className="pm-edit-wrapper">
          <div className="pm-edit-loading">Loading project details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pm-edit-container">
      <div className="pm-edit-wrapper">
        <h1 className="pm-edit-title">Edit Project</h1>
        
        {error && <div className="pm-edit-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="pm-edit-form">
          <input
            type="text"
            name="name"
            placeholder="Project Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="pm-edit-input"
            required
          />
          <textarea
            name="description"
            placeholder="Project Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="pm-edit-textarea"
            rows={4}
            required
          />
          <button type="submit" className="pm-edit-button">
            Update Project
          </button>
          <button
            type="button"
            className="pm-edit-button"
            onClick={() => navigate("/pm/projects")}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
