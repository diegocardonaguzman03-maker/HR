import { test, expect, type Page } from "@playwright/test";

/**
 * End-to-end vertical slice on a fresh database (no demo data):
 * login → honest empty dashboard → organization → contact → opportunity → stage validation →
 * proposal → founder approval → sent → accepted (evidence) → contract signature → invoice → payment →
 * dashboard reflects contracted / invoiced / collected → agent task drives PRAXIA World status.
 */
test.describe.configure({ mode: "serial" });

const today = new Date().toISOString().slice(0, 10);
let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
});

async function answerNextPrompt(value: string) {
  page.once("dialog", (d) => d.accept(value));
}

test("requires login and rejects a wrong password", async () => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel("Password", { exact: true }).fill("wrong");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator("[role=alert]:not(#__next-route-announcer__)")).toContainText("Incorrect password");
  await page.getByLabel("Password", { exact: true }).fill("e2e-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "What needs your attention" })).toBeVisible();
});

test("empty company shows zeros and no invented activity", async () => {
  await expect(page.getByText("USD 0.00").first()).toBeVisible();
  await expect(page.getByText("Cash balance is not configured")).toBeVisible();
  await page.getByRole("link", { name: "AI Agents" }).click();
  await expect(page.getByText("SAL-03").first()).toBeVisible();
  await expect(page.locator("text=working").first()).toHaveCount(0);
});

