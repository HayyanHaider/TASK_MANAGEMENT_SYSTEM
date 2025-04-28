export function Card({ children, className }) {
    return <div className={`bg-white shadow-md rounded-lg p-4 ${className}`}>{children}</div>;
  }
  
  export function CardHeader({ title }) {
    return <div className="text-lg font-bold mb-2">{title}</div>;
  }
  
  export function CardContent({ children }) {
    return <div className="text-sm text-gray-600">{children}</div>;
  }
  