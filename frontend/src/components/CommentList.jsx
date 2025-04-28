import React from 'react';

export default function CommentList({ comments }) {
  return (
    <ul className="space-y-3">
      {comments.map(c => (
        <li key={c.comment_id} className="border-b pb-2">
          <p className="text-gray-800">{c.comment}</p>
          <p className="text-sm text-gray-600">
            by {c.username} on {new Date(c.created_at).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
