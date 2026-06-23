const Room = require('../models/Room');
const Message = require('../models/Message');

const MAX_ROOMS_PER_USER = 5;

function err(status, message) {
  return Object.assign(new Error(message), { status });
}

async function findRoom(id) {
  const room = await Room.findById(id);
  if (!room) throw err(404, 'Room not found');
  return room;
}

function checkCreator(room, userId) {
  if (room.creator.toString() !== userId.toString()) {
    throw err(403, 'Only the host can perform this action');
  }
}

function checkMemberLimit(room) {
  if (room.members.length >= room.maxMembers) {
    throw err(400, 'Room is full');
  }
}

async function checkUserRoomLimit(userId) {
  const count = await Room.countDocuments({ 'members.user': userId });
  if (count >= MAX_ROOMS_PER_USER) {
    throw err(400, `You can be in at most ${MAX_ROOMS_PER_USER} rooms`);
  }
}

const memberId = (m) => (m.user ? m.user.toString() : m.toString());

async function populateRoom(room) {
  return Room.findById(room._id)
    .populate('creator', 'username')
    .populate('members.user', 'username')
    .populate('pastMembers.user', 'username');
}

const sendError = (res, err) => {
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Internal server error' });
};

exports.update = async (req, res) => {
  try {
    const room = await findRoom(req.params.id);
    checkCreator(room, req.user._id);

    const { name, description } = req.body;
    if (name !== undefined) {
      if (!name.trim()) throw err(400, 'Room name cannot be empty');
      room.name = name.trim();
    }
    if (description !== undefined) room.description = description.trim();

    await room.save();
    const populated = await populateRoom(room);
    res.json(populated);
  } catch (e) { sendError(res, e); }
};

exports.remove = async (req, res) => {
  try {
    const room = await findRoom(req.params.id);
    checkCreator(room, req.user._id);

    await Message.deleteMany({ room: room._id });
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (e) { sendError(res, e); }
};

exports.leave = async (req, res) => {
  try {
    const room = await findRoom(req.params.id);
    if (room.creator.toString() === req.user._id.toString()) {
      throw err(400, 'Host cannot leave. Delete the room instead.');
    }

    const idx = room.members.findIndex((m) => memberId(m) === req.user._id.toString());
    if (idx === -1) throw err(400, 'You are not a member of this room');

    const leaving = room.members[idx];
    room.pastMembers.push({ user: leaving.user, joinedAt: leaving.joinedAt, leftAt: new Date() });
    room.members.splice(idx, 1);
    await room.save();

    const populated = await populateRoom(room);
    res.json(populated);
  } catch (e) { sendError(res, e); }
};

exports.kickMember = async (req, res) => {
  try {
    const room = await findRoom(req.params.id);
    checkCreator(room, req.user._id);
    if (req.params.userId === req.user._id.toString()) {
      throw err(400, 'Cannot kick yourself');
    }

    const idx = room.members.findIndex((m) => memberId(m) === req.params.userId);
    if (idx === -1) throw err(400, 'User is not a member');

    const kicked = room.members[idx];
    room.pastMembers.push({ user: kicked.user, joinedAt: kicked.joinedAt, leftAt: new Date() });
    room.members.splice(idx, 1);
    await room.save();

    const populated = await populateRoom(room);
    res.json(populated);
  } catch (e) { sendError(res, e); }
};

exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) throw err(400, 'Room name is required');
    await checkUserRoomLimit(req.user._id);

    const room = new Room({
      name: name.trim(),
      description: description?.trim() || '',
      creator: req.user._id,
      members: [{ user: req.user._id }],
    });

    await room.save();
    const populated = await populateRoom(room);
    res.status(201).json(populated);
  } catch (e) { sendError(res, e); }
};

exports.joinByCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) throw err(400, 'Invite code is required');

    const room = await Room.findOne({ inviteCode: code.trim() });
    if (!room) throw err(404, 'Room not found');

    if (room.members.some((m) => memberId(m) === req.user._id.toString())) {
      throw err(400, 'Already a member of this room');
    }
    checkMemberLimit(room);
    await checkUserRoomLimit(req.user._id);

    room.members.push({ user: req.user._id });
    await room.save();

    const populated = await populateRoom(room);
    res.json(populated);
  } catch (e) { sendError(res, e); }
};

