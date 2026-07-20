import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomDropdown = ({ icon: Icon, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative group min-w-[170px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 pl-3.5 pr-4 py-2.5 rounded-xl bg-white border ${isOpen ? 'border-orange-400 ring-[3px] ring-orange-500/15 shadow-md' : 'border-orange-200 hover:border-orange-300 hover:shadow-sm'} transition-all duration-300 text-left`}
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className={`h-4 w-4 ${isOpen ? 'text-orange-500' : 'text-gray-400 group-hover:text-orange-500'} transition-colors`} />}
          <span className="text-[13px] font-semibold text-gray-700 truncate">{selectedOption?.label}</span>
        </div>
        <ChevronDown className={`h-4 w-4 ${isOpen ? 'text-orange-500 rotate-180' : 'text-gray-400 group-hover:text-orange-500'} transition-all duration-300`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden origin-top animate-in fade-in zoom-in-95 duration-200">
          <div className="py-1.5 max-h-[280px] overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => { onChange(option.value); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-[13px] font-medium transition-colors flex items-center justify-between ${value === option.value ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                {option.label}
                {value === option.value && <Check className="h-4 w-4 text-orange-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
