<template>
  <div>
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr>
          <td class="label" style="width: 3%">
            <span id="FileName">{{ $t('lbl_FileName_0') }}</span>
          </td>
          <td class="input">
            <input
              id="txtFilepath"
              type="file"
              name="txtFilepath"
              @change="uploadFile"
            />
          </td>
          <td class="info">
            <div
              class="button-upload"
              type="button"
              name="btnUpload"
              @click="getSheetDetail"
            >
              {{ $t('btn_btnUpload_0') }}
            </div>
          </td>
        </tr>
        <tr>
          <td class="label" style="width: 3%">
            <span id="SheetList">{{ $t('lbl_SheetList_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="sheetId"
              :options="sheetOptions"
              class="select"
              text-field="sheetName"
              value-field="sheetId"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
      </tbody>
    </table>
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
import { SERVER_RESPONSE_CODE } from '~/constants'
import api from '@/api/api'

export default {
  data() {
    return {
      loading: false,
      file: null,
      sheetId: null,
      sheetOptions: [],
    }
  },

  methods: {
    uploadFile(event) {
      this.file = event.target.files[0]
    },

    async getSheetDetail() {
      try {
        this.loading = true
        const formData = new FormData()
        const validFile = !!this.file

        if (!validFile) {
          return
        }

        formData.append('file', this.file)
        const res = await api('getSheetDetail', formData)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.sheetOptions = res.data
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
<style lang="scss" scoped>
table.edit {
  width: 100%;
  background: #ebeff6;
  td.input {
    width: 20%;
    .select {
      font-size: 12px;
      border: 1px solid #aaa;
      background-color: #fff !important;
      border-radius: 2px;
    }
    .checkbox {
      height: 14px;
    }
    input {
      height: 30px;
      width: 100%;
      padding: 2px 0;
      border: 1px solid #aaa;
      background-color: #fff;
    }
  }
  td.label {
    padding: 2px;
  }
}
.button-upload {
  display: flex;
  align-items: center;
  height: 20px;
  border: 1px solid #aaa;
  background-color: #fff;
  font-size: 12px;
  color: #222;
  justify-content: center;
}
</style>
