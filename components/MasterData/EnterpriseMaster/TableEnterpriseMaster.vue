<template>
  <div class="table-enterprise d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      ref="enterpriseTable"
      :header="headerMapping"
      :data="dataTableMapping"
      class="table-enterprise--body"
      :initial-filters="payloadEnterprise"
      :update-filters-function="UPDATE_PAYLOAD_ENTERPRISE"
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
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadEnterprise.pageSize"
      :current-page="payloadEnterprise.pageNo"
      :number-item="dataTable.length"
      class="table-enterprise--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { enterpriseMasterSchema } from '@/schemas/master-data/enterprise-master'
import api from '@/api/api'
import BasePagination from '@/components/UI/BasePagination.vue'
import dateTime from '~/mixins/dateTime'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
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
      payloadEnterprise: 'filterSort/getPayloadEnterprise',
      companyTypeOptions: 'base/getCompanyTypeOptions',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

    companyTypeID() {
      return Number(this.$route?.query?.type) || 0
    },

    listDataShow() {
      return this.dataHeader
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    ratioMapping() {
      const ratio = ['40px', '40px']
      this.listDataShow.forEach((item) => {
        ratio.push(item.fieldWide + 'px')
      })
      return ratio
    },
    dataTableMapping() {
      const listAlignRightFields = ['SettleDate', 'PayPeriod']
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadEnterprise.pageSize *
                (this.payloadEnterprise.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          icon: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          keyRow: item.companyID,
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )
          obj[mappingFieldName] = {
            value: item[mappingFieldName] || '',
          }
          if (listAlignRightFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName] = {
              value: item[mappingFieldName] || 0,
              align: 'right',
            }
          }
          if (headerItem.fieldName === 'CompanyType') {
            obj[mappingFieldName].value = item.companyTypeID
              ? this.$t(`cmb_CompanyType_${item.companyTypeID}`)
              : ''
          }
          const listConvertDate = [
            'ETransDate',
            'BTransDate',
            'CheckDate',
            'EditDate',
          ]
          if (listConvertDate.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
            obj[mappingFieldName].align = 'center'
          }
          if (
            headerItem.fieldName === 'CompanyCode' ||
            headerItem.fieldName === 'CompanyName'
          ) {
            obj[mappingFieldName].type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''
            obj[
              mappingFieldName
            ].link = `/${this.$i18n.locale}/master-data/enterprise-master/detail?companyCode=${item.companyID}`
          }
        })
        return obj
      })
      return data
    },

    headerMapping() {
      const listNumberField = ['SettleDate', 'PayPeriod']
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
          key: this.mappingProperty(
            this.dataTable[0] || enterpriseMasterSchema,
            item.fieldName
          ),
          name: this.labelMapping[item.fieldName],
          filter: item.fieldName === 'CompanyType' ? 'select' : 'input',
          width: item.fieldWide * 1,
          disabled:
            this.$route?.query?.type && item.fieldName === 'CompanyType',
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          maxLength,
        }
        if (item.fieldName === 'CompanyType') {
          headerItem.options = this.companyTypeOptions
        }
        header.push(headerItem)
      })

      return header
    },
  },
  watch: {
    '$route.query.type': {
      handler(val) {
        this.SET_PAYLOAD_ENTERPRISE({
          pageNo: 1,
          pageSize: 30,
          language: this.lang,
        })

        if (val) {
          this.UPDATE_PAYLOAD_ENTERPRISE({
            companyType: this.companyTypeID,
          })

          return this.filterAndSort()
        }

        this.getData()
      },
    },
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_ENTERPRISE({
        language: this.lang,
      })

      await Promise.all([this.getData(), this.getCompanyTypeOptions(this.lang)])
      if (this.companyTypeID) {
        this.UPDATE_PAYLOAD_ENTERPRISE({
          companyType: this.companyTypeID,
        })

        await this.filterAndSort()
      }
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  created() {
    this.SET_PAYLOAD_ENTERPRISE({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapActions({
      getCompanyTypeOptions: 'base/getCompanyTypeOptions',
    }),

    ...mapMutations({
      UPDATE_PAYLOAD_ENTERPRISE: 'filterSort/UPDATE_PAYLOAD_ENTERPRISE',
      SET_PAYLOAD_ENTERPRISE: 'filterSort/SET_PAYLOAD_ENTERPRISE',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),

    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_ENTERPRISE(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_ENTERPRISE({
        pageNo: Number(value),
      })
      this.getData()
    },

    async getData() {
      try {
        this.isLoadingTable = true

        const res = await api('getEnterpriseMaster', this.payloadEnterprise)
        console.log(11111111,res);
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
        const res = await api('getEnterpriseMaster', this.payloadEnterprise)
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
    async refresh() {
      await this.getData()
    },
    handleDetailId(data) {
      this.$emit('handleDetailId', data.keyRow)
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
.table-enterprise {
  height: calc(100% - 70px);
  .table-enterprise--body {
    height: calc(100% - 26px);
  }
  .table-enterprise--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border: 1px solid #5180d8;
    border-top: 0;
  }
}
</style>
