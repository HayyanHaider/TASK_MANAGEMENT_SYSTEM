import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../../styles/ProjectManagerCreate.css"

export default function ProjectManagerCreate() {
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3001/pm/projects",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/pm/projects");
    } catch (err) {
      console.error(err);
      setError("Failed to create project. Please try again.");
    }
  };

  return (
    <div className="pm-create-container">
      <div className="pm-create-wrapper">
        <h1 className="pm-create-title">Create New Project</h1>
        
        {error && <div className="pm-create-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="pm-create-form">
          <input
            type="text"
            name="name"
            placeholder="Project Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="pm-create-input"
            required
          />
          <textarea
            name="description"
            placeholder="Project Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="pm-create-textarea"
            rows={4}
            required
          />
          <button type="submit" className="pm-create-button">
            Create Project
          </button>
          <button
            type="button"
            className="pm-create-button"
            onClick={() => navigate("/pm/projects")}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
