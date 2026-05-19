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

  const renderItem = (item: SidebarItem) => {
    if (item.type === 'category') {
      return (
        <div key={item.label} className="nav-category">
          <div className="nav-category-title">{item.label}</div>
          <div>
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
            <Terminal size={28} color="#4f46e5" />
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
