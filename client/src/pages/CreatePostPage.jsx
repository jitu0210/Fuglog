import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { posts } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import DOMPurify from 'dompurify';

const SAVE_KEY = 'fuglog_draft';
const AUTOSAVE_INTERVAL = 30000;

function CreatePostPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const inputRef = useRef(null);
  const contentRef = useRef(null);
  const previewRef = useRef(null);

  const [form, setForm] = useState({ title: '', content: '', tags: [], published: true });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

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
    } else {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.title || parsed.content) {
            setForm(parsed);
          }
        } catch { /* ignore corrupt data */ }
      }
      setFetching(false);
    }
  }, [id, isEdit, user, navigate]);

  useEffect(() => {
    if (contentRef.current && form.content && !contentRef.current.innerHTML) {
      contentRef.current.innerHTML = form.content;
    }
  }, [form.content]);

  useEffect(() => {
    if (isEdit) return;
    const timer = setInterval(() => {
      if (contentRef.current) {
        const content = contentRef.current.innerHTML;
        if (content || form.title) {
          const draft = { title: form.title, content, tags: form.tags, published: form.published };
          localStorage.setItem(SAVE_KEY, JSON.stringify(draft));
          setLastSaved(new Date());
        }
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(timer);
  }, [isEdit, form.title, form.tags, form.published]);

  const handleTitleChange = (e) => setForm((prev) => ({ ...prev, title: e.target.value }));

  const exec = (cmd, val) => {
    contentRef.current?.focus();
    try {
      document.execCommand(cmd, false, val || null);
    } catch { /* command not supported */ }
    handleContentInput();
  };

  const handleContentInput = () => {
    if (contentRef.current) {
      const html = contentRef.current.innerHTML;
      if (html !== form.content) {
        setForm((prev) => ({ ...prev, content: html }));
      }
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

  const handleRemoveTag = (tag) => setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  const handleTagWrapperClick = () => inputRef.current?.focus();

  const stripLinks = (text) => text.replace(/https?:\/\/[^\s]+|www\.[^\s]+/gi, '');

  const handlePaste = (e) => {
    const pasted = (e.clipboardData || window.clipboardData).getData('text/plain');
    if (/https?:\/\/[^\s]+|www\.[^\s]+/i.test(pasted)) {
      e.preventDefault();
      document.execCommand('insertText', false, stripLinks(pasted));
    }
  };

  const getPlainText = () => contentRef.current?.innerText || '';

  const discardDraft = () => {
    localStorage.removeItem(SAVE_KEY);
    setForm({ title: '', content: '', tags: [], published: true });
    if (contentRef.current) contentRef.current.innerHTML = '';
    setLastSaved(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Please enter a title for your post.'); return; }
    const plain = getPlainText();
    if (!plain.trim()) { setError('Please write some content for your post.'); return; }
    if (wordCount > 2000) { setError('Post exceeds the 2000 word limit.'); return; }

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
      localStorage.removeItem(SAVE_KEY);
      navigate(form.published ? `/posts/${res.data.post._id}` : `/profile/${user._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const wordCount = getPlainText() ? getPlainText().trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const toolbar = [
    { label: 'B', cmd: 'bold', title: 'Bold', className: 'font-bold' },
    { label: 'I', cmd: 'italic', title: 'Italic', className: 'italic' },
    { label: 'U', cmd: 'underline', title: 'Underline', className: 'underline' },
  ];

  if (fetching) return <LoadingSpinner text="Loading post..." />;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#f5f5f5]">{isEdit ? 'Edit post' : 'Create a new post'}</h2>
          <p className="text-sm text-[#9ca3af] mt-1 font-body">
            {isEdit ? 'Make changes to your post below.' : 'Share your thoughts, ideas, and stories with the world.'}
          </p>
        </div>
        {!isEdit && lastSaved && (
          <span className="text-[0.65rem] text-[#6b7280] font-sans flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            Saved {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>

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
          <input
            name="title"
            value={form.title}
            onChange={handleTitleChange}
            placeholder="Enter a compelling title..."
            className="w-full px-3 py-2.5 border border-[#2a2a2a] rounded-md text-sm bg-[#161616] text-[#f5f5f5] outline-none transition-all focus:border-red-600 focus:ring-3 focus:ring-red-600/10 font-display font-bold placeholder:text-[#6b7280]"
          />
        </div>

        <div className="mb-5">
          <div className="flex gap-0.5 px-3 py-2 bg-[#222] border border-[#2a2a2a] border-b-0 rounded-t-md flex-wrap">
            {toolbar.map((btn) => (
              <button
                key={btn.cmd + (btn.val || '')}
                type="button"
                onClick={() => exec(btn.cmd)}
                title={btn.title}
                className="bg-none border-none px-2 py-1 rounded cursor-pointer text-[#6b7280] text-xs hover:bg-[#2a2a2a] hover:text-[#f5f5f5] transition-colors font-sans"
              >
                <span className={btn.className || ''}>{btn.label}</span>
              </button>
            ))}
          </div>
          <div
            ref={contentRef}
            contentEditable
            onInput={handleContentInput}
            onPaste={handlePaste}
            suppressContentEditableWarning
            className="w-full px-3 py-3 border border-[#2a2a2a] rounded-b-md text-sm bg-[#161616] text-[#f5f5f5] outline-none resize-y min-h-[360px] leading-relaxed transition-all focus:border-red-600 focus:ring-3 focus:ring-red-600/10 font-body [&>blockquote]:border-l-2 [&>blockquote]:border-red-600 [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:text-[#9ca3af] cursor-text overflow-y-auto"
          />
          <div className="flex justify-between items-center mt-2">
            <span className={`text-[0.7rem] font-sans ${wordCount > 2000 ? 'text-red-500 font-semibold' : 'text-[#6b7280]'}`}>
              {wordCount}{wordCount > 2000 ? ` / 2000 words (exceeded by ${wordCount - 2000})` : ` / 2000 words`}
            </span>
            <div className="flex items-center gap-3">
              {wordCount > 0 && wordCount <= 2000 && (
                <span className="text-[0.7rem] text-[#6b7280] font-sans">~{readTime} min read</span>
              )}
              <button type="button" onClick={() => setShowPreview(true)} className="text-[0.7rem] text-red-500 font-sans bg-none border-none cursor-pointer hover:underline">
                Preview
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <div
            className="flex flex-wrap gap-1.5 px-3 py-2 border border-[#2a2a2a] rounded-md bg-[#161616] min-h-[42px] cursor-text transition-all focus-within:border-red-600 focus-within:ring-3 focus-within:ring-red-600/10"
            onClick={handleTagWrapperClick}
          >
            {form.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 bg-red-950 text-red-400 px-2 py-0.5 rounded text-xs font-semibold font-sans">
                {tag}
                <button type="button" className="bg-none border-none cursor-pointer text-red-400 text-sm leading-none p-0 opacity-60 hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag); }}>&times;</button>
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
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setForm((prev) => ({ ...prev, published: !prev.published }))}
            className={`px-4 py-2.5 rounded-md text-sm font-semibold font-sans cursor-pointer transition-colors border ${
              form.published
                ? 'bg-[#2a2a2a] text-[#f5f5f5] border-[#2a2a2a] hover:bg-[#333]'
                : 'bg-red-950 text-red-400 border-red-900 hover:bg-red-900'
            }`}
          >
            {form.published ? 'Published' : 'Draft'}
          </button>
          {!isEdit && form.title && (
            <button type="button" onClick={discardDraft} className="text-[0.7rem] text-[#6b7280] font-sans bg-none border-none cursor-pointer hover:text-red-500 transition-colors">
              Discard draft
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button type="submit" disabled={loading || wordCount > 2000} className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold font-sans cursor-pointer hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? 'Saving...' : isEdit ? 'Save changes' : 'Publish'}
            </button>
          </div>
        </div>
      </form>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-[#f5f5f5]">Preview</h3>
              <button onClick={() => setShowPreview(false)} className="bg-none border-none text-[#9ca3af] cursor-pointer text-xl hover:text-[#f5f5f5] transition-colors">&times;</button>
            </div>
            <article>
              {form.title && <h1 className="font-display text-2xl font-bold leading-tight mb-4 text-[#f5f5f5]">{form.title}</h1>}
              {form.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-4">
                  {form.tags.map((tag, i) => (
                    <span key={i} className="bg-red-950 text-red-400 px-2 py-0.5 rounded text-xs font-semibold font-sans">{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-[#6b7280] font-sans mb-4">
                <span>~{readTime} min read</span>
                <span>{wordCount} words</span>
              </div>
              <div className="text-base leading-relaxed text-[#f5f5f5] font-body [&>blockquote]:border-l-2 [&>blockquote]:border-red-600 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-[#9ca3af] [&>blockquote]:my-4" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(form.content || '') }} />
            </article>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreatePostPage;
