<template>
  <div>
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    ></BaseValidateMessage>
    <ToolBar
      :list-tools="listToolBars"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <ImportForm ref="formImport"></ImportForm>
    <ResultForm :list-details="dataImport" />
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
import dateTime from '@/mixins/dateTime'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import ResultForm from '@/components/Inventory/Import/ResultImport.vue'
import { downloadFileExcel } from '@/utils/utils'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage.vue'
import ImportForm from '~/components/Inventory/Import/ImportForm.vue'
import { SERVER_RESPONSE_CODE } from '~/constants'
export default {
  components: { ToolBar, ImportForm, ResultForm, BaseValidateMessage },
  mixins: [dateTime],
  data() {
    return {
      dataImport: [],
      listToolBars: [
        {
          key: 'mode',
          label: this.$t('btn_btnMode_0'),
          icon: '/images/mode.png',
        },
        {
          key: 'import',
          label: this.$t('btn_btnImport_0'),
          icon: '/images/import.png',
        },

        {
          key: 'save',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      listErrorMessage: [],
      loading: false,
      lang: this.$i18n.locale,
    }
  },
  methods: {
    changeActiveToolBar(key) {
      if (key === 'import') {
        this.handleImport()
      }
      if (key === 'mode') {
        this.handleMode()
      }
      if (key === 'save') {
        this.handleSave()
      }
      if (key === 'close') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
    },
    async handleImport() {
      try {
        const fileImport = this.$refs.formImport.file
        if (!fileImport) {
          return
        }

        const sheetId = this.$refs.formImport.sheetId

        const formData = new FormData()
        formData.append('file', fileImport)
        formData.append('sheetId', sheetId)

        const res = await api('importFileInventoryInport', formData)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataImport.push(...res.data)
          window.alert(this.$t('msg_Successfully_0'))
        }
      } catch (error) {
        console.error(error)
      }
    },
    async handleSave() {
      try {
        // const convertDateFields = ['transDate']
        for (const item of this.dataImport) {
          item.transDate = this.convertDate(new Date(item.transDate))
        }

        const res = await api('importFileInventorySave', this.dataImport)
        if (res && res.status === 200) {
          window.alert(this.$t('msg_Successfully_0'))
          location.reload()
        }
      } catch (error) {}
    },
    async handleMode() {
      try {
        const response = await api('getFileDefaultExcel', this.lang)
        if (response && response.status === 200) {
          downloadFileExcel(response.data)
          window.alert(this.$t('msg_Successfully_0'))
        } else {
          window.alert(`${response?.message}`)
        }
      } catch (error) {
        window.alert(error?.data?.response?.data?.message)
      }
    },
  },
}
</script>

<style></style>
