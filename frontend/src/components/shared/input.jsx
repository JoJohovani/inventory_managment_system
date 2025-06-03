import React from 'react';

const Input = ({
     label,
     error,
     icon,
     className = '',
     ...props
}) => {
     const id = props.id || label?.toLowerCase().replace(/\s+/g, '-');

     return (
          <div className="w-full">
               {label && (
                    <label
                         htmlFor={id}
                         className="block text-sm font-medium text-gray-700 mb-1"
                    >
                         {label}
                    </label>
               )}

               <div className="relative">
                    {icon && (
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">{icon}</span>
                         </div>
                    )}

                    <input
                         id={id}
                         className={`
            w-full rounded-md border 
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} 
            shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50
            ${icon ? 'pl-10' : 'pl-4'} 
            py-2 pr-4 text-sm
            transition duration-150 ease-in-out
            ${className}
          `}
                         {...props}
                    />
               </div>

               {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
               )}
          </div>
     );
};

export default Input;
