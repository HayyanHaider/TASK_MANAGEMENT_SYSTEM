import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../../../styles/DeveloperComments.css";
import { useParams, useNavigate } from 'react-router-dom';

export default function DeveloperComments() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const token = localStorage.getItem('token');

  // Load comments from the API
  const loadComments = () => {
    axios.get(`http://localhost:3001/developer/tasks/${taskId}/comments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setComments(res.data))
    .catch(err => console.error('Failed to load comments', err));
  };

  // Post a new comment
  const postComment = () => {
    if (!newComment.trim()) return alert('Comment cannot be empty!');
    axios.post(
      `http://localhost:3001/developer/tasks/${taskId}/comments`,
      { comment: newComment },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(() => {
      setNewComment('');
      loadComments();
    })
    .catch(err => console.error('Failed to post comment', err));
  };

  useEffect(() => {
    if (taskId) loadComments();
  }, [taskId]);

  return (
    <div className="developer-comments">
      <div className="developer-comments-container">
        <h2 className="developer-comments-title">Comments</h2>

        <div className="developer-comments-list">
          {comments.map(c => (
            <div key={c.comment_id} className="developer-comments-item">
              <div className="developer-comments-item-header">
                <span className="developer-comments-item-author">{c.username}</span>
                <span className="developer-comments-item-date">
                  {new Date(c.created_at).toLocaleString()}
                </span>
              </div>
              <div className="developer-comments-item-content">
                {c.comment}
              </div>
            </div>
          ))}
        </div>

        <div className="developer-comments-form">
          <textarea
            className="developer-comments-textarea"
            rows={4}
            placeholder="Write a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
          />

          <button onClick={postComment} className="developer-comments-button">
            Post Comment
          </button>
        </div>

        <button 
          className="developer-comments-button"
          onClick={() => navigate(-1)}
        >
          Go Back to Task
        </button>
      </div>
    </div>
  );
}
