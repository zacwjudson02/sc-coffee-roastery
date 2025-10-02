## SwiftManifest Hub — Domain Schema (Proposed vNext)

This document describes the domain model and relationships for the next version of the application. It aligns with critical logic from the legacy snapshot while clarifying naming and cross-entity lifecycles. Natural-language descriptions are provided to guide both database design and feature implementation.

### Tenancy and Identity
- **Organizations (`organizations`)**: Tenancy anchor. Every business/tenant is an organization.
  - id (uuid, PK)
  - name (text)
- **Users (auth.users)**: Managed by the auth schema. Referenced by several tables for audit and workflow.
- **Profiles (`profiles`)**: App-level profile per user with tenant membership and role.
  - id (uuid, PK, FK → auth.users.id, cascade on delete)
  - org_id (uuid, FK → organizations.id, cascade on delete)
  - role (text enum: owner | admin | user; default: user)

Tenancy rule: All operational tables are owned by an organization. Enforce `org_id NOT NULL` and FK to `organizations(id)` except for global tables (e.g., `organizations` itself, `profiles` which is scoped by org). Recommend Row-Level Security (RLS) to restrict access by `org_id` and user role.

### Core Logistics

#### Bookings (`bookings`)
Represents a consignment/job to be transported on a given date.
- booking_id (int, PK)
- booking_date (date, required)
- sender (text) / receiver (text)
- pallets (int) / spaces (int)
- palltype (enum) — pallet type
- charge_to (enum) — billing target (e.g., sender/receiver/other)
- pod_method (enum) — how POD will be captured
- transfer_method (enum) — pickup/dropoff method
- charged_customer_id (int, FK → customers.customer_id, SET NULL on delete)
- selected_rate_id (bigint, FK → customer_rates.rate_id)
- invoice_id (int, FK → invoices.invoice_id, SET NULL on delete)
- status (text/enum) — booking workflow status
- is_pod_uploaded (boolean, default false)
- pod_uploaded_at (timestamptz, nullable)
- ref_num (text)
- display_order (int) — for UI ordering on manifests
- org_id (uuid, FK → organizations.id)
- created_at (timestamptz, default now())

Key relationships and rules:
- A booking belongs to exactly one organization.
- A booking can appear on at most one active run on a date (see Run Sheets).
- A booking may be invoiced; when invoiced, `invoice_id` links to the invoice. Multiple bookings can point to the same invoice (consolidated billing).
- A booking should have a selected customer rate at time of invoice; rate snapshot is copied to invoice lines.

#### Manifests / Run Sheets (`run_sheets`)
Represents an ordered list of bookings to service in a driver shift (the “manifest”).
- run_sheet_id (int, PK)
- shift_id (int, FK → driver_shifts.shift_id)
- booking_id (int, FK → bookings.booking_id)
- sequence_num (int) — ordering on the run sheet
- status (text/enum) — planned | in_progress | completed | cancelled
- start_time / end_time (time)
- notes (text)
- org_id (uuid, FK → organizations.id)
- created_at (timestamptz, default now())

Key relationships and rules:
- A run sheet entry associates one booking to one shift with a sequence number.
- A shift can have many run sheet entries; a booking can appear at most once per shift.
- Operational invariant (recommended): A booking is assigned to at most one open shift at a time.

#### Driver Shifts (`driver_shifts`)
Represents a driver’s assigned truck and working period for a date.
- shift_id (int, PK)
- driver_id (int, FK → drivers.driver_id, required)
- truck_id (int, FK → trucks.truck_id, optional)
- shift_date (date, required)
- shift_start / shift_end (time)
- total_kilometers (numeric)
- total_break_duration_minutes (int)
- notes (text)
- org_id (uuid, FK → organizations.id)
- created_at (timestamptz, default now())

Constraint: Unique (driver_id, shift_date) to prevent duplicate shifts per driver and day.

#### Drivers (`drivers`)
- driver_id (int, PK)
- driver_name (text)
- license_no (text)
- color (text) — UI calendar color
- current_truck_id (int, FK → trucks.truck_id)
- org_id (uuid, FK → organizations.id)
- created_at (timestamptz, default now())

#### Trucks (`trucks`)
- truck_id (int, PK)
- truck_name (text)
- registration (text, unique per organization)
- org_id (uuid, FK → organizations.id)
- created_at (timestamptz, default now())

### Billing & Revenue

