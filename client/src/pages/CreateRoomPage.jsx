import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { rooms } from '../api';

function CreateRoomPage({ user }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-[#a0a0a0] mb-4">Sign in to create a room.</p>
        <Link to="/login" className="text-red-500 underline">Sign in</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Room name is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await rooms.create({ name, description });
      navigate(`/rooms/${data.inviteCode}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Create a Private Room</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#a0a0a0] mb-1">Room Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Book Club, Gaming Squad"
            maxLength={100}
            className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#5a5a5a] focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#a0a0a0] mb-1">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this room about?"
            maxLength={500}
            rows={3}
            className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#5a5a5a] focus:outline-none focus:border-red-600 transition-colors resize-none"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </form>
      <p className="text-[#a0a0a0] text-sm mt-6">
        Rooms are private — max 10 members. Share the invite code or link to let others join.
      </p>
    </div>
  );
}

export default CreateRoomPage;
