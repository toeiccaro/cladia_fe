<template>
  <div class="table-return d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      class="table-return--body"
      :initial-filters="payloadSaleReturn"
      :update-filters-function="UPDATE_PAYLOAD_SALE_RETURN"
      @search="filterAndSort"
      @row="handleRow"
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
          <input
            type="checkbox"
            class="checkbox"
            disabled
            :checked="item.isCheck"
          />
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadSaleReturn.pageSize"
      :current-page="payloadSaleReturn.pageNo"
      :number-item="dataTable.length"
      class="table-return--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { saleReturnSchema } from '@/schemas/sales/sale-return'
import api from '@/api/api'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import dateTime from '~/mixins/dateTime'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
  components: { BasePagination, BaseTableDraggable, BaseTableLoader },
  mixins: [dateTime],
  data() {
    return {
      isLoadingTable: false,
      loading: false,
      dataTable: [],
      dataHeader: [],
      total: 0,
      lang: this.$i18n.locale,
    }
  },
  computed: {
    ...mapGetters({
      payloadSaleReturn: 'filterSort/getPayloadSaleReturn',
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
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    dataTableMapping() {
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadSaleReturn.pageSize *
                (this.payloadSaleReturn.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          icon: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          keyRow: item.rtNO,
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )
          const listNumber = ['Amount', 'InQuantity', 'RtQuantity']
          obj[mappingFieldName] = { value: item[mappingFieldName] || '' }
          if (headerItem.fieldName === 'IsCheck') {
            obj[mappingFieldName].type = 'slot'
          }
          if (headerItem.fieldName === 'UnitID') {
            obj[mappingFieldName].value = item.unit
          }
          if (headerItem.fieldName === 'WarehouseID') {
            obj[mappingFieldName].value = item.warehouse
          }
          if (listNumber.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value =
              this.numberRemoveComas(item[mappingFieldName]) || 0
          }
          const listConvertDate = ['RtDate', 'EditDate', 'CheckDate']
          if (listConvertDate.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
            obj[mappingFieldName].align = 'center'
          }
          const alignRight = ['RtQuantity', 'Price', 'Amount', 'InQuantity']
          if (alignRight.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'right'
          }
          if (headerItem.fieldName === 'RtNo') {
            obj[mappingFieldName].type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''
            obj[
              mappingFieldName
            ].link = `/${this.$i18n.locale}/sales/sales-return/detail?returnNo=${item.rtNO}`
          }
        })
        return obj
      })
      return data
    },
    dataTotalMapping() {
      return this.headerMapping.map((item) => {
        const temp = {
          key: item.key,
          value: '',
          type: 'text',
        }
        if (item.key === 'itemName') {
          temp.value = 'Total: '
        }
        if (item.key === 'rtQuantity') {
          temp.value = this.calculateTotal('rtQuantity')
          temp.type = 'amount'
          temp.align = 'right'
        }
        if (item.key === 'amount') {
          temp.value = this.calculateTotal('amount')
          temp.type = 'amount'
          temp.align = 'right'
        }
        if (item.key === 'inQuantity') {
          temp.value = this.calculateTotal('inQuantity')
          temp.type = 'amount'
          temp.align = 'right'
        }
        if (item.key === 'isCheck') {
          temp.type = 'checkbox'
        }
        return temp
      })
    },
    headerMapping() {
      const listNumberField = ['Amount', 'InQuantity', 'RtQuantity']
      const header = [
        {
          key: 'index',
          name: '',
          width: 40,
        },
        {
          key: 'icon',
          name: '',
          width: 40,
        },
      ]
      this.listDataShow.forEach((item) => {
        const maxLength = listNumberField.includes(item.fieldName) ? '30' : '256'
        const headerItem = {
          key: this.mappingProperty(saleReturnSchema, item.fieldName),
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: item.fieldName === 'IsCheck' ? 'select' : 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          maxLength,
        }

        if (item.fieldName === 'InQuantity') {
          headerItem.name = this.$t('lbl_InQuantity _0')
        }
        if (item.fieldName === 'IsCheck') {
          headerItem.options = this.checkAccountOptions
        }
        header.push(headerItem)
      })
      return header
    },
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_SALE_RETURN({
        language: this.lang,
      })
      await this.getData()
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  created() {
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
    this.SET_PAYLOAD_SALE_RETURN(payload)
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_SALE_RETURN: 'filterSort/UPDATE_PAYLOAD_SALE_RETURN',
      SET_PAYLOAD_SALE_RETURN: 'filterSort/SET_PAYLOAD_SALE_RETURN',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),
    calculateTotal(key) {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item[key]) {
          sum += this.numberRemoveComas(item[key])
        }
      })
      return sum
    },
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_SALE_RETURN(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_SALE_RETURN({
        pageNo: Number(value),
      })
      this.getData()
    },
    handleRow(payload) {
      this.$emit('handleDetailId', payload.keyRow)
    },
    changeLayout(data) {
      this.$emit('changeLayout', data, this.listDataShow)
    },
    async filterAndSort() {
      try {
        this.loading = true
        const res = await api('getListSaleReturn', this.payloadSaleReturn)

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataTable = res.data.tableContent.content
          this.total = res.data.tableContent.totalElements
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
        const res = await api('getListSaleReturn', this.payloadSaleReturn)

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataHeader = res.data.scolumnHides
          this.dataTable = res.data.tableContent.content
          this.total = res.data.tableContent.totalElements
          this.SET_DATA_COLUMN_HIDE(res?.data?.scolumnHides)
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoadingTable = false
      }
    },
    async refresh() {
      await this.getData()
    },
    mappingProperty(item, fieldName) {
      for (const property in item) {
        if (property.toLowerCase() === fieldName.toLowerCase()) {
          return property
        }
      }
      return ''
    },
  },
}
</script>
<style lang="scss" scoped>
.table-return {
  // border: 1px solid #5180d8;
  height: calc(100% - 75px);
  .table-return--body {
    height: calc(100% - 26px);
  }
  .table-return--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border: 1px solid #5180d8;
    border-top: 0;
  }
}

.total-item {
  border-right: 1px solid #5180d8;
  font-size: 12px;
  font-weight: bold;
  padding: 0 2px;
}

.total-item:last-child {
  border-right: none !important;
}
.checkbox {
  height: 13px !important;
}
</style>
