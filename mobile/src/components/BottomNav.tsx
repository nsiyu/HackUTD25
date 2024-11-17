interface NavItem {
  label: string;
  icon: JSX.Element;
  isActive: boolean;
  onClick: () => void;
}

export function BottomNav({ activeTab, onTabChange }: { 
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const navItems: NavItem[] = [
    {
      label: 'Watchlist',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
        </svg>
      ),
      isActive: activeTab === 'watchlist',
      onClick: () => onTabChange('watchlist')
    },
    {
      label: 'Chart',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      ),
      isActive: activeTab === 'chart',
      onClick: () => onTabChange('chart')
    },
    {
      label: 'Explore',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      ),
      isActive: activeTab === 'explore',
      onClick: () => onTabChange('explore')
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-dark-surface-2">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              item.isActive ? 'text-off-red' : 'text-dark-text-secondary'
            } transition-colors`}
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
      {/* iOS Safe Area Bottom Padding */}
      <div className="h-8 bg-dark-surface" />
    </nav>
  );
}