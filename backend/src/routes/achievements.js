const router = require('express').Router();
const achievementController = require('../controllers/achievementController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/',        achievementController.all);
router.get('/earned',  achievementController.earned);

module.exports = router;
