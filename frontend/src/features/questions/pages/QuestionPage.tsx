import React, { useState, useEffect } from 'react';
import { type Question } from '../types/question.types';
import { getAllQuestions, createQuestion, deleteQuestion, updateQuestion } from '../services/questionService';
import Dashboard from '../components/Dashboard';
import QuestionTable from '../components/QuestionTable';
import QuestionForm from '../components/QuestionForm';

export default function QuestionPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState: Question = { title: '', question: '', answer: '', difficulty: 'easy', category: '' };
  const [formData, setFormData] = useState<Question>(initialFormState);

  // All the API calls are made here and passed down to components
  const fetchQuestions = async () => {
    try {
      const data = await getAllQuestions();
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }

  useEffect(() => { fetchQuestions(); }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditClick = (question: Question) => {
    if (!question._id) return;
    setFormData({ ...question });
    setEditingId(question._id);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await updateQuestion(editingId, formData);
      else await createQuestion(formData);
      
      setFormData(initialFormState);
      setEditingId(null);
      setIsAdding(false);
      fetchQuestions(); 
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteQuestion(id);
      setQuestions(questions => questions.filter(q => q._id !== id));
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsAdding(false);
  };

// Seperate into components : Question Form and Question Table
  return (
    <Dashboard>
      {isAdding ? (
        <QuestionForm 
          formData={formData} 
          editingId={editingId} 
          onChange={handleInputChange} 
          onSubmit={handleSubmit} 
          onCancel={handleCancel} 
        />
      ) : (
        <QuestionTable 
          questions={questions} 
          onAddNew={() => setIsAdding(true)} 
          onEdit={handleEditClick} 
          onDelete={handleDelete} 
        />
      )}
    </Dashboard>
  );
}