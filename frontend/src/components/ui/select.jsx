// src/components/ui/select.jsx
import React from "react";

export function Select({ label, options = [], ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium">{label}</label>}
      <select
        className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
