import { formatDistanceToNow } from 'date-fns';

// --- Types ---

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: 'admin' | 'operator';
  office: 'NYC' | 'SF' | 'DC';
  avatar: string;
  initials: string;
  color: string;
  xp: number;
  level: number;
  levelTitle: string;
  nextLevelXp: number;
}

export interface Ticket {
  id: string;
  number: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed' | 'Critical';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignee: string;
  requester: string;
  office: 'NYC' | 'SF' | 'DC';
  category: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  activity: ActivityItem[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'ticket-created' | 'ticket-resolved' | 'kb-created' | 'comment-added' | 'laptop-shipped' | 'ticket-assigned' | 'ticket-closed';
  description: string;
  actor: string;
  targetId?: string;
  targetLabel?: string;
  timestamp: string;
  office: 'NYC' | 'SF' | 'DC';
}

export interface LaptopTask {
  id: string;
  deviceName: string;
  serialNumber: string;
  stage: 'acquire' | 'configure' | 'ship' | 'delivered';
  office: 'NYC' | 'SF' | 'DC';
  assignee: string;
  requestedBy: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
}

export interface Laptop {
  id: number;
  laptop_tag: string;
  assignee_name: string;
  office: 'New York City' | 'San Francisco' | 'Washington DC';
  action_type: 'send' | 'setup';
  due_date: string;
  notes: string;
  status: 'Open' | 'Completed';
  completed_at: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  created_by_name?: string;
  stage?: 'acquire' | 'configure' | 'ship';
}

export interface ChatMessage {
  id: string;
  author: string;
  text: string;
  type: 'text' | 'link' | 'song' | 'meme' | 'system';
  timestamp: string;
  reactions?: Record<string, number[]>;
}

export interface KBArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  linkedTickets: string[];
  version: number;
  updatedAt: string;
  tags: string[];
}

export interface OfficeStatus {
  name: string;
  code: 'NYC' | 'SF' | 'DC';
  label: string;
  color: string;
  activeTickets: number;
  laptopTasks: number;
  status: 'Online' | 'Degraded' | 'Offline';
  loadPercent: number;
}

export interface TicketTrendDay {
  day: string;
  opened: number;
  closed: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
}

// --- Mock Users ---

export const operator1: User = {
  id: 'op1',
  username: 'operator1',
  displayName: 'operator1',
  email: 'op1@primedesk.io',
  role: 'admin',
  office: 'NYC',
  avatar: '/avatar-fallback-o1.svg',
  initials: 'O1',
  color: '#00d9ff',
  xp: 350,
  level: 5,
  levelTitle: 'NETWORK NINJA',
  nextLevelXp: 500,
};

export const operator2: User = {
  id: 'op2',
  username: 'operator2',
  displayName: 'operator2',
  email: 'op2@primedesk.io',
  role: 'operator',
  office: 'SF',
  avatar: '/avatar-fallback-o2.svg',
  initials: 'O2',
  color: '#ff4fd8',
  xp: 210,
  level: 4,
  levelTitle: 'SYSOP SENTINEL',
  nextLevelXp: 400,
};

export const currentUser = operator1;

// --- Mock KPIs ---

export const dashboardKPIs = {
  myOpenTickets: 7,
  myOpenTrend: '+2 today',
  allOpenTickets: 23,
  allOpenTrend: '-5 from yesterday',
  activeLoad: 67,
  openedToday: 12,
  closedToday: 8,
};

// --- Mock Office Status ---

export const officeStatuses: OfficeStatus[] = [
  {
    name: 'NYC Main HQ',
    code: 'NYC',
    label: 'NYC MAIN HQ',
    color: '#00d9ff',
    activeTickets: 8,
    laptopTasks: 3,
    status: 'Online',
    loadPercent: 55,
  },
  {
    name: 'SF Innovation Node',
    code: 'SF',
    label: 'SF INNOVATION NODE',
    color: '#ff4fd8',
    activeTickets: 5,
    laptopTasks: 2,
    status: 'Online',
    loadPercent: 35,
  },
  {
    name: 'DC Policy Node',
    code: 'DC',
    label: 'DC POLICY NODE',
    color: '#7dff9e',
    activeTickets: 3,
    laptopTasks: 1,
    status: 'Online',
    loadPercent: 20,
  },
];

