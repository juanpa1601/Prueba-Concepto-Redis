const router = require('express').Router();
const { userController } = require('../Controllers/index');
const { redisCachingMiddleware } = require('../middlewares/redis');

router.get('/redis', redisCachingMiddleware(), userController.users);
router.get('/all', userController.users);


module.exports = router;