#### Customers (`customers`)
- customer_id (int, PK)
- customer_name (text)
- contact_email / contact_phone (text)
- default_rate_basis (text)
- invoicing_frequency (text) — e.g., daily/weekly/monthly
- xero_contact_id (text)
- org_id (uuid, FK → organizations.id)
- created_at (timestamptz, default now())

Business rule: Consider `(org_id, customer_name)` unique to avoid dupes.

#### Customer Rates (`customer_rates`)
Defines prices per customer with effective dating.
- rate_id (bigint, PK)
- customer_id (bigint, FK → customers.customer_id, cascade on delete)
- rate_type (text) — e.g., base, fuel_surcharge, per_km, per_pallet
- description (text)
- rate_amount (numeric(10,2)) and is_percentage (boolean)
- route_origin / route_destination (text)
- min_quantity / max_quantity (numeric)
- effective_start_date (date, default CURRENT_DATE)
- effective_end_date (date, nullable)
- notes (text)
- org_id (uuid, FK → organizations.id)
- created_at (timestamptz, default now())

Resolution rule: At invoice time pick most-specific, currently effective rate (by date, route, type). Snapshot values into invoice lines to preserve history.

#### Invoices (`invoices`)
Represents billing events, possibly consolidating multiple bookings.
- invoice_id (int, PK)
- customer_id (int, FK → customers.customer_id)
- invoice_date (date, default CURRENT_DATE)
- period_start / period_end (date, optional)
- invoice_total (numeric(10,2))
- invoice_type (varchar(20), default 'FINAL')
- bucket_period (varchar(20), default 'DAILY')
- workflow_status (varchar(20), default 'DRAFT') — DRAFT | CONFIRMED | SENT | PAID | CANCELLED
- parent_invoice_id (int, FK → invoices.invoice_id) — for adjustments/rollups/credit notes
- converted_at/by, confirmed_at/by, sent_at/by (timestamptz/uuid → auth.users.id)
- xero_invoice_id / xero_contact_id (text)
- notes (text)
- org_id (uuid, FK → organizations.id)
- created_at (timestamptz, default now())

Constraint: One draft invoice per customer at a time (unique partial index on `(customer_id)` where `workflow_status = 'DRAFT'`).

#### Invoice Lines (`invoice_lines`)
Atomic charges that compose an invoice total.
- invoice_line_id (int, PK)
- invoice_id (int, FK → invoices.invoice_id, cascade on delete)
- line_type (text) — e.g., freight, surcharge, manual
- booking_id (int, FK → bookings.booking_id, optional)
- description (text)
- quantity (numeric(10,2), default 1)
- unit_price (numeric(10,2), default 0)
- line_amount (numeric(10,2), default 0)
- notes (text)
- created_at (timestamptz, default now())

Rules:
- Lines referencing bookings should reflect the selected rate at time of billing.
- Invoice total equals sum of line amounts; maintain via application logic or triggers.

#### Invoice History (`invoice_history`)
Audit trail of invoice status/type transitions.
- history_id (int, PK)
- invoice_id (int, FK → invoices.invoice_id)
- previous_status / new_status (text)
- previous_type / new_type (varchar)
- changed_at (timestamptz, default now())
- changed_by (uuid, FK → auth.users.id)
- notes (text)

### Proof of Delivery

#### PODs (`pods`)
Stores proof-of-delivery documents.
- pod_id (bigint, PK)
- booking_id (bigint, FK → bookings.booking_id, restrict on delete)
- file_url (text)
- uploaded_at (timestamptz, default now())
- uploaded_by (uuid, FK → auth.users.id)
- notes (text)
- org_id (uuid, FK → organizations.id)

Rules:
- A booking can have multiple PODs; the latest is authoritative for status.
- When a POD is uploaded, booking `is_pod_uploaded = true` and `pod_uploaded_at` is set.

### Communications

#### Recipients (`recipients`)
Contact list for sending documents (e.g., invoices/PODs).
- id (uuid, PK)
- company_name / contact_name / email
- created_at / updated_at (timestamptz, default now())

Constraint: `email` unique. Optionally relate to `customers` via a join table if needed later.

### Cross-Cutting

#### Audit Logs (`audit_logs`)
Generic table-level change log for transparency.
- log_id (int, PK)
- table_name (text) — target table
- record_id (int) — PK of changed record
- action (text) — INSERT | UPDATE | DELETE
- old_data / new_data (jsonb)
- user_id (uuid, FK → auth.users.id)
- created_at (timestamptz, default now())