// --- Mock Ticket Trend ---

export const ticketTrend: TicketTrendDay[] = [
  { day: 'Mon', opened: 15, closed: 10 },
  { day: 'Tue', opened: 12, closed: 14 },
  { day: 'Wed', opened: 18, closed: 9 },
  { day: 'Thu', opened: 10, closed: 16 },
  { day: 'Fri', opened: 20, closed: 12 },
  { day: 'Sat', opened: 5, closed: 8 },
  { day: 'Sun', opened: 8, closed: 11 },
];

// --- Mock Tickets ---

export const mockTickets: Ticket[] = [
  {
    id: 't1', number: 'TKT-0042', title: 'VPN access failing for SF office users',
    description: 'Multiple users reporting VPN connection drops since 9 AM.',
    status: 'In Progress', priority: 'High', assignee: 'operator1', requester: 'jane.doe@company.com',
    office: 'SF', category: 'Network', createdAt: '2024-01-15T09:30:00Z', updatedAt: '2024-01-15T14:20:00Z',
    comments: [
      { id: 'c1', author: 'operator1', text: 'Checking firewall logs now.', createdAt: '2024-01-15T10:00:00Z' },
      { id: 'c2', author: 'operator2', text: 'I see the issue - cert expired.', createdAt: '2024-01-15T11:30:00Z' },
    ],
    activity: [],
  },
  {
    id: 't2', number: 'TKT-0041', title: 'Laptop provisioning for new hire - NYC',
    description: 'Need MacBook Pro M3 configured for engineering onboarding.',
    status: 'Open', priority: 'Medium', assignee: 'operator1', requester: 'hr@company.com',
    office: 'NYC', category: 'Hardware', createdAt: '2024-01-15T08:00:00Z', updatedAt: '2024-01-15T08:00:00Z',
    comments: [],
    activity: [],
  },
  {
    id: 't3', number: 'TKT-0040', title: 'DC office printer offline',
    description: 'Policy wing printer not responding, need immediate fix.',
    status: 'Open', priority: 'Medium', assignee: 'operator2', requester: 'dc-admin@company.com',
    office: 'DC', category: 'Hardware', createdAt: '2024-01-14T16:00:00Z', updatedAt: '2024-01-15T09:00:00Z',
    comments: [
      { id: 'c3', author: 'operator2', text: 'Scheduled for hardware swap tomorrow.', createdAt: '2024-01-15T09:00:00Z' },
    ],
    activity: [],
  },
  {
    id: 't4', number: 'TKT-0039', title: 'Database backup verification failed',
    description: 'Nightly backup integrity check failed on primary DB cluster.',
    status: 'Critical', priority: 'Critical', assignee: 'operator1', requester: 'monitoring@company.com',
    office: 'NYC', category: 'Infrastructure', createdAt: '2024-01-14T06:00:00Z', updatedAt: '2024-01-14T07:30:00Z',
    comments: [
      { id: 'c4', author: 'operator1', text: 'Escalated to DB team, investigating.', createdAt: '2024-01-14T07:00:00Z' },
    ],
    activity: [],
  },
  {
    id: 't5', number: 'TKT-0038', title: 'Email sync issues on mobile devices',
    description: 'iOS Mail app not syncing Exchange calendars properly.',
    status: 'Resolved', priority: 'Low', assignee: 'operator2', requester: 'support@company.com',
    office: 'NYC', category: 'Email', createdAt: '2024-01-13T10:00:00Z', updatedAt: '2024-01-14T16:00:00Z',
    comments: [
      { id: 'c5', author: 'operator2', text: 'Fixed with latest Exchange CU update.', createdAt: '2024-01-14T16:00:00Z' },
    ],
    activity: [],
  },
  {
    id: 't6', number: 'TKT-0037', title: 'SF conference room AV setup',
    description: 'Setup video conferencing for quarterly all-hands meeting.',
    status: 'In Progress', priority: 'Medium', assignee: 'operator2', requester: 'events@company.com',
    office: 'SF', category: 'AV', createdAt: '2024-01-13T08:00:00Z', updatedAt: '2024-01-15T11:00:00Z',
    comments: [],
    activity: [],
  },
  {
    id: 't7', number: 'TKT-0036', title: 'Password reset for exec team',
    description: 'Bulk password reset required after security incident.',
    status: 'Closed', priority: 'High', assignee: 'operator1', requester: 'security@company.com',
    office: 'NYC', category: 'Security', createdAt: '2024-01-12T14:00:00Z', updatedAt: '2024-01-13T10:00:00Z',
    comments: [],
    activity: [],
  },
  {
    id: 't8', number: 'TKT-0035', title: 'WiFi coverage gaps in DC east wing',
    description: 'Users reporting weak signal in east corridor offices.',
    status: 'Pending', priority: 'Medium', assignee: 'operator2', requester: 'facilities@company.com',
    office: 'DC', category: 'Network', createdAt: '2024-01-12T09:00:00Z', updatedAt: '2024-01-14T13:00:00Z',
    comments: [
      { id: 'c6', author: 'operator2', text: 'Site survey scheduled for next week.', createdAt: '2024-01-14T13:00:00Z' },
    ],
    activity: [],
  },
  {
    id: 't9', number: 'TKT-0034', title: 'SSL certificate renewal - www',
    description: 'Production SSL cert expiring in 7 days, needs renewal.',
    status: 'In Progress', priority: 'High', assignee: 'operator1', requester: 'webops@company.com',
    office: 'NYC', category: 'Infrastructure', createdAt: '2024-01-11T10:00:00Z', updatedAt: '2024-01-15T08:00:00Z',
    comments: [],
    activity: [],
  },
  {
    id: 't10', number: 'TKT-0033', title: 'New firewall rule request',
    description: 'DevOps team needs port opened for CI/CD pipeline.',
    status: 'Open', priority: 'Low', assignee: 'operator2', requester: 'devops@company.com',
    office: 'SF', category: 'Security', createdAt: '2024-01-10T16:00:00Z', updatedAt: '2024-01-14T09:00:00Z',
    comments: [],
    activity: [],
  },
  {
    id: 't11', number: 'TKT-0032', title: 'UPS battery replacement - NYC server room',
    description: 'UPS showing battery fault, needs immediate replacement.',
    status: 'Open', priority: 'High', assignee: 'operator1', requester: 'facilities@company.com',
    office: 'NYC', category: 'Hardware', createdAt: '2024-01-10T08:00:00Z', updatedAt: '2024-01-14T15:00:00Z',
    comments: [
      { id: 'c7', author: 'operator1', text: 'Vendor scheduled for tomorrow AM.', createdAt: '2024-01-14T15:00:00Z' },
    ],
    activity: [],
  },
  {
    id: 't12', number: 'TKT-0031', title: 'GitLab runner migration to k8s',
    description: 'Migrate legacy GitLab runners to Kubernetes cluster.',
    status: 'Resolved', priority: 'Medium', assignee: 'operator1', requester: 'platform@company.com',
    office: 'SF', category: 'Infrastructure', createdAt: '2024-01-08T10:00:00Z', updatedAt: '2024-01-12T17:00:00Z',
    comments: [],
    activity: [],
  },
];

