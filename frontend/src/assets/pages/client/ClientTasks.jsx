// src/assets/pages/client/ClientTasks.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardContent } from '../../../components/ui/card';

export default function ClientTasks() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setError('No token found. Please login.');
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:3001/client/projects/${projectId}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      console.log('Tasks fetched:', res.data); // <--- for checking
      setTasks(res.data.tasks || res.data); // depending on backend
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks.');
      setLoading(false);
    });
  }, [projectId, token]);

  if (loading) return <div className="p-8">Loading tasks…</div>;
  if (error)   return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      {tasks.length > 0 ? (
        tasks.map(task => (
          <Card key={task.task_id} className="shadow-md hover:shadow-lg transition">
            <CardHeader className="text-lg font-semibold">{task.title}</CardHeader>
            <CardContent className="space-y-2">
              {task.description && (
                <p><strong>Description:</strong> {task.description}</p>
              )}
              <p><strong>Status:</strong> {task.status}</p>
              <p><strong>Priority:</strong> {task.priority}</p>
              <p><strong>Created:</strong> {new Date(task.created_at).toLocaleString()}</p>

              {task.subtasks && task.subtasks.length > 0 && (
                <>
                  <h4 className="font-medium mt-2">Subtasks:</h4>
                  <ul className="list-disc pl-6">
                    {task.subtasks.map(sub => (
                      <li key={sub.subtask_id}>
                        <span className="font-medium">{sub.title}</span> — 
                        <span className="text-gray-600 ml-1 italic">{sub.status}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="italic">No tasks available for this project.</p>
      )}
    </div>
  );
}
