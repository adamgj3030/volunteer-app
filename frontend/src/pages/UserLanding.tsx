import { Card, CardContent, CardTitle } from '@/components/ui/card';

export default function UserLanding() {
  return (
    <div className="grid gap-4 mt-4">
      <p className="text-black font-bold">Welcome to the Volunteer Portal!</p>

      <button className="border-3 border-black rounded-xl">View/Update Profile</button>
      <button className="border-3 border-black rounded-xl">Manage Upcoming Events</button>
      <button className="border-3 border-black rounded-xl">Volunteer History</button>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-3 border-black">
          <CardContent>
            <CardTitle>Upcoming Events</CardTitle>
            <p>Food Bank Drive - 07/12/25</p>
            <p>Cleanup Day - 08/03/25</p>
          </CardContent>
        </Card>

        <Card className="border-3 border-black">
          <CardContent>
            <CardTitle>Recent Participation</CardTitle>
            <p>Voted: Community Cleanup</p>
            <p>Attended: Park Beautification</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}