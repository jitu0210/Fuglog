const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const enrichPosts = require('../utils/enrichPosts');

exports.getTrendingTags = async (req, res, next) => {
  try {
    const tags = await Post.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json({ tags: tags.map((t) => ({ name: t._id, count: t.count })) });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username').populate('following', 'username');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const karmaResult = await Post.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(req.params.id) } },
      { $project: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
      { $group: { _id: null, total: { $sum: '$likesCount' } } },
    ]);
    const obj = user.toJSON();
    obj.followersCount = user.followers?.length || 0;
    obj.followingCount = user.following?.length || 0;
    obj.karma = karmaResult[0]?.total || 0;
    res.json({ user: obj });
  } catch (error) {
    next(error);
  }
};

exports.getUserPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pipeline = [
      { $match: { author: new mongoose.Types.ObjectId(req.params.id) } },
      { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
      { $sort: { likesCount: -1, createdAt: -1 } },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
      { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
      { $project: { 'author.password': 0, 'author.email': 0 } },
    ];

    const posts = await Post.aggregate(pipeline);
    const total = await Post.countDocuments({ author: req.params.id });
    const userId = req.user?._id?.toString();
    res.json({ posts: enrichPosts(posts, userId), total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

exports.getUserWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const pipeline = [
      { $match: { _id: { $in: user.wishlist.map((id) => new mongoose.Types.ObjectId(id)) } } },
      { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
      { $sort: { likesCount: -1, createdAt: -1 } },
      { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
      { $project: { 'author.password': 0, 'author.email': 0 } },
    ];

    const posts = await Post.aggregate(pipeline);
    const userId = req.user?._id?.toString();
    res.json({ posts: enrichPosts(posts, userId) });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { username, bio } = req.body;
    const user = req.user;
    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing) return res.status(409).json({ message: 'Username already taken' });
      user.username = username;
    }
    if (bio !== undefined) user.bio = bio;
    await user.save();
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.follow = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const isFollowing = req.user.following.some((id) => id.toString() === req.params.id);
    if (isFollowing) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user._id } });
      await Notification.create({
        recipient: req.params.id,
        sender: req.user._id,
        type: 'follow',
      });
    }

    const updatedTarget = await User.findById(req.params.id).populate('followers', 'username').populate('following', 'username');
    const obj = updatedTarget.toJSON();
    obj.followersCount = updatedTarget.followers?.length || 0;
    obj.followingCount = updatedTarget.following?.length || 0;
    res.json({ isFollowing: !isFollowing, user: obj });
  } catch (error) {
    next(error);
  }
};
