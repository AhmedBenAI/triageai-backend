export const KNOWLEDGE_BASE = [
  {
    id: "kb-001",
    category: "billing",
    title: "Refund Policy",
    tags: ["refund", "charge", "payment", "money", "invoice", "billing", "order"],
    content:
      "Customers are eligible for a full refund within 30 days of purchase. After 30 days, partial refunds may be issued at manager discretion. Subscription cancellations take effect at the end of the billing period. To process a refund, navigate to Admin > Billing > Refund Manager and enter the order ID.",
  },
  {
    id: "kb-002",
    category: "billing",
    title: "Invoice & Payment Issues",
    tags: ["invoice", "payment", "failed", "card", "vat", "tax", "billing", "subscription"],
    content:
      "Failed payments are retried automatically after 3 and 7 days. Customers can update payment methods at Settings > Billing > Payment Methods. Invoices are emailed automatically and available in the billing portal. VAT exemption requires a valid tax ID submitted via the Tax Settings page.",
  },
  {
    id: "kb-003",
    category: "technical",
    title: "API Authentication Errors",
    tags: ["api", "401", "403", "unauthorized", "key", "token", "auth", "rate limit", "429", "oauth"],
    content:
      "401 errors indicate invalid or expired API keys. Keys can be regenerated at Settings > Developer > API Keys. Rate limit errors (429) resolve after the window resets; upgrade the plan for higher limits. For OAuth issues, ensure redirect URIs are whitelisted in the app dashboard.",
  },
  {
    id: "kb-004",
    category: "technical",
    title: "Integration & Webhook Troubleshooting",
    tags: ["webhook", "integration", "slack", "zapier", "payload", "ssl", "firewall", "endpoint"],
    content:
      "Webhook failures are logged at Settings > Integrations > Webhook Logs. Common causes: firewall blocking our IPs (list at docs/webhook-ips), SSL certificate issues, or payload size exceeding 1MB. Test webhooks using the Send Test button before going live.",
  },
  {
    id: "kb-005",
    category: "account",
    title: "Password & Access Recovery",
    tags: ["password", "reset", "locked", "access", "login", "sso", "email", "recover", "account"],
    content:
      "Password resets are sent to the verified email address. If email is inaccessible, identity verification via support is required (government ID + billing confirmation). SSO-only accounts cannot use password login. Account locks after 10 failed attempts, auto-unlocking after 30 minutes.",
  },
  {
    id: "kb-006",
    category: "account",
    title: "Team & Permissions Management",
    tags: ["team", "permissions", "roles", "admin", "member", "invite", "seat", "owner", "access"],
    content:
      "Admins can invite team members at Settings > Team. Roles: Owner (full access), Admin (all except billing), Member (read + limited write), Viewer (read-only). Seat limits apply by plan. Removing a member immediately revokes access. Transferred ownership requires email confirmation from both parties.",
  },
  {
    id: "kb-007",
    category: "feature",
    title: "Export & Data Portability",
    tags: ["export", "download", "csv", "json", "pdf", "gdpr", "data", "portability"],
    content:
      "Data exports are available in CSV, JSON, and PDF formats. Exports are processed asynchronously; large datasets may take up to 24 hours. Download links expire after 48 hours. GDPR data requests must be fulfilled within 30 days and include all user-generated content.",
  },
  {
    id: "kb-008",
    category: "feature",
    title: "Notification & Alert Configuration",
    tags: ["notification", "alert", "slack", "email", "pagerduty", "push", "mobile", "digest"],
    content:
      "Notifications are configured per-workspace at Settings > Notifications. Supported channels: email, Slack, PagerDuty, and webhooks. Digest mode batches alerts to reduce noise. Mobile push notifications require the mobile app (iOS 14+ / Android 10+).",
  },
  {
    id: "kb-009",
    category: "compliance",
    title: "GDPR & Data Privacy",
    tags: ["gdpr", "ccpa", "privacy", "dpa", "data", "compliance", "eu", "soc2", "retention"],
    content:
      "We are GDPR and CCPA compliant. DPA agreements are available on request. Data is stored in EU-West-1 by default; US region available on Enterprise plans. Data retention: 90 days post-cancellation, then permanently deleted. SOC 2 Type II report available under NDA.",
  },
  {
    id: "kb-010",
    category: "compliance",
    title: "SLA & Uptime Guarantees",
    tags: ["sla", "uptime", "downtime", "maintenance", "incident", "enterprise", "status"],
    content:
      "Standard plans: 99.9% uptime SLA. Enterprise plans: 99.99% with dedicated support. SLA credits are applied automatically after incidents exceeding the threshold. Status page: status.ourapp.com. Planned maintenance is announced 72 hours in advance via email and status page.",
  },
];