// --- Mock Laptop Tasks ---

export const mockLaptopTasks: LaptopTask[] = [
  { id: 'l1', deviceName: 'MacBook Pro M3 14"', serialNumber: 'SN78492-MBP', stage: 'configure', office: 'NYC', assignee: 'operator1', requestedBy: 'sarah.chen@company.com', createdAt: '2024-01-14T10:00:00Z', updatedAt: '2024-01-15T09:00:00Z', notes: 'Software installed, needs domain join' },
  { id: 'l2', deviceName: 'Dell XPS 15', serialNumber: 'SN45201-DXP', stage: 'ship', office: 'NYC', assignee: 'operator1', requestedBy: 'mike.ross@company.com', createdAt: '2024-01-13T08:00:00Z', updatedAt: '2024-01-15T14:00:00Z', notes: 'Ready for FedEx pickup' },
  { id: 'l3', deviceName: 'MacBook Air M2', serialNumber: 'SN32904-MBA', stage: 'acquire', office: 'SF', assignee: 'operator2', requestedBy: 'lisa.wong@company.com', createdAt: '2024-01-15T11:00:00Z', updatedAt: '2024-01-15T11:00:00Z', notes: 'Order placed with vendor' },
  { id: 'l4', deviceName: 'ThinkPad X1 Carbon', serialNumber: 'SN77332-TPX', stage: 'configure', office: 'SF', assignee: 'operator2', requestedBy: 'david.kim@company.com', createdAt: '2024-01-14T09:00:00Z', updatedAt: '2024-01-15T10:00:00Z', notes: 'OS installed, waiting on software' },
  { id: 'l5', deviceName: 'MacBook Pro M3 16"', serialNumber: 'SN11223-MBP', stage: 'delivered', office: 'DC', assignee: 'operator2', requestedBy: 'james.lee@company.com', createdAt: '2024-01-10T08:00:00Z', updatedAt: '2024-01-13T16:00:00Z', notes: 'Delivered and signed for' },
  { id: 'l6', deviceName: 'Dell Precision 5570', serialNumber: 'SN99887-DPR', stage: 'ship', office: 'DC', assignee: 'operator2', requestedBy: 'anna.perez@company.com', createdAt: '2024-01-12T10:00:00Z', updatedAt: '2024-01-14T15:00:00Z', notes: 'Shipping label created' },
  { id: 'l7', deviceName: 'MacBook Air M2', serialNumber: 'SN55661-MBA', stage: 'configure', office: 'NYC', assignee: 'operator1', requestedBy: 'tom.brown@company.com', createdAt: '2024-01-13T12:00:00Z', updatedAt: '2024-01-15T08:00:00Z', notes: 'Final security scan running' },
  { id: 'l8', deviceName: 'Surface Laptop 5', serialNumber: 'SN33445-SUR', stage: 'acquire', office: 'SF', assignee: 'operator2', requestedBy: 'rachel.green@company.com', createdAt: '2024-01-15T09:00:00Z', updatedAt: '2024-01-15T09:00:00Z', notes: 'Awaiting stock arrival' },
];

