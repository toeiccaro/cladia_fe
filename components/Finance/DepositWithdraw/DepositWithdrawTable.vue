<template>
  <div class="table__receive-browse d-flex flex-column position-relative">
    <DepositWithdrawForm :key="refreshAddPBFormKey" :data="form" />
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      class="table__receive-browse--body"
      :initial-filters="payloadDepositWithdrawQuery"
      :update-filters-function="UPDATE_PAYLOAD_DEPOSIT_WITHDRAW_QUERY"
      @search="filterAndSort"
      @row="handleDetailId"
      @changeLayout="changeLayout"
    >
      <slot v-for="(item, index) in dataTable" :slot="'icon-' + index">
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <img v-if="item.isAttach" src="@/assets/icon/attach.png" alt="" />
        </div>
      </slot>
      <slot v-for="(item, index) in dataTable" :slot="`isCheck-${index}`">
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <b-form-checkbox disabled :checked="item.isCheck" />
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadDepositWithdrawQuery.pageSize"
      :current-page="payloadDepositWithdrawQuery.pageNo"
      :number-item="dataTable.length"
      class="table__receive-browse--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>
    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { payDepositWithdraw } from '@/schemas/finance/deposit-withdraw'
import api from '@/api/api'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import DepositWithdrawForm from '~/components/Finance/DepositWithdraw/DepositWithdrawForm'
import dateTime from '~/mixins/dateTime'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
import { formatNumberWithCommas } from '@/utils/utils'
export default {
  components: {
    BaseTableDraggable,
    BasePagination,
    BaseTableLoader,
    DepositWithdrawForm,
  },
  mixins: [dateTime],

  data() {
    return {
      loading: false,
      isLoadingTable: false,
      dataTable: [],
      dataHeader: [],
      total: 0,
      lang: this.$i18n.locale,
      listIgnoreFieldName: ['Blance'],
      selectedYear: null,
      yearOptions: [],
      isDisabled: false,
      refreshAddPBFormKey: 0,

      defaultFormData: {
        startDate: '',
        endDate: '',
        bankId: '',
        currencyId: '',
      },
      // form: {},
    }
  },

  async fetch() {
    try {
      this.form = Object.assign({}, this.defaultFormData)
      this.loading = true
      this.UPDATE_PAYLOAD_DEPOSIT_WITHDRAW_QUERY({
        language: this.lang,
      })
      await Promise.all([this.getData(), this.getUnitOptions(this.lang)])
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },

  computed: {
    ...mapGetters({
      unitOptions: 'base/getUnitOptions',
      payloadDepositWithdrawQuery: 'filterSort/getPayloadDepositWithdrawQuery',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),
    checkAccountOptions() {
      return [
        { text: '', value: '' },
        { text: 'Yes', value: 1 },
        { text: 'No', value: 0 },
      ]
    },
    listDataShow() {
      return this.dataHeader
        .filter((_el) => !this.listIgnoreFieldName.includes(_el.fieldName))
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },

    dataTotalMapping() {
      return this.headerMapping.map((item) => {
        const temp = {
          key: item.key,
          value: '',
          type: 'text',
        }

        return temp
      })
    },

    dataTableMapping() {
      const listAlignRightFields = ['DWDDebit', 'DWDCredit', 'DWDBankBalance']
      const listAlignCenterFields = ['DWDDate', 'DWDCurrency']
      const data = this.dataTable?.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadDepositWithdrawQuery.pageSize *
                (this.payloadDepositWithdrawQuery.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          icon: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          keyRow: item.DWDBankBalance,
        }

        this.listDataShow?.forEach((headerItem) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )
          obj[mappingFieldName] = {
            value: item[mappingFieldName] || '',
          }

          if (listAlignRightFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName] = {
              value:
                item[mappingFieldName] !== null
                  ? formatNumberWithCommas(item[mappingFieldName])
                  : '',
              align: 'right',
              type: 'amount',
            }
          }

          if (listAlignRightFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'right'
          }
          if (listAlignCenterFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'center'
          }
        })

        return obj
      })

      return data
    },
    headerMapping() {
      const listNumberField = []
      const header = [
        {
          key: 'index',
          name: '',
          width: 40,
        },
      ]
      const getHeaderItem = (item) => {
        const maxLength = listNumberField.includes(item.fieldName)
          ? '30'
          : '256'
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || payDepositWithdraw,
            item.fieldName
          ),
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: item.fieldName === 'IsCheck' ? 'select' : 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          maxLength,
        }

        if (item.fieldName === 'IsCheck') {
          headerItem.options = this.checkAccountOptions
        }

        switch (item.fieldName) {
          case 'Editdate':
            headerItem.name = this.$t('lbl_EditDate_0')
            break
          case 'Orderdate':
            headerItem.name = this.$t('lbl_OrderDate_0')
            break
          case 'Department':
            headerItem.name =
              this.lang === 'japanese'
                ? this.$t('lbl_DepartType_0')
                : this.$t('lbl_Department_0')
            break
          default:
            break
        }

        return headerItem
      }

      this.listDataShow.forEach((item) => {
        header.push(getHeaderItem(item))
      })

      return header
    },
  },
  created() {
    this.generateYearOptions()
    const isCheck = this.$route.query?.isCheck
    const payload = {
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    }

    if (isCheck) {
      payload.isCheck = 0
    }
    this.$router.replace({ query: null })
    this.SET_PAYLOAD_DEPOSIT_WITHDRAW_QUERY(payload)
  },
  methods: {
    ...mapActions('base', ['getUnitOptions']),
    ...mapMutations({
      UPDATE_PAYLOAD_DEPOSIT_WITHDRAW_QUERY:
        'filterSort/UPDATE_PAYLOAD_DEPOSIT_WITHDRAW_QUERY',
      SET_PAYLOAD_DEPOSIT_WITHDRAW_QUERY:
        'filterSort/SET_PAYLOAD_DEPOSIT_WITHDRAW_QUERY',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_DEPOSIT_WITHDRAW_QUERY(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_DEPOSIT_WITHDRAW_QUERY({
        pageNo: Number(value),
      })
      this.getData()
    },
    async getData() {

      const queryString = new URLSearchParams(this.form).toString()

      try {
        this.isLoadingTable = true

        this.UPDATE_PAYLOAD_DEPOSIT_WITHDRAW_QUERY({
          ...this.payloadDepositWithdrawQuery,
          queryString,
        })

        const res = await api(
          'querySearchDepositWithdrawTable',
          this.payloadDepositWithdrawQuery
        )

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataHeader = res.data?.scolumnHides
          this.dataTable = res.data.tableContent?.content
          this.total = res.data.tableContent?.totalElements
          this.SET_DATA_COLUMN_HIDE(
            this.dataHeader.filter(
              (_el) => !this.listIgnoreFieldName.includes(_el.fieldName)
            )
          )
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoadingTable = false
      }
    },
    async filterAndSort() {
      try {
        this.loading = true
        this.UPDATE_PAYLOAD_DEPOSIT_WITHDRAW_QUERY({
          ...this.payloadDepositWithdrawQuery,
          ...this.form,

          // form:{},
        })
        const res = await api(
          'querySearchDepositWithdrawTable',
          this.payloadDepositWithdrawQuery
        )
        this.loading = false

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataTable = res.data.tableContent?.content
          this.total = res.data.tableContent?.totalElements
        }
      } catch (err) {
        window.alert(err?.data?.response?.data?.message)
      } finally {
        this.loading = false
      }
    },

    refresh() {
      this.getData()
    },
    handleDetailId(data) {
      this.$emit('handleDetailId', data.keyRow)
    },
    changeLayout(data) {
      this.$emit('changeLayout', data, this.listDataShow)
    },
    mappingProperty(item, fieldName) {
      for (const property in item) {
        if (property.toLowerCase() === fieldName.toLowerCase()) {
          return property
        }
      }
      return ''
    },

    mapUnit(unitId) {
      return (
        this.unitOptions.find((item) => unitId && item.value === unitId)
          ?.text || ''
      )
    },
    generateYearOptions() {
      const currentYear = ''
      
      const secondYear = new Date().getFullYear()
      const startYear = secondYear - 5
      const endYear = secondYear + 5

      this.yearOptions = []
      for (let year = startYear; year <= endYear; year++) {
        this.yearOptions.push({ value: year, text: year.toString() })
      }

      this.selectedYear = currentYear
    },
  },
}
</script>
<style lang="scss" scoped>
.table__receive-browse {
  height: calc(100% - 72px);

  .table__receive-browse--body {
    height: calc(100% - 60px);
  }
  .table__receive-browse--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border: 1px solid #5180d8;
    border-top: 0;
  }
  .border--full {
    border-top: 1px solid #5180d8 !important;
  }
  .border--full {
    border-top: 1px solid #5180d8 !important;
  }
}
</style>
