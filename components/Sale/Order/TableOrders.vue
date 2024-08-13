<template>
  <div class="table-order d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      class="table-order--body"
      :initial-filters="payloadSaleOrder"
      :update-filters-function="UPDATE_PAYLOAD_SALE_ORDER"
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
      :per-page="payloadSaleOrder.pageSize"
      :current-page="payloadSaleOrder.pageNo"
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
import { saleOrderSchema } from '@/schemas/sales/sale-order'
import api from '@/api/api'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import dateTime from '~/mixins/dateTime'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
  components: { BaseTableDraggable, BasePagination, BaseTableLoader },
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
    }
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_SALE_ORDER({
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
      payloadSaleOrder: 'filterSort/getPayloadSaleOrder',
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
    totalAmount() {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item.amount) {
          sum += parseFloat(item.amount)
        }
      })
      return sum
    },
    totalQuantity() {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item.quantity) {
          sum += parseFloat(item.quantity)
        }
      })
      return sum
    },
    dataTotalMapping() {
      return this.headerMapping.map((item) => {
        const temp = {
          key: item.key,
          value: '',
        }
        switch (item.key) {
          case 'customerPO':
            temp.value = 'Total: '
            temp.type = 'text'
            break
          case 'quantity':
            temp.value = this.totalQuantity
            temp.align = 'right'
            temp.type = 'amount'
            break
          case 'amount':
            temp.value = this.totalAmount
            temp.align = 'right'
            temp.type = 'amount'
            break
          case 'isCheck':
            temp.type = 'checkbox'
            temp.type = 'number'
            break
          default:
            break
        }
        return temp
      })
    },
    dataTableMapping() {
      const listAlignRightFields = ['Quantity', 'Amount', 'Price', 'StopQty', 'TaxRate']

      const data = this.dataTable?.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadSaleOrder.pageSize *
                (this.payloadSaleOrder.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          icon: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          keyRow: item.sono,
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
            obj[mappingFieldName].align = 'right'
          }

          switch (headerItem.fieldName) {
            case 'SOPriceIncludeTax':
            case 'SOAmountIncludeTax':
            case 'SOPriceIncludeDiscount':
            case 'SODiscountRate':
              obj[mappingFieldName].value = obj[mappingFieldName].value == 0 ? 0 : obj[mappingFieldName].value
              break
            case 'IsCheck':
              obj[mappingFieldName].type = 'slot'
              break
            case 'UnitID':
              obj[mappingFieldName].value = this.mapUnit(item.unitID)
              obj[mappingFieldName].align = 'left'
              break
            case 'Orderdate':
            case 'OrderDate':
            case 'CheckDate':
            case 'EditDate':
            case 'Editdate':
            case 'PromiseDate':
              obj[mappingFieldName].align = 'center'
              break
            case 'SONO':
              obj[mappingFieldName].type = this.getActiveButtonToolBar?.isEdit
                ? 'link'
                : ''
              obj[
                mappingFieldName
              ].link = `/${this.$i18n.locale}/sales/order/detail?sono=${item.sono}`
              break
          }
        })

        return obj
      })

      return data
    },
    headerMapping() {
      const listNumberField = ['Quantity', 'Amount', 'Price', 'StopQty', 'TaxRate']
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
          key: this.mappingProperty(
            this.dataTable[0] || saleOrderSchema,
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
    this.SET_PAYLOAD_SALE_ORDER(payload)
  },
  methods: {
    ...mapActions('base', ['getUnitOptions']),
    ...mapMutations({
      UPDATE_PAYLOAD_SALE_ORDER: 'filterSort/UPDATE_PAYLOAD_SALE_ORDER',
      SET_PAYLOAD_SALE_ORDER: 'filterSort/SET_PAYLOAD_SALE_ORDER',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_SALE_ORDER(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_SALE_ORDER({
        pageNo: Number(value),
      })
      this.getData()
    },
    async getData() {
      try {
        this.isLoadingTable = true
        const res = await api('getOrders', this.payloadSaleOrder)

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

        const res = await api('getOrders', this.payloadSaleOrder)
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
        console.log(property.toLowerCase(), fieldName.toLowerCase());
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
</style>
