import type {
  ActivityItem,
  AppNotification,
  CalendarEvent,
  Conversation,
  Decision,
  FileDoc,
  InboxItem,
  Message,
  Mission,
  Squad,
} from '@/types/domain';
import { ago, at, inDays } from './time';

type M = Omit<Mission, 'progress' | 'outputs' | 'dependsOn' | 'level'> &
  Partial<Pick<Mission, 'progress' | 'outputs' | 'dependsOn' | 'level'>>;

const missionSeeds: M[] = [
  // 3D platform
  { id: 'm-3d-1', projectId: 'p-3d', code: 'MISSION 01', title: 'Define learning architecture', status: 'review', agentIds: ['atlas', 'scout', 'forge'], deadline: inDays(2), progress: 90, level: 'critical', outputs: ['Architecture options v2', 'Canadian OJT benchmark'] },
  { id: 'm-3d-2', projectId: 'p-3d', code: 'MISSION 02', title: 'Create first 3D process (Electric Arc Furnace)', status: 'active', agentIds: ['forge'], deadline: inDays(14), progress: 35, dependsOn: ['m-3d-1'], outputs: ['Furnace environment v0.3'] },
  { id: 'm-3d-3', projectId: 'p-3d', code: 'MISSION 03', title: 'Develop work instructions', status: 'pending', agentIds: ['forge'], deadline: inDays(28), progress: 0, dependsOn: ['m-3d-2'] },
  { id: 'm-3d-4', projectId: 'p-3d', code: 'MISSION 04', title: 'Build interactive prototype', status: 'pending', agentIds: ['forge', 'nexus'], deadline: inDays(45), progress: 0, dependsOn: ['m-3d-3'] },
  { id: 'm-3d-5', projectId: 'p-3d', code: 'MISSION 05', title: 'Pilot with operators', status: 'pending', agentIds: ['forge', 'aria'], deadline: inDays(70), progress: 0, dependsOn: ['m-3d-4'], level: 'milestone' },
  // OJT
  { id: 'm-ojt-1', projectId: 'p-ojt', code: 'MISSION 01', title: 'Define OJT methodology', status: 'active', agentIds: ['forge', 'scout'], deadline: inDays(5), progress: 40, outputs: ['OJT method draft'] },
  { id: 'm-ojt-2', projectId: 'p-ojt', code: 'MISSION 02', title: 'Digitise top-40 work instructions', status: 'active', agentIds: ['forge'], deadline: inDays(30), progress: 25, dependsOn: ['m-ojt-1'] },
  { id: 'm-ojt-3', projectId: 'p-ojt', code: 'MISSION 03', title: 'Certify OJT trainers', status: 'pending', agentIds: ['forge'], deadline: inDays(60), progress: 0, dependsOn: ['m-ojt-1'], level: 'milestone' },
  // WAH
  { id: 'm-wah-1', projectId: 'p-wah', code: 'MISSION 01', title: 'Scenario library: 6 fall-risk scenarios', status: 'done', agentIds: ['forge'], deadline: inDays(-6), progress: 100, outputs: ['Scenario storyboard'] },
  { id: 'm-wah-2', projectId: 'p-wah', code: 'MISSION 02', title: 'Interactive harness inspection module', status: 'active', agentIds: ['forge'], deadline: inDays(9), progress: 55, level: 'critical' },
  // Talent
  { id: 'm-ta-1', projectId: 'p-ta', code: 'MISSION 01', title: 'Close 5 critical vacancies', status: 'active', agentIds: ['talent'], deadline: inDays(21), progress: 40, level: 'critical' },
  { id: 'm-ta-2', projectId: 'p-ta', code: 'MISSION 02', title: 'Recruitment analytics dashboard', status: 'pending', agentIds: ['nexus', 'talent'], deadline: inDays(18), progress: 0 },
  // Succession
  { id: 'm-su-1', projectId: 'p-succ', code: 'MISSION 01', title: 'Readiness review of 64 critical positions', status: 'active', agentIds: ['talent', 'atlas'], deadline: inDays(12), progress: 60 },
  // Onboarding
  { id: 'm-on-1', projectId: 'p-onb', code: 'MISSION 01', title: 'Digital preboarding journey', status: 'done', agentIds: ['forge'], deadline: inDays(-3), progress: 100 },
  { id: 'm-on-2', projectId: 'p-onb', code: 'MISSION 02', title: 'Buddy programme v2', status: 'active', agentIds: ['aria'], deadline: inDays(15), progress: 30 },
  // Maintenance
  { id: 'm-mr-1', projectId: 'p-mra', code: 'MISSION 01', title: 'Planner certification path', status: 'active', agentIds: ['forge'], deadline: inDays(25), progress: 35 },
  // AI for HR
  { id: 'm-ai-1', projectId: 'p-aihr', code: 'MISSION 01', title: 'Prioritise 11 HR AI use cases', status: 'active', agentIds: ['nexus', 'atlas'], deadline: inDays(10), progress: 45 },
  // Praxia
  { id: 'm-px-1', projectId: 'p-praxia', code: 'MISSION 01', title: 'Offer architecture (3 tiers)', status: 'active', agentIds: ['praxis', 'atlas'], deadline: inDays(8), progress: 60 },
  { id: 'm-ct-1', projectId: 'p-content', code: 'MISSION 01', title: 'Q4 LinkedIn strategy', status: 'active', agentIds: ['praxis'], deadline: inDays(4), progress: 35 },
  { id: 'm-ct-2', projectId: 'p-content', code: 'MISSION 02', title: 'Review 3 draft posts', status: 'review', agentIds: ['praxis'], deadline: inDays(1), progress: 90 },
  { id: 'm-gr-1', projectId: 'p-growth', code: 'MISSION 01', title: 'Audience & engagement baseline', status: 'active', agentIds: ['nexus'], deadline: inDays(6), progress: 82 },
  { id: 'm-pl-1', projectId: 'p-product', code: 'MISSION 01', title: 'OJT toolkit as a digital product', status: 'pending', agentIds: ['praxis'], deadline: inDays(40), progress: 0 },
  // Personal
  { id: 'm-fi-1', projectId: 'p-fin', code: 'MISSION 01', title: 'Q4 budget & savings simulation', status: 'pending', agentIds: ['ledger'], deadline: inDays(20), progress: 0 },
  { id: 'm-tr-1', projectId: 'p-train', code: 'MISSION 01', title: 'Gran Fondo build plan (12 weeks)', status: 'active', agentIds: [], deadline: inDays(35), progress: 50 },
  { id: 'm-fr-1', projectId: 'p-frontier', code: 'MISSION 01', title: 'Explore: AI coach for shift supervisors', status: 'pending', agentIds: [], deadline: inDays(60), progress: 0 },
];

