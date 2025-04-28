// src/assets/pages/developer/DeveloperTaskDetails.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export default function DeveloperTaskDetails() {
  const { taskId } = useParams();S
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    axios.get(`http://localhost:3001/developer/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        setTask(res.data.task);
        setSubtasks(res.data.subtasks);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load task');
        setLoading(false);
      });
  }, [taskId]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader className="text-2xl font-semibold">{task.title}</CardHeader>
        <CardContent className="space-y-2">
          {task.description && <p><strong>Description:</strong> {task.description}</p>}
          <p><strong>Status:</strong> {task.status}</p>
          <p><strong>Priority:</strong> {task.priority}</p>
          <p><strong>Created:</strong> {new Date(task.created_at).toLocaleString()}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">← Back</Button>
        </CardContent>
      </Card>

      {subtasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Subtasks</h2>
          <div className="space-y-4">
            {subtasks.map(sub => (
              <Card key={sub.subtask_id}>
                <CardContent className="space-y-1">
                  <p><strong>Title:</strong> {sub.title}</p>
                  <p><strong>Status:</strong> {sub.status}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
