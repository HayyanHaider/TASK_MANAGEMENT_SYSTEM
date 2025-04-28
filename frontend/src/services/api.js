// /frontend/src/services/api.js
const BASE_URL = "http://localhost:3001";    // ← backend port

// Auth functions
export async function registerUser(userData) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function loginUser(userData) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.message || payload.error || res.statusText);
  return payload;
}

// Task Status functions
export async function getTaskStatuses() {
  const res = await fetch(`${BASE_URL}/task-status`);
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function createTaskStatus(statusName) {
  const res = await fetch(`${BASE_URL}/task-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status_name: statusName }),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

// Project Status functions
export async function getProjectStatuses() {
  const res = await fetch(`${BASE_URL}/project-status`);
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function getProjectStatusById(id) {
  const res = await fetch(`${BASE_URL}/project-status/${id}`);
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function createProjectStatus(statusData) {
  const res = await fetch(`${BASE_URL}/project-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(statusData),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function updateProjectStatus(id, statusData) {
  const res = await fetch(`${BASE_URL}/project-status/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(statusData),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

// Permission Types functions
export async function getPermissionTypes() {
  const res = await fetch(`${BASE_URL}/permission-types`);
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function createPermissionType(permissionType) {
  const res = await fetch(`${BASE_URL}/permission-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ permission_type: permissionType }),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

// Task Permissions functions
export async function getTaskPermissions() {
  const res = await fetch(`${BASE_URL}/task-permissions`);
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function getTaskPermissionsByTaskId(taskId) {
  const res = await fetch(`${BASE_URL}/task-permissions/task/${taskId}`);
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function createTaskPermission(permissionData) {
  const res = await fetch(`${BASE_URL}/task-permissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(permissionData),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function deleteTaskPermission(permissionData) {
  const res = await fetch(`${BASE_URL}/task-permissions`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(permissionData),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}
