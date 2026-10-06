// Content used by the MockAgentProvider to simulate believable work.
// Everything produced from here is tagged `source: 'simulated'`.
import type { AgentTask } from '@/types/domain';

export interface TaskTemplate {
  title: string;
  projectId: string;
  missionId?: string;
  state: AgentTask['state'];
  output?: string; // deliverable file name
}

export const TASK_LIBRARY: Record<string, TaskTemplate[]> = {
  aria: [
    { title: 'Preparing tomorrow’s briefing', projectId: 'citadel', state: 'reviewing' },
    { title: 'Triaging inbox and calendar conflicts', projectId: 'citadel', state: 'working' },
    { title: 'Checking buddy programme status', projectId: 'p-onb', missionId: 'm-on-2', state: 'reviewing' },
  ],
  atlas: [
    { title: 'Prioritising HR AI use cases', projectId: 'p-aihr', missionId: 'm-ai-1', state: 'working', output: 'HR AI prioritisation matrix.deck' },
    { title: 'Succession risk narrative for the board', projectId: 'p-succ', missionId: 'm-su-1', state: 'working', output: 'Succession risk memo.doc' },
    { title: 'Praxia offer economics', projectId: 'p-praxia', missionId: 'm-px-1', state: 'collaborating' },
  ],
  forge: [
    { title: 'Draft WI template for EAF tapping', projectId: 'p-3d', missionId: 'm-3d-3', state: 'working', output: 'WI template — EAF tapping.doc' },
    { title: 'Harness inspection interaction design', projectId: 'p-wah', missionId: 'm-wah-2', state: 'working', output: 'Harness inspection storyboard.deck' },
    { title: 'Planner certification curriculum', projectId: 'p-mra', missionId: 'm-mr-1', state: 'working', output: 'Planner certification path.doc' },
    { title: 'Reviewing Work Instruction #043', projectId: 'p-ojt', missionId: 'm-ojt-2', state: 'reviewing' },
  ],
  scout: [
    { title: 'Scanning VR safety training evidence', projectId: 'p-wah', state: 'researching', output: 'VR safety training — evidence scan.pdf' },
    { title: 'Benchmarking AI recruiting tools', projectId: 'p-ta', state: 'researching', output: 'AI recruiting tools benchmark.pdf' },
    { title: 'Researching consulting IP models', projectId: 'p-praxia', state: 'researching' },
    { title: 'Exploring AI shift-coach concepts', projectId: 'p-frontier', missionId: 'm-fr-1', state: 'researching', output: 'AI shift coach — concept note.doc' },
  ],
  talent: [
    { title: 'Sourcing plan: Reliability Engineer Lead', projectId: 'p-ta', missionId: 'm-ta-1', state: 'working', output: 'Sourcing plan — Reliability Lead.doc' },
    { title: 'Update ready-now successor list', projectId: 'p-succ', missionId: 'm-su-1', state: 'reviewing' },
    { title: 'Workforce plan 2027 assumptions', projectId: 'p-ta', state: 'working' },
  ],
  nexus: [
    { title: 'Recruitment funnel dashboard', projectId: 'p-ta', missionId: 'm-ta-2', state: 'working', output: 'Recruitment funnel.sheet' },
    { title: 'OJT completion analytics', projectId: 'p-ojt', state: 'working' },
    { title: 'HR data quality audit', projectId: 'p-aihr', state: 'reviewing', output: 'HR data quality audit.sheet' },
  ],
  praxis: [
    { title: 'Writing article: digital twins for operators', projectId: 'p-content', state: 'working', output: 'Article draft — digital twins.doc' },
    { title: 'Refining offer architecture', projectId: 'p-praxia', missionId: 'm-px-1', state: 'working' },
    { title: 'Product concept: OJT toolkit', projectId: 'p-product', missionId: 'm-pl-1', state: 'researching' },
  ],
  // LEDGER only works when asked: the Personal Sanctuary stays quiet by default.
  ledger: [],
};

export const FINDINGS: Record<string, string[]> = {
  scout: [
    'Two Canadian mills pair tablet work instructions with supervisor sign-off; time-to-competence fell 20–30% (vendor-reported, verify).',
    'Most programs start with 3–5 high-risk tasks before scaling.',
    'Adoption failed where content was not maintained by the plant — ownership matters more than tooling.',
    'Web-based 3D scenes are now viable on standard plant laptops.',
  ],
  forge: ['12 critical roles mapped to 5-step OJT', 'Draft certification checklist for EAF operators', 'WI #042 reviewed — 3 hazard callouts added'],
  talent: ['2 critical vacancies without finalists > 60 days', 'Referral hires convert 2× faster', 'Calgary market has relevant reliability talent'],
  nexus: ['Engagement peaks Tue/Thu 7–9 am', 'OJT completion correlates with trainer availability (r≈0.6)', 'HR master data: 81% complete'],
  praxis: ['3 content pillars defined', 'Offer tiers: Diagnose / Design / Deploy', 'Best-performing format: carousel with plant photos'],
  atlas: ['Option A has the lowest 3-year TCO', 'Main risk: content maintenance capacity', 'Phased roll-out by plant reduces change load'],
  ledger: ['Savings rate on track at 22%', 'Debt payoff 64% complete', 'Q4 has 2 large planned expenses'],
  aria: ['3 items need your attention today', '2 meetings could be shortened', 'No conflicts tomorrow'],
};

export const BLOCKERS = [
  'ATS export credentials expired — IT ticket needed',
  'Waiting for plant data access approval',
  'Source document is behind a login',
  'Conflicting requirements from two stakeholders',
];
