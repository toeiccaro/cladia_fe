<template>
  <div class="table__receive-browse d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      :active-rows="activeRows"
      class="table__receive-browse--body"
      :initial-filters="payloadPayBrowse"
      :update-filters-function="UPDATE_PAYLOAD_PAY_BROWSE"
      @search="filterAndSort"
      @row="handleRow"
      @changeLayout="changeLayout"
    >
      <slot :slot="'checkbox'">
        <div
          key="checkbox-attract"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <b-form-checkbox
            v-model="isCheckAll"
            @change="(event) => checkAll(event)"
          ></b-form-checkbox>
        </div>
      </slot>

      <slot v-for="(item, index) in dataTable" :slot="'checkbox-' + index">
        <div
          :key="`checkbox-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <b-form-checkbox
            v-model="listCheckbox[index].value"
            @change="onChangeCheckbox($event, index)"
          ></b-form-checkbox>
        </div>
      </slot>

      <slot v-for="(item, index) in dataTable" :slot="`PBIsStop-${index}`">
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <b-form-checkbox disabled :checked="item.PBIsStop" />
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadPayBrowse.pageSize"
      :current-page="payloadPayBrowse.pageNo"
      :number-item="dataTable.length"
      class="table__receive-browse--footer"
      :class="{
        'border--full': `${!total}`,
      }"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>
    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { payBrowseSchema } from '@/schemas/finance/pay-browse'
import commonOptionsMixins from '@/mixins/commonOptions'
import payBrowseMixins from '@/mixins/payBrowse'
import dateTimeMixins from '@/mixins/dateTime'
import api from '@/api/api'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
import { formatNumberWithCommas } from '~/utils/utils'

