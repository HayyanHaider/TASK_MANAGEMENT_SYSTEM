// src/assets/pages/client/ClientAttachments.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardContent } from '../../../components/ui/card';
import FileList from '../../../components/FileList';

export default function ClientAttachments() {
  const { projectId } = useParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get(`http://localhost:3001/client/projects/${projectId}/attachments`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setFiles(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Attachment load error', err);
        setError('Failed to load attachments');
        setLoading(false);
      });
  }, [projectId]);

  if (loading) return <div className="p-8">Loading attachments…</div>;
  if (error)   return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Project Attachments</h2>

      <Card className="max-w-3xl">
        <CardHeader className="text-xl font-semibold">
          Files
        </CardHeader>
        <CardContent className="space-y-4">
          {files.length
            ? <FileList files={files} />
            : <p className="italic">No attachments uploaded yet.</p>
          }
        </CardContent>
      </Card>
    </div>
  );
}
