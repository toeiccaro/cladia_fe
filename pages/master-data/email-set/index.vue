<template>
  <div>
    <ToolBar
      :list-tools="listToolBars"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <FormEmailHost
      :data="emailHostData"
      @refetchEmailHostData="refetchEmailHostData"
      @setLoading="setLoading"
    />
    <TableEmailSet @handleDetailRow="handleDetailRow" />
    <BaseTableLoader v-if="loading" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar'
import TableEmailSet from '~/components/MasterData/EmailSet/TableEmailSet'
import FormEmailHost from '~/components/MasterData/EmailSet/FormEmailHost'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
import { SERVER_RESPONSE_CODE } from '~/constants'
import { isEmptyValue } from '~/utils/utils'
export default {
  components: { ToolBar, TableEmailSet, FormEmailHost, BaseTableLoader },
  data() {
    return {
      currentRowIndex: -1,
      currentRowData: {},
      loading: false,
      emailHostData: {},
    }
  },
  async fetch() {
    try {
      this.loading = true
      const res = await api('getEmailHost')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        this.emailHostData = res.data
      }
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
    }),
    listToolBars() {
      return [
        {
          key: 'add',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
          disabled: this.activeButtonToolBar?.isEdit,
        },
        {
          key: 'edit',
          label: this.$t('btn_btnEdit_0'),
          icon: '/images/edit.png',
          disabled: this.activeButtonToolBar?.isEdit,
        },
        {
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ]
    },
  },

  methods: {
    setLoading(data) {
      this.loading = data
    },
    refetchEmailHostData() {
      this.$fetch()
    },
    handleDetailRow(data) {
      this.currentRowIndex = data?.index
      this.currentRowData = data?.item
    },
    changeActiveToolBar(key) {
      switch (key) {
        case 'edit':
          return this.handleEdit()
        case 'add':
          return this.handleAdd()
        case 'close':
          return this.handleClose()
        default:
          break
      }
    },

    handleAdd() {
      this.$router.push(this.localePath({ path: '/master-data/email-set/add' }))
    },

    handleResetChosenRowIndex() {
      this.currentRowIndex = -1
    },

    handleClose() {
      this.$router.push(this.localePath({ path: '/' }))
    },

    handleEdit() {
      const invalidRowIndex =
        this.currentRowIndex < 0 || isEmptyValue(this.currentRowIndex)
      if (invalidRowIndex) {
        return
      }

      const moduleName = this.currentRowData?.moduleName?.value
      const employeeID = this.currentRowData?.employeeID?.value

      this.$router.push({
        path: `/${this.$i18n.locale}/master-data/email-set/detail?employeeID=${employeeID}&moduleID=${moduleName}`,
      })
    },

    handleSelectRow(data) {
      this.currentRowIndex = data.index
    },
  },
}
</script>
