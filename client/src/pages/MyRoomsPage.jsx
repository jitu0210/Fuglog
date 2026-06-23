import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rooms } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

function MyRoomsPage({ user }) {
  const [roomList, setRoomList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    rooms.getMine()
      .then(({ data }) => setRoomList(data))
      .catch(() => setError('Failed to load rooms'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-[#a0a0a0] mb-4">Sign in to see your rooms.</p>
        <Link to="/login" className="text-red-500 underline">Sign in</Link>
      </div>
    );
  }

  if (loading) return <LoadingSpinner text="Loading rooms..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Rooms</h1>
          <p className="text-sm text-[#6b7280] mt-1">{roomList.length}/5 rooms joined</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/rooms/search"
            className="px-4 py-2 bg-[#2a2a2a] text-white rounded-lg text-sm font-medium hover:bg-[#3a3a3a] transition-colors"
          >
            Search
          </Link>
          <Link
            to="/rooms/create"
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            + New Room
          </Link>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {roomList.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#a0a0a0] mb-2">You haven't joined any rooms yet.</p>
          <p className="text-xs text-[#5a5a5a] mb-4">You can join up to 5 rooms.</p>
          <Link to="/rooms/create" className="text-red-500 underline">Create a room</Link>
          <span className="text-[#a0a0a0] mx-2">or</span>
          <Link to="/rooms/join" className="text-red-500 underline">join one</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {roomList.map((room) => (
            <Link
              key={room._id}
              to={`/rooms/${room.inviteCode}`}
              className="block p-5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-red-600/50 transition-colors no-underline"
            >
              <h2 className="text-lg font-semibold text-white mb-1">{room.name}</h2>
              {room.description && (
                <p className="text-sm text-[#6b7280] mb-2 line-clamp-2">{room.description}</p>
              )}
              <p className="text-sm text-[#a0a0a0]">
                {room.members.length}/{room.maxMembers} members &middot; Created by {room.creator?.username}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyRoomsPage;
