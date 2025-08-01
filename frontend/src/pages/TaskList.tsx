// src/pages/TaskList.tsx
import React, { useEffect, useState } from "react";
import {
  fetchVolunteerTasks,
  updateTaskStatus,
  type Task,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* ─────────────────────────────────────────────────────────────── */

export default function TaskList() {
  const { user, token } = useAuth();
  const [tasks,   setTasks]   = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  /* 1️⃣  Load tasks that belong to the logged-in volunteer */
  useEffect(() => {
    if (!user || !token) return;                 // wait until BOTH exist
    setLoading(true);
    fetchVolunteerTasks(token)
      .then(setTasks)
      .catch((err) => console.error("Failed to load tasks:", err))
      .finally(() => setLoading(false));
  }, [user, token]);

  /* 2️⃣  Register / cancel */
  const handleAction = async (task: Task) => {
    const next =
      task.status === "assigned"
        ? "registered"
        : task.status === "registered"
        ? "assigned"
        : undefined;
    if (!next) return;

    try {
      await updateTaskStatus({ taskId: task.id, status: next }, token);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: next } : t))
      );
    } catch (err) {
      console.error("Failed to update task status:", err);
      alert("Unable to update task status");
    }
  };

  /* 3️⃣  UI states */
  if (!user)
    return <p className="text-center mt-10">Please log in to view your tasks.</p>;
  if (loading)
    return <p className="text-center mt-10">Loading tasks…</p>;
  if (tasks.length === 0)
    return <p className="text-center mt-10">No tasks yet.</p>;

  /* 4️⃣  Render task cards  – use same green/white theme the other pages use */
  return (
    <div className="bg-[var(--color-ash_gray-500)] min-h-screen py-10">
      <div className="container max-w-3xl mx-auto bg-[var(--color-ash_gray-900)] p-8 space-y-6 rounded-lg shadow">
        {tasks.map((t) => (
          <Card key={t.id} className="bg-white rounded-lg shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#354f52]">
                {t.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-2 text-sm">
              <p><strong>Description:</strong> {t.description}</p>
              <p><strong>Assignee:</strong> {t.assignee}</p>
              <p><strong>Due:</strong> {new Date(t.date).toLocaleDateString()}</p>

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
                  className="mt-2"
                >
                  {t.status === "assigned" ? "Register" : "Cancel Registration"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
