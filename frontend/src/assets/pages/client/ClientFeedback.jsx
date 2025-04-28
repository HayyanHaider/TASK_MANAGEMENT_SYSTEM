// src/assets/pages/client/ClientFeedback.jsx

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import "../../../styles/ClientFeedback.css";

export default function ClientFeedback() {
  const { projectId } = useParams();
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  const handleSubmit = () => {
    if (!text.trim()) {
      setMessage('Feedback cannot be empty');
      return;
    }
    
    axios
      .post(`http://localhost:3001/client/feedback`,
        { feedback_text: text, rating, project_id: projectId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setMessage('✅ Feedback submitted!');
        setText('');
        setRating(5);
      })
      .catch(err => {
        console.error('Error submitting feedback:', err);
        setMessage('Failed to submit feedback');
      });
  };

  return (
    <div className="client-feedback">
      <div className="client-feedback-container">
        <h1 className="client-feedback-title">Leave Feedback</h1>
        
        <div className="client-feedback-form">
          <div>
            <label className="client-feedback-label">Your Feedback</label>
            <textarea
              className="client-feedback-textarea"
              rows={4}
              placeholder="Your feedback…"
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </div>

          <div>
            <label className="client-feedback-label">
              Rating:
              <select
                className="client-feedback-input"
                value={rating}
                onChange={e => setRating(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          </div>

          {message && (
            <div className={message.includes('✅') ? 'client-feedback-success' : 'client-feedback-error'}>
              {message}
            </div>
          )}

          <button onClick={handleSubmit} className="client-feedback-button">
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
