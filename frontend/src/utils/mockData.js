// Mock data for development - will be replaced with API calls later

export const mockQuarterlyGoals = [
  {
    id: "1",
    title: "Complete Web Development Course",
    description: "Finish all modules and build 3 projects",
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    progress: 65
  },
  {
    id: "2",
    title: "Get Software Engineering Internship",
    description: "Apply to 20 companies, practice LeetCode",
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    progress: 40
  },
  {
    id: "3",
    title: "Build Portfolio Website",
    description: "Showcase all projects with modern design",
    status: "completed",
    startDate: "2023-12-01",
    endDate: "2024-01-15",
    progress: 100
  }
];

export const mockWeeklyTasks = [
  {
    id: "w1",
    goalId: "1",
    weekStartDate: "2024-02-05",
    tasks: [
      { id: "t1", description: "Complete React Hooks module", completed: true },
      { id: "t2", description: "Build Todo app with Context API", completed: true },
      { id: "t3", description: "Study Redux fundamentals", completed: false }
    ],
    priorities: ["Finish React section", "Start building project 2"]
  },
  {
    id: "w2",
    goalId: "2",
    weekStartDate: "2024-02-05",
    tasks: [
      { id: "t4", description: "Apply to 5 companies", completed: true },
      { id: "t5", description: "Solve 3 LeetCode medium problems", completed: false },
      { id: "t6", description: "Update resume with new projects", completed: true }
    ],
    priorities: ["Focus on top companies", "Practice system design"]
  }
];

export const mockDailyTasks = [
  {
    id: "d1",
    date: "2024-02-05",
    tasks: [
      { description: "Morning standup", timeBlock: "9:00 AM - 9:30 AM", completed: true },
      { description: "Work on React hooks", timeBlock: "10:00 AM - 12:00 PM", completed: true },
      { description: "LeetCode practice", timeBlock: "2:00 PM - 3:00 PM", completed: false },
      { description: "Apply to Wayfair", timeBlock: "4:00 PM - 5:00 PM", completed: false }
    ]
  }
];
