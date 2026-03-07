const express = require('express');
const router = express.Router();

const { getAllQuestions, getQuestionById, addQuestion, updateQuestion, deleteQuestion } = require('../controllers/questionController');

router.route('/').get(getAllQuestions)
router.route('/:id').get(getQuestionById)
router.route('/').post(addQuestion)
router.route('/:id').put(updateQuestion)
router.route('/:id').delete(deleteQuestion)

module.exports = router;