// --- Mock Laptops (new pipeline format) ---

export const mockLaptops: Laptop[] = [
  {
    id: 1, laptop_tag: 'MacBook Pro M3 14"', assignee_name: 'Jane Doe',
    office: 'New York City', action_type: 'setup', due_date: '2026-03-15', notes: 'Install Xcode, Docker, domain join. Priority for dev team.',
    status: 'Open', completed_at: null, created_by: 1, created_by_name: 'operator1',
    created_at: '2026-01-10T08:00:00Z', updated_at: '2026-01-14T10:00:00Z', stage: 'configure',
  },
  {
    id: 2, laptop_tag: 'Dell XPS 15 9530', assignee_name: 'Mike Ross',
    office: 'New York City', action_type: 'send', due_date: '2026-03-18', notes: 'Ship to 350 Fifth Ave. Include docking station.',
    status: 'Open', completed_at: null, created_by: 1, created_by_name: 'operator1',
    created_at: '2026-01-12T09:00:00Z', updated_at: '2026-01-14T15:00:00Z', stage: 'ship',
  },
  {
    id: 3, laptop_tag: 'MacBook Air M2', assignee_name: 'Alex Kim',
    office: 'New York City', action_type: 'setup', due_date: '2026-02-28', notes: 'Standard config. Shipped successfully.',
    status: 'Completed', completed_at: '2026-03-10T16:00:00Z', created_by: 1, created_by_name: 'operator1',
    created_at: '2026-01-05T10:00:00Z', updated_at: '2026-03-10T16:00:00Z', stage: 'ship',
  },
  {
    id: 4, laptop_tag: 'Lenovo ThinkPad X1', assignee_name: 'Sarah Chen',
    office: 'San Francisco', action_type: 'send', due_date: '2026-03-20', notes: 'Order placed. Awaiting vendor delivery confirmation.',
    status: 'Open', completed_at: null, created_by: 2, created_by_name: 'operator2',
    created_at: '2026-01-15T11:00:00Z', updated_at: '2026-01-15T11:00:00Z', stage: 'acquire',
  },
  {
    id: 5, laptop_tag: 'Surface Laptop 5', assignee_name: 'Emily Zhang',
    office: 'San Francisco', action_type: 'setup', due_date: '2026-03-25', notes: 'Install Windows 11 Pro, Office suite, security tools.',
    status: 'Open', completed_at: null, created_by: 2, created_by_name: 'operator2',
    created_at: '2026-01-13T14:00:00Z', updated_at: '2026-01-14T09:00:00Z', stage: 'configure',
  },
  {
    id: 6, laptop_tag: 'MacBook Pro M3 16"', assignee_name: 'David Park',
    office: 'San Francisco', action_type: 'send', due_date: '2026-02-15', notes: 'Finance team priority. Overdue — escalate.',
    status: 'Open', completed_at: null, created_by: 2, created_by_name: 'operator2',
    created_at: '2026-01-08T08:00:00Z', updated_at: '2026-01-14T15:00:00Z', stage: 'acquire',
  },
  {
    id: 7, laptop_tag: 'HP EliteBook 840', assignee_name: 'Laura Martinez',
    office: 'Washington DC', action_type: 'setup', due_date: '2026-03-22', notes: 'Policy team config. Full disk encryption required.',
    status: 'Open', completed_at: null, created_by: 1, created_by_name: 'operator1',
    created_at: '2026-01-11T10:00:00Z', updated_at: '2026-01-14T12:00:00Z', stage: 'configure',
  },
  {
    id: 8, laptop_tag: 'Dell Latitude 7440', assignee_name: 'Robert Wilson',
    office: 'Washington DC', action_type: 'send', due_date: '2026-01-20', notes: 'Ship to Capitol Hill office. Include VPN instructions.',
    status: 'Completed', completed_at: '2026-01-18T14:00:00Z', created_by: 2, created_by_name: 'operator2',
    created_at: '2026-01-05T09:00:00Z', updated_at: '2026-01-18T14:00:00Z', stage: 'ship',
  },
  {
    id: 9, laptop_tag: 'MacBook Air M3', assignee_name: 'Chris Taylor',
    office: 'Washington DC', action_type: 'setup', due_date: '2026-01-25', notes: 'Overdue — waiting on approval from IT director.',
    status: 'Open', completed_at: null, created_by: 1, created_by_name: 'operator1',
    created_at: '2026-01-09T08:00:00Z', updated_at: '2026-01-14T10:00:00Z', stage: 'acquire',
  },
  {
    id: 10, laptop_tag: 'ThinkPad X1 Carbon', assignee_name: 'Nina Patel',
    office: 'New York City', action_type: 'send', due_date: '2026-03-30', notes: 'Executive assistant laptop. Priority shipping.',
    status: 'Open', completed_at: null, created_by: 1, created_by_name: 'operator1',
    created_at: '2026-01-14T13:00:00Z', updated_at: '2026-01-14T13:00:00Z', stage: 'acquire',
  },
];

