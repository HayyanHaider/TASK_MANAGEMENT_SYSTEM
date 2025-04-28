import React from 'react';

export default function FileList({ files }) {
  return (
    <ul className="space-y-2">
      {files.map(f => (
        <li key={f.attachment_id}>
          <a
            href={f.file_path}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {f.attachment_name}
          </a>
        </li>
      ))}
    </ul>
  );
}
