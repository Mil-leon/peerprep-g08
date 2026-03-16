import { type Question } from '../types/question.types';
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Chip
} from "@heroui/react";

interface QuestionTableProps {
  questions: Question[];
  onAddNew: () => void;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

const difficultyColor: Record<string, "success" | "warning" | "danger"> = {
  easy: "success",
  medium: "warning",
  hard: "danger",
};

export default function QuestionTable({ questions, onAddNew, onEdit, onDelete }: QuestionTableProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Manage Questions</h2>
        <Button color="warning" className="text-white" onPress={onAddNew}>
          + Add New
        </Button>
      </div>

      <Table aria-label="Questions table" className="mt-2">
        <TableHeader>
          <TableColumn>TITLE</TableColumn>
          <TableColumn>TOPIC</TableColumn>
          <TableColumn>DIFFICULTY</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No questions found.">
          {questions.map((q) => (
            <TableRow key={q._id}>
              <TableCell>{q.title}</TableCell>
              <TableCell>{q.category}</TableCell>
              <TableCell>
                <Chip color={difficultyColor[q.difficulty] ?? "default"} variant="flat" size="sm" className="capitalize">
                  {q.difficulty}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="flat" color="primary" onPress={() => onEdit(q)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="flat" color="danger" onPress={() => q._id && onDelete(q._id)}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}