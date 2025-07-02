// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { EventForm }   from "@/components/forms/EventForm";
import { TaskList }    from "@/components/task-view/TaskList";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 bg-gray-100 space-x-4">
        <NavLink to="/profile" className={({isActive})=> isActive ? "font-bold" : ""}>
          Profile
        </NavLink>
        <NavLink to="/event" className={({isActive})=> isActive ? "font-bold" : ""}>
          Event
        </NavLink>
        <NavLink to="/tasks" className={({isActive})=> isActive ? "font-bold" : ""}>
          Tasks
        </NavLink>
      </nav>

      <div className="p-8 max-w-2xl mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/profile" element={<ProfileForm />} />
          <Route path="/event"   element={<EventForm />} />
          <Route path="/tasks"   element={<TaskList />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
