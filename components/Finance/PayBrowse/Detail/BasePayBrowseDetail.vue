<template>
  <div class="edit-receive-browse-order-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    ></BaseValidateMessage>
    <PayBrowseDetailForm :data="payBrowseData"></PayBrowseDetailForm>
    <BaseTableItemDetail
      ref="PBFormTableItems"
      class="pb-table-details"
      :table-content="dataTable"
      :table-type="'PB'"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :new-line="newLine"
      :form="payBrowseData"
      @changeTable="changeDataDetailTable"
      :onDelete="handleDelete"
    ></BaseTableItemDetail>
    <BaseTableLoader v-if="loading" />
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import { searchDetails, formatNumberWithCommas } from '@/utils/utils'
import { SERVER_RESPONSE_CODE } from '@/constants'
import systemMixins from '@/mixins/system'
import ToolBar from '@/components/UI/ToolBar.vue'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import PayBrowseDetailTable from '@/components/Finance/PayBrowse/PayBrowseDetailTable'
import PayBrowseDetailForm from '@/components/Finance/PayBrowse/Detail/PayBrowseDetailForm.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import { parseToNumber } from '@/utils/utils'

export default {
  components: {
    ToolBar,
    PayBrowseDetailForm,
    PayBrowseDetailTable,
    BaseValidateMessage,
    BaseTableLoader,
    BaseTableItemDetail,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      lang: this.$i18n.locale,
      payBrowseData: {},
      loading: false,
      listItemMaster: [],
      hasError: false,
      listErrorMessage: [],
      dataTotalTable: {},
      dataTable: [],
      filteredDataTable: [],
      columnHides: [],
      listEmployee: [],
      listFieldCheck: [
        {
          key: 'PBBalanceAmount',
          fieldName: this.$t('lbl_PBBalanceAmount_0'),
        },
        {
          key: 'PBActualAmount',
          fieldName: this.$t('lbl_PBActualAmount_0'),
        },
      ],
      listFieldRequired: [
        {
          key: 'PBOpponentSubjectId',
          fieldName: this.$t('lbl_PBOpponentSubjectId_0'),
        },
      ],
    }
  },
  async fetch() {
    const res = await api('getEmployeeList')
    if (res && res.status === SERVER_RESPONSE_CODE.OK) {
      this.listEmployee = res.data || {}
    }

    await Promise.all([
      this.getListItemMaster(),
      this.getData(),
      this.getScolumnHides(),
    ])
  },
  computed: {
    ...mapGetters('base', ['getActiveButtonToolBar']),

    ...mapGetters('base', {
      listAccountingItems: 'getListAccountingItems',
    }),

    listEmployeeName() {
      const result = []
      for (const key in this.listEmployee) {
        const employeeValue = this.listEmployee[key] || ''
        const lastIndexOfOpenParenthese = employeeValue.lastIndexOf('(') || 0

        const appendText = employeeValue.substring(lastIndexOfOpenParenthese)
        const responsibleManValue = employeeValue.substring(
          0,
          lastIndexOfOpenParenthese
        )

        result.push({
          text: responsibleManValue,
          value: responsibleManValue,
          appendText,
        })
      }
      return result
    },

    itemListAccountingItems() {
      return this.listAccountingItems.map((item) => ({
        text: item.text,
        value: item.text,
      }))
    },

    isCheck() {
      return !!(this.payBrowseData?.checker && this.payBrowseData.checkDate)
    },

    newLine() {
      return {
        amount: 0,
        otherAmount: '',
        expenseCategory: '',
        date: '',
        apUser: '',
        memo: '',
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
          key: 'amount',
          name: this.$t('lbl_PBAmount_0'),
          filter: 'number',
          width: `12%`,
          align: 'right',
          fieldRequired: true,
        },
        {
          key: 'otherAmount',
          name: this.$t('lbl_PBOtherAmount_0'),
          filter: 'number',
          width: `12%`,
          align: 'right',
        },
        {
          key: 'expenseCategory',
          name: this.$t('lbl_PBExpenseCategory_0'),
          filter: 'select',
          width: `24%`,
          options: this.itemListAccountingItems,
        },
        {
          key: 'date',
          name: this.$t('lbl_PBPaymentDate_0'),
          filter: 'datetime',
          width: `12%`,
          fieldRequired: true,
        },
        {
          key: 'apUser',
          name: this.$t('lbl_PBApUser_0'),
          filter: 'select',
          width: `12%`,
          options: this.listEmployeeName,
          fieldRequired: true,
        },
        {
          key: 'memo',
          name: this.$t('lbl_PBMemo_0'),
          filter: 'input',
          width: `18%`,
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
        },
        {
          key: 'delete',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
          disabled: !this.getActiveButtonToolBar.isDelete,
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
  },
  watch: {
    dataTable: {
      deep: true,
      handler(data) {
        this.handleDate(data)
        this.handleAmountTable(data)
        this.filterDetails()
      },
    },
  },
  methods: {
    ...mapActions('base', ['getListAccountingItems']),

    async getScolumnHides() {
      const response = await api('getScolumnHides', {
        gridName: 'PayBrowsePurchaseInvoiceDetail',
      })
      if (response.status === 200) {
        this.columnHides = response?.data || []
      }
    },

    setArAmount(data) {
      this.payBrowseData.amount = formatNumberWithCommas(data) || 0
    },
    async getListItemMaster() {
      const res = await api('getItemCode')
      if (res && res.status === SERVER_RESPONSE_CODE.OK) {
        this.listItemMaster = res?.data
      }
    },
    filterDetails(filterData = {}) {
      this.filteredDataTable = searchDetails({
        data: this.dataTable,
        filterData: JSON.parse(JSON.stringify(filterData)),
      })
    },

    handleAmountTable(data = []) {
      //amount
      const totalAmount = data.reduce((sum, item, index) => {
        return index < data.length - 1 ? sum + Number(item.amount) : sum
      }, 0)
      this.payBrowseData.PBBalanceAmount = formatNumberWithCommas(
        parseToNumber(this.payBrowseData.PBTotalAmount) - totalAmount
      )

      //orther Amount
      const totalOrtherAmount = data.reduce(
        (sum, item) => sum + Number(item.otherAmount),
        0
      )
      this.payBrowseData.PBOtherExpensesAmount =
        formatNumberWithCommas(totalOrtherAmount)

      //actual Amount
      this.payBrowseData.PBActualAmount = formatNumberWithCommas(
        parseToNumber(this.payBrowseData.PBTotalAmount) - totalOrtherAmount
      )
    },

    handleDate(data = []) {
      data.forEach((item) => {
        item.date = this.convertDate(item.date)
      })
    },

    changeDataDetailTable(data) {
      this.dataTable = data
    },

    async handleAction(key) {
      try {
        if (key === 'add') {
          const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
          if (confirm) {
            const lastPB =
              this.payBrowseData.payBrowsDTL[
                this.payBrowseData.payBrowsDTL.length - 1
              ]
            if (lastPB) {
              lastPB.amount = ''
              lastPB.otherAmount = ''
              lastPB.expenseCategory = ''
              lastPB.date = ''
              lastPB.apUser = ''
              lastPB.memo = ''
            }
          }
        }
        if (key === 'save') {
          return await this.save()
        }

        if (key === 'delete') {
          return await this.handleButtonDeleteOrder()
        }
        if (key === 'close') {
          return this.$router.push(this.localePath({ path: '/' }))
        }
        if (key === 'back') {
          return this.$router.push(
            this.localePath({ path: '/finance/pay-browse' })
          )
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    // eslint-disable-next-line require-await
    async save() {
      try {
        this.loading = true
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }
        this.listErrorMessage = []

        this.listFieldCheck.forEach((item) => {
          if (parseToNumber(this.payBrowseData[item.key]) < 0) {
            this.listErrorMessage.push({
              fieldName: item.fieldName,
              text: this.$t('msg_MustNotLessZero_0'),
            })
          }
        })

        this.listFieldRequired.forEach((item) => {
          if (!this.payBrowseData[item.key]) {
            this.listErrorMessage.push({
              fieldName: item.fieldName,
              text: this.$t('msg_NoInput_0'),
            })
          }
        })

        this.payBrowseData.payBrowsDTL = this.dataTable

        this.payBrowseData.payBrowsDTL.map((item, index) => {
          if(index < this.payBrowseData.payBrowsDTL.length - 1 ) {
            const sameFields = {
              otherAmount: 'PBOtherAmount',
              expenseCategory: 'PBExpenseCategory',
            }

            let otherAmount = !!item['otherAmount']
            let expenseCategory = !!item['expenseCategory']

            if (
              !(otherAmount && expenseCategory) &&
              (otherAmount || expenseCategory)
            ) {
              for (const key in sameFields) {
                if (!item[key]) {
                  this.listErrorMessage.push({
                    fieldName: `${this.$t('lbl_LineID_0')} ${
                      item.lineID
                    } - ${this.$t(`lbl_${sameFields[key]}_0`)}`,
                    text: this.$t('msg_NoInput_0'),
                  })
                }
              }
            }

            const requiredFields = {
              amount: 'PBAmount',
              date: 'PBDate',
              apUser: 'PBApUser',
            }

            for (const key in requiredFields) {
              if (!item[key]) {
                this.listErrorMessage.push({
                  fieldName: `${this.$t('lbl_LineID_0')} ${
                    item.lineID
                  } - ${this.$t(`lbl_${requiredFields[key]}_0`)}`,
                  text: this.$t('msg_NoInput_0'),
                })
              }
            }
          }
        })

        if (this.listErrorMessage.length > 0) {
          return
        }

        await this.addOrUpdateItem(this.payBrowseData)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async addOrUpdateItem(data) {
      data.payBrowsDTL.pop()
      try {
        const payload = {
          PBMstId: data.PBMstId,
          PBOrderNumber: data.PBOrderNumber,
          PBCustomerId: data.PBCustomerId,
          PBTotalAmount: parseToNumber(data.PBTotalAmount),
          PBMemo: data.PBMemo,
          PBSubjectId: data.PBSubjectId,
          PBOpponentSubjectId: data.PBOpponentSubjectId,
          PBCurrencyId: data.PBCurrencyId,
          PBBalanceAmount: parseToNumber(data.PBBalanceAmount),
          PBActualAmount: parseToNumber(data.PBActualAmount),
          PBOtherExpensesAmount: parseToNumber(data.PBOtherExpensesAmount),
          payBrowsDTL: data.payBrowsDTL.map((item) => {
            const PBExpenseCategory = this.findValueByText(
              this.listAccountingItems,
              item.expenseCategory
            )

            return {
              PBLineID: item.lineID,
              PBAmount: typeof item.amount === "string" ? parseToNumber(item.amount) : item.amount,
              PBOtherAmount: typeof item.otherAmount === "string" ? parseToNumber(item.otherAmount) : item.otherAmount,
              PBExpenseCategory: Number(PBExpenseCategory),
              PBDate: item.date,
              PBApUser: item.apUser,
              PBMemo: item.memo,
              PBItemID: item.itemID ? item.itemID : null,
            }
          }),
        }
        // return console.log('payload', payload);
        const res = await api('editInvoicePB', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          window.alert(this.$t('msg_IsSaved_0'))
          this.refresh()
        }
      } catch (err) {
        console.error(err)
      }
    },

    async handleButtonDeleteOrder() {
      const params = {
        orderNo: this.payBrowseData?.PBOrderNumber,
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
    async getData() {
      try {
        this.loading = true

        const res = await api('getInvoiceDetailPB', {
          orderNo: this.$route.query?.sono,
          language: this.$i18n.locale,
        })

        const validPayResponse = res && res.status === SERVER_RESPONSE_CODE.OK

        if (validPayResponse) {
          this.payBrowseData = res?.data

          this.dataTable =
            res?.data?.payBrowsDTL.map((item) => {
              const newObject = {}
              for (const key in item) {
                let newKey = key.replace(/^PB/, '')
                newKey = newKey[0].toLowerCase() + newKey.slice(1)
                newObject[newKey] = item[key]

                let expenseCategoryID = 0
                setTimeout(() => {
                  if (newKey == 'expenseCategory' && this.listAccountingItems) {
                    expenseCategoryID = this.listAccountingItems.find(
                      (item) => item.value == newObject.expenseCategory
                    )
                    newObject.expenseCategory = expenseCategoryID.text
                  }
                }, 100)
              }
              return newObject
            }) || []

          const totalAmount = this.dataTable.reduce(
            (sum, item) => sum + item.amount,
            0
          )

          this.dataTable.push({
            lineID: this.dataTable.length + 1,
            amount: formatNumberWithCommas(
              res?.data?.PBTotalAmount - totalAmount
            ),
            otherAmount: '',
            expenseCategory: '',
            date: '',
            apUser: '',
            memo: '',
            isUpdate: true,
            isNewLine: true,
          })

          this.payBrowseData.PBBalanceAmount = formatNumberWithCommas(
            this.payBrowseData.PBBalanceAmount
          )
          this.payBrowseData.PBActualAmount = formatNumberWithCommas(
            this.payBrowseData.PBActualAmount
          )
          this.payBrowseData.PBTotalAmount = formatNumberWithCommas(
            this.payBrowseData.PBTotalAmount
          )
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async handleDelete(selectedRows) {
      const itemIDs = selectedRows.map((row) => row.itemID)

      const queryString = itemIDs.map((id) => `PBItemIDs=${id}`).join('&')
      const params = {
        PBMstId: this.payBrowseData?.PBMstId,
        ID: queryString,
      }
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))

      if (confirm) {
        if (params.PBMstId) {
          const response = await api(
            'deletePayBrowsedDetailDeleteInvoice',
            params
          )
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_IsDeleted_0'))
           this.getData()
          }
          window.alert(`${response?.message}`)
        }
      }
    },

    async refresh() {
      await this.getData()
    },

    changeDataTable(data) {
      this.dataTable = data
      this.payBrowseData.payBrowsDTL = data
    },
  },
}
</script>
<style lang="scss" scoped>
.edit-receive-browse-order-page {
  background: #ffffff 50% bottom repeat-x;
  color: #222222;
  position: relative;
  padding: 0.2em;
  zoom: 1;
  font-size: 1.1em;
}
</style>
