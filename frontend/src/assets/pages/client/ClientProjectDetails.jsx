// src/assets/pages/client/ClientProjectDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../styles/ClientProjectDetails.css";

const ClientProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState("5");
  const [submitStatus, setSubmitStatus] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/client/projects/${projectId}/details`, {
        headers: { Authorization: `Bearer ${token}` }
        });
        setProject(response.data.project);
        setLoading(false);
      } catch (err) {
        console.error("Error loading project details:", err);
        setError("Failed to load project details");
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, token]);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:3001/client/feedback',
        { 
          feedback_text: feedback,
          rating: parseInt(rating),
          project_id: projectId,
          task_id: null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitStatus("success");
      setFeedback("");
      setRating("5");
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setSubmitStatus("error");
    }
  };

  if (loading) return <div className="client-project-details-loading">Loading...</div>;
  if (error) return <div className="client-project-details-error">{error}</div>;
  if (!project) return <div className="client-project-details-error">Project not found.</div>;

  return (
    <div className="client-project-details">
      <div className="client-project-details-container">
        <h1 className="client-project-details-title">{project.name}</h1>
        
        <div className="client-project-details-info">
          <section className="client-project-details-section">
            <h2 className="client-project-details-subtitle">Project Description</h2>
            <p className="client-project-details-text">{project.description}</p>
          </section>

          <section className="client-project-details-section">
            <h2 className="client-project-details-subtitle">Project Status</h2>
            <p className="client-project-details-text">
              <strong>Status:</strong> {project.status}
            </p>
            <p className="client-project-details-text">
              <strong>Start Date:</strong> {new Date(project.startDate).toLocaleDateString()}
            </p>
            <p className="client-project-details-text">
              <strong>End Date:</strong> {new Date(project.endDate).toLocaleDateString()}
            </p>
          </section>

          <section className="client-project-details-section">
            <h2 className="client-project-details-subtitle">Tasks</h2>
              <div className="client-project-details-tasks">
              {project.tasks?.map((task) => (
                  <div key={task.id} className="client-project-details-task">
                    <h3 className="client-project-details-task-title">{task.title}</h3>
                    <p className="client-project-details-task-description">{task.description}</p>
                    <p className="client-project-details-task-status">Status: {task.status}</p>
                  </div>
                ))}
              </div>
          </section>

          <section className="client-project-details-section">
            <h2 className="client-project-details-subtitle">Provide Feedback</h2>
            <form onSubmit={handleSubmitFeedback} className="client-project-details-feedback">
                <textarea
                  className="client-project-details-textarea"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter your feedback here..."
                required
              />
                    <select
                      className="client-project-details-select"
                      value={rating}
                onChange={(e) => setRating(e.target.value)}
                    >
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
                    </select>
              <div className="client-project-details-actions">
                <button type="submit" className="client-project-details-button">
                  Submit Feedback
                </button>
          <button 
                  type="button"
            className="client-project-details-button secondary"
                  onClick={() => navigate('/client')}
          >
            Back to Dashboard
          </button>
              </div>
            </form>
            {submitStatus === "success" && (
              <p className="client-project-details-success">Feedback submitted successfully!</p>
            )}
            {submitStatus === "error" && (
              <p className="client-project-details-error-message">Failed to submit feedback. Please try again.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ClientProjectDetails;
