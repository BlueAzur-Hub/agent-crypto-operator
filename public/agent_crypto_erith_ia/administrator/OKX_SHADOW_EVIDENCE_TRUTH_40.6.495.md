# Agent-Crypto 40.6.495 — OKX SHADOW EVIDENCE TRUTH

Parent: **40.6.494**  
Market Core: **38.15.11 — protected**  
Execution Cost Truth: **40.6.492 — unchanged**  
Bridge / Backend: **R18 / V1.9.13 / V1.4.3 — unchanged**

## Purpose

40.6.495 does not change Strategy A business logic. It hardens the passive OKX shadow laboratory so that the evidence can be interpreted per cycle instead of as a floating session summary.

## Changes

- separates **historical Oracle median** from **linked-cycle expected_move_pct**;
- links Auto A measurements to the latest Strategy **cycle_id** when the measurement trigger is an experiment cycle;
- uses the linked-cycle expected move as the laboratory comparator when that link exists, otherwise falls back explicitly to the historical Oracle median;
- distinguishes source quality:
  - FULL_ORDERBOOK_FRESH;
  - PARTIAL_TOP_OF_BOOK_FRESH;
  - STALE_HISTORY;
  - SOURCE_UNAVAILABLE;
- ages the displayed evidence with a bounded 120 s current-view freshness window;
- preserves numeric cost and cost+margin values inside the 24-observation session history;
- exports cycle id, source timestamp, coverage and numeric rows;
- clarifies that **4/4 Post-only = four ticket sizes compared to a fee floor, not four executable opportunities**.

## Protected

No Strategy threshold, Cost Gate, Oracle math, Risk policy, PAPER execution, 40.6.492 measurement logic, Backend, Bridge, Market Core, wallet, API key, real order, persistent storage schema, recurring timer or MutationObserver is changed.
