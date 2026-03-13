import React from 'react';
import { type Question } from '../types/question.types.ts';

interface QuestionFormProps {
  formData: Question;
  editingId: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function QuestionForm({ formData, editingId, onChange, onSubmit, onCancel }: QuestionFormProps) {
  return (
    <div className="form-container">
      <h2>{editingId ? "Edit Question" : "Add a new question"}</h2>
      <form onSubmit={onSubmit} className="crud-form">
        <div className="form-group">
          <label>Title:</label>
          <input type="text" name="title" placeholder="Input title" value={formData.title} onChange={onChange} required />
        </div>

        <div className="form-group">
          <label>Topic:</label>
          <select name="category" value={formData.category} onChange={onChange} required>
            <option value="" disabled>Select topic</option>
            <option value="Strings">Strings</option>
            <option value="Arrays">Arrays</option>
            <option value="Algorithms">Algorithms</option>
          </select>
        </div>

        <div className="form-group">
          <label>Difficulty:</label>
          <select name="difficulty" value={formData.difficulty} onChange={onChange} required>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="form-group">
          <label>Question Description:</label>
          <textarea name="question" rows={4} placeholder="Describe the problem..." value={formData.question} onChange={onChange} required />
        </div>

        <div className="form-group">
          <label>Solution:</label>
          <textarea name="answer" rows={4} placeholder="Type the solution..." value={formData.answer} onChange={onChange} required />
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button type="submit" className="submit-btn">{editingId ? "Save Changes" : "Submit"}</button>
        </div>
      </form>
    </div>
  );
}