<template>
  <div class="edit-receive-browse-order-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    ></BaseValidateMessage>
    <PayBrowseDetailForm
      :data="payBrowseData"
    ></PayBrowseDetailForm>
    <PayBrowseDetailTable
      ref="payBrowseDetailForm"
      :data="[...filteredDataTable, addDetails]"
      :list-item-master="listItemMaster"
      :data-total-table="dataTotalTable"
      @calculated-aramount="setArAmount"
      @add-detail="(data) => (addDetails = data)"
      @changeTable="changeDataTable"
      @validation-errors="(data) => (listErrorMessage = data)"
      @refresh-data="refresh"
      @filter="(data) => filterDetails(data)"
    ></PayBrowseDetailTable>
    <BaseTableLoader v-if="loading" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
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

export default {
  components: {
    ToolBar,
    PayBrowseDetailForm,
    PayBrowseDetailTable,
    BaseValidateMessage,
    BaseTableLoader,
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
      addDetails: {
        PBAmount: '',
        PBOtherAmount: '',
        PBExpenseCategory:'',
        PBDate: '',
        PBApUser: '',
        PBMemo: '',
        isUpdate: true,
        isNewLine: true,
      },
    }
  },
  async fetch() {
    await Promise.all([this.getListItemMaster(), this.getData()])
  },
  computed: {
    ...mapGetters('base', ['getActiveButtonToolBar']),

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
        this.filterDetails()
      },
    },
  },
  methods: {
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

    async handleAction(key) {
      try {
        if (key === 'add') {
          const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
          if (confirm) {
            this.filteredDataTable.data.receiveBrowsDTL.push({
              PBAmount: '',
              PBOtherAmount: '',
              PBExpenseCategory: '',
              PBDate: '',
              PBApUser: '',
              PBMemo: '',
              isUpdate: true,
              isNewLine: true,
            })          }
        }
        if (key === 'save') {
          return await this.save()
        }
        if (key === 'delete') {
          try {
            const selectedDetailItems =
              this.$refs.payBrowseDetailForm.itemDetailAvailable

            const hasNoSelectedDetailItems = selectedDetailItems.every(
              (item) => !item.value
            )

            if (hasNoSelectedDetailItems) {
              return window.alert(this.$t('msg_NoSelected_0'))
            }

            const confirm = window.confirm(this.$t('msg_ConfirmDelDetail_0'))
            if (!confirm) {
              return
            }

            this.loading = true

            const deletePayBrowsePromises = selectedDetailItems.map(
              async (item) => {
                if (item.value) {
                  return await api('deletePayBrowseDetail', {
                    idDTL: item.id,
                  })
                }
              }
            )

            await Promise.all(deletePayBrowsePromises)

            await this.getData()

            this.$refs.payBrowseDetailForm.selectedItem = {}

            window.alert(this.$t('msg_IsDeleted_0'))
          } catch (err) {
            console.error(err)
          }

          return
        }
        if (key === 'close') {
          return this.$router.push(this.localePath({ path: '/' }))
        }
        if (key === 'back') {
          return this.$router.push(
            this.localePath({ path: '/finance/receive-browse' })
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
        console.log('this.payBrowseData', this.payBrowseData.payBrowsDTL);

        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }
        
        await this.addOrUpdateItem(this.payBrowseData)
        this.addDetails = {
          PBAmount: '',
          PBOtherAmount: '',
          PBExpenseCategory: '',
          PBDate: '',
          PBApUser: '',
          PBMemo: '',
          isUpdate: true,
          isNewLine: true,
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async addOrUpdateItem(payload) {
      try {
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
    async getData() {
      try {
        this.loading = true

        const res = await api('getInvoiceDetailPB', {
          orderNo: this.$route.query?.sono,
          language: this.$i18n.locale,
        })

        const validPayResponse =
          res && res.status === SERVER_RESPONSE_CODE.OK

        if (validPayResponse) {

          this.payBrowseData = res?.data
          this.dataTable = res?.data?.receiveBrowsDTL || []
          
          const totalAmount = this.dataTable.reduce((sum, item) => sum + item.amount, 0);

          this.dataTotalTable = {
            PBAmount: totalAmount,
            PBOtherAmount: "",
            PBExpenseCategory: "",
            PBDate: this.convertDate(new Date()),
            PBApUser: "",
            PBMemo: "",
            isUpdate: true,
            isNewLine: true,
          }
          
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

    async refresh() {
      await this.getData()
    },

    changeDataTable(data) {
      this.dataTable = data
      this.receiveBrowseData.receiveBrowsDTL = data;
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
