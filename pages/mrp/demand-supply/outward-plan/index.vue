<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <TableOutwardPlan
      ref="tableOutwardPlan"
      :label-mapping="labelMapping"
      @changeLayout="changeLayout"
    />
    <div
      v-if="loading"
      class="spinner content d-flex justify-content-center align-items-center"
    >
      <b-spinner
        b-spinner
        style="width: 3rem; height: 3rem"
        label="Loading..."
      ></b-spinner>
    </div>
  </div>
</template>

<script>
import { uniqBy, map, cloneDeep } from 'lodash'
import { mapGetters, mapMutations } from 'vuex'
import {
  TOOLBAR_KEYS,
  TOOLBAR_TYPE,
  SERVER_RESPONSE_CODE,
  ITEM_UNIT,
} from '@/constants'
import api from '@/api/api'
import { downloadFileExcel } from '@/utils/utils'
import ToolBar from '@/components/UI/ToolBar'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import TableOutwardPlan from '@/components/MRP/DemandSupply/OutwardPlan/TableOutwardPlan'

export default {
  name: 'OutwardPlan',
  components: { TableOutwardPlan, ToolBar, BaseValidateMessage },
  data() {
    return {
      loading: false,
      listToolBars: [
        {
          key: TOOLBAR_KEYS.SET,
          label: this.$t('btn_btnGenerateOrder_0'),
          icon: '/images/set.png',
        },
        {
          key: TOOLBAR_KEYS.REFRESH,
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: TOOLBAR_KEYS.EXPORT,
          label: this.$t('btn_btnExport_0'),
          icon: '/images/export.png',
          type: TOOLBAR_TYPE.MENU,
          items: [
            {
              text: 'btn_btnPaged_0',
              action: () => this.exportByPage(),
            },

            {
              text: 'btn_btnFiltered_0',
              action: () => this.exportAll(),
            },
          ],
        },
        {
          key: TOOLBAR_KEYS.SAVE,
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: TOOLBAR_KEYS.CLOSE,
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      listErrorMessage: [],
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      payloadOutwardPlan: 'filterSort/getPayloadOutwardPlan',
      outwardPlanTotalPages: 'mrp/getOutwardPlanTotalPages',
      outwardPlanMemos: 'mrp/getOutwardPlanMemos',
      generatedOutwardOrder: 'mrp/getGeneratedOutwardOrder',
    }),
    labelMapping() {
      return {
        MrpID: this.$t('lbl_MrpID_0'),
        MRPOrderType: this.$t('lbl_MRPOrderType_0'),
        OrderNO: this.$t('lbl_OrderNO_0'),
        CreateOrderNO: this.$t('lbl_CreateOrderNO_0'),
        CreateOrderLineNO: this.$t('lbl_CreateOrderLineNO_0'),
        MRPRelateOrderNO: this.$t('lbl_MRPRelateOrderNO_0'),
        MRPLineID: this.$t('lbl_MRPLineID_0'),
        ItemCode: this.$t('lbl_ItemCode_0'),
        SafeQty: this.$t('lbl_SafeQty_0'),
        DemandQty: this.$t('lbl_DemandQty_0'),
        SupplyQty: this.$t('lbl_SupplyQty_0'),
        StockQty: this.$t('lbl_StockQty_0'),
        PlannedQty: this.$t('lbl_PlannedQty_0'),
        NeedQty: this.$t('lbl_NeedQty_0'),
        NeedDays: this.$t('lbl_NeedDays_0'),
        MRPSupplierName: this.$t('lbl_MRPSupplierName_0'),
        Memo: this.$t('lbl_Memo_0'),
        MRPSDStartDate: this.$t('lbl_MRPSDStartDate_0'),
        MRPSDEndDate: this.$t('lbl_MRPSDEndDate_0'),
        LeadTime: this.$t('lbl_LeadTime_0'),
        ItemName: this.$t('lbl_ItemName_0'),
      }
    },
    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        if (item.key === TOOLBAR_KEYS.EXPORT) {
          const hasManyPages = this.outwardPlanTotalPages > 1
          const exportItems = hasManyPages
            ? [
                {
                  text: 'btn_btnPaged_0',
                  action: () => this.exportByPage(),
                },

                {
                  text: 'btn_btnFiltered_0',
                  action: () => this.exportAll(),
                },
              ]
            : [
                {
                  text: 'btn_btnPaged_0',
                  action: () => this.exportByPage(),
                },
              ]
          item.items = exportItems
          item.disabled = !this.activeButtonToolBar?.isExport
        }
        return item
      })
    },
  },
  watch: {
    'dataLayout.headerData': {
      immediate: true,
      deep: true,
      handler(val) {
        this.listColumnChange = []
        this.dataLayout?.headerData?.forEach((item, index) => {
          this.listDataColumn.forEach((_el) => {
            if (item.fieldName === _el.fieldName) {
              this.listColumnChange.push({
                fieldWide: item.width.toString(),
                fieldName: item.fieldName,
                fieldKey: item.key,
                id: _el.id,
                fieldOrder: index - 1,
                gridName: _el.gridName,
                hidden: _el.hidden,
                loginId: _el.loginId,
              })
            }
          })
        })
      },
    },
  },
  methods: {
    ...mapMutations({
      SET_GENERATED_OUTWARD_ORDER: 'mrp/SET_GENERATED_OUTWARD_ORDER',
    }),
    changeActiveToolBar(key) {
      switch (key) {
        case TOOLBAR_KEYS.SET:
          return this.handleCreateOrder()
        case TOOLBAR_KEYS.REFRESH:
          return location.reload()
        case TOOLBAR_KEYS.SAVE:
          this.handleSave()
          return
        case TOOLBAR_KEYS.CLOSE:
          return this.$router.push(this.localePath({ path: '/' }))
        default:
          break
      }
    },
    changeLayout(data, listDataColumn) {
      this.dataLayout = data
      this.listDataColumn = listDataColumn
    },
    handleCreateOrder() {
      this.SET_GENERATED_OUTWARD_ORDER(null)
      const listCheckbox = this.$refs.tableOutwardPlan?.listCheckbox || []
      const hasNoSelected = listCheckbox.every((item) => !item.value)
      if (hasNoSelected) return window.alert(this.$t('msg_NoSelected_0'))

      const checkedRecords = listCheckbox.filter((item) => item.value)
      const payload = {
        isUsingMoq: false,
        isCombineDetail: false,
        outwardPlanDetail: checkedRecords,
      }

      // get moq for each item
      const selectedItems = uniqBy(checkedRecords, 'itemID').map((item) => ({
        itemID: item.itemID,
        needQty: 0,
        moq: item.moq,
      }))
      // calc total needQty for each item
      selectedItems.forEach((item) => {
        checkedRecords.forEach((el) => {
          if (item.itemID === el.itemID) {
            item.needQty += el.needQty
          }
        })
      })

      const hasNeedQtyLessMOQ = selectedItems.some(
        (item) => item.needQty < item.moq
      )
      if (hasNeedQtyLessMOQ) {
        const confirmGenerateUseMOQ = window.confirm(
          this.$t('msg_ConfirmGenerateWithMOQ_0')
        )
        payload.isUsingMoq = confirmGenerateUseMOQ
      }

      if (checkedRecords.length === 1) return this.onGenerateOrder(payload)
      const hasDiffSuppliers = uniqBy(checkedRecords, 'supplierID').length > 1

      if (!hasDiffSuppliers) {
        return this.validateAndGenerateOrder(checkedRecords, payload)
      }

      const confirmDiffSuppliers = window.confirm(
        this.$t('msg_ConfirmDiffSubcontractor_0')
      )
      if (!confirmDiffSuppliers) return

      return this.validateAndGenerateOrder(checkedRecords, payload)
    },
    async handleSave() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) return

        this.loading = true
        this.listErrorMessage = []
        const hasInvalidMemo = this.outwardPlanMemos.some(
          (item) => item.memo.length > 1000
        )
        if (hasInvalidMemo) {
          this.listErrorMessage.push({
            fieldName: this.$t('lbl_Memo_0'),
            text: this.$t('msg_ValidateMemo_0'),
          })
          return
        }
        const [memoStatus, layoutStatus] = await Promise.all([
          this.updateMemo(),
          this.updateTableLayout(),
        ])
        if (
          memoStatus === SERVER_RESPONSE_CODE.OK &&
          layoutStatus === SERVER_RESPONSE_CODE.OK
        ) {
          window.alert(this.$t('msg_IsSaved_0'))
          this.$refs.tableOutwardPlan.filterAndSort()
        }
      } catch (err) {
        console.log(err)
      } finally {
        this.loading = false
      }
    },
    exportByPage() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      const sortFormOptional = {
        ...this.payloadOutwardPlan,
        language: this.$i18n.locale,
        isExportAll: false,
      }
      this.handleExportExcel(sortFormOptional)
    },
    exportAll() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      const sortFilter = this.payloadOutwardPlan
      delete sortFilter.pageNo
      delete sortFilter.pageSize
      const sortFormOptional = {
        ...sortFilter,
        language: this.$i18n.locale,
        isExportAll: true,
      }
      this.handleExportExcel(sortFormOptional)
    },
    async handleExportExcel(payload) {
      const response = await api('exportExcelOutwardPlans', payload)
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },
    async updateTableLayout() {
      try {
        const res = await api('updateColumn', this.listColumnChange)
        return res.status
      } catch (err) {
        console.log(err)
      }
    },
    async updateMemo() {
      try {
        const res = await api('updateOutwardPlans', this.outwardPlanMemos)
        return res.status
      } catch (err) {
        console.log(err)
      }
    },
    async onGenerateOrder(payload) {
      this.loading = true
      this.SET_GENERATED_OUTWARD_ORDER(null)
      try {
        const params = cloneDeep(payload)
        params.outwardPlanDetail = params.outwardPlanDetail.map((item) => {
          delete item.value
          return item
        })
        const hasDecimalPieces = this.hasDecimalPieces(
          params.outwardPlanDetail,
          params.isUsingMoq
        )
        let confirmRoundUpQty = false
        if (hasDecimalPieces) {
          confirmRoundUpQty = window.confirm(
            this.$t('msg_ConfirmRoundUpDecimal_0')
          )
        }
        const res = await api('generateOutwardOrder', params)
        if (
          res?.data?.response?.status === SERVER_RESPONSE_CODE.CONFLICT_ERROR
        ) {
          return window.alert(this.$t(res?.data?.response?.data?.message))
        }

        if (res.status === SERVER_RESPONSE_CODE.OK) {
          const mappingListDetail = Promise.all(
            res.data.detail.map(async (item) => {
              const params = {
                customerID: res.data.supplierID,
                supplierID: res.data.supplierID,
                itemID: item.itemID,
                quantity: item.quantity,
              }
              const price = await this.getPrices(params)
              return {
                ...item,
                price,
                confirmRoundUpQty,
                amount: price * item.quantity,
              }
            })
          )
          const detail = await mappingListDetail

          this.SET_GENERATED_OUTWARD_ORDER({ ...res.data, detail })
          return this.$router.push(
            this.localePath({ path: '/outward/outward-order/add' })
          )
        }
      } catch (err) {
        console.log(err)
      } finally {
        this.loading = false
      }
    },
    hasDuplicate(arr) {
      return new Set(arr).size !== arr.length
    },
    validateAndGenerateOrder(records, payload) {
      let confirmMerge = false
      // checking if list has duplicated item
      if (this.hasDuplicate(map(records, 'itemID'))) {
        confirmMerge = window.confirm(this.$t('msg_ConfirmMergeQuantity_0'))
      }
      payload.isCombineDetail = confirmMerge
      this.onGenerateOrder(payload)
    },
    async getPrices(payload) {
      try {
        const res = await api('getPurchaseOrderPrice', payload)
        if (res.status === SERVER_RESPONSE_CODE.OK) {
          return res.data
        }
        return 0
      } catch (err) {
        console.log(err)
      }
    },
    hasDecimalPieces(listDetails, isUsingMoq) {
      return listDetails.some((item) => {
        const isPieces = item.unit === ITEM_UNIT.PIECES
        let isDecimal = false

        isDecimal = +item.needQty % 1 !== 0
        if (isUsingMoq) {
          isDecimal = +item.moq % 1 !== 0
        }
        return isPieces && isDecimal
      })
    },
  },
}
</script>
