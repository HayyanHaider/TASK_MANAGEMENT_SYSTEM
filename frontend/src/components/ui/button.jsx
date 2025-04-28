import React from "react";

export function Button({ children, onClick, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{ margin: '10px' }}
      className={`
        px-4 py-2 
        bg-white text-gray-800 
        rounded-lg 
        hover:bg-gray-100 
        transition duration-200 
        ${className}
      `}
    >
      {children}
    </button>
  );
}
