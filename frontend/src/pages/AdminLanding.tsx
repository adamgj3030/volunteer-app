import {Card, CardContent, CardTitle} from '@/components/ui/card';
export default function AdminLanding() {
    return (
        <div className="grid gap-4 mt-4">
            <p className="text-black font-bold">Welcome to the Admin Portal!</p>
            <button className="border-3 border-black rounded-xl">Create/Manage Events</button>
            <button className="border-3 border-black rounded-xl">Match Volunteers</button>
            <button className="border-3 border-black rounded-xl ">Approve Registerations</button>
            <button className="border-3 border-black rounded-xl">View Notifications</button>

            <div className="grid grid-cols-2 gap-4">
                <Card className="border-3 border-black">
                    <CardContent>
                        <CardTitle>Total Volunteers</CardTitle>
                        <p className="text-2xl font-bold">42</p>
                    </CardContent>
                </Card>

                <Card className="border-3 border-black">
                    <CardContent>
                        <CardTitle>Upcoming Events</CardTitle>
                        <p>Jason's Birthday - 08/17/25</p>
                        <p>UH Job Fair - 08/30/26</p>
                    </CardContent>
                </Card>

            </div>


        </div>
    )
}
