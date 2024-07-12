<template>
  <div class="add-bom">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormMain
      ref="formAddBom"
      :data="form"
      :list-item-master="listItemMaster"
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
import { getUnique } from '@/utils/utils'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import dateTime from '@/mixins/dateTime'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import systemMixins from '@/mixins/system'

export default {
  name: 'AddBOM',
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
      defaultFormData: {
        itemCode: this.$route.query?.itemCode || '',
        itemId: this.$route.query?.itemId || '',
        itemName: this.$route.query?.itemName || '',
        quantity: 0,
        language: this.$i18n.locale,
      },
      form: {},
      dataTable: [],
      loading: false,
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
    }
  },
  fetch() {
    try {
      this.form = Object.assign({}, this.defaultFormData)
      this.addNewLineData()

      this.getListItemMaster()
    } catch (err) {
      console.error(err)
    }
  },
  computed: {
    ...mapGetters('base', ['getActiveButtonToolBar', 'getUnitOptions']),
    availableListDetails() {
      return this.tableContent.filter((item) => !item.isNewLine)
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

    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        if (item.key === 'delete') {
          item.disabled = !this.getActiveButtonToolBar?.isDelete
        }
        return item
      })
    },
  },

  methods: {
    onChangeTableDetail(data) {
      this.tableContent = data
    },
    resetTableDetailData() {
      this.$refs.tableDetails.activeRow = -1
      this.$refs.tableDetails.resetSearchData()
      this.tableContent = []
    },
    addNewLineData() {
      this.tableContent.push({
        ...this.newLine,
        lineID: this.availableListDetails.length + 1,
      })
    },
    handleButtonRefresh() {
      this.form = Object.assign({}, this.defaultFormData)
      this.$refs.formAddBom.dataExists = false
      this.listErrorMessage = []
      this.resetTableDetailData()
      this.addNewLineData()
    },

    async getListItemMaster() {
      this.loading = true
      try {
        const res = await api('getItemCode')
        if (res && res.status === SERVER_RESPONSE_CODE.OK) {
          this.listItemMaster = res?.data
        }
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
      }
    },
    async handleAction(key) {
      if (key === 'add') {
        return this.handleButtonAdd()
      }
      if (key === 'save') {
        return await this.handleButtonSave()
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

    handleButtonAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.replaceUrl()
        setTimeout(() => location.reload(), 0)
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

        const shouldAdd = this.$refs.formAddBom?.dataExists === false
        const apiToCall = shouldAdd ? 'saveBOM' : 'updateBOM'

        const response = await api(apiToCall, params)
        this.loading = false
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        const validResponse =
          response && response.status === SERVER_RESPONSE_CODE.OK

        if (!validResponse) {
          return window.alert(`${response?.message}`)
        }

        window.alert(this.$t('msg_IsSaved_0'))

        if (shouldAdd) {
          this.$router.push(
            this.localePath(
              `/master-data/b-bom/detail?itemID=${response.data?.itemID}`
            )
          )
        }
      } catch (error) {
        console.error(error)
      }
    },
    handleButtonDelete() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        this.handleButtonRefresh()
      }
    },
    onChangeFormItemCode(data) {
      this.tableContent = data.map((item) => ({
        ...item,
        isUpdate: false,
        isNewLine: false,
      }))
      this.addNewLineData()
    },
    replaceUrl() {
      const query = Object.assign({}, this.$route.query)
      const hasQueryParams = query.itemCode || query.itemId || query.itemName

      if (query.itemCode) {
        delete query.itemCode
      }

      if (query.itemId) {
        delete query.itemId
      }

      if (query.itemName) {
        delete query.itemName
      }

      if (hasQueryParams) {
        this.$router.replace({ query })
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.add-bom {
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
