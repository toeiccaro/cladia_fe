<template>
  <div class="table-order d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      class="table-order--body"
      :initial-filters="getPayloadOutwardInvoice"
      :update-filters-function="UPDATE_PAYLOAD_OUTWARD_INVOICE"
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
      <slot v-for="(item, index) in dataTable" :slot="`isStop-${index}`">
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <input
            type="checkbox"
            class="checkbox"
            disabled
            :checked="item.isStop"
          />
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="getPayloadOutwardInvoice.pageSize"
      :current-page="getPayloadOutwardInvoice.pageNo"
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
    }
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_OUTWARD_INVOICE({
        language: this.lang,
      })
      await Promise.all([
        this.getData(),
        this.getUnitOptions(this.lang),
        this.getPaymentTypeOptionsFromAPI(this.lang),
      ])
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },

  computed: {
    ...mapGetters({
      unitOptions: 'base/getUnitOptions',
      getPayloadOutwardInvoice: 'filterSort/getPayloadOutwardInvoice',
      paymentOptions: 'base/getPaymentTypeOptions',
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
        isCheck: {
          type: 'checkbox',
          inputType: 'number',
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
      const listAlignRightFields = ['Quantity', 'Amount', 'Price', 'RelateOrderID']

      const data = this.dataTable?.map((item, index) => {
        const obj = {
          index: {
            value:
              this.getPayloadOutwardInvoice.pageSize *
                (this.getPayloadOutwardInvoice.pageNo - 1) +
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
          const fieldKey = headerItem.fieldKey === 'paymentId' ? 'payment' : headerItem.fieldKey
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
            case 'IsStop':
            case 'IsCheck':
              obj[fieldKey].type = 'slot'
              break
            case 'Checker':
              obj.checker = {
                value: item.checkUser,
              }
              break
            case 'Unit':
              obj.unit = {
                value: this.mapUnit(item.unitId),
              }
              obj[fieldKey].align = 'left'
              break
            case 'PaymentID':
              obj.payment = {
                value: this.mapPayment(item.paymentId),
              }
              obj[fieldKey].align = 'left'
              break
            case 'OrderDate':
            case 'CheckDate':
            case 'EditDate':
            case 'DueDate':
            case 'RelateOrderDate':
              obj[fieldKey].value = this.convertDate(item[fieldKey])
              obj[fieldKey].align = 'center'
              break
            case 'OrderNO':
              obj[fieldKey].type = this.getActiveButtonToolBar?.isEdit
                ? 'link'
                : ''
              obj[
                fieldKey
              ].link = `/${this.$i18n.locale}/outward/wpo-invoice/detail?orderNo=${item.orderNo}`
              break
          }
        })

        return obj
      })

      return data
    },
    headerMapping() {
      const listNumberField = ['Quantity', 'Amount', 'Price', 'RelateOrderID']
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
        const listFilterCheckbox = ['IsCheck', 'IsStop']
        const headerItem = {
          key: item.fieldKey === 'paymentId' ? 'payment' : item.fieldKey,
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: listFilterCheckbox.includes(item.fieldName)
            ? 'select'
            : 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          fieldKey: item.fieldKey,
          maxLength,
        }

        switch (item.fieldName) {
          case 'IsCheck':
          case 'IsStop':
            headerItem.options = this.checkAccountOptions
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
    this.SET_PAYLOAD_OUTWARD_INVOICE(payload)
  },
  methods: {
    ...mapActions('base', ['getUnitOptions', 'getPaymentTypeOptionsFromAPI']),
    ...mapMutations({
      UPDATE_PAYLOAD_OUTWARD_INVOICE:
        'filterSort/UPDATE_PAYLOAD_OUTWARD_INVOICE',
      SET_PAYLOAD_OUTWARD_INVOICE: 'filterSort/SET_PAYLOAD_OUTWARD_INVOICE',
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
      this.UPDATE_PAYLOAD_OUTWARD_INVOICE(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_OUTWARD_INVOICE({
        pageNo: Number(value),
      })
      this.getData()
    },
    async getData() {
      try {
        this.isLoadingTable = true
        const res = await api(
          'getListOutwardInvoice',
          this.getPayloadOutwardInvoice
        )

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataHeader = res.data?.scolumnHides
          this.dataTable = res.data.tableContent?.content
          this.total = res.data.tableContent?.totalElements
          this.SET_DATA_COLUMN_HIDE(res?.data?.scolumnHides)
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

        const res = await api(
          'getListOutwardInvoice',
          this.getPayloadOutwardInvoice
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

    mapUnit(unitId) {
      return (
        this.unitOptions.find((item) => unitId && item.value === unitId)
          ?.text || ''
      )
    },
    mapPayment(paymentId) {
      return (
        this.paymentOptions.find(
          (item) => paymentId && item.value === paymentId
        )?.text || ''
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
