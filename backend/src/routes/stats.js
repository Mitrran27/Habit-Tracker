const router = require('express').Router();
const statsController = require('../controllers/statsController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/dashboard',        statsController.dashboard);
router.get('/weekly',           statsController.weekly);
router.get('/monthly',          statsController.monthly);
router.get('/categories',       statsController.categories);
router.get('/mood-correlation', statsController.moodCorrelation);
router.get('/best-worst',       statsController.bestWorst);
router.get('/heatmap',          statsController.heatmap);

module.exports = router;
