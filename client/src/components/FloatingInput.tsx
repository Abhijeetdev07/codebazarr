import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    containerClassName?: string;
}

export default function FloatingInput({
    label,
    type = 'text',
    className = '',
    containerClassName = '',
    error,
    value,
    ...props
}: FloatingInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    // We need to ensure value is treated as controlled to avoid warnings if it's undefined
    const inputValue = value !== undefined ? value : '';

    return (
        <div className={`relative ${containerClassName}`}>
            <input
                type={inputType}
                value={inputValue}
                className={`
          peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 pb-3 pt-3 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-0
          ${error ? 'border-red-500 focus:border-red-600' : ''}
          ${className}
        `}
                placeholder=" "
                {...props}
            />
            <label
                className={`
          absolute left-3 top-1 z-10 origin-[0] -translate-y-3 scale-90 transform bg-white px-1 text-sm duration-300 pointer-events-none
          peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-500
          peer-focus:top-1 peer-focus:-translate-y-3 peer-focus:scale-90 peer-focus:px-1
          ${error
                        ? 'text-red-500 peer-focus:text-red-600'
                        : 'text-gray-500 peer-focus:text-indigo-600'
                    }
        `}
            >
                {label}
            </label>

            {isPassword && (
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                >
                    {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
            )}

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
