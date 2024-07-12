<template>
  <div v-if="!loading" class="detail-company">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr>
          <td class="label">{{ $t('lbl_CompanyCode_0') }}</td>
          <td rowspan="1" colspan="4" class="input">
            <input
              id="txtCompanyCode"
              v-model="dataDetail.companyCode"
              name="txtCompanyCode"
              type="text"
            />
          </td>
          <td class="info">*</td>
        </tr>
        <tr>
          <td class="label">
            <span id="CompanyName">{{ $t('lbl_CompanyName_0') }}</span>
          </td>
          <td rowspan="1" colspan="4" class="input">
            <input
              id="txtCompanyName"
              v-model="dataDetail.companyName"
              name="txtCompanyName"
              type="text"
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="Logo">{{ $t('lbl_Logo_0') }}</span>
          </td>
          <td rowspan="6" colspan="1" class="input">
            <img id="imgLogo" :src="dataDetail.logo" style="height: 160px" />
          </td>
        </tr>
        <tr>
          <td class="label">
            <span id="EnglishName">{{ $t('lbl_EnglishName_0') }}</span>
          </td>
          <td rowspan="1" colspan="4" class="input">
            <input
              id="txtEnglishName"
              v-model="dataDetail.englishName"
              name="txtEnglishName"
              type="text"
            />
          </td>
        </tr>
        <tr>
          <td class="label">
            <span id="ShortName">{{ $t('lbl_ShortName_0') }}</span>
          </td>
          <td class="input">
            <input
              id="txtShortName"
              v-model="dataDetail.shortName"
              name="txtShortName"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="LegalName">{{ $t('lbl_LegalName_0') }}</span>
          </td>
          <td class="input">
            <input
              id="txtLegalName"
              v-model="dataDetail.legal"
              name="txtLegalName"
              type="text"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="Address">{{ $t('lbl_Address_0') }}</span>
          </td>
          <td rowspan="1" colspan="4" class="input">
            <input
              id="txtAddress1"
              v-model="dataDetail.address1"
              name="txtAddress1"
              type="text"
            />
          </td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr>
          <td class="info"></td>
          <td rowspan="1" colspan="4" class="input">
            <input
              id="txtAddress2"
              v-model="dataDetail.address2"
              name="txtAddress2"
              type="text"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="info"></td>
          <td rowspan="1" colspan="4" class="input">
            <input
              id="txtAddress3"
              v-model="dataDetail.address3"
              name="txtAddress3"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td>
            <input
              id="btnClear"
              type="submit"
              name="btnClear"
              :value="$t('btn_btnClear_0')"
              @click="clearImage"
            />
          </td>
        </tr>
        <tr>
          <td class="label">
            <span id="AddressEN">{{ $t('lbl_AddressEN_0') }}</span>
          </td>
          <td rowspan="1" colspan="4" class="input">
            <input
              id="txtAddressEN1"
              v-model="dataDetail.addressEN1"
              name="txtAddressEN1"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td>
            <input
              id="btnUpload"
              type="submit"
              name="btnUpload"
              :value="$t('btn_btnUpload_0')"
              @click="upload"
            />
          </td>
          <td>
            <input
              id="fuPic"
              ref="fileUpload"
              type="file"
              name="fuPic"
              @change="changeFile"
            />
          </td>
        </tr>
        <tr>
          <td class="info"></td>
          <td rowspan="1" colspan="4" class="input">
            <input
              id="txtAddressEN2"
              v-model="dataDetail.addressEN2"
              name="txtAddressEN2"
              type="text"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="info">&nbsp;</td>
          <td rowspan="1" colspan="4" class="input">
            <input
              id="txtAddressEN3"
              v-model="dataDetail.addressEN3"
              name="txtAddressEN3"
              type="text"
            />
          </td>
          <td class="info">&nbsp;</td>
        </tr>

        <tr>
          <td class="label">
            <span id="PostCode">{{ $t('lbl_PostCode_0') }}</span>
          </td>
          <td class="input">
            <input
              id="txtPostCode"
              v-model="dataDetail.postCode"
              name="txtPostCode"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="Currency">{{ $t('lbl_Currency_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="dataDetail.currencyID"
              :options="listCurrency"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">*</td>
          <td class="info"></td>
          <td class="input">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span id="Tel">{{ $t('lbl_Tel_0') }}</span>
          </td>
          <td class="input">
            <input
              id="txtTel"
              v-model="dataDetail.tel"
              name="txtTel"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="Fax">{{ $t('lbl_Fax_0') }}</span>
          </td>
          <td class="input">
            <input
              id="txtFax"
              v-model="dataDetail.fax"
              name="txtFax"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="WebPage">{{ $t('lbl_WebPage_0') }}</span>
          </td>
          <td class="input">
            <input
              id="txtWebPage"
              v-model="dataDetail.webPage"
              name="txtWebPage"
              type="text"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="Bank">{{ $t('lbl_Bank_0') }}</span>
          </td>
          <td class="input">
            <input
              id="txtBank"
              v-model="dataDetail.bank"
              name="txtBank"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="AccountNo">{{ $t('lbl_AccountNo_0') }}</span>
          </td>
          <td class="input">
            <input
              id="txtAccountNo"
              v-model="dataDetail.accountCode"
              name="txtAccountNo"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="Email">{{ $t('lbl_Email_0') }}</span>
          </td>
          <td class="input">
            <input
              id="txtEmail"
              v-model="dataDetail.email"
              name="txtEmail"
              type="text"
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr>
          <td class="label">
            <span id="Memo">{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td colspan="7" class="input">
            <textarea
              id="txtMemo"
              v-model="dataDetail.memo"
              name="txtMemo"
              rows="2"
              cols="20"
              style="height: 120px; width: 100%"
            ></textarea>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div
    v-else
    class="spinner content d-flex justify-content-center align-items-center"
  >
    <b-spinner b-spinner style="width: 3rem; height: 3rem" label=""></b-spinner>
  </div>
</template>
<script>
import { isNil } from 'lodash'
import { mapActions, mapGetters } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
export default {
  props: {
    validFileTypes: {
      type: Array,
      default: () => [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'image/webp',
        'image/apng',
        'image/gif',
        'image/svg+xml',
        'image/avif',
      ],
    },
  },
  data() {
    return {
      file: '',
      dataDetail: {
        companyCode: '',
        companyName: '',
        englishName: '',
        shortName: '',
        legal: '',
        address1: '',
        address2: '',
        address3: '',
        englishAddress1: '',
        englishAddress2: '',
        englishAddress3: '',
        postCode: '',
        currencyID: '',
        logo: '',
        telephone: '',
        fax: '',
        webPage: '',
        bank: '',
        accountCode: '',
        email: '',
        memo: '',
      },
      loading: false,
      listErrorMessage: [],
      lang: this.$i18n.locale,
    }
  },
  computed: {
    ...mapGetters('base', {
      listCurrency: 'getCurrencyOptions',
    }),
  },
  async created() {
    await Promise.all([
      await this.getDataCompany(),
      await this.getCurrencyOptions(this.lang),
    ])
  },

  methods: {
    ...mapActions('base', ['getCurrencyOptions']),
    async getDataCompany() {
      this.loading = true
      const res = await api('getCompany')
      this.loading = false
      if (res && res.status === SERVER_RESPONSE_CODE.OK) {
        this.dataDetail = res.data?.company
      }
    },
    async saveData() {
      try {
        const formData = new FormData()
        const params = JSON.parse(JSON.stringify(this.dataDetail))
        for (const property in params) {
          if (property === 'file') {
            if (this.file) {
              formData.append('file', this.file)
            }
          } else {
            formData.append(property, params[property])
          }
        }

        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }

        this.listErrorMessage = []
        const requiredFields = {
          companyCode: 'CompanyCode',
          companyName: 'CompanyName',
          currencyID: 'Currency',
        }

        const convertToNumberFields = ['currencyID']
        convertToNumberFields.forEach((field) =>
          Object.assign(params, { [field]: Number(params[field]) })
        )

        for (const prop in requiredFields) {
          if (!params[prop]) {
            this.listErrorMessage.push({
              fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
              text: this.$t('msg_NoInput_0'),
            })
          }
        }

        this.$emit('validation-errors', this.listErrorMessage)

        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }

        this.loading = true
        const response = await api('editCompany', formData)
        if (response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsSaved_0'))
          this.employeeID = response?.data?.employeeID
          await this.getDataCompany()

          this.$bus.$emit('refresh-top-bar')
        }

        window.alert(`${response?.message}`)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    changeFile(e) {
      this.file = e.target.files[0]
    },

    async clearImage() {
      document.getElementById('imgLogo').src = ''
      this.$refs.fileUpload.value = null
      await api('clearCompanyImage')
      this.file = ''
    },

    upload() {
      const hasNoFileChoosen = isNil(this.file)
      if (hasNoFileChoosen) {
        return
      }
      const fileType = this.file?.type
      const fileSize = this.file?.size

      const isValidType = this.validFileTypes.includes(fileType)
      const isValidSize = fileSize <= 2e6 // <= 2 MB

      if (!isValidType || !isValidSize) {
        return window.alert(this.$t('msg_ChoosePic_0'))
      }

      const imageElement = document.getElementById('imgLogo')
      imageElement.src = URL.createObjectURL(this.file)

      this.$refs.fileUpload.value = null
      return window.alert(this.$t('msg_UpSuccess_0'))
    },
  },
}
</script>

<style lang="scss" scoped>
.detail-company {
  font-size: 12px;
  margin: 0px 1px;
  padding: 4px 32px 4px 4px;
  background: #ebeff6;
  color: #222;
  table.edit {
    width: 100%;
    background-color: #ebeff6;
    td input {
      width: 100%;
      padding: 2px 0;
      border: 1px solid #aaa;
      background-color: #fff;
    }
    td.label {
      padding: 2px;
    }
    td.input {
      padding: 2px;
      .select {
        font-size: 12px;
        border: 1px solid #aaa;
        background-color: #fff !important;
      }
      textarea {
        border: 1px solid #aaa;
      }
    }
    td.info {
      padding: 3px;
    }
  }
}
</style>
