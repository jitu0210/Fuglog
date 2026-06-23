import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { users, posts as postsApi } from '../api';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

function ProfilePage({ user: currentUser, setUser }) {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [wishlistPosts, setWishlistPosts] = useState([]);
  const [draftPosts, setDraftPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('posts');
  const [fetchError, setFetchError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser && currentUser._id === id;

  useEffect(() => {
    setLoading(true);
    setFetchError('');

    const loadProfile = users.get(id)
      .then((res) => {
        setProfile(res.data.user);
        if (currentUser && currentUser._id !== id) {
          setIsFollowing(res.data.user.followers?.some((f) => f._id === currentUser._id || f === currentUser._id) || false);
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.message || 'Failed to load profile';
        setFetchError(msg);
        if (currentUser && currentUser._id === id) {
          setProfile(currentUser);
        }
      });

    const loadPosts = users.getPosts(id, { published: 'all' })
      .then((res) => {
        const all = res.data.posts;
        setUserPosts(all.filter((p) => p.published !== false));
        if (isOwnProfile) setDraftPosts(all.filter((p) => p.published === false));
      })
      .catch(() => { setUserPosts([]); setDraftPosts([]); });

    const loadWishlist = users.getWishlist(id)
      .then((res) => setWishlistPosts(res.data.posts))
      .catch(() => setWishlistPosts([]));

    Promise.allSettled([loadProfile, loadPosts, loadWishlist])
      .finally(() => setLoading(false));
  }, [id, currentUser]);

  const handleFollow = async () => {
    if (!currentUser || followLoading) return;
    setFollowLoading(true);
    try {
      const res = await users.follow(id);
      setIsFollowing(res.data.isFollowing);
      setProfile(res.data.user);
    } catch { /* noop */ }
    setFollowLoading(false);
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;

  if (!profile) {
    const isOwn = currentUser && currentUser._id === id;
    if (isOwn && currentUser) {
      return (
        <div>
          <div className="bg-[#161616] rounded-lg border border-[#2a2a2a] p-6 md:p-8 mb-6">
            <div className="flex gap-6 items-start flex-col md:flex-row">
              <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 font-sans">
                {currentUser.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-1">
                  <h2 className="font-display text-2xl font-bold text-[#f5f5f5]">{currentUser.username}</h2>
                  <Link to="/settings" className="text-[0.65rem] text-red-500 font-semibold font-sans no-underline hover:underline">Edit profile</Link>
                </div>
                {currentUser.email && (
                  <p className="text-xs text-[#9ca3af] mb-2 font-sans">{currentUser.email}</p>
                )}
                <p className="text-sm text-[#9ca3af] font-body">No posts yet. Write your first post to get started.</p>
              </div>
            </div>
          </div>
          {fetchError && (
            <div className="flex items-start gap-2 p-3 mb-5 rounded-md bg-red-950 text-red-300 border border-red-900 text-sm font-sans">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {fetchError}
            </div>
          )}
          <EmptyState
            title="No posts yet"
            message="Write your first post to get started."
            actionLabel="Write a post"
            actionTo="/create"
          />
        </div>
      );
    }
    return (
      <div>
        <EmptyState title="User not found" message="This user doesn't exist." />
        {fetchError && (
          <div className="flex items-start gap-2 p-3 mt-4 rounded-md bg-red-950 text-red-300 border border-red-900 text-sm font-sans max-w-md mx-auto">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            API Error: {fetchError}
          </div>
        )}
      </div>
    );
  }

  const initials = profile.username.slice(0, 2).toUpperCase();
  const displayedPosts = tab === 'posts' ? userPosts : tab === 'drafts' ? draftPosts : wishlistPosts;

  return (
    <div>
      {fetchError && (
        <div className="flex items-start gap-2 p-3 mb-4 rounded-md bg-red-950 text-red-300 border border-red-900 text-sm font-sans">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {fetchError}
        </div>
      )}

      <div className="bg-[#161616] rounded-lg border border-[#2a2a2a] p-6 md:p-8 mb-6">
        <div className="flex gap-6 items-start flex-col md:flex-row">
          <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 font-sans">{initials}</div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-1">
              <h2 className="font-display text-2xl font-bold text-[#f5f5f5]">{profile.username}</h2>
              {isOwnProfile ? (
                <Link to="/settings" className="text-[0.65rem] text-red-500 font-semibold font-sans no-underline hover:underline">Edit profile</Link>
              ) : currentUser ? (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-3 py-1 rounded-md text-xs font-semibold font-sans cursor-pointer transition-colors border ${
                    isFollowing
                      ? 'bg-[#2a2a2a] text-[#9ca3af] border-[#2a2a2a] hover:bg-red-950 hover:text-red-400 hover:border-red-900'
                      : 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                  }`}
                >
                  {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                </button>
              ) : null}
            </div>
            {isOwnProfile && profile.email && (
              <p className="text-xs text-[#9ca3af] mb-2 font-sans">{profile.email}</p>
            )}
            {profile.bio && <p className="text-sm text-[#9ca3af] mb-3 leading-relaxed font-body">{profile.bio}</p>}
            <div className="flex gap-6 justify-center md:justify-start flex-wrap">
              <div className="text-center">
                <div className="text-base font-bold text-[#f5f5f5] font-sans">{profile.karma || 0}</div>
                <div className="text-[0.65rem] text-[#6b7280] uppercase tracking-wider font-sans">Karma</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-[#f5f5f5] font-sans">{profile.followersCount || 0}</div>
                <div className="text-[0.65rem] text-[#6b7280] uppercase tracking-wider font-sans">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-[#f5f5f5] font-sans">{profile.followingCount || 0}</div>
                <div className="text-[0.65rem] text-[#6b7280] uppercase tracking-wider font-sans">Following</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-[#f5f5f5] font-sans">{userPosts.length}</div>
                <div className="text-[0.65rem] text-[#6b7280] uppercase tracking-wider font-sans">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-[#f5f5f5] font-sans">{wishlistPosts.length}</div>
                <div className="text-[0.65rem] text-[#6b7280] uppercase tracking-wider font-sans">Saved</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-[#f5f5f5] font-sans">
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : '-'}
                </div>
                <div className="text-[0.65rem] text-[#6b7280] uppercase tracking-wider font-sans">Joined</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <div className="flex gap-1 mb-5 border-b border-[#2a2a2a]">
          <button
            onClick={() => setTab('posts')}
            className={`px-4 py-2 text-sm font-sans font-semibold bg-none border-none cursor-pointer transition-colors ${
              tab === 'posts'
                ? 'text-red-500 border-b-2 border-red-500 mb-[-1px]'
                : 'text-[#6b7280] hover:text-[#f5f5f5]'
            }`}
          >
            Published ({userPosts.length})
          </button>
          <button
            onClick={() => setTab('drafts')}
            className={`px-4 py-2 text-sm font-sans font-semibold bg-none border-none cursor-pointer transition-colors ${
              tab === 'drafts'
                ? 'text-red-500 border-b-2 border-red-500 mb-[-1px]'
                : 'text-[#6b7280] hover:text-[#f5f5f5]'
            }`}
          >
            Drafts ({draftPosts.length})
          </button>
          <button
            onClick={() => setTab('wishlist')}
            className={`px-4 py-2 text-sm font-sans font-semibold bg-none border-none cursor-pointer transition-colors ${
              tab === 'wishlist'
                ? 'text-red-500 border-b-2 border-red-500 mb-[-1px]'
                : 'text-[#6b7280] hover:text-[#f5f5f5]'
            }`}
          >
            Saved ({wishlistPosts.length})
          </button>
        </div>
      )}

      {!isOwnProfile && userPosts.length === 0 ? (
        <EmptyState title="No posts yet" message="This user hasn't published any posts yet." />
      ) : isOwnProfile && tab === 'posts' && userPosts.length === 0 ? (
        <EmptyState title="No posts yet" message="Write your first post to get started." actionLabel="Write a post" actionTo="/create" />
      ) : isOwnProfile && tab === 'drafts' && draftPosts.length === 0 ? (
        <EmptyState title="No drafts" message="Posts you save as draft will appear here." />
      ) : isOwnProfile && tab === 'wishlist' && wishlistPosts.length === 0 ? (
        <EmptyState title="Nothing saved yet" message="Posts you save will appear here." />
      ) : (
        <div className="flex flex-col gap-4">
          {displayedPosts.map((post) => (
            <PostCard key={post._id} post={post} user={currentUser} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
