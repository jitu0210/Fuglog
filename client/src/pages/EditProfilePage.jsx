import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { users } from '../api';

function EditProfilePage({ user, setUser }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await users.updateProfile({ username, bio });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (setUser) setUser(res.data.user);
      navigate(`/profile/${user._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-[#161616] rounded-lg border border-[#2a2a2a] p-6 md:p-8">
        <h1 className="font-display text-2xl font-bold mb-6 text-[#f5f5f5]">Edit Profile</h1>

        {error && (
          <div className="flex items-start gap-2 p-3 mb-5 rounded-md bg-red-950 text-red-300 border border-red-900 text-sm font-sans">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-1.5 font-sans">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#2a2a2a] rounded-lg text-sm bg-[#222] text-[#f5f5f5] outline-none transition-all focus:border-red-600 focus:ring-3 focus:ring-red-600/10 font-sans"
              required
              minLength={3}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-1.5 font-sans">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 border border-[#2a2a2a] rounded-lg text-sm font-body bg-[#222] text-[#f5f5f5] outline-none resize-y min-h-[100px] transition-all focus:border-red-600 focus:ring-3 focus:ring-red-600/10 placeholder:text-[#6b7280]"
              maxLength={500}
              placeholder="Tell the world about yourself..."
            />
            <span className="text-[0.65rem] text-[#6b7280] font-sans">{bio.length}/500</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-md text-sm font-semibold font-sans cursor-pointer hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/profile/${user._id}`)}
              className="inline-flex items-center justify-center gap-2 bg-transparent text-[#9ca3af] px-4 py-2.5 rounded-md text-sm font-semibold font-sans cursor-pointer hover:bg-[#2a2a2a] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfilePage;
