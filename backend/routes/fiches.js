const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/fiches');

router.get('/calcul', ctrl.calculate);

module.exports = router;
