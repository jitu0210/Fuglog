import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { notifications as notificationsApi } from '../api';

function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    notificationsApi.list()
      .then((res) => {
        setNotifs(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!open && unreadCount > 0) {
      notificationsApi.markRead().catch(() => {});
      setUnreadCount(0);
    }
    setOpen((prev) => !prev);
  };

  const getText = (n) => {
    switch (n.type) {
      case 'like': return 'liked your post';
      case 'comment': return 'commented on your post';
      case 'reply': return 'replied to your comment';
      case 'follow': return 'started following you';
      default: return 'interacted with your post';
    }
  };

  const getLink = (n) => {
    if (n.type === 'follow') return `/profile/${n.sender?._id}`;
    if (n.post) return `/posts/${n.post._id}`;
    return '#';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative text-white/75 hover:text-white p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer bg-none border-none"
        title="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[0.55rem] font-bold rounded-full flex items-center justify-center font-sans">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#161616] border border-[#2a2a2a] rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
          <div className="p-3 border-b border-[#2a2a2a]">
            <span className="text-xs font-semibold text-[#f5f5f5] font-sans uppercase tracking-wider">Notifications</span>
          </div>
          {notifs.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-xs text-[#6b7280] font-sans">No notifications yet.</p>
            </div>
          ) : (
            notifs.map((n) => (
              <Link
                key={n._id}
                to={getLink(n)}
                onClick={() => setOpen(false)}
                className={`flex items-start gap-3 p-3 no-underline transition-colors hover:bg-[#2a2a2a] ${!n.read ? 'bg-red-950/20' : ''}`}
              >
                <span className="w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[0.6rem] font-bold text-[#9ca3af] flex-shrink-0 font-sans">
                  {n.sender?.username?.slice(0, 2).toUpperCase() || '?'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#f5f5f5] font-sans">
                    <span className="font-semibold">{n.sender?.username || 'Someone'}</span>{' '}
                    {getText(n)}
                    {n.post?.title && (
                      <span>: &ldquo;{n.post.title.length > 40 ? n.post.title.slice(0, 40) + '...' : n.post.title}&rdquo;</span>
                    )}
                  </p>
                  <span className="text-[0.6rem] text-[#6b7280] font-sans">
                    {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationsDropdown;
