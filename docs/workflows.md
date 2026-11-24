# Marketplace User Journeys

Scope: seller accounts, products, customers, orders, and order items only. Payments, delivery tracking, messaging, and other future features are out of scope. Each numbered journey starts with a user action and ends with the expected result.

Access labels used in every numbered step:

- `[Signed-in seller]` - the request requires an authenticated seller session, and the seller may only act on products they own.
- `[Public]` - no sign-in is required.
- `[Customer-facing]` - used by a shopper; no seller sign-in is required. Submitting an order must identify a `customer` record.

## Seller journey: create a product

Records involved: `seller`, `product`.

1. `[Signed-in seller]` The seller signs in and opens the "Add product" form. (`seller`)
2. `[Signed-in seller]` The seller enters a name, description, price, stock quantity, and submits the form. (`seller`, `product` input)
3. `[Signed-in seller]` The system validates the input, creates a `product` owned by that `seller`, and marks it active. (`seller`, `product`)
4. Expected result: the new `product` appears in the seller's own product list and in public browsing, and no other seller can change it. (`seller`, `product`)

## Seller journey: change a product

Records involved: `seller`, `product`.

1. `[Signed-in seller]` The seller opens their product list and selects a product they own. (`seller`, `product`)
2. `[Signed-in seller]` The seller edits the allowed fields (name, description, price, stock quantity) and saves. (`product`)
3. `[Signed-in seller]` The system checks that the signed-in `seller` owns the `product`, validates the new values, and updates that `product` only. (`seller`, `product`)
4. Expected result: the updated product details are shown in the seller's list and in public browsing; a missing product or a product owned by another seller is rejected without changes. (`seller`, `product`)

## Seller journey: deactivate a product

Records involved: `seller`, `product`.

1. `[Signed-in seller]` The seller selects one of their active products and chooses "Deactivate". (`seller`, `product`)
2. `[Signed-in seller]` The seller confirms the change. (`product`)
3. `[Signed-in seller]` The system checks ownership, then marks the `product` inactive without deleting it. (`seller`, `product`)
4. Expected result: the product no longer appears in public browsing or product detail, while the seller's record and any existing order items stay unchanged. (`seller`, `product`)

## Customer journey: browse products

Records involved: `product`, `seller` (as product owner).

1. `[Public]` The customer opens the product list. (`product`)
2. `[Public]` The system returns only active products, with the seller identity each product belongs to. (`product`, `seller`)
3. Expected result: the customer sees the available products and can choose one to view; deactivated products are absent. (`product`, `seller`)

## Customer journey: view one product

Records involved: `product`, `seller`.

1. `[Public]` The customer selects a product from the list. (`product`)
2. `[Public]` The system returns that active product's details and its seller. (`product`, `seller`)
3. Expected result: the customer can read the name, description, price, and stock before ordering; a missing or inactive product is reported as unavailable. (`product`, `seller`)

## Customer journey: submit an order with items

Records involved: `customer`, `product`, `order`, `order item`, `seller` (as product owner).

1. `[Customer-facing]` The customer selects one or more active products and a quantity for each. (`product`)
2. `[Customer-facing]` The customer supplies their customer details and submits the order. (`customer`, `order` input)
3. `[Customer-facing]` The system verifies that every selected `product` is active and has enough stock, then creates an `order` for the `customer` and one `order item` per selected product. (`customer`, `product`, `order`, `order item`)
4. Expected result: the customer sees an order confirmation listing the order items and total; the products remain owned by their sellers, and no payment or delivery step is created. (`customer`, `order`, `order item`, `seller`)

## Failure cases to preserve

- A request without a signed-in seller is rejected for create, change, and deactivate.
- A signed-in seller cannot change or deactivate a product owned by another seller.
- Inactive or missing products cannot be viewed or added to an order.
- An empty order, a non-positive quantity, invalid input, or insufficient stock is rejected without creating an `order` or `order item`.
- Only the fields described above are accepted; no secrets, credentials, or protected data are returned by these journeys.

## Verification

No application code exists yet, so the practical check is a document review. Run:

```sh
grep -nE 'Expected result:|Records involved:|\[Signed-in seller\]|\[Public\]|\[Customer-facing\]' docs/workflows.md
```

Confirm the output includes all six numbered journeys (three seller, three customer), each with a `Records involved:` line, at least one access label per step, and an `Expected result:` line as its final step. Then read the failure cases list to confirm it matches the journeys above.

## Review pack cross-check

This document is part of the Sprint 1 review pack: [sprint-1-review.md](./sprint-1-review.md). It supplies the seller create/change/deactivate and customer browse/view/order journeys, and states that product writes require a signed-in seller while catalogue reading is public.
