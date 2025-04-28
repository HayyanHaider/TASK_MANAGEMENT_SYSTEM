// src/components/ui/textarea.jsx
import React from "react";

export function Textarea({ label, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium">{label}</label>}
      <textarea
        className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        rows="4"
        {...props}
      />
    </div>
  );
}
