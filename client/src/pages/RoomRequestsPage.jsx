import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rooms } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

function RoomRequestsPage({ user }) {
  const { code } = useParams();
  const [requests, setRequests] = useState([]);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const init = async () => {
      try {
        const roomRes = await rooms.getByCode(code);
        setRoom(roomRes.data);
        try {
          const reqRes = await rooms.getRequests(roomRes.data._id);
          setRequests(reqRes.data);
        } catch {
          setError('Only the host can view requests');
        }
      } catch {
        setError('Room not found');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [code, user]);

  const handleApprove = async (userId) => {
    try {
      const { data } = await rooms.approveRequest(room._id, userId);
      setRequests((prev) => prev.filter((r) => String(r.user._id) !== String(userId)));
      setRoom(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleDecline = async (userId) => {
    try {
      await rooms.declineRequest(room._id, userId);
      setRequests((prev) => prev.filter((r) => String(r.user._id) !== String(userId)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-[#a0a0a0] mb-4">Sign in to manage requests.</p>
        <Link to="/login" className="text-red-500 underline">Sign in</Link>
      </div>
    );
  }

  if (loading) return <LoadingSpinner text="Loading requests..." />;

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/rooms" className="text-[#a0a0a0] text-sm hover:text-white transition-colors">&larr; My Rooms</Link>
      <h1 className="text-3xl font-bold text-white mt-1 mb-2">Join Requests</h1>
      {room && <p className="text-[#a0a0a0] text-sm mb-8">Room: {room.name}</p>}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {requests.length === 0 ? (
        <p className="text-[#a0a0a0] text-center py-10">No pending requests.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req._id || req.user._id} className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white">
                  {req.user?.username?.slice(0, 2).toUpperCase() || '??'}
                </span>
                <span className="text-white text-sm">{req.user?.username || 'Unknown'}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(req.user._id)}
                  className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium cursor-pointer hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDecline(req.user._id)}
                  className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium cursor-pointer hover:bg-red-700 transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RoomRequestsPage;