export default {
  components: { BaseTableDraggable, BasePagination, BaseTableLoader },
  mixins: [dateTimeMixins, commonOptionsMixins, payBrowseMixins],

  data() {
    return {
      loading: false,
      dataTable: [],
      dataFooter: {},
      dataRatio: [],
      total: 0,
      listCheckbox: [],
      lang: this.$i18n.locale,
      isLoadingTable: false,
      isCheckAll: false,
      listIgnoreFieldName: ['Blance'],
      dataHeader: [],
    }
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_PAY_BROWSE({
        language: this.lang,
      })
      await this.getData()
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },

  computed: {
    ...mapGetters({
      payloadPayBrowse: 'filterSort/getPayloadPayBrowse',
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
        if (item.key === 'PBReceiveDate') {
          temp.value = 'Total: '
          temp.align = 'center'
        }
        if (item.key === 'PBTotalAmount') {
          temp.value = this.dataFooter.Amount
          temp.align = 'right'
          temp.type = 'amount'
        }
        if (item.key === 'PBAmount') {
          temp.value = this.dataFooter.APAmount
          temp.align = 'right'
          temp.type = 'amount'
        }
        if (item.key === 'PBBalanceAmount') {
          temp.value = this.dataFooter.BlanceAmount
          temp.align = 'right'
          temp.type = 'amount'
        }
        return temp
      })
    },
    dataTableMapping() {
      const listAlignCenterFields = [
        'PBOrderNO',
        'PBInvoiceNO',
        'PBCurrency',
        'CustomerName',
        'PBStatement',
      ]
      const listAlignRightFields = [
        'PBTotalAmount',
        'PBAmount',
        'PBBalanceAmount',
      ]

      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadPayBrowse.pageSize *
                (this.payloadPayBrowse.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          checkbox: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          keyRow: item.payBrowseNo,
        }

        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )

          obj[mappingFieldName] = {
            value: item[mappingFieldName] || '',
          }

          if (listAlignCenterFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'center'
          }

          if (listAlignRightFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName] = {
              value: formatNumberWithCommas(item[mappingFieldName]) || 0,
              align: 'right',
              type: 'pbamount',
            }
          }

          if (headerItem.fieldName === 'PBOrderNO') {
            obj[mappingFieldName].type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''
            obj[mappingFieldName].link =
              obj[mappingFieldName].value.slice(0, 3) == 'PIV'
                ? `/${this.$i18n.locale}/finance/pay-browse/detail?sono=${obj[mappingFieldName].value}`
                : `/${this.$i18n.locale}/finance/pay-browse/detailAROrAP?sono=${obj[mappingFieldName].value}`
          }

          if (headerItem.fieldName === 'PBDate') {
            obj[mappingFieldName].value = this.convertDate(item.PBDate)
            obj[mappingFieldName].align = 'center'
          }

          if (headerItem.fieldName === 'PBReceiveDate') {
            obj[mappingFieldName].value = this.convertDate(item.PBReceiveDate)
            obj[mappingFieldName].align = 'center'
            const currentDate = new Date().getTime()
            const PBReceiveDate = new Date(item.PBReceiveDate).getTime()
            const isNotPaidEnough = item.PBBalanceAmount > 0 && !item.PBIsStop
            if (isNotPaidEnough && PBReceiveDate < currentDate) {
              obj[mappingFieldName].color = 'red'
            }
          }

          if (headerItem.fieldName === 'PBStatement') {
            obj[mappingFieldName].type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''
            obj[
              mappingFieldName
            ].link = `/${this.$i18n.locale}/finance/pay-browse/detail?payBrowse=${item.id}`
          }

          if (headerItem.fieldName === 'PBIsStop') {
            obj[mappingFieldName].type = 'slot'
          }
        })
        return obj
      })
      return data
    },
    headerMapping() {
      const listNumberField = [
        'PBTotalAmount',
        'PBAmount',
        'PBBalanceAmount',
        'PBIsStop',
        'PBCurrency',
        'PBDate',
        'PBReceiveDate',
      ]
      const header = [
        {
          key: 'index',
          name: '',
          width: 40,
          canNotSort: true,
        },
        {
          key: 'checkbox',
          name: '',
          width: 40,
          type: 'slot',
          canNotSort: true,
        },
      ]

      const listOptionsFields = ['PBIsStop']

      this.listDataShow.forEach((item) => {
        const maxLength = listNumberField.includes(item.fieldName)
          ? '125'
          : '200'
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || payBrowseSchema,
            item.fieldName
          ),
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: listOptionsFields.includes(item.fieldName)
            ? 'select'
            : 'input',
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          width: maxLength,
        }
        if (item.fieldName === 'PBIsStop') {
          headerItem.options = this.checkAccountOptions
        }
        header.push(headerItem)
      })

      return header
    },
    activeRows() {
      const currentActiveRows = this.listCheckbox.map((item, index) => {
        if (item.value) {
          return index
        }

        return null
      })

      return currentActiveRows.filter((item) => item || item === 0)
    },
  },

  watch: {
    dataTable: {
      deep: true,
      immediate: true,
      handler(value) {
        this.listCheckbox = value.map((item) => ({
          id: item.id,
          value: false,
          customerId: item.customerID,
          amount: item.amount,
          apamount: item.apamount,
          pbBlanceAmount: item.pbBlanceAmount,
          PBIsStop: item.PBIsStop,
        }))
      },
    },

    listCheckbox: {
      deep: true,
      handler(data) {
        if (!data.length) {
          return
        }

        const allChecked = data.every((item) => item.value)
        if (allChecked) {
          return (this.isCheckAll = true)
        }

        this.isCheckAll = false
      },
    },
  },
  created() {
    const isCheck = this.$route.query?.PBIsStop

    const payload = {
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    }

    if (isCheck) {
      payload.PBIsStop = 0
    }
    this.$router.replace({ query: null })
    this.SET_PAYLOAD_PAY_BROWSE(payload)
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_PAY_BROWSE: 'filterSort/UPDATE_PAYLOAD_PAY_BROWSE',
      SET_PAYLOAD_PAY_BROWSE: 'filterSort/SET_PAYLOAD_PAY_BROWSE',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),

    onChangeCheckbox(event, index) {
      this.listCheckbox[index].value = !this.listCheckbox[index].value
    },
    checkAll(value) {
      this.listCheckbox = this.listCheckbox.map((item) =>
        Object.assign({}, item, { value })
      )
    },
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_PAY_BROWSE(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_PAY_BROWSE({
        pageNo: Number(value),
      })
      this.getData()
    },
    handleRow(payload) {
      const { index } = payload
      this.listCheckbox[index].value = !this.listCheckbox[index].value

      this.$emit('handleDetailId', { ...payload?.item })
    },
    async filterAndSort() {
      try {
        this.loading = true
        const res = await api('getPayBrowses', this.payloadPayBrowse)

        this.isCheckAll = false

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataTable = res.data.tableContent?.content
          this.total = res.data.tableContent?.totalElements
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async getData() {
      try {
        this.isLoadingTable = true
        const res = await api('getPayBrowses', this.payloadPayBrowse)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        this.dataTable = res.data.tableContent?.content
        this.dataFooter = res.data?.tableFooter || {}
        this.total = res.data.tableContent?.totalElements
        this.dataHeader = res.data?.scolumnHides
        this.SET_DATA_COLUMN_HIDE(
          this.dataHeader.filter(
            (_el) => !this.listIgnoreFieldName.includes(_el.fieldName)
          )
        )
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoadingTable = false
      }
    },
    async refresh() {
      await this.getData()
    },
    handleDetailId(data) {
      this.$emit('handleDetailId', data)
    },
    mappingProperty(item, fieldName) {
      for (const property in item) {
        if (property.toLowerCase() === fieldName.toLowerCase()) {
          return property
        }
      }
      return ''
    },

    changeLayout(data) {
      this.$emit('changeLayout', data, this.listDataShow)
    },
  },
}
</script>
<style lang="scss" scoped>
.table__receive-browse {
  height: calc(100% - 70px);
  .table__receive-browse--body {
    height: calc(100% - 26px);
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
}
</style>
