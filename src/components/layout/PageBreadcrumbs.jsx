import React from 'react';
import { getIcon } from '../icons/SvgIcons';

const PageBreadcrumbs = ({ path = [], currentPage }) => {
  if (!currentPage) return null;

  const handleNavigate = (pageId) => {
    // TODO: Implémenter la navigation vers la page
    console.log('Navigate to:', pageId);
  };

  return (
    <div className="flex items-center gap-1 text-sm text-gray-600 px-6 py-2 border-b border-gray-100">
      {/* Workspace root */}
      <button
        onClick={() => handleNavigate('root')}
        className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
      >
        {getIcon('home', 'w-4 h-4')}
        <span>Workspace</span>
      </button>

      {/* Parent pages */}
      {path.map((page, index) => (
        <React.Fragment key={page.id}>
          <span className="text-gray-400">/</span>
          <button
            onClick={() => handleNavigate(page.id)}
            className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
          >
            {page.icon && <span>{getIcon(page.icon, 'w-4 h-4')}</span>}
            <span>{page.title}</span>
          </button>
        </React.Fragment>
      ))}

      {/* Current page */}
      <span className="text-gray-400">/</span>
      <div className="flex items-center gap-1 px-2 py-1 font-medium text-gray-900">
        {currentPage.icon && <span>{getIcon(currentPage.icon, 'w-4 h-4')}</span>}
        <span>{currentPage.title}</span>
      </div>
    </div>
  );
};

export default PageBreadcrumbs;