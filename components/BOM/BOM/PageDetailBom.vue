<template>
  <div class="detail-bom">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormMain
      :data="form"
      :list-item-master="listItemMaster"
      is-edit
      @changeTable="onChangeFormItemCode"
    />
    <BaseTableItemDetail
      ref="tableDetails"
      :header-detail="headerDetail"
      :table-content="tableContent"
      :list-item-master="listItemMaster"
      :new-line="newLine"
      :column-hides="columnHides"
      @changeTable="onChangeTableDetail"
    />
    <div
      v-if="loading"
      class="spinner content d-flex justify-content-center align-items-center"
    >
      <b-spinner
        b-spinner
        style="width: 3rem; height: 3rem"
        label="Loading..."
      ></b-spinner>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import FormMain from './FormMain.vue'
import BaseTableItemDetail from '~/components/UI/Table/BaseTableItemDetail.vue'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { getUnique, isEmptyValue, formatNumberWithCommas } from '@/utils/utils'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import dateTime from '@/mixins/dateTime'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import systemMixins from '@/mixins/system'

export default {
  name: 'DetailBOM',
  components: {
    ToolBar,
    FormMain,
    BaseValidateMessage,
    BaseTableItemDetail,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      listItemMaster: [],
      listErrorMessage: [],
      listToolBars: [
        {
          key: 'add',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'save',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'delete',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
        },
        {
          key: 'refresh',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'back',
          label: this.$t('btn_btnBack_0'),
          icon: '/images/back.png',
        },
        {
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      form: {
        itemCode: this.$route.query?.itemCode || '',
        itemId: this.$route.query?.itemId || '',
        itemName: this.$route.query?.itemName || '',
        quantity: 0,
        language: this.$i18n.locale,
      },
      newLine: {
        subQuantity: 0,
        wastageRate: 0,
        effectiveDate: this.convertDate(new Date()),
        isUpdate: true,
        isNewLine: true,
      },
      tableContent: [],
      columnHides: [
        {
          fieldWide: '30',
          fieldKey: 'lineID',
          hidden: false,
        },
        {
          fieldWide: '150',
          fieldKey: 'itemCode',
          hidden: false,
        },
        {
          fieldWide: '200',
          fieldKey: 'itemName',
          hidden: false,
        },
        {
          fieldWide: '200',
          fieldKey: 'description',
          hidden: false,
        },
        {
          fieldWide: '150',
          fieldKey: 'unitID',
          hidden: false,
        },
        {
          fieldWide: '150',
          fieldKey: 'subQuantity',
          hidden: false,
        },
        {
          fieldWide: '150',
          fieldKey: 'wastageRate',
          hidden: false,
        },
        {
          fieldWide: '150',
          fieldKey: 'effectiveDate',
          hidden: false,
        },
        {
          fieldWide: '150',
          fieldKey: 'memo',
          hidden: false,
        },
      ],
      loading: false,
      lang: this.$i18n.locale,
    }
  },
  async fetch() {
    try {
      this.loading = true
      await Promise.all([this.getListItemMaster(), this.getBomDetail()])
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  computed: {
    ...mapGetters('base', ['getActiveButtonToolBar', 'getUnitOptions']),
    availableListDetails() {
      return this.tableContent.filter((item) => !item.isNewLine)
    },
    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        if (item.key === 'delete') {
          item.disabled = !this.getActiveButtonToolBar?.isDelete
        }
        if (item.key === 'add' || item.key === 'save') {
          item.disabled = !this.getActiveButtonToolBar?.isEdit
        }
        return item
      })
    },
    headerDetail() {
      return [
        {
          key: 'checkbox',
          name: '',
          width: 30,
          align: 'left',
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'lineID',
          name: 'ID',
          width: 30,
          align: 'center',
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'itemCode',
          name: this.$t('lbl_ItemCode_0'),
          filter: 'autocomplete',
          width: 150,
          align: 'left',
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'itemName',
          name: this.$t('lbl_ItemName_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'description',
          name: this.$t('lbl_Description_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'unitID',
          name: this.$t('lbl_Unit_0'),
          filter: 'select',
          width: 150,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
          options: this.getUnitOptions,
        },
        {
          key: 'subQuantity',
          name: this.$t('lbl_Quantity_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          disabled: false,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'wastageRate',
          name: this.$t('lbl_WastageRate_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          disabled: false,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'effectiveDate',
          name: this.$t('lbl_EffectiveDate_0'),
          filter: 'datetime',
          width: 150,
          align: 'left',
          disabled: false,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'memo',
          name: this.$t('lbl_Memo_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: false,
          fieldRequired: false,
          hidden: false,
        },
      ]
    },
  },

  methods: {
    addNewLineData() {
      this.tableContent.push({
        ...this.newLine,
        lineID: this.availableListDetails.length + 1,
      })
    },
    async getBomDetail() {
      try {
        this.loading = true
        const payload = {
          itemID: this.$route.query.itemID,
          language: this.lang,
        }
        const res = await api('getBOMDetail', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK

        if (validResponse) {
          this.form = Object.assign({}, res.data, {
            unit: this.getUnitId(res.data?.unit),
            itemId: res.data?.itemID,
            itemCode: res.data?.itemCode,
            language: this.lang,
            editDate: this.convertDateTillSecond(res.data?.editDate),
            quantity: formatNumberWithCommas(res.data?.quantity),
            failRate: formatNumberWithCommas(res.data?.failRate),
          })
          this.tableContent = res.data?.bomChildDetails?.map((item, idx) =>
            Object.assign({}, item, {
              unit: this.getUnitId(item.unit),
              itemId: item.subItemID,
              lineID: idx + 1
            })
          )
          this.tableContent.push({
            ...this.newLine,
            lineID: this.tableContent.length + 1,
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async getListItemMaster() {
      const res = await api('getItemCode')
      if (res && res.status === SERVER_RESPONSE_CODE.OK) {
        this.listItemMaster = res?.data
      }
    },
    handleAction(key) {
      if (key === 'add') {
        return this.handleButtonAdd()
      }
      if (key === 'save') {
        return this.handleButtonSave()
      }
      if (key === 'delete') {
        return this.handleButtonDelete()
      }
      if (key === 'back') {
        return this.$router.push(
          this.localePath({ path: '/master-data/b-bom' })
        )
      }
      if (key === 'refresh') {
        return this.handleButtonRefresh()
      }
      if (key === 'close') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
    },

    resetTableDetailData() {
      this.$refs.tableDetails.activeRow = -1
      this.$refs.tableDetails.resetSearchData()
      this.tableContent = []
    },

    handleButtonRefresh() {
      this.form = {}
      this.listErrorMessage = []
      this.resetTableDetailData()
      this.getBomDetail()
    },

    handleButtonAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.$router.push(this.localePath({ path: '/master-data/b-bom/add' }))
      }
    },

    async handleButtonSave() {
      try {
        const params = this.form
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return false
        }

        this.listErrorMessage = []

        const requiredFields = {
          itemId: 'ItemCode',
          itemName: 'ItemName',
          quantity: 'Quantity',
        }

        const validateDetailsFields = {
          subQuantity: 'Quantity',
          itemCode: 'ItemCode',
          effectiveDate: 'EffectiveDate',
        }

        for (const prop in requiredFields) {
          if (!this.form[prop]) {
            this.listErrorMessage.push({
              fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
              text: this.$t('msg_NoInput_0'),
            })
          }
        }
        const hasNoDetails = this.availableListDetails.length === 0
        if (hasNoDetails) {
          this.listErrorMessage.push({
            fieldName: this.$t('msg_Details_0'),
            text: this.$t('msg_NoInput_0'),
          })
        } else {
          this.availableListDetails.forEach((item) => {
            for (const key in validateDetailsFields) {
              if (item.itemCode && item.itemCode === this.form.itemCode) {
                this.listErrorMessage.push({
                  fieldName: `${this.$t('lbl_LineID_0')} ${
                    item.lineID
                  } - 物料和成品`,
                  text: this.$t('msg_RepeatInput_0'),
                })
                return
              }

              if (
                key === 'subQuantity' &&
                !this.parseStringToFloat(item.subQuantity)
              ) {
                this.listErrorMessage.push({
                  fieldName: `${this.$t('lbl_LineID_0')} ${
                    item.lineID
                  } - ${this.$t(`lbl_${validateDetailsFields[key]}_0`)}`,
                  text: this.$t('msg_NoInput_0'),
                })
              }

              if (!item[key]) {
                this.listErrorMessage.push({
                  fieldName: `${this.$t('lbl_LineID_0')} ${
                    item.lineID
                  } - ${this.$t(`lbl_${validateDetailsFields[key]}_0`)}`,
                  text: this.$t('msg_NoInput_0'),
                })
              }
            }
          })
        }
        this.listErrorMessage = getUnique(this.listErrorMessage, 'fieldName')

        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }

        params.bomDtlRequestList = this.availableListDetails.map((item) =>
          Object.assign({}, item, {
            quantity: item.subQuantity,
            itemId: item.subItemID || item.itemID,
          })
        )

        this.loading = true

        const formatNumberFields = ['quantity', 'failRate']
        for (const key of formatNumberFields) {
          params[key] = this.parseStringToFloat(params[key]) || 0
        }
        const response = await api('updateBOM', params)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }

        const validResponse =
          response && response.status === SERVER_RESPONSE_CODE.OK

        if (validResponse) {
          window.alert(this.$t('msg_IsSaved_0'))
          return this.getBomDetail()
        }

        window.alert(`${response?.message}`)
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async handleButtonDelete() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (!confirm) {
        return
      }

      const parentItemId = this.form.itemId
      const payload = {
        parentItemId,
      }

      const res = await api('deleteBOM', payload)
      const errorCode = res?.data?.response?.status

      if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
        window.alert(this.$t(res?.data?.response?.data?.message))
        return
      }
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        window.alert(this.$t('msg_IsDeleted_0'))
        const itemId = this.form.itemId
        const itemCode = this.form.itemCode
        const itemName = this.form.itemName
        this.$router.push(
          this.localePath({
            path: `/master-data/b-bom/add?itemId=${itemId}&itemCode=${itemCode}&itemName=${itemName}`,
          })
        )
      }
    },
    onChangeTableDetail(data) {
      this.tableContent = data
    },
    getUnitId(unitText) {
      const unitId = this.getUnitOptions.find(
        (item) => item.text === unitText
      )?.value

      if (isEmptyValue(unitId)) {
        return ''
      }

      return unitId
    },
    onChangeFormItemCode(data) {
      this.tableContent = data.map((item) => ({
        ...item,
        isUpdate: false,
        isNewLine: false,
      }))
      this.addNewLineData()
    },
  },
}
</script>
<style lang="scss" scoped>
.detail-bom {
  background: #fff 50% bottom repeat-x;
  color: #222;
  position: relative;
  padding: 0.2em 0.2em 0;
  zoom: 1;
  font-family: Lucida Grande, Lucida Sans, Arial, sans-serif;
  font-size: 1.1em;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  height: 100%;
}
.font-size-14 {
  font-size: 14px;
}

.pr-20 {
  padding-right: 20px;
}

.color-red {
  color: red;
}
</style>
