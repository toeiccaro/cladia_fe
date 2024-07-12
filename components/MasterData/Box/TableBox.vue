<template>
  <div class="table-item-master d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      class="table-item-master--body"
      :initial-filters="payloadBox"
      :update-filters-function="UPDATE_PAYLOAD_BOX"
      @search="filterAndSort"
      @row="handleToOpenDetail"
      @changeLayout="changeLayout"
    >
      <slot v-for="(item, index) in dataTable" :slot="'icon-' + index">
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <img v-if="item.isAttath" src="@/assets/icon/attach.png" alt="" />
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadBox.pageSize"
      :current-page="payloadBox.pageNo"
      :number-item="dataTable.length"
      class="table-item-master--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import BasePagination from '@/components/UI/BasePagination.vue'
import dataHeaderBox from '@/mixins/dataHeaderBox'
import dateTime from '~/mixins/dateTime'
import api from '~/api/api'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
  components: { BaseTableDraggable, BasePagination, BaseTableLoader },
  mixins: [dateTime, dataHeaderBox],
  props: {},
  data() {
    return {
      data: [],
      itemTypeOptions: [],
      dataTable: [],
      total: 0,
      loading: false,
      isLoadingTable: false,
    }
  },
  computed: {
    ...mapGetters({
      payloadBox: 'filterSort/getPayloadBox',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

    dataTableMapping() {
      const listAlignRightFields = [
        'Long',
        'Width',
        'Height',
        'CBM',
        'PackQty',
        'Weight',
      ]

      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadBox.pageSize * (this.payloadBox.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          icon: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          keyRow: item.systemID,
        }
        this.dataHeaderBox.forEach((headerItem, headerIndex) => {
          obj[headerItem.key] = {
            value: item[headerItem.key] || '',
          }
          if (listAlignRightFields.includes(headerItem.fieldName)) {
            obj[headerItem.key] = {
              value: item[headerItem.key] || 0,
              align: 'right',
            }
          }
          if (headerItem.fieldName === 'Height') {
            obj[headerItem.key] = {
              value: item.high,
              align: 'right',
            }
          }
          if (headerItem.fieldName === 'BoxType') {
            obj[headerItem.key].type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''
            obj[
              headerItem.key
            ].link = `/${this.$i18n.locale}/master-data/box/detail?systemID=${item.systemID}`
          }

          if (headerItem.fieldName === 'EditDate') {
            obj[headerItem.key].value = this.convertDate(item[headerItem.key])
            obj[headerItem.key].align = 'center'
          }
        })
        return obj
      })
      return data
    },

    headerMapping() {
      const listNumberField = [
        'Long',
        'Width',
        'Height',
        'CBM',
        'PackQty',
        'Weight',
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

      this.dataHeaderBox.forEach((item) => {
        const maxLength = listNumberField.includes(item.fieldName) ? '30' : '256'
        const headerItem = {
          key: item.key,
          name: item.labelName,
          filter: 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          maxLength,
        }

        header.push(headerItem)
      })

      return header
    },
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_BOX({
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
    this.SET_PAYLOAD_BOX({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_BOX: 'filterSort/UPDATE_PAYLOAD_BOX',
      SET_PAYLOAD_BOX: 'filterSort/SET_PAYLOAD_BOX',
    }),

    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_BOX(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_BOX({
        pageNo: Number(value),
      })
      this.getData()
    },

    async getData() {
      try {
        this.isLoadingTable = true

        const res = await api('getBox', this.payloadBox)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataTable = res.data?.tableContent?.content
          this.total = res.data?.tableContent?.totalElements
        }
      } catch (err) {
        window.alert(err?.data?.response?.data?.message)
      } finally {
        this.isLoadingTable = false
      }
    },
    async filterAndSort() {
      try {
        const res = await api('getBox', this.payloadBox)

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataTable = res.data?.tableContent?.content
          this.total = res.data?.tableContent?.totalElements
        }
      } catch (err) {
        window.alert(err?.data?.response?.data?.message)
      } finally {
        this.loading = false
      }
    },

    handleToOpenDetail(data) {
      this.$emit('detail', data.keyRow)
    },
    async refreshTable() {
      await this.getData()
    },
    changeLayout(data) {
      this.$emit('changeLayout', data, this.dataHeaderBox)
    },
  },
}
</script>

<style scoped lang="scss">
.table-item-master {
  height: calc(100% - 70px);

  .table-item-master--body {
    height: calc(100% - 26px);
  }

  .table-item-master--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border: 1px solid #5180d8;
    border-top: 0;
  }
}
</style>
