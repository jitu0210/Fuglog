import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { rooms } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

function RoomDetailPage({ user }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const [msgPage, setMsgPage] = useState(1);
  const [msgTotal, setMsgTotal] = useState(0);
  const chatEnd = useRef(null);
  const chatBox = useRef(null);

  const loadRoom = () => {
    rooms.getByCode(code)
      .then(({ data }) => setRoom(data))
      .catch(() => setError('Room not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRoom(); }, [code]);

  useEffect(() => {
    if (!room?._id || !user) return;
    rooms.getMessages(room._id, { page: 1 })
      .then(({ data }) => { setMessages(data.messages); setMsgPage(data.page); setMsgTotal(data.total); })
      .catch(() => {});
  }, [room?._id, user]);

  const mid = (m) => String(m.user?._id || m._id);
  const isMember = user && room?.members.some((m) => mid(m) === String(user._id));
  const isCreator = user && room && String(room.creator._id) === String(user._id);

  const handleJoin = async () => {
    if (!user) return;
    try {
      const { data } = await rooms.joinByCode(room.inviteCode);
      setRoom(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join room');
    }
  };

  const handleSendRequest = async () => {
    try {
      await rooms.sendRequest(room._id);
      setRequestSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(room.inviteCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLeave = async () => {
    if (!window.confirm('Leave this room?')) return;
    try {
      await rooms.leave(room._id);
      navigate('/rooms');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave room');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this room permanently? This cannot be undone.')) return;
    try {
      await rooms.delete(room._id);
      navigate('/rooms');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete room');
    }
  };

  const handleKick = async (userId, username) => {
    if (!window.confirm(`Remove ${username} from this room?`)) return;
    try {
      const { data } = await rooms.kickMember(room._id, userId);
      setRoom(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to kick member');
    }
  };

  const openEdit = () => {
    setEditName(room.name);
    setEditDesc(room.description || '');
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    try {
      const { data } = await rooms.update(room._id, { name: editName, description: editDesc });
      setRoom(data);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update room');
    }
  };

  const handleSendMsg = async (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    setSending(true);
    try {
      const { data } = await rooms.sendMessage(room._id, msgText.trim());
      setMessages((prev) => [...prev, data]);
      setMsgText('');
      setTimeout(() => chatEnd.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const loadOlder = async () => {
    if (msgPage * 50 >= msgTotal) return;
    try {
      const { data } = await rooms.getMessages(room._id, { page: msgPage + 1 });
      setMessages((prev) => [...data.messages, ...prev]);
      setMsgPage(data.page);
    } catch {}
  };

  const InvitePanel = ({ compact }) => compact ? (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
      <h3 className="text-xs font-medium text-[#a0a0a0] uppercase tracking-wide mb-2">Invite Code</h3>
      <div className="flex items-center gap-2">
        <code className="flex-1 px-2 py-1.5 bg-[#111] border border-[#2a2a2a] rounded text-xs text-white font-mono select-all">{room.inviteCode}</code>
        <button onClick={handleCopyLink} className="px-2 py-1.5 bg-[#2a2a2a] text-white rounded text-xs hover:bg-[#3a3a3a] transition-colors cursor-pointer whitespace-nowrap">{copied ? 'Copied!' : 'Copy'}</button>
      </div>
    </div>
  ) : (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5">
      <h2 className="text-sm font-medium text-[#a0a0a0] uppercase tracking-wide mb-2">Invite</h2>
      <div className="flex items-center gap-2 mb-3">
        <code className="flex-1 px-3 py-2 bg-[#111] border border-[#2a2a2a] rounded text-white text-sm font-mono select-all">{room.inviteCode}</code>
        <button onClick={handleCopyLink} className="px-3 py-2 bg-[#2a2a2a] text-white rounded text-sm hover:bg-[#3a3a3a] transition-colors">{copied ? 'Copied!' : 'Copy Link'}</button>
      </div>
      <p className="text-xs text-[#5a5a5a]">Share the 16-character code or the link for others to join.</p>
    </div>
  );

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const fmtDateTime = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return <LoadingSpinner text="Loading room..." />;

  if (error || !room) {
    return (
      <div className="text-center py-20">
        <p className="text-[#a0a0a0] mb-4">{error || 'Room not found'}</p>
        <Link to="/rooms" className="text-red-500 underline">Back to rooms</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link to="/rooms" className="text-[#a0a0a0] text-sm hover:text-white transition-colors">&larr; My Rooms</Link>
          <h1 className="text-3xl font-bold text-white mt-1">{room.name}</h1>
        </div>
        <div className="flex gap-2">
          {isCreator && (
            <>
              <Link to={`/rooms/${code}/requests`} className="px-3 py-1.5 bg-[#2a2a2a] text-white rounded text-sm hover:bg-[#3a3a3a] transition-colors no-underline">Requests</Link>
              <button onClick={openEdit} className="px-3 py-1.5 bg-[#2a2a2a] text-white rounded text-sm hover:bg-[#3a3a3a] transition-colors cursor-pointer">Edit</button>
              <button onClick={handleDelete} className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors cursor-pointer">Delete</button>
            </>
          )}
          {isMember && !isCreator && (
            <button onClick={handleLeave} className="px-3 py-1.5 bg-red-600/20 text-red-500 rounded text-sm hover:bg-red-600 hover:text-white transition-colors cursor-pointer">Leave</button>
          )}
        </div>
      </div>

      {room.description && <p className="text-[#a0a0a0] text-sm mb-4">{room.description}</p>}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {!isMember && !isCreator && user && (
        <div className="mb-6">
          {requestSent ? (
            <p className="text-yellow-500 text-sm mb-6 text-center">Join request sent. Waiting for host approval.</p>
          ) : (
            <div className="flex gap-3 mb-4">
              <button onClick={handleSendRequest} className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors">Send Join Request</button>
              <button onClick={handleJoin} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">Join via Code</button>
            </div>
          )}
          <InvitePanel />
        </div>
      )}

      {!user && (
        <div className="mb-6">
          <Link to="/login" className="block w-full text-center px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors mb-4 no-underline">Sign in to join this room</Link>
          <InvitePanel />
        </div>
      )}

      {isMember && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg flex flex-col h-[60vh] lg:h-[65vh]">
              <div className="px-5 py-3 border-b border-[#2a2a2a]">
                <h2 className="text-sm font-medium text-[#a0a0a0] uppercase tracking-wide">Chat</h2>
              </div>
              <div ref={chatBox} className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                {msgPage * 50 < msgTotal && (
                  <button onClick={loadOlder} className="w-full text-xs text-[#6b7280] hover:text-white bg-transparent border border-[#2a2a2a] rounded py-1.5 cursor-pointer transition-colors">Load older messages</button>
                )}
                {messages.length === 0 && (
                  <p className="text-[#5a5a5a] text-sm text-center py-10">No messages yet. Say hello!</p>
                )}
                {messages.map((msg) => (
                  <div key={msg._id} className="flex items-start gap-2">
                    <span className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-[0.55rem] font-bold text-white flex-shrink-0 mt-0.5">
                      {msg.sender?.username?.slice(0, 2).toUpperCase() || '??'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{msg.sender?.username || 'Unknown'}</span>
                        <span className="text-[0.55rem] text-[#5a5a5a]">{fmtDateTime(msg.createdAt)}</span>
                      </div>
                      <p className="text-sm text-[#c0c0c0] break-words mt-0.5">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEnd} />
              </div>
              <div className="px-5 py-3 border-t border-[#2a2a2a]">
                <form onSubmit={handleSendMsg} className="flex gap-2">
                  <input
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={1000}
                    className="flex-1 px-3 py-2 bg-[#111] border border-[#2a2a2a] rounded text-white text-sm focus:outline-none focus:border-red-600 placeholder-[#5a5a5a]"
                  />
                  <button type="submit" disabled={sending || !msgText.trim()} className="px-5 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50 cursor-pointer transition-colors">
                    {sending ? '...' : 'Send'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
            <InvitePanel compact />
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
              <h3 className="text-xs font-medium text-[#a0a0a0] uppercase tracking-wide mb-3">
                Members ({room.members.length}/{room.maxMembers})
              </h3>
              <div className="space-y-2.5">
                {room.members.map((member) => {
                  const mu = member.user || member;
                  return (
                    <div key={mu._id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-[0.5rem] font-bold text-white flex-shrink-0">
                          {mu.username?.slice(0, 2).toUpperCase() || '?'}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-white truncate">{mu.username}</span>
                            {String(mu._id) === String(room.creator._id) && <span className="text-[0.5rem] text-[#5a5a5a]">Host</span>}
                          </div>
                          <p className="text-[0.55rem] text-[#5a5a5a]">Joined {fmtDate(member.joinedAt)}</p>
                        </div>
                      </div>
                      {isCreator && String(mu._id) !== String(room.creator._id) && (
                        <button onClick={() => handleKick(mu._id, mu.username)} className="text-[0.6rem] text-red-500 hover:text-red-400 bg-transparent border-none cursor-pointer flex-shrink-0">Kick</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {room.pastMembers?.length > 0 && (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                <h3 className="text-xs font-medium text-[#a0a0a0] uppercase tracking-wide mb-3">
                  Past Members ({room.pastMembers.length})
                </h3>
                <div className="space-y-2">
                  {room.pastMembers.map((pm, i) => {
                    const pu = pm.user || pm;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[0.5rem] font-bold text-[#6b7280] flex-shrink-0">
                          {pu.username?.slice(0, 2).toUpperCase() || '?'}
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs text-[#9ca3af]">{pu.username}</span>
                          <p className="text-[0.5rem] text-[#5a5a5a]">{fmtDate(pm.joinedAt)} &rarr; {fmtDate(pm.leftAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setEditing(false)}>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">Edit Room</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-1">Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={100} className="w-full px-3 py-2 bg-[#111] border border-[#2a2a2a] rounded text-white text-sm focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-1">Description</label>
                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} maxLength={500} rows={3} className="w-full px-3 py-2 bg-[#111] border border-[#2a2a2a] rounded text-white text-sm focus:outline-none focus:border-red-600 resize-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSaveEdit} className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 cursor-pointer">Save</button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 bg-[#2a2a2a] text-white rounded text-sm font-medium hover:bg-[#3a3a3a] cursor-pointer">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomDetailPage;
