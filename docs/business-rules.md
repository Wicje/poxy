# Core Business Rules

These rules define what the backend must enforce before routes or database tables are built. They are the source of truth for validation and access control and must be enforced even when a client tries to bypass the UI. Scope is limited to `seller`, `product`, `customer`, `order`, and `order item`; payments, delivery tracking, messaging, and other future features are out of scope. See `docs/workflows.md` for the journeys these rules support.

## Access and ownership

### BR-01 - Product writes require a signed-in seller
- Rule: The backend must require a signed-in `seller` before creating, changing, or deactivating a `product`.
- Records: `seller`, `product`.
- Valid: Signed-in seller A creates a product owned by A.
- Invalid: An anonymous request creates a product, or seller A saves a change while signed out.

### BR-02 - Sellers only act on their own products
- Rule: A seller must not change or deactivate a `product` whose stored owner is a different `seller`, even if the request includes another owner id.
- Records: `seller`, `product`.
- Valid: Seller A deactivates product P owned by A.
- Invalid: Seller A edits product Q owned by seller B, or passes `owner: A` for Q to try to take ownership.

### BR-03 - Product reading is public
- Rule: Browsing and viewing active products must not require sign-in.
- Records: `product`, `seller`.
- Valid: A visitor opens the product list and one product detail without an account.
- Invalid: The backend returns 401 for a public product list request.

### BR-04 - Orders identify a customer, not a seller session
- Rule: Submitting an `order` must be linked to exactly one `customer` and must not require a signed-in `seller`.
- Records: `customer`, `order`.
- Valid: Customer C submits an order linked to C.
- Invalid: An order is created with no customer, or the API demands seller credentials from the shopper.

### BR-05 - Order item values come from stored products
- Rule: When creating an `order item`, the backend must not trust client-supplied owner, price, stock, or active status; it must read those values from the stored `product`.
- Records: `product`, `order item`.
- Valid: Customer picks product P at the stored price of 10; the item records 10.
- Invalid: Client sends `price: 1` or `owner: sellerB` for P and the backend accepts it.

## Product validity

### BR-06 - Product fields must be valid
- Rule: Every `product` must have exactly one owning `seller`, a non-empty name, a price greater than zero, and a non-negative integer stock quantity.
- Records: `seller`, `product`.
- Valid: Product P has seller A, name "Bread", price 5, stock 12.
- Invalid: Product P has no seller, an empty name, price -1, or stock 2.5.

### BR-07 - Only active products are visible and orderable
- Rule: A `product` must have an active state, and only active products must appear in browse or detail results or be added to an `order`.
- Records: `product`, `order item`.
- Valid: Active product P is listed and can be ordered.
- Invalid: An inactive product P is listed, shown by id, or accepted in an order.

### BR-08 - Deactivation must not delete records
- Rule: Deactivating a `product` must not delete the `product`, its `seller`, or any existing `order item`.
- Records: `seller`, `product`, `order item`.
- Valid: Seller A deactivates P; P stays in the seller list as inactive and past items still reference P.
- Invalid: Deactivation removes P's row or erases an `order item` that referenced P.

### BR-09 - Changing a product must not transfer ownership
- Rule: A product change must not change the stored owner of that `product`.
- Records: `seller`, `product`.
- Valid: Seller A updates P's price; P remains owned by A.
- Invalid: An update request sets P's owner to seller B and the backend applies it.

## Order validity

### BR-10 - An order must contain items
- Rule: An `order` must have one or more `order item` records; an empty order must not be created.
- Records: `order`, `order item`.
- Valid: Customer C orders two products and gets two items.
- Invalid: Customer C submits a cart with no items and an order is created.

### BR-11 - Order items must be available
- Rule: Each `order item` must reference one active `product` and a positive integer quantity that does not exceed that product's stock at submission time.
- Records: `product`, `order item`.
- Valid: P has stock 3; customer orders quantity 2.
- Invalid: P has stock 1 or is inactive; customer orders quantity 2 and the backend accepts it.

### BR-12 - Order item prices are snapshots
- Rule: Each `order item` must store the `product` price at order time; later product changes must not alter that item or the historical order total.
- Records: `product`, `order item`, `order`.
- Valid: P costs 10 at order time; later the seller sets P to 12; the old item still records 10.
- Invalid: A price change rewrites the price of an already submitted item.

## Safety and failure handling

### BR-13 - Scope must stay limited
- Rule: Order submission must not create payment, delivery tracking, or messaging records, and must not expose another customer's `order` data.
- Records: `customer`, `order`.
- Valid: Confirmation lists only the submitting customer's items and total.
- Invalid: The response includes another customer's order or a payment record.

### BR-14 - Responses must not expose protected data
- Rule: Public and customer-facing responses must not expose seller credentials, private account fields, or secrets; public product views may show only the seller identity needed to attribute the product.
- Records: `seller`, `product`, `customer`.
- Valid: Product detail shows seller display name.
- Invalid: Product detail returns the seller's password hash, email, or a token.

### BR-15 - Invalid input must not partially write data
- Rule: If any part of a request fails validation, the backend must reject the whole request without creating or modifying any `product`, `customer`, `order`, or `order item`.
- Records: `product`, `customer`, `order`, `order item`.
- Valid: A two-item order passes every check and both items are created.
- Invalid: One item is inactive; the order and its valid item are both rejected, with no records written.

## Verification

No routes or tables exist yet, so check the document:

```sh
grep -cE '^### BR-[0-9]+' docs/business-rules.md
grep -cE '^- (Valid|Invalid):' docs/business-rules.md
```

Expected counts: 15 rules and 30 example lines. Then read each block to confirm it has a `must`/`must not` rule, a `Records:` line, and both a valid and an invalid example.

## Review pack cross-check

This document is part of the Sprint 1 review pack: [sprint-1-review.md](./sprint-1-review.md). It defines ownership (BR-01, BR-02, BR-09), product availability (BR-07), positive quantity (BR-11), server-calculated totals (BR-05, BR-12), and all-or-nothing order saving (BR-15) used by the review checklist.
