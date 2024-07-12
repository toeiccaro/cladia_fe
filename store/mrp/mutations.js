export default {
  SET_HISTORY_MEMOS(state, payload) {
    state.historyMemos = payload
  },
  SET_HISTORY_TOTAL_PAGES(state, payload) {
    state.historyTotalPages = payload
  },
  SET_DEMAND_SUPPLY_TOTAL_PAGES(state, payload) {
    state.demandSupplyTotalPages = payload
  },
  SET_DEMAND_SUPPLY_MEMOS(state, payload) {
    state.demandSupplyMemos = payload
  },
  SET_PURCHASE_PLAN_TOTAL_PAGES(state, payload) {
    state.purchasePlanTotalPages = payload
  },
  SET_PURCHASE_PLAN_MEMOS(state, payload) {
    state.purchasePlanMemos = payload
  },
  SET_GENERATED_PURCHASE_ORDER(state, payload) {
    state.generatedPurchaseOrder = payload
  },
  SET_PRODUCT_PLAN_TOTAL_PAGES(state, payload) {
    state.productPlanTotalPages = payload
  },
  SET_PRODUCT_PLAN_MEMOS(state, payload) {
    state.productPlanMemos = payload
  },
  SET_GENERATED_PRODUCTION_ORDER(state, payload) {
    state.generatedProductionOrder = payload
  },
  SET_OUTWARD_PLAN_TOTAL_PAGES(state, payload) {
    state.outwardPlanTotalPages = payload
  },
  SET_OUTWARD_PLAN_MEMOS(state, payload) {
    state.outwardPlanMemos = payload
  },
  SET_GENERATED_OUTWARD_ORDER(state, payload) {
    state.generatedOutwardOrder = payload
  },
}
