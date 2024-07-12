<template>
  <div class="edit-sale-order-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormInputProductionOrder
      ref="editOrderForm"
      :data="dataDetail"
      :is-disabled="isCheck"
      :list-item-code="listItemCode"
      @change-item-code="handleChangeItemCode"
    ></FormInputProductionOrder>
    <base-table-item-detail
      ref="outwardOrderTableItem"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'outwardOrder'"
      :customer-id="dataDetail.customerId"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :new-line="newLine"
      @changeTable="changeDataDetailTable"
    >
      <template #subBeginDate="{ item }">
        <span
          :class="{
            'text-danger': dateIsPastOrPresent(item.subBeginDate),
          }"
          >{{ item.subBeginDate }}</span
        >
      </template>
    </base-table-item-detail>
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="orderNO"
      module-name="ProductionOrder"
      @updateData="updateData"
      @deleteData="deleteData"
    ></BaseModalAttach>
    <ModalImportProductionOrder
      ref="importProductionOrder"
      :form="form"
      @update-details="handleImportData"
    />
    <base-set-column-detail
      ref="baseSetColumnModal"
      :column-hides="columnHides"
      :get-scolumn-hides="getScolumnHides"
    />
  </div>
</template>
<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import { compact } from 'lodash'
import FormInputProductionOrder from '@/components/Production/ProductionOrder/FormInputProductionOrder.vue'
import { downloadFileExcel, getUnique } from '@/utils/utils'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import dateTime from '@/mixins/dateTime'
import systemMixins from '@/mixins/system'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import { SERVER_RESPONSE_CODE, SERVER_ERROR_MESSAGE, ITEM_TYPE } from '@/constants'
import ModalImportProductionOrder from '@/components/Production/ProductionOrder/Import/ModalImportProductionOrder.vue'
import { isEmptyValue } from '~/utils/utils'

