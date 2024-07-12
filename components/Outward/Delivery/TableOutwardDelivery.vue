<template>
  <div class="table-outward-delivery d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      class="table-outward-delivery--body"
      :initial-filters="payloadOutwardDelivery"
      :update-filters-function="UPDATE_PAYLOAD_OUTWARD_DELIVERY"
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
      :per-page="payloadOutwardDelivery.pageSize"
      :current-page="payloadOutwardDelivery.pageNo"
      :number-item="dataTable.length"
      class="table-outward-delivery--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import dateTime from '~/mixins/dateTime'
import commonOptions from '~/mixins/commonOptions'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
  name: 'TableOutwardDelivery',
  components: { BasePagination, BaseTableDraggable, BaseTableLoader },
  mixins: [dateTime, commonOptions],
  data() {
    return {
      isLoadingTable: false,
      loading: false,
      dataTable: [],
      dataHeader: [],
      total: 0,
      lang: this.$i18n.locale,
      acceptedFieldKeys: [
        'orderNo',
        'orderDate',
        'responsible',
        'supplierResponsible',
        'supplierName',
        'isCheck',
        'checkUser',
        'checkDate',
        'editDate',
        'memo',
        'itemCode',
        'itemName',
        'description',
        'currency',
        'memoDTL',
        'warehouseSource',
        'warehouseDestination',
        'quantity',
        'unit',
        'editUser',
        'subItemName',
        'subItemCode',
        'subDescription',
        'subQuantity',
        'subUnit',
      ],
    }
  },
  computed: {
    ...mapGetters({
      payloadOutwardDelivery: 'filterSort/getPayloadOutwardDelivery',
      getActiveButtonToolBar: 'base/getActiveButtonToolBar',
    }),

    listDataShow() {
      return this.dataHeader
        .filter(
          (item) =>
            !item.hidden && this.acceptedFieldKeys.includes(item.fieldKey)
        )
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    dataTableMapping() {
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadOutwardDelivery.pageSize *
                (this.payloadOutwardDelivery.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          icon: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          keyRow: item.orderNo,
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const fieldKey = headerItem.fieldKey || ''
          obj[fieldKey] = { value: item[fieldKey] || '' }

          if (headerItem.fieldName === 'IsCheck') {
            obj[fieldKey].type = 'slot'
          }

          const listNumberFields = ['Amount']
          if (listNumberFields.includes(headerItem.fieldName)) {
            obj[fieldKey].value = this.numberRemoveComas(item[fieldKey]) || 0
          }

          const listConvertDate = ['OrderDate', 'EditDate', 'CheckDate']
          if (listConvertDate.includes(headerItem.fieldName)) {
            obj[fieldKey].value = this.convertDate(item[fieldKey])
            obj[fieldKey].align = 'center'
          }
          const alignRight = ['Quantity', 'SubQuantity']
          if (alignRight.includes(headerItem.fieldName)) {
            obj[fieldKey].align = 'right'
          }
          if (headerItem.fieldName === 'OrderNO') {
            obj[fieldKey].type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''
            obj[
              fieldKey
            ].link = `/${this.$i18n.locale}/outward/outward-delivery/detail?orderNo=${item.orderNo}`
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
        if (item.key === 'quantity') {
          temp.value = this.calculateTotal('quantity')
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
      const listNumberField = ['Quantity', 'SubQuantity']
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
          key: item.fieldKey,
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: item.fieldName === 'IsCheck' ? 'select' : 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          fieldKey: item.fieldKey,
          maxLength,
        }

        if (item.fieldName === 'IsCheck') {
          headerItem.options = this.yesNoOptions
        }

        if (item.fieldName === 'ShipmentFrom') {
          headerItem.name = this.$t(`lbl_WarehouseSource_0`)
        }

        if (item.fieldName === 'ShipmentTo') {
          headerItem.name = this.$t(`lbl_WarehouseDestination_0`)
        }

        header.push(headerItem)
      })
      return header
    },
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_OUTWARD_DELIVERY({
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
    const payload = {
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    }
    const isCheck = this.$route.query?.isCheck

    if (isCheck) {
      payload.isCheck = 0
    }
    this.$router.replace({ query: null })
    this.SET_PAYLOAD_OUTWARD_DELIVERY(payload)
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_OUTWARD_DELIVERY:
        'filterSort/UPDATE_PAYLOAD_OUTWARD_DELIVERY',
      SET_PAYLOAD_OUTWARD_DELIVERY: 'filterSort/SET_PAYLOAD_OUTWARD_DELIVERY',
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
      this.UPDATE_PAYLOAD_OUTWARD_DELIVERY(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_OUTWARD_DELIVERY({
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
        const finalPayload = {
          ...this.payloadOutwardDelivery,
          shipmentFrom: this.payloadOutwardDelivery?.warehouseSource,
          shipmentTo: this.payloadOutwardDelivery?.warehouseDestination,
        }
        const res = await api('getOutwardDelivery', finalPayload)

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
        const res = await api('getOutwardDelivery', this.payloadOutwardDelivery)

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
  },
}
</script>
<style lang="scss" scoped>
.table-outward-delivery {
  height: calc(100% - 70px);
  .table-outward-delivery--body {
    height: calc(100% - 26px);
  }
  .table-outward-delivery--footer {
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
