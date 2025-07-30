import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function UserLanding() {
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
