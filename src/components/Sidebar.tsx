import React from 'react';
import { NavLink } from 'react-router-dom';
import sidebars, { SidebarItem } from '../sidebars';
import { Terminal, ChevronRight, FileText, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const closeSidebar = () => setIsOpen(false);

  const [collapsedCategories, setCollapsedCategories] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sidebars.tutorialSidebar.forEach(item => {
      if (item.type === 'category' && item.collapsed !== undefined) {
        initial[item.label] = item.collapsed;
      }
    });
    return initial;
  });

  const toggleCategory = (label: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const renderItem = (item: SidebarItem) => {
    if (item.type === 'category') {
      const isCollapsed = collapsedCategories[item.label] ?? false;
      return (
        <div key={item.label} className="nav-category">
          <button 
            type="button"
            className="nav-category-title" 
            onClick={() => toggleCategory(item.label)}
          >
            <span>{item.label}</span>
            <ChevronRight 
              size={12} 
              style={{ 
                transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                marginLeft: 'auto'
              }} 
            />
          </button>
          <div 
            style={{ 
              display: isCollapsed ? 'none' : 'block',
            }}
          >
            {item.items?.map(subItem => renderItem(subItem))}
          </div>
        </div>
      );
    }

    if (item.type === 'doc') {
      return (
        <NavLink 
          key={item.id} 
          to={`/docs/${item.id}`} 
          onClick={closeSidebar}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <FileText size={16} />
          <span>{item.label}</span>
          <ChevronRight size={14} className="opacity-50" style={{ marginLeft: 'auto' }} />
        </NavLink>
      );
    }
    return null;
  };

  return (
    <>
      <div 
        className="sidebar-overlay" 
        style={{ display: isOpen ? 'block' : '' }} 
        onClick={closeSidebar} 
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ justifyContent: 'space-between' }}>
          <div className="brand">
            <Terminal size={28} color="#A5B4FC" />
            Playwright
          </div>
          <button className="mobile-toggle" onClick={closeSidebar} style={{ display: isOpen ? 'block' : '' }}>
            <X size={20} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {sidebars.tutorialSidebar.map(item => renderItem(item))}
        </nav>
      </aside>
    </>
  );
};
