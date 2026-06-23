import { useState } from 'react';
import { Link } from 'react-router-dom';
import { posts as postsApi } from '../api';
import DOMPurify from 'dompurify';

function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = DOMPurify.sanitize(html);
  return div.textContent || div.innerText || '';
}

function getReadingTime(content) {
  const words = stripHtml(content).trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function truncateToWords(text, limit) {
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(' ') + '...';
}

function PostCard({ post, user }) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [disliked, setDisliked] = useState(post.isDisliked || false);
  const [wishlisted, setWishlisted] = useState(post.isWishlisted || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [dislikesCount, setDislikesCount] = useState(post.dislikesCount || 0);
  const [copied, setCopied] = useState(false);

  const plainText = stripHtml(post.content || '');
  const truncated = truncateToWords(plainText, 200);

  const handleLike = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await postsApi.like(post._id);
      setLiked(res.data.isLiked);
      setDisliked(res.data.isDisliked);
      setLikesCount(res.data.likesCount);
      setDislikesCount(res.data.dislikesCount);
    } catch { /* noop */ }
  };

  const handleDislike = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await postsApi.dislike(post._id);
      setDisliked(res.data.isDisliked);
      setLiked(res.data.isLiked);
      setLikesCount(res.data.likesCount);
      setDislikesCount(res.data.dislikesCount);
    } catch { /* noop */ }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await postsApi.wishlist(post._id);
      setWishlisted(res.data.isWishlisted);
    } catch { /* noop */ }
  };

  const handleShare = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post._id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Link to={`/posts/${post._id}`} className="no-underline text-inherit block">
      <article className="bg-[#161616] rounded-lg border border-[#2a2a2a] p-4 sm:p-6 transition-shadow hover:shadow-md hover:shadow-red-900/20 flex items-start gap-3 sm:gap-5">
        <div className="flex flex-col items-center gap-1 min-w-[32px] sm:min-w-[44px]">
          <button onClick={handleLike} className={`bg-none border-none cursor-pointer p-0.5 sm:p-1 transition-colors ${liked ? 'text-red-500' : 'text-[#6b7280] hover:text-red-500'}`}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
          </button>
          <span className="text-xs sm:text-sm font-bold text-[#9ca3af] font-sans">{likesCount}</span>
          <button onClick={handleDislike} className={`bg-none border-none cursor-pointer p-0.5 sm:p-1 transition-colors ${disliked ? 'text-red-500' : 'text-[#6b7280] hover:text-red-500'}`}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill={disliked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
          </button>
        </div>
        <div className="flex-1 min-w-0">
          {post.tags?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-1.5">
              {post.tags.slice(0, 4).map((tag, i) => (
                <span key={i} className="bg-red-950 text-red-400 px-1.5 sm:px-2 py-0.5 rounded text-[0.6rem] sm:text-[0.65rem] font-semibold uppercase tracking-wide font-sans">{tag}</span>
              ))}
            </div>
          )}
          <h3 className="font-display text-base sm:text-xl font-bold leading-snug text-[#f5f5f5]">{post.title}</h3>
          {truncated && (
            <p className="text-xs sm:text-sm text-[#9ca3af] leading-relaxed mt-1.5 sm:mt-2 font-body">{truncated}</p>
          )}
          <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-[0.65rem] sm:text-xs text-[#6b7280] font-sans overflow-x-auto">
            <span className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-600 flex items-center justify-center text-[0.5rem] sm:text-[0.55rem] font-bold text-white">{post.author?.username?.slice(0, 2).toUpperCase() || 'AN'}</span>
              <span className="truncate max-w-[80px] sm:max-w-none">{post.author?.username || 'Anonymous'}</span>
            </span>
            <span className="flex-shrink-0">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span className="flex items-center gap-1 flex-shrink-0 text-[#6b7280]">
              <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {getReadingTime(post.content)} min read
            </span>
            <span className="flex items-center gap-1 flex-shrink-0">
              <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" /></svg>
              {post.commentsCount || 0}
            </span>
            <button onClick={handleShare} className="ml-auto bg-none border-none cursor-pointer p-0 text-[#6b7280] hover:text-red-500 transition-colors flex-shrink-0">
              {copied ? (
                <span className="text-green-600 text-[0.6rem] font-semibold">Copied!</span>
              ) : (
                <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
              )}
            </button>
            <button onClick={handleWishlist} className={`bg-none border-none cursor-pointer p-0 transition-colors flex-shrink-0 ${wishlisted ? 'text-red-500' : 'text-[#6b7280] hover:text-red-500'}`}>
              <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default PostCard;
