'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { UIProvider } from '@/lib/ui-context';
import { TitleProvider, useTitleContext } from '@/lib/title-context';

function TopbarWithTitle({ user, onHamburgerClick }) {
  const { title } = useTitleContext();
  return <Topbar pageTitle={title} user={user} onHamburgerClick={onHamburgerClick} />;
}

export default function AppShell({ user, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <TitleProvider>
      <UIProvider>
        <div className="app-wrapper">
          <Sidebar sidebarOpen={sidebarOpen} onOverlayClick={() => setSidebarOpen(false)} />

          <div className="main-content">
            <TopbarWithTitle user={user} onHamburgerClick={() => setSidebarOpen((o) => !o)} />

            {/* Alert container placeholder kept for layout parity; actual alerts render via UIProvider */}
            <main className="page-content">{children}</main>
          </div>
        </div>
      </UIProvider>
    </TitleProvider>
  );
}
