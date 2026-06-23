import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { rooms } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

function SearchRoomsPage({ user }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sentMap, setSentMap] = useState({});
  const inputRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = inputRef.current?.value?.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await rooms.search(q);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (roomId) => {
    try {
      await rooms.sendRequest(roomId);
      setSentMap((prev) => ({ ...prev, [roomId]: true }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-[#a0a0a0] mb-4">Sign in to search rooms.</p>
        <Link to="/login" className="text-red-500 underline">Sign in</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Search Rooms</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-8 flex-col sm:flex-row">
        <input
          ref={inputRef}
          placeholder="Search rooms by name..."
          className="flex-1 sm:max-w-sm px-4 py-2.5 border border-[#2a2a2a] rounded-lg text-sm bg-[#161616] outline-none transition-all focus:border-red-600 focus:ring-3 focus:ring-red-600/10 font-sans text-[#f5f5f5] placeholder:text-[#6b7280]"
        />
        <button type="submit" className="px-4 py-2.5 bg-red-600 text-white rounded-md text-sm font-semibold cursor-pointer hover:bg-red-700 transition-colors">Search</button>
      </form>

      {loading && <LoadingSpinner text="Searching rooms..." />}

      {!loading && searched && results.length === 0 && (
        <p className="text-[#a0a0a0] text-center py-10">No rooms found.</p>
      )}

      {!loading && results.length > 0 && (
        <div className="grid gap-4">
          {results.map((room) => {
            const isMember = room.members.some((m) => String(m.user?._id || m._id) === String(user._id));
            const isCreator = String(room.creator._id) === String(user._id);
            const requestSent = sentMap[room._id];
            return (
              <div key={room._id} className="p-5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/rooms/${room.inviteCode}`} className="text-lg font-semibold text-white no-underline hover:text-red-500 transition-colors">{room.name}</Link>
                    {room.description && <p className="text-sm text-[#6b7280] mt-1 line-clamp-1">{room.description}</p>}
                    <p className="text-sm text-[#a0a0a0] mt-1">
                      {room.members.length}/{room.maxMembers} members &middot; Host: {room.creator?.username}
                    </p>
                  </div>
                  <div>
                    {isCreator ? (
                      <span className="text-xs text-[#5a5a5a]">Your room</span>
                    ) : isMember ? (
                      <Link to={`/rooms/${room.inviteCode}`} className="text-xs text-green-500">Joined</Link>
                    ) : requestSent ? (
                      <span className="text-xs text-yellow-500">Request sent</span>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(room._id)}
                        className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium cursor-pointer hover:bg-red-700 transition-colors"
                      >
                        Send Request
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SearchRoomsPage;
