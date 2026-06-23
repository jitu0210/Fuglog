function enrichPosts(posts, userId) {
  return posts.map((post) => {
    post.isLiked = userId ? post.likes?.some((l) => l.toString() === userId) : false;
    post.isDisliked = userId ? post.dislikes?.some((d) => d.toString() === userId) : false;
    post.isWishlisted = userId ? post.wishlistedBy?.some((w) => w.toString() === userId) : false;
    post.likesCount = post.likes?.length || 0;
    post.dislikesCount = post.dislikes?.length || 0;
    post.wishlistCount = post.wishlistedBy?.length || 0;
    return post;
  });
}

module.exports = enrichPosts;
