<template>
  <div class="add-purchase-order-page">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      :show-border-save="isShowBorderSave"
      :validate="error"
      @changeActiveToolBar="handleAction"
    />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormPurchaseOrder
      ref="formAddOrder"
      :key="refreshAddOrderFormKey"
      :data="form"
      :arrival-addresses="arrivalAddresses"
      @update-table="updateTable"
    />
    <BaseTableItemDetail
      ref="tableDetails"
      class="add-purchase-order-table-details"
      :table-type="'PurchaseOrderDetail'"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :customer-id="form.supplierID"
      :column-hides="columnHides"
      :header-detail="tableHeaders"
      :type-action="'ADD'"
      :new-line="newLine"
      is-purchase
      :show-quantity="true"
      :form="form"
      @changeTable="changeDataTable"
    ></BaseTableItemDetail>
    <ModalImportPurchaseOrder
      ref="importPurchaseOrder"
      :form="form"
      @update-details="handleImportData"
    ></ModalImportPurchaseOrder>
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="pono"
      module-name="POOrder"
    ></BaseModalAttach>
    <base-set-column-detail
      ref="baseSetColumnModal"
      :column-hides="columnHides"
      :get-scolumn-hides="getPODetailColumn"
    ></base-set-column-detail>
    <BaseLoading v-if="loading" />
  </div>
</template>
<script>
import { cloneDeep } from 'lodash'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import ModalImportPurchaseOrder from './Import/ModalImportPurchaseOrder.vue'
import FormPurchaseOrder from './FormPurchaseOrder.vue'
import { SERVER_RESPONSE_CODE, DETAIL_ITEM_TABLE, ITEM_UNIT } from '@/constants'
import { getUnique, formatNumberWithCommas } from '@/utils/utils'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import dateTime from '@/mixins/dateTime'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import systemMixins from '@/mixins/system'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'

