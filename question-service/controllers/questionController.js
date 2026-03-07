const Question = require('../models/questionModel');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public  
const getAllQuestions = async (req, res) => {
    const questions = await Question.find({})
    res.status(200).json(questions)
}

// @desc    Get question by ID
// @route   GET /api/questions/:id
// @access  Public
const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)

        if (!question) {
            res.status(404).json({ message: "Question not found" })
            return
        }

        res.status(200).json(question)
    } catch (err) {
        res.status(400).json({ message: "Invalid question ID" })
    }
}

// @desc    Get questions by title. The regex is case-insensitive and matches any question whose title contains the search term.
// @route   GET /api/questions/title/:title
// @access  Public
const getQuestionsByTitle = async (req, res) => {
    try {
        const questions = await Question.find({
            title: { $regex: req.params.title, $options: "i" }
        })

        res.status(200).json(questions)
    } catch (err) {
        res.status(400).json({ message: "No questions found for this title" })
    }
}

// @desc    Get questions by category
// @route   GET /api/questions/category/:category
// @access  Public
const getQuestionsByCategory = async (req, res) => {
    try {
        const questions = await Question.find({ category: req.params.category })

        if (!questions || questions.length === 0) {
            res.status(404).json({ message: "No questions found for this category" })
            return
        }

        res.status(200).json(questions)
    } catch (err) {
        res.status(400).json({ message: "Invalid category" })
    }
}

// @desc    Add a new question
// @route   POST /api/questions
// @access  Public
const addQuestion = async (req, res) => {
    const { title, question, answer, difficulty, category, tags, examples } = req.body

    if (!title || !question || !answer || !difficulty || !category) {
        res.status(400).json({ message: 'Please provide all required fields' })
        return
    }   

    try {
        const newQuestion = await Question.create({
            title,
            question,
            answer,
            difficulty,
            category,
            tags,
            examples,
        })
        res.status(201).json(newQuestion)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }   
}

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Public
const updateQuestion = async (req, res) => {
    const { title, question, answer, difficulty, category, tags, examples } = req.body

    if (!title || !question || !answer || !difficulty || !category) {
        res.status(400).json({ message: 'Please provide all required fields' })
        return
    }   

    try {
        const updatedQuestion = await Question.findById(req.params.id)
        updatedQuestion.title = title
        updatedQuestion.question = question
        updatedQuestion.answer = answer
        updatedQuestion.difficulty = difficulty
        updatedQuestion.category = category
        updatedQuestion.tags = tags
        updatedQuestion.examples = examples

        await updatedQuestion.save()

        res.status(200).json(updatedQuestion)
    } catch (err) {
        res.status(400).json({ message: "Invalid question data" })
    }
}

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Public
deleteQuestion = async (req, res) => {
    try {
        const deletedQuestion = await Question.findById(req.params.id)
        await deletedQuestion.deleteOne()
        res.status(200).json({ message: "Question deleted successfully" })
    } catch (err) {
        res.status(400).json({ message: "Invalid question ID" })
    }
}


module.exports = {
    getAllQuestions,
    getQuestionById,
    getQuestionsByTitle,
    getQuestionsByCategory,
    addQuestion,
    updateQuestion,
    deleteQuestion,
}