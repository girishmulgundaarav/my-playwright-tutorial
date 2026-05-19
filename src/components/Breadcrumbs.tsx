import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import sidebars, { SidebarItem } from '../sidebars';

// Helper to find the title of an item by id
const findItemTitle = (items: SidebarItem[], targetId: string, currentPath: string[] = []): string[] | null => {
  for (const item of items) {
    if (item.type === 'doc' && item.id === targetId) {
      return [...currentPath, item.label];
    }
    if (item.type === 'category' && item.items) {
      const result = findItemTitle(item.items, targetId, [...currentPath, item.label]);
      if (result) return result;
    }
  }
  return null;
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(p => p);
  
  // Example path: /docs/Locators/css-selectors
  // In our router, base is /my-playwright-tutorial, so pathname might be /docs/Locators/css-selectors
  const isDocs = pathParts[0] === 'docs';
  const docId = isDocs ? pathParts.slice(1).join('/') : null;

  let breadcrumbPath: string[] = [];
  if (docId) {
    const decodedDocId = decodeURIComponent(docId);
    const foundPath = findItemTitle(sidebars.tutorialSidebar, decodedDocId);
    if (foundPath) {
      breadcrumbPath = foundPath;
    } else {
      // Fallback
      breadcrumbPath = [decodedDocId.split('/').pop() || decodedDocId];
    }
  }

  return (
    <div className="breadcrumbs">
      <Link to="/" className="breadcrumb-link" aria-label="Home">
        <Home size={14} />
      </Link>
      <ChevronRight size={14} className="opacity-50" />
      <span className="breadcrumb-link">Docs</span>
      {breadcrumbPath.map((part, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={14} className="opacity-50" />
          <span className={index === breadcrumbPath.length - 1 ? 'text-primary font-medium' : 'breadcrumb-link'}>
            {part}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};
