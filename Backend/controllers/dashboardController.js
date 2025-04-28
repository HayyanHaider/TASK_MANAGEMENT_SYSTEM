// /backend/controllers/dashboardController.js

// Dummy dashboard controllers for each role
exports.adminDashboard = (req, res) => {
    res.json({ page: 'Admin Dashboard – full access' });
  };
  
  exports.projectManagerDashboard = (req, res) => {
    res.json({ page: 'Project Manager Dashboard – project creation & assignment' });
  };
  
  exports.developerDashboard = (req, res) => {
    res.json({ page: 'Developer Dashboard – view & update assigned tasks' });
  };
  
  exports.testerDashboard = (req, res) => {
    res.json({ page: 'Tester Dashboard – view test cases & report bugs' });
  };
  
  exports.clientDashboard = (req, res) => {
    res.json({ page: 'Client Dashboard – view project status & submit feedback' });
  };
  