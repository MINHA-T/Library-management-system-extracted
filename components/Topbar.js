'use client';

import { useRouter } from 'next/navigation';

export default function Topbar({ pageTitle, user, onHamburgerClick }) {
  const router = useRouter();

  async function handleLogout(e) {
    e.preventDefault();
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const initial = (user?.full_name || '?').trim().charAt(0).toUpperCase();
  const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';

  return (
    <header className="topbar">
      <button className="hamburger" id="hamburgerBtn" aria-label="Toggle menu" onClick={onHamburgerClick}>
        <span></span><span></span><span></span>
      </button>

      <h1 className="page-title">{pageTitle}</h1>

      <div className="topbar-right">
        <div className="user-chip">
          <div className="user-avatar">{initial}</div>
          <div className="user-info">
            <span className="user-name">{user?.full_name}</span>
            <span className="user-role">{role}</span>
          </div>
        </div>
        <a href="/login" className="btn btn-outline btn-sm" id="logoutBtn" onClick={handleLogout}>
          Logout
        </a>
      </div>
    </header>
  );
}
