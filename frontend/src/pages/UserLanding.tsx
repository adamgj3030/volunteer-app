import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Notify } from "@/components/Notifications";
import axios from "axios";
const db_url = import.meta.env.VITE_DEVELOPMENT_DB_URL;

export const listUpcomingAssigned = async () => {
  
  const raw = localStorage.getItem("volunteerapp.auth");

  if (!raw) {
    throw new Error("User not authenticated — no token found.");
  }

  const parsed = JSON.parse(raw);
  const token = parsed.token;

  if (!token) {
    throw new Error("Malformed auth data — token missing.");
  }

  try {
    const res = await axios.get(`${db_url}/events/upcoming/assigned`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (err: any) {
    console.error("Axios error fetching assigned events:", err);
    throw new Error(err.response?.data?.message || "Failed to fetch assigned events");
  }
};

function isToday(isoDate: string): boolean {
  const eventDate = new Date(isoDate);
  const today = new Date();

  return (
    eventDate.getFullYear() === today.getFullYear() &&
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getDate() === today.getDate()
  );
}


export default function UserLanding() {

    useEffect(() => {
  async function checkTodayEvents() {
    try {
      const events = await listUpcomingAssigned();
      let found = false;

      for (const event of events) {
        if (isToday(event.date)) {
          found = true;
          Notify({
            title: "🎯 You have an event today!",
            description: `Event: ${event.name}`,
            variant: "success",
          });
        }
      }

      if (!found) {
        console.log("✅ No events today");
      }
    } catch (err) {
      console.error("Error fetching assigned events:", err);
      Notify({
        title: "Error",
        description: "Could not fetch today's events.",
        variant: "error",
      });
    }
  }

  checkTodayEvents();
}, []);




  return (
    <div className="bg-ash_gray-500">
      <div className="min-h-screen bg-cambridge_blue-50 px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold text-center text-dark_slate_gray-600">
            Welcome to the Volunteer Portal
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="rounded-xl shadow-sm py-6 text-base bg-hookers_green-500 hover:bg-hookers_green-600">
              <Link to="/volunteer/task">Tasks</Link>
            </Button>
            <Button className="rounded-xl shadow-sm py-6 text-base bg-hookers_green-500 hover:bg-hookers_green-600">
              <Link to="/volunteer/manage">Profile</Link>
            </Button>
            <Button className="rounded-xl shadow-sm py-6 text-base bg-hookers_green-500  hover:bg-hookers_green-600">
              <Link to="/volunteer/matching">Matching</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          </div>
        </div>
      </div>
    </div>
  );
}
