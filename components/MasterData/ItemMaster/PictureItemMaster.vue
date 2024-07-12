<template>
  <div class="picture d-flex">
    <div class="upload-image-container sys-flex">
      <div>
        <div class="show-image">
          <div class="show-img sys-flex">
            <div
              class="container-img d-flex justify-content-center align-items-center"
            >
              <div
                v-if="file1 && file1.imageUrl && checkFileExist(file1.imageUrl)"
                class="img"
                :class="{ 'img-none': file1.imageUrl == null }"
              >
                <img :src="file1.imageUrl" class="image__preview" />
              </div>
            </div>
          </div>
        </div>

        <input
          id="inputFile1"
          ref="inputFile1"
          class="display-none"
          type="file"
          accept="image/*"
          @change="onchangeFile"
        />

        <div class="sys-align-center">
          <div class="btn btn-choose-file" @click="chooseFile(1)">
            {{ $t('Choose File') }}
          </div>
          <div v-if="file1 && file1.name">
            <div v-if="file1.name.length <= 20">
              <div>{{ file1.name }}</div>
            </div>
            <div v-else class="imageFile">
              <div class="image">{{ file1.name }}</div>
              <div class="fileImageEnd">{{ file1.name }}</div>
            </div>
          </div>
          <div v-else>{{ $t('lbl_NoFileChosen_0') }}</div>
        </div>
        <div class="button-image">
          <div class="sys-flex">
            <div class="btn btn-clear" @click="clear(1)">
              {{ $t('btn_btnClear_0') }}
            </div>
            <div class="btn btn-upload" @click="save(1)">
              {{ $t('btn_btnUpload_0') }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="upload-image-container sys-flex">
      <div>
        <div class="show-image">
          <div class="show-img sys-flex">
            <div
              class="container-img d-flex justify-content-center align-items-center"
            >
              <div
                v-if="file2 && file2.imageUrl && checkFileExist(file2.imageUrl)"
                class="img"
                :class="{ 'img-none': file2.imageUrl == null }"
              >
                <img id="imge2" :src="file2.imageUrl" class="image__preview" />
              </div>
            </div>
          </div>
        </div>

        <input
          id="inputFile2"
          ref="inputFile2"
          class="display-none"
          type="file"
          accept="image/*"
          @change="onchangeFile"
        />

        <div class="sys-align-center">
          <div class="btn btn-choose-file" @click="chooseFile(2)">
            {{ $t('Choose File') }}
          </div>
          <div v-if="file2 && file2.name">
            <div v-if="file2.name.length <= 20">
              <div>{{ file2.name }}</div>
            </div>
            <div v-else class="imageFile">
              <div class="image">{{ file2.name }}</div>
              <div class="fileImageEnd">{{ file2.name }}</div>
            </div>
          </div>
          <div v-else :class="image">
            {{ $t('lbl_NoFileChosen_0') }}
          </div>
        </div>
        <div class="button-image">
          <div class="sys-flex">
            <div class="btn btn-clear" @click="clear(2)">
              {{ $t('btn_btnClear_0') }}
            </div>
            <div class="btn btn-upload" @click="save(2)">
              {{ $t('btn_btnUpload_0') }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="upload-image-container sys-flex">
      <div>
        <div class="show-image">
          <div class="show-img sys-flex">
            <div
              class="container-img d-flex justify-content-center align-items-center"
            >
              <div
                v-if="file3 && file3.imageUrl && checkFileExist(file3.imageUrl)"
                class="img"
                :class="{ 'img-none': file3.imageUrl == null }"
              >
                <img id="imge3" :src="file3.imageUrl" class="image__preview" />
              </div>
            </div>
          </div>
        </div>

        <input
          id="inputFile3"
          ref="inputFile3"
          class="display-none"
          type="file"
          accept="image/*"
          @change="onchangeFile"
        />

        <div class="sys-align-center">
          <div class="btn btn-choose-file" @click="chooseFile(3)">
            {{ $t('Choose File') }}
          </div>
          <div v-if="file3 && file3.name">
            <div v-if="file3.name.length <= 20">
              <div>{{ file3.name }}</div>
            </div>
            <div v-else class="imageFile">
              <div class="image">{{ file3.name }}</div>
              <div class="fileImageEnd">{{ file3.name }}</div>
            </div>
          </div>
          <div v-else>{{ $t('lbl_NoFileChosen_0') }}</div>
        </div>
        <div class="button-image">
          <div class="sys-flex">
            <div class="btn btn-clear" @click="clear(3)">
              {{ $t('btn_btnClear_0') }}
            </div>
            <div class="btn btn-upload" @click="save(3)">
              {{ $t('btn_btnUpload_0') }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="upload-image-container sys-flex">
      <div>
        <div class="show-image">
          <div class="show-img sys-flex">
            <div
              class="container-img d-flex justify-content-center align-items-center"
            >
              <div
                v-if="file4 && file4.imageUrl && checkFileExist(file4.imageUrl)"
                class="img"
                :class="{ 'img-none': file4.imageUrl == null }"
              >
                <img id="imge3" :src="file4.imageUrl" class="image__preview" />
              </div>
            </div>
          </div>
        </div>

        <input
          id="inputFile4"
          ref="inputFile4"
          class="display-none"
          type="file"
          accept="image/*"
          @change="onchangeFile"
        />

        <div class="sys-align-center">
          <div class="btn btn-choose-file" @click="chooseFile(4)">
            {{ $t('Choose File') }}
          </div>
          <div v-if="file4 && file4.name">
            <div v-if="file4.name.length <= 20">
              <div>{{ file4.name }}</div>
            </div>
            <div v-else class="imageFile">
              <div class="image">{{ file4.name }}</div>
              <div class="fileImageEnd">{{ file4.name }}</div>
            </div>
          </div>
          <div v-else>{{ $t('lbl_NoFileChosen_0') }}</div>
        </div>
        <div class="button-image">
          <div class="sys-flex">
            <div class="btn btn-clear" @click="clear(4)">
              {{ $t('btn_btnClear_0') }}
            </div>
            <div class="btn btn-upload" @click="save(4)">
              {{ $t('btn_btnUpload_0') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
export default {
  layout: 'default',
  props: {
    paramsDetailItemMaster: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      file1: {
        file: null,
        image: null,
        imageUrl: this.paramsDetailItemMaster?.images?.itemPic || null,
        name: null,
      },
      file2: {
        file: null,
        image: null,
        imageUrl: this.paramsDetailItemMaster?.images?.itemPic1 || null,
        name: null,
      },
      file3: {
        file: null,
        image: null,
        imageUrl: this.paramsDetailItemMaster?.images?.itemPic2 || null,
        name: null,
      },
      file4: {
        file: null,
        image: null,
        imageUrl: this.paramsDetailItemMaster?.images?.itemPic3 || null,
        name: null,
      },
      currentFile: 0,
      image: null,
    }
  },
  watch: {
    paramsDetailItemMaster: {
      handler(value) {
        this.file1.imageUrl = value.images.itemPic
        this.file2.imageUrl = value.images.itemPic1
        this.file3.imageUrl = value.images.itemPic2
        this.file4.imageUrl = value.images.itemPic3
      },
      deep: true,
    },
  },
  methods: {
    chooseFile(val) {
      this.currentFile = val
      document.getElementById(`inputFile${val}`).click()
    },

    onchangeFile(e) {
      const file = e.target.files[0]
      this.image = file
      this[`file${this.currentFile}`].file = e.target.files[0]
      this[`file${this.currentFile}`].imageUrl = URL.createObjectURL(file)
      this[`file${this.currentFile}`].name = file.name
    },

    clear(index) {
      this[`file${index}`].imageUrl = ''
      this[`file${index}`].name = ''
      this.$refs[`inputFile${index}`].value = null
      api('clearItemMasterImage', {
        itemCode: this.paramsDetailItemMaster?.itemCode,
        picNum: index,
      })
    },

    validateFileUpload(fileSize, fileType) {
      const listTypeImage = ['png', 'jpg', 'jpeg']
      if (fileSize >= 2097152) {
        return this.$t('msg_ChoosePic_0')
      }
      if (!listTypeImage.includes(fileType)) {
        return this.$t('lbl_CheckFormat_0')
      }
      return ''
    },
    checkFileExist(file) {
      if (
        file &&
        file.includes('https://mdemo.cladia.pro/api/download/attachment-its')
      ) {
        return ''
      }
      return file
    },
    async save(index) {
      if (
        this.paramsDetailItemMaster &&
        this.paramsDetailItemMaster?.itemCode
      ) {
        let checkChangeFile = false
        const formData = new FormData()
        let fileSize = ''
        let fileTypeImage = ''
        if (this[`file${index}`].file) {
          fileSize = this[`file${index}`].file.size
          const fileArray = this[`file${index}`].file.name.split('.')
          fileTypeImage = fileArray[fileArray.length - 1].toLowerCase()
          if (!this.validateFileUpload(fileSize, fileTypeImage)) {
            checkChangeFile = true
            formData.append(
              'file',
              this[`file${index}`].file,
              this[`file${index}`].name
            )
            formData.append('picNum', index)
            formData.append('itemCode', this.paramsDetailItemMaster?.itemCode)
          } else {
            const validateMessage = this.validateFileUpload(
              fileSize,
              fileTypeImage
            )
            window.alert(validateMessage)
          }
        }
        if (checkChangeFile) {
          const res = await api('uploadFilePicture', formData)
          if (res && res.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_UpSuccess_0'))
          }
        }
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.imageFile {
  display: flex;
}
.image {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 80px;
}
.fileImageEnd {
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  width: 45px;
  justify-content: flex-end;
  margin-left: -7px;
}
.sys-flex {
  display: flex;
  align-items: center;
  justify-content: center;
}
.picture {
  width: 100%;
  padding: 30px 0px;
  font-size: 12px;
  .container-img {
    width: 202px;
    height: 202px;
    border: 1px solid;
  }
  .upload-image-container {
    width: 25%;
  }
  .button-image {
    .btn {
      background: #f0f0f0;
      border: 1px solid gray;
      font-size: 12px;
    }
    .btn-clear {
      margin-right: 10px;
    }
  }
  .upload-image {
    margin: 10px 0px 20px 0px;
  }
}
.image__preview {
  width: 202px;
  height: 200px;
  object-fit: contain;
}
.btn-choose-file {
  margin: 10px 5px 10px 0px;
}
</style>
