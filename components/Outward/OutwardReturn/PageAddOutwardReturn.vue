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
    <FormInputOutwardReturn
      ref="addOutwardReturnForm"
      :key="refreshAddOutwardReturnFormKey"
      :data="form"
      @update-warehouse="(data) => updateWarehouse(data)"
    />
    <BaseTableItemDetail
      ref="tableDetails"
      class="add-sale-order-table-details"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'outwardReturn'"
      :customer-id="form.customerId"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :type-action="'ADD'"
      :new-line="newLine"
      @changeTable="changeDataDetailTable"
    />
    <ModalImportOutwardReturn
      ref="importOutwardReturn"
      @update-modal-import-outward="handleImportMultipleData"
    />
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="orderNumber"
      module-name="SOOrder"
    />
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
import ModalImportOutwardReturn from './Import/ModalImportOutwardReturn.vue'
import FormInputOutwardReturn from '~/components/Outward/OutwardReturn/FormInputOutwardReturn.vue'
import systemMixins from '@/mixins/system'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { getUnique } from '@/utils/utils'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
export default {
  components: {
    ToolBar,
    FormInputOutwardReturn,
    BaseModalAttach,
    BaseValidateMessage,
    BaseTableItemDetail,
    BaseSetColumnDetail,
    BaseLoading,
    ModalImportOutwardReturn,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      refreshAddOutwardReturnFormKey: 0,
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
        orderDate: this.convertDate(new Date()),
        totalQuantity: 0,
        orderNumber: '',
        attachments: [],
        memo: '',
        responsible: '',
        warehouseID: 0,
      },
      dataTable: [
        {
          lineID: 1,
          itemCode: '',
          itemID: '',
          itemTypeID: '',
          itemName: '',
          description: '',
          unitID: 0,
          quantity: 0,
          price: 0,
          amount: 0,
          memoDtl: '',
          reason: '',
          wpoID: '',
          isUpdate: true,
          isNewLine: true,
          warehouseID: null,
        },
      ],
      loading: false,
      isAddSuccess: false,
      dataImportDetail: [],
      listItemCode: [],
      columnHides: [],
    }
  },

  async fetch() {
    try {
      await Promise.all([
        this.getListItemCode(),
        this.getItemTypeOptionsFromAPI(),
        this.getUnitOptions(this.$i18n.locale),
        this.getWarehouseOptions(this.$i18n.locale),
        this.getScolumnHides(),
      ])
    } catch (err) {
      console.error(err)
    }
  },

  computed: {
    ...mapGetters('base', {
      unitOptions: 'getUnitOptions',
      getItemTypeOptions: 'getItemTypeOptions',
      warehouseOptions: 'getWarehouseOptions',
    }),

    ...mapGetters('base', ['getActiveButtonToolBar']),

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
      return !!(this.form?.checkUser && this.form.checkDate)
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
          key: 'warehouseID',
          name: this.$t('lbl_Warehouse_0'),
          filter: 'select',
          width: 150,
          align: 'left',
          disabled: false,
          fieldRequired: true,
          hidden: false,
          options: this.warehouseOptions,
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
          key: 'reason',
          name: this.$t('lbl_Reason_0'),
          filter: 'input',
          width: 300,
          align: 'left',
          typeInput: 'input',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'wPono',
          name: this.$t('lbl_WPONO_0'),
          filter: 'input',
          width: 150,
          align: 'left',
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
        unitID: 0,
        quantity: 0,
        price: 0,
        amount: 0,
        warehouseID: null,
        memoDtl: '',
        reason: '',
        isUpdate: true,
        isNewLine: true,
        responsible: '',
      }
    },

    availableListDetails() {
      return this.dataTable.filter((item) => !item.isNewLine)
    },
    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'deleteOrder':
            item.disabled = !this.getActiveButtonToolBar?.isDelete
            break
          case 'attachOrder':
            item.disabled = !this.getActiveButtonToolBar?.isAttachments
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
  watch: {
    dataTable: {
      handler() {
        this.form.totalQuantity = this.dataTable
          .map((v) => (v.quantity ? v.quantity : 0))
          .reduce((totalQuantity, currentQuantity) => {
            return parseInt(totalQuantity) + parseInt(currentQuantity)
          }, 0)
      },
      deep: true,
    },
  },

  methods: {
    ...mapActions('base', [
      'getUnitOptions',
      'getItemTypeOptionsFromAPI',
      'getWarehouseOptions',
    ]),
    ...mapMutations({
      UPDATE_PAYLOAD_OUTWARD_RETURN_IMPORT:
        'filterSort/UPDATE_PAYLOAD_OUTWARD_RETURN_IMPORT',
    }),

    async getScolumnHides() {
      try {
        this.loading = true

        const response = await api('getScolumnHides', {
          gridName: 'OutwardReturnDetail',
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

    updateWarehouse({ key, value }) {
      this.dataTable = this.availableListDetails.map((item) =>
        Object.assign({}, item, {
          [key]: value,
        })
      )
      this.addNewLineData()
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
          this.handleSaveOutwardReturn()
          break

        case 'import':
          this.handleClickImport()
          break

        case 'delete':
          this.handleButtonDeleteOrder()
          break

        case 'attach':
          this.$refs.attachments.showModal = true
          break

        case 'back':
          this.$router.push(
            this.localePath({ path: '/outward/outward-return' })
          )
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

        default:
          break
      }
    },
    resetTableDetailData() {
      this.dataTable = []
      this.$refs.tableDetails.resetSearchData()
      this.$refs.tableDetails.activeRow = -1
    },
    refreshFormData() {
      ++this.refreshAddOutwardReturnFormKey
    },
    async handleRefresh() {
      this.listErrorMessage = []
      this.form = {
        orderDate: this.convertDate(new Date()),
        totalQuantity: 0,
      }
      this.resetTableDetailData()
      await Promise.all([
        this.$fetch(),
        this.$refs.addOutwardReturnForm.$fetch(),
      ])
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

    handleClickImport() {
      const supplierID = this.form?.supplierID

      if (!supplierID) {
        return window.alert(this.$t('msg_NoselectSupplier_0'))
      }

      this.UPDATE_PAYLOAD_OUTWARD_RETURN_IMPORT({
        supplierID,
      })

      this.$refs.importOutwardReturn.showModal = true
    },

    handleImportMultipleData(data) {
      const cloneDataTable = [...this.availableListDetails, ...data]
      const existLineID = cloneDataTable.map((item) => item.lineID)
      const isUniqueExistLineID = new Set(existLineID).size === 1

      const canMerge =
        isUniqueExistLineID || this.availableListDetails.length > 0

      if (canMerge) {
        this.dataTable = this.availableListDetails
          .concat(data)
          .map((item, index) => ({
            ...item,
            quantity: item.blance,
            lineID: index + 1,
            wpoID: Number(item.orderID),
            wPono: item?.orderNo || item.orderNO,
            amount: item.blance * item.price,
          }))
      }
      this.addNewLineData()
    },

    validateForm() {
      const errors = []
      const dataTable = this.availableListDetails

      const requiredFields = {
        orderDate: 'OrderDate',
        supplierName: 'SupplierName',
      }
      const requiredTableDetails = {
        itemCode: 'ItemCode',
        quantity: 'Quantity',
        price: 'Price',
        warehouseID: 'Warehouse',
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

    async handleSaveOutwardReturn() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }

      const validateInfo = this.validateForm()

      if (validateInfo) {
        const { dataTableFilter, payload } = validateInfo

        dataTableFilter.forEach((item) =>
          Object.assign(item, {
            responsible: payload.responsibleID,
            supplierID: Number(payload.supplierID),
            supplierResponsible: payload.supplierResponsible,
            memo: payload.memo,
            isDeleted: false,
            price: this.parseStringToFloat(item.price),
            quantity: this.parseStringToFloat(item.quantity),
            unitID: this.parseStringToFloat(item.unitID),
          })
        )
        const params = {
          currencyID: payload.currencyID,
          detail: dataTableFilter.map((item) => {
            return {
              itemID: item.itemID,
              memo: item.memo,
              memoDtl: item.memoDtl,
              price: item.price,
              quantity: item.quantity,
              reason: item.reason,
              wpoID: Number(item?.orderID) || 0,
              warehouseID: item.warehouseID,
              wPono: item.wPono,
            }
          }),
          memo: payload.memo,
          orderDate: payload.orderDate,
          responsible: payload.responsibleID,
          supplierID: payload.supplierID,
          supplierResponsible: payload.supplierResponsible,
          // totalQuantity: payload.totalQuantity,
          warehouseID: payload.warehouseId || 0,
          language: this.$i18n.locale,
        }

        try {
          this.loading = true
          const response = await api('addOutwardReturn', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === 200) {
            window.alert(this.$t('msg_IsSaved_0'))
            this.$router.push({
              path: `/${this.$i18n.locale}/outward/outward-return/detail?orderNo=${response.data.orderNO}`,
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
