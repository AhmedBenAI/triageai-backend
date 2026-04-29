export const KNOWLEDGE_BASE = [
  // ── BILLING ────────────────────────────────────────────────────────────────
  {
    id: "kb-001",
    category: "billing",
    title: "Refund Policy",
    tags: ["refund", "charge", "payment", "money", "invoice", "billing", "order", "cancel"],
    content:
      "Customers are eligible for a full refund within 30 days of purchase. After 30 days, partial refunds may be issued at manager discretion. Subscription cancellations take effect at the end of the billing period. To process a refund, navigate to Admin > Billing > Refund Manager and enter the order ID. Refunds are processed within 5–10 business days to the original payment method. Proration is applied for mid-cycle plan downgrades.",
  },
  {
    id: "kb-002",
    category: "billing",
    title: "Invoice & Payment Issues",
    tags: ["invoice", "payment", "failed", "card", "vat", "tax", "billing", "subscription", "decline"],
    content:
      "Failed payments are retried automatically after 3 and 7 days. Customers can update payment methods at Settings > Billing > Payment Methods. Invoices are emailed automatically and available in the billing portal. VAT exemption requires a valid tax ID submitted via the Tax Settings page. If a payment fails after all retries, the account is placed on a grace period of 7 days before suspension. Contact billing@support.com to arrange alternative payment arrangements.",
  },
  {
    id: "kb-011",
    category: "billing",
    title: "Subscription Plans & Upgrades",
    tags: ["plan", "upgrade", "downgrade", "subscription", "tier", "pricing", "pro", "enterprise", "seats"],
    content:
      "Available plans: Starter (up to 5 seats), Pro (up to 25 seats), Business (up to 100 seats), Enterprise (unlimited). Upgrades take effect immediately and are prorated. Downgrades take effect at the next billing cycle. Annual plans receive a 20% discount versus monthly. To change plans go to Settings > Billing > Change Plan. Enterprise plans include dedicated support, custom SLAs, and SSO. Contact sales@support.com for volume pricing or custom contracts.",
  },
  {
    id: "kb-012",
    category: "billing",
    title: "Billing Disputes & Chargebacks",
    tags: ["dispute", "chargeback", "fraud", "unauthorized", "double charge", "overcharged", "billing error"],
    content:
      "If you believe you have been incorrectly charged, contact billing support within 60 days of the charge. Provide the invoice number, charge date, and description of the discrepancy. We aim to resolve disputes within 5 business days. For chargeback requests filed with your bank, please contact us first — we can often resolve issues faster directly. Initiating a chargeback without contacting support may result in account suspension. Duplicate charges are reversed within 2 business days upon verification.",
  },
  {
    id: "kb-013",
    category: "billing",
    title: "Free Trial & Promotional Credits",
    tags: ["free trial", "trial", "promo", "credit", "coupon", "discount", "promotional"],
    content:
      "New accounts receive a 14-day free trial with full Pro plan features — no credit card required. Trial accounts are limited to 3 team members and 100 API calls per day. At trial end, accounts revert to the free tier unless a plan is selected. Promotional credits are applied automatically at checkout and expire 12 months from issue. Credits cannot be transferred or redeemed for cash. If you need a trial extension, contact sales with your use case.",
  },

  // ── TECHNICAL ──────────────────────────────────────────────────────────────
  {
    id: "kb-003",
    category: "technical",
    title: "API Authentication Errors",
    tags: ["api", "401", "403", "unauthorized", "key", "token", "auth", "rate limit", "429", "oauth"],
    content:
      "401 errors indicate invalid or expired API keys. Keys can be regenerated at Settings > Developer > API Keys. Rate limit errors (429) resolve after the window resets; upgrade the plan for higher limits. For OAuth issues, ensure redirect URIs are whitelisted in the app dashboard. API keys should be passed as the Authorization header: 'Bearer YOUR_KEY'. Never expose keys in client-side code. Keys can be scoped to read-only, write, or admin permissions.",
  },
  {
    id: "kb-004",
    category: "technical",
    title: "Integration & Webhook Troubleshooting",
    tags: ["webhook", "integration", "slack", "zapier", "payload", "ssl", "firewall", "endpoint", "callback"],
    content:
      "Webhook failures are logged at Settings > Integrations > Webhook Logs. Common causes: firewall blocking our IPs (list at docs/webhook-ips), SSL certificate issues, or payload size exceeding 1 MB. Test webhooks using the Send Test button before going live. Webhook retries occur at 1, 5, 30, and 120 minutes after failure. Endpoints must respond with 2xx within 30 seconds. HMAC signatures are provided in the X-Signature header for payload verification.",
  },
  {
    id: "kb-014",
    category: "technical",
    title: "Performance & Rate Limiting",
    tags: ["performance", "slow", "timeout", "latency", "rate limit", "throttle", "429", "queue", "batch"],
    content:
      "API rate limits vary by plan: Starter 100 req/min, Pro 500 req/min, Business 2000 req/min, Enterprise custom. Rate limit headers (X-RateLimit-Remaining, X-RateLimit-Reset) are included in all responses. Implement exponential backoff when receiving 429 responses. Bulk operations should use the batch endpoint to reduce individual request count. Dashboard queries are cached for 60 seconds. For high-throughput use cases, contact support to discuss dedicated infrastructure options.",
  },
  {
    id: "kb-015",
    category: "technical",
    title: "SDK Installation & Setup",
    tags: ["sdk", "install", "npm", "pip", "library", "setup", "node", "python", "java", "quickstart"],
    content:
      "Official SDKs are available for Node.js, Python, Ruby, Java, and Go. Install via package managers: npm install @company/sdk or pip install company-sdk. Initialise with your API key: const client = new CompanyClient({ apiKey: process.env.API_KEY }). SDK documentation is at docs.ourapp.com/sdks. All SDKs support automatic retries, timeout configuration, and async/await. Minimum supported versions: Node 16+, Python 3.8+, Java 11+.",
  },
  {
    id: "kb-016",
    category: "technical",
    title: "Error Codes Reference",
    tags: ["error", "400", "401", "403", "404", "429", "500", "503", "code", "status"],
    content:
      "400 Bad Request: malformed body or missing required fields. 401 Unauthorized: invalid or missing API key. 403 Forbidden: insufficient permissions for the resource. 404 Not Found: resource does not exist or has been deleted. 422 Unprocessable: request valid but cannot be processed (e.g. quota exceeded). 429 Too Many Requests: rate limit exceeded, see Retry-After header. 500 Internal Error: contact support with the request ID from the response. 503 Service Unavailable: temporary outage, check status page.",
  },
  {
    id: "kb-017",
    category: "technical",
    title: "Data Sync & Import Issues",
    tags: ["sync", "import", "csv", "migration", "data", "bulk", "upload", "failed", "stuck", "duplicate"],
    content:
      "CSV imports support up to 50,000 rows per file with UTF-8 encoding and headers in row 1. Common import failures: duplicate email addresses, missing required fields, or invalid date formats (use ISO 8601). Stuck imports can be retried from the Import History page. Real-time sync connectors (Salesforce, HubSpot, Postgres) require OAuth re-authorisation every 90 days. Sync conflicts are resolved using last-write-wins by default, configurable per workspace.",
  },

  // ── ACCOUNT ─────────────────────────────────────────────────────────────────
  {
    id: "kb-005",
    category: "account",
    title: "Password & Access Recovery",
    tags: ["password", "reset", "locked", "access", "login", "sso", "email", "recover", "account", "forgot"],
    content:
      "Password resets are sent to the verified email address within 2 minutes. If email is inaccessible, identity verification via support is required (government ID + billing confirmation). SSO-only accounts cannot use password login. Account locks after 10 failed attempts, auto-unlocking after 30 minutes. Admins can manually unlock accounts at Settings > Team > Manage Member. For urgent access recovery, 24/7 emergency support is available on Business and Enterprise plans.",
  },
  {
    id: "kb-006",
    category: "account",
    title: "Team & Permissions Management",
    tags: ["team", "permissions", "roles", "admin", "member", "invite", "seat", "owner", "access", "user"],
    content:
      "Admins can invite team members at Settings > Team. Roles: Owner (full access), Admin (all except billing), Member (read + limited write), Viewer (read-only). Seat limits apply by plan. Removing a member immediately revokes access and releases the seat. Transferred ownership requires email confirmation from both parties. Custom roles are available on Business and Enterprise plans. Bulk role changes can be performed via CSV upload or the API.",
  },
  {
    id: "kb-018",
    category: "account",
    title: "Account Deletion & Data Removal",
    tags: ["delete", "account", "cancel", "close", "remove", "erasure", "data deletion", "gdpr"],
    content:
      "Account deletion can be initiated at Settings > Account > Delete Account by the account Owner only. All data is permanently deleted within 30 days, with a confirmation email sent immediately. Data exports must be requested before deletion — download links expire 7 days after cancellation. For GDPR right-to-erasure requests, submit via Settings > Privacy > Data Requests; fulfilled within 30 days. Deleted accounts cannot be reactivated; a new account must be created.",
  },
  {
    id: "kb-019",
    category: "account",
    title: "Multi-Factor Authentication (MFA)",
    tags: ["mfa", "2fa", "two factor", "authenticator", "totp", "sms", "security", "otp", "google authenticator"],
    content:
      "MFA can be enabled at Settings > Security > Two-Factor Authentication. Supported methods: TOTP apps (Google Authenticator, Authy), SMS codes, and hardware security keys (FIDO2/WebAuthn). Enterprise plans can enforce MFA organisation-wide. Backup codes are generated at setup — store them securely offline. If MFA device is lost, use a backup code or contact support with identity verification. Admins can reset MFA for team members at Settings > Team > Security.",
  },
  {
    id: "kb-020",
    category: "account",
    title: "Single Sign-On (SSO) Configuration",
    tags: ["sso", "saml", "okta", "azure", "active directory", "idp", "login", "enterprise", "oidc"],
    content:
      "SSO is available on Business and Enterprise plans via SAML 2.0 and OIDC. Compatible with Okta, Azure AD, Google Workspace, OneLogin, and any SAML-compliant IdP. Required fields: Entity ID, SSO URL, and X.509 certificate from your IdP. JIT (Just-in-Time) provisioning automatically creates accounts on first SSO login. SCIM provisioning is available for automated user lifecycle management on Enterprise plans. Configuration guide: docs.ourapp.com/sso.",
  },

  // ── FEATURE ─────────────────────────────────────────────────────────────────
  {
    id: "kb-007",
    category: "feature",
    title: "Export & Data Portability",
    tags: ["export", "download", "csv", "json", "pdf", "gdpr", "data", "portability", "backup"],
    content:
      "Data exports are available in CSV, JSON, and PDF via Settings > Data > Export. Exports are processed asynchronously; large datasets may take up to 24 hours. Download links are emailed and expire after 48 hours. GDPR data requests are fulfilled within 30 days and include all user-generated content. Scheduled exports (daily, weekly, monthly) are available on Business and Enterprise plans. Deleted records are not included in exports.",
  },
  {
    id: "kb-008",
    category: "feature",
    title: "Notification & Alert Configuration",
    tags: ["notification", "alert", "slack", "email", "pagerduty", "push", "mobile", "digest", "webhook"],
    content:
      "Notifications are configured per-workspace at Settings > Notifications. Supported channels: email, Slack, PagerDuty, Microsoft Teams, and custom webhooks. Digest mode batches alerts hourly or daily to reduce noise. Mobile push notifications require the mobile app (iOS 14+ / Android 10+). Alert rules can be based on thresholds, anomaly detection, or schedule. Mute windows allow suppression during maintenance. Each team member can personalise notification preferences independently.",
  },
  {
    id: "kb-021",
    category: "feature",
    title: "Dashboard & Reporting",
    tags: ["dashboard", "report", "chart", "analytics", "metrics", "kpi", "visualisation", "widget", "custom"],
    content:
      "Dashboards are fully customisable — add, remove, and resize widgets via the Edit Dashboard button. Available chart types: line, bar, pie, table, and scorecard. Reports can be scheduled for automatic email delivery daily, weekly, or monthly. Custom metrics can be defined using our formula builder. Dashboards can be shared via public read-only link or with specific team members. Analytics data is retained for 13 months on Pro and above. CSV and PDF export is available for all reports.",
  },
  {
    id: "kb-022",
    category: "feature",
    title: "API Quota Management",
    tags: ["quota", "limit", "api", "usage", "overage", "increase", "capacity", "throughput"],
    content:
      "API usage is visible at Settings > Developer > Usage and resets monthly. Quota overage alerts can be configured at Settings > Notifications. To request a quota increase, submit a request with your use case at Settings > Developer > Request Increase; typically processed within 2 business days. High-volume customers should consider Enterprise dedicated infrastructure. Usage is billed per request on overage for Pro plans. Unused quota does not roll over.",
  },
  {
    id: "kb-023",
    category: "feature",
    title: "Mobile App & Desktop Client",
    tags: ["mobile", "ios", "android", "desktop", "app", "offline", "sync", "download", "install"],
    content:
      "Native apps are available for iOS (App Store), Android (Google Play), macOS, and Windows. Requirements: iOS 14+, Android 10+, macOS 11+, Windows 10+. Apps sync automatically when online. Offline mode allows read access and drafts that sync on reconnect. Biometric authentication (Face ID, fingerprint) is supported. Major version updates are mandatory within 90 days of release. Desktop clients support keyboard shortcuts and system tray integration.",
  },

  // ── COMPLIANCE ──────────────────────────────────────────────────────────────
  {
    id: "kb-009",
    category: "compliance",
    title: "GDPR & Data Privacy",
    tags: ["gdpr", "ccpa", "privacy", "dpa", "data", "compliance", "eu", "soc2", "retention", "personal data"],
    content:
      "We are GDPR and CCPA compliant. DPA agreements are available on request — contact legal@ourapp.com. Data is stored in EU-West-1 by default; US and APAC regions available on Enterprise. Data retention: 90 days post-cancellation, then permanently deleted. SOC 2 Type II report available under NDA. We do not sell personal data to third parties. Sub-processor lists and privacy impact assessments are available on request.",
  },
  {
    id: "kb-010",
    category: "compliance",
    title: "SLA & Uptime Guarantees",
    tags: ["sla", "uptime", "downtime", "maintenance", "incident", "enterprise", "status", "availability"],
    content:
      "Standard plans: 99.9% uptime SLA excluding planned maintenance. Enterprise plans: 99.99% with dedicated support. SLA credits are applied automatically after incidents exceeding the monthly threshold. Status page: status.ourapp.com. Planned maintenance is announced 72 hours in advance via email and status page. Incidents are updated every 30 minutes. Enterprise customers receive a dedicated CSM and escalation path.",
  },
  {
    id: "kb-024",
    category: "compliance",
    title: "Security & Encryption Standards",
    tags: ["security", "encryption", "tls", "aes", "ssl", "vulnerability", "penetration", "pentest", "iso27001", "hipaa"],
    content:
      "All data is encrypted in transit (TLS 1.2+) and at rest (AES-256). We hold ISO 27001 certification and undergo annual third-party penetration testing. Vulnerability disclosure programme at security.ourapp.com/report. HIPAA Business Associate Agreements are available on Enterprise plans. Payment card data is not stored — all processing is handled by PCI-DSS Level 1 certified processors. Security audit reports are available under NDA upon request.",
  },
  {
    id: "kb-025",
    category: "compliance",
    title: "Audit Logs & Compliance Reporting",
    tags: ["audit", "log", "trail", "activity", "compliance", "report", "history", "change", "access log", "siem"],
    content:
      "Audit logs capture all user actions including logins, data access, configuration changes, and API calls. Logs are retained for 1 year on Pro and 7 years on Enterprise. Available at Settings > Security > Audit Log and exportable as JSON or CSV. Logs can be forwarded to SIEM tools (Splunk, Datadog, Sumo Logic) via streaming webhooks. Immutable audit trails are available on Enterprise for regulated industries. Custom compliance reports can be generated for SOC 2, ISO 27001, and HIPAA audits.",
  },
];
