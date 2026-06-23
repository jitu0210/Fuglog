import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { posts as postsApi, comments as commentsApi } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ReadingProgressBar from '../components/ReadingProgressBar';
import PostCard from '../components/PostCard';

function PostPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    Promise.all([
      postsApi.get(id),
      commentsApi.list(id),
      postsApi.related(id),
    ])
      .then(([postRes, commentsRes, relatedRes]) => {
        const p = postRes.data.post;
        setPost(p);
        setComments(commentsRes.data.comments);
        setRelatedPosts(relatedRes.data.posts);
        setLiked(p.isLiked || false);
        setDisliked(p.isDisliked || false);
        setWishlisted(p.isWishlisted || false);
        setLikesCount(p.likesCount || 0);
        setDislikesCount(p.dislikesCount || 0);
        setWishlistCount(p.wishlistCount || 0);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    try {
      await postsApi.delete(id);
      navigate('/');
    } catch {
      setError('Failed to delete post');
    }
  };

  const handleComment = async (e, parentCommentId = null) => {
    e.preventDefault();
    const text = parentCommentId ? replyText : commentText;
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await commentsApi.create(id, { content: text, parentComment: parentCommentId });
      if (parentCommentId) {
        setComments((prev) => prev.map((c) =>
          c._id === parentCommentId
            ? { ...c, replies: [...(c.replies || []), res.data.comment] }
            : c
        ));
        setReplyText('');
        setReplyTo(null);
      } else {
        setComments((prev) => [res.data.comment, ...prev]);
        setCommentText('');
      }
      setPost((prev) => ({ ...prev, commentsCount: (prev.commentsCount || 0) + 1 }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentsApi.delete(id, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setPost((prev) => ({ ...prev, commentsCount: Math.max(0, (prev.commentsCount || 0) - 1) }));
    } catch {
      setError('Failed to delete comment');
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditingCommentText(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleSaveEdit = async (commentId) => {
    if (!editingCommentText.trim()) return;
    try {
      const res = await commentsApi.update(id, commentId, { content: editingCommentText });
      const updateInList = (commentsList) =>
        commentsList.map((c) => {
          if (c._id === commentId) return res.data.comment;
          if (c.replies) c.replies = c.replies.map((r) => (r._id === commentId ? res.data.comment : r));
          return c;
        });
      setComments((prev) => updateInList(prev));
      setEditingCommentId(null);
      setEditingCommentText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update comment');
    }
  };

  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await postsApi.like(id);
      setLiked(res.data.isLiked);
      setDisliked(res.data.isDisliked);
      setLikesCount(res.data.likesCount);
      setDislikesCount(res.data.dislikesCount);
    } catch { /* noop */ }
  };

  const handleDislike = async () => {
    if (!user) return;
    try {
      const res = await postsApi.dislike(id);
      setDisliked(res.data.isDisliked);
      setLiked(res.data.isLiked);
      setLikesCount(res.data.likesCount);
      setDislikesCount(res.data.dislikesCount);
    } catch { /* noop */ }
  };

  const handleWishlist = async () => {
    if (!user) return;
    try {
      const res = await postsApi.wishlist(id);
      setWishlisted(res.data.isWishlisted);
      setWishlistCount(res.data.wishlistCount);
    } catch { /* noop */ }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <LoadingSpinner text="Loading article..." />;
  if (!post) return null;

  const authorInitials = post.author?.username
    ? post.author.username.slice(0, 2).toUpperCase()
    : 'AN';

  const commentInitials = (username) =>
    username ? username.slice(0, 2).toUpperCase() : '??';

  const formattedDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div className="max-w-3xl mx-auto">
      <ReadingProgressBar />

      <article className="bg-[#161616] rounded-lg border border-[#2a2a2a] p-6 md:p-8 mb-6">
        <div className="mb-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-4 text-[#f5f5f5]">{post.title}</h1>

          <div className="flex items-center gap-4 flex-wrap pb-6 border-b border-[#2a2a2a] mb-6">
            <Link to={`/profile/${post.author?._id}`} className="flex items-center gap-3 no-underline text-inherit">
              <span className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold text-white font-sans">{authorInitials}</span>
              <div className="flex flex-col">
                <span className="font-sans text-sm font-semibold text-[#f5f5f5]">{post.author?.username || 'Anonymous'}</span>
                <span className="text-xs text-[#9ca3af] font-sans">
                  {formattedDate(post.createdAt)}
                  {post.updatedAt !== post.createdAt && ' (updated)'}
                </span>
              </div>
            </Link>
          </div>

          {post.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-6">
              {post.tags.map((tag, i) => (
                <span key={i} className="bg-red-950 text-red-400 px-3 py-1 rounded-full text-xs font-semibold font-sans">{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="text-base leading-relaxed text-[#f5f5f5] font-body [&>blockquote]:border-l-2 [&>blockquote]:border-red-600 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-[#9ca3af] [&>blockquote]:my-4" dangerouslySetInnerHTML={{ __html: post.content }} />

        <div className="flex items-center gap-5 pt-5 mt-6 border-t border-[#2a2a2a] text-sm text-[#9ca3af] font-sans flex-wrap">
          <button onClick={handleLike} className={`flex items-center gap-1.5 bg-none border-none cursor-pointer text-sm font-sans transition-colors ${liked ? 'text-red-500 font-semibold' : 'text-[#9ca3af] hover:text-red-500'}`}>
            <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
            {likesCount > 0 ? likesCount : 'Like'}
          </button>
          <button onClick={handleDislike} className={`flex items-center gap-1.5 bg-none border-none cursor-pointer text-sm font-sans transition-colors ${disliked ? 'text-red-500 font-semibold' : 'text-[#6b7280] hover:text-red-500'}`}>
            <svg className="w-5 h-5" fill={disliked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            {dislikesCount > 0 ? dislikesCount : 'Dislike'}
          </button>
          <span className="flex items-center gap-1.5 text-[#9ca3af]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" /></svg>
            {post.commentsCount || 0} Comments
          </span>
          <button onClick={handleShare} className="flex items-center gap-1.5 bg-none border-none cursor-pointer text-sm font-sans text-[#9ca3af] hover:text-red-500 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
            {copied ? 'Copied!' : 'Share'}
          </button>
          <button onClick={handleWishlist} className={`ml-auto flex items-center gap-1.5 bg-none border-none cursor-pointer text-sm font-sans transition-colors ${wishlisted ? 'text-red-500 font-semibold' : 'text-[#9ca3af] hover:text-red-500'}`}>
            <svg className="w-5 h-5" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
            {wishlisted ? 'Saved' : 'Save'}
          </button>
        </div>

        {user && post.author?._id === user._id && (
          <div className="flex gap-3 mt-4 pt-4 border-t border-[#2a2a2a]">
            <Link to={`/edit/${post._id}`} className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold font-sans no-underline hover:bg-red-700 transition-colors">Edit post</Link>
            <button onClick={handleDelete} className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold font-sans cursor-pointer hover:bg-red-700 transition-colors">Delete post</button>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 mt-4 rounded-md bg-red-950 text-red-300 border border-red-900 text-sm font-sans">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}
      </article>

      {relatedPosts.length > 0 && (
        <div className="mb-8">
          <h3 className="font-display text-xl font-bold mb-5 text-[#f5f5f5]">Related articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {relatedPosts.map((rp) => (
              <PostCard key={rp._id} post={rp} user={user} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#161616] rounded-lg border border-[#2a2a2a] p-6 md:p-8">
        <h3 className="font-display text-xl font-bold mb-6 text-[#f5f5f5]">
          Comments <span className="bg-red-950 text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold font-sans ml-1">{comments.length}</span>
        </h3>

        {user ? (
          <form onSubmit={handleComment} className="mb-6">
            <textarea
              placeholder="Share your thoughts..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full p-3 border border-[#2a2a2a] rounded-lg text-sm font-body bg-[#222] outline-none resize-y min-h-[80px] transition-all focus:border-red-600 focus:ring-3 focus:ring-red-600/10 focus:bg-[#2a2a2a] text-[#f5f5f5] placeholder:text-[#6b7280]"
            />
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold font-sans cursor-pointer mt-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Posting...' : 'Post comment'}
            </button>
          </form>
        ) : (
          <p className="mb-6 text-sm text-[#9ca3af] font-sans">
            <Link to="/login" className="text-red-500 font-semibold">Sign in</Link> to leave a comment.
          </p>
        )}

        {comments.length === 0 ? (
          <p className="text-sm text-[#6b7280] text-center py-4 font-sans">No comments yet. Start the conversation!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id}>
              <div className="flex gap-3 py-4 border-b border-[#2a2a2a]">
                <span className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[0.65rem] font-bold text-[#9ca3af] flex-shrink-0 font-sans">
                  {commentInitials(comment.author?.username)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-sans text-sm font-semibold text-[#f5f5f5]">{comment.author?.username || 'Anonymous'}</span>
                    <span className="text-[0.65rem] text-[#6b7280] font-sans">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric',
                      })}
                      {comment.updatedAt !== comment.createdAt && ' (edited)'}
                    </span>
                    {user && (
                      <button
                        onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                        className="ml-auto bg-none border-none text-[#6b7280] cursor-pointer text-[0.65rem] px-1 py-0.5 rounded font-sans hover:text-red-500 hover:bg-red-950 transition-colors"
                      >
                        Reply
                      </button>
                    )}
                    {user && comment.author?._id === user._id && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditComment(comment)}
                          className="bg-none border-none text-[#6b7280] cursor-pointer text-[0.65rem] px-1 py-0.5 rounded font-sans hover:text-red-500 hover:bg-red-950 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="bg-none border-none text-[#6b7280] cursor-pointer text-[0.65rem] px-1 py-0.5 rounded font-sans hover:text-red-500 hover:bg-red-950 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  {editingCommentId === comment._id ? (
                    <div className="mt-1">
                      <textarea
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        className="w-full p-2 border border-[#2a2a2a] rounded text-sm font-body bg-[#222] outline-none resize-y min-h-[60px] focus:border-red-600 focus:ring-3 focus:ring-red-600/10 text-[#f5f5f5]"
                      />
                      <div className="flex gap-2 mt-1.5">
                        <button
                          onClick={() => handleSaveEdit(comment._id)}
                          className="bg-red-600 text-white px-2.5 py-1 rounded text-[0.65rem] font-semibold font-sans cursor-pointer hover:bg-red-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-transparent text-[#9ca3af] px-2.5 py-1 rounded text-[0.65rem] font-semibold font-sans cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-[#9ca3af] leading-relaxed font-body">{comment.content}</div>
                  )}

                  {replyTo === comment._id && (
                    <form onSubmit={(e) => handleComment(e, comment._id)} className="mt-3 ml-4">
                      <textarea
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full p-2 border border-[#2a2a2a] rounded text-sm font-body bg-[#222] outline-none resize-y min-h-[60px] focus:border-red-600 focus:ring-3 focus:ring-red-600/10 text-[#f5f5f5] placeholder:text-[#6b7280]"
                      />
                      <div className="flex gap-2 mt-1.5">
                        <button type="submit" disabled={submitting || !replyText.trim()} className="bg-red-600 text-white px-2.5 py-1 rounded text-[0.65rem] font-semibold font-sans cursor-pointer hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                          {submitting ? 'Posting...' : 'Reply'}
                        </button>
                        <button type="button" onClick={() => { setReplyTo(null); setReplyText(''); }} className="bg-transparent text-[#9ca3af] px-2.5 py-1 rounded text-[0.65rem] font-semibold font-sans cursor-pointer hover:bg-[#2a2a2a] transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {comment.replies?.length > 0 && (
                    <div className="mt-3 ml-8 space-y-3 border-l-2 border-[#2a2a2a] pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="flex gap-2 py-2">
                          <span className="w-6 h-6 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[0.55rem] font-bold text-[#9ca3af] flex-shrink-0 font-sans">
                            {commentInitials(reply.author?.username)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-sans text-xs font-semibold text-[#f5f5f5]">{reply.author?.username || 'Anonymous'}</span>
                              <span className="text-[0.6rem] text-[#6b7280] font-sans">
                                {new Date(reply.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              {user && reply.author?._id === user._id && (
                                <div className="ml-auto flex gap-1">
                                  <button
                                    onClick={() => handleEditComment(reply)}
                                    className="bg-none border-none text-[#6b7280] cursor-pointer text-[0.6rem] px-1 py-0.5 rounded font-sans hover:text-red-500 hover:bg-red-950 transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComment(reply._id)}
                                    className="bg-none border-none text-[#6b7280] cursor-pointer text-[0.6rem] px-1 py-0.5 rounded font-sans hover:text-red-500 hover:bg-red-950 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-[#9ca3af] leading-relaxed font-body">{reply.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PostPage;
