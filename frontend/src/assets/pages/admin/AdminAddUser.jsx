import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/AdminAddUser.css";

const AdminAddUser = () => {
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password_hash: "",
    role_id: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ User added successfully!");
        setNewUser({ username: "", email: "", password_hash: "", role_id: "" });
      } else {
        setMessage(data.error || "❌ Failed to add user");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      setMessage("❌ Server error");
    }
  };

  return (
    <div className="admin-add-user">
      <div className="admin-add-user-container">
        <h1 className="admin-add-user-title">Add New User</h1>
        
        <form onSubmit={handleAddUser} className="admin-add-user-form">
          <div className="admin-add-user-form-group">
            <label className="admin-add-user-label">Username</label>
            <input
              type="text"
              name="username"
              value={newUser.username}
              onChange={handleInputChange}
              className="admin-add-user-input"
              required
            />
          </div>

          <div className="admin-add-user-form-group">
            <label className="admin-add-user-label">Email</label>
            <input
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              className="admin-add-user-input"
              required
            />
          </div>

          <div className="admin-add-user-form-group">
            <label className="admin-add-user-label">Password</label>
            <input
              type="password"
              name="password_hash"
              value={newUser.password_hash}
              onChange={handleInputChange}
              className="admin-add-user-input"
              required
            />
          </div>

          <div className="admin-add-user-form-group">
            <label className="admin-add-user-label">Role</label>
            <select
              name="role_id"
              value={newUser.role_id}
              onChange={handleInputChange}
              className="admin-add-user-select"
              required
            >
              <option value="">Select Role</option>
              <option value="2">Project Manager</option>
              <option value="3">Developer</option>
              <option value="4">Client</option>
            </select>
          </div>

          <button type="submit" className="admin-add-user-button">
            Add User
          </button>

          {message && <div className="admin-add-user-error">{message}</div>}
        </form>

        <button 
          onClick={() => navigate(-1)} 
          className="admin-add-user-button"
          style={{ marginTop: '2rem' }}
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
};

export default AdminAddUser;
