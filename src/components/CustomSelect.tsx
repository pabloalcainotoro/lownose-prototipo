import { useState } from "react";

export const CustomSelect = ({ options, value, onChange, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <input
        type="text"
        className="w-full bg-transparent border-b border-black dark:border-white py-1 text-sm outline-none cursor-pointer"
        value={value}
        readOnly
        placeholder={placeholder}
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl max-h-40 overflow-y-auto">
          {options.map((opt: string) => (
            <div 
              key={opt}
              className="p-2 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer uppercase font-bold"
              onClick={() => { onChange(opt); setIsOpen(false); }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};