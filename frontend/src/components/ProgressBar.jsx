import React from 'react';

export default function ProgressBar({ percent, label }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div
        className="h-full bg-blue-500"
        style={{ width: `${percent}%` }}
      />
      <div className="mt-1 text-sm">{label}</div>
    </div>
  );
}
