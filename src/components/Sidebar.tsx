import React from 'react';
import { NavLink } from 'react-router-dom';
import sidebars, { SidebarItem } from '../sidebars';
import { Terminal, ChevronRight, FileText, X, CheckCircle } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const closeSidebar = () => setIsOpen(false);
  const { completedDocs, isCompleted } = useProgress();

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
      
      // Calculate if all category items are completed
      let allCompleted = false;
      if (item.items && item.items.length > 0) {
        const flatItems: SidebarItem[] = [];
        const flatten = (items: SidebarItem[]) => {
          items.forEach(i => {
            if (i.type === 'doc') flatItems.push(i);
            if (i.type === 'category' && i.items) flatten(i.items);
          });
        };
        flatten(item.items);
        allCompleted = flatItems.length > 0 && flatItems.every(i => isCompleted(i.id!));
      }

      return (
        <div key={item.label} className="nav-category">
          <button 
            type="button"
            className="nav-category-title" 
            onClick={() => toggleCategory(item.label)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {item.label}
              {allCompleted && <CheckCircle size={14} color="#10b981" />}
            </span>
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
      const completed = isCompleted(item.id!);
      return (
        <NavLink 
          key={item.id} 
          to={`/docs/${item.id}`} 
          onClick={closeSidebar}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          {completed ? (
            <CheckCircle size={16} color="#10b981" />
          ) : (
            <FileText size={16} />
          )}
          <span style={{ color: completed ? 'var(--sidebar-text-active)' : 'inherit' }}>{item.label}</span>
        </NavLink>
      );
    }
    return null;
  };

  // Calculate Progress
  let totalDocs = 0;
  const countDocs = (items: SidebarItem[]) => {
    items.forEach(i => {
      if (i.type === 'doc') totalDocs++;
      if (i.type === 'category' && i.items) countDocs(i.items);
    });
  };
  countDocs(sidebars.tutorialSidebar);
  const progressPercent = totalDocs > 0 ? Math.round((completedDocs.length / totalDocs) * 100) : 0;

  return (
    <>
      <div 
        className="sidebar-overlay" 
        style={{ display: isOpen ? 'block' : '' }} 
        onClick={closeSidebar} 
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <a 
              href="https://app.thetestingacademy.com/playright-cli" 
              target="_blank" 
              rel="noopener noreferrer"
              className="complete-guide-badge"
            >
              COMPLETE GUIDE
            </a>
            <button className="mobile-toggle" onClick={closeSidebar} style={{ display: isOpen ? 'block' : '' }}>
              <X size={20} />
            </button>
          </div>
          <div className="brand">
            <Terminal size={28} color="#A5B4FC" />
            Playwright
          </div>
        </div>
        
        <div style={{ padding: '1.25rem 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--sidebar-text)' }}>
            <span>PROGRESS</span>
            <span>{progressPercent}%</span>
          </div>
          <div style={{ height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${progressPercent}%`, 
              backgroundColor: '#10b981', 
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebars.tutorialSidebar.map(item => renderItem(item))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <span className="user-name">Girish Mulgund</span>
            <span className="user-tagline">Test with playwright</span>
          </div>
        </div>
      </aside>
    </>
  );
};
