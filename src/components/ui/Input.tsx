import React from 'react';

// Interface para as props do Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

// Componente Input reutilizável
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
          ref={ref}
          className={`text-black p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
            error ? 'border-red-500' : 'border-gray-300' 
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';