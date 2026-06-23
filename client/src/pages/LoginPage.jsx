import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../api';

function LoginPage({ setUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await auth.login(form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px-200px)] flex items-center justify-center px-4 py-8">
      <div className="bg-[#161616] rounded-xl p-8 w-full max-w-sm border border-[#2a2a2a]">
        <h2 className="font-display text-2xl font-bold text-center mb-1 text-[#f5f5f5]">Welcome back</h2>
        <p className="text-center text-sm text-[#9ca3af] mb-6 font-sans">Sign in to your account to continue.</p>

        {error && (
          <div className="flex items-start gap-2 p-3 mb-5 rounded-md bg-red-950 text-red-300 border border-red-900 text-sm font-sans">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block mb-1.5 font-sans text-xs font-semibold text-[#f5f5f5]">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full px-3 py-2.5 border rounded-md text-sm bg-[#222] text-[#f5f5f5] outline-none transition-all focus:border-red-600 focus:ring-3 focus:ring-red-600/10 font-sans placeholder:text-[#6b7280] ${error && !form.email ? 'border-red-500' : 'border-[#2a2a2a]'}`}
            />
          </div>

          <div className="mb-5">
            <label className="block mb-1.5 font-sans text-xs font-semibold text-[#f5f5f5]">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`w-full px-3 py-2.5 border rounded-md text-sm bg-[#222] text-[#f5f5f5] outline-none transition-all focus:border-red-600 focus:ring-3 focus:ring-red-600/10 font-sans placeholder:text-[#6b7280] ${error && !form.password ? 'border-red-500' : 'border-[#2a2a2a]'}`}
            />
          </div>

          <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold font-sans cursor-pointer hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center gap-4 my-5 text-[#6b7280] text-xs font-sans before:flex-1 before:h-px before:bg-[#2a2a2a] after:flex-1 after:h-px after:bg-[#2a2a2a]">
          or
        </div>

        <p className="text-center text-sm text-[#9ca3af] font-sans">
          Don&apos;t have an account? <Link to="/register" className="text-red-500 font-semibold">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
