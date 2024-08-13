<template>
  <div>
    <ToolBar
      :list-tools="listToolBars"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TableParameter
      ref="tableParameter"
      @handleSelectRow="handleSelectRow"
      @resetData="handleCancel"
      @resetChosenRowIndex="handleResetChosenRowIndex"
      @saveData="handleSave"
    />
  </div>
</template>
<script>
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar'
import TableParameter from '~/components/MasterData/Parameter/TableParameter'
import { SERVER_RESPONSE_CODE, MD_PARAMETER_TYPE } from '~/constants'
import { isEmptyValue } from '~/utils/utils'
export default {
  components: { ToolBar, TableParameter },
  data() {
    return {
      currentRowIndex: -1,
      editingDataTable: [],
      isEditing: false,
      isAdding: false,
      canNotDeleteKeyIds: [
        {
          type: 'ItemType',
          value: [1, 3, 4, 5, 6],
        },
      ],
      isCanNotDelete: false,
    }
  },
  computed: {
    isDisableToolbarItem() {
      return this.isEditing || this.isAdding
    },

    parameterType() {
      return this.$refs.tableParameter.parameterType
    },

    dataTable: {
      get() {
        return this.$refs.tableParameter.dataTable || []
      },

      set(newValue) {
        this.$refs.tableParameter.dataTable = newValue
      },
    },

    dataHeader: {
      get() {
        return this.$refs.tableParameter.dataHeader || []
      },

      set(newValue) {
        this.$refs.tableParameter.dataHeader = newValue
      },
    },

    listToolBars() {
      return [
        {
          key: 'add',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
          disabled: this.isDisableToolbarItem,
        },
        {
          key: 'edit',
          label: this.$t('btn_btnEdit_0'),
          icon: '/images/edit.png',
          disabled: this.isDisableToolbarItem,
        },
        {
          key: 'save',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'cancel',
          label: this.$t('btn_btnCancel_0'),
          icon: '/images/cancel.png',
          width: '17px',
          height: '17px',
        },

        {
          key: 'delete',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
          disabled: this.isCanNotDelete,
        },
        {
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ]
    },
  },
  watch: {
    currentRowIndex: {
      handler(value) {
        this.isCanNotDelete = this.canNotDelete()
      },
    },
  },
  created() {
    this.$bus.$on(
      'table-parameter-data-changed',
      (data) => (this.editingDataTable = data)
    )
  },
  methods: {
    changeActiveToolBar(key) {
      switch (key) {
        case 'edit':
          return this.handleEdit()
        case 'save':
          return this.handleSave()
        case 'add':
          return this.handleAdd()
        case 'cancel':
          return this.handleCancel()
        case 'delete':
          return this.handleDelete()
        case 'close':
          return this.handleClose()
        default:
          break
      }
    },

    canNotDelete() {
      const selectedItem = this.dataTable[this.currentRowIndex]
      if (!selectedItem) return false
      const selectedKeyId = selectedItem?.keyID
      return this.canNotDeleteKeyIds.some(
        (item) =>
          item.type === selectedItem?.keyCode &&
          item.value.includes(selectedKeyId)
      )
    },

    handleResetChosenRowIndex() {
      this.currentRowIndex = -1
    },

    handleClose() {
      this.$router.push(this.localePath({ path: '/' }))
    },

    async handleDelete() {
      try {
        const invalidRowIndex =
          this.currentRowIndex < 0 || isEmptyValue(this.currentRowIndex)
        if (invalidRowIndex) {
          return
        }

        let msgDel = this.$t('msg_ConfirmDel_0')
        if (this.$refs.tableParameter.parameterType === MD_PARAMETER_TYPE.WAREHOUSE) {
          msgDel = this.$t('msg_ConfirmDelWareHouseInUse_0')
        }
        const confirm = window.confirm(msgDel)
        if (!confirm) {
          return
        }

        if (this.canNotDelete()) {
          return
        }

        const selectedItem = this.dataTable[this.currentRowIndex]
        const payload = {
          keyId: selectedItem?.keyID,
          keyCode: selectedItem?.keyCode,
        }
        const res = await api(this.shouldShowCodeField() ? 'deleteFinanceSetting' : 'deleteParameter', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          await this.refetchLanguageTable()
        }
      } catch (err) {
        console.error(err)
      }
    },

    handleCancel() {
      if (this.isAdding) {
        this.removeAddingItem()
      }

      this.disableEditingOnTable()
      this.disableEditingStatus()
    },

    removeAddingItem() {
      this.dataTable = this.dataTable.filter((item) => !item.isNew)
    },

    handleAdd() {
      const newDataTableItem = {
        isUpdate: true,
        isNew: true,
      }

      this.dataHeader.forEach((headerItem) => {
        newDataTableItem[headerItem.languageName] = ''
      })

      const clonedDataTable = JSON.parse(JSON.stringify(this.dataTable))
      clonedDataTable.unshift(newDataTableItem)

      this.dataTable = clonedDataTable

      this.isAdding = true
      this.currentRowIndex = 0
      this.$refs.tableParameter.$refs.tableParameterDetail.activeRow = 0
    },

    handleEdit() {
      const invalidRowIndex =
        this.currentRowIndex < 0 || isEmptyValue(this.currentRowIndex)
      if (invalidRowIndex) {
        return
      }

      this.disableEditingOnTable()

      this.dataTable[this.currentRowIndex].isUpdate = true

      this.isEditing = true
    },

    async handleSave() {
      try {
        const invalidRowIndex =
          this.currentRowIndex < 0 || isEmptyValue(this.currentRowIndex)

        if (invalidRowIndex) {
          return
        }

        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }

        this.$refs.tableParameter.loading = true

        if (this.isAdding) {
          await this.saveNewData()
        } else {
          await this.saveEditedData()
        }

        this.disableEditingStatus()
        this.removeAddingItem()
        this.disableEditingOnTable()
      } catch (err) {
        console.error(err)
      } finally {
        this.$refs.tableParameter.loading = false
      }
    },

    async saveEditedData() {
      const currentData = this.dataTable[this.currentRowIndex]
      const editingItem = this.editingDataTable[this.currentRowIndex]

      const editingDataPayload = []
      const redundantFields = [
        'index',
        'sort',
        'parameterDetailId',
        'parameterTypeId',
        'isUpdate',
      ]

      for (const prop in editingItem) {
        if (redundantFields.includes(prop)) {
          continue
        }

        editingDataPayload.push({
          language: prop,
          languageName: editingItem[prop].value,
        })
      }

      const finalPayload = {
        keyId: currentData.keyID,
        forms: editingDataPayload,
        keyCode: this.parameterType,
      }

      const res = await api(this.shouldShowCodeField() ? 'updateFinanceSetting' : 'updateParameter', finalPayload)
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        await this.refetchLanguageTable()
      }
    },

    async saveNewData() {
      const addingItem = this.editingDataTable.find((item) => item.isNew)
      const hasNoItem = !Object.keys(addingItem).length
      if (hasNoItem) {
        return
      }

      const addingDataPayload = []
      const redundantFields = [
        'index',
        'sort',
        'parameterDetailId',
        'parameterTypeId',
        'isUpdate',
        'isNew',
      ]

      for (const prop in addingItem) {
        if (redundantFields.includes(prop)) {
          continue
        }

        addingDataPayload.push({
          language: prop,
          languageName: addingItem[prop].value,
        })
      }

      const finalPayload = {
        keyCode: this.parameterType,
        forms: addingDataPayload,
      }

      const res = await api(this.shouldShowCodeField() ? 'addFinanceSetting' : 'addParameter', finalPayload)
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        await this.refetchLanguageTable()
      }
    },

    async handleSelectRow(data) {
      const canSave =
        (this.isAdding || this.isEditing) &&
        this.currentRowIndex !== data.index &&
        !data.item?.isUpdate

      if (canSave) {
        await this.handleSave()
      }

      this.currentRowIndex = data.index
    },

    disableEditingOnTable() {
      this.dataTable = this.dataTable.map((item) =>
        Object.assign(item, { isUpdate: false })
      )
    },

    disableEditingStatus() {
      this.isEditing = false
      this.isAdding = false
    },

    async refetchLanguageTable() {
      await this.$refs.tableParameter.fetchLanguageData()
    },

    shouldShowCodeField() {
      return this.$route.name.includes("finance");
    },
  },
}
</script>
