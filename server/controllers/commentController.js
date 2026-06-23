const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { stripAllHtml } = require('../utils/sanitize');

exports.list = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId, parentComment: null })
      .populate('author', 'username')
      .populate({ path: 'replies', populate: { path: 'author', select: 'username' } })
      .sort({ createdAt: -1 });
    res.json({ comments });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({
      content: stripAllHtml(req.body.content),
      author: req.user._id,
      post: postId,
      parentComment: req.body.parentComment || null,
    });

    if (req.body.parentComment) {
      await Comment.findByIdAndUpdate(req.body.parentComment, { $push: { replies: comment._id } });
      const parent = await Comment.findById(req.body.parentComment).populate('author', 'username');
      if (parent.author._id.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: parent.author._id,
          sender: req.user._id,
          type: 'reply',
          post: postId,
          comment: comment._id,
        });
      }
    }

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
    await comment.populate('author', 'username');

    if (!req.body.parentComment && post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        post: postId,
        comment: comment._id,
      });
    }

    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.commentId, author: req.user._id });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }
    comment.content = stripAllHtml(req.body.content);
    await comment.save();
    await comment.populate('author', 'username');
    res.json({ comment });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const comment = await Comment.findOneAndDelete({ _id: req.params.commentId, author: req.user._id });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};
