# Sprint 1 Review Pack

This page connects the four planning documents so a reviewer can confirm the design before any routes or tables are built. All planning files live in `docs/` with descriptive names, and each linked document contains a `Review pack cross-check` section that links back here.

## Planning documents

- [Marketplace user journeys](./workflows.md) - six numbered seller and customer journeys, each ending in an expected result.
- [Core business rules](./business-rules.md) - 15 must/must-not rules with valid and invalid examples.
- [Data relationships (ERD)](./data-model.md) - Mermaid ERD with five tables, primary keys, foreign keys, and one-to-many links.
- [API route plan](./api-plan.md) - seven routes with permissions, request data, success responses, and error responses.

Each link above resolves to a tracked file in `docs/`. Its cross-check section states which part of this page's scope, exclusions, and checklist that document supports.

## Core scope in plain language

- Sellers manage only the products they own: they can create a product, change its details, and deactivate it.
- Customers are recorded with a name and contact so every order can be linked to exactly one customer.
- Anyone can browse the active catalogue and view one active product without signing in.
- A customer submits a simple order containing one or more products and quantities; the backend derives the total from stored prices.

## Deliberately out of scope

- Payment processing and payment records.
- Delivery tracking and shipping status.
- Messaging, chat, and notifications.
- Authentication and signup implementation; the plans only state that seller product changes require a signed-in seller.
- Reviews, refunds, reservations, and other future marketplace features.

## Planned failure cases

- A product create, change, or deactivate without a signed-in seller is rejected with `401`.
- A product owned by another seller is reported as `404`, so ownership is not revealed.
- A missing or inactive product is `404` in detail and cannot be added to an order.
- An empty or invalid order is `400`, and insufficient stock is `409`, with no partial records written.

## What gets built next

1. Create the five tables exactly as described in the ERD.
2. Enforce the business rules in the backend before adding client behaviour.
3. Implement the seven planned routes with the documented permissions and responses.

## Reviewer checklist

- [ ] Ownership: signed-in seller required for product writes, and another seller's product is hidden as `404` (BR-01, BR-02, API PATCH rows).
- [ ] Product availability: only active products are visible or orderable; the `availability` filter narrows active products only (BR-07, `GET /products`).
- [ ] Positive quantity: every order item uses a positive integer quantity not above stock at submission time (BR-11, `POST /orders`).
- [ ] Server-calculated totals: `unit_price` is copied from the stored product price, client-supplied prices are ignored, and `order_total` comes from item snapshots (BR-05, BR-12).
- [ ] All-or-nothing order saving: any invalid item rejects the whole order without creating or modifying records (BR-15).
- [ ] Data model covers `seller`, `product`, `customer`, `order`, and `order item` with clear PK/FK links (ERD).
- [ ] `POST /customers` is distinct from `POST /orders`, which remains the only order-creation route (API plan).
- [ ] No secrets or protected data appear in the plans or responses, and no payment, delivery, or messaging records are added (BR-13, BR-14).

## Verification

Run from the repository root:

```sh
for f in docs/workflows.md docs/business-rules.md docs/data-model.md docs/api-plan.md; do test -f "$f" && grep -q 'Review pack cross-check' "$f" || exit 1; done && grep -cE '^- \[ \]' docs/sprint-1-review.md
```

Expected output: `8`. Then open each linked document to confirm the summary, out-of-scope list, and checklist items above match the detailed plan.
