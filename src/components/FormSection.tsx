import React, { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <div className={`form-section ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="form-section-title">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        {collapsible && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-expanded={!isCollapsed}
          >
            <svg
              className={`w-5 h-5 transform transition-transform duration-200 ${
                isCollapsed ? 'rotate-0' : 'rotate-180'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
      </div>
      <div
        className={`transition-all duration-200 ease-in-out ${
          isCollapsed ? 'max-h-0 overflow-hidden' : 'max-h-[2000px]'
        }`}
      >
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export default FormSection; 