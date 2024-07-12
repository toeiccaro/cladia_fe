<template>
  <div>
    <div v-if="showModal" class="modal-import-container">
      <div class="modal-import--outside"></div>
      <div class="modal-import-content">
        <div class="header">
          <h2 class="pl-2">
            {{ $t('btn_btnImport_0') }}
          </h2>
          <div
            class="text-white pr-2 cursor-pointer"
            @click="showModal = false"
          >
            x
          </div>
        </div>
        <div class="modal-import-content__main">
          <ToolBar
            :list-tools="listToolBars"
            @changeActiveToolBar="handleAction"
          />
          <div class="input-file">
            <div class="col-2 p-0">{{ $t('lbl_FileName_0') }}</div>
            <label for="input__choose-file">
              <input
                id="input__choose-file"
                ref="fileUpload"
                type="file"
                @change="changeFile"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import { downloadFileExcel } from '@/utils/utils'

export default {
  components: { ToolBar },
  data() {
    return {
      loading: false,
      showModal: false,
      file: null,
      fileName: '',
      fileType: '',
      listToolBars: [
        {
          key: 'mode',
          label: this.$t('btn_btnMode_0'),
          icon: '/images/mode.png',
        },
        {
          key: 'ok',
          label: this.$t('btn_btnOK_0'),
          icon: '/images/ok.png',
        },
        {
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
    }
  },
  watch: {},
  methods: {
    handleAction(key) {
      if (key === 'mode') {
        this.mode()
      } else if (key === 'ok') {
        this.save()
      } else if (key === 'close') {
        this.showModal = false
        this.fileName = ''
      }
    },
    async mode() {
      try {
        const params = {
          lang: this.$i18n.locale,
        }
        const res = await api('getModeImport', params)
        if (res && res.status === SERVER_RESPONSE_CODE.OK) {
          downloadFileExcel(res.data)
          window.alert(this.$t('msg_Successfully_0'))
        } else {
          window.alert(`${res?.message}`)
        }
      } catch (err) {
        window.alert(err?.data?.response?.data?.message)
      }
    },
    async save() {
      const listTypeExcel = ['xlsx', 'xls', 'xlsm']
      try {
        if (this.file) {
          if (listTypeExcel.includes(this.fileType)) {
            const formData = new FormData()
            formData.append('file', this.file, this.fileName)
            const res = await api('importOrder', formData)
            if (res && res.status === SERVER_RESPONSE_CODE.OK) {
              this.$emit('importData', res?.data)
              this.fileName = ''
              this.$refs.fileUpload.value = null
              window.alert(this.$t('msg_Successfully_0'))
              this.showModal = false
            } else {
              window.alert('インポートできません')
            }
          } else {
            window.alert('エクセル形式のみインポート可能: xlsx, xls, xlsm')
          }
        }
      } catch (err) {
        window.alert(err?.data?.response?.data?.message)
      }
    },
    changeFile(e) {
      this.file = e.target.files[0]
      this.fileName = e.target.files[0].name
      const fileArray = this.fileName.split('.')
      this.fileType = fileArray[fileArray.length - 1].toLowerCase()
    },
  },
}
</script>

<style lang="scss" scoped>
.modal-import-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
}
.modal-import--outside {
  position: absolute;
  top: 0;
  background: rgb(204, 204, 204);
  opacity: 0.6;
  width: 100%;
  height: 100%;
  z-index: 10;
}
.header {
  top: 0px;
  padding: 3px;
  background: rgb(42, 78, 161);
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1px;
  h2 {
    color: #fff;
    font-weight: 700 !important;
    font-size: 14px;
  }
}

.modal-import-content {
  background: white;
  border: 2px solid rgb(42, 78, 161);
  z-index: 11;
  width: 456px;
  height: 206px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1px;
}

.modal-import-content__main {
  font-size: 12px;
  margin-top: 18px;
  .input-file {
    display: flex;
    align-items: center;
    background-color: #ebeff6;
    padding: 2px;
    label {
      padding: 2px 0;
      border: 1px solid #aaa;
      background-color: #fff;
      width: 100%;
      input[type='file'] {
        appearance: none;
        background-color: initial;
        cursor: default;
        align-items: baseline;
        color: inherit;
        text-overflow: ellipsis;
        white-space: pre;
        text-align: start !important;
        padding: initial;
        border: initial;
        overflow: hidden !important;
      }
    }
  }
}
</style>
