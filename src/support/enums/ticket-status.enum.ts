// Maps to the 4 badge states shown in the "تذاكري" (My Tickets) design:
//   OPEN        -> "مفتوحة"     (green)  — just created, no one picked it up yet
//   IN_PROGRESS -> "قيد المعالجة" (orange) — support/admin is actively handling it
//   PENDING     -> "بانتظار"     (grey)   — waiting on a reply from the user
//   CLOSED      -> "مغلقة"       (red)    — resolved & closed
export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING = 'pending',
  CLOSED = 'closed',
}
