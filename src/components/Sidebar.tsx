import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import sidebars, { SidebarItem } from '../sidebars';
import { ChevronRight, FileText, X, CheckCircle } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const isCategoryActive = (categoryItem: SidebarItem, currentPathname: string): boolean => {
  if (!categoryItem.items) return false;
  return categoryItem.items.some(subItem => {
    if (subItem.type === 'doc') {
      const targetPath = `/docs/${subItem.id}`;
      return decodeURIComponent(currentPathname) === decodeURIComponent(targetPath);
    }
    if (subItem.type === 'category') {
      return isCategoryActive(subItem, currentPathname);
    }
    return false;
  });
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const closeSidebar = () => setIsOpen(false);
  const { completedDocs, isCompleted } = useProgress();
  const location = useLocation();
  const navRef = React.useRef<HTMLElement>(null);

  const [sidebarWidth, setSidebarWidth] = React.useState(280);

  const [isResizing, setIsResizing] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
    return () => {
      document.documentElement.style.removeProperty('--sidebar-width');
    };
  }, [sidebarWidth]);

  const initResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startWidth = sidebarWidth;
    const startX = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      if (newWidth >= 200 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.documentElement.classList.remove('resizing');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    document.body.style.cursor = 'col-resize';
    document.documentElement.classList.add('resizing');
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  React.useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    let isDown = false;
    let startX: number;
    let startY: number;
    let scrollLeft: number;
    let scrollTop: number;
    let hasMoved = false;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isDown = true;
      hasMoved = false;
      startX = e.clientX;
      startY = e.clientY;
      scrollLeft = nav.scrollLeft;
      scrollTop = nav.scrollTop;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      
      const walkX = (e.clientX - startX) * 1.5;
      const walkY = (e.clientY - startY) * 1.5;

      if (Math.abs(walkX) > 5 || Math.abs(walkY) > 5) {
        hasMoved = true;
        nav.classList.add('dragging');
      }

      if (hasMoved) {
        e.preventDefault();
        nav.scrollLeft = scrollLeft - walkX;
        nav.scrollTop = scrollTop - walkY;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDown) return;
      isDown = false;
      nav.classList.remove('dragging');
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    nav.addEventListener('mousedown', handleMouseDown);
    nav.addEventListener('dragstart', handleDragStart);
    nav.addEventListener('click', handleClick, true);
    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp, { capture: true });

    return () => {
      nav.removeEventListener('mousedown', handleMouseDown);
      nav.removeEventListener('dragstart', handleDragStart);
      nav.removeEventListener('click', handleClick, true);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp, { capture: true });
    };
  }, []);

  const [collapsedCategories, setCollapsedCategories] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sidebars.tutorialSidebar.forEach(item => {
      if (item.type === 'category' && item.collapsed !== undefined) {
        initial[item.label] = item.collapsed;
      }
    });
    return initial;
  });

  React.useEffect(() => {
    const activePath = decodeURIComponent(location.pathname);
    setCollapsedCategories(prev => {
      const updated = { ...prev };
      let changed = false;
      sidebars.tutorialSidebar.forEach(item => {
        if (item.type === 'category') {
          const isActive = isCategoryActive(item, activePath);
          if (isActive && updated[item.label] !== false) {
            updated[item.label] = false;
            changed = true;
          }
        }
      });
      return changed ? updated : prev;
    });
  }, [location.pathname]);

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
        <div key={item.label} className={`nav-category ${item.className || ''}`}>
          <button 
            type="button"
            className="nav-category-title" 
            onClick={() => toggleCategory(item.label)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {item.label}
              {item.label === 'Labs' && (
                <span className="labs-badge">HOT</span>
              )}
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
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${item.className || ''}`}
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
        {/* Mobile-only header to allow closing the drawer on small devices */}
        <div className="sidebar-mobile-header">
          <span style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '0.5px' }}>Documentation</span>
          <button className="mobile-toggle sidebar-close-btn" onClick={closeSidebar} aria-label="Close sidebar" style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>
        
        <div style={{ padding: '1.25rem 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--sidebar-text)' }}>
            <span>PROGRESS</span>
            <span>{progressPercent}%</span>
          </div>
          <div style={{ height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '0', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${progressPercent}%`, 
              backgroundColor: 'var(--accent-primary)', 
              borderRadius: '0',
              transition: 'width 0.3s ease',
              boxShadow: '0 0 10px rgba(230, 95, 43, 0.3)'
            }} />
          </div>
        </div>

        <nav className="sidebar-nav" ref={navRef}>
          {sidebars.tutorialSidebar.map(item => renderItem(item))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <span className="user-name">Girish Mulgund</span>
            <span className="user-tagline">Test with playwright</span>
          </div>
        </div>
        <div className={`sidebar-resize-handle ${isResizing ? 'resizing' : ''}`} onMouseDown={initResize} />
      </aside>
    </>
  );
};
