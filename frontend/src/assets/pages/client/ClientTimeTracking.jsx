// src/assets/pages/client/ClientTimeTracking.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardContent } from '../../../components/ui/card';

export default function ClientTimeTracking() {
  const { projectId } = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:3001/client/projects/${projectId}/timetracking`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setEntries(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load time entries');
        setLoading(false);
      });
  }, [projectId]);

  if (loading) return <div className="p-8">Loading time tracking…</div>;
  if (error)   return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      {entries.map(entry => (
        <Card key={entry.time_entry_id}>
          <CardHeader className="text-lg font-semibold">
            {entry.username} — {entry.task_title}
          </CardHeader>
          <CardContent className="space-y-1">
            <p><strong>Start:</strong> {new Date(entry.start_time).toLocaleString()}</p>
            <p><strong>End:</strong> {entry.end_time ? new Date(entry.end_time).toLocaleString() : 'Still running'}</p>
            <p><strong>Duration:</strong> {entry.total_time != null ? `${entry.total_time} mins` : 'Not calculated yet'}</p>
          </CardContent>
        </Card>
      ))}
      {!entries.length && (
        <p className="italic text-gray-500">No time entries recorded yet.</p>
      )}
    </div>
  );
}
