<template>
  <div class="table-order d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      class="table-order--body"
      :initial-filters="getPayloadOutwardOrder"
      :update-filters-function="UPDATE_PAYLOAD_OUTWARD_ORDER"
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
      :per-page="getPayloadOutwardOrder.pageSize"
      :current-page="getPayloadOutwardOrder.pageNo"
      :number-item="dataTable.length"
      class="table-order--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>
    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import dateTime from '~/mixins/dateTime'
import commonOptions from '~/mixins/commonOptions'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
  components: { BaseTableDraggable, BasePagination, BaseTableLoader },
  mixins: [dateTime, commonOptions],
  data() {
    return {
      loading: false,
      isLoadingTable: false,
      dataTable: [],
      dataHeader: [],
      total: 0,
      lang: this.$i18n.locale,
      listFieldNameIgnore: [
        'Department',
        'SONO',
        'LineID',
        'SOLineID',
        'InQuantity',
        'StopQuantity',
        'Blance',
      ],
    }
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_OUTWARD_ORDER({
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
      getPayloadOutwardOrder: 'filterSort/getPayloadOutwardOrder',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),
    listDataShow() {
      return this.dataHeader
        .filter((item) => !item.hidden)
        .filter((_el) => !this.listFieldNameIgnore.includes(_el.fieldName))
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    dataTotalMapping() {
      const propertyMapping = {
        unit: {
          value: 'Total: ',
          type: 'text',
        },
        quantity: {
          value: this.calculateSum('quantity'),
          align: 'right',
          type: 'amount',
        },
        amount: {
          value: this.calculateSum('amount'),
          align: 'right',
          type: 'amount',
        },
        endQuantity: {
          value: this.calculateSum('endQuantity'),
          align: 'right',
          type: 'amount',
        },
        isCheck: {
          type: 'checkbox',
        },
      }

      return this.headerMapping.map((item) => {
        const { key } = item
        const temp = {
          key,
          value: '',
          ...propertyMapping[key],
        }
        return temp
      })
    },
    dataTableMapping() {
      const listAlignRightFields = [
        'Quantity',
        'Amount',
        'Price',
        'EndQuantity',
        'TaxRate',
      ]

      const data = this.dataTable?.map((item, index) => {
        const obj = {
          index: {
            value:
              this.getPayloadOutwardOrder.pageSize *
                (this.getPayloadOutwardOrder.pageNo - 1) +
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

        this.listDataShow?.forEach((headerItem) => {
          const fieldKey = headerItem.fieldKey || ''
          obj[fieldKey] = {
            value: item[fieldKey] || '',
          }

          if (listAlignRightFields.includes(headerItem.fieldName)) {
            obj[fieldKey] = {
              value: item[fieldKey] || 0,
              align: 'right',
            }
          }

          switch (headerItem.fieldName) {
            case 'IsCheck':
              obj[fieldKey].type = 'slot'
              break
            case 'Unit':
              obj.unit = {
                value: this.mapUnit(item.unitID),
              }
              obj[fieldKey].align = 'left'
              break
            case 'OrderDate':
            case 'CheckDate':
            case 'EditDate':
            case 'PromiseDate':
              obj[fieldKey].value = this.convertDate(item[fieldKey])
              obj[fieldKey].align = 'center'
              break
            case 'OrderNO':
              obj[fieldKey] = {
                value: item.orderNo,
                type: this.getActiveButtonToolBar?.isEdit ? 'link' : '',
                link: `/${this.$i18n.locale}/outward/outward-order/detail?orderNo=${item.orderNo}`,
              }
              break
          }
        })

        return obj
      })

      return data
    },
    headerMapping() {
      const listNumberField = [
        'Quantity',
        'Amount',
        'Price',
        'EndQuantity',
        'TaxRate',
      ]
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
      const getHeaderItem = (item) => {
        const maxLength = listNumberField.includes(item.fieldName) ? '30' : '256'
        const headerItem = {
          key: item.fieldKey || '',
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: item.fieldName === 'IsCheck' ? 'select' : 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          fieldKey: item.fieldKey,
          maxLength,
        }

        switch (item.fieldName) {
          case 'IsCheck':
            headerItem.options = this.yesNoOptions
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
    this.SET_PAYLOAD_OUTWARD_ORDER(payload)
  },
  methods: {
    ...mapActions('base', ['getUnitOptions']),
    ...mapMutations({
      UPDATE_PAYLOAD_OUTWARD_ORDER: 'filterSort/UPDATE_PAYLOAD_OUTWARD_ORDER',
      SET_PAYLOAD_OUTWARD_ORDER: 'filterSort/SET_PAYLOAD_OUTWARD_ORDER',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),
    calculateSum(key) {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item[key]) {
          sum += parseFloat(item[key])
        }
      })
      return sum
    },
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_OUTWARD_ORDER(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_OUTWARD_ORDER({
        pageNo: Number(value),
      })
      this.getData()
    },
    async getData() {
      try {
        this.isLoadingTable = true
        const res = await api(
          'getListOutwardOrder',
          this.getPayloadOutwardOrder
        )

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataHeader = res.data?.scolumnHides
          this.dataTable = res.data.tableContent?.content
          this.total = res.data.tableContent?.totalElements
          this.SET_DATA_COLUMN_HIDE(
            this.convertLineNumberDisable(res?.data?.scolumnHides)
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
        const finalPayload = {
          ...this.getPayloadOutwardOrder,
          memoDtl: this.getPayloadOutwardOrder?.memoDTL,
        }
        const res = await api('getListOutwardOrder', finalPayload)
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
    convertLineNumberDisable(data) {
      const ignoreFieldName = ['InQuantity', 'StopQuantity', 'Blance']
      return data
        .map((item) => {
          if (item.fieldName === 'SOLineID') {
            item.hidden = true
            item.disable = true
          }
          return item
        })
        .filter((_el) => !ignoreFieldName.includes(_el.fieldName))
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

    mapUnit(unitId) {
      return (
        this.unitOptions.find((item) => unitId && item.value === unitId)
          ?.text || ''
      )
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
.table-order {
  height: calc(100% - 70px);

  .table-order--body {
    height: calc(100% - 26px);
  }

  .table-order--footer {
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
  height: 14px !important;
}
</style>
