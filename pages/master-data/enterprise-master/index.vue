<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TableEnterpriseMaster
      ref="tableEnterpriseMaster"
      :label-mapping="labelMapping"
      @handleDetailId="handleDetailId"
      @changeLayout="changeLayout"
    />
    <BaseSetColumn
      ref="modalSetColumn"
      :label-mapping="labelMapping"
      @reloadSet="reloadSet"
    ></BaseSetColumn>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import ToolBar from '@/components/UI/ToolBar.vue'
import TableEnterpriseMaster from '@/components/MasterData/EnterpriseMaster/TableEnterpriseMaster.vue'
import api from '@/api/api'
import { downloadFileExcel } from '@/utils/utils'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'

export default {
  components: { ToolBar, TableEnterpriseMaster, BaseSetColumn },
  middleware: ['authenticated'],

  data() {
    return {
      listToolBars: [
        {
          key: 'addEnterpriseMaster',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'editEnterpriseMaster',
          label: this.$t('btn_btnEdit_0'),
          icon: '/images/edit.png',
        },
        {
          key: 'refreshEnterpriseMaster',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'exportEnterpriseMaster',
          label: this.$t('btn_btnExport_0'),
          icon: '/images/export.png',
          type: 'menu',
          items: [
            {
              text: 'btn_btnPaged_0',
              action: () => this.exportByPage(),
            },

            {
              text: 'btn_btnFiltered_0',
              action: () => this.exportAll(),
            },
          ],
        },
        {
          key: 'setEnterpriseMaster',
          label: this.$t('btn_btnSet_0'),
          icon: '/images/set.png',
        },
        {
          key: 'saveLayout',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'closeEnterpriseMaster',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      currentId: '',
      exportSize: 30,
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      getPayloadEnterprise: 'filterSort/getPayloadEnterprise',
    }),

    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'addEnterpriseMaster':
            item.disabled = !this.activeButtonToolBar?.isEdit
            break
          case 'editEnterpriseMaster':
            item.disabled = !this.activeButtonToolBar?.isEdit
            break
          case 'exportEnterpriseMaster':
            item.disabled = !this.activeButtonToolBar?.isExport
            break
          default:
            break
        }
        return item
      })
    },
    labelMapping() {
      return {
        CompanyType: this.$t('lbl_CompanyType_0'),
        CompanyCode: this.$t('lbl_CompanyCode_0'),
        CompanyName: this.$t('lbl_CompanyName_0'),
        AddressEN1: this.$t('lbl_AddressEN1_0'),
        AddressEN2: this.$t('lbl_AddressEN2_0'),
        AddressEN3: this.$t('lbl_AddressEN3_0'),
        ShortName: this.$t('lbl_ShortName_0'),
        Bank: this.$t('lbl_Bank_0'),
        AccountNo: this.$t('lbl_AccountNo_0'),
        SettleDate: this.$t('lbl_SettleDate_0'),
        Currency: this.$t('lbl_Currency_0'),
        Memo: this.$t('lbl_Memo_0'),
        EditUser: this.$t('lbl_EditUser_0'),
        EditDate: this.$t('lbl_EditDate_0'),
        PaymentType: this.$t('lbl_PaymentType_0'),
        RelateCompany: this.$t('lbl_RelateCompany_0'),
        PayPeriod: this.$t('lbl_PayPeriod_0'),
        WebPage: this.$t('lbl_WebPage_0'),
        ResponsibleMan: this.$t('lbl_ResponsibleMan_0'),
        Tel: this.$t('lbl_Tel_0'),
        EnglishName: this.$t('lbl_EnglishName_0'),
        Address1: this.$t('lbl_Address1_0'),
        Address2: this.$t('lbl_Address2_0'),
        Address3: this.$t('lbl_Address3_0'),
        Email: this.$t('lbl_Email_0'),
        MemoryCode: this.$t('lbl_MemoryCode_0'),
        COCustom1: this.$t('lbl_COCustom1_0') , 
        COCustom2: this.$t('lbl_COCustom2_0'), 
        BTransDate: this.$t('lbl_BTransDate_0'),
        ETransDate: this.$t('lbl_ETransDate_0'),
        Fax: this.$t('lbl_Fax_0'),
      }
    },
  },
  watch: {
    'dataLayout.headerData': {
      immediate: true,
      deep: true,
      handler(val) {
        this.listColumnChange = []
        this.dataLayout?.headerData?.forEach((item, index) => {
          this.listDataColumn.forEach((_el) => {
            if (item.fieldName === _el.fieldName) {
              this.listColumnChange.push({
                fieldWide: item.width.toString(),
                fieldName: item.fieldName,
                id: _el.id,
                fieldOrder: index - 1,
                gridName: _el.gridName,
                hidden: _el.hidden,
                loginId: _el.loginId,
              })
            }
          })
        })
      },
    },
  },
  methods: {
    changeActiveToolBar(key) {
      if (key === 'addEnterpriseMaster') {
        return this.$router.push(
          this.localePath({ path: '/master-data/enterprise-master/add' })
        )
      }

      if (key === 'editEnterpriseMaster') {
        return (
          this.currentId &&
          this.$router.push({
            path: `/${this.$i18n.locale}/master-data/enterprise-master/detail?companyCode=${this.currentId}`,
          })
        )
      }
      if (key === 'setEnterpriseMaster') {
        this.$refs.modalSetColumn.showModal = true
        return
      }
      if (key === 'refreshEnterpriseMaster') {
        return location.reload()
      }
      if (key === 'saveLayout') {
        this.handleSaveLayout()
      }
      if (key === 'closeEnterpriseMaster') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
    },
    exportByPage() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (confirm) {
        const payload = this.getPayloadEnterprise
        payload.isExportAll = false
        this.handleExportExcel(payload)
      }
    },
    exportAll() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (confirm) {
        const sortFilter = JSON.parse(JSON.stringify(this.getPayloadEnterprise))
        delete sortFilter.pageNo
        delete sortFilter.pageSize
        const payload = {
          ...sortFilter,
          isExportAll: true,
        }
        this.handleExportExcel(payload)
      }
    },
    changeLayout(data, listDataColumn) {
      this.dataLayout = data
      this.listDataColumn = listDataColumn
    },
    async handleSaveLayout() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (confirm) {
        await api('updateColumn', this.listColumnChange)
        this.$refs.tableEnterpriseMaster.refresh()
      }
    },
    handleDetailId(data) {
      this.currentId = data
    },
    async handleExportExcel(payload) {
      try {
        this.loading = true
        const response = await api('exportExcelEnterprise', payload)
        if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
          downloadFileExcel(response.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async reloadSet() {
      await this.$refs.tableEnterpriseMaster.getData()
    },
  },
}
</script>