export default {
  name: 'PageDetailProductionOrder',
  components: {
    BaseValidateMessage,
    ToolBar,
    FormInputProductionOrder,
    BaseModalAttach,
    BaseTableItemDetail,
    BaseSetColumnDetail,
    ModalImportProductionOrder,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      listErrorMessage: [],
      form: {},
      dataImportDetail: [],
      dataTable: [],
      loading: false,
      dataDetail: {},
      listItemCode: [],
      columnHides: [],
      lang: this.$i18n.locale,
      clickBomCompute: false,
      clickDateCompute: false,
      isChangeItemCode: false,
    }
  },

  async fetch() {
    try {
      this.SET_LOADING(true)
      await Promise.all([
        this.getListItemCode(),
        this.getData(),
        this.getItemTypeOptionsFromAPI(),
        this.getScolumnHides(),
        this.getUnitOptions(this.lang),
      ])
    } catch (err) {
      console.error(err)
    } finally {
      this.SET_LOADING(false)
    }
  },

  computed: {
    ...mapGetters('base', {
      unitOptions: 'getUnitOptions',
      getItemTypeOptions: 'getItemTypeOptions',
      getActiveButtonToolBar: 'getActiveButtonToolBar',
    }),

    ...mapGetters({
      userInfo: 'getUserInfo',
    }),

    availableListDetails() {
      return this.dataTable.filter((item) => !item.isNewLine)
    },

    itemTypeOptions() {
      return this.getItemTypeOptions
        .map((item) => ({
          text: this.$t(`${item.text}`),
          value: item.value,
        }))
        .filter(
          (item, idx) =>
            idx === ITEM_TYPE.EMPTY ||
            item.value === ITEM_TYPE.INTERMEDIATE_PRODUCT ||
            item.value === ITEM_TYPE.PRODUCT_PROCESS
        )
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
          key: 'subBeginDate',
          name: this.$t('lbl_StartDate_0'),
          filter: 'datetime',
          width: 200,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'subEndDate',
          name: this.$t('lbl_EndDate_0'),
          filter: 'datetime',
          width: 200,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'subProcessDays',
          name: this.$t('lbl_ProductionLT_0'),
          filter: 'number',
          width: 120,
          align: 'right',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'subItemCode',
          name: this.$t('lbl_ItemCode_0'),
          filter: 'autocomplete',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'subItemTypeID',
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
          key: 'subItemName',
          name: this.$t('lbl_ItemName_0'),
          filter: 'input',
          width: 250,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'subDescription',
          name: this.$t('lbl_Description_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'subUnitID',
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
          key: 'subQuantity',
          name: this.$t('lbl_Quantity_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'completionQuantity',
          name: this.$t('lbl_CompletionQuantity_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'completionDate',
          name: this.$t('lbl_CompletionDate_0'),
          filter: 'datetime',
          width: 200,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'memoDTL',
          name: this.$t('lbl_MemoDTL_0'),
          filter: 'input',
          width: 300,
          align: 'left',
          typeInput: 'input',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
      ]
    },

    listToolBars() {
      return [
        {
          key: 'add',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'save',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
          disabled: this.isCheck,
        },
        {
          key: 'newSave',
          label: this.$t('btn_btnNewSave_0'),
          icon: '/images/new_save.png',
          disabled: this.isCheck,
        },
        {
          key: 'import',
          label: this.$t('btn_btnImport_0'),
          icon: '/images/import.png',
          disabled: this.isCheck,
        },
        {
          key: 'delete',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
          disabled: !this.getActiveButtonToolBar.isDelete || this.isCheck,
        },
        {
          key: 'bomCompute',
          label: this.$t('btn_btnBomCompute_0'),
          icon: '/images/mode.png',
          disabled: this.isCheck,
        },
        {
          key: 'dateCompute',
          label: this.$t('btn_btnDateCompute_0'),
          icon: '/images/mode.png',
          disabled: this.isCheck,
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
          disabled: !this.getActiveButtonToolBar.isCheck || this.isCheck,
        },
        {
          key: 'unCheck',
          label: this.$t('btn_btnUnCheck_0'),
          icon: '/images/uncheck.png',
          disabled: !this.getActiveButtonToolBar.isCheck || !this.isCheck,
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
          disabled: !this.getActiveButtonToolBar.isAttachments,
        },
        {
          key: 'setQuotation',
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
      ]
    },

    newLine() {
      return {
        lineID: 1,
        subItemCode: '',
        subItemID: '',
        subItemTypeID: '',
        subItemName: '',
        subDescription: '',
        subUnitID: '',
        subQuantity: 0,
        subProcessDays: 0,
        subBeginDate: this.convertDate(new Date()),
        subEndDate: this.convertDate(new Date()),
        memoDTL: '',
        completionQuantity: 0,
        completionDate: '',
        isUpdate: true,
        isNewLine: true,
      }
    },
  },

  watch: {
    form: {
      immediate: true,
      handler(val) {
        if (val) {
          this.dataDetail = JSON.parse(JSON.stringify(val))
          this.joinAttachmentString(compact(this.dataDetail.attachments))
        }
      },
    },
    'dataDetail.deliveryDate': {
      handler() {
        // this.isChangeItemCode = true;
        // this.clickBomCompute = false
        this.clickDateCompute = false
      },
    },
  },

  methods: {
    ...mapActions('base', ['getItemTypeOptionsFromAPI', 'getUnitOptions']),
    ...mapMutations('base', ['SET_LOADING']),
    ...mapMutations({
      UPDATE_PAYLOAD_PRODUCTION_ORDER_IMPORT:
        'filterSort/UPDATE_PAYLOAD_PRODUCTION_ORDER_IMPORT',
    }),

    handleChangeItemCode(data) {
      if (data) {
        this.clickBomCompute = false
        this.clickDateCompute = false
        this.isChangeItemCode = true
      }
    },

    async getScolumnHides() {
      const response = await api('getScolumnHides', {
        gridName: 'ProductionOrderDetail',
      })
      if (response.status === 200) {
        this.columnHides = response?.data || []
      }
    },
    dateIsPastOrPresent(date) {
      const isValidDate = !isNaN(new Date(date).getTime())

      const isPastOrPresent =
        new Date().getTime() - new Date(date).getTime() >= 0

      return isValidDate && isPastOrPresent
    },
    async getListItemCode() {
      const res = await api('getItemCode')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        this.listItemCode = res?.data
      }
    },

    async getData() {
      // const listConvertDate = ['orderDate', 'checkDate', 'editDate','endDate', '']
      try {
        const params = {
          orderNo: this.$route.query?.orderNo,
          language: this.$i18n.locale,
        }
        const res = await api('getDetailProductionOrder', params)
        if (res.status === 200) {
          this.form = res.data
          this.form.orderDate = this.convertDate(this.form.orderDate)
          this.form.editDate = this.convertDate(this.form.editDate)
          this.form.checkDate = this.convertDate(this.form.checkDate)
          this.form.deliveryDate = this.convertDate(this.form.deliveryDate)
          this.dataDetail = JSON.parse(JSON.stringify(this.form))
          this.joinAttachmentString(compact(this.dataDetail.attachments))

          this.dataTable = res?.data?.listDetail?.map((item, index) => {
            item.subBeginDate = this.convertDate(item.subBeginDate)
            item.subEndDate = this.convertDate(item.subEndDate)
            item.lineID = index + 1
            return item
          })

          if (!this.isCheck) {
            const newLine = {
              ...this.newLine,
              lineID: this.dataTable.length + 1,
            }
            this.dataTable.push(newLine)
          }
        }
      } catch (error) {
        console.error(error)
      }
    },
    handleAction(key) {
      this.actionKey = key

      switch (key) {
        case 'add':
          this.handleButtonAddOrder()
          break
        case 'attach':
          this.$refs.attachments.showModal = true
          break
        case 'newSave':
          this.handleNewSaveOrder()
          break
        case 'save':
          this.handleUpdateProductionOrder()
          break
        case 'delete':
          this.handleButtonDeleteOrder()
          break
        case 'back':
          this.$router.push(
            this.localePath({ path: '/production/production-order' })
          )
          break
        case 'close':
          this.$router.push(this.localePath({ path: '/' }))
          break
        case 'check':
          this.handleButtonCheck()
          break
        case 'refresh':
          this.handleRefresh()
          break
        case 'unCheck':
          this.handleButtonUnCheck()
          break
        case 'setQuotation':
          this.$refs.baseSetColumnModal.showModal = true
          break
        case 'print':
          this.handleButtonPrint()
          break
        case 'import':
          this.handleOpenModalImport()
          break
        case 'bomCompute':
          this.handleBomCompute()
          break

        case 'dateCompute':
          this.handleDateCompute()
          break
        default:
      }
    },

    resetTableDetailData() {
      this.dataTable = []
      this.$refs.outwardOrderTableItem.resetSearchData()
      this.$refs.outwardOrderTableItem.activeRow = -1
      this.clickBomCompute = false
      this.clickDateCompute = false
    },

    async handleRefresh() {
      try {
        this.loading = true
        this.resetTableDetailData()
        await Promise.all([this.$fetch(), this.$refs.editOrderForm.$fetch()])
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    confirmAction(message) {
      return window.confirm(message)
    },

    async handleApiResponse(response, successMessage, errorMessage) {
      if (response.status === SERVER_RESPONSE_CODE.OK) {
        window.alert(successMessage)
        await this.getData()
      } else {
        window.alert(`${response?.message}`)
      }
    },

    async handleButtonCheck() {
      const confirm = await this.confirmAction(this.$t('msg_ConfirmCheck_0'))
      if (!confirm) {
        return
      }

      const params = this.form?.orderNO

      try {
        this.SET_LOADING(true)
        const response = await api('checkProductionOrder', params)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        await this.handleApiResponse(response, this.$t('msg_IsChecked_0'))
      } catch (err) {
        console.error(err)
      } finally {
        this.SET_LOADING(false)
      }
    },

    async handleButtonUnCheck() {
      const confirm = await this.confirmAction(this.$t('msg_ConfirmUncheck_0'))
      if (!confirm) {
        return
      }

      const params = this.form?.orderNO

      try {
        this.SET_LOADING(true)
        const response = await api('unCheckProductionOrder', params)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        await this.handleApiResponse(
          response,
          this.$t('msg_IsUnChecked_0'),
          response?.data?.response?.data?.message
        )
        const errorMessage = response?.data?.response?.data?.message
        const isInUsedError = errorMessage === SERVER_ERROR_MESSAGE.IS_IN_USED
        if (isInUsedError) {
          window.alert(this.$t(errorMessage))
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.SET_LOADING(false)
      }
    },
    handleButtonAddOrder() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.$router.push(
          this.localePath({ path: '/production/production-order/add' })
        )
      }
    },

    validateData() {
      const listError = []
      const dataTableFilter = this.availableListDetails
      const requiredFields = {
        orderDate: 'OrderDate',
        itemCode: 'itemCode',
        productionQuantity: 'ProductionQuantity',
        beginDate: 'ProductionStartDate',
      }
      const requiredTableDetail = {
        subItemCode: 'ItemCode',
        subQuantity: 'Quantity',
        subBeginDate: 'StartDate',
        subEndDate: 'EndDate',
      }

      for (const key in requiredFields) {
        if (!this.dataDetail[key]) {
          listError.push({
            fieldName: this.$t(`lbl_${requiredFields[key]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      }

      if (dataTableFilter.length === 0) {
        listError.push({
          fieldName: this.$t(`msg_Details_0`),
          text: this.$t('msg_NoInput_0'),
        })
      } else {
        dataTableFilter.forEach((item) => {
          for (const key in requiredTableDetail) {
            if (
              (['quantity'].includes(key) &&
                !this.parseStringToFloat(item[key])) ||
              !item[key]
            ) {
              listError.push({
                fieldName: `${this.$t('lbl_LineID_0')} ${
                  item.lineID
                } - ${this.$t(`lbl_${requiredTableDetail[key]}_0`)}`,
                text: this.$t('msg_NoInput_0'),
              })
            }
          }
        })
      }

      this.listErrorMessage = getUnique(listError, 'fieldName')
      if (this.listErrorMessage.length > 0) {
        return
      }

      return {
        dataTableFilter,
        payload: this.dataDetail,
      }
    },

    async handleUpdateProductionOrder() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }
      if (this.validateData) {
        const { dataTableFilter, payload } = this.validateData()

        const detailIds = this.availableListDetails
          .map((item) => item.id)
          .filter(Boolean)

        this.dataDetail.detail?.forEach(
          (item) =>
            !detailIds.includes(item.lineID) &&
            dataTableFilter.push({ ...item, isDelete: true })
        )
        const params = {
          form: {
            ...payload,
            editUser: this.userInfo?.loginName,
            deliveryDate: this.convertDate(payload.deliveryDate),
            listSubDetail: dataTableFilter.map((item) => {
              return {
                hourProductionQty: item.completionQuantity,
                subItemID: item.itemID,
                ...item,
              }
            }),
          },
          language: this.$i18n.locale,
          orderNo: this.form?.orderNO,
        }

        try {
          this.SET_LOADING(true)
          const response = await api('editProductionOrder', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === 200) {
            window.alert(this.$t('msg_IsSaved_0'))
            await this.getData()
          }
        } catch (error) {
          console.error(error)
        } finally {
          this.SET_LOADING(false)
        }
      }
    },
    async handleButtonDeleteOrder() {
      const orderNo = this.form?.orderNO

      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        const response = await api('deleteProductionOrder', orderNo)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        if (response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsDeleted_0'))
          this.$router.push(
            this.localePath({ path: '/production/production-order/add' })
          )
        } else {
          window.alert(`${response?.message}`)
        }
      }
    },

    addNewLineData() {
      this.dataTable.push({
        ...this.newLine,
        lineID: this.availableListDetails.length + 1,
      })
    },

    updateData(data) {
      this.form.attachments?.push(data)
      this.joinAttachmentString(this.form.attachments)
      this.$refs.editOrderForm.refresh()
    },

    deleteData(id) {
      this.form.attachments = this.form.attachments?.filter(
        (item) => item.id !== id
      )
      this.joinAttachmentString(this.form.attachments)
      this.$refs.editOrderForm.refresh()
    },

    joinAttachmentString(attachmentArray = []) {
      this.dataDetail.attachments = attachmentArray
        .map((item) => `${item.fileName}.${item.fileType}`)
        .join(' ; ')
    },

    changeDataDetailTable(data) {
      this.dataTable = data
    },
    async handleButtonPrint() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmPrint_0'))
        if (!confirm) {
          return
        }

        this.loading = true
        const payload = {
          language: this.lang,
          orderNo: this.$route.query?.orderNo,
        }
        const res = await api('printProductionOrder', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        validResponse && downloadFileExcel(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    handleOpenModalImport() {
      const itemCode = this.form.itemCode
      if (itemCode) {
        this.UPDATE_PAYLOAD_PRODUCTION_ORDER_IMPORT({
          mainItemCode: itemCode,
        })

        return (this.$refs.importProductionOrder.showModal = true)
      }
      window.alert(this.$t('msg_NoSelectItemCode_0'))
    },
    handleImportData(data) {
      this.clickBomCompute = false
      this.clickDateCompute = false
      // this.isChangeItemCode = true

      const dataImport = data?.length > 0 ? data[0] : []
      this.form.soLineID = dataImport.lineID ?? this.form.soLineID
      this.dataDetail.sono = dataImport?.sono
      this.dataDetail.customerID = dataImport.customerID
      this.dataDetail.customerName = dataImport.customerName
      this.dataDetail.productionQuantity = dataImport?.blance
      this.dataDetail.deliveryDate = dataImport?.promiseDate
      this.form.operationTypeID = dataImport?.operationTypeID
    },
    validateBomComputeData() {
      this.listErrorMessage = []

      const requiredFields = {
        itemID: 'ItemCode',
        deliveryDate: 'PromiseDate',
        productionQuantity: 'ProductionQuantity',
      }

      for (const prop in requiredFields) {
        isEmptyValue(this.form[prop]) &&
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
      }
    },
    async handleBomCompute() {
      this.clickBomCompute = true
      try {
        this.SET_LOADING(true)
        this.validateBomComputeData()
        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }

        const payload = {
          language: this.$i18n.locale,
          itemID: this.dataDetail.itemID,
          quantity: this.parseStringToFloat(this.dataDetail.productionQuantity),
          endDate: this.convertDate(this.dataDetail.deliveryDate),
        }
        const res = await api('newBomComputeProductionOrder', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        // if itemCode is changed, get new data
        if (this.isChangeItemCode) {
          this.dataTable = res.data.map((item, index) => ({
            ...item,
            lineID: index + 1,
            subItemTypeID: item.itemTypeID,
            completionQuantity: item.goodProductionQty,
            completionDate: item.processingEndDate,
          }))
        } else {
          this.dataTable = res.data.map((item, index) => ({
            ...item,
            lineID: index + 1,
            subItemTypeID: item.itemTypeID,
            completionQuantity: item.goodProductionQty,
            completionDate: item.processingEndDate,
          }))

          // get data bom compute
          // const dataBomCompute = res.data.map((item) => {
          //   const { subBeginDate, subEndDate, ...rest } = item
          //   return rest
          // })

          // // remove object newLine
          // this.dataTable.pop()

          // // merge new bomCompute data into current data
          // this.dataTable = this.dataTable.map((item, index) => {
          //   return {
          //     ...item,
          //     ...dataBomCompute[index],
          //   }
          // })
        }

        // if click BomCompute 2 times then clear start and end date
        if (this.availableListDetails[0]?.subBeginDate !== '') {
          this.dataTable = this.availableListDetails.map((item) => {
            return {
              ...item,
              subBeginDate: '',
              subEndDate: '',
            }
          })
        }

        // const dataCompute = res.data?.length > 0 ? res.data[0] : []
        this.dataDetail.beginDate = !this.isChangeItemCode
          ? this.availableListDetails[0]?.subBeginDate
          : this.clickDateCompute
          ? this.availableListDetails[0]?.subBeginDate
          : ''

        this.addNewLineData()

        this.$refs.addOrderForm.refresh()
      } catch (err) {
        console.error(err)
      } finally {
        this.SET_LOADING(false)
      }
    },
    async handleDateCompute() {
      this.clickDateCompute = true
      try {
        this.SET_LOADING(true)
        this.validateBomComputeData()
        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }

        const payload = {
          endDate: this.convertDate(this.dataDetail.deliveryDate),
          form: this.availableListDetails,
        }
        const res = await api('newDateComputeProductionOrder', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        // if item code is changed, get the new data date compute
        if (this.isChangeItemCode) {
          // if bomCompute is clicked, update new data
          if (this.clickBomCompute) {
            this.dataTable = res.data.map((item, index) => {
              return {
                ...item,
                lineID: index + 1,
                subBeginDate: item.subBeginDate,
                subEndDate: item.subEndDate,
              }
            })
          } else {
            // just fill deliveryDate
            // this.dataTable = res.data.map((item, index) => {
            //   return {
            //     lineID: index + 1,
            //     subBeginDate: item.subBeginDate,
            //     subEndDate: item.subEndDate,
            //   }
            // })
            this.dataTable = []
          }
        } else {
          // if itemCode is not changed, just update deliveryDate

          // get data date compute
          const dataDateCompute = res.data.map((item, index) => {
            return {
              lineID: index + 1,
              subBeginDate: item.subBeginDate,
              subEndDate: item.subEndDate,
            }
          })

          // delete object newLine
          this.dataTable.pop()

          // merge date compute into current data table
          for (let i = 0; i < this.dataTable.length; i++) {
            for (let j = 0; j < dataDateCompute.length; j++) {
              if (this.dataTable[i].lineID === dataDateCompute[j].lineID) {
                this.dataTable[i].subBeginDate = dataDateCompute[j].subBeginDate
                this.dataTable[i].subEndDate = dataDateCompute[j].subEndDate
              }
            }
          }
        }

        this.dataDetail.beginDate = this.availableListDetails[0]?.subBeginDate
        const dataTableLength = this.availableListDetails?.length - 1
        this.form.endDate =
          this.availableListDetails[dataTableLength]?.subEndDate
        this.addNewLineData()

        this.$refs.addOrderForm.refresh()
      } catch (err) {
        console.error(err)
      } finally {
        this.SET_LOADING(false)
      }
    },
    async handleNewSaveOrder() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }

      const validateInfo = this.validateData()

      if (validateInfo) {
        const { dataTableFilter, payload } = validateInfo
        const detailIds = this.availableListDetails
          .map((item) => item.id)
          .filter(Boolean)

        this.dataDetail.detail?.forEach(
          (item) =>
            !detailIds.includes(item.lineID) &&
            dataTableFilter.push({ ...item, isDelete: true })
        )
        const params = {
          form: {
            ...payload,
            editUser: this.userInfo?.loginName,
            listDetail: dataTableFilter.map((item) => {
              return {
                hourProductionQty: item.completionQuantity,
                subItemID: item.itemID,
                ...item,
              }
            }),
          },
          language: this.$i18n.locale,
        }

        try {
          this.SET_LOADING(true)
          const response = await api('addProductionOrder', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === 200) {
            window.alert(this.$t('msg_IsSaved_0'))
            this.$router.push({
              path: `/${this.$i18n.locale}/production/production-order/detail?orderNo=${response.data.orderNO}`,
            })
            setTimeout(async () => await this.handleRefresh())
          }
        } catch (error) {
          console.error(error)
        } finally {
          this.SET_LOADING(false)
        }
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.edit-sale-order-page {
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
