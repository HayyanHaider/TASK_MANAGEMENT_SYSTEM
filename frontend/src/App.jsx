import React, { useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import Navbar from "./components/Navbar";
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './styles/EnhancedTransitions.css';

// Public pages
import HomePage     from "./assets/pages/Homepage";
import LoginPage    from "./assets/pages/LoginPage";
import RegisterPage from "./assets/pages/RegisterPage";

// Admin pages
import AdminDashboard       from "./assets/pages/admin/AdminDashboard";
import AdminAddUser         from "./assets/pages/admin/AdminAddUser";
import AdminManageProjects  from "./assets/pages/admin/AdminManageProjects";
import AdminAssignTask      from "./assets/pages/admin/AdminAssignTask";
import AdminProjectDetails  from "./assets/pages/admin/AdminProjectDetails";

// Project Manager pages
import ProjectManagerDashboard from "./assets/pages/project-manager/ProjectManagerDashboard";
import ProjectManagerCreate    from "./assets/pages/project-manager/ProjectManagerCreate";
import PMProjectDetails        from "./assets/pages/project-manager/PMProjectDetails";
import ProjectManagerEdit      from "./assets/pages/project-manager/ProjectManagerEdit";
import ProjectTasks            from "./assets/pages/project-manager/ProjectTasks";
import TaskSubtasks            from "./assets/pages/project-manager/TaskSubtasks";
import UpdateTask              from "./assets/pages/project-manager/UpdateTask";
import UpdateSubtask           from "./assets/pages/project-manager/UpdateSubtask";

// Client pages
import ClientDashboard      from "./assets/pages/client/ClientDashboard";
import ClientProjectDetails from "./assets/pages/client/ClientProjectDetails";
import ClientTasks          from "./assets/pages/client/ClientTasks";
import ClientBudget         from "./assets/pages/client/ClientBudget";
import ClientAttachments    from "./assets/pages/client/ClientAttachments";
import ClientComments       from "./assets/pages/client/ClientComments";
import ClientTimeTracking   from "./assets/pages/client/ClientTimeTracking";
import ClientFeedback       from "./assets/pages/client/ClientFeedback";

// Developer pages
import DeveloperDashboard from "./assets/pages/developer/DeveloperDashboard"; 
import DeveloperMyTasks from "./assets/pages/developer/DeveloperTaskDetails"; 
import DeveloperMySubtasks from "./assets/pages/developer/DeveloperSubtasks"; 
import DeveloperTimeTracker from "./assets/pages/developer/DeveloperTimeTracking"; 
import DeveloperAddAttachment from "./assets/pages/developer/DeveloperAttachments"; 
import DeveloperAddComment from "./assets/pages/developer/DeveloperComments";
import DeveloperCommentPage from "./assets/pages/developer/DeveloperCommentPage"

// Available transitions
const TRANSITIONS = {
  FADE_SLIDE: 'fade-slide',
  SCALE_FADE: 'scale-fade',
  FLIP: 'flip',
  SLIDE_UP_FADE: 'slide-up-fade',
  ZOOM_ROTATE: 'zoom-rotate',
  PERSPECTIVE_SLIDE: 'perspective-slide',
  BOUNCE_SCALE: 'bounce-scale'
};

function AnimatedRoutes() {
  const location = useLocation();
  const nodeRef = useRef(null);
  
  return (
    <div className="perspective-wrapper">
      <TransitionGroup component={null}>
        <CSSTransition
          key={location.key}
          nodeRef={nodeRef}
          classNames="fade-slide"
          timeout={{
            enter: 1100,
            exit: 300
          }}
          mountOnEnter
          unmountOnExit
        >
          <div ref={nodeRef} className="page-transition">
            <div className="page-content">
              <Routes location={location}>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/add-user" element={<AdminAddUser />} />
        <Route path="/admin/manage-projects" element={<AdminManageProjects />} />
        <Route path="/admin/assign-tasks" element={<AdminAssignTask />} />
        <Route path="/admin/projects/:projectId/details" element={<AdminProjectDetails />} />

                {/* Project Manager */}
        <Route path="/project-manager" element={<ProjectManagerDashboard />} />
        <Route path="/pm/projects" element={<ProjectManagerDashboard />} />
        <Route path="/pm/projects/new" element={<ProjectManagerCreate />} />
        <Route path="/pm/projects/:projectId" element={<PMProjectDetails />} />
        <Route path="/pm/projects/:projectId/edit" element={<ProjectManagerEdit />} />
        <Route path="/pm/projects/:projectId/tasks" element={<ProjectTasks />} />
        <Route path="/pm/tasks/:taskId/subtasks" element={<TaskSubtasks />} />
        <Route path="/pm/tasks/:taskId/update" element={<UpdateTask />} />
        <Route path="/pm/subtasks/:subtaskId/update" element={<UpdateSubtask />} />

        {/* Client */}
        <Route path="/client" element={<ClientDashboard />} />
        <Route path="/client/projects" element={<ClientDashboard />} />
        <Route path="/client/projects/:projectId" element={<ClientProjectDetails />} />
        <Route path="/client/projects/:projectId/details" element={<ClientProjectDetails />} />
        <Route path="/client/projects/:projectId/tasks" element={<ClientTasks />} />
        <Route path="/client/projects/:projectId/budget" element={<ClientBudget />} />
        <Route path="/client/projects/:projectId/attachments" element={<ClientAttachments />} />
        <Route path="/client/projects/:projectId/comments" element={<ClientComments />} />
        <Route path="/client/projects/:projectId/time-tracking" element={<ClientTimeTracking />} />
        <Route path="/client/projects/:projectId/feedback" element={<ClientFeedback />} />

        {/* Developer */}
        <Route path="/developer" element={<DeveloperDashboard />} />
    <Route path="/developer/tasks" element={<DeveloperMyTasks />} />
    <Route path="/developer/subtasks/:taskId" element={<DeveloperMySubtasks />} />
    <Route path="/developer/time/:taskId" element={<DeveloperTimeTracker />} />
    <Route path="/developer/attachments/:taskId" element={<DeveloperAddAttachment />} />
    <Route path="/developer/comments/:taskId" element={<DeveloperAddComment />} />
    <Route path="/developer/comments/:taskId" element={<DeveloperCommentPage />} />
      </Routes>
            </div>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app" style={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0B0C10, #1F2833)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Navbar />
          <AnimatedRoutes />
        </div>
    </Router>
    </AuthProvider>
  );
}
