import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-[#000] text-white/60 px-6 py-12 pb-6 mt-auto border-t border-[#2a2a2a]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
        <div>
          <h3 className="text-white font-display text-lg font-bold mb-2">Fuglog</h3>
          <p className="text-sm leading-relaxed max-w-xs font-body">
            A modern blog platform for sharing ideas, stories, and knowledge with the world. Fuglog — where thoughts find their voice.
          </p>
        </div>
        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4 font-sans">Navigate</h4>
          <ul className="flex flex-col gap-2 list-none p-0">
            <li><Link to="/" className="text-white/50 no-underline text-sm hover:text-white transition-colors font-sans">Home</Link></li>
            <li><Link to="/create" className="text-white/50 no-underline text-sm hover:text-white transition-colors font-sans">Write a post</Link></li>
            <li><Link to="/guidelines" className="text-white/50 no-underline text-sm hover:text-white transition-colors font-sans">Guidelines</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4 font-sans">Account</h4>
          <ul className="flex flex-col gap-2 list-none p-0">
            <li><Link to="/login" className="text-white/50 no-underline text-sm hover:text-white transition-colors font-sans">Sign in</Link></li>
            <li><Link to="/register" className="text-white/50 no-underline text-sm hover:text-white transition-colors font-sans">Create account</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/10 text-center text-xs text-white/30 font-sans">
        &copy; {new Date().getFullYear()} Fuglog. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
