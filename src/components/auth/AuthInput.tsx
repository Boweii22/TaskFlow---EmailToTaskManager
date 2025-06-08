import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // Assuming lucide-react is installed for icons

interface AuthInputProps {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
}

const AuthInput: React.FC<AuthInputProps> = ({
  id,
  name,
  type,
  placeholder,
  value,
  onChange,
  label,
  required = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordInput = type === 'password';
  const inputType = isPasswordInput && showPassword ? 'text' : type;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          type={inputType}
          name={name}
          id={id}
          className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white pl-3 pr-10 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
        />
        {isPasswordInput && (
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthInput; 