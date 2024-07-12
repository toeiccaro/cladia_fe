<template>
  <div>
    <LatestNotification
      :data-approval-pending="dataAllApprovalPending"
      :data-promise-date-sale="dataPromiseDateSale"
      :data-promise-date-purchase="dataPromiseDatePurchase"
      :data-promise-date-outward="dataPromiseDateOutward"
      :data-promise-date-production="dataPromiseDateProduction"
      :list-check-box-config="listCheckBoxConfig"
      @emitDatePickerId="dataPromiseDate"
    />
    <ListCheckBoxShowCard
      :layout="defaultLayout"
      :list-check-box-config="listCheckBoxConfig"
      @dashboard-config="handleDashboardConfig"
    />
    <GridLayout
      :layout.sync="layout"
      :col-num="12"
      :responsive="true"
      :row-height="1"
      :margin="[10, 10]"
      :is-draggable="true"
      :is-resizable="false"
      :is-mirrored="false"
      :vertical-compact="true"
      :use-css-transforms="true"
    >
      <GridItem
        v-for="item in layout"
        :key="item.i"
        :x="item.x"
        :y="item.y"
        :w="
          item.i === DASHBOARD_CARDS_ID.GRAPH_MONTHLY_SALES_ORDER ||
          item.i === DASHBOARD_CARDS_ID.GRAPH_MONTHLY_SALES_INVOICE
            ? 12
            : 3
        "
        :h="item.h"
        :i="item.i"
        drag-ignore-from=".no-drag"
        :class="`${promiseDateCardId === item.i ? 'border-animated' : ''}`"
        @moved="movedEvent"
      >
        <CardPlanToday
          v-if="
            item.component === 'CardPlanToday' &&
            item.i === DASHBOARD_CARDS_ID.TODAY_EVENTS
          "
          :show="!!item.isShow"
          :data="dataPlanToday"
          @sortPlan="getPlanToday"
          @actionShow="handleActionShow"
        />
        <CardRequestCheck
          v-if="
            item.component === 'CardRequestCheck' &&
            item.i === DASHBOARD_CARDS_ID.APPROVAL_PENDING
          "
          ref="cardRequestCheck"
          :page-i-d="paramsUnCheck.pageName"
          :show="!!item.isShow"
          :options="approvalPendingOptions"
          :data="dataOrderUnCheck"
          @changeData="getOrderUnCheckFromApi"
          @actionShow="handleActionShow"
        />
        <CardCommonPromiseDate
          v-if="
            item.component === 'PromiseDateSales' &&
            item.i === DASHBOARD_CARDS_ID.PROMISE_DATE_SALES
          "
          id="promiseDateSale"
          ref="promise-date-sale"
          :show="!!item.isShow"
          :title="$t('lbl_PromiseDateSales_0')"
          :data="dataPromiseDateSale"
          type="PromiseSale"
          @changeDataDate="getDataPromiseDateSale"
          @actionShow="handleActionShow"
        />
        <CardCommonPromiseDate
          v-if="
            item.component === 'PromiseDatePurchase' &&
            item.i === DASHBOARD_CARDS_ID.PROMISE_DATE_PURCHASE
          "
          id="promiseDatePurchase"
          ref="promise-date-purchase"
          :show="!!item.isShow"
          :title="$t('lbl_PromiseDatePurchase_0')"
          :data="dataPromiseDatePurchase"
          type="PromisePurchase"
          @changeDataDate="getDataPromiseDatePurchase"
          @actionShow="handleActionShow"
        />
        <CardCommonPromiseDate
          v-if="
            item.component === 'PromiseDateProduction' &&
            item.i === DASHBOARD_CARDS_ID.PROMISE_DATE_PRODUCTION
          "
          id="promiseDateProduction"
          ref="promise-date-production"
          :show="!!item.isShow"
          :title="$t('lbl_PromiseDateProduction_0')"
          :data="dataPromiseDateProduction"
          type="PromiseProduction"
          @changeDataDate="getDataPromiseDateProduction"
          @actionShow="handleActionShow"
        />
        <CardCommonPromiseDate
          v-if="
            item.component === 'PromiseDateOutward' &&
            item.i === DASHBOARD_CARDS_ID.PROMISE_DATE_OUTWARD
          "
          id="promiseDateOutward"
          ref="promise-date-outward"
          :show="!!item.isShow"
          :title="$t('lbl_PromiseDateOutward_0')"
          :data="dataPromiseDateOutward"
          type="PromiseOutward"
          @changeDataDate="getDataPromiseDateOutward"
          @actionShow="handleActionShow"
        />
        <CardGraphOrder
          v-if="
            item.component === 'CardGraphOrder' &&
            item.i === DASHBOARD_CARDS_ID.GRAPH_MONTHLY_SALES_ORDER
          "
          :data="dataRevenueSaleOrder"
          :show="!!item.isShow"
          @actionShow="handleActionShow"
        />
        <CardGraphInvoice
          v-if="
            item.component === 'CardGraphInvoice' &&
            item.i === DASHBOARD_CARDS_ID.GRAPH_MONTHLY_SALES_INVOICE
          "
          :data="dataRevenueSaleInvoice"
          :show="!!item.isShow"
          @actionShow="handleActionShow"
        />
      </GridItem>
    </GridLayout>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import CardPlanToday from './CardPlanToday.vue'
