import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && (
            <span className="text-gray-400" aria-hidden="true">
              /
            </span>
          )}
          <Link
            to={item.path}
            className={`${
              item.active
                ? 'text-primary-600 font-semibold'
                : 'text-gray-500 hover:text-gray-700'
            } transition-colors duration-200`}
            aria-current={item.active ? 'page' : undefined}
          >
            {item.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs; 