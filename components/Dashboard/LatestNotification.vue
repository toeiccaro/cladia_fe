<template>
  <div v-if="listCheckBoxConfig.length > 0" class="box-notification">
    <div v-for="items in listCheckBoxConfig" :key="items.pageID">
      <NotificationItem
        v-if="
          items.isShow &&
          lengthApprovalPending &&
          items.pageID === DASHBOARD_CARDS_ID.APPROVAL_PENDING
        "
        icon="BIconBell"
        :number="lengthApprovalPending"
        :label="$t('lbl_NotificationApprovalPending_0')"
        :card-id="DASHBOARD_CARDS_ID.APPROVAL_PENDING"
        @openApplication="handleOpenAllApplication"
      ></NotificationItem>
      <NotificationItem
        v-if="
          items.isShow &&
          lengthPromiseSale &&
          items.pageID === DASHBOARD_CARDS_ID.PROMISE_DATE_SALES
        "
        icon="BIconBell"
        :number="lengthPromiseSale"
        :label="$t('lbl_NotificationPromiseDateSale_0')"
        :card-id="DASHBOARD_CARDS_ID.PROMISE_DATE_SALES"
        class="mt-2"
        @openApplication="handleOpenAllApplication"
      ></NotificationItem>

      <NotificationItem
        v-if="
          items.isShow &&
          lengthPromisePurchase &&
          items.pageID === DASHBOARD_CARDS_ID.PROMISE_DATE_PURCHASE
        "
        icon="BIconBell"
        :number="lengthPromisePurchase"
        :label="$t('lbl_NotificationPromiseDatePurchase_0')"
        :card-id="DASHBOARD_CARDS_ID.PROMISE_DATE_PURCHASE"
        class="mt-2"
        @openApplication="handleOpenAllApplication"
      ></NotificationItem>

      <NotificationItem
        v-if="
          items.isShow &&
          lengthPromiseOutward &&
          items.pageID === DASHBOARD_CARDS_ID.PROMISE_DATE_OUTWARD
        "
        icon="BIconBell"
        :number="lengthPromiseOutward"
        :label="$t('lbl_NotificationPromiseDateOutward_0')"
        :card-id="DASHBOARD_CARDS_ID.PROMISE_DATE_OUTWARD"
        class="mt-2"
        @openApplication="handleOpenAllApplication"
      ></NotificationItem>
      <NotificationItem
        v-if="
          items.isShow &&
          lengthPromiseProduction &&
          items.pageID === DASHBOARD_CARDS_ID.PROMISE_DATE_PRODUCTION
        "
        icon="BIconBell"
        :number="lengthPromiseProduction"
        :label="$t('lbl_NotificationPromiseDateProduction_0')"
        :card-id="DASHBOARD_CARDS_ID.PROMISE_DATE_PRODUCTION"
        class="mt-2"
        @openApplication="handleOpenAllApplication"
      ></NotificationItem>
    </div>
  </div>
</template>
<script>
import NotificationItem from './NotificationItem.vue'
import { DASHBOARD_CARDS_ID } from '~/constants'
export default {
  components: {
    NotificationItem,
  },
  props: {
    dataApprovalPending: {
      type: Array,
      default: () => [],
    },
    dataPromiseDateSale: {
      type: Array,
      default: () => [],
    },
    dataPromiseDatePurchase: {
      type: Array,
      default: () => [],
    },
    dataPromiseDateOutward: {
      type: Array,
      default: () => [],
    },
    dataPromiseDateProduction: {
      type: Array,
      default: () => [],
    },
    listCheckBoxConfig: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      DASHBOARD_CARDS_ID,
    }
  },
  computed: {
    lengthApprovalPending() {
      return this.dataApprovalPending?.length || 0
    },
    lengthPromiseSale() {
      return this.dataPromiseDateSale?.length || 0
    },
    lengthPromisePurchase() {
      return this.dataPromiseDatePurchase?.length || 0
    },
    lengthPromiseOutward() {
      return this.dataPromiseDateOutward?.length || 0
    },
    lengthPromiseProduction() {
      return this.dataPromiseDateProduction?.length || 0
    },
  },
  methods: {
    handleOpenAllApplication(id) {
      this.$emit('emitDatePickerId', id)
    },
  },
}
</script>
<style lang="scss" scoped>
.box-notification {
  background: #c2d5fc;
  margin: 16px 0;
  padding: 4px 12px;
}
</style>
