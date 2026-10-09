/**
 * PRAXIA's company structure as designed in `praxia/01-equipo/diseno-del-equipo.md`:
 * the reporting lines (org chart, §1) and the eight delivery teams (§2). Pure and client-safe.
 */
export const TEAM_IDS = ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8"] as const;
export type TeamId = (typeof TEAM_IDS)[number];

export type Team = {
  id: TeamId;
  name: string;
  /** Label painted on the room's glass wall (kept short so it fits a 5-tile room). */
  wallLabel: string;
  /** What the team owns (workflows and responsibilities). */
  owns: string;
  workflows: readonly string[];
  folder: string;
  /** Accent used for the team in the HQ and in mission control. */
  color: string;
};

export const TEAMS: readonly Team[] = [
  { id: "E1", name: "Dirección", wallLabel: "E1 · Dirección", owns: "Priorities, decisions and synthesis (WF07)", workflows: ["WF07"], folder: "praxia/equipos/E1-direccion/", color: "#F5F2EC" },
  { id: "E2", name: "Revenue", wallLabel: "E2 · Revenue", owns: "WF01 Lead to Contract", workflows: ["WF01"], folder: "praxia/equipos/E2-revenue/", color: "#E9663C" },
  { id: "E3", name: "Marca y Demanda", wallLabel: "E3 · Marca y Demanda", owns: "WF03 Content to Demand", workflows: ["WF03"], folder: "praxia/equipos/E3-marca-demanda/", color: "#8B5CF6" },
  { id: "E4", name: "Delivery y Adopción", wallLabel: "E4 · Delivery", owns: "WF02 Client Delivery · WF05 Customer Support", workflows: ["WF02", "WF05"], folder: "praxia/equipos/E4-delivery-adopcion/", color: "#5B4BFF" },
  { id: "E5", name: "Research, Datos e IP", wallLabel: "E5 · Research e IP", owns: "WF06 Research to IP", workflows: ["WF06"], folder: "praxia/equipos/E5-research-datos-ip/", color: "#A9A1FF" },
  { id: "E6", name: "Producto y Experiencia", wallLabel: "E6 · Producto y Experiencia", owns: "WF04 Product Build", workflows: ["WF04"], folder: "praxia/equipos/E6-producto-experiencia/", color: "#A7AAB5" },
  { id: "E7", name: "Operaciones y Personas", wallLabel: "E7 · Ops y Personas", owns: "WF07 Internal Operations", workflows: ["WF07"], folder: "praxia/equipos/E7-operaciones-personas/", color: "#E9A23C" },
  { id: "E8", name: "Gobierno", wallLabel: "E8 · Gobierno", owns: "Quality and risk gates in every workflow", workflows: ["WF01–WF07"], folder: "praxia/equipos/E8-gobierno/", color: "#3FB68B" },
];

const BY_ID = new Map(TEAMS.map((t) => [t.id, t]));

/** "E3 Marca y Demanda" (the agent registry's team field) → "E3". Unknown values → null. */
export function teamIdOf(team: string | null | undefined): TeamId | null {
  const m = /^(E[1-8])\b/.exec(team ?? "");
  return m ? (m[1] as TeamId) : null;
}

export const teamById = (id: string | null | undefined): Team | null => (id ? (BY_ID.get(id as TeamId) ?? null) : null);
export const teamOf = (team: string | null | undefined): Team | null => teamById(teamIdOf(team));

export type OrgNode<T> = { id: string; agent: T | null; children: OrgNode<T>[] };

/**
 * Reporting tree rooted at the Founder. Agents whose manager is missing hang from the Founder, so nobody is
 * dropped; a reporting cycle (bad data) is broken at the first repeated agent. Children are sorted by id.
 */
export function buildOrgTree<T extends { id: string; reportsTo: string }>(agents: readonly T[]): OrgNode<T> {
  const ids = new Set(agents.map((a) => a.id));
  const kids = new Map<string, T[]>();
  for (const a of agents) {
    const parent = a.reportsTo && ids.has(a.reportsTo) && a.reportsTo !== a.id ? a.reportsTo : "Founder";
    kids.set(parent, [...(kids.get(parent) ?? []), a]);
  }
  const seen = new Set<string>();
  const build = (id: string, agent: T | null): OrgNode<T> => {
    seen.add(id);
    const children = (kids.get(id) ?? [])
      .filter((c) => !seen.has(c.id))
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
      .map((c) => build(c.id, c));
    return { id, agent, children };
  };
  const root = build("Founder", null);
  // Agents trapped in a cycle never hang from the Founder: attach them so they stay visible.
  for (const a of agents) if (!seen.has(a.id)) root.children.push(build(a.id, a));
  return root;
}
