'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/books', icon: '📚', label: 'Books' },
  { href: '/transactions', icon: '🔄', label: 'Transactions' },
];

export default function Sidebar({ sidebarOpen, onOverlayClick }) {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  return (
    <>
      <aside className={'sidebar' + (sidebarOpen ? ' open' : '')} id="sidebar">
        <div className="sidebar-brand">
          <img src="/images/logo.png" alt="Library logo" className="brand-logo" />
          <span className="brand-name">LibraryMS</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={'nav-link' + (pathname.startsWith(item.href) ? ' active' : '')}
            >
              <span className="nav-icon">{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>&copy; {year} LibraryMS</p>
        </div>
      </aside>
      <div
        className={'sidebar-overlay' + (sidebarOpen ? ' active' : '')}
        id="sidebarOverlay"
        onClick={onOverlayClick}
      ></div>
    </>
  );
}
