import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";

export default function UserLanding() {
  return (
    <div className="min-h-screen bg-cambridge_blue-50 px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-dark_slate_gray-600">
          Welcome to the Volunteer Portal
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="rounded-xl shadow-sm py-6 text-base bg-hookers_green-500 text-white hover:bg-hookers_green-600">
            View / Update Profile
          </Button>
          <Button className="rounded-xl shadow-sm py-6 text-base bg-hookers_green-500 text-white hover:bg-hookers_green-600">
            Manage Events
          </Button>
          <Button className="rounded-xl shadow-sm py-6 text-base bg-hookers_green-500 text-white hover:bg-hookers_green-600">
            Volunteer History
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-none bg-cambridge_blue-800 text-white rounded-2xl shadow-md">
            <CardContent className="py-4 space-y-2">
              <CardTitle className="text-lg font-semibold text-white">Upcoming Events</CardTitle>
              <ul className="list-disc pl-5 text-sm text-white">
                <li>Food Bank Drive – 07/12/25</li>
                <li>Cleanup Day – 08/03/25</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none bg-cambridge_blue-800 text-white rounded-2xl shadow-md">
            <CardContent className="py-4 space-y-2">
              <CardTitle className="text-lg font-semibold text-white">Recent Participation</CardTitle>
              <ul className="list-disc pl-5 text-sm text-white">
                <li>Voted: Community Cleanup</li>
                <li>Attended: Park Beautification</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
