// src/assets/pages/project-manager/TaskSubtasks.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

export default function TaskSubtasks() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubtasks();
  }, []);

  const fetchSubtasks = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/pm/tasks/${taskId}/subtasks`);
      setSubtasks(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load subtasks");
      setLoading(false);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    if (!window.confirm("Are you sure you want to delete this subtask?")) return;
    try {
      await axios.delete(`http://localhost:3001/pm/subtasks/${subtaskId}`);
      setSubtasks((prev) => prev.filter((subtask) => subtask.subtask_id !== subtaskId));
    } catch (err) {
      console.error("Error deleting subtask:", err);
      alert("Failed to delete subtask.");
    }
  };

  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Subtasks for Task {taskId}</h1>
      {subtasks.length ? (
        subtasks.map((subtask) => (
          <Card key={subtask.subtask_id} className="mb-4">
            <CardHeader>{subtask.title}</CardHeader>
            <CardContent>
              <p><strong>Status:</strong> {subtask.status}</p>
              <div className="mt-4 flex space-x-2">
                <Button onClick={() => navigate(`/pm/subtasks/${subtask.subtask_id}/update`)}>Update</Button>
                <Button variant="destructive" onClick={() => handleDeleteSubtask(subtask.subtask_id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p>No subtasks found.</p>
      )}
      <Button onClick={() => navigate(`/pm/projects/${taskId}/tasks`)}>← Back to Tasks</Button>
    </div>
  );
}
