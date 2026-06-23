const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const enrichPosts = require('../utils/enrichPosts');
const { sanitizePostContent } = require('../utils/sanitize');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, tag, author, search, published } = req.query;
    const match = {};

    if (published !== 'all') {
      match.published = published !== 'false';
    }
    if (tag) match.tags = tag;
    if (author) match.author = new mongoose.Types.ObjectId(author);
    if (search) {
      match.$text = { $search: search };
    }

    const pipeline = [
      { $match: match },
      { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
      { $sort: { likesCount: -1, createdAt: -1 } },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
      { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
      { $project: { 'author.password': 0, 'author.email': 0 } },
    ];

    const posts = await Post.aggregate(pipeline);
    const total = await Post.countDocuments(match);
    const userId = req.user?._id?.toString();

    res.json({
      posts: enrichPosts(posts, userId),
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username bio');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const postObj = post.toObject();
    const userId = req.user?._id?.toString();
    res.json({ post: enrichPosts([postObj], userId)[0] });
    Post.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).catch(() => {});
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, content, tags, imageUrl, published } = req.body;

    if (content) {
      const wordCount = content.trim().split(/\s+/).length;
      if (wordCount > 2000) {
        return res.status(400).json({ message: 'Post exceeds the 2000 word limit.' });
      }
    }

    const post = await Post.create({ title, content: sanitizePostContent(content), tags, imageUrl, published, author: req.user._id });
    await post.populate('author', 'username');
    res.status(201).json({ post });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, author: req.user._id });
    if (!post) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }
    const { title, content, tags, imageUrl, published } = req.body;

    if (content !== undefined) {
      const wordCount = content.trim().split(/\s+/).length;
      if (wordCount > 2000) {
        return res.status(400).json({ message: 'Post exceeds the 2000 word limit.' });
      }
    }

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = sanitizePostContent(content);
    if (tags !== undefined) post.tags = tags;
    if (imageUrl !== undefined) post.imageUrl = imageUrl;
    if (published !== undefined) post.published = published;
    await post.save();
    await post.populate('author', 'username');
    res.json({ post });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user._id });
    if (!post) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }
    await Comment.deleteMany({ post: req.params.id });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getByCode = async (req, res, next) => {
  try {
    const post = await Post.findOne({ postCode: req.params.code }).populate('author', 'username bio');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const postObj = post.toObject();
    const userId = req.user?._id?.toString();
    res.json({ post: enrichPosts([postObj], userId)[0] });
    Post.findByIdAndUpdate(post._id, { $inc: { viewCount: 1 } }).catch(() => {});
  } catch (error) {
    next(error);
  }
};

exports.related = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || !post.tags?.length) return res.json({ posts: [] });

    const related = await Post.aggregate([
      { $match: { _id: { $ne: post._id }, tags: { $in: post.tags } } },
      { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } }, matchCount: { $size: { $setIntersection: ['$tags', post.tags] } } } },
      { $sort: { matchCount: -1, likesCount: -1, createdAt: -1 } },
      { $limit: 4 },
      { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
      { $project: { 'author.password': 0, 'author.email': 0 } },
    ]);

    const userId = req.user?._id?.toString();
    res.json({ posts: enrichPosts(related, userId) });
  } catch (error) {
    next(error);
  }
};

exports.like = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id;
    const liked = post.likes.some((id) => id.toString() === userId.toString());

    if (liked) {
      post.likes.pull(userId);
    } else {
      post.dislikes.pull(userId);
      post.likes.push(userId);
    }

    await post.save();

    if (!liked && post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'like',
        post: post._id,
      });
    }

    res.json({
      isLiked: !liked,
      isDisliked: false,
      likesCount: post.likes.length,
      dislikesCount: post.dislikes.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.dislike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id;
    const disliked = post.dislikes.some((id) => id.toString() === userId.toString());

    if (disliked) {
      post.dislikes.pull(userId);
    } else {
      post.likes.pull(userId);
      post.dislikes.push(userId);
    }

    await post.save();
    res.json({
      isDisliked: !disliked,
      isLiked: false,
      likesCount: post.likes.length,
      dislikesCount: post.dislikes.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.wishlist = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id;
    const wishlisted = post.wishlistedBy.some((id) => id.toString() === userId.toString());

    if (wishlisted) {
      post.wishlistedBy.pull(userId);
      await User.findByIdAndUpdate(userId, { $pull: { wishlist: post._id } });
    } else {
      post.wishlistedBy.push(userId);
      await User.findByIdAndUpdate(userId, { $addToSet: { wishlist: post._id } });
    }

    await post.save();
    res.json({ isWishlisted: !wishlisted, wishlistCount: post.wishlistedBy.length });
  } catch (error) {
    next(error);
  }
};
