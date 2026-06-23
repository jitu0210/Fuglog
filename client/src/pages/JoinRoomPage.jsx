import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { rooms } from '../api';

function JoinRoomPage({ user }) {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-[#a0a0a0] mb-4">Sign in to join a room.</p>
        <Link to="/login" className="text-red-500 underline">Sign in</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter an invite code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await rooms.joinByCode(code.trim());
      navigate(`/rooms/${data.inviteCode}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Link to="/rooms" className="text-[#a0a0a0] text-sm hover:text-white transition-colors">&larr; My Rooms</Link>
      <h1 className="text-3xl font-bold text-white mt-2 mb-8">Join a Room</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#a0a0a0] mb-1">Invite Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter the 16-character invite code"
            className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#5a5a5a] font-mono focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Joining...' : 'Join Room'}
        </button>
      </form>
    </div>
  );
}

export default JoinRoomPage;