export function seedMissions(): Mission[] {
  return missionSeeds.map((m) => ({ progress: 0, outputs: [], dependsOn: [], level: 'mission', ...m }));
}

export function seedFiles(): FileDoc[] {
  return [
    { id: 'f-1', name: 'Canadian OJT Benchmark.pdf', kind: 'pdf', projectId: 'p-3d', agentId: 'scout', size: '2.4 MB', updatedAt: ago(35), summary: '4 reference models from Canadian steel operations; strengths, costs, adoption evidence.' },
    { id: 'f-2', name: '3D Training Architecture — Options v2.deck', kind: 'deck', projectId: 'p-3d', agentId: 'atlas', size: '5.1 MB', updatedAt: ago(20), summary: 'Option A web-first 2.5D + targeted 3D; Option B full 3D engine; Option C vendor platform.' },
    { id: 'f-3', name: 'Furnace environment v0.3.glb', kind: 'model', projectId: 'p-3d', agentId: 'forge', size: '18 MB', updatedAt: ago(70), summary: 'EAF scene blockout with hotspots for tapping and electrode handling.' },
    { id: 'f-4', name: 'OJT Methodology — draft.doc', kind: 'doc', projectId: 'p-ojt', agentId: 'forge', size: '640 KB', updatedAt: ago(90), summary: '5-step OJT: explain, demonstrate, practise, verify, certify.' },
    { id: 'f-5', name: 'Work Instruction #042 — Ladle change.doc', kind: 'doc', projectId: 'p-ojt', agentId: 'forge', size: '1.2 MB', updatedAt: ago(110), summary: 'Reviewed visual work instruction.' },
    { id: 'f-6', name: 'Vacancy aging — week 40.sheet', kind: 'sheet', projectId: 'p-ta', agentId: 'talent', size: '220 KB', updatedAt: ago(45), summary: '37 open vacancies; 5 critical; 2 without finalists.' },
    { id: 'f-7', name: 'Succession readiness heatmap.sheet', kind: 'sheet', projectId: 'p-succ', agentId: 'talent', size: '310 KB', updatedAt: ago(300), summary: 'Ready-now coverage by plant and level.' },
    { id: 'f-8', name: 'LinkedIn drafts (3).doc', kind: 'doc', projectId: 'p-content', agentId: 'praxis', size: '96 KB', updatedAt: ago(25), summary: '3 posts: OJT myths, digital twins for operators, safety leadership.' },
    { id: 'f-9', name: 'Praxia offer architecture.deck', kind: 'deck', projectId: 'p-praxia', agentId: 'praxis', size: '3.3 MB', updatedAt: ago(600), summary: 'Diagnose / Design / Deploy tiers.' },
    { id: 'f-10', name: 'September budget review.sheet', kind: 'sheet', projectId: 'p-fin', agentId: 'ledger', size: '80 KB', updatedAt: ago(2000), summary: 'Closed month: savings 22%.' },
    { id: 'f-11', name: 'Gran Fondo plan.note', kind: 'note', projectId: 'p-train', agentId: null, size: '12 KB', updatedAt: ago(4000), summary: '12-week build: 3 rides + 2 gym sessions per week.' },
    { id: 'f-12', name: 'HR AI use-case portfolio.sheet', kind: 'sheet', projectId: 'p-aihr', agentId: 'nexus', size: '150 KB', updatedAt: ago(800), summary: '11 use cases scored by value and feasibility.' },
  ];
}

