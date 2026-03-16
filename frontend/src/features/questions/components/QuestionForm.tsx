import React from 'react';
import { type Question } from '../types/question.types.ts';
import { Input, Button, Select, SelectItem, Textarea } from "@heroui/react";

interface QuestionFormProps {
  formData: Question;
  editingId: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const topics = ["Strings", "Arrays", "Algorithms"];
const difficulties = ["easy", "medium", "hard"];

export default function QuestionForm({ formData, editingId, onChange, onSubmit, onCancel }: QuestionFormProps) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {editingId ? "Edit Question" : "Add a new question"}
      </h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Input
          label="Title"
          name="title"
          placeholder="Input title"
          value={formData.title}
          onChange={onChange}
          variant="bordered"
          isRequired
        />

        <Select
          label="Topic"
          name="category"
          selectedKeys={formData.category ? [formData.category] : []}
          onChange={onChange}
          variant="bordered"
          isRequired
        >
          {topics.map((t) => (
            <SelectItem key={t}>{t}</SelectItem>
          ))}
        </Select>

        <Select
          label="Difficulty"
          name="difficulty"
          selectedKeys={[formData.difficulty]}
          onChange={onChange}
          variant="bordered"
          isRequired
        >
          {difficulties.map((d) => (
            <SelectItem key={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>
          ))}
        </Select>

        <Textarea
          label="Question Description"
          name="question"
          placeholder="Describe the problem..."
          value={formData.question}
          onChange={onChange}
          minRows={4}
          variant="bordered"
          isRequired
        />

        <Textarea
          label="Solution"
          name="answer"
          placeholder="Type the solution..."
          value={formData.answer}
          onChange={onChange}
          minRows={4}
          variant="bordered"
          isRequired
        />

        <div className="flex gap-3 mt-2">
          <Button type="button" variant="bordered" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" color="warning" className="text-white">
            {editingId ? "Save Changes" : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}