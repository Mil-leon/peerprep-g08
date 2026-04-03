import PageLayout from "../../../shared/components/PageLayout";
import {
  Card,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Button,
} from "@heroui/react";

export default function MatchingPage() {
  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl font-bold mb-4">Matching Page</h1>
        <Card className="w-full max-w-md p-6">
          <p className="text-gray-600">
            Choose from the criteria below to find your perfect coding partner!
          </p>
          //Difficulty level selections
          <RadioGroup
            orientation="horizontal"
            label="Difficulty Level"
            defaultValue="easy"
            className="mt-4"
          >
            <Radio value="easy">Easy</Radio>
            <Radio value="medium">Medium</Radio>
            <Radio value="hard">Hard</Radio>
          </RadioGroup>
          //Topic selections
          <CheckboxGroup
            orientation="horizontal"
            label="Topics"
            className="mt-4"
          >
            <Checkbox value="arrays">Arrays</Checkbox>
            <Checkbox value="linked-lists">Linked Lists</Checkbox>
            <Checkbox value="trees">Trees</Checkbox>
          </CheckboxGroup>
          //Language selections
          <CheckboxGroup
            orientation="horizontal"
            label="Languages"
            className="mt-4"
          >
            <Checkbox value="javascript">JavaScript</Checkbox>
            <Checkbox value="python">Python</Checkbox>
            <Checkbox value="java">Java</Checkbox>
          </CheckboxGroup>
          //Submit button
          <Button className="mt-4">Find Matches</Button>
        </Card>
      </div>
    </PageLayout>
  );
}