// --- Mock Chat Messages ---

export const mockChatMessages: ChatMessage[] = [
  { id: 'm1', author: 'system', text: 'War Room session started - Jan 15, 2024', type: 'system', timestamp: '2024-01-15T08:00:00Z' },
  { id: 'm2', author: 'operator1', text: 'Morning! VPN cert issue in SF looks critical. Multiple users reporting drops since 9 AM.', type: 'text', timestamp: '2024-01-15T09:05:00Z' },
  { id: 'm3', author: 'operator2', text: 'On it. The cert expired at midnight. Renewing now.', type: 'text', timestamp: '2024-01-15T09:08:00Z' },
  { id: 'm4', author: 'operator1', text: 'DB backup failed last night too. Escalated to infra team. They\'re investigating the storage array.', type: 'text', timestamp: '2024-01-15T09:15:00Z' },
  { id: 'm5', author: 'operator2', text: 'Good call. I see the backup job stuck in the queue since 2 AM.', type: 'text', timestamp: '2024-01-15T09:18:00Z', reactions: { '👍': [2] } },
  { id: 'm6', author: 'operator1', text: 'Check this out: https://status.cloudflare.com', type: 'link', timestamp: '2024-01-15T10:00:00Z' },
  { id: 'm7', author: 'operator2', text: 'Cloudflare looking green on our end. All systems operational.', type: 'text', timestamp: '2024-01-15T10:05:00Z' },
  { id: 'm8', author: 'operator1', text: 'UPS vendor confirmed for NYC server room — tomorrow 9 AM sharp.', type: 'text', timestamp: '2024-01-15T11:00:00Z' },
  { id: 'm9', author: 'operator2', text: 'Sweet. I\'ll be remote but can guide if needed. Just ping me on Signal.', type: 'text', timestamp: '2024-01-15T11:02:00Z' },
  { id: 'm10', author: 'operator2', text: 'jamendo.com/track/123 — dropping this for the war room vibes 🎵', type: 'song', timestamp: '2024-01-15T12:00:00Z', reactions: { '🎵': [1, 2], '🔥': [1] } },
  { id: 'm11', author: 'operator1', text: 'Classic choice! Adding to the rotation.', type: 'text', timestamp: '2024-01-15T12:05:00Z' },
  { id: 'm12', author: 'operator1', text: 'New hire laptop ready for pickup in NYC. MacBook Pro M3, fully configured.', type: 'text', timestamp: '2024-01-15T13:00:00Z' },
  { id: 'm13', author: 'operator2', text: 'DC printer swap confirmed for Thursday. New unit arrived this morning.', type: 'text', timestamp: '2024-01-15T13:30:00Z' },
  { id: 'm14', author: 'operator1', text: 'SSL renewal in progress for *.primedesk.io. Should be done by EOD.', type: 'text', timestamp: '2024-01-15T14:00:00Z' },
  { id: 'm15', author: 'operator2', text: 'Roger that. Wrapping up the GitLab runner migration to k8s too. Almost done!', type: 'text', timestamp: '2024-01-15T14:30:00Z', reactions: { '🔥': [1] } },
  { id: 'm16', author: 'operator1', text: 'Nice work today! XP gains incoming. 💪', type: 'text', timestamp: '2024-01-15T15:00:00Z' },
  { id: 'm17', author: 'operator2', text: 'https://i.imgflip.com/7bqxtl.jpg lol this is literally our ticket backlog right now', type: 'meme', timestamp: '2024-01-15T15:30:00Z', reactions: { '😂': [1, 2] } },
  { id: 'm18', author: 'operator1', text: 'That\'s us every Monday 😅 The never-ending queue.', type: 'text', timestamp: '2024-01-15T15:32:00Z' },
  { id: 'm19', author: 'operator1', text: 'Hey check out the new monitoring dashboard: https://grafana.primedesk.io/d/ops/overview', type: 'link', timestamp: '2024-01-15T16:00:00Z' },
  { id: 'm20', author: 'operator2', text: 'Oh that looks clean! The new latency heatmap is exactly what we needed.', type: 'text', timestamp: '2024-01-15T16:05:00Z', reactions: { '👍': [1] } },
  { id: 'm21', author: 'operator2', text: 'By the way, the *auto-scaling* policy for the SF node is now live. Tested it this morning with `_simulate_load.sh` and it works great.', type: 'text', timestamp: '2024-01-15T16:30:00Z' },
  { id: 'm22', author: 'operator1', text: 'Awesome! The `kubectl rollout status` output was looking smooth too. Great deploy today.', type: 'text', timestamp: '2024-01-15T16:32:00Z' },
  { id: 'm23', author: 'operator1', text: 'EOD summary: 3 tickets closed, 2 laptops shipped, 1 cert renewed. Solid day! 🚀', type: 'text', timestamp: '2024-01-15T17:00:00Z', reactions: { '🎵': [2], '✅': [1] } },
];

