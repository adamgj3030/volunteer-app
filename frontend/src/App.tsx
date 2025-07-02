import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Toaster />
      <Button
        onClick={() =>
          toast("New Event Assignment", {
            description: "You have been assigned to 'Community Cleanup'.",
            action: {
              label: "Undo",
              onClick: () => console.log("Undo"),
            },
          })
        }
      >
        Show New Event Assignment
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast("Event Update", {
            description: "The 'Community Cleanup' event has been rescheduled.",
          })
        }
      >
        Show Event Update
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          toast("Event Reminder", {
            description: "The 'Community Cleanup' event starts in 1 hour.",
          })
        }
      >
        Show Event Reminder
      </Button>
    </div>
  )
}

export default App
