-- 23L-0693 MUHAMMAD USMAN 
-- 23L-0727 MUHAMMAD HAYYAN HAIDER
-- 23L-0897 MUHAMMAD SOHAIB MURTAZA

CREATE DATABASE DB_PHASE4;
USE DB_PHASE4;
GO

drop database DB_PHASE4

-- ============================================
-- TABLES
-- ============================================

-- ROLES
CREATE TABLE Roles (
  role_id   INT          PRIMARY KEY,
  role_name VARCHAR(50)  NOT NULL UNIQUE
);
GO

-- USERS
CREATE TABLE Users (
  user_id       INT IDENTITY(1,1) PRIMARY KEY,
  username      NVARCHAR(50)      NOT NULL,
  password_hash NVARCHAR(255)     NOT NULL,
  email         NVARCHAR(100)     NOT NULL UNIQUE,
  role_id       INT               NOT NULL,
  created_at    DATETIME          NOT NULL DEFAULT GETDATE(),
  CONSTRAINT FK_Users_Roles
    FOREIGN KEY(role_id) REFERENCES Roles(role_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
);
GO

-- PROJECTS
CREATE TABLE Projects (
  project_id  INT          PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT         NULL,
  created_by  INT          NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT GETDATE(),
  CONSTRAINT FK_Projects_Users
    FOREIGN KEY(created_by) REFERENCES Users(user_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
);
GO

-- TASK_STATUS
CREATE TABLE TaskStatus (
  status_name VARCHAR(20) PRIMARY KEY
);
GO

-- TASKS
CREATE TABLE Tasks (
  task_id      INT          PRIMARY KEY,
  project_id   INT          NOT NULL,
  title        VARCHAR(255) NOT NULL,
  description  TEXT         NULL,
  assigned_to  INT          NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'To Do',
  priority     VARCHAR(20)  NOT NULL DEFAULT 'Medium',
  created_at   DATETIME     NOT NULL DEFAULT GETDATE(),
  CONSTRAINT FK_Tasks_Projects
    FOREIGN KEY(project_id) REFERENCES Projects(project_id)
      ON DELETE CASCADE
      ON UPDATE NO ACTION,
  CONSTRAINT FK_Tasks_Users
    FOREIGN KEY(assigned_to) REFERENCES Users(user_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION,
  CONSTRAINT FK_Tasks_Status
    FOREIGN KEY(status) REFERENCES TaskStatus(status_name)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
);
GO

-- SUBTASKS
CREATE TABLE Subtasks (
  subtask_id INT          PRIMARY KEY,
  task_id    INT          NOT NULL,
  title      VARCHAR(255) NOT NULL,
  status     VARCHAR(20)  NOT NULL DEFAULT 'To Do',
  CONSTRAINT FK_Subtasks_Tasks
    FOREIGN KEY(task_id) REFERENCES Tasks(task_id)
      ON DELETE CASCADE
      ON UPDATE NO ACTION,
  CONSTRAINT FK_Subtasks_Status
    FOREIGN KEY(status) REFERENCES TaskStatus(status_name)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
);
GO

-- PROJECT_STATUS
CREATE TABLE ProjectStatus (
  status_id  INT          PRIMARY KEY,
  name       VARCHAR(50)  NOT NULL UNIQUE,
  progress   VARCHAR(3)   NOT NULL DEFAULT '00%'
);
GO

-- STATUSES
CREATE TABLE Statuses (
  status_id  INT          PRIMARY KEY,
  project_id INT          NOT NULL,
  status_name VARCHAR(50) NOT NULL,
  CONSTRAINT FK_Statuses_Projects
    FOREIGN KEY(project_id) REFERENCES Projects(project_id)
      ON DELETE CASCADE
      ON UPDATE NO ACTION,
  CONSTRAINT FK_Statuses_ProjectStatus
    FOREIGN KEY(status_name) REFERENCES ProjectStatus(name)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
);
GO

-- COMMENTS
CREATE TABLE Comments (
  comment_id INT      PRIMARY KEY,
  task_id    INT      NOT NULL,
  user_id    INT      NOT NULL,
  comment    TEXT     NOT NULL,
  created_at DATETIME NOT NULL DEFAULT GETDATE(),
  CONSTRAINT FK_Comments_Tasks
    FOREIGN KEY(task_id) REFERENCES Tasks(task_id)
      ON DELETE CASCADE
      ON UPDATE NO ACTION,
  CONSTRAINT FK_Comments_Users
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
);
GO

-- ATTACHMENTS
CREATE TABLE Attachments (
  attachment_id   INT          PRIMARY KEY,
  attachment_name VARCHAR(100) NULL,
  task_id         INT          NOT NULL,
  attachment_type VARCHAR(50)  NULL,
  file_path       VARCHAR(255) NOT NULL,
  uploaded_at     DATETIME     NOT NULL DEFAULT GETDATE(),
  CONSTRAINT FK_Attachments_Tasks
    FOREIGN KEY(task_id) REFERENCES Tasks(task_id)
      ON DELETE CASCADE
      ON UPDATE NO ACTION
);
GO

-- PERMISSION_TYPES
CREATE TABLE PermissionTypes (
  permission_type VARCHAR(20) PRIMARY KEY
);
GO

-- PERMISSIONS
CREATE TABLE Permissions (
  permission_id INT PRIMARY KEY,
  role_id       INT NOT NULL,
  permission_type VARCHAR(20) NOT NULL,
  CONSTRAINT FK_Permissions_Roles
    FOREIGN KEY(role_id) REFERENCES Roles(role_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION,
  CONSTRAINT FK_Permissions_Types
    FOREIGN KEY(permission_type) REFERENCES PermissionTypes(permission_type)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
);
GO

-- TASK_PERMISSIONS
CREATE TABLE TaskPermissions (
  permission_id INT NOT NULL,
  task_id       INT NOT NULL,
  CONSTRAINT PK_TaskPermissions PRIMARY KEY (permission_id, task_id),
  CONSTRAINT FK_TaskPermissions_Permissions
    FOREIGN KEY(permission_id) REFERENCES Permissions(permission_id)
      ON DELETE CASCADE
      ON UPDATE NO ACTION,
  CONSTRAINT FK_TaskPermissions_Tasks
    FOREIGN KEY(task_id) REFERENCES Tasks(task_id)
      ON DELETE CASCADE
      ON UPDATE NO ACTION
);
GO

-- TIME TRACKING
CREATE TABLE TimeTracking (
  time_entry_id INT       PRIMARY KEY,
  task_id       INT       NOT NULL,
  user_id       INT       NOT NULL,
  start_time    DATETIME  NOT NULL,
  end_time      DATETIME  NULL,
  total_minutes AS DATEDIFF(MINUTE, start_time, ISNULL(end_time, GETDATE())), -- Non-persisted
  CONSTRAINT FK_TimeTracking_Tasks
    FOREIGN KEY(task_id) REFERENCES Tasks(task_id)
      ON DELETE CASCADE
      ON UPDATE NO ACTION,
  CONSTRAINT FK_TimeTracking_Users
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
);
GO

-- DEPENDENCIES
CREATE TABLE Dependencies (
  dependency_id      INT PRIMARY KEY,
  task_id            INT NOT NULL,
  depends_on_task_id INT NOT NULL,
  CONSTRAINT FK_Dependencies_Task
    FOREIGN KEY(task_id) REFERENCES Tasks(task_id)
      ON DELETE CASCADE
      ON UPDATE NO ACTION,
  CONSTRAINT FK_Dependencies_Depends
    FOREIGN KEY(depends_on_task_id) REFERENCES Tasks(task_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
);
GO

-- BUDGET
CREATE TABLE Budget (
  budget_id        INT           PRIMARY KEY,
  project_id       INT           NOT NULL,
  allocated_budget DECIMAL(10,2) NOT NULL,
  spent_budget     DECIMAL(10,2) DEFAULT 0,
  remaining_budget AS (allocated_budget - spent_budget) PERSISTED,
  CONSTRAINT FK_Budget_Projects
    FOREIGN KEY(project_id) REFERENCES Projects(project_id)
      ON DELETE CASCADE
      ON UPDATE NO ACTION
);
GO

-- FEEDBACK
CREATE TABLE Feedback (
  feedback_id   INT       PRIMARY KEY,
  user_id       INT       NOT NULL,
  task_id       INT       NULL,
  project_id    INT       NULL,
  feedback_text TEXT      NOT NULL,
  rating        INT       CHECK (rating BETWEEN 1 AND 5),
  created_at    DATETIME  NOT NULL DEFAULT GETDATE(),
  CONSTRAINT FK_Feedback_Users
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION,
  CONSTRAINT FK_Feedback_Tasks
    FOREIGN KEY(task_id) REFERENCES Tasks(task_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION,
  CONSTRAINT FK_Feedback_Projects
    FOREIGN KEY(project_id) REFERENCES Projects(project_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION,
  CONSTRAINT CHK_Feedback_Context CHECK (
    (task_id IS NOT NULL AND project_id IS NULL) OR
    (task_id IS NULL AND project_id IS NOT NULL)
  )
);
GO

-- ============================================
-- INSERT STATEMENTS
-- ============================================

-- Insert Roles
INSERT INTO Roles (role_id, role_name) VALUES
  (1, 'Admin'),
  (2, 'Project Manager'),
  (3, 'Developer'),
  (4, 'Client');
GO

-- Insert Task Statuses
INSERT INTO TaskStatus (status_name) VALUES
  ('To Do'),
  ('In Progress'),
  ('Completed'),
  ('Blocked');
GO

-- Insert Project Statuses
INSERT INTO ProjectStatus (status_id, name, progress) VALUES
  (1, 'UI Phase', '20%'),
  (2, 'Development Phase', '40%'),
  (3, 'Integration Phase', '30%'),
  (4, 'Deployment Phase', '10%'),
  (5, 'Analytics Phase', '50%');
GO

-- Insert Permission Types
INSERT INTO PermissionTypes (permission_type) VALUES
  ('can_edit'),
  ('can_delete'),
  ('can_assign'),
  ('can_view');
GO

-- Insert Users
INSERT INTO Users (username, password_hash, email, role_id, created_at) VALUES
  ('admin_usman',   'admin_pass',   'admin@example.com',   1, '2025-01-01 09:00:00'),
  ('pm_hayyan',     'pm_pass',      'pm@example.com',      2, '2025-01-02 10:00:00'),
  ('dev_sohaib',    'dev_pass',     'dev@example.com',     3, '2025-01-03 11:00:00'),
  ('dev_muzammil',  'dev2_pass',    'dev2@example.com',    3, '2025-01-04 12:00:00'),
  ('client_rizwan', 'client_pass',  'client@example.com',  4, '2025-01-05 13:00:00');
GO

-- Insert Projects
INSERT INTO Projects (project_id, name, description, created_by, created_at) VALUES
  (1, 'Website Redesign',  'Full redesign project.',       2, '2025-01-05 14:00:00'),
  (2, 'Mobile App',        'iOS/Android app development.', 2, '2025-01-06 15:00:00'),
  (3, 'AI Chatbot',        'Building smart chatbot.',      2, '2025-01-07 16:00:00'),
  (4, 'Cloud Migration',   'Migrating services to cloud.', 2, '2025-01-08 17:00:00'),
  (5, 'Data Analytics',    'Advanced data analytics.',     2, '2025-01-09 18:00:00');
GO

-- Insert Statuses
INSERT INTO Statuses (status_id, project_id, status_name) VALUES
  (1, 1, 'UI Phase'),
  (2, 2, 'Development Phase'),
  (3, 3, 'Integration Phase'),
  (4, 4, 'Deployment Phase'),
  (5, 5, 'Analytics Phase');
GO

-- Insert Tasks
INSERT INTO Tasks (task_id, project_id, title, description, assigned_to, status, priority, created_at) VALUES
  (1, 1, 'Redesign Landing Page',      'Work on landing page UI.',           3, 'In Progress', 'High',   '2025-01-10 09:00:00'),
  (2, 2, 'Develop Login Screen',       'Create login functionality.',        3, 'To Do',       'Medium', '2025-01-11 10:00:00'),
  (3, 3, 'Integrate AI Model',         'Integrate ML model into chatbot.',   4, 'To Do',       'High',   '2025-01-12 11:00:00'),
  (4, 4, 'Setup Cloud Infrastructure', 'AWS and Azure setup.',               3, 'In Progress', 'High',   '2025-01-13 12:00:00'),
  (5, 5, 'Create Dashboard',           'Dashboard for analytics.',           4, 'To Do',       'Medium', '2025-01-14 13:00:00');
GO

-- Insert Subtasks
INSERT INTO Subtasks (subtask_id, task_id, title, status) VALUES
  (1, 1, 'Create Wireframe',         'Completed'),
  (2, 1, 'Choose Color Scheme',      'In Progress'),
  (3, 2, 'Build Authentication API', 'To Do'),
  (4, 3, 'Train AI Model',           'In Progress'),
  (5, 4, 'Setup AWS EC2',            'Completed');
GO

-- Insert Comments
INSERT INTO Comments (comment_id, task_id, user_id, comment, created_at) VALUES
  (1, 1, 2, 'Please speed up the landing page redesign.', '2025-01-10 09:30:00'),
  (2, 2, 3, 'Login API being developed.',               '2025-01-11 10:30:00'),
  (3, 3, 4, 'Working on AI model integration.',         '2025-01-12 11:30:00'),
  (4, 4, 3, 'Cloud setup 50% done.',                   '2025-01-13 12:30:00'),
  (5, 5, 4, 'Dashboard draft ready.',                  '2025-01-14 13:30:00');
GO

-- Insert Attachments
INSERT INTO Attachments (attachment_id, attachment_name, task_id, attachment_type, file_path, uploaded_at) VALUES
  (1, 'wireframe.pdf',             1, 'PDF', '/attachments/wireframe.pdf',                 '2025-01-10 09:00:00'),
  (2, 'login_api.docx',            2, 'DOCX','/attachments/login_api.docx',               '2025-01-11 10:00:00'),
  (3, 'ai_model.zip',              3, 'ZIP', '/attachments/ai_model.zip',                 '2025-01-12 11:00:00'),
  (4, 'aws_setup.pdf',             4, 'PDF', '/attachments/aws_setup.pdf',                '2025-01-13 12:00:00'),
  (5, 'analytics_dashboard.png',   5, 'PNG', '/attachments/analytics_dashboard.png',      '2025-01-14 13:00:00');
GO

-- Insert Permissions
INSERT INTO Permissions (permission_id, role_id, permission_type) VALUES
  (1, 1, 'can_edit'),
  (2, 1, 'can_delete'),
  (3, 1, 'can_assign'),
  (4, 2, 'can_edit'),
  (5, 2, 'can_assign'),
  (6, 3, 'can_edit'),
  (7, 4, 'can_view');
GO

-- Insert Task Permissions
INSERT INTO TaskPermissions (permission_id, task_id) VALUES
  (1, 1), (2, 1), (3, 1),  -- Admin permissions for task 1
  (4, 2), (5, 2),          -- PM permissions for task 2
  (6, 3),                  -- Dev permissions for task 3
  (4, 4), (5, 4), (2, 4),  -- PM permissions for task 4
  (6, 5);                  -- Dev permissions for task 5
GO

-- Insert TimeTracking
INSERT INTO TimeTracking (time_entry_id, task_id, user_id, start_time, end_time) VALUES
  (1, 1, 3, '2025-01-10 09:00:00', '2025-01-10 11:00:00'),
  (2, 2, 3, '2025-01-11 10:00:00', '2025-01-11 12:00:00'),
  (3, 3, 4, '2025-01-12 11:00:00', '2025-01-12 13:00:00'),
  (4, 4, 3, '2025-01-13 12:00:00', '2025-01-13 14:00:00'),
  (5, 5, 4, '2025-01-14 13:00:00', '2025-01-14 15:00:00');
GO

-- Insert Dependencies
INSERT INTO Dependencies (dependency_id, task_id, depends_on_task_id) VALUES
  (1, 2, 1),
  (2, 3, 2),
  (3, 4, 3),
  (4, 5, 4),
  (5, 1, 5);
GO

-- Insert Budget
INSERT INTO Budget (budget_id, project_id, allocated_budget, spent_budget) VALUES
  (1, 1, 10000.00,  2000.00),
  (2, 2, 15000.00,  3000.00),
  (3, 3, 20000.00,  5000.00),
  (4, 4, 25000.00, 10000.00),
  (5, 5, 30000.00,  8000.00);
GO

-- Insert Feedback
INSERT INTO Feedback (feedback_id, user_id, task_id, project_id, feedback_text, rating, created_at) VALUES
  (1, 4, 1, NULL, 'Loved the UI redesign!',           5, '2025-01-10 09:00:00'),
  (2, 3, NULL, 2, 'Login API is functional.',         4, '2025-01-11 10:00:00'),
  (3, 4, 3, NULL, 'AI integration going well.',       5, '2025-01-12 11:00:00'),
  (4, 3, NULL, 4, 'Cloud infra needs optimization.',  3, '2025-01-13 12:00:00'),
  (5, 4, 5, NULL, 'Analytics dashboard looks clean.', 5, '2025-01-14 13:00:00');
GO








-- Select all data from Roles
SELECT * FROM Roles;
GO

-- Select all data from Users
SELECT * FROM Users;
GO

-- Select all data from Projects
SELECT * FROM Projects;
GO

-- Select all data from TaskStatus
SELECT * FROM TaskStatus;
GO

-- Select all data from Tasks
SELECT * FROM Tasks;
GO

-- Select all data from Subtasks
SELECT * FROM Subtasks;
GO

-- Select all data from ProjectStatus
SELECT * FROM ProjectStatus;
GO

-- Select all data from Statuses
SELECT * FROM Statuses;
GO

-- Select all data from Comments
SELECT * FROM Comments;
GO

-- Select all data from Attachments
SELECT * FROM Attachments;
GO

-- Select all data from PermissionTypes
SELECT * FROM PermissionTypes;
GO

-- Select all data from Permissions
SELECT * FROM Permissions;
GO

-- Select all data from TaskPermissions
SELECT * FROM TaskPermissions;
GO

-- Select all data from TimeTracking
SELECT 
    time_entry_id,
    task_id,
    user_id,
    start_time,
    end_time,
    total_minutes
FROM TimeTracking;
GO

-- Select all data from Dependencies
SELECT * FROM Dependencies;
GO

-- Select all data from Budget
SELECT * FROM Budget;
GO

-- Select all data from Feedback
SELECT * FROM Feedback;
GO









-- ============================================
-- VIEWS
-- ============================================

-- DROP VIEW STATEMENTS
IF OBJECT_ID('ACTIVE_TASKS', 'V') IS NOT NULL DROP VIEW ACTIVE_TASKS;
IF OBJECT_ID('PROJECT_TASK_COUNT', 'V') IS NOT NULL DROP VIEW PROJECT_TASK_COUNT;
IF OBJECT_ID('USER_TASK_ASSIGNMENTS', 'V') IS NOT NULL DROP VIEW USER_TASK_ASSIGNMENTS;
IF OBJECT_ID('TASK_PROGRESS', 'V') IS NOT NULL DROP VIEW TASK_PROGRESS;
IF OBJECT_ID('PROJECT_BUDGET_SUMMARY', 'V') IS NOT NULL DROP VIEW PROJECT_BUDGET_SUMMARY;

-- VIEW 1: ACTIVE TASKS
CREATE VIEW ACTIVE_TASKS AS
SELECT task_id, title, status
FROM Tasks
WHERE status != 'Completed';
GO

-- VIEW 2: PROJECT TASK COUNT
CREATE VIEW PROJECT_TASK_COUNT AS
SELECT p.project_id, p.name, COUNT(t.task_id) AS task_count
FROM Projects p
LEFT JOIN Tasks t ON p.project_id = t.project_id
GROUP BY p.project_id, p.name;
GO

-- VIEW 3: USER TASK ASSIGNMENTS
CREATE VIEW USER_TASK_ASSIGNMENTS AS
SELECT u.user_id, u.username, t.task_id, t.title, t.status, p.name AS project_name
FROM Users u
JOIN Tasks t ON u.user_id = t.assigned_to
JOIN Projects p ON t.project_id = p.project_id;
GO

-- VIEW 4: TASK PROGRESS WITH SUBTASKS
CREATE VIEW TASK_PROGRESS AS
SELECT t.task_id, t.title, t.status, 
       COUNT(s.subtask_id) AS total_subtasks,
       SUM(CASE WHEN s.status = 'Completed' THEN 1 ELSE 0 END) AS completed_subtasks
FROM Tasks t
LEFT JOIN Subtasks s ON t.task_id = s.task_id
GROUP BY t.task_id, t.title, t.status;
GO

-- VIEW 5: PROJECT BUDGET SUMMARY
CREATE VIEW PROJECT_BUDGET_SUMMARY AS
SELECT p.project_id, p.name, 
       b.allocated_budget, b.spent_budget, b.remaining_budget
FROM Projects p
JOIN Budget b ON p.project_id = b.project_id;
GO

-- ============================================
-- QUERIES
-- ============================================

-- 1. GET ALL USERS WITH THEIR ROLES
SELECT u.user_id, u.username, u.email, r.role_name
FROM Users u
JOIN Roles r ON u.role_id = r.role_id;
GO

-- 2. GET ALL TASKS ASSIGNED TO A SPECIFIC USER
SELECT t.task_id, t.title, t.status, t.priority, p.name AS project_name
FROM Tasks t
JOIN Projects p ON t.project_id = p.project_id
WHERE t.assigned_to = 3; -- Replace 3 with desired user_id
GO

-- 3. GET ALL SUBTASKS FOR A SPECIFIC TASK
SELECT s.subtask_id, s.title, s.status
FROM Subtasks s
WHERE s.task_id = 1; -- Replace 1 with desired task_id
GO

-- 4. GET ALL COMMENTS FOR A SPECIFIC TASK
SELECT c.comment_id, u.username, c.comment, c.created_at
FROM Comments c
JOIN Users u ON c.user_id = u.user_id
WHERE c.task_id = 1; -- Replace 1 with desired task_id
GO

-- 5. GET THE TOTAL TIME SPENT ON A TASK
SELECT t.task_id, t.title, SUM(tt.total_minutes) AS total_minutes_spent
FROM TimeTracking tt
JOIN Tasks t ON tt.task_id = t.task_id
WHERE t.task_id = 1 -- Replace 1 with desired task_id
GROUP BY t.task_id, t.title;
GO

-- 6. GET THE REMAINING BUDGET FOR ALL PROJECTS
SELECT p.project_id, p.name, b.allocated_budget, b.spent_budget, b.remaining_budget
FROM Budget b
JOIN Projects p ON b.project_id = p.project_id;
GO

-- 7. GET ALL FEEDBACK FOR A SPECIFIC PROJECT
SELECT f.feedback_id, u.username, f.feedback_text, f.rating, f.created_at
FROM Feedback f
JOIN Users u ON f.user_id = u.user_id
WHERE f.project_id = 1; -- Replace 1 with desired project_id
GO

-- 8. GET ALL TASKS WITH THEIR DEPENDENCIES
SELECT t.task_id, t.title, d.depends_on_task_id
FROM Tasks t
JOIN Dependencies d ON t.task_id = d.task_id;
GO

-- 9. GET ALL ATTACHMENTS FOR A SPECIFIC TASK
SELECT a.attachment_id, a.attachment_name, a.attachment_type, a.uploaded_at
FROM Attachments a
WHERE a.task_id = 1; -- Replace 1 with desired task_id
GO

-- 10. GET ALL PROJECTS CREATED BY A SPECIFIC USER
SELECT p.project_id, p.name, p.description, p.created_at
FROM Projects p
WHERE p.created_by = 2; -- Replace 2 with desired user_id
GO

-- ============================================
-- DROP TABLES (IF NEEDED)
-- ============================================

-- Drop views first
DROP VIEW IF EXISTS ACTIVE_TASKS;
DROP VIEW IF EXISTS PROJECT_TASK_COUNT;
DROP VIEW IF EXISTS USER_TASK_ASSIGNMENTS;
DROP VIEW IF EXISTS TASK_PROGRESS;
DROP VIEW IF EXISTS PROJECT_BUDGET_SUMMARY;

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS Feedback;
DROP TABLE IF EXISTS Budget;
DROP TABLE IF EXISTS Dependencies;
DROP TABLE IF EXISTS TimeTracking;
DROP TABLE IF EXISTS TaskPermissions;
DROP TABLE IF EXISTS Permissions;
DROP TABLE IF EXISTS PermissionTypes;
DROP TABLE IF EXISTS Attachments;
DROP TABLE IF EXISTS Comments;
DROP TABLE IF EXISTS Statuses;
DROP TABLE IF EXISTS ProjectStatus;
DROP TABLE IF EXISTS Subtasks;
DROP TABLE IF EXISTS Tasks;
DROP TABLE IF EXISTS TaskStatus;
DROP TABLE IF EXISTS Projects;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Roles;
GO