// --- Mock KB Articles ---

export const mockKBArticles: KBArticle[] = [
  {
    id: 'kb1', title: 'VPN Troubleshooting Guide',
    content: 'Step-by-step guide for resolving common VPN connectivity issues across all offices. Includes firewall rule checks, certificate validation, and client configuration.',
    category: 'Network', author: 'operator1', linkedTickets: ['TKT-0042'], version: 3,
    updatedAt: '2024-01-10T10:00:00Z', tags: ['vpn', 'network', 'troubleshooting'],
  },
  {
    id: 'kb2', title: 'Laptop Provisioning Standard',
    content: 'Standard operating procedure for provisioning new laptops: acquire hardware, install base OS, configure domain policies, install required software, perform security scan, ship to user.',
    category: 'Hardware', author: 'operator1', linkedTickets: ['TKT-0041'], version: 2,
    updatedAt: '2024-01-08T14:00:00Z', tags: ['laptop', 'provisioning', 'hardware'],
  },
  {
    id: 'kb3', title: 'Database Backup & Recovery',
    content: 'Procedures for database backup verification, failure response, and recovery. Includes contact information for DB team and escalation paths.',
    category: 'Infrastructure', author: 'operator2', linkedTickets: ['TKT-0039'], version: 4,
    updatedAt: '2024-01-05T09:00:00Z', tags: ['database', 'backup', 'infrastructure'],
  },
  {
    id: 'kb4', title: 'SSL Certificate Management',
    content: 'Guide for managing SSL certificates across all services. Renewal timelines, verification procedures, and deployment steps.',
    category: 'Security', author: 'operator1', linkedTickets: ['TKT-0034'], version: 2,
    updatedAt: '2024-01-12T11:00:00Z', tags: ['ssl', 'security', 'certificates'],
  },
  {
    id: 'kb5', title: 'War Room Communication Protocol',
    content: 'Guidelines for using the War Room chat: priority tagging, escalation procedures, shift handoff notes, and meme policy.',
    category: 'Process', author: 'operator2', linkedTickets: [], version: 1,
    updatedAt: '2024-01-14T16:00:00Z', tags: ['process', 'communication', 'war-room'],
  },
];

