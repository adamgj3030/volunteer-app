import type {
  Volunteer,
} from "@/types/type";

export const volunteers: Volunteer[] = [
  {
    email: "volunteer1@example.com",
    name: "John Doe",
    events: [
      {
        eventName: "Community Cleanup",
        description: "Cleaning up the local park.",
        location: "Central Park",
        requiredSkills: ["Gardening"],
        urgency: "Medium",
        eventDate: "2024-08-15",
        status: "Confirmed",
      },
      {
        eventName: "Food Drive",
        description: "Sorting and distributing food donations.",
        location: "Community Center",
        requiredSkills: ["Organization"],
        urgency: "High",
        eventDate: "2024-07-20",
        status: "Attended",
      },
    ],
  },
  {
    email: "volunteer2@example.com",
    name: "Jane Smith",
    events: [
      {
        eventName: "Animal Shelter Assistance",
        description: "Walking dogs and cleaning cages.",
        location: "City Animal Shelter",
        requiredSkills: ["Animal Care"],
        urgency: "High",
        eventDate: "2024-09-01",
        status: "Confirmed",
      },
    ],
  },
];