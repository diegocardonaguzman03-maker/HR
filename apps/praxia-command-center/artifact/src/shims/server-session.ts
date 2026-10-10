/** In the Artifact, access is controlled by claude.ai sharing (private to the owner by default). */
export async function requireFounder() { return "founder" as const; }