test("creates organization, contact and opportunity with persistence and validation", async () => {
  await page.goto("/crm/organizations?new=1");
  await page.getByLabel("Name *", { exact: true }).fill("Acme Industrial E2E");
  await page.getByLabel("Website", { exact: true }).fill("https://acme-e2e.example.com");
  await page.getByRole("button", { name: "Save organization" }).click();
  await expect(page.getByRole("heading", { name: "Acme Industrial E2E" })).toBeVisible();

  // Duplicate detection
  await page.goto("/crm/organizations?new=1");
  await page.getByLabel("Name *", { exact: true }).fill("Another name");
  await page.getByLabel("Domain", { exact: true }).fill("acme-e2e.example.com");
  await page.getByRole("button", { name: "Save organization" }).click();
  await expect(page.locator("[role=alert]:not(#__next-route-announcer__)")).toContainText("duplicate");

  await page.goto("/crm/contacts?new=1");
  await page.getByLabel("Full name *", { exact: true }).fill("Elena Torres");
  await page.getByLabel("Job title", { exact: true }).fill("COO");
  await page.getByLabel(/^Organization/).selectOption({ label: "Acme Industrial E2E" });
  await page.getByLabel("Business email", { exact: true }).fill("elena@acme-e2e.example.com");
  await page.getByRole("button", { name: "Save contact" }).click();
  await expect(page.getByRole("heading", { name: "Elena Torres" })).toBeVisible();

  await page.goto("/crm?new=1");
  await page.getByLabel("Title *", { exact: true }).fill("Transformation diagnostic");
  await page.getByLabel(/^Organization\ \*/).selectOption({ label: "Acme Industrial E2E" });
  await page.getByRole("button", { name: "Create opportunity" }).click();
  await expect(page.getByRole("heading", { name: "Transformation diagnostic" })).toBeVisible();

  // Stage validation: Qualified requires contact + problem statement
  await page.getByRole("button", { name: "Qualified", exact: true }).click();
  await expect(page.getByText(/Cannot move to "Qualified"/)).toBeVisible();

  await page.getByRole("button", { name: "Edit opportunity" }).click();
  await page.getByLabel(/^Primary\ contact\ \(decision\-maker\)/).selectOption({ label: "Elena Torres — COO" });
  await page.getByLabel(/^Service/).selectOption({ label: "A · Transformation Diagnostic" });
  await page.getByLabel("Estimated value", { exact: true }).fill("12,000");
  await page.getByLabel("Expected close date", { exact: true }).fill(today);
  await page.getByLabel("Problem statement (client's economic problem)", { exact: true }).fill("New MES deployed; supervisors still run shifts on paper.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("USD 12,000.00").first()).toBeVisible();

  await page.getByRole("button", { name: "Qualified", exact: true }).click();
  await expect(page.getByRole("button", { name: "Qualified", exact: true })).toHaveAttribute("aria-current", "step");

  // Persistence across reload
  await page.reload();
  await expect(page.getByRole("button", { name: "Qualified", exact: true })).toHaveAttribute("aria-current", "step");

  // Closed Won without evidence is rejected
  await page.getByRole("button", { name: "Closed Won" }).click();
  await expect(page.getByText(/signed contract/).first()).toBeVisible();
});

test("proposal → approval → sent → accepted → signed contract", async () => {
  await page.getByRole("button", { name: "New proposal version" }).click();
  await expect(page).toHaveURL(/\/proposals\//);
  await expect(page.getByText("Price & margin")).toBeVisible();
  const cost = page.locator("tbody tr").first().locator("input").nth(4);
  await cost.fill("4,000");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("67%")).toBeVisible();
  await page.getByRole("button", { name: "Submit pricing for approval" }).click();
  await expect(page.getByText("Waiting for your approval")).toBeVisible();

  await page.goto("/approvals");
  await answerNextPrompt("Within range");
  await page.getByRole("button", { name: "Approve" }).first().click();
  await expect(page.getByText("0 waiting for you")).toBeVisible();

  await page.goBack();
  await page.reload();
  await answerNextPrompt(today);
  await page.getByRole("button", { name: "Record as sent (I sent it)" }).click();
  await expect(page.getByRole("button", { name: "Client accepted…" })).toBeVisible();
  await page.getByRole("button", { name: "Client accepted…" }).click();
  await page.getByLabel("Evidence *", { exact: true }).fill("Signed proposal PDF ACME-001");
  await page.getByRole("button", { name: "Record acceptance" }).click();
  await page.getByRole("link", { name: /record signature/ }).click();

  await page.getByLabel("Signature evidence *", { exact: true }).fill("Countersigned contract ACME-001-signed.pdf");
  await page.getByRole("button", { name: "Record signature" }).click();
  await expect(page.getByText("Recognize revenue")).toBeVisible();
  await page.getByLabel("Amount USD", { exact: true }).fill("6,000");
  await page.getByLabel("Description", { exact: true }).fill("Fieldwork delivered");
  await page.getByRole("button", { name: "Recognize", exact: true }).click();
  await expect(page.getByText("Fieldwork delivered")).toBeVisible();
});

test("invoice → issue → payment; dashboard reflects real figures", async () => {
  await page.getByRole("link", { name: "New invoice" }).click();
  await page.getByLabel("Subtotal (pre-tax) *", { exact: true }).fill("6,000");
  await page.getByRole("button", { name: "Create draft invoice" }).click();
  await expect(page.getByRole("button", { name: "Issue invoice" })).toBeVisible();
  await page.getByRole("button", { name: "Issue invoice" }).click();
  await expect(page.getByText("Record payment received")).toBeVisible();
  await page.getByLabel("Amount (USD)", { exact: true }).fill("3,000");
  await page.getByRole("button", { name: "Record payment" }).click();
  await expect(page.getByText("partially paid")).toBeVisible();

  await page.goto("/?period=mtd");
  const card = (label: string) => page.locator(".px-card", { has: page.getByText(label, { exact: true }) }).first();
  await expect(card("Contracted (bookings)")).toContainText("USD 12,000.00");
  await expect(card("Recognized revenue")).toContainText("USD 6,000.00");
  await expect(card("Invoiced (pre-tax)")).toContainText("USD 6,000.00");
  await expect(card("Cash collected")).toContainText("USD 3,000.00");
  await expect(card("Outstanding invoices")).toContainText("USD 3,960.00");
});

test("agent task changes status only through recorded events and shows in PRAXIA World", async () => {
  await page.goto("/agents/SAL-03");
  await page.getByRole("button", { name: "Assign task to agent" }).click();
  await page.getByLabel("Task *", { exact: true }).fill("Draft discovery guide for Acme");
  await page.getByRole("button", { name: "Queue task" }).click();
  await page.goto("/tasks");
  await page.getByRole("button", { name: "Start" }).first().click();
  await expect(page.getByText("working").first()).toBeVisible();
  await page.goto("/world?agent=SAL-03");
  await expect(page.getByLabel("Agent SAL-03", { exact: true })).toContainText("working");
  await expect(page.getByLabel("Agent SAL-03", { exact: true })).toContainText("Draft discovery guide for Acme");
});

test("audit log records the lifecycle", async () => {
  await page.goto("/settings/audit");
  for (const a of ["contract.signed", "payment.record", "approval.approved", "task.working"]) await expect(page.getByText(a).first()).toBeVisible();
});
