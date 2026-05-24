const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/pointages');

router.get('/', ctrl.list);
router.post('/batch', ctrl.batchSave);
router.get('/by-date-chantier', ctrl.getByDateAndChantier);
router.delete('/:id', ctrl.delete);

module.exports = router;
