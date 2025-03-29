// Mock user data
export const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'agent' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'user' },
];

// Status and Priority Enums
export const TICKET_STATUS = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const TICKET_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const FEATURE_REQUEST_STATUS = {
  PROPOSED: 'Proposed',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

// Mock tickets data
export const mockTickets = [
  {
    id: 1,
    title: 'Login Issue',
    description: 'Unable to login to the application',
    status: TICKET_STATUS.NEW,
    priority: TICKET_PRIORITY.HIGH,
    assignedUser: mockUsers[1],
    createdBy: mockUsers[2],
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
    comments: [
      {
        id: 1,
        text: 'Looking into this issue now',
        user: mockUsers[1],
        createdAt: '2024-03-01T10:30:00Z',
      },
      {
        id: 2,
        text: 'Found the cause, working on a fix',
        user: mockUsers[1],
        createdAt: '2024-03-01T11:00:00Z',
      },
    ],
  },
  {
    id: 2,
    title: 'Dashboard not loading',
    description: 'Dashboard shows blank screen',
    status: TICKET_STATUS.IN_PROGRESS,
    priority: TICKET_PRIORITY.MEDIUM,
    assignedUser: mockUsers[0],
    createdBy: mockUsers[2],
    createdAt: '2024-03-02T09:00:00Z',
    updatedAt: '2024-03-02T15:00:00Z',
    comments: [
      {
        id: 3,
        text: 'Can you provide more details about the browser you are using?',
        user: mockUsers[0],
        createdAt: '2024-03-02T10:00:00Z',
      },
    ],
  },
  {
    id: 3,
    title: 'Export not working',
    description: 'Unable to export reports',
    status: TICKET_STATUS.RESOLVED,
    priority: TICKET_PRIORITY.LOW,
    assignedUser: mockUsers[1],
    createdBy: mockUsers[2],
    createdAt: '2024-03-03T11:00:00Z',
    updatedAt: '2024-03-04T09:00:00Z',
    comments: [],
  },
];

// Mock feature requests data
export const mockFeatureRequests = [
  {
    id: 1,
    title: 'Dark Mode Support',
    description: 'Add dark mode theme option',
    status: FEATURE_REQUEST_STATUS.UNDER_REVIEW,
    priority: TICKET_PRIORITY.MEDIUM,
    requester: mockUsers[2],
    upvotes: 15,
    upvotedBy: [mockUsers[0].id, mockUsers[1].id],
    createdAt: '2024-02-28T10:00:00Z',
    comments: [
      {
        id: 1,
        text: 'Great idea! We are considering this for the next release.',
        user: mockUsers[0],
        createdAt: '2024-02-28T11:00:00Z',
      },
    ],
  },
  {
    id: 2,
    title: 'Mobile App',
    description: 'Create mobile application',
    status: FEATURE_REQUEST_STATUS.PROPOSED,
    priority: TICKET_PRIORITY.HIGH,
    requester: mockUsers[1],
    upvotes: 25,
    upvotedBy: [mockUsers[0].id, mockUsers[2].id],
    createdAt: '2024-02-25T14:00:00Z',
    comments: [],
  },
  {
    id: 3,
    title: 'API Integration',
    description: 'Add third-party API support',
    status: FEATURE_REQUEST_STATUS.APPROVED,
    priority: TICKET_PRIORITY.LOW,
    requester: mockUsers[0],
    upvotes: 10,
    upvotedBy: [mockUsers[1].id],
    createdAt: '2024-02-20T09:00:00Z',
    comments: [],
  },
];

// Helper function to get dashboard stats
export const getDashboardStats = () => {
  const openTickets = mockTickets.filter(
    ticket => ticket.status !== TICKET_STATUS.CLOSED
  ).length;

  const ticketsByPriority = {
    [TICKET_PRIORITY.HIGH]: mockTickets.filter(t => t.priority === TICKET_PRIORITY.HIGH).length,
    [TICKET_PRIORITY.MEDIUM]: mockTickets.filter(t => t.priority === TICKET_PRIORITY.MEDIUM).length,
    [TICKET_PRIORITY.LOW]: mockTickets.filter(t => t.priority === TICKET_PRIORITY.LOW).length,
  };

  const topFeatureRequests = [...mockFeatureRequests]
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 5);

  return {
    openTickets,
    ticketsByPriority,
    topFeatureRequests,
  };
}; 