import { Outlet, useLocation } from 'react-router';
import { BottomNav } from '../mobile/BottomNav';
import { useIsMobile } from '../../hooks/useIsMobile';

/**
 * Root Layout Component
 * Mobile/Desktop responsive wrapper
 * 
 * Mobile: Shows BottomNav, adds bottom padding
 * Desktop: Shows content as-is
 * 
 * Note: BottomNav hidden on /question-builder pages
 */
export function RootLayout() {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Hide BottomNav on builder pages
  const hideBottomNav = location.pathname.includes('/builder');

  return (
    <div 
      className={`min-h-screen bg-slate-50 ${isMobile && !hideBottomNav ? 'pb-24' : ''}`}
      style={isMobile && !hideBottomNav ? { scrollPaddingBottom: '6rem' } : {}}
    >
      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation - Hidden on question builder */}
      {isMobile && !hideBottomNav && <BottomNav />}
    </div>
  );
}