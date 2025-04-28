// src/assets/pages/project-manager/UpdateSubtask.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../../../components/ui/button";

const UpdateSubtask = () => {
  const { subtaskId } = useParams();
  const navigate = useNavigate();
  const [subtaskData, setSubtaskData] = useState({
    title: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubtaskDetails();
  }, []);

  const fetchSubtaskDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/pm/subtasks/${subtaskId}`);
      setSubtaskData(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load subtask details");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSubtaskData({ ...subtaskData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3001/pm/subtasks/${subtaskId}`, subtaskData);
      alert("Subtask updated successfully!");
      navigate(-1); // Go back to the previous page
    } catch (err) {
      console.error("Error updating subtask:", err);
      alert("Failed to update subtask.");
    }
  };

  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Update Subtask</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Title</label>
          <input
            name="title"
            value={subtaskData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold">Status</label>
          <select
            name="status"
            value={subtaskData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <Button type="submit">Update Subtask</Button>
      </form>
    </div>
  );
};

export default UpdateSubtask;
