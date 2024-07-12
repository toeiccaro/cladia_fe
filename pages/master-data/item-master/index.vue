<template>
  <div>
    <ToolBar
      :list-tools="listToolBars"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TableItemMaster
      ref="tableItemMaster"
      :label-mapping="labelMapping"
      @detail="handleRedirectToPageDetail"
      @changeLayout="changeLayout"
    ></TableItemMaster>
    <BaseSetColumn
      ref="modalSetColumn"
      :label-mapping="labelMapping"
      @reloadSet="functionReload"
    ></BaseSetColumn>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar'
import TableItemMaster from '@/components/MasterData/ItemMaster/TableItemMaster'
import { downloadFileExcel } from '@/utils/utils'
import BaseSetColumn from '~/components/UI/BaseSetColumn'

export default {
  name: 'IndexItemMaster',
  components: {
    ToolBar,
    TableItemMaster,
    BaseSetColumn,
  },
  middleware: ['authenticated'],

  data() {
    return {
      activeToolBar: '',
      dataDetailItemMaster: {},
      itemId: '',
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      payloadItemMaster: 'filterSort/getPayloadItemMaster',
    }),
    labelMapping() {
      return {
        ItemCode: this.$t('lbl_ItemCode_0'),
        ItemName: this.$t('lbl_ItemName_0'),
        AliasName: this.$t('lbl_AliasName_0'),
        Color: this.$t('lbl_Color_0'),
        DepartType: this.$t('lbl_DepartType_0'),
        Description: this.$t('lbl_Description_0'),
        ItemPic: this.$t('lbl_ItemPic_0'),
        ItemType: this.$t('lbl_ItemType_0'),
        MakePeriod: this.$t('lbl_MakePeriod_0'),
        Memo: this.$t('lbl_Memo_0'),
        MOQ: this.$t('lbl_MOQ_0'),
        OutPeriod: this.$t('lbl_OutPeriod_0'),
        OutRate: this.$t('lbl_OutRate_0'),
        OutUnit: this.$t('lbl_OutUnit_0'),
        PackPeriod: this.$t('lbl_PackPeriod_0'),
        Price: this.$t('lbl_Price_0'),
        PurchasePeriod: this.$t('lbl_PurchasePeriod_0'),
        PurchaseUnit: this.$t('lbl_PurchaseUnit_0'),
        SafeQty: this.$t('lbl_SafeQty_0'),
        SalePeriod: this.$t('lbl_SalePeriod_0'),
        SPQ: this.$t('lbl_SPQ_0'),
        Unit: this.$t('lbl_Unit_0'),
        Weight: this.$t('lbl_Weight_0'),
        WeightUnit: this.$t('lbl_WeightUnit_0'),
        EditDate: this.$t('lbl_EditDate_0'),
        EditUser: this.$t('lbl_EditUser_0'),
        Barcode: this.$t('lbl_Barcode_0'),
        Responsible: this.$t('lbl_ResponsibleMan_0'),
        ResponsibleMan: this.$t('lbl_ResponsibleMan_0'),
        DayAbility: this.$t('lbl_DayAbility_0'),
        SOPrice: this.$t('lbl_SOPrice_0'),
        BoxType: this.$t('lbl_BoxType_0'),
        IsNotNeedMRP: this.$t('lbl_IsNotNeedMRP_0'),
        IsCommon: this.$t('lbl_IsCommon_0'),
        Warehouse: this.$t('lbl_Warehouse_0'),
        ItemCustom: this.$t('lbl_ItemCustom_0'),
      }
    },
    listToolBars() {
      return [
        {
          key: 'addItemMaster',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
          disabled: !this.activeButtonToolBar?.isEdit,
        },
        {
          key: 'editItemMaster',
          label: this.$t('btn_btnEdit_0'),
          icon: '/images/edit.png',
          disabled: !this.activeButtonToolBar?.isEdit,
        },
        {
          key: 'refreshItemMaster',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'exportItemMaster',
          label: this.$t('btn_btnExport_0'),
          icon: '/images/export.png',
          type: 'menu',
          disabled: !this.activeButtonToolBar?.isExport,
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
          key: 'setItemMaster',
          label: this.$t('btn_btnSet_0'),
          icon: '/images/set.png',
        },
        {
          key: 'saveItemMaster',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'closeItemMaster',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ]
    },
  },
  watch: {
    'dataLayout.headerData': {
      immediate: true,
      deep: true,
      handler(val) {
        if (this.dataLayout) {
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
        }
      },
    },
  },
  methods: {
    functionReload() {
      location.reload()
    },
    changeActiveToolBar(key) {
      switch (key) {
        case 'setItemMaster':
          this.$refs.modalSetColumn.showModal = true
          break
        case 'addItemMaster':
          this.activeToolBar = key
          this.$router.push(
            this.localePath({ path: '/master-data/item-master/add' })
          )
          break
        case 'editItemMaster':
          this.itemId &&
            this.$router.push({
              path: `/${this.$i18n.locale}/master-data/item-master/detail?itemCode=${this.itemId}`,
            })
          break
        case 'refreshItemMaster':
          location.reload()
          break
        case 'saveItemMaster':
          this.handleSaveLayout()
          break
        case 'closeItemMaster':
          this.$router.push(this.localePath({ path: '/' }))
          break
      }
    },
    exportByPage() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      const sortFormOptional = {
        ...this.payloadItemMaster,
        exportAllData: false,
      }
      this.handleExportExcel(sortFormOptional)
    },
    exportAll() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      const sortFilter = this.payloadItemMaster
      delete sortFilter.pageNo
      delete sortFilter.pageSize
      const sortFormOptional = {
        ...sortFilter,
        localLanguage: this.$i18n.locale,
        exportAllData: true,
      }
      this.handleExportExcel(sortFormOptional)
    },
    async handleExportExcel(payload) {
      const response = await api('exportItemMaster', payload)
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
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
        this.$refs.tableItemMaster.refreshTable()
      }
    },
    handleRedirectToPageDetail(itemId) {
      if (itemId) {
        this.itemId = itemId
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.item-master-container {
  width: 100%;
}
</style>