export function seedDecisions(): Decision[] {
  return [
    {
      id: 'd-3d-arch',
      title: 'Approve the 3D training architecture',
      context: 'ATLAS prepared three architecture options for the Industrial 3D Learning Platform. Mission 02 (first 3D process) is blocked until one is approved.',
      projectId: 'p-3d',
      agentId: 'atlas',
      options: ['A · Web-first 2.5D + targeted 3D scenes', 'B · Full 3D game engine', 'C · Vendor platform licence'],
      recommendation: 'A — fastest to pilot, runs on plant laptops, lowest maintenance.',
      status: 'pending',
      requestedAt: ago(12),
      dueBy: inDays(2),
    },
    {
      id: 'd-posts',
      title: 'Review 3 Praxia LinkedIn drafts',
      context: 'PRAXIS has three posts ready for this week’s calendar.',
      projectId: 'p-content',
      agentId: 'praxis',
      options: ['Publish all 3', 'Publish 2, revise 1', 'Request revision'],
      recommendation: 'Publish 2, revise the safety-leadership post for tone.',
      status: 'pending',
      requestedAt: ago(30),
      dueBy: inDays(1),
    },
    {
      id: 'd-poka',
      title: 'Select Poka architecture for work instructions',
      context: 'Digital work-instruction tool choice for OJT.',
      projectId: 'p-ojt',
      agentId: 'forge',
      options: ['Poka', 'In-house LMS module', 'SharePoint + PDF'],
      recommendation: 'Poka for the pilot plant.',
      status: 'approved',
      requestedAt: ago(4000),
      decidedAt: ago(3000),
    },
  ];
}

const conv = (id: string, agentId: string, projectId: string | null, title: string, msgs: [Message['role'], string, number][]): { c: Conversation; m: Message[] } => {
  const m = msgs.map(([role, text, minAgo], i) => ({
    id: `${id}-m${i}`,
    conversationId: id,
    role,
    agentId: role === 'agent' ? agentId : undefined,
    text,
    ts: ago(minAgo),
    source: role === 'agent' ? ('simulated' as const) : undefined,
  }));
  return { c: { id, title, agentId, projectId, messageIds: m.map((x) => x.id), updatedAt: m[m.length - 1]?.ts ?? ago(60) }, m };
};

export function seedConversations(): { conversations: Conversation[]; messages: Message[] } {
  const all = [
    conv('c-atlas-3d', 'atlas', 'p-3d', '3D training architecture', [
      ['user', 'Give me three viable architectures for the 3D training platform, with cost and risk.', 120],
      ['agent', 'On it. I will coordinate with SCOUT for benchmarks and LEDGER for cost ranges.', 119],
      ['agent', 'Options are ready: A) web-first 2.5D with targeted 3D scenes, B) full 3D engine, C) vendor licence. I recommend A. I need your approval to unblock Mission 02.', 12],
    ]),
    conv('c-scout-ojt', 'scout', 'p-3d', 'OJT benchmark — Canadian steel', [
      ['user', 'Benchmark the best digital OJT systems in steel companies, start with Canada.', 40],
      ['agent', 'Started. I am reviewing published case studies and vendor references. First pass in ~20 minutes.', 39],
      ['agent', 'Interim: 4 reference models identified. Two combine digital work instructions with supervisor sign-off on a tablet.', 8],
    ]),
    conv('c-forge-ojt', 'forge', 'p-ojt', 'OJT methodology', [
      ['user', 'Draft the OJT methodology for critical roles.', 200],
      ['agent', 'Working from the 5-step model: explain, demonstrate, practise, verify, certify. 12 critical roles mapped so far.', 30],
    ]),
    conv('c-praxis-li', 'praxis', 'p-content', 'LinkedIn strategy Q4', [
      ['user', 'Plan the Q4 LinkedIn strategy for Praxia.', 60],
      ['agent', 'Three pillars: industrial learning, AI for operations, leadership in heavy industry. Three drafts are ready for your review.', 25],
    ]),
    conv('c-talent-vac', 'talent', 'p-ta', 'Critical vacancies', [
      ['user', 'Which critical vacancies are at risk?', 50],
      ['agent', 'Two: Melt Shop Superintendent and Reliability Engineer Lead — no finalists after 60+ days.', 44],
    ]),
    conv('c-aria', 'aria', null, 'ARIA — Command', [
      ['agent', 'Good morning, Francisco. Ask me “What requires my attention?” any time.', 180],
    ]),
  ];
  return { conversations: all.map((x) => x.c), messages: all.flatMap((x) => x.m) };
}

