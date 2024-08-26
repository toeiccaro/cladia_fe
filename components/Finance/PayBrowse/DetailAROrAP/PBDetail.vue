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
    <PBForm ref="addPBForm" :key="refreshAddPBFormKey" :data="form" />
    <BaseTableItemDetail
      ref="tableDetails"
      class="add-sale-order-table-details"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'saleOrder'"
      :customer-id="form.customerId"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :type-action="'ADD'"
      :new-line="newLine"
      @changeTable="changeDataDetailTable"
      :onDelete="handleDelete"
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
import { mapGetters, mapActions } from 'vuex'
import PBForm from './PBForm.vue'
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
import { formatNumberWithCommas } from '~/utils/utils'

export default {
  components: {
    ToolBar,
    PBForm,
    BaseModalAttach,
    BaseValidateMessage,
    BaseTableItemDetail,
    BaseSetColumnDetail,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      lang: this.$i18n.locale,
      refreshAddPBFormKey: 0,
      listErrorMessage: [],
      listToolBars: [
        {
          key: 'add',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
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
          key: 'print',
          label: this.$t('btn_btnPrint_0'),
          icon: '/images/print.png',
        },
        {
          key: 'set',
          label: this.$t('btn_btnSet_0'),
          icon: '/images/set.png',
        },
        {
          key: 'backAdd',
          label: this.$t('btn_btnBack_0'),
          icon: '/images/back.png',
        },
        {
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      defaultFormData: {
        checker: '',
        departmentID: '',
        editDate: '',
        editor: '',
        entryDate: this.convertDate(new Date()),
        margin: 0,
        memo: '',
        responsiblePerson: '',
        totalCreditAmount: 0,
        totalDebitAmount: 0,
      },
      form: {},
      dataTable: [
        {
          lineID: 1,
          companyName: '',
          creditAmount: 0,
          currency: '',
          date: this.convertDate(new Date()),
          debitAmount: 0,
          employee: '',
          invoiceDate: '',
          invoiceNotes: '',
          invoiceNumber: '',
          isInvoice: false,
          itemID: 0,
          opponentSubject: '',
          reason: '',
          subject: '',

          isUpdate: true,
          isNewLine: true,
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
      this.form = Object.assign({}, this.defaultFormData)
      await Promise.all([
        this.getListItemCode(),
        this.getItemTypeOptionsFromAPI(),
        this.getUnitOptions(this.$i18n.locale),
        this.getScolumnHides(),
        this.getCurrencyOptions(this.lang),
        this.getListAccountingItems(this.lang),
        this.getListCurrentAssets(this.lang),
        this.getData(),
        this.getListCustomerName(),
      ])
    } catch (err) {
      console.error(err)
    }
  },

  computed: {
    ...mapGetters('base', {
      unitOptions: 'getUnitOptions',
      getItemTypeOptions: 'getItemTypeOptions',
      currencyOptions: 'getCurrencyOptions',
      listAccountingItems: 'getListAccountingItems',
      listCurrentAssets: 'getListCurrentAssets',
      customerNameList: 'getCustomerNameList',
    }),

    ...mapGetters('base', ['getActiveButtonToolBar']),

    itemCustomerNameList() {
      return this.customerNameList.map((item) => ({
        text: item.companyName,
        value: item.companyName,
      }))
    },

    itemCurrencyOptions() {
      return this.currencyOptions.map((item) => ({
        text: item.text,
        value: item.text,
      }))
    },
    itemListAccountingItems() {
      return this.listAccountingItems.map((item) => ({
        text: item.text,
        value: item.text,
      }))
    },
    itemListCurrentAssets() {
      return this.listCurrentAssets.map((item) => ({
        text: item.text,
        value: item.text,
      }))
    },

    checkboxOptions() {
      return [
        { text: '', value: '' },
        { text: 'Yes', value: 1 },
        { text: 'No', value: 0 },
      ]
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
          key: 'date',
          name: this.$t('lbl_PBDate_0'),
          filter: 'datetime',
          width: 200,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'subject',
          name: this.$t('lbl_PBSubject_0'),
          filter: 'select',
          typeInput: 'select',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
          options: this.itemListAccountingItems,
        },
        {
          key: 'debitAmount',
          name: this.$t('lbl_PBAmount_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'opponentSubject',
          name: this.$t('lbl_PBOpponentSubject_0'),
          filter: 'select',
          typeInput: 'select',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
          options: this.itemListCurrentAssets,
        },
        {
          key: 'creditAmount',
          name: this.$t('lbl_PBAmount_0'),
          filter: 'number',
          width: 200,
          align: 'right',
          fieldRequired: true,
          hidden: false,
          disabled: this.isCheck,
        },
        {
          key: 'currency',
          name: this.$t('lbl_PBCurrency_0'),
          filter: 'select',
          typeInput: 'select',
          width: 150,
          align: 'left',
          fieldRequired: true,
          hidden: false,
          disabled: this.isCheck,
          options: this.itemCurrencyOptions,
        },
        {
          key: 'companyName',
          name: this.$t('lbl_PBCompanyName_0'),
          filter: 'select',
          typeInput: 'select',
          width: 150,
          align: 'left',
          fieldRequired: false,
          hidden: false,
          disabled: this.isCheck,
          options: this.itemCustomerNameList,
        },
        {
          key: 'isInvoice',
          name: this.$t('lbl_PBIsInvoice_0'),
          filter: 'checkbox',
          width: 100,
          align: 'center',
          dataType: 'checkbox',
          disabled: false,
          fieldRequired: false,
          hidden: false,
          options: this.checkboxOptions,
          headerFilter: 'select',
        },
        {
          key: 'invoiceNumber',
          name: this.$t('lbl_PBInvoiceNumber_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          fieldRequired: false,
          hidden: false,
          disabled: this.isCheck,
        },
        {
          key: 'invoiceDate',
          name: this.$t('lbl_PBInvoiceDate_0'),
          filter: 'datetime',
          width: 200,
          align: 'left',
          disabled: false,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'invoiceNotes',
          name: this.$t('lbl_PBInvoiceNotes_0'),
          filter: 'input',
          width: 300,
          align: 'left',
          typeInput: 'input',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'employee',
          name: this.$t('lbl_PBEmployee_0'),
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
          name: this.$t('lbl_PBReason_0'),
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

    newLine() {
      return {
        lineID: 1,
        companyName: '',
        creditAmount: 0,
        currency: '',
        date: this.convertDate(new Date()),
        debitAmount: 0,
        employee: '',
        invoiceDate: '',
        invoiceNotes: '',
        invoiceNumber: '',
        isInvoice: false,
        itemID: 0,
        opponentSubject: '',
        reason: '',
        subject: '',

        isUpdate: true,
        isNewLine: true,
      }
    },

    availableListDetails() {
      return this.dataTable.filter((item) => !item.isNewLine)
    },
    listToolBarsCheckAuthority() {
      const checker = this.form?.checker

      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'delete':
            item.disabled = !this.getActiveButtonToolBar?.isDelete
            break
          case 'check':
            item.disabled =
              !this.getActiveButtonToolBar?.isCheck || checker === true
            break
          case 'unCheck':
            item.disabled =
              !this.getActiveButtonToolBar?.isCheck || checker !== true
            break
          case 'print':
            item.disabled = !this.getActiveButtonToolBar?.isPrint
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
      handler(value) {
        let totalDebitAmount = 0
        let totalCreditAmount = 0
        let margin = 0

        value.map((item) => {
          item.date = this.convertDate(item.date)
          item.invoiceDate = this.convertDate(item.invoiceDate)

          const debitAmount = item.debitAmount ?? 0
          const creditAmount = item.creditAmount ?? 0

          totalDebitAmount = totalDebitAmount + Number(debitAmount)
          totalCreditAmount = totalCreditAmount + Number(creditAmount)
        })

        margin = totalCreditAmount - totalDebitAmount

        this.form.totalDebitAmount = totalDebitAmount ?? 0
        this.form.totalCreditAmount = totalCreditAmount ?? 0
        this.form.margin = margin
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    ...mapActions('base', [
      'getUnitOptions',
      'getItemTypeOptionsFromAPI',
      'getCurrencyOptions',
      'getListAccountingItems',
      'getListCurrentAssets',
      'getListCustomerName',
    ]),

    async getData() {
      try {
        const res = await api('getDetailPB', {
          orderNo: this.$route.query?.sono,
          language: this.$i18n.locale,
        })
        if (res.status === 200) {
          // this.form = res.data
          this.form.orderNumber = res?.data?.PBOrderNumber
          this.form.checker = res?.data?.checker
          this.form.departmentID = res?.data?.departmentID
          this.form.editor = res?.data?.editor
          this.form.margin = res?.data?.margin
          this.form.memo = res?.data?.memo

          this.form.editDate = this.convertDate(res.data.PBEditDate)
          this.form.entryDate = this.convertDate(res.data.PBEntryDate)
          this.form.responsiblePerson = res?.data?.responsiblePerson
          this.form.totalCreditAmount = formatNumberWithCommas(
            res?.data.PBTotalCreditAmount
          )
          this.form.totalDebitAmount = formatNumberWithCommas(
            res?.data.PBTotalDebitAmount
          )

          this.dataDetail = JSON.parse(JSON.stringify(this.form))

          this.dataTable = res?.data.listDetail.map((item, index) => {
            const newObject = {}

            for (const key in item) {
              let newKey = key.replace(/^PB/, '')
              newKey = newKey[0].toLowerCase() + newKey.slice(1)
              if (newKey == 'date') {
                item[key] = this.convertDate(item[key])
              }
              newObject[newKey] = item[key]
            }

            const matchedItemCompanyName = this.customerNameList.find(
              (item) => item.id == newObject.companyName
            )

            if (matchedItemCompanyName) {
              newObject.companyName = matchedItemCompanyName.companyName
            }
            const matchAndReplace = (
              list,
              objectKey,
              targetKey = 'value',
              replaceKey = 'text'
            ) => {
              const matchedItem = list.find(
                (listItem) => listItem[targetKey] === newObject[objectKey]
              )
              if (matchedItem) {
                newObject[objectKey] = matchedItem[replaceKey]
              }
            }

            matchAndReplace(this.listAccountingItems, 'subject')
            matchAndReplace(this.currencyOptions, 'currency')
            matchAndReplace(this.listCurrentAssets, 'opponentSubject')

            return newObject
          })

          if (!this.isCheck) {
            this.dataTable.push({
              ...this.newLine,
              lineID: this.dataTable.length + 1,
            })
          }
        }
      } catch (error) {
        console.error(error)
      }
    },

    async getScolumnHides() {
      try {
        this.loading = true

        const response = await api('getScolumnHides', {
          gridName: 'PayBrowseManualDetail',
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

        case 'backAdd':
          this.$router.push(
            this.localePath({ path: '/finance/receive-browse' })
          )
          break

        case 'close':
          this.$router.push(this.localePath({ path: '/' }))
          break

        case 'check':
          this.handleButtonCheck()
          break

        case 'unCheck':
          this.handleButtonUnCheck()
          break

        case 'set':
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
      ++this.refreshAddPBFormKey
    },
    async handleRefresh() {
      this.listErrorMessage = []
      this.resetTableDetailData()
      await Promise.all([this.$fetch(), this.$refs.addPBForm.$fetch()])
      this.refreshFormData()
      this.addNewLineData()
    },
    async handleButtonCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmCheck_0'))
      const params = {
        orderNo: this.form?.orderNumber,
      }
      if (!confirm) {
        return
      }

      try {
        this.loading = true
        const response = await api('checkPB', params)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FOPBIDDEN) {
          window.alert(this.$t(response?.message))
          return
        }

        if (response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsChecked_0'))
          this.dataDetail.checker = response.data.checker
          this.dataDetail.checkDate = this.convertDateTillSecond(
            response.data.checkDate
          )
          await this.getData()
        } else {
          window.alert(`${response?.message}`)
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async handleButtonUnCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmUncheck_0'))
      const params = {
        orderNo: this.form?.orderNumber,
      }
      if (!confirm) {
        return
      }

      try {
        this.loading = true
        const response = await api('uncheckPB', params)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FOPBIDDEN) {
          window.alert(this.$t(response?.message))
          return
        }

        const validResponse = response.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          window.alert(this.$t('msg_IsUnChecked_0'))
          this.dataDetail.checker = response.data.checker
          this.dataDetail.checkDate = response.data.checkDate

          return await this.getData()
        }

        const errorMessage = response?.data?.response?.data?.message
        const isInUsedError = errorMessage === SERVER_ERROR_MESSAGE.IS_IN_USED
        if (isInUsedError) {
          window.alert(this.$t(errorMessage))
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    // handleButtonUnCheck() {
    //   return window.confirm(this.$t('msg_NoCheck_0'))
    // },

    handleButtonAddOrder() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.$router.push(this.localePath({ path: '/finance/pay-browse/add' }))
      }
    },

    validateForm() {
      const errors = []
      const dataTable = this.availableListDetails

      const requiredFields = {
        entryDate: 'entryDate',
      }

      const requiredTableDetails = {
        date: 'date',
        subject: 'subject',
        creditAmount: 'creditAmount',
        opponentSubject: 'opponentSubject',
        debitAmount: 'debitAmount',
        currency: 'currency',
      }

      Object.keys(requiredFields).forEach((field) => {
        if (!this.form[field]) {
          errors.push({
            fieldName: this.$t(`lbl_PB${requiredFields[field]}_0`),
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
            if (!item[field]) {
              errors.push({
                fieldName: `${this.$t('lbl_PBLineID_0')} ${
                  item.lineID
                } - ${this.$t(`lbl_PB${requiredTableDetails[field]}_0`)}`,
                text: this.$t('msg_NoInput_0'),
              })
            }
          })
        })
      }

      if (this.form.margin !== 0) {
        errors.push({
          fieldName: this.$t(`lbl_PBMargin_0`),
          text: this.$t('msg_MustBeZero_0'),
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
          PBChecker: payload.checker,
          PBDepartmentID: payload.departmentID,
          PBEditDate: payload.editDate,
          PBEditor: payload.editor,
          PBEntryDate: payload.entryDate,
          PBMargin: payload.margin,
          PBMemo: payload.memo,
          PBOrderNumber: payload.orderNumber,
          PBResponsiblePerson: payload.responsiblePerson,
          PBTotalCreditAmount: payload.totalCreditAmount,
          PBTotalDebitAmount: payload.totalDebitAmount,
          listDetail: dataTableFilter.map((item) => {
            function findValueByText(list, key, fallback) {
              const matchedItem = list.find((item) => item.text === key)
              return matchedItem ? matchedItem.value : fallback
            }

            function findCompanyIdByName(list, companyName, fallback) {
              const matchedItem = list.find(
                (item) => item.companyName === companyName
              )
              return matchedItem ? matchedItem.id : fallback
            }

            const PBSubject = findValueByText(
              this.listAccountingItems,
              item.subject,
              item.subject
            )
            const PBCurrency = findValueByText(
              this.currencyOptions,
              item.currency,
              item.currency
            )
            const PBOppentSubject = findValueByText(
              this.listCurrentAssets,
              item.opponentSubject,
              item.opponentSubject
            )
            const PBCompanyname = findCompanyIdByName(
              this.customerNameList,
              item.companyName,
              item.companyName
            )
            return {
              PBCompanyName: PBCompanyname,
              PBCreditAmount: item.creditAmount,
              PBCurrency: PBCurrency,
              PBDate: item.date,
              PBDebitAmount: item.debitAmount,
              PBEmployee: item.employee,
              PBInvoiceDate: item.invoiceDate,
              PBInvoiceNotes: item.invoiceNotes,
              PBInvoiceNumber: item.invoiceNumber,
              PBIsInvoice: item.isInvoice,
              PBItemID: item.itemID,
              PBLineID: item.lineID,
              PBOpponentSubject: PBOppentSubject,
              PBReason: item.reason,
              PBSubject: PBSubject,
            }
          }),
        }

        try {
          this.loading = true
          const response = await api('editPB', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FOPBIDDEN) {
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
          this.loading = false
        }
      }
    },

    getMessageError(listError) {
      this.listErrorMessage = []
      this.listErrorMessage = [...this.listErrorMessage, ...listError]
    },

    async handleButtonDeleteOrder() {
      const params = {
        orderNo: this.form?.orderNumber,
      }
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        if (params.orderNo) {
          const response = await api('deletePayBrowsedDeleteAR', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_IsDeleted_0'))
            return this.$router.push(
              this.localePath({ path: '/finance/pay-browse' })
            )
          }
          window.alert(`${response?.message}`)
        }
      }
    },
    changeDataTable(data) {
      this.dataTable = data
    },

    handleImportData(data) {
      this.dataTable = this.availableListDetails
        .concat(data)
        .map((item, index) => ({
          ...item,
          promiseDate: this.convertDate(item.promiseDate),
          price: this.parseStringToFloat(item.price || 0),
          quantity: this.parseStringToFloat(item.quantity || 0),
          amount: this.parseStringToFloat(item.amount || 0),
          lineID: index + 1,
        }))

      this.addNewLineData()
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

    async handleDelete(selectedRows) {
      const itemIDs = selectedRows.map((row) => row.itemID)

      const queryString = itemIDs.map((id) => `IDs=${id}`).join('&')

      const params = {
        orderNo: this.form?.orderNumber,
        ID: queryString,
      }

      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        if (params.orderNo) {
          const response = await api('deletePayBrowsedDetailDeleteAR', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_IsDeleted_0'))
            return this.$router.push(
              this.localePath({ path: '/finance/pay-browse' })
            )
          }
          window.alert(`${response?.message}`)
        }
      }
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
