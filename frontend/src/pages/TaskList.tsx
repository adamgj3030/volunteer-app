import React, { useState, useEffect } from "react";
import {
  fetchVolunteerTasks,
  updateTaskStatus,
  type Task,
} from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // 1️⃣ Load tasks on mount
  useEffect(() => {
    fetchVolunteerTasks()
      .then(setTasks)
      .catch((err) => console.error("Failed to load tasks:", err));
  }, []);

  // 2️⃣ Handle register/cancel actions
  const handleAction = async (task: Task) => {
    let newStatus: Task["status"];
    if (task.status === "assigned") {
      newStatus = "registered";
    } else if (task.status === "registered") {
      newStatus = "assigned";
    } else {
      return; // no action for completed
    }

    try {
      await updateTaskStatus(task.id, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error("Failed to update task status:", err);
      alert("Unable to update task status");
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((t) => (
        <Card key={t.id} className="bg-white shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p>
              <strong>Description:</strong> {t.description}
            </p>
            <p>
              <strong>Assignee:</strong> {t.assignee}
            </p>
            <p>
              <strong>Due:</strong> {new Date(t.date).toLocaleDateString()}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={
                  t.status === "assigned"
                    ? "text-orange-600"
                    : t.status === "registered"
                    ? "text-green-600"
                    : "text-gray-500"
                }
              >
                {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
              </span>
            </p>
            {t.status !== "completed" && (
              <Button
                variant={t.status === "assigned" ? "default" : "destructive"}
                onClick={() => handleAction(t)}
              >
                {t.status === "assigned" ? "Register" : "Cancel Registration"}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
