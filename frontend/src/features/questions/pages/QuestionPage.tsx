import React, { useState, useEffect } from 'react';
import { type Question } from '../types/question.types.ts';
import { getAllQuestions, createQuestion, deleteQuestion } from '../services/questionService.ts';
import './QuestionPage.css';

// returns JSX.Element, so we can use it in App.tsx
export default function QuestionPage() {

// State management
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [formData, setFormData] = useState<Question>({
    title: '',
    question: '', 
    answer: '',   
    difficulty: 'easy',
    category: '',
  });

// Functions for API calls
  const fetchQuestions = async () => {
    try {
      const data = await getAllQuestions();
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      alert("Ensure the backend server is running on port 8080 and try again.");
    }
  }

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Create question handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createQuestion(formData);
      console.log("Question created successfully");
      setFormData({} as Question);
      setIsAdding(false);
      fetchQuestions(); // refresh
    } catch (error) {
      console.error("Error creating question:", error);
      alert("Error creating question. Please try again.");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteQuestion(id);
      console.log("Question deleted successfully");
      setQuestions(questions => questions.filter(q => q._id !== id));
      fetchQuestions(); 
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Error deleting question. Please try again.");
    }
  };

  return (

    <div className="dashboard-layout">
      <nav className="sidebar">
        <h2 className="brand">PeerPrep</h2>
        <ul className="nav-links">
          <li>Dashboard</li>
          <li>History</li>
          <li className="active">Questions</li>
          <li>Profile</li>
        </ul>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        {isAdding ? (
          <div className="form-container">
            <h2>Add a new question</h2>
            <form onSubmit={handleSubmit} className="crud-form">

              <div className="form-group">
                <label>Title:</label>
                <input type="text" name="title" placeholder="Input title" value={formData.title} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>Topic:</label>
                <select name="category" value={formData.category} onChange={handleInputChange} required>
                  <option value="" disabled>Select topic</option>
                  <option value="Strings">Strings</option>
                  <option value="Arrays">Arrays</option>
                  <option value="Algorithms">Algorithms</option>
                  <option value="Stacks">Stacks</option>
                  <option value="Queues">Queues</option>
                  <option value="Trees">Trees</option>
                  <option value="Graphs">Graphs</option>
                  <option value="Dynamic Programming">Dynamic Programming</option>
                </select>
              </div>

              <div className="form-group">
                <label>Difficulty:</label>
                <select name="difficulty" value={formData.difficulty} onChange={handleInputChange} required>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-group">
                <label>Question Description:</label>
                <textarea name="question" rows={4} placeholder="Describe the problem..." value={formData.question} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>Solution:</label>
                <textarea name="answer" rows={4} placeholder="Type the solution..." value={formData.answer} onChange={handleInputChange} required />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Submit</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="table-container">
            <header className="table-header">
              <h2>Manage Questions</h2>
              <button className="add-btn" onClick={() => setIsAdding(true)}>+ Add New</button>
            </header>
            
            <table className="question-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Topic</th>
                  <th>Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q._id}>
                    <td>{q.title}</td>
                    <td>{q.category}</td>
                    <td>{q.difficulty}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(q)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(q._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}