import CardGraphOrder from './CardGraphOrder.vue'
import CardGraphInvoice from './CardGraphInvoice.vue'
import CardRequestCheck from './CardRequestCheck.vue'
import CardCommonPromiseDate from './CardCommonPromiseDate.vue'
import ListCheckBoxShowCard from './ListCheckBoxShowCard.vue'
// import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import LatestNotification from './LatestNotification.vue'
import api from '@/api/api'
import dateTime from '~/mixins/dateTime'
import { DASHBOARD_CARDS_ID } from '~/constants'
export default {
  name: 'IndexDashBoard',
  components: {
    CardPlanToday,
    CardGraphOrder,
    CardGraphInvoice,
    CardRequestCheck,
    CardCommonPromiseDate,
    // BaseLoading,
    ListCheckBoxShowCard,
    LatestNotification,
  },
  mixins: [dateTime],
  data() {
    return {
      paramsUnCheck: {
        sortType: 'desc',
        pageName: 2,
      },
      dataOrderUnCheck: [],
      dataPlanToday: [],
      loading: false,
      dateToday: this.convertDate(new Date()),
      dataPromiseDateSale: [],
      dataPromiseDatePurchase: [],
      dataPromiseDateOutward: [],
      dataPromiseDateProduction: [],
      dataRevenueSaleOrder: [],
      dataRevenueSaleInvoice: [],
      dataTaskToday: [],
      listCheckBoxShowCard: [],
      DASHBOARD_CARDS_ID,
      layout: [],
      defaultLayout: [],
      approvalPendingOptions: [],
      promiseDateCardId: null,
      listCheckBoxConfig: [],
      dataAllApprovalPending: [],
    }
  },
  async fetch() {
    try {
      this.loading = true
      await Promise.all([
        this.getListCardPositions(),
        this.getApprovalPendingOptions(),
        this.getListCheckBoxConfig(),
        this.getDataAllApprovalPending(),
        this.getPlanToday(),
        this.getDataPromiseDateSale(),
        this.getDataPromiseDatePurchase(),
        this.getDataRevenueSaleOrder(),
        this.getDataRevenueSaleInvoice(),
        this.getDataTaskToday(),
        this.getDataPromiseDateOutward(),
        this.getDataPromiseDateProduction(),
      ])
    } catch (error) {
    } finally {
      this.loading = false
    }
  },
  computed: {
    ...mapGetters({
      userInfo: 'getUserInfo',
    }),
  },
  watch: {
    layout: {
      handler(value) {},
      deep: true,
    },
    approvalPendingOptions: {
      async handler(value) {
        if (value && value.length > 0) {
          this.paramsUnCheck.pageName = value[0]?.value
          await this.getOrderUnCheckFromApi(this.paramsUnCheck)
        }
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    async getListCheckBoxConfig() {
      try {
        const response = await api('getListConfigDashboard')
        if (response.status === 200) {
          this.listCheckBoxConfig = response.data
        }
      } catch (error) {
        throw new Error(error)
      }
    },

    // click "Check now" if card is not checked then show the card
    dataPromiseDate(data) {
      const newLayout = this.layout.map((card) => {
        // update to show full height of card after click check now
        if (card.i === data) {
          card.h = 24
          card.isShow = 1
          card.isCheck = 1
        }
        return { ...card }
      })
      this.layout = newLayout

      // get list checkbox is checked
      const listCheckBox = this.listCheckBoxConfig
        .filter((item) => !!item.isShow)
        .map((item) => item.pageID)

      if (!listCheckBox.includes(data)) {
        // set checkbox is checked if click check now
        this.listCheckBoxConfig = this.listCheckBoxConfig.map((item) => {
          if (item.pageID === data) {
            return { ...item, isShow: 1 }
          }
          return item
        })
        // get card is hidden and push it into the layout to show the card
        const newLayout = this.defaultLayout
          .filter((layout) => Number(layout.i) === data)
          .map((card) => {
            return {
              ...card,
              isShow: 1,
              isCheck: 1,
              h: 24,
            }
          })

        this.layout.push(newLayout[0])
      }
      this.promiseDateCardId = data
      // after 3s, set promiseDateCardId = null to enable border animation
      setTimeout(() => {
        this.promiseDateCardId = null
      }, 3000)
      this.updateDashboardPosition(this.layout)
    },
    movedEvent() {
      this.updateDashboardPosition(this.layout)
    },

    handleActionShow(data) {
      // handle expand card
      const newLayout = []
      this.layout.map((widget) => {
        // update height of the card layout after click arrow icon
        if (widget.component === data.cardName && !data.active) {
          widget.h = 4
          widget.isShow = 0
        } else if (data.active && widget.component === data.cardName) {
          if (
            data.cardName === 'CardGraphOrder' ||
            data.cardName === 'CardGraphInvoice'
          ) {
            widget.h = 52
            widget.isShow = 1
          } else {
            widget.h = 24
            widget.isShow = 1
          }
        }
        newLayout.push(widget)
        return { ...widget }
      })
      // update layout after height is changed
      this.updateDashboardPosition(newLayout)
      this.layout = newLayout
    },

    handleDashboardConfig(data) {
      // handle to show card, if card is checked then show card else splice the card is unchecked
      const listId = this.layout.map((item) => Number(item.i))
      if (listId.includes(data.pageID) && !data.isShow) {
        const index = listId.indexOf(data.pageID)
        this.layout.splice(index, 1)
      } else {
        const newLayout = this.defaultLayout.filter(
          (layout) => Number(layout.i) === data.pageID
        )
        this.layout.push(newLayout[0])
      }
    },

    // get list layout
    async getListCardPositions() {
      const response = await api('getListDashboardPosition')
      const data = response?.data
      this.layout = data.filter((item) => item.isCheck !== 0)
      this.defaultLayout = response?.data
    },

    // update new position of card
    async updateDashboardPosition(newLayout) {
      const payload = {
        userID: this.userInfo.loginID,
        dashboardRequestList: newLayout,
      }
      await api('updateDashboardPosition', payload)
      // if layout is default layout => call api getList to get id
      if (this.layout.map((layout) => layout.id === 0)[0] === 0) {
        this.getListCardPositions()
      }
    },
    async getDataAllApprovalPending() {
      try {
        const response = await api('getAllApprovalPending')
        if (response.status === 200) {
          this.dataAllApprovalPending = response.data
        }
      } catch (error) {
        throw new Error(error)
      }
    },
    async getApprovalPendingOptions() {
      try {
        const res = await api('getApprovalPendingOptions')
        if (res.status === 200) {
          this.approvalPendingOptions = res.data
        }
      } catch (error) {
        throw new Error(error)
      }
    },
    async getPlanToday(sortType) {
      const paramsRequest = sortType ?? 'desc'
      const response = await api('getPlanDashboard', paramsRequest)
      this.dataPlanToday = response?.data || []
    },
    async getOrderUnCheckFromApi(params) {
      // const paramsRequest = params ?? this.paramsUnCheck
      const response = await api('getOrderUnCheck', params)
      this.dataOrderUnCheck = response?.data || []
    },
    async getDataPromiseDateSale(date) {
      const paramsRequest = date ?? this.dateToday
      const response = await api('getPromiseDateSales', paramsRequest)
      this.dataPromiseDateSale = response?.data || []
    },
    async getDataPromiseDatePurchase(date) {
      const paramsRequest = date ?? this.dateToday
      const response = await api('getPromiseDatePurchase', paramsRequest)
      this.dataPromiseDatePurchase = response?.data || []
    },
    async getDataPromiseDateOutward(date) {
      const paramsRequest = date ?? this.dateToday
      const response = await api('getPromiseDateOutward', paramsRequest)
      this.dataPromiseDateOutward = response?.data || []
    },
    async getDataPromiseDateProduction(date) {
      const paramsRequest = {
        date: date ?? this.dateToday,
        language: this.$i18n.locale,
      }
      const response = await api('getPromiseDateProduction', paramsRequest)
      this.dataPromiseDateProduction = response?.data || []
    },
    async getDataRevenueSaleOrder() {
      const response = await api('getRevenueSaleOrder')
      this.dataRevenueSaleOrder = response?.data || []
    },
    async getDataRevenueSaleInvoice() {
      const response = await api('getRevenueSaleInvoice')
      this.dataRevenueSaleInvoice = response?.data || []
    },
    async getDataTaskToday() {
      const response = await api('getTaskToday')
      this.dataTaskToday = response?.data || []
    },
  },
}
</script>
<style lang="scss" scoped>
@keyframes kf2 {
  0% {
    border-width: 2px;
    border-color: red;
  }
  to {
    border-width: 4px;
    border-color: red;
  }
}

.border-animated {
  animation-name: kf2;
  animation-duration: 3s;
  // border: 1px solid #aaa !important;
  // animation-iteration-count: infinite;
}

.dashboard-content {
  margin: 0px 16px 32px;
  .dashboard-group-card {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 16px;
  }
}

.vue-grid-item {
  border: 1px solid #aaa;
}

.vue-grid-item.vue-grid-placeholder {
  background: red !important;
}
</style>
