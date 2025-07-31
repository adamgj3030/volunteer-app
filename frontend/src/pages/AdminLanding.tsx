import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function AdminLanding() {
  return (
    <div className="bg-ash_gray-500">
      <div className="min-h-screen bg-cambridge_blue-50 px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-dark_slate_gray-600">
          Welcome to the Admin Portal!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="rounded-xl shadow-sm py-4 bg-hookers_green-500  hover:bg-hookers_green-600">
            <Link to="/admin/approval">Approve Admins</Link>
          </Button>
          <Button className="rounded-xl shadow-sm py-4 bg-hookers_green-500  hover:bg-hookers_green-600">
            <Link to="/admin/history">Volunteer History</Link>
          </Button>
          <Button className="rounded-xl shadow-sm py-4 bg-hookers_green-500  hover:bg-hookers_green-600">
            <Link to="/admin/event/creation">Create Events</Link>
          </Button>
          <Button className="rounded-xl shadow-sm py-4 bg-hookers_green-500  hover:bg-hookers_green-600">
            <Link to="/admin/matching">Match Volunteers</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        </div>
        
      </div>
    </div>
    </div>
  );
}