Recommendation: Implement via triggers per critical tables (bookings, invoices, invoice_lines, pods) to capture before/after images.

#### Xero Integration (`xero_tokens`)
OAuth tokens by organization to sync invoices/contacts.
- id (bigint, PK)
- access_token / refresh_token (text)
- expires_at (timestamptz)
- tenant_id (text)
- org_id (uuid, FK → organizations.id)
- created_at / updated_at (timestamptz, default now())

Usage: Used by backend integration workers to push/pull invoice data. Scope tokens by `org_id`.

### Relationships Summary

- Organization 1—* Profiles (user membership)
- Organization 1—* Customers, Drivers, Trucks, Bookings, CustomerRates, Invoices, PODs, AuditLogs, DriverShifts, RunSheets
- Customer 1—* Bookings
- Customer 1—* Invoices
- Customer 1—* CustomerRates (effective-dated)
- Booking *—1 Customer (charged_customer_id)
- Booking 0..1—1 Invoice (when billed)
- Booking 0..1—1 CustomerRate (selected_rate_id)
- Booking 1—* PODs
- Driver 1—* DriverShifts
- Truck 1—* DriverShifts (optional)
- DriverShift 1—* RunSheets
- RunSheet *—1 Booking (entry per booking with sequence)
- Invoice 1—* InvoiceLines
- InvoiceLine *—0..1 Booking
- Invoice 1—* InvoiceHistory

### Lifecycles (Critical Workflows)

Booking lifecycle:
1. Draft → data entered (sender/receiver, date)
2. Scheduled → assigned to a `DriverShift` via `RunSheet` sequence
3. In Transit → tracked operationally
4. Delivered → operational completion
5. POD Uploaded → `pods` record created, booking flags updated
6. Ready to Invoice → rate selected/snapshotted
7. Invoiced → linked to `invoices`; subsequent changes emit `invoice_history`

Invoice lifecycle:
1. Draft (unique per customer) → lines accumulating
2. Confirmed → totals frozen; ready to send
3. Sent → external id populated if synced (xero_invoice_id)
4. Paid/Partially Paid → via accounting system callback/update
5. Cancelled → optionally generates a reversal/credit (parent linkage)

Driver shift & manifest lifecycle:
1. Planned → shift created; run sheet entries sequenced
2. Active → start time set; progress updates
3. Completed → end time set; all bookings delivered or updated

### Enumerations (to be refined)
- pallet_type_enum: e.g., STANDARD, CHEP, LOSCAM
- charge_to_enum: e.g., SENDER, RECEIVER, THIRD_PARTY
- pod_method_enum: e.g., SIGNATURE, PHOTO, SCAN
- transfer_method_enum: e.g., PICKUP, DELIVERY, CROSS_DOCK
- booking.status: e.g., DRAFT, SCHEDULED, IN_TRANSIT, DELIVERED, INVOICED, CANCELLED
- invoice.workflow_status: DRAFT, CONFIRMED, SENT, PAID, CANCELLED

### Performance & Indexing (Essentials)
- Keep unique partial index to enforce one DRAFT invoice per customer.
- Index FKs used in joins/filters (e.g., bookings.selected_rate_id, bookings.invoice_id, invoices.customer_id, invoice_lines.invoice_id/booking_id, run_sheets.shift_id/booking_id, driver_shifts.driver_id/shift_date, pods.booking_id/uploaded_by, audit_logs.user_id/table_name).
- Remove duplicate indexes (legacy: `idx_bookings_charged_customer_idd`).

### Security & RLS (Recommended)
- Enable RLS on all org-scoped tables. Policy pattern: user can access rows where `org_id` is in their memberships (via `profiles`).
- Restrict write operations by role (`profiles.role`).
- Only privileged roles can read `xero_tokens`.

### Compatibility Notes vs Legacy Snapshot
- Terminology: “Manifests” are represented by `run_sheets` entries tied to `driver_shifts`.
- Preserve critical constraints from legacy: unique driver/day shift; one draft invoice per customer; foreign keys and cascade behavior.
- Consider upgrading integer PKs without defaults to identities to simplify inserts.

### Open Decisions (for team agreement)
- Should `org_id` be NOT NULL everywhere and enforced via RLS-only access? (Recommended: yes)
- Formalize `booking.status` and `rate_type` enumerations.
- Do we allow a booking to be assigned to multiple shifts historically? (Recommended: one active at a time.)
- Do we snapshot rates to `invoice_lines` or recompute on the fly? (Recommended: snapshot.)


