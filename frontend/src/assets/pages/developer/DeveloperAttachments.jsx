import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../../styles/DeveloperAttachments.css";

export default function DeveloperAttachments() {
  const { taskId } = useParams();
  const [files, setFiles] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Load all attachments
  const load = () => {
    if (!taskId || isNaN(taskId)) return;
    axios
      .get(`http://localhost:3001/developer/tasks/${taskId}/attachments`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setFiles(res.data))
      .catch(err => console.error('Error loading attachments', err));
  };

  useEffect(load, [taskId]);

  // Upload a file
  const upload = e => {
    const file = e.target.files[0];
    if (!file) return;
    axios.post(
      `http://localhost:3001/developer/tasks/${taskId}/attachments`,
      {
        attachment_name: file.name,
        attachment_type: file.type,
        file_path: `/uploads/${file.name}`
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(load)
    .catch(err => console.error('Error adding attachment:', err));
  };

  // Handle delete attachment
  const handleDelete = (id) => {
    if (!window.confirm('Delete this attachment?')) return;
    axios
      .delete(
        `http://localhost:3001/developer/tasks/${taskId}/attachments/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(load)
      .catch(err => console.error('Error deleting attachment:', err));
  };

  return (
    <div className="developer-attachments">
      <div className="developer-attachments-container">
        <h2 className="developer-attachments-title">Attachments</h2>
        
        <div className="developer-attachments-upload">
          <h3 className="developer-attachments-upload-title">Upload New Attachment</h3>
          <input
            type="file"
            onChange={upload}
            className="developer-attachments-input"
          />
        </div>
        
        <div className="developer-attachments-list">
          {files.length ? (
            files.map(f => (
              <div key={f.attachment_id} className="developer-attachments-item">
                <div className="developer-attachments-item-name">{f.attachment_name}</div>
                <div className="developer-attachments-item-size">
                  Uploaded: {new Date(f.uploaded_at).toLocaleString()}
                </div>
                <div className="developer-attachments-item-actions">
                  <a
                    href={f.file_path}
                    download
                    className="developer-attachments-button"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => handleDelete(f.attachment_id)}
                    className="developer-attachments-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="developer-attachments-text">No attachments yet.</p>
          )}
        </div>

        <button
          className="developer-attachments-button"
          onClick={() => navigate(-1)}
        >
          Go Back to Task
        </button>
      </div>
    </div>
  );
}
