// Generated from this repository's contract snapshots; do not edit.
// Draft enum/envelope baseline only. Endpoint DTOs and runtime validation remain planned.
export type OrderStatus = "placed" | "assignment_pending" | "partner_assigned" | "partner_accepted" | "traveling_to_market" | "shopping" | "shopping_review" | "purchased" | "out_for_delivery" | "delivered" | "cancelled" | "exception";
export type PaymentMethod = "COD" | "ONLINE";
export type PaymentStatus = "initiated" | "pending" | "verified" | "paid" | "failed" | "expired" | "refund_pending" | "partially_refunded" | "refunded";
export type CodStatus = "to_collect" | "collected" | "remittance_pending" | "remitted" | "disputed";
export type SettlementStatus = "estimated" | "earned" | "approved" | "paid" | "disputed";
export type Unit = "G" | "KG" | "ML" | "L" | "PIECE" | "BUNCH";
export type BackendEventType = "order.stage_changed" | "catalogue.changed" | "serviceability.changed" | "cart.changed" | "partner.offer_created" | "partner.offer_expired" | "order.substitution_requested" | "order.substitution_decided" | "order.receipt_confirmed" | "payment.status_changed" | "finance.ledger_changed";
export interface BackendEventEnvelope {
  eventId: string;
  aggregateType: string;
  aggregateId: string;
  seq: number;
  type: BackendEventType;
  occurredAt: string;
  payload: unknown; // Narrow and runtime-validate per event before use.
}
