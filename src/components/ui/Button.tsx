import React from 'react';

// Props para o componente Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  isLoading?: boolean;
}

// Componente Button reutilizável
export const Button = ({ children, variant = 'primary', isLoading, className, ...props }: ButtonProps) => {
  const baseStyle = "w-full p-3 rounded-lg font-bold transition-colors flex justify-center items-center";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? "Carregando..." : children}
    </button>
  );
};