// --- Mock Activity Feed ---

const now = new Date();

export const mockActivityFeed: ActivityItem[] = [
  { id: 'a1', type: 'ticket-created', description: 'operator1 created ticket #TKT-0042', actor: 'operator1', targetId: 't1', targetLabel: 'TKT-0042', timestamp: new Date(now.getTime() - 2 * 60000).toISOString(), office: 'SF' },
  { id: 'a2', type: 'ticket-resolved', description: 'operator2 resolved ticket #TKT-0038', actor: 'operator2', targetId: 't5', targetLabel: 'TKT-0038', timestamp: new Date(now.getTime() - 15 * 60000).toISOString(), office: 'NYC' },
  { id: 'a3', type: 'comment-added', description: 'operator2 commented on #TKT-0042', actor: 'operator2', targetId: 't1', targetLabel: 'TKT-0042', timestamp: new Date(now.getTime() - 30 * 60000).toISOString(), office: 'SF' },
  { id: 'a4', type: 'kb-created', description: 'operator2 published KB article "War Room Protocol"', actor: 'operator2', targetId: 'kb5', targetLabel: 'KB-005', timestamp: new Date(now.getTime() - 45 * 60000).toISOString(), office: 'NYC' },
  { id: 'a5', type: 'laptop-shipped', description: 'Laptop #SN45201-DXP shipped to NYC', actor: 'operator1', targetId: 'l2', targetLabel: 'SN45201', timestamp: new Date(now.getTime() - 60 * 60000).toISOString(), office: 'NYC' },
  { id: 'a6', type: 'ticket-assigned', description: 'operator1 assigned #TKT-0041 to themselves', actor: 'operator1', targetId: 't2', targetLabel: 'TKT-0041', timestamp: new Date(now.getTime() - 90 * 60000).toISOString(), office: 'NYC' },
  { id: 'a7', type: 'ticket-closed', description: 'operator1 closed ticket #TKT-0036', actor: 'operator1', targetId: 't7', targetLabel: 'TKT-0036', timestamp: new Date(now.getTime() - 120 * 60000).toISOString(), office: 'NYC' },
  { id: 'a8', type: 'ticket-created', description: 'operator2 created ticket #TKT-0040', actor: 'operator2', targetId: 't3', targetLabel: 'TKT-0040', timestamp: new Date(now.getTime() - 150 * 60000).toISOString(), office: 'DC' },
  { id: 'a9', type: 'laptop-shipped', description: 'Laptop #SN11223-MBP delivered to DC', actor: 'operator2', targetId: 'l5', targetLabel: 'SN11223', timestamp: new Date(now.getTime() - 180 * 60000).toISOString(), office: 'DC' },
  { id: 'a10', type: 'comment-added', description: 'operator1 commented on #TKT-0032', actor: 'operator1', targetId: 't12', targetLabel: 'TKT-0032', timestamp: new Date(now.getTime() - 240 * 60000).toISOString(), office: 'SF' },
];

