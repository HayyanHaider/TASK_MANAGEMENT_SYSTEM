import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../../../styles/ProjectTasks.css";

export default function CreateTask() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!priority) {
      setError("Please select a priority level.");
      return;
    }
    try {
      await axios.post(`http://localhost:3001/pm/projects/${projectId}/tasks`, {
        title,
        description,
        priority,
        assigned_to: assignedTo,
        status,
      });
      navigate(`/pm/projects/${projectId}/tasks`);
    } catch (error) {
      console.error("Error creating task:", error);
      setError("Failed to create task. Please try again.");
    }
  };

  return (
    <div className="project-tasks-container">
      <div className="project-tasks-wrapper">
        <h2 className="project-tasks-title">Create New Task</h2>
        
        {error && <div className="project-tasks-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="project-tasks-form">
          <div className="project-tasks-form-group">
            <label className="project-tasks-label">Task Title</label>
            <input
              type="text"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="project-tasks-input"
            />
          </div>

          <div className="project-tasks-form-group">
            <label className="project-tasks-label">Description</label>
            <textarea
              placeholder="Enter task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="project-tasks-textarea"
              rows={4}
            />
          </div>

          <div className="project-tasks-form-group">
            <label className="project-tasks-label">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              required
              className="project-tasks-select"
            >
              <option value="" disabled>Select Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="project-tasks-form-group">
            <label className="project-tasks-label">Assigned To</label>
            <input
              type="text"
              placeholder="Enter developer name"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="project-tasks-input"
            />
          </div>

          <div className="project-tasks-form-group">
            <label className="project-tasks-label">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="project-tasks-select"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          <div className="project-tasks-button-group">
            <button type="submit" className="project-tasks-button">
              Create Task
            </button>
            <button
              type="button"
              className="project-tasks-button secondary"
              onClick={() => navigate(`/pm/projects/${projectId}`)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
