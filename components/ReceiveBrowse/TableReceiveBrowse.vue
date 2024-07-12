<template>
  <div class="table__receive-browse d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      :active-rows="activeRows"
      class="table__receive-browse--body"
      :initial-filters="payloadReceiveBrowse"
      :update-filters-function="UPDATE_PAYLOAD_RECEIVE_BROWSE"
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

      <slot v-for="(item, index) in dataTable" :slot="`isStop-${index}`">
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <b-form-checkbox disabled :checked="item.isStop" />
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadReceiveBrowse.pageSize"
      :current-page="payloadReceiveBrowse.pageNo"
      :number-item="dataTable.length"
      class="table__receive-browse--footer"
      :class="{
        'border--full': !total,
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
import { receiveBrowseSchema } from '@/schemas/finance/receive-browse'
import commonOptionsMixins from '@/mixins/commonOptions'
import receiveBrowseMixins from '@/mixins/receiveBrowse'
import dateTimeMixins from '@/mixins/dateTime'
import api from '@/api/api'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
  components: { BaseTableDraggable, BasePagination, BaseTableLoader },
  mixins: [dateTimeMixins, commonOptionsMixins, receiveBrowseMixins],
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
    }
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_RECEIVE_BROWSE({
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
      payloadReceiveBrowse: 'filterSort/getPayloadReceiveBrowse',
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
      return this.headerMockData
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
        if (item.key === 'ardate') {
          temp.value = 'Total: '
          temp.align = 'center'
        }
        if (item.key === 'blanceAmount') {
          temp.value = this.dataFooter.BlanceAmount
          temp.align = 'right'
          temp.type = 'amount'
        }
        if (item.key === 'amount') {
          temp.value = this.dataFooter.Amount
          temp.align = 'right'
          temp.type = 'amount'
        }
        if (item.key === 'aramount') {
          temp.value = this.dataFooter.ARAmount
          temp.align = 'right'
          temp.type = 'amount'
        }
        if (item.key === 'isStop') {
          temp.type = 'checkbox'
        }
        return temp
      })
    },
    dataTableMapping() {
      const listAlignCenterFields = [
        'OrderNo',
        'InvoiceNo',
        'Currency',
        'ARDate',
        'DueDate',
        'OrderNO',
      ]
      const listAlignRightFields = ['Amount', 'ARAmount', 'BlanceAmount']

      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadReceiveBrowse.pageSize *
                (this.payloadReceiveBrowse.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          checkbox: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          keyRow: item.receiveBrowseNo,
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
              value: item[mappingFieldName] || 0,
              align: 'right',
            }
          }

          if (headerItem.fieldName === 'OrderNO') {
            obj[mappingFieldName].type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''
            obj[
              mappingFieldName
            ].link = `/${this.$i18n.locale}/finance/receive-browse/detail?receiveBrowse=${item.id}`
            const isNotPaidEnough = item.blanceAmount > 0 && !item.isStop
            if (isNotPaidEnough) {
              obj[mappingFieldName].color = 'red'
            }
          }

          if (headerItem.fieldName === 'ARDate') {
            obj[mappingFieldName].value = this.convertDate(item.ardate)
            obj[mappingFieldName].align = 'center'
          }

          if (headerItem.fieldName === 'DueDate') {
            obj[mappingFieldName].value = this.convertDate(item.dueDate)
            obj[mappingFieldName].align = 'center'
          }

          if (headerItem.fieldName === 'IsStop') {
            obj[mappingFieldName].type = 'slot'
          }
        })
        return obj
      })
      return data
    },
    headerMapping() {
      const listNumberField = ['Amount', 'ARAmount', 'BlanceAmount']
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

      const listOptionsFields = ['IsStop']
      const mapProps = {
        Date: 'ARDate',
        ReceiveDate: 'DueDate',
      }

      for (const prop in mapProps) {
        const matchData = this.listDataShow.find(
          (item) => item.fieldName === prop
        )

        if (matchData) {
          matchData.fieldName = mapProps[prop]
        }
      }

      this.listDataShow.forEach((item) => {
        const maxLength = listNumberField.includes(item.fieldName) ? '30' : '256'
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || receiveBrowseSchema,
            item.fieldName
          ),
          name: item.labelName,
          filter: listOptionsFields.includes(item.fieldName)
            ? 'select'
            : 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          maxLength,
        }
        if (item.fieldName === 'IsStop') {
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
          aramount: item.aramount,
          blanceAmount: item.blanceAmount,
          isStop: item.isStop,
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
    const isCheck = this.$route.query?.isStop

    const payload = {
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    }

    if (isCheck) {
      payload.isStop = 0
    }
    this.$router.replace({ query: null })
    this.SET_PAYLOAD_RECEIVE_BROWSE(payload)
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_RECEIVE_BROWSE: 'filterSort/UPDATE_PAYLOAD_RECEIVE_BROWSE',
      SET_PAYLOAD_RECEIVE_BROWSE: 'filterSort/SET_PAYLOAD_RECEIVE_BROWSE',
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
      this.UPDATE_PAYLOAD_RECEIVE_BROWSE(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_RECEIVE_BROWSE({
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
        const res = await api('getReceiveBrowses', this.payloadReceiveBrowse)

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
        const res = await api('getReceiveBrowses', this.payloadReceiveBrowse)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        this.dataTable = res.data.tableContent?.content
        this.dataFooter = res.data?.tableFooter || {}
        this.total = res.data.tableContent?.totalElements
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