export default {
  components: {
    ToolBar,
    FormPurchaseOrder,
    BaseModalAttach,
    BaseValidateMessage,
    ModalImportPurchaseOrder,
    BaseLoading,
    BaseSetColumnDetail,
    BaseTableItemDetail,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      arrivalAddresses: [],
      isShowBorderSave: false,
      initDetailData: {},
      refreshAddOrderFormKey: 0,
      listErrorMessage: [],
      listToolBars: [
        {
          key: 'add',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'save',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'newSave',
          label: this.$t('btn_btnNewSave_0'),
          icon: '/images/new_save.png',
        },
        {
          key: 'import',
          label: this.$t('btn_btnImport_0'),
          icon: '/images/import.png',
        },
        {
          key: 'delete',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
        },
        {
          key: 'refresh',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'check',
          label: this.$t('btn_btnCheck_0'),
          icon: '/images/check.png',
        },
        {
          key: 'unCheck',
          label: this.$t('btn_btnUnCheck_0'),
          icon: '/images/uncheck.png',
        },
        {
          key: 'print',
          label: this.$t('btn_btnPrint_0'),
          icon: '/images/print.png',
        },
        {
          key: 'attach',
          label: this.$t('btn_btnAttach_0'),
          icon: '/images/attach.png',
        },
        {
          key: 'setColumn',
          label: this.$t('btn_btnSet_0'),
          icon: '/images/set.png',
        },
        {
          key: 'back',
          label: this.$t('btn_btnBack_0'),
          icon: '/images/back.png',
        },
        {
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      form: {
        supplierID: null,
      },
      dataTable: [],
      loading: false,
      error: [],
      isAddSuccess: false,
      isNewSave: false,
      columnHides: [],
      listItemCode: [],
    }
  },
  computed: {
    ...mapGetters({
      unitOptions: 'base/getUnitOptions',
      getItemTypeOptions: 'base/getItemTypeOptions',
      generatedPurchaseOrder: 'mrp/getGeneratedPurchaseOrder',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

    itemTypeOptions() {
      return this.getItemTypeOptions.map((item) => ({
        text: this.$t(`${item.text}`),
        value: item.value,
      }))
    },
    newLine() {
      return {
        productName: null,
        unit: null,
        unitID: null,
        quantity: 0,
        price: 0,
        POPriceIncludeDiscount: 0,
        POPriceIncludeTax: 0,
        amount: 0,
        POAmountIncludeTax: 0,
        sono: '',
        solineNumber: null,
        itemCode: '',
        itemId: '',
        description: '',
        promiseDate: this.convertDate(new Date()),
        memoDTL: '',
        memoDTL1: '',
        isUpdate: true,
        isNewLine: true,
      }
    },
    tableHeaders() {
      return [
        {
          key: 'checkbox',
          name: '',
          width: 30,
          align: 'left',
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'lineID',
          name: 'ID',
          width: 30,
          align: 'center',
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'itemCode',
          name: this.$t('lbl_ItemCode_0'),
          filter: 'autocomplete',
          width: 150,
          align: 'left',
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'itemTypeID',
          name: this.$t('lbl_ItemType_0'),
          filter: 'select',
          width: 150,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
          options: this.itemTypeOptions,
        },
        {
          key: 'itemName',
          name: this.$t('lbl_ItemName_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'description',
          name: this.$t('lbl_Description_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'unitID',
          name: this.$t('lbl_Unit_0'),
          filter: 'select',
          width: 150,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
          options: this.unitOptions,
        },
        {
          key: 'quantity',
          name: this.$t('lbl_Quantity_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          disabled: false,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'price',
          name: this.$t('lbl_Price_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'POPriceIncludeDiscount',
          name: this.$t('lbl_POPriceIncludeDiscount_0'),
          filter: 'input',
          width: 150,
          align: 'right',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'POPriceIncludeTax',
          name: this.$t('lbl_POPriceIncludeTax_0'),
          filter: 'input',
          width: 150,
          align: 'right',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'amount',
          name: this.$t('lbl_Amount_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'POAmountIncludeTax',
          name: this.$t('lbl_POAmountIncludeTax_0'),
          filter: 'input',
          width: 150,
          align: 'right',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'promiseDate',
          name: this.$t('lbl_PromiseDate_0'),
          filter: 'datetime',
          width: 150,
          align: 'left',
          disabled: false,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'sono',
          name: this.$t('lbl_SONO_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'solineNumber',
          name: this.$t('lbl_SOLineID_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'memoDTL',
          name: this.$t('lbl_MemoDTL_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: false,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'memoDTL1',
          name: this.$t('lbl_MemoDTL_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: false,
          fieldRequired: false,
          hidden: false,
        },
      ]
    },
    availableListDetails() {
      return this.dataTable.filter((item) => !item.isNewLine)
    },
    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'delete':
            item.disabled = !this.getActiveButtonToolBar?.isDelete
            break
          case 'attach':
            item.disabled = !this.getActiveButtonToolBar?.isAttachments
            break
          case 'print':
            item.disabled = !this.getActiveButtonToolBar?.isPrint
            break
          case 'check':
            item.disabled = !this.getActiveButtonToolBar?.isCheck
            break
          case 'unCheck':
            item.disabled = !this.getActiveButtonToolBar?.isCheck
            break
          default:
            break
        }
        return item
      })
    },
  },
  async mounted() {
    this.addNewLineData()
    const [res] = await Promise.all([
      api('getListCompanyTypeOther'),
      this.getListItemCode(),
      this.getUnitOptions(this.$i18n.locale),
      this.getItemTypeOptionsFromAPI(),
      this.getPODetailColumn(),
    ])
    const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
    if (validResponse) {
      this.arrivalAddresses = res.data || []
    }

    this.form = {
      ...this.form,
      orderDate: this.convertDate(new Date()),
      taxRate: 0,
      discountRate: 0,
      totalAmount: 0,
    }

    if (this.generatedPurchaseOrder) {
      const data = cloneDeep(this.generatedPurchaseOrder)
      this.form.orderDate = this.convertDate(data.orderDate)
      this.form.supplierName = data.supplierName
      this.form.arrivalAddress = data.arrivalAddress
      this.form.memo = data.memo
      this.form.editUser = data.editUser
      this.form.departID = data.departID || null
      this.form.department = data.department || null
      this.form.taxRate = formatNumberWithCommas(data.taxRate)
      this.form.purchasePlanId = data.purchasePlanId
      this.form.isPurchasePlan = data.isPurchasePlan
      this.form.supplierID = data.supplierID

      if (this.$refs.formAddOrder.listSupplierName) {
        const selectedSupplier = this.$refs.formAddOrder.listSupplierName.find(
          (el) => el.id === data.supplierID
        )
        if (selectedSupplier) {
          this.form.supplierName = selectedSupplier.companyName
          this.form.currencyID = selectedSupplier.currencyID
        }
      }

      this.dataTable = data.listDetail.map((item, idx) => {
        let rowData = {}
        rowData = {
          ...item,
          promiseDate: this.convertDate(item.promiseDate),
          price: this.parseStringToFloat(item.price || 0),
          quantity: this.parseStringToFloat(item.quantity || 0),
          amount: this.parseStringToFloat(item.amount || 0),
          lineID: idx + 1,
        }
        const selectedProduct = this.listItemCode.find(
          (el) => el.itemId === item.itemID
        )
        if (selectedProduct) {
          rowData.itemCode = selectedProduct.key
          rowData.itemName = selectedProduct.itemName
          rowData.itemTypeID = selectedProduct.itemTypeID
          rowData.unitID = selectedProduct.unitID

          // Rounds up quantity for item unit pieces
          const unitName = this.unitOptions.find(
            (item) => item.value === rowData.unitID
          )?.text
          const roundUpQty =
            item.confirmRoundUpQty && unitName === ITEM_UNIT.PIECES

          rowData.quantity = roundUpQty
            ? Math.ceil(rowData.quantity)
            : rowData.quantity
          rowData.amount = rowData.quantity * rowData.price
        }
        return rowData
      })
      this.addNewLineData()
    }
  },
  beforeDestroy() {
    this.SET_GENERATED_PURCHASE_ORDER(null)
  },

  methods: {
    ...mapActions('base', {
      getUnitOptions: 'getUnitOptions',
      getItemTypeOptionsFromAPI: 'getItemTypeOptionsFromAPI',
    }),
    ...mapMutations({
      UPDATE_PAYLOAD_PURCHASE_ORDER_IMPORT:
        'filterSort/UPDATE_PAYLOAD_PURCHASE_ORDER_IMPORT',
      SET_GENERATED_PURCHASE_ORDER: 'mrp/SET_GENERATED_PURCHASE_ORDER',
    }),

    updateTable(val) {
      this.dataTable = this.dataTable.map((item) => {
        const quantity = item.quantity
        const price = item.price
        const discountRate = val.discountRate
        const taxRate = val.taxRate

        const {
          priceIncludeDiscount,
          amount,
          priceIncludeTax,
          amountIncludeTax,
        } = this.parseFloatCalculatePrice({
          quantity,
          price,
          discountRate,
          taxRate,
        })

        return Object.assign({}, item, {
          amount,
          POPriceIncludeDiscount: priceIncludeDiscount,
          POPriceIncludeTax: priceIncludeTax,
          POAmountIncludeTax: amountIncludeTax,
        })
      })
    },

    async getListItemCode() {
      const res = await api('getItemCode')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        this.listItemCode = res?.data
      }
    },
    async getPODetailColumn() {
      try {
        this.loading = true
        const response = await api(
          'getScolumnHideDetail',
          DETAIL_ITEM_TABLE.PURCHASE_ORDER_DETAIL
        )
        this.columnHides = response?.data
        this.loading = false
      } catch (error) {
      } finally {
        this.loading = false
      }
    },

    handleAction(key) {
      switch (key) {
        case 'add':
          return this.handleAdd()
        case 'save':
          return this.handleSave()
        case 'newSave':
          return this.handleSave()
        case 'delete':
          return this.handleDelete()
        case 'import':
          return this.handleOpenModalImport()
        case 'attach':
          return (this.$refs.attachments.showModal = true)
        case 'print':
          return this.handlePrint()
        case 'back':
          return this.$router.go(-1)
        case 'refresh':
          return this.resetPageData()
        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))
        case 'unCheck':
          return this.handleUnCheck()
        case 'setColumn':
          return (this.$refs.baseSetColumnModal.showModal = true)
        default:
          break
      }
    },
    resetTableDetailData() {
      this.dataTable = []
      this.$refs.tableDetails.resetSearchData()
      this.$refs.tableDetails.activeRow = -1
    },
    resetPageData() {
      this.listErrorMessage = []
      this.resetTableDetailData()
      Promise.all([this.$fetch(), this.$refs.formAddOrder.$fetch()])
    },

    handlePrint() {
      const confirm = window.confirm(this.$t('msg_ConfirmPrint_0'))
      if (!confirm) {
        return
      }

      window.alert(this.$t('msg_OperationFail_0'))
    },
    handleUnCheck() {
      return window.confirm(this.$t('msg_NoCheck_0'))
    },

    handleAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.resetPageData()
      }
    },
    validateData() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }

      this.listErrorMessage = []
      const selectedItems = this.availableListDetails || []
      const payload = this.form

      const requiredFields = {
        orderDate: 'OrderDate',
        supplierID: 'SupplierName',
        currencyID: 'Currency',
      }

      const requiredTableDetail = {
        itemCode: 'ItemCode',
        quantity: 'Quantity',
        price: 'Price',
        promiseDate: 'PromiseDate',
      }

      for (const prop in requiredFields) {
        if (!payload[prop]) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      }

      if (selectedItems.length === 0) {
        this.listErrorMessage.push({
          fieldName: this.$t(`msg_Details_0`),
          text: this.$t('msg_NoInput_0'),
        })
      } else {
        selectedItems.forEach((item) => {
          for (const key in requiredTableDetail) {
            if (
              (['quantity'].includes(key) &&
                !this.parseStringToFloat(item[key])) ||
              !item[key]
            ) {
              this.listErrorMessage.push({
                fieldName: `${this.$t('lbl_LineID_0')} ${
                  item.lineID
                } - ${this.$t(`lbl_${requiredTableDetail[key]}_0`)}`,
                text: this.$t('msg_NoInput_0'),
              })
            }
          }
        })
      }

      this.listErrorMessage = getUnique(this.listErrorMessage, 'fieldName')
      const hasError = this.listErrorMessage.length > 0
      if (hasError) {
        return
      }
      return {
        selectedItems,
        payload,
      }
    },
    async handleSave() {
      try {
        const { selectedItems, payload } = this.validateData()
        if (payload && selectedItems && selectedItems?.length > 0) {
          const params = {
            ...payload,
            listDetail: selectedItems.map((item, index) =>
              Object.assign({}, item, {
                lineID: index + 1,
                price: this.parseStringToFloat(item.price),
              })
            ),
          }

          this.loading = true
          const response = await api('addPurchaseOrder', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === SERVER_RESPONSE_CODE.OK) {
            this.form.pono = response.data.pono
            window.alert(this.$t('msg_IsSaved_0'))
            return this.$router.push({
              path: `/${this.$i18n.locale}/purchase/order/detail?pono=${this.form?.pono}`,
            })
          }

          window.alert(`${response?.message}`)
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
        this.isNewSave = false
      }
    },
    handleDelete() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        window.alert(this.$t('msg_IsDeleted_0'))
        this.resetPageData()
      }
    },
    changeDataTable(data) {
      this.dataTable = data
    },
    handleOpenModalImport() {
      const supplierId = this.form.supplierID
      if (supplierId) {
        this.UPDATE_PAYLOAD_PURCHASE_ORDER_IMPORT({
          supplierId,
        })
        return (this.$refs.importPurchaseOrder.showModal = true)
      }

      window.alert(this.$t('msg_NoselectSupplier_0'))
    },
    addNewLineData() {
      this.dataTable.push({
        ...this.newLine,
        lineID: this.availableListDetails.length + 1,
      })
    },
    handleImportData(data) {
      const listDataHaveLineId = data.map((item, index) => {
        item.productName = item.itemName
        item.promiseDate = this.convertDate(item.promiseDate)
        item.price = this.parseStringToFloat(item.price || 0)
        item.quantity = this.parseStringToFloat(item.quantity || 0)
        item.amount = this.parseStringToFloat(item.amount || 0)
        return item
      })
      this.dataTable = this.availableListDetails
        .concat(listDataHaveLineId)
        .map((item, index) => ({
          ...item,
          lineID: index + 1,
        }))
      this.addNewLineData()
    },
  },
}
</script>
<style lang="scss" scoped>
.add-purchase-order-page {
  background: #fff 50% bottom repeat-x;
  color: #222;
  position: relative;
  padding: 0.2em 0.2em 0;
  zoom: 1;
  font-family: Lucida Grande, Lucida Sans, Arial, sans-serif;
  font-size: 1.1em;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  height: 100%;
}
</style>
