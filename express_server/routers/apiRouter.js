const express = require('express');
const router = express.Router();

/**
 * import all controller
 */

const groupChatRoomController = require("../controllers/groupChatRoomController");
const authenticationController = require('../controllers/authenticationController');

router.post("/login", authenticationController.handleLogin);

router.post("/logout", authenticationController.handleLogout);

router.get('/rooms', groupChatRoomController.handleGetRooms);



module.exports = router;
