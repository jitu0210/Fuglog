function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-9 h-9 border-[3px] border-[#2a2a2a] border-t-red-600 rounded-full" style={{ animation: 'spin .7s linear infinite' }} />
      <p className="text-sm text-[#9ca3af] font-sans">{text}</p>
    </div>
  );
}

export default LoadingSpinner;
