// frontend/src/components/task-view/TaskList.tsx

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function TaskList() {
  // TODO: fetch tasks with SWR or React Query
  const tasks = [
    { id: 1, title: "Set up DB", due: "2025-07-10" },
    // …
  ];

  return (
    <div className="space-y-4">
      {tasks.map((t) => (
        <Card key={t.id}>
          <CardHeader>
            <CardTitle>{t.title}</CardTitle>
          </CardHeader>
          <CardContent>
            Due: {new Date(t.due).toLocaleDateString()}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
