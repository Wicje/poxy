# API Route Plan

This plan defines the core catalogue and ordering routes before any implementation. Route names use plural nouns, lowercase paths, `{product_id}` placeholders, `PATCH` for partial changes, and an explicit `/deactivate` action for state changes. Seller identity comes from the signed-in session, never from the request body. No authentication, payment, delivery, or messaging routes are in scope.

| Method | Path | Purpose | Who can use it | Request data | Success | Likely errors |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/products` | Create a product owned by the signed-in seller | Signed-in seller | Body: `{ "product_name": "Bread", "description": "Loaf", "price": 5, "stock_quantity": 12 }` | `201 Created` with `product` including `product_id`, `seller_id`, `is_active` | `400` invalid fields; `401` not signed in |
| PATCH | `/products/{product_id}` | Change an owned product's editable fields | Signed-in seller who owns the product | Path `product_id`; body with any of `product_name`, `description`, `price`, `stock_quantity` | `200 OK` with updated `product` | `400` invalid fields; `401` not signed in; `404` missing or not owned |
| PATCH | `/products/{product_id}/deactivate` | Mark an owned product inactive without deleting it | Signed-in seller who owns the product | Path `product_id`; no body | `200 OK` with `product` showing `is_active: false` | `401` not signed in; `404` missing or not owned; `409` already inactive |
| GET | `/products` | Browse active products | Public (no sign-in) | Query: optional `q`, `seller_id`, `limit`, `offset` | `200 OK` with `products` array and `total` | `400` invalid query values |
| GET | `/products/{product_id}` | View one active product | Public (no sign-in) | Path `product_id` | `200 OK` with `product` and its seller display name | `404` missing or inactive |
| POST | `/orders` | Submit an order with one or more items | Customer-facing; identifies one customer, no seller session | Body: `{ "customer": { "customer_name": "Ada", "contact": "ada@example.test" }, "items": [ { "product_id": 1, "quantity": 2 } ] }` | `201 Created` with `order` (`order_id`, `order_total`, `items` with `unit_price`) | `400` empty or invalid items/customer; `404` product missing or inactive; `409` insufficient stock |

## Response conventions

- A `product` object uses the ERD field names: `product_id`, `seller_id`, `product_name`, `description`, `price`, `stock_quantity`, `is_active`. Public product responses include only the seller display name as seller identity, never credentials or private account fields (BR-14).
- An `order` object contains `order_id`, `customer_id`, `order_total`, and `items`; each item contains `order_item_id`, `product_id`, `quantity`, and `unit_price`. Responses show only the submitting customer's data and no payment or delivery fields (BR-13).
- Errors use `{ "error": { "code": "VALIDATION_ERROR", "message": "..." } }`. Messages must not include stack traces, secrets, tokens, or protected data from other records.
- `404` is used for a product that is missing, inactive, or owned by another seller so that product ownership is not revealed to unauthorized callers (BR-02, BR-07, BR-14).

## Consistency checks against the rules

- Seller write routes require a signed-in seller; ownership is checked from the stored `product.seller_id`, not from request data (BR-01, BR-02, BR-09).
- Product create and change validate `price > 0` and non-negative integer `stock_quantity`; deactivation only flips `is_active` (BR-06, BR-08).
- Browse and detail expose active products only; an inactive product is reported as `404` (BR-07).
- Order submission requires one or more items, checks each product's active state and stock, copies `product.price` into `unit_price`, and ignores any client-supplied price or owner; a failed item rejects the whole order (BR-05, BR-10, BR-11, BR-12, BR-15).
- `seller_id` in `GET /products` is only an optional filter; it does not bypass the active-only rule or expose another seller's private data.

## Verification

Run:

```sh
grep -cE '^\| (GET|POST|PATCH) ' docs/api-plan.md
```

Expected count: 6 routes. Then read the table to confirm each row has a method, path, purpose, permitted user, request data, success status, and likely error status, and that the route set covers product create/change/deactivate, public browse/detail, and order submission.
