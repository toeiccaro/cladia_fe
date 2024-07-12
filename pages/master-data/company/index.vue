<template>
  <div class="h-100">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>

    <TableCompany
      ref="tableCompany"
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
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import TableCompany from '@/components/MasterData/CompanyData/TableCompany.vue'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'
export default {
  components: { ToolBar, TableCompany, BaseSetColumn },
  middleware: ['authenticated'],
  data() {
    return {
      listToolBars: [
        {
          key: 'editCompany',
          label: this.$t('btn_btnEdit_0'),
          icon: '/images/edit.png',
        },
        {
          key: 'refreshCompany',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'setColumnCompany',
          label: this.$t('btn_btnSet_0'),
          icon: '/images/set.png',
        },
        {
          key: 'saveLayout',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'closeCompany',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      idDetail: '',
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
    }),
    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        if (item.key === 'editCompany') {
          item.disabled = !this.activeButtonToolBar?.isEdit
        }
        return item
      })
    },
    labelMapping() {
      return {
        CompanyName: this.$t('lbl_CompanyName_0'),
        EnglishName: this.$t('lbl_EnglishName_0'),
        ShortName: this.$t('lbl_ShortName_0'),
        LegalName: this.$t('lbl_LegalName_0'),
        AddressEN1: this.$t('lbl_AddressEN1_0'),
        AddressEN2: this.$t('lbl_AddressEN2_0'),
        AddressEN3: this.$t('lbl_AddressEN3_0'),
        Tel: this.$t('lbl_Tel_0'),
        Address1: this.$t('lbl_Address1_0'),
        Address2: this.$t('lbl_Address2_0'),
        Address3: this.$t('lbl_Address3_0'),
        Fax: this.$t('lbl_Fax_0'),
        PostCode: this.$t('lbl_PostCode_0'),
        WebPage: this.$t('lbl_WebPage_0'),
        Email: this.$t('lbl_Email_0'),
        Currency: this.$t('lbl_Currency_0'),
        Bank: this.$t('lbl_Bank_0'),
        AccountNo: this.$t('lbl_AccountNo_0'),
        Memo: this.$t('lbl_Memo_0'),
        Logo: this.$t('lbl_Logo_0'),
        EditUser: this.$t('lbl_EditUser_0'),
        EditDate: this.$t('lbl_EditDate_0'),
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
      if (key === 'editCompany' && this.idDetail) {
        this.$router.push({
          path: `/${this.$i18n.locale}/master-data/company/detail?companyCode=${this.idDetail}`,
        })
      } else if (key === 'setColumnCompany') {
        this.$refs.modalSetColumn.showModal = true
      } else if (key === 'refreshCompany') {
        this.$bus.$emit('refresh-filter-data')
        return this.$refs.tableCompany?.refresh()
      } else if (key === 'closeCompany') {
        this.$router.push(this.localePath({ path: '/' }))
      } else if (key === 'saveLayout') {
        this.handleSaveLayout()
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
        this.$refs.tableCompany.refresh()
      }
    },
    handleDetailId(data) {
      this.idDetail = data
    },

    async reloadSet() {
      await this.$refs.tableCompany.refresh()
    },
  },
}
</script>
