import { Link } from 'react-router-dom';

function EmptyState({ title, message, actionLabel, actionTo }) {
  return (
    <div className="text-center py-16 px-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2a2a2a] flex items-center justify-center">
        <svg className="w-8 h-8 text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      </div>
      <h3 className="font-display text-lg font-bold mb-1 text-[#f5f5f5]">{title}</h3>
      <p className="text-sm text-[#9ca3af] mb-5 max-w-xs mx-auto font-body">{message}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-md text-sm font-semibold font-sans no-underline hover:bg-red-700 transition-colors">{actionLabel}</Link>
      )}
    </div>
  );
}

export default EmptyState;
