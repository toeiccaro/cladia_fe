<template>
  <div class="common-input p-1">
    <div class="text-title">{{ $t('lbl_ImportData_0') }}</div>
    <div class="input__group d-flex">
      <div class="mr-2">{{ $t('lbl_ImportHolidayCalendar_0') }}</div>
      <div class="d-flex center-text">
        <input
          id="txtFilepath"
          type="file"
          name="txtFilepath"
          @change="uploadFile"
        />
        <div class="button-upload" @click="handleImport">
          {{ $t('btn_btnUpload_0') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import api from '@/api/api'
export default {
  name: 'InputCalendar',
  data() {
    return {
      file: null,
      fileType: '',
    }
  },
  watch: {},
  methods: {
    ...mapMutations({
      setLoading: 'base/SET_LOADING',
    }),
    uploadFile(event) {
      this.file = event.target.files[0]
      const fileName = event.target.files[0].name
      const fileArray = fileName.split('.')
      this.fileType = fileArray[fileArray.length - 1].toLowerCase()
    },

    async handleImport() {
      const listTypeExcel = ['xlsx', 'xls', 'xlsm']

      try {
        const fileImport = this.file
        if (!fileImport) {
          return
        }
        if (!listTypeExcel.includes(this.fileType)) {
          window.alert('エクセル形式のみインポート可能: xlsx, xls, xlsm')
          return
        }

        const formData = new FormData()
        formData.append('file', fileImport)
        this.setLoading(true)
        const res = await api('importHolidayCalendar', formData)
        if (res) {
          const message = res?.message ?? res?.data?.response?.data?.message
          window.alert(this.$t(message))
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.setLoading(false)
        this.file = ''
      }
    },
  },
}
</script>

<style scoped>
.common-input {
  gap: 32px;
  display: grid !important;
  grid-template-columns: 15% 85%;
}
.input__group {
  gap: 3px;
}
.text-title {
  font-size: 12px;
  font-weight: 700;
}
.button-upload {
  background: #f0f0f0;
  border: 1px solid gray;
  font-size: 12px;
  padding: 2px 4px;
  cursor: pointer;
  border-radius: 3px;
  height: 22px;
}
.center-text {
  align-items: center;
  margin-top: -4px;
}
</style>
