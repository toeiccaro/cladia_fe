<template>
  <div class="table-item-master d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      class="table-item-master--body"
      :initial-filters="payloadAttachmentBrowse"
      :update-filters-function="UPDATE_PAYLOAD_ATTACHMENT_BROWSE"
      @search="filterAndSort"
    >
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadAttachmentBrowse.pageSize"
      :current-page="payloadAttachmentBrowse.pageNo"
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
import { attachmentBrowseSchema } from '@/schemas/master-data/attachment-browse'
import { SERVER_RESPONSE_CODE } from '@/constants'
import BasePagination from '@/components/UI/BasePagination.vue'
import dateTime from '~/mixins/dateTime'
import api from '~/api/api'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
  name: 'TableAttachment',
  components: { BaseTableDraggable, BasePagination, BaseTableLoader },
  mixins: [dateTime],
  props: {
    labelMapping: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  data() {
    return {
      dataTable: [],
      dataHeader: [],
      total: 0,
      loading: false,
      isLoadingTable: false,
    }
  },
  computed: {
    ...mapGetters({
      payloadAttachmentBrowse: 'filterSort/getPayloadAttachmentBrowse',
    }),
    dataTableMapping() {
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadAttachmentBrowse.pageSize *
                (this.payloadAttachmentBrowse.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )
          obj[mappingFieldName] = {
            value: item[mappingFieldName] || '',
          }
          if (headerItem.fieldName === 'FileSize') {
            obj[mappingFieldName] = {
              value: item[mappingFieldName] || 0,
              align: 'right',
            }
          }

          const listConvertDate = ['CheckDate', 'EditDate']
          if (listConvertDate.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
            obj[mappingFieldName].align = 'center'
          }
        })
        return obj
      })
      return data
    },
    listDataShow() {
      return this.dataHeader
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    headerMapping() {
      const listNumberField = ['FileSize']
      const header = [
        {
          key: 'index',
          name: '',
          width: 40,
        },
      ]
      this.listDataShow.forEach((item) => {
        const maxLength = listNumberField.includes(item.fieldName) ? '30' : '256'
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || attachmentBrowseSchema,
            item.fieldName
          ),
          name: this.$t(`lbl_${item.fieldName}_0`),
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
      this.UPDATE_PAYLOAD_ATTACHMENT_BROWSE({
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
    this.SET_PAYLOAD_ATTACHMENT_BROWSE({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_ATTACHMENT_BROWSE:
        'filterSort/UPDATE_PAYLOAD_ATTACHMENT_BROWSE',
      SET_PAYLOAD_ATTACHMENT_BROWSE: 'filterSort/SET_PAYLOAD_ATTACHMENT_BROWSE',
    }),
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_ATTACHMENT_BROWSE(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_ATTACHMENT_BROWSE({
        pageNo: Number(value),
      })
      this.getData()
    },

    async getData() {
      try {
        this.isLoadingTable = true
        const res = await api(
          'getListAttachmentBrowse',
          this.payloadAttachmentBrowse
        )
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataHeader = res.data?.scolumnHides
          this.dataTable = res.data.tableContent?.content
          this.total = res.data.tableContent?.totalElements
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
          'getListAttachmentBrowse',
          this.payloadAttachmentBrowse
        )
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
    async refreshTable() {
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