// --- Mock Notifications ---

export const mockNotifications: Notification[] = [
  { id: 'n1', message: 'VPN certificate expiring in 24h', type: 'warning', read: false, timestamp: new Date(now.getTime() - 10 * 60000).toISOString() },
  { id: 'n2', message: 'Ticket #TKT-0042 marked Critical', type: 'error', read: false, timestamp: new Date(now.getTime() - 30 * 60000).toISOString() },
  { id: 'n3', message: 'New laptop request from HR', type: 'info', read: true, timestamp: new Date(now.getTime() - 60 * 60000).toISOString() },
  { id: 'n4', message: 'Database backup completed', type: 'success', read: true, timestamp: new Date(now.getTime() - 120 * 60000).toISOString() },
  { id: 'n5', message: 'operator2 shipped laptop #SN45201', type: 'info', read: true, timestamp: new Date(now.getTime() - 180 * 60000).toISOString() },
];

// --- MSP Data ---

export const mspData = {
  name: 'TechFlow Solutions',
  email: 'support@techflow.com',
  phone: '+1 (555) 014-2200',
  onDuty: 'Sarah Mitchell',
};

// --- Music Player Mock ---

export const mockPlaylist = [
  { id: 'tr1', title: 'Neon Horizons', artist: 'Synthwave Collective', duration: 234, cover: '/nebula-bg.jpg' },
  { id: 'tr2', title: 'Midnight Grid', artist: 'Cyber Systems', duration: 198, cover: '/nebula-bg.jpg' },
  { id: 'tr3', title: 'Data Stream', artist: 'Neon Protocol', duration: 256, cover: '/nebula-bg.jpg' },
  { id: 'tr4', title: 'Quantum Loop', artist: 'Digital Dreamers', duration: 312, cover: '/nebula-bg.jpg' },
  { id: 'tr5', title: 'Terminal Velocity', artist: 'Binary Beats', duration: 189, cover: '/nebula-bg.jpg' },
];

// --- Helpers ---

export function timeAgo(isoDate: string): string {
  try {
    return formatDistanceToNow(new Date(isoDate), { addSuffix: true });
  } catch {
    return 'just now';
  }
}

export function getOfficeColor(office: 'NYC' | 'SF' | 'DC'): string {
  switch (office) {
    case 'NYC': return '#00d9ff';
    case 'SF': return '#ff4fd8';
    case 'DC': return '#7dff9e';
    default: return '#7a7a94';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Open': return '#00d9ff';
    case 'In Progress': return '#ffb347';
    case 'Pending': return '#ffb347';
    case 'Resolved': return '#7dff9e';
    case 'Closed': return '#7a7a94';
    case 'Critical': return '#ff4d6a';
    default: return '#7a7a94';
  }
}

export function getActivityIcon(type: ActivityItem['type']): { icon: string; color: string } {
  switch (type) {
    case 'ticket-created': return { icon: 'plus', color: '#00d9ff' };
    case 'ticket-resolved': return { icon: 'check-circle', color: '#7dff9e' };
    case 'kb-created': return { icon: 'file-text', color: '#ff4fd8' };
    case 'comment-added': return { icon: 'message-circle', color: '#ffb347' };
    case 'laptop-shipped': return { icon: 'truck', color: '#7dff9e' };
    case 'ticket-assigned': return { icon: 'user-check', color: '#00d9ff' };
    case 'ticket-closed': return { icon: 'check-circle', color: '#7dff9e' };
    default: return { icon: 'activity', color: '#00d9ff' };
  }
}
