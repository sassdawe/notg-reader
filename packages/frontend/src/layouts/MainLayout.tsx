import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useNavigate } from 'react-router-dom';
import styles from './MainLayout.module.css';

export function MainLayout() {
  const navigate = useNavigate();

  useKeyboardShortcuts({
    'g': () => navigate('/'),
    's': () => navigate('/starred'),
    '/': () => navigate('/search'),
    '?': () => {
      // Show keyboard shortcuts help (could toggle a modal)
      alert('Keyboard Shortcuts:\n\ng - Go to Home\ns - Starred items\n/ - Search\nr - Refresh\nj/k - Next/Previous item\nv - Toggle view mode\nm - Mark as read\nt - Toggle star');
    },
  });

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
