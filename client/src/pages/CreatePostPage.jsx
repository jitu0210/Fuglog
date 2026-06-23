import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { posts } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

function CreatePostPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const inputRef = useRef(null);

  const [form, setForm] = useState({ title: '', content: '', tags: [], published: true });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return navigate('/login');
    if (isEdit) {
      posts.get(id)
        .then((res) => {
          const p = res.data.post;
          setForm({ title: p.title, content: p.content, tags: p.tags || [], published: p.published !== false });
        })
        .catch(() => navigate('/'))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit, user, navigate]);

  const contentRef = useRef(null);

  const handleTitleChange = (e) => {
    setForm((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleBold = () => {
    document.execCommand('bold', false);
    contentRef.current?.focus();
  };

  const handleItalic = () => {
    document.execCommand('italic', false);
    contentRef.current?.focus();
  };

  const handleQuote = () => {
    document.execCommand('formatBlock', false, 'blockquote');
    contentRef.current?.focus();
  };

  const handleContentInput = () => {
    if (contentRef.current) {
      setForm((prev) => ({ ...prev, content: contentRef.current.innerHTML }));
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !form.tags.includes(tag)) {
        setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleTagWrapperClick = () => {
    inputRef.current?.focus();
  };

  const stripLinks = (text) => {
    return text.replace(/https?:\/\/[^\s]+|www\.[^\s]+/gi, '');
  };

  const handlePaste = (e) => {
    const pasted = (e.clipboardData || window.clipboardData).getData('text/plain');
    if (/https?:\/\/[^\s]+|www\.[^\s]+/i.test(pasted)) {
      e.preventDefault();
      const clean = stripLinks(pasted);
      document.execCommand('insertText', false, clean);
    }
  };

  const getPlainText = () => {
    return contentRef.current?.innerText || '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Please enter a title for your post.');
      return;
    }
    const plain = getPlainText();
    if (!plain.trim()) {
      setError('Please write some content for your post.');
      return;
    }
    if (wordCount > 2000) {
      setError('Post exceeds the 2000 word limit.');
      return;
    }

    setLoading(true);
    setError('');

    const data = {
      title: form.title.trim(),
      content: contentRef.current.innerHTML,
      tags: form.tags,
      published: form.published,
    };

    try {
      const res = isEdit
        ? await posts.update(id, data)
        : await posts.create(data);
      navigate(form.published ? `/posts/${res.data.post._id}` : `/profile/${user._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const wordCount = getPlainText()
    ? getPlainText().trim().split(/\s+/).length
    : 0;

  useEffect(() => {
    if (contentRef.current && form.content && !contentRef.current.innerHTML) {
      contentRef.current.innerHTML = form.content;
    }
  }, [form.content]);

  if (fetching) return <LoadingSpinner text="Loading post..." />;

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="font-display text-2xl font-bold mb-1 text-[#f5f5f5]">{isEdit ? 'Edit post' : 'Create a new post'}</h2>
      <p className="text-sm text-[#9ca3af] mb-8 font-body">
        {isEdit
          ? 'Make changes to your post below.'
          : 'Share your thoughts, ideas, and stories with the world.'}
      </p>

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
          <label className="block mb-1.5 font-sans text-sm font-semibold text-[#f5f5f5]">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleTitleChange}
            placeholder="Enter a compelling title..."
            className="w-full px-3 py-2.5 border border-[#2a2a2a] rounded-md text-sm bg-[#161616] text-[#f5f5f5] outline-none transition-all focus:border-red-600 focus:ring-3 focus:ring-red-600/10 font-display font-bold placeholder:text-[#6b7280]"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-1.5 font-sans text-sm font-semibold text-[#f5f5f5]">Content</label>
          <div className="flex gap-1.5 px-3 py-2 bg-[#222] border border-[#2a2a2a] border-b-0 rounded-t-md">
            <button type="button" onClick={handleBold} className="bg-none border-none px-2 py-1 rounded cursor-pointer text-[#6b7280] text-sm hover:bg-[#2a2a2a] hover:text-[#f5f5f5] transition-colors font-sans" title="Bold"><strong>B</strong></button>
            <button type="button" onClick={handleItalic} className="bg-none border-none px-2 py-1 rounded cursor-pointer text-[#6b7280] text-sm hover:bg-[#2a2a2a] hover:text-[#f5f5f5] transition-colors font-sans" title="Italic"><em>I</em></button>
            <button type="button" onClick={handleQuote} className="bg-none border-none px-2 py-1 rounded cursor-pointer text-[#6b7280] text-sm hover:bg-[#2a2a2a] hover:text-[#f5f5f5] transition-colors font-sans" title="Quote">&ldquo; &rdquo;</button>
          </div>
          <div
            ref={contentRef}
            contentEditable
            onInput={handleContentInput}
            onPaste={handlePaste}
            suppressContentEditableWarning
            className="w-full px-3 py-3 border border-[#2a2a2a] rounded-b-md text-sm bg-[#161616] text-[#f5f5f5] outline-none resize-y min-h-[320px] leading-relaxed transition-all focus:border-red-600 focus:ring-3 focus:ring-red-600/10 font-body [&>blockquote]:border-l-2 [&>blockquote]:border-red-600 [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:text-[#9ca3af] cursor-text overflow-y-auto"
          />
          <div className="flex justify-between items-center mt-2">
            <span className={`text-[0.7rem] font-sans ${wordCount > 2000 ? 'text-red-500 font-semibold' : 'text-[#6b7280]'}`}>
              {wordCount}{wordCount > 2000 ? ` / 2000 words (exceeded by ${wordCount - 2000})` : ` / 2000 words`}
            </span>
            {form.content && wordCount <= 2000 && (
              <span className="text-[0.7rem] text-[#6b7280] font-sans">
                ~{Math.max(1, Math.round(wordCount / 200))} min read
              </span>
            )}
          </div>
        </div>

        <div className="mb-5">
          <label className="block mb-1.5 font-sans text-sm font-semibold text-[#f5f5f5]">Tags</label>
          <div
            className="flex flex-wrap gap-1.5 px-3 py-2 border border-[#2a2a2a] rounded-md bg-[#161616] min-h-[42px] cursor-text transition-all focus-within:border-red-600 focus-within:ring-3 focus-within:ring-red-600/10"
            onClick={handleTagWrapperClick}
          >
            {form.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 bg-red-950 text-red-400 px-2 py-0.5 rounded text-xs font-semibold font-sans">
                {tag}
                <button
                  type="button"
                  className="bg-none border-none cursor-pointer text-red-400 text-sm leading-none p-0 opacity-60 hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag); }}
                >
                  &times;
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder={form.tags.length === 0 ? 'Type a tag and press Enter...' : ''}
              className="border-none outline-none flex-1 min-w-[100px] text-sm bg-transparent py-0.5 font-sans text-[#f5f5f5]"
            />
          </div>
          <p className="text-[0.65rem] text-[#6b7280] mt-1 font-sans">Press Enter or comma to add a tag. Click &times; to remove.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, published: !prev.published }))}
            className={`px-4 py-2.5 rounded-md text-sm font-semibold font-sans cursor-pointer transition-colors border ${
              form.published
                ? 'bg-[#2a2a2a] text-[#f5f5f5] border-[#2a2a2a] hover:bg-[#333]'
                : 'bg-red-950 text-red-400 border-red-900 hover:bg-red-900'
            }`}
          >
            {form.published ? 'Published' : 'Draft'}
          </button>
          <button type="submit" disabled={loading || wordCount > 2000} className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold font-sans cursor-pointer hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? 'Saving...' : isEdit ? 'Save changes' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePostPage;
