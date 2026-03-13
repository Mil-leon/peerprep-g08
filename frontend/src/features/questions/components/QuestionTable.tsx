import React from 'react';
import { type Question } from '../types/question.types';

interface QuestionTableProps {
  questions: Question[];
  onAddNew: () => void;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

export default function QuestionTable({ questions, onAddNew, onEdit, onDelete }: QuestionTableProps) {
  return (
    <div className="table-container">
      <header className="table-header">
        <h2>Manage Questions</h2>
        <button className="add-btn" onClick={onAddNew}>+ Add New</button>
      </header>
      
      <table className="question-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Topic</th>
            <th>Difficulty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q._id}>
              <td>{q.title}</td>
              <td>{q.category}</td>
              <td><span className={`badge ${q.difficulty}`}>{q.difficulty}</span></td>
              <td className="actions-cell">
                <button className="edit-btn" onClick={() => onEdit(q)}>Edit</button>
                <button className="delete-btn" onClick={() => q._id && onDelete(q._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}