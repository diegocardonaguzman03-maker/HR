# Financial definitions (Phase 1)

Operational finance system. **It is not regulated accounting or tax software.** The invoices it produces are not CFDI. Validate treatments with an accountant.

| Metric | Definition | Type |
|---|---|---|
| Bookings / contracted | Total value of contracts **signed** in the period (signature date and evidence required) | Actual |
| MRR | Monthly amount of signed or active retainers with a start date ≤ today and an end date ≥ today (or none). The retainer's total value must equal monthly amount × committed months (validated at signature) | Actual |
| Recognized revenue | Revenue recognition entries in the period (milestone delivered, retainer month served, manual). Split into recurring (retainer) and project | Actual |
| Invoiced | Issued, non-void invoices dated in the period: subtotal (before tax) and total (with tax) | Actual |
| Cash collected | Payments received in the period (cash, **includes tax**). Also reported **net of tax** (pro-rated subtotal/total of each invoice); the net figure is what counts toward the goal when its basis is "collected" | Actual |
| Receivables (AR) | Open balance of issued invoices; overdue if past the due date | Actual |
| Direct costs | Actual expenses typed "direct" (linked to a contract) | Actual |
| Operating expenses | Actual expenses typed "overhead" | Actual |
| Gross profit | Recognized revenue − direct costs | Actual |
| Operating profit | Gross profit − operating expenses | Actual |
| Cash balance | Opening balance declared by the founder + collections − actual expenses since that date. **Assumptions:** expenses are paid when incurred (no payables yet); balances are not revalued at today's FX rate; includes tax collected that is owed to SAT | Estimate |
| Runway | Cash balance ÷ average monthly gross burn over the history actually available (minimum 30, maximum 90 days); a short history is never divided by 3 months | Estimate |
| Expected collections 30d | Open invoices due in the next 30 days (excludes overdue ones) | Forecast |
| Weighted pipeline | Σ value × stage probability (or override) for open opportunities, converted at the latest rate | Forecast |
| Goal | Monthly goal × months in the period ("last 30 days" = 1 month). Measure configurable: recognized, collected net of tax, or contracted. **Basis pending a founder decision (D-P05)** | Goal |

**Multi-currency:** originals are never overwritten. Each record keeps `fx_rate`, `fx_source`, `fx_rate_date`, `reporting_currency` and `reporting_amount`. A record with no rate on its own date is excluded from totals and counted as "no FX". The reporting currency is locked once financial records exist.

## Rules applied by the system
- Revenue recognition and invoice issue dates can't be in the future (only work already delivered).
- Payments: same currency as the invoice, never above the balance, never with a future date.
- Proposal pricing can't be submitted with a zero estimated cost (it would show a false 100% margin).
- A contract signed from a proposal can't change its value without a new approved proposal version.

## Pending (FIN-01 review, Phase 2)
Accounts payable; projection of recurring expenses; tax ledger (IVA collected and paid, ISR) [PENDIENTE accountant]; reconciliation per currency and FX gains and losses; deferred revenue and unbilled receivables; credit notes; xlsx/CSV exports; owner draws and capital contributions; advance payments; IVA on foreign clients (possible 0% for exports) [PENDIENTE accountant].
