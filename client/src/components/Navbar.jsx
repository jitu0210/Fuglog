import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationsDropdown from './NotificationsDropdown';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/');
    setMenuOpen(false);
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '?';

  return (
    <nav className="sticky top-0 z-50 bg-[#000] border-b border-[#2a2a2a]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white no-underline font-display text-xl font-bold tracking-tight hover:text-white" onClick={() => setMenuOpen(false)}>
          <span className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-xs font-bold text-white font-sans">F</span>
          Fuglog
        </Link>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden bg-none border-none text-[#f5f5f5] p-2 cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
        <div className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              <Link to="/create" className="text-white/75 no-underline text-sm font-medium px-3 py-2 rounded-md hover:text-white hover:bg-white/10 transition-colors font-sans">Write</Link>
              <Link to="/guidelines" className="text-white/75 no-underline text-sm font-medium px-3 py-2 rounded-md hover:text-white hover:bg-white/10 transition-colors font-sans">Guidelines</Link>
              <NotificationsDropdown />
              <Link to={`/profile/${user._id || ''}`} className="flex items-center gap-2 text-white no-underline text-sm font-medium py-1 pl-1 pr-3 rounded-full hover:bg-white/10 transition-colors">
                <span className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-[0.65rem] font-bold text-white flex-shrink-0 font-sans">{initials}</span>
                <span className="hidden sm:inline font-sans">{user.username}</span>
              </Link>
              <button onClick={handleLogout} className="text-white/75 text-sm font-medium px-3 py-2 rounded-md border border-white/20 bg-transparent cursor-pointer font-sans hover:border-red-600 hover:bg-red-600 hover:text-white transition-colors">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white/75 no-underline text-sm font-medium px-3 py-2 rounded-md hover:text-white hover:bg-white/10 transition-colors font-sans">Sign in</Link>
              <Link to="/register" className="text-white/75 no-underline text-sm font-medium px-3 py-2 rounded-md border border-white/20 hover:border-red-600 hover:bg-red-600 hover:text-white transition-colors font-sans">Get started</Link>
            </>
          )}
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-[#000] border-t border-[#2a2a2a] px-4 py-3 flex flex-col gap-2">
          {user ? (
            <>
              <Link to="/" className="text-[#f5f5f5] no-underline text-sm font-medium px-3 py-2 rounded-md hover:bg-white/10 transition-colors font-sans" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/create" className="text-[#f5f5f5] no-underline text-sm font-medium px-3 py-2 rounded-md hover:bg-white/10 transition-colors font-sans" onClick={() => setMenuOpen(false)}>Write</Link>
              <Link to="/guidelines" className="text-[#f5f5f5] no-underline text-sm font-medium px-3 py-2 rounded-md hover:bg-white/10 transition-colors font-sans" onClick={() => setMenuOpen(false)}>Guidelines</Link>
              <Link to={`/profile/${user._id || ''}`} className="text-[#f5f5f5] no-underline text-sm font-medium px-3 py-2 rounded-md hover:bg-white/10 transition-colors font-sans" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button onClick={handleLogout} className="text-left text-red-500 text-sm font-medium px-3 py-2 rounded-md bg-transparent border border-white/20 cursor-pointer font-sans hover:bg-red-600 hover:text-white transition-colors">Logout</button>
            </>
          ) : (
            <>
              <Link to="/" className="text-[#f5f5f5] no-underline text-sm font-medium px-3 py-2 rounded-md hover:bg-white/10 transition-colors font-sans" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/guidelines" className="text-[#f5f5f5] no-underline text-sm font-medium px-3 py-2 rounded-md hover:bg-white/10 transition-colors font-sans" onClick={() => setMenuOpen(false)}>Guidelines</Link>
              <Link to="/login" className="text-[#f5f5f5] no-underline text-sm font-medium px-3 py-2 rounded-md hover:bg-white/10 transition-colors font-sans" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/register" className="text-red-500 no-underline text-sm font-medium px-3 py-2 rounded-md border border-white/20 hover:bg-red-600 hover:text-white transition-colors font-sans" onClick={() => setMenuOpen(false)}>Get started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
