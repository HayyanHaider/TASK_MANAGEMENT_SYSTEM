// src/assets/pages/client/ClientComments.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardContent } from '../../../components/ui/card';
import CommentList from '../../../components/CommentList';

export default function ClientComments() {
  const { projectId } = useParams();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:3001/client/projects/${projectId}/comments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setComments(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load comments');
        setLoading(false);
      });
  }, [projectId]);

  if (loading) return <div className="p-8">Loading comments…</div>;
  if (error)   return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader className="text-xl font-semibold">Comments</CardHeader>
        <CardContent>
          {comments.length ? (
            <CommentList comments={comments} />
          ) : (
            <p className="italic">No comments available yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
