const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const roomController = require('../controllers/roomController');

router.post('/', auth, roomController.create);
router.post('/join', auth, roomController.joinByCode);
router.get('/mine', auth, roomController.getMine);
router.get('/search', auth, roomController.searchByName);
router.get('/:code', roomController.getByCode);
router.post('/:id/request', auth, roomController.sendRequest);
router.get('/:id/requests', auth, roomController.getRequests);
router.post('/:id/request/:userId/approve', auth, roomController.approveRequest);
router.post('/:id/request/:userId/decline', auth, roomController.declineRequest);
router.put('/:id', auth, roomController.update);
router.delete('/:id', auth, roomController.remove);
router.post('/:id/leave', auth, roomController.leave);
router.post('/:id/kick/:userId', auth, roomController.kickMember);
router.get('/:id/messages', auth, roomController.getMessages);
router.post('/:id/messages', auth, roomController.sendMessage);

module.exports = router;
