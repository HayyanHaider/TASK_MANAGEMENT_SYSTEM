import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:3001/Users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error);
  }, [token]);

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">All Users</h2>
      <ul className="space-y-2">
        {users.map(u => (
          <li key={u.user_id} className="p-2 border rounded">
            {u.username} — {u.email} — Role {u.role_id}
          </li>
        ))}
      </ul>
    </div>
  );
}
