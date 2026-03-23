import React from 'react';

interface NotificationToggleProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

export const NotificationToggle: React.FC<NotificationToggleProps> = ({
  title,
  description,
  enabled,
  onToggle,
}) => {
  return (
    <div className="bg-gradient-to-r from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-md rounded-xl p-6 border border-[#333] shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </div>
        <div className="ml-6">
          <button
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer ${
              enabled ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToggle;