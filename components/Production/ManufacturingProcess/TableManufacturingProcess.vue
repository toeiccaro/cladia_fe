<template>
  <div class="table-outward-delivery d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      class="table-outward-delivery--body"
      :initial-filters="payloadManufacturingProcess"
      :update-filters-function="UPDATE_PAYLOAD_MANUFACTURING_PROCESS"
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
      <slot v-for="(item, index) in dataTable" :slot="`isFinished-${index}`">
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <input
            type="checkbox"
            class="checkbox"
            disabled
            :checked="item.isFinished"
          />
        </div>
      </slot>
      <slot v-for="(item, index) in dataTable" :slot="`checkbox1-${index}`">
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <input
            type="checkbox"
            class="checkbox"
            disabled
            :checked="item.checkbox1"
          />
        </div>
      </slot>
      <slot v-for="(item, index) in dataTable" :slot="`checkbox2-${index}`">
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <input
            type="checkbox"
            class="checkbox"
            disabled
            :checked="item.checkbox2"
          />
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadManufacturingProcess.pageSize"
      :current-page="payloadManufacturingProcess.pageNo"
      :number-item="dataTable.length"
      class="table-outward-delivery--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import dateTime from '~/mixins/dateTime'
import commonOptions from '~/mixins/commonOptions'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
  name: 'TableManufacturingProcess',
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
    }
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_MANUFACTURING_PROCESS({
        language: this.lang,
      })
      await Promise.all([this.getData(), this.getProcessStatus(this.lang)])
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  computed: {
    ...mapGetters({
      payloadManufacturingProcess: 'filterSort/getPayloadManufacturingProcess',
      getActiveButtonToolBar: 'base/getActiveButtonToolBar',
      processStatus: 'base/getProcessStatus',
      listProcessStatus: 'base/getListProcessStatus',
    }),

    listDataShow() {
      return this.dataHeader
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    dataTableMapping() {
      const data = this.dataTable?.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadManufacturingProcess.pageSize *
                (this.payloadManufacturingProcess.pageNo - 1) +
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
          const fieldKey = headerItem.fieldKey
          obj[fieldKey] = {
            value: item[fieldKey] || '',
          }

          switch (headerItem.fieldName) {
            case 'ProcessStatus':
              obj[fieldKey].align = 'center'
              obj[fieldKey].value = this.getStatusText(item[fieldKey])
              break
            case 'CheckBox2':
            case 'CheckBox1':
            case 'IsFinished':
            case 'IsCheck':
              obj[fieldKey].type = 'slot'
              break
            case 'OrderQuantity':
            case 'DefectiveQuantity':
            case 'GoodProductionQuantity':
            case 'NumberField1':
            case 'NumberField2':
              obj[fieldKey].align = 'right'
              obj[fieldKey].value = item[fieldKey] || 0
              break
            case 'OrderDate':
            case 'CheckDate':
            case 'EditDate':
            case 'PromiseDate':
            case 'DeliveryDate':
            case 'ScheduleStartDate':
            case 'ScheduleEndDate':
            case 'ProcessingStartDate':
            case 'ProcessingEndDate':
              obj[fieldKey].value = this.convertDate(item[fieldKey])
              obj[fieldKey].align = 'center'
              break
            case 'OrderNO':
              obj.orderNo = {
                value: item.orderNo,
                type: this.getActiveButtonToolBar?.isEdit ? 'link' : '',
                link: `/${this.$i18n.locale}/production/manufacturing-process/detail?orderNo=${item.orderNo}`,
              }
              break
            case 'RemainQuantity':
              obj.finishQty = {
                value: item.remainQuantity || 0,
                align: 'right',
              }
              break
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
        return temp
      })
    },
    headerMapping() {
      const listNumberField = [
        'OrderQuantity',
        'DefectiveQuantity',
        'GoodProductionQuantity',
        'NumberField1',
        'NumberField2',
        'RemainQuantity',
      ]
      const header = [
        {
          key: 'index',
          name: '',
          width: 40,
        },
      ]
      this.listDataShow.forEach((item) => {
        const listCheckBoxFieldName = [
          'IsCheck',
          'IsFinished',
          'CheckBox1',
          'CheckBox2',
          'ProcessStatus',
        ]
        const headerItem = {
          key: item.fieldKey,
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: listCheckBoxFieldName.includes(item.fieldName)
            ? 'select'
            : 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          maxLength: listNumberField.includes(item.fieldName) ? '30' : '256',
        }

        if (listCheckBoxFieldName.includes(item.fieldName)) {
          headerItem.options = this.yesNoOptions
        }
        if (item.fieldName === 'ProcessStatus') {
          headerItem.options = this.listProcessStatus
        }

        header.push(headerItem)
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
    this.SET_PAYLOAD_MANUFACTURING_PROCESS(payload)
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_MANUFACTURING_PROCESS:
        'filterSort/UPDATE_PAYLOAD_MANUFACTURING_PROCESS',
      SET_PAYLOAD_MANUFACTURING_PROCESS:
        'filterSort/SET_PAYLOAD_MANUFACTURING_PROCESS',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),
    ...mapActions('base', ['getProcessStatus']),
    getStatusText(value) {
      switch (value) {
        case this.processStatus.start?.value:
          return this.processStatus.start?.text
        case this.processStatus.partial?.value:
          return this.processStatus.partial?.text
        case this.processStatus.completion?.value:
          return this.processStatus.completion?.text
        default:
          return ''
      }
    },
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
      this.UPDATE_PAYLOAD_MANUFACTURING_PROCESS(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_MANUFACTURING_PROCESS({
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
        await this.getDataTable()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async getData() {
      try {
        this.isLoadingTable = true
        await this.getDataTable()
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoadingTable = false
      }
    },
    async refresh() {
      await this.getData()
    },
    async getDataTable() {
      try {
        const res = await api(
          'getManufacturingProcess',
          this.payloadManufacturingProcess
        )

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataHeader = res?.data?.scolumnHides
          this.dataTable = res?.data?.tableContent?.content
          this.total = res?.data?.tableContent?.totalElements
          this.SET_DATA_COLUMN_HIDE(this.dataHeader)
        } else {
          this.dataHeader = []
          this.dataTable = []
          this.total = 0
          this.SET_DATA_COLUMN_HIDE([])
        }
      } catch (err) {
        console.error(err)
      }
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
