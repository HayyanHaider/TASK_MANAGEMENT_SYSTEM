// src/assets/pages/project-manager/UpdateTask.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../../../components/ui/button";

export default function UpdateTask() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    status: "",
    priority: "",
    assigned_to: "",
  });
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTaskDetails();
    fetchDevelopers();
  }, []);

  const fetchTaskDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/pm/tasks/${taskId}`);
      setTaskData(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load task details");
      setLoading(false);
    }
  };

  const fetchDevelopers = async () => {
    try {
      const res = await axios.get("http://localhost:3001/pm/developers");
      setDevelopers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3001/pm/tasks/${taskId}`, taskData);
      alert("Task updated successfully!");
      navigate(`/pm/projects/${taskData.project_id}/tasks`);
    } catch (err) {
      console.error("Error updating task:", err);
      alert("Failed to update task.");
    }
  };

  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Update Task</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Title</label>
          <input
            name="title"
            value={taskData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold">Description</label>
          <textarea
            name="description"
            value={taskData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block font-semibold">Status</label>
          <select
            name="status"
            value={taskData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold">Priority</label>
          <select
            name="priority"
            value={taskData.priority}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold">Assign To</label>
          <select
            name="assigned_to"
            value={taskData.assigned_to}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Unassigned</option>
            {developers.map((dev) => (
              <option key={dev.user_id} value={dev.user_id}>
                {dev.username}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit">Update Task</Button>
      </form>
    </div>
  );
}
