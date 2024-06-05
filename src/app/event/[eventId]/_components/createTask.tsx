"use client";
import { SquarePlus } from "lucide-react";
import { type ChangeEvent } from "react";
import { useFormState } from "react-dom";
import { SubmitButton } from "~/app/_components/submitButton";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectGroup,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { createCategory, createTask, getCategory } from "~/server/queries";
import Papa, { ParseResult } from "papaparse";

type createTaskParams = {
  eventId: number;
  categories: Awaited<ReturnType<typeof getCategory>>;
};

export function CreateTask({ eventId, categories }: createTaskParams) {
  const [formState, formAction] = useFormState(createTask, { error: "" });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="px-2">
          <SquarePlus className="mr-2 h-4 w-4" /> Add Dare
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new task</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-md pl-1">
              Task name:
            </Label>
            <Input id="name" name="name" autoFocus placeholder="Task name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="text-md pl-1">
              Description (optional):
            </Label>
            <Textarea
              name="description"
              id="description"
              placeholder="Description"
              maxLength={255}
            />
          </div>
          <Input
            name="eventId"
            aria-hidden
            type="number"
            className="hidden"
            id="eventId"
            value={eventId}
          />
          <Label htmlFor="points" className="text-md pl-1">
            Points:
          </Label>
          <Input name="points" type="number" id="points" />
          <Label htmlFor="category" className="text-md pl-1">
            Category:
          </Label>
          {categories.length === 0 && (
            <p className="text-sm text-gray-500">
              No categories available. Please create a category first.
            </p>
          )}
          {categories.length > 0 && (
            <Select name="category">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.map((category) => (
                    <SelectItem
                      key={`${category.id}-${category.name}`}
                      value={category.name}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          <DialogFooter>
            <DialogClose>Cancle</DialogClose>
            <SubmitButton>Create</SubmitButton>
          </DialogFooter>
          {formState?.error && (
            <p className="pt-4 text-sm text-red-500">{formState.error}</p>
          )}
        </form>
        <h2>Batch create via csv</h2>
        <input
          type="file"
          accept=".csv"
          name="file"
          onChange={(e) => createTaskViaCsv(e, eventId)}
        />
      </DialogContent>
    </Dialog>
  );
}

interface TaskCsv {
  title: string;
  description: string;
  points: number;
  category: string;
}

const createTaskViaCsv = async (
  e: ChangeEvent<HTMLInputElement>,
  eventId: number,
) => {
  const fileList = e.target.files;
  if (!fileList) return;
  const file = fileList[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result?.toString();
    if (!text) return;
    console.log(text);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    Papa.parse<TaskCsv>(text, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const rows = result.data as unknown as Array<TaskCsv>;
        const categories = getUniqueCategories(rows);
        void createCategories(categories, eventId).then(() => {
          void insertTasks(rows, eventId);
        });
      },
    });
  };
  console.log(file);
  reader.readAsText(file);
};

const getUniqueCategories = (rows: Array<TaskCsv>) => {
  const categories = new Set<string>();
  rows.forEach((row) => {
    categories.add(row.category);
  });
  return Array.from(categories);
};

const createCategories = async (categories: Array<string>, eventId: number) => {
  for (const category of categories) {
    const data: FormData = new FormData();
    data.append("name", category);
    data.append("eventId", eventId.toString());
    await createCategory({ error: "" }, data);
    console.log(`Created category: ${category}`);
  }
};

const insertTasks = async (rows: Array<TaskCsv>, eventId: number) => {
  for (const row of rows) {
    const data: FormData = new FormData();
    data.append("name", row.title);
    data.append("description", row.description);
    data.append("points", row.points.toString());
    data.append("eventId", eventId.toString());
    data.append("category", row.category);
    await createTask({ error: "" }, data);
    console.log(`Created task: ${row.title}`);
  }
};
