const express = require('express');
const router = express.Router();
const statesController = require('../../controller/statesController');

// Routes for API requests
router.route('/')
    .get(statesController.getAllStates)
    .post(statesController.createNewState)
    .put(statesController.updateState)
    .delete(statesController.deleteState);

router.route('/:code')
    .get(statesController.getState);

router.route('/:code/funfact')
    .get(statesController.getFunfact)
    .post(statesController.createFunfact)
    .patch(statesController.patchFunfact)
    .delete(statesController.deleteFunfact)

router.route('/:code/nickname')
    .get(statesController.getNickName)

router.route('/:code/capital')
    .get(statesController.getCapital)

router.route('/:code/population')
    .get(statesController.getPopulation)

router.route('/:code/admission')
    .get(statesController.getAdmission)

// Export router module
module.exports = router;