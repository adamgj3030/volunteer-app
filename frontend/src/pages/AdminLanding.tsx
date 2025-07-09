import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";

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
            Create / Manage Events
          </Button>
          <Button className="rounded-xl shadow-sm py-4 bg-hookers_green-500  hover:bg-hookers_green-600">
            Match Volunteers
          </Button>
          <Button className="rounded-xl shadow-sm py-4 bg-hookers_green-500  hover:bg-hookers_green-600">
            Approve Registrations
          </Button>
          <Button className="rounded-xl shadow-sm py-4 bg-hookers_green-500  hover:bg-hookers_green-600">
            View Notifications
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-none bg-cambridge_blue-800  rounded-2xl shadow-md">
            <CardContent className="pt-4">
              <CardTitle className="text-lg font-semibold ">Total Volunteers</CardTitle>
              <p className="text-4xl font-bold text-center pt-2 ">42</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-cambridge_blue-800  rounded-2xl shadow-md">
            <CardContent className="pt-4 space-y-2">
              <CardTitle className="text-lg font-semibold ">Upcoming Events</CardTitle>
              <ul className="list-disc pl-5 text-sm ">
                <li>Jason's Birthday – 08/17/25</li>
                <li>UH Job Fair – 08/30/26</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
    </div>
  );
}
