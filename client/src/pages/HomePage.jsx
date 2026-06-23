import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { posts } from '../api';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

function HomePage({ user }) {
  const [data, setData] = useState({ posts: [], total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [trendingTags, setTrendingTags] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const activeTag = searchParams.get('tag') || '';

  useEffect(() => {
    setLoading(true);
    const params = { page, search, limit: 15 };
    if (activeTag) params.tag = activeTag;
    posts.list(params)
      .then((res) => setData(res.data))
      .catch(() => { /* no-op */ })
      .finally(() => setLoading(false));
  }, [page, search, activeTag]);

  useEffect(() => {
    posts.trendingTags()
      .then((res) => setTrendingTags(res.data.tags))
      .catch(() => { /* no-op */ });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = e.target.search.value;
    setSearchParams(q ? { search: q } : {});
  };

  const handleTagFilter = (tag) => {
    if (activeTag === tag) {
      setSearchParams({});
    } else {
      setSearchParams({ tag });
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-8 flex-col sm:flex-row">
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search articles..."
            className="flex-1 sm:max-w-xs px-4 py-2.5 border border-[#2a2a2a] rounded-lg text-sm bg-[#161616] outline-none transition-all focus:border-red-600 focus:ring-3 focus:ring-red-600/10 font-sans text-[#f5f5f5] placeholder:text-[#6b7280]"
          />
          <button type="submit" className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-md text-sm font-semibold font-sans cursor-pointer hover:bg-red-700 transition-colors">Search</button>
        </div>
        {search && (
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 bg-transparent text-[#9ca3af] px-3 py-2 rounded-md text-sm font-semibold font-sans cursor-pointer hover:bg-[#2a2a2a] transition-colors w-full sm:w-auto"
            onClick={() => setSearchParams({})}
          >
            Clear
          </button>
        )}
      </form>

      {trendingTags.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
            <span className="text-[0.65rem] font-semibold text-[#9ca3af] uppercase tracking-wider font-sans">Trending topics</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 rounded-full text-xs font-semibold font-sans cursor-pointer transition-all border ${
                !activeTag
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-[#161616] text-[#9ca3af] border-[#2a2a2a] hover:border-red-600 hover:text-red-500 hover:bg-red-950'
              }`}
              onClick={() => setSearchParams({})}
            >
              All
            </button>
            {trendingTags.map((tag) => (
              <button
                key={tag.name}
                className={`px-3 py-1 rounded-full text-xs font-semibold font-sans cursor-pointer transition-all border ${
                  activeTag === tag.name
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-[#161616] text-[#9ca3af] border-[#2a2a2a] hover:border-red-600 hover:text-red-500 hover:bg-red-950'
                }`}
                onClick={() => handleTagFilter(tag.name)}
              >
                {tag.name}
                <span className="ml-1 text-[0.6rem] opacity-60">{tag.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Loading posts..." />
      ) : data.posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          message="Be the first to share something with the world."
          actionLabel={user ? 'Write a post' : undefined}
          actionTo={user ? '/create' : undefined}
        />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {data.posts.map((post) => (
              <PostCard key={post._id} post={post} user={user} />
            ))}
          </div>

          {data.pages > 1 && (
            <div className="flex justify-center items-center gap-1 mt-12 overflow-x-auto pb-2">
              <button
                onClick={() => setSearchParams({ page: String(Math.max(1, page - 1)) })}
                disabled={page === 1}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-[#2a2a2a] rounded-md text-xs sm:text-sm font-semibold font-sans cursor-pointer transition-all bg-[#161616] text-[#9ca3af] hover:border-red-600 hover:text-red-500 hover:bg-red-950 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              >
                Prev
              </button>
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border rounded-md text-xs sm:text-sm font-semibold font-sans cursor-pointer transition-all flex-shrink-0 ${
                    p === page
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-[#161616] text-[#9ca3af] border-[#2a2a2a] hover:border-red-600 hover:text-red-500 hover:bg-red-950'
                  }`}
                  onClick={() => setSearchParams({ page: String(p) })}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setSearchParams({ page: String(Math.min(data.pages, page + 1)) })}
                disabled={page === data.pages}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-[#2a2a2a] rounded-md text-xs sm:text-sm font-semibold font-sans cursor-pointer transition-all bg-[#161616] text-[#9ca3af] hover:border-red-600 hover:text-red-500 hover:bg-red-950 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default HomePage;