exports.getMine = async (req, res) => {
  try {
    const rooms = await Room.find({ 'members.user': req.user._id })
      .populate('creator', 'username')
      .populate('members.user', 'username')
      .populate('pastMembers.user', 'username')
      .sort({ createdAt: -1 });

    res.json(rooms);
  } catch (e) { sendError(res, e); }
};

exports.getByCode = async (req, res) => {
  try {
    const room = await Room.findOne({ inviteCode: req.params.code })
      .populate('creator', 'username')
      .populate('members.user', 'username')
      .populate('pastMembers.user', 'username');

    if (!room) throw err(404, 'Room not found');
    res.json(room);
  } catch (e) { sendError(res, e); }
};

exports.searchByName = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json([]);

    const rooms = await Room.find({
      $or: [
        { name: { $regex: q.trim(), $options: 'i' } },
        { inviteCode: { $regex: q.trim(), $options: 'i' } },
      ],
    })
      .populate('creator', 'username')
      .populate('members.user', 'username')
      .limit(20);

    res.json(rooms);
  } catch (e) { sendError(res, e); }
};

exports.sendRequest = async (req, res) => {
  try {
    const room = await findRoom(req.params.id);

    if (room.members.some((m) => memberId(m) === req.user._id.toString())) {
      throw err(400, 'Already a member of this room');
    }
    checkMemberLimit(room);
    await checkUserRoomLimit(req.user._id);

    if (room.joinRequests.some((r) => r.user.toString() === req.user._id.toString() && r.status === 'pending')) {
      throw err(400, 'Join request already sent');
    }

    room.joinRequests.push({ user: req.user._id, status: 'pending' });
    await room.save();
    res.json({ message: 'Join request sent' });
  } catch (e) { sendError(res, e); }
};

exports.approveRequest = async (req, res) => {
  try {
    const room = await findRoom(req.params.id);
    checkCreator(room, req.user._id);
    checkMemberLimit(room);
    await checkUserRoomLimit(req.params.userId);

    const request = room.joinRequests.find((r) => r.user.toString() === req.params.userId && r.status === 'pending');
    if (!request) throw err(404, 'Pending request not found');

    request.status = 'approved';
    room.members.push({ user: req.params.userId });
    await room.save();

    const populated = await populateRoom(room);
    res.json(populated);
  } catch (e) { sendError(res, e); }
};

exports.declineRequest = async (req, res) => {
  try {
    const room = await findRoom(req.params.id);
    checkCreator(room, req.user._id);

    const request = room.joinRequests.find((r) => r.user.toString() === req.params.userId && r.status === 'pending');
    if (!request) throw err(404, 'Pending request not found');

    request.status = 'declined';
    await room.save();
    res.json({ message: 'Request declined' });
  } catch (e) { sendError(res, e); }
};

exports.getRequests = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('joinRequests.user', 'username');
    if (!room) throw err(404, 'Room not found');
    checkCreator(room, req.user._id);

    res.json(room.joinRequests.filter((r) => r.status === 'pending'));
  } catch (e) { sendError(res, e); }
};

exports.sendMessage = async (req, res) => {
  try {
    const room = await findRoom(req.params.id);
    if (!room.members.some((m) => memberId(m) === req.user._id.toString())) {
      throw err(403, 'Only members can send messages');
    }

    const { content } = req.body;
    if (!content || !content.trim()) throw err(400, 'Message cannot be empty');

    const message = await Message.create({
      room: room._id,
      sender: req.user._id,
      content: content.trim(),
    });

    const populated = await Message.findById(message._id).populate('sender', 'username');
    res.status(201).json(populated);
  } catch (e) { sendError(res, e); }
};

exports.getMessages = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) throw err(404, 'Room not found');

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const messages = await Message.find({ room: req.params.id })
      .populate('sender', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ room: req.params.id });

    res.json({
      messages: messages.reverse(),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (e) { sendError(res, e); }
};
