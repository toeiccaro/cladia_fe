<template>
  <div class="add-sale-order-page">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormInputOpOrder
      ref="addOrderForm"
      :key="refreshAddOrderFormKey"
      :data="form"
    />
    <BaseTableItemDetail
      ref="outwardOrderTableItem"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'outwardOrder'"
      :customer-id="form.supplierID"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :type-action="'ADD'"
      :new-line="newLine"
      :is-purchase="true"
      @changeTable="changeDataDetailTable"
    ></BaseTableItemDetail>
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="orderNumber"
      module-name="SOOrder"
    ></BaseModalAttach>
    <base-set-column-detail
      ref="baseSetColumnModal"
      :column-hides="columnHides"
      :get-scolumn-hides="getScolumnHides"
    />
    <BaseLoading v-if="loading" />
  </div>
</template>
<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import { cloneDeep } from 'lodash'
import FormInputOpOrder from '~/components/Outward/OutwardOrder/FormInputOutwardOrder.vue'
import systemMixins from '@/mixins/system'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import { ITEM_UNIT, SERVER_RESPONSE_CODE } from '@/constants'
import { getUnique, isEmptyValue } from '@/utils/utils'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
export default {
  components: {
    ToolBar,
    FormInputOpOrder,
    BaseModalAttach,
    BaseValidateMessage,
    BaseTableItemDetail,
    BaseSetColumnDetail,
    BaseLoading,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
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
      defaultForm: {
        orderDate: this.convertDate(new Date()),
        taxRate: 0,
        totalAmount: 0,
        detail: [],
      },
      form: {},
      dataTable: [
        {
          lineID: 1,
          itemCode: '',
          itemID: '',
          itemTypeID: '',
          itemName: '',
          description: '',
          unitID: '',
          quantity: 0,
          endQuantity: 0,
          price: 0,
          amount: 0,
          promiseDate: this.convertDate(new Date()),
          memoDtl: '',
          isUpdate: true,
          isNewLine: true,
        },
      ],
      loading: false,
      isAddSuccess: false,
      listItemCode: [],
      columnHides: [],
    }
  },

  computed: {
    ...mapGetters({
      unitOptions: 'base/getUnitOptions',
      getItemTypeOptions: 'base/getItemTypeOptions',
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      generatedOutwardOrder: 'mrp/getGeneratedOutwardOrder',
    }),

    itemTypeOptions() {
      return this.getItemTypeOptions.map((item) => ({
        text: this.$t(`${item.text}`),
        value: item.value,
      }))
    },
    dataTableFilter() {
      return this.dataTable?.filter((item) => item.itemID)
    },

    isCheck() {
      return !!(this.form?.checker && this.form.checkDate)
    },

    tableHeaders() {
      return [
        {
          key: 'checkbox',
          name: '',
          width: 30,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'lineID',
          name: 'ID',
          width: 30,
          align: 'center',
          filter: '',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'itemCode',
          name: this.$t('lbl_ItemCode_0'),
          filter: 'autocomplete',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'itemTypeID',
          name: this.$t('lbl_ItemType_0'),
          filter: 'select',
          width: 150,
          align: 'left',
          typeInput: 'select',
          disabled: true,
          fieldRequired: false,
          hidden: false,
          options: this.itemTypeOptions,
        },
        {
          key: 'itemName',
          name: this.$t('lbl_ItemName_0'),
          filter: 'input',
          width: 250,
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
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'price',
          name: this.$t('lbl_Price_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          disabled: this.isCheck,
          fieldRequired: true,
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
          key: 'promiseDate',
          name: this.$t('lbl_PromiseDate_0'),
          filter: 'datetime',
          width: 200,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'memoDtl',
          name: this.$t('lbl_MemoDTL_0'),
          filter: 'input',
          width: 300,
          align: 'left',
          typeInput: 'input',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'endQuantity',
          name: this.$t('lbl_EndQuantity_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
      ]
    },

    newLine() {
      return {
        lineID: 1,
        itemCode: '',
        itemID: '',
        itemTypeID: '',
        itemName: '',
        description: '',
        unitID: '',
        quantity: 0,
        endQuantity: 0,
        price: 0,
        amount: 0,
        promiseDate: this.convertDate(new Date()),
        memoDtl: '',
        isUpdate: true,
        isNewLine: true,
      }
    },

    availableListDetails() {
      return this.dataTable.filter((item) => !item.isNewLine)
    },
    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'delete':
            item.disabled = !this.activeButtonToolBar?.isDelete
            break
          case 'attach':
            item.disabled = !this.activeButtonToolBar?.isAttachments
            break
          case 'check':
            item.disabled = !this.activeButtonToolBar?.isCheck
            break
          case 'unCheck':
            item.disabled = !this.activeButtonToolBar?.isCheck
            break
          default:
            break
        }
        return item
      })
    },
  },

  async mounted() {
    try {
      this.form = Object.assign({}, this.defaultForm)
      await Promise.all([
        this.getListItemCode(),
        this.getItemTypeOptionsFromAPI(),
        this.getUnitOptions(this.$i18n.locale),
        this.getScolumnHides(),
      ])

      if (this.generatedOutwardOrder) {
        const data = cloneDeep(this.generatedOutwardOrder)
        this.form = data
        this.form.orderDate = this.convertDate(new Date())

        if (this.$refs.addOrderForm.listSupplierName) {
          const selectedSupplier =
            this.$refs.addOrderForm.listSupplierName.find(
              (el) => el.id === data.supplierID
            )
          if (selectedSupplier) {
            this.form.supplierName = selectedSupplier.companyName
            this.form.currencyID = selectedSupplier.currencyID
            this.form.supplierResponsible = isEmptyValue(
              selectedSupplier?.responsibleMan
            )
              ? selectedSupplier?.companyName
              : selectedSupplier?.responsibleMan
          }
        }

        this.dataTable = data.detail.map((item, idx) => {
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
            rowData.description = selectedProduct.description

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
    } catch (err) {
      console.error(err)
    }
  },

  beforeDestroy() {
    this.SET_GENERATED_OUTWARD_ORDER(null)
  },

  methods: {
    ...mapActions('base', ['getUnitOptions', 'getItemTypeOptionsFromAPI']),
    ...mapMutations({
      SET_GENERATED_OUTWARD_ORDER: 'mrp/SET_GENERATED_OUTWARD_ORDER',
    }),
    async getScolumnHides() {
      try {
        this.loading = true

        const response = await api('getScolumnHides', {
          gridName: 'OutwardOrderDetail',
        })
        if (response.status === 200) {
          this.columnHides = response?.data || []
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async getListItemCode() {
      const res = await api('getItemCode')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        this.listItemCode = res?.data
      }
    },

    handleAction(key) {
      switch (key) {
        case 'add':
          this.handleButtonAddOrder()
          break
        case 'save':
          this.handleSaveOrder()
          break
        case 'delete':
          this.handleButtonDeleteOrder()
          break
        case 'attach':
          this.$refs.attachments.showModal = true
          break
        case 'back':
          this.$router.go(-1)
          break
        case 'refresh':
          this.handleRefresh()
          break
        case 'close':
          this.$router.push(this.localePath({ path: '/' }))
          break
        case 'unCheck':
          this.handleButtonUnCheck()
          break
        case 'setColumn':
          this.$refs.baseSetColumnModal.showModal = true
          break
        case 'print':
          return this.handlePrint()
        default:
          break
      }
    },
    handlePrint() {
      window.confirm(this.$t('msg_ConfirmPrint_0'))
    },
    resetTableDetailData() {
      this.dataTable = []
      this.$refs.outwardOrderTableItem.resetSearchData()
      this.$refs.outwardOrderTableItem.activeRow = -1
    },
    refreshFormData() {
      ++this.refreshAddOrderFormKey
    },
    async handleRefresh() {
      this.listErrorMessage = []
      this.resetTableDetailData()
      await Promise.all([this.$fetch(), this.$refs.addOrderForm.$fetch()])
      this.refreshFormData()
      this.addNewLineData()
    },
    handleButtonUnCheck() {
      return window.confirm(this.$t('msg_NoCheck_0'))
    },

    handleButtonAddOrder() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        location.reload()
      }
    },

    validateForm() {
      const errors = []
      const dataTable = this.availableListDetails

      const requiredFields = {
        orderDate: 'OrderDate',
        currencyID: 'Currency',
        supplierID: 'SupplierName',
      }
      const requiredTableDetails = {
        itemCode: 'ItemCode',
        quantity: 'Quantity',
        price: 'Price',
        promiseDate: 'PromiseDate',
      }

      Object.keys(requiredFields).forEach((field) => {
        if (!this.form[field]) {
          errors.push({
            fieldName: this.$t(`lbl_${requiredFields[field]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      })

      if (dataTable.length === 0) {
        errors.push({
          fieldName: this.$t('msg_Details_0'),
          text: this.$t('msg_NoInput_0'),
        })
      } else {
        dataTable.forEach((item) => {
          Object.keys(requiredTableDetails).forEach((field) => {
            if (
              (['quantity', 'price'].includes(field) &&
                !this.parseStringToFloat(item[field])) ||
              !item[field]
            ) {
              errors.push({
                fieldName: `${this.$t('lbl_LineID_0')} ${
                  item.lineID
                } - ${this.$t(`lbl_${requiredTableDetails[field]}_0`)}`,
                text: this.$t('msg_NoInput_0'),
              })
            }
          })
        })
      }

      this.listErrorMessage = getUnique(errors, 'fieldName')
      if (this.listErrorMessage.length > 0) {
        return
      }

      return {
        dataTableFilter: dataTable,
        payload: this.form,
      }
    },

    async handleSaveOrder() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }

      const validateInfo = this.validateForm()

      if (validateInfo) {
        const { dataTableFilter, payload } = validateInfo

        const params = {
          form: {
            ...payload,
            detail: dataTableFilter.map((item) => {
              return {
                price: this.parseStringToFloat(item.price),
                quantity: this.parseStringToFloat(item.quantity),
                amount: this.parseStringToFloat(item.amount),
                description: item.description,
                endQuantity: this.parseStringToFloat(item.endQuantity),
                itemID: item.itemID,
                itemTypeID: item.itemTypeID,
                itemCode: item.itemCode,
                memoDtl: item.memoDtl,
                promiseDate: item.promiseDate,
                unitID: item.unitID,
              }
            }),
          },
          language: this.$i18n.locale,
        }

        try {
          this.loading = true
          const response = await api('addOutwardOrder', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === 200) {
            window.alert(this.$t('msg_IsSaved_0'))
            this.$router.push({
              path: `/${this.$i18n.locale}/outward/outward-order/detail?orderNo=${response.data.orderNo}`,
            })
          }
        } catch (error) {
          console.error(error)
        } finally {
          this.loading = false
        }
      }
    },

    handleButtonDeleteOrder() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        location.reload()
        this.refreshFormData()
        window.alert(this.$t('msg_IsDeleted_0'))
      }
    },

    changeDataTable(data) {
      this.dataTable = data
    },

    changeDataDetailTable(data) {
      this.dataTable = data
    },

    addNewLineData() {
      this.dataTable.push({
        ...this.newLine,
        lineID: this.availableListDetails.length + 1,
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.add-sale-order-page {
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
