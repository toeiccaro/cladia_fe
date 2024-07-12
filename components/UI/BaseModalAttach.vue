<template>
  <div>
    <div v-if="showModal" class="modal-container">
      <div class="modal-pep"></div>
      <div class="modal-content">
        <div
          class="bg-cladia d-flex align-items-center justify-content-between"
        >
          <div class="text-white pl-2 font-weight-bold">
            {{ $t('lbl_Attachments_0') }}
          </div>
          <div
            class="text-white pr-2 cursor-pointer"
            @click="showModal = false"
          >
            x
          </div>
        </div>
        <div class="modal-content__main">
          <div class="bg-header-attachment p-1 pt-2">
            <div class="d-flex align-items-center">
              <div class="col-2 p-0">{{ $t('lbl_RenName_0') }}</div>
              <input
                v-model="inputFileName"
                type="text"
                class="col-8 box__border"
              />
            </div>
            <div class="d-flex align-items-center mt-1">
              <div class="col-2 p-0">{{ $t('lbl_FileName_0') }}</div>
              <label
                for="input__choose-file"
                class="label__input-choose-file col-8 bg-white px-0 box__border"
              >
                <input
                  id="input__choose-file"
                  ref="fileUpload"
                  type="file"
                  @change="changeFile"
                />
              </label>

              <div
                class="col-2 ml-1 bg-white text-center box__border cursor-pointer"
                @click="save"
              >
                {{ $t('btn_btnUpload_0') }}
              </div>
              <div></div>
            </div>
          </div>
          <div class="table-attachment">
            <div class="table-attachment__header d-flex align-items-center">
              <div class="table-attachment__item col-0-5 text-center">ID</div>
              <div class="table-attachment__item col-3">
                {{ $t('lbl_FileName_0') }}
              </div>
              <div class="table-attachment__item col-1-5">
                {{ $t('lbl_FileType_0') }}
              </div>
              <div class="table-attachment__item col-1-5">
                {{ $t('lbl_FileSize_0') }}
              </div>
              <div class="table-attachment__item col-1-5">
                {{ $t('lbl_EditUser_0') }}
              </div>
              <div class="table-attachment__item col-2">
                {{ $t('lbl_EditDate_0') }}
              </div>
              <div class="table-attachment__item col-2"></div>
            </div>
            <template v-if="data && dataAttachments">
              <div
                v-for="(item, index) in dataAttachments"
                :key="`attachment${index}`"
                class="table-attachment__row d-flex align-items-center"
              >
                <div class="table-attachment__item col-0-5 text-center">
                  {{ index + 1 }}
                </div>
                <div class="table-attachment__item col-3">
                  <a
                    href="#"
                    class="text-blue"
                    @click="downloadInNewWindow(item.url)"
                    >{{ item && item.fileName }}</a
                  >
                </div>
                <div class="table-attachment__item col-1-5">
                  {{ item.fileType }}
                </div>
                <div class="table-attachment__item col-1-5">
                  {{ item.fileSize }}
                </div>
                <div class="table-attachment__item col-1-5">
                  {{ item.editUser }}
                </div>
                <div class="table-attachment__item col-2">
                  {{ dateFormat(item.editDate) }}
                </div>
                <div
                  class="table-attachment__item col-2 d-flex justify-content-around"
                >
                  <div
                    class="text-blue cursor-pointer"
                    @click="removeAttachment(item.id)"
                  >
                    x
                  </div>
                  <a
                    v-if="allowImmediateDownloadTypes.includes(item.fileNType)"
                    :href="item.url"
                    target="_blank"
                    class="text-blue cursor-pointer"
                    >...</a
                  >
                  <a
                    v-else
                    :href="item.url"
                    target="_blank"
                    class="text-blue cursor-pointer"
                    @click="openUrl(item.url)"
                    >...</a
                  >
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
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
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
import { formatBytes, dateFormat } from '@/utils/utils'
export default {
  name: 'BaseModalAttach',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    keyFileNo: {
      type: String,
      default: () => '',
    },
    moduleName: {
      type: String,
      default: () => '',
    },
    keyFile: {
      type: String,
      default: () => 'attachments',
    },
    allowImmediateDownloadTypes: {
      type: Array,
      default: () => ['xls', 'xlsx'],
    },
    add: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      loading: false,
      showModal: false,
      file: null,
      fileName: '',
      inputFileName: '',
      dataAttachments: [],
    }
  },

  watch: {
    data: {
      deep: true,
      handler(data) {
        this.dataAttachments = data[this.keyFile]
      },
    },
    inputFileName: {
      handler(data) {
        if (!data) {
          return (this.fileName = this.file?.fileName)
        }
        this.fileName = data
      },
    },
  },
  methods: {
    downloadInNewWindow(url) {
      window.open(url, '', 'width=200,height=100')
    },

    formatBytes(bytes, decimal = 2) {
      return formatBytes(bytes, decimal)
    },

    dateFormat(dt) {
      return dateFormat(new Date(dt))
    },

    async save() {
      try {
        const canUpload =
          !this.add &&
          this.file &&
          this.keyFileNo &&
          this.data[this.keyFileNo] &&
          this.data

        if (canUpload) {
          this.loading = true
          const formData = new FormData()
          formData.append('file', this.file)
          formData.append('fileNo', this.data[this.keyFileNo] || this.keyFileNo)
          formData.append('moduleName', this.moduleName)
          if (this.inputFileName) {
            formData.append('reName', this.inputFileName)
          }
          const res = await api('uploadAttachment', formData)
          if (res.status === SERVER_RESPONSE_CODE.OK) {
            this.$emit('updateData', res.data)
            this.file = ''
            this.inputFileName = ''
            this.$refs.fileUpload.value = null
            window.alert(this.$t('msg_UpSuccess_0'))
          } else {
            window.alert(this.$t('msg_FileMoreLenth_0'))
          }
        }
      } catch (err) {
        window.alert(err?.data?.response?.data?.message)
      } finally {
        this.loading = false
      }
    },
    changeFile(e) {
      this.file = e.target.files[0]
      if (!this.inputFileName) {
        this.fileName = e.target.files[0].name
      }
    },
    openUrl(url) {
      window.open(url, '_blank')
    },
    async removeAttachment(id) {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
        if (confirm) {
          this.loading = true
          await api('deleteAttachment', { id })
          this.$emit('deleteData', id)
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
.table-attachment {
  max-height: 100%;
}
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
}
.modal-pep {
  position: absolute;
  top: 0;
  background: rgb(204, 204, 204);
  opacity: 0.6;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.modal-content {
  background-color: white;
  z-index: 11;
  width: 80%;
  height: 70%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid rgb(42, 78, 161);
  padding: 1px;
}

.modal-content__main {
  font-size: 12px;
  overflow-y: auto;
}

.bg-header-attachment {
  background-color: #ebeff6;
}

.table-attachment__header {
  background-color: #bcdbf3;
  font-weight: bold;
}

.table-attachment__item {
  padding: 4px 3px 4px 3px;
}

.col-1-5 {
  flex: 1 1 calc(100% / 8);
  max-width: calc(100% / 8);
}

.col-0-5 {
  flex: 1 1 calc(100% / 24);
  max-width: calc(100% / 24);
}

.text-blue {
  color: blue;
  text-decoration: underline;
  word-break: break-all;
}

.table-attachment__row:nth-child(even) {
  background-color: #eff3fb;
}
.box__border {
  border: 1px solid #aaa;
}
</style>
