// frontend/src/App.tsx
import React from "react";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { EventForm }   from "@/components/forms/EventForm";
import { TaskList }    from "@/components/task-view/TaskList";

export default function App() {
  console.log("🔥 App rendered");      // ← add this
  return (
    <div className="p-8 max-w-2xl mx-auto space-y-12">
      <section>
        <h2 className="text-2xl font-bold mb-4">User Profile</h2>
        <ProfileForm />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Event Management</h2>
        <EventForm />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">My Tasks</h2>
        <TaskList />
      </section>
    </div>
  );
}