export function seedNotifications(): AppNotification[] {
  return [
    { id: 'n-1', kind: 'input_needed', title: 'ATLAS needs a decision', body: 'Approve the 3D training architecture.', ts: ago(12), read: false, priority: 'high', target: { type: 'agent', id: 'atlas' } },
    { id: 'n-2', kind: 'document_ready', title: '3 LinkedIn drafts ready', body: 'PRAXIS prepared drafts for review.', ts: ago(25), read: false, priority: 'high', target: { type: 'decision', id: 'd-posts' } },
    { id: 'n-3', kind: 'deadline', title: 'Mission due in 2 days', body: '3D — Define learning architecture.', ts: ago(60), read: false, priority: 'low', target: { type: 'project', id: 'p-3d' } },
    { id: 'n-4', kind: 'meeting', title: 'Talent review at 16:00', body: 'Succession Council — readiness review.', ts: ago(90), read: true, priority: 'low', target: { type: 'project', id: 'p-succ' } },
  ];
}

export function seedCalendar(): CalendarEvent[] {
  return [
    { id: 'cal-1', title: 'Steel shop OJT steering', start: at(0, 11, 0), durationMin: 45, projectId: 'p-ojt', location: 'Training Center' },
    { id: 'cal-2', title: 'Talent review — critical positions', start: at(0, 16, 0), durationMin: 60, projectId: 'p-succ' },
    { id: 'cal-3', title: '3D pilot scoping with Operations', start: at(1, 9, 30), durationMin: 60, projectId: 'p-3d' },
    { id: 'cal-4', title: 'Praxia client discovery call', start: at(1, 18, 0), durationMin: 30, projectId: 'p-praxia' },
  ];
}

export function seedInbox(): InboxItem[] {
  return [
    { id: 'in-1', from: 'Operations Director', subject: '3D pilot — which shift?', preview: 'Can we start with the night crew of the melt shop…', ts: ago(55), projectId: 'p-3d' },
    { id: 'in-2', from: 'Recruiting partner', subject: 'Shortlist: Reliability Engineer Lead', preview: 'Attached are three profiles from Monterrey and Calgary…', ts: ago(140), projectId: 'p-ta' },
    { id: 'in-3', from: 'Praxia lead', subject: 'Proposal follow-up', preview: 'Thanks for the session. Could you send the offer tiers…', ts: ago(400), projectId: 'p-praxia' },
  ];
}

export function seedSquads(): Squad[] {
  return [];
}

export function seedActivity(): ActivityItem[] {
  const a = (min: number, text: string, extra: Partial<ActivityItem>): ActivityItem => ({
    id: `seed-act-${min}`,
    ts: ago(min),
    text,
    eventType: 'seed',
    category: 'work',
    critical: false,
    waitingForMe: false,
    completed: false,
    source: 'simulated',
    ...extra,
  });
  return [
    a(4, 'SCOUT identified 4 reference OJT models.', { agentId: 'scout', projectId: 'p-3d' }),
    a(12, 'ATLAS requested Francisco’s decision on 3D architecture.', { agentId: 'atlas', projectId: 'p-3d', waitingForMe: true, critical: true }),
    a(18, 'PRAXIS started Q4 LinkedIn strategy.', { agentId: 'praxis', projectId: 'p-content', category: 'praxia' }),
    a(25, 'PRAXIS created 3 draft LinkedIn posts.', { agentId: 'praxis', projectId: 'p-content', category: 'praxia', completed: true }),
    a(31, 'FORGE reviewed Work Instruction #042.', { agentId: 'forge', projectId: 'p-ojt', completed: true }),
    a(70, 'FORGE generated furnace environment v0.3.', { agentId: 'forge', projectId: 'p-3d', completed: true }),
    a(2000, 'LEDGER closed the September budget review.', { agentId: 'ledger', projectId: 'p-fin', category: 'personal', completed: true }),
  ];
}
