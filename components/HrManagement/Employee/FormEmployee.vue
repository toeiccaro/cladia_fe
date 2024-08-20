<template>
  <div class="form-employee">
    <table cellspacing="0" cellpadding="0" class="edit">
      <tbody>
        <tr>
          <td class="label">
            <span id="EmployeeCode">{{ $t('lbl_EmployeeCode_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.employeeCode"
              v-auto-focus
              name="txtEmployeeCode"
              type="text"
              required
            />
          </td>
          <td class="info">*</td>
          <td class="label">&nbsp;</td>
          <td rowspan="6" colspan="1" class="input cell__image">
            <div class="d-flex justify-start">
              <img
                id="imgEpic"
                :src="form.epic ? form.epic : ''"
                align="right"
                style="height: 160px"
              />
            </div>
          </td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_EmployeeName_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.employeeName"
              name="txtEmployeeName"
              type="text"
              required
            />
          </td>
          <td class="info">*</td>
          <td class="label">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_JapaneseName_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.japaneseName"
              name="txtEmployeeName"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td class="label">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_EmployeeNO_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.employeeNO" name="txtEmployeeNO" type="text" />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="Sex">{{ $t('lbl_Sex_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.sexID"
              :options="listSex"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_Age_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.age"
              type="text"
              class="number"
              readonly
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_NationID_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.nationID"
              :options="nationsIdOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_PartyAffiliation_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.partyAffiliation"
              name="txtPartyAffiliation"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td class="label"></td>
          <td class="input">
            <input
              id="EPicFU"
              ref="fileUpload"
              type="file"
              name="EPicFU"
              style="height: 30px"
              @change="changeFile"
            />
          </td>
          <td class="info">
            <div class="button-upload">
              <img
                class="mr-20"
                src="@/static/images/up.png"
                @click="uploadFile"
              />
              <img src="@/static/images/cancel.png" @click="clearImage" />
            </div>
          </td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_BornPlace_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.bornPlace"
              :options="bornPlaceOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="Email">{{ $t('lbl_Email_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.email" name="txtEmail" type="text" />
          </td>
          <td class="info">
            <a href="mailto:">
              <img id="Image1" src="/images/mail_replay1.png" />
            </a>
          </td>
        </tr>
        <tr>
          <td class="label">
            <span id="DepartID">{{
              lang === 'japanese'
                ? $t('lbl_DepartType_0')
                : $t('lbl_Department_0')
            }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.departID"
              :options="departmentOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_Tel_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.tel" name="txtTel" type="text" />
          </td>
        </tr>

        <tr>
          <td class="label">
            <span>{{ $t('lbl_DegreeID_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.degreeID"
              :options="degreeIDOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_State_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.state"
              :options="stateOptions"
              class="select"
            ></b-form-select>
          </td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_Post_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.post"
              :options="positionOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="Born">{{ $t('lbl_Born_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              ref="bornDatepickerInput"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              :v-model="form.born === null ? '' : form.born"
              typeable
              format="yyyy-MM-dd"
              input-class="input__orderDate"
              :highlighted="highlighted"
              @input="changeBornDate"
              @change="changeBornBlur"
            ></datepicker>
          </td>
          <td class="info">*</td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_IDCard_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.IDCard" name="txtIDCard" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="Hostel">{{ $t('lbl_Hostel_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.hostel"
              :options="hostelOptions"
              class="select"
            ></b-form-select>
          </td>
        </tr>
        <tr>
          <td class="label">
            <span id="PayType">{{ $t('lbl_PayType_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.payType"
              :options="payTypeOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="EnterDate">{{ $t('lbl_EnterDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              ref="enterDatepickerInput"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              :v-model="form.enterDate === null ? '' : form.enterDate"
              typeable
              format="yyyy-MM-dd"
              input-class="input__orderDate"
              :highlighted="highlighted"
              @input="changeEnterDate"
              @change="changeEnterDateBlur"
            ></datepicker>
          </td>
        </tr>
        <tr>
          <td class="label">
            <span id="Marital">{{ $t('lbl_Marital_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.marital"
              type="checkbox"
              name="cbMarital"
              class="checkbox"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="LeaveReason">{{ $t('lbl_LeaveReason_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.leaveReason"
              :options="leaveReasonOptions"
              class="select"
            ></b-form-select>
          </td>
        </tr>
        <tr>
          <td class="label">
            <span id="EntryDate">{{ $t('lbl_EntryDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              ref="entryDatepickerInput"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              :v-model="form.entryDate === null ? '' : form.entryDate"
              typeable
              format="yyyy-MM-dd"
              input-class="input__orderDate"
              :highlighted="highlighted"
              @input="changeEntryDate"
              @change="changeEntryDateBlur"
            ></datepicker>
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="LeaveDate">{{ $t('lbl_LeaveDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              ref="leaveDatepickerInput"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              :v-model="form.leaveDate === null ? '' : form.leaveDate"
              typeable
              format="yyyy-MM-dd"
              input-class="input__orderDate"
              :highlighted="highlighted"
              @input="changeLeaveDate"
              @change="changeLeaveDateBlur"
            ></datepicker>
          </td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_Address_0') }}</span>
          </td>
          <td colspan="4" class="input">
            <input v-model="form.address" name="txtAddress" type="text" />
          </td>
        </tr>
        <tr>
          <td class="label">
            <span id="Attachments">{{ $t('lbl_Attachments_0') }}</span>
          </td>
          <td colspan="4" class="input">
            <input
              v-model="form.attachmentList"
              name="txtAttachments"
              type="text"
              config="readonly"
              readonly="readonly"
              style="background-color: rgb(235, 239, 246)"
            />
          </td>
        </tr>
        <tr>
          <td class="label">
            <span id="Memo">{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td colspan="4" class="input">
            <textarea
              v-model="form.memo"
              name="txtMemo"
              rows="2"
              cols="20"
              style="height: 36px; width: 100%"
            ></textarea>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import dateTime from '@/mixins/dateTime'

export default {
  mixins: [dateTime],
  layout: 'default',
  props: {
    dataFormEmployee: {
      type: Object,
      required: true,
    },

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
      highlighted: {
        dates: [new Date()],
      },
      form: {},

      listSex: [
        {
          value: '0',
          text: '',
        },
        {
          value: '1',
          text: this.$t('cmb_Sex_1'),
        },
        {
          value: '2',
          text: this.$t('cmb_Sex_2'),
        },
      ],
      lang: this.$i18n.locale,
    }
  },
  computed: {
    ...mapGetters('base', {
      departmentOptions: 'getDepartmentOptions',
      nationsIdOptions: 'getNationIDOptions',
      bornPlaceOptions: 'getBornPlaceOptions',
      degreeIDOptions: 'getDegreeIDOptions',
      positionOptions: 'getPositionOptions',
      payTypeOptions: 'getPayTypeOptions',
      stateOptions: 'getStateOptions',
      hostelOptions: 'getHostelOptions',
      leaveReasonOptions: 'getLeaveReasonOptions',
    }),
  },
  watch: {
    dataFormEmployee: {
      handler(val) {
        this.form = val
      },
    },

    'form.born': {
      handler(value) {
        const validDate = new Date(value)
        if (!value || isNaN(validDate)) {
          this.form.age = 0
          return
        }

        const monthDiff = Date.now() - validDate.getTime()

        const ageDate = new Date(monthDiff)

        const year = ageDate.getUTCFullYear()

        const age = year - 1970 > 0 ? year - 1970 : 0

        this.form.age = age
      },
    },
  },
  async created() {
    this.form = this.dataFormEmployee
    await Promise.all([
      await this.getDepartmentOptionsFromAPI(this.lang),
      await this.getNationOptionsFromAPI(this.lang),
      await this.getBornPlaceOptionsFromAPI(this.lang),
      await this.getDegreeOptionsFromAPI(this.lang),
      await this.getPayTypeOptionsFromAPI(this.lang),
      await this.getStateOptionsFromAPI(this.lang),
      await this.getHostelOptionsFromAPI(this.lang),
      await this.getLeaveReasonOptionsFromAPI(this.lang),
      await this.getPositionOptionsFromAPI(this.lang),
    ])
  },
  methods: {
    ...mapActions('base', [
      'getDepartmentOptionsFromAPI',
      'getNationOptionsFromAPI',
      'getBornPlaceOptionsFromAPI',
      'getDegreeOptionsFromAPI',
      'getPositionOptionsFromAPI',
      'getPayTypeOptionsFromAPI',
      'getStateOptionsFromAPI',
      'getHostelOptionsFromAPI',
      'getLeaveReasonOptionsFromAPI',
    ]),
    changeFile(e) {
      this.file = e.target.files[0]
    },
    uploadFile() {
      const hasNoFileChoosen = !this.file
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
      document.getElementById('imgEpic').src = URL.createObjectURL(this.file)
      this.$emit('file-upload', this.file)
    },
    clearImage() {
      this.$refs.fileUpload.value = null
      this.file = null
      this.$emit('file-upload', this.file)
      document.getElementById('imgEpic').src = ''
    },

    //Update date picker
    updateDate(field, value) {
      const convertedDate = this.convertDate(value)
      this.$set(this.form, field, convertedDate)
    },

    handleDateBlur(refName, field) {
      const inputElement = this.$refs[refName].$el.querySelector('input')
      if (inputElement) {
        this.updateDate(field, inputElement.value)
        if (this.form[field] === null) {
          inputElement.value = ''
        }
      }
    },

    // Wrapper methods to call the generalized methods
    changeBornDate(value) {
      this.updateDate('born', value)
    },
    changeEnterDate(value) {
      this.updateDate('enterDate', value)
    },
    changeEntryDate(value) {
      this.updateDate('entryDate', value)
    },
    changeLeaveDate(value) {
      this.updateDate('leaveDate', value)
    },

    changeBornBlur() {
      this.handleDateBlur('bornDatepickerInput', 'born')
    },
    changeEnterDateBlur() {
      this.handleDateBlur('enterDatepickerInput', 'enterDate')
    },
    changeEntryDateBlur() {
      this.handleDateBlur('entryDatepickerInput', 'entryDate')
    },
    changeLeaveDateBlur() {
      this.handleDateBlur('leaveDatepickerInput', 'leaveDate')
    },

    setupFocusOutListener() {
      this.$nextTick(() => {
        const bornInputElement =
          this.$refs.bornDatepickerInput.$el.querySelector('input')

        const enterInputElement =
          this.$refs.enterDatepickerInput.$el.querySelector('input')

        const entryInputElement =
          this.$refs.entryDatepickerInput.$el.querySelector('input')

        const leaveInputElement =
          this.$refs.leaveDatepickerInput.$el.querySelector('input')

        if (bornInputElement) {
          bornInputElement.addEventListener('focusout', this.changeBornBlur)
        }

        if (enterInputElement) {
          enterInputElement.addEventListener(
            'focusout',
            this.changeEnterDateBlur
          )
        }

        if (entryInputElement) {
          entryInputElement.addEventListener(
            'focusout',
            this.changeEntryDateBlur
          )
        }

        if (leaveInputElement) {
          leaveInputElement.addEventListener(
            'focusout',
            this.changeLeaveDateBlur
          )
        }
      })
    },
  },
  mounted() {
    this.setupFocusOutListener()
  },
  beforeDestroy() {
    const bornInputElement =
      this.$refs.datepickerInput?.$el?.querySelector('input')

    const enterInputElement =
      this.$refs.etransDatepickerInput?.$el?.querySelector('input')

    const entryInputElement =
      this.$refs.entryDatepickerInput?.$el?.querySelector('input')

    const leaveInputElement =
      this.$refs.leaveDatepickerInput?.$el?.querySelector('input')

    if (bornInputElement) {
      bornInputElement.removeEventListener('focusout', this.changeBornBlur)
    }

    if (enterInputElement) {
      enterInputElement.removeEventListener(
        'focusout',
        this.changeEnterDateBlur
      )
    }
    if (entryInputElement) {
      entryInputElement.removeEventListener(
        'focusout',
        this.changeEntryDateBlur
      )
    }
    if (leaveInputElement) {
      leaveInputElement.removeEventListener(
        'focusout',
        this.changeLeaveDateBlur
      )
    }
  },
}
</script>
<style lang="scss">
@import '@/assets/vuejs-datepicker.scss';
</style>
<style lang="scss" scoped>
.form-employee {
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
      padding: 2px;
      border: 1px solid #aaa;
      background-color: #fff;
      border-radius: 2px;
      height: 20px;
    }
    td.label {
      padding: 2px;
    }
    td.input {
      padding: 2px;
      .select {
        height: 20px;
        font-size: 12px;
        border: 1px solid #aaa;
        background-color: #fff !important;
        border-radius: 2px;
      }
      textarea {
        border: 1px solid #aaa;
        border-radius: 2px;
      }
      .number {
        text-align: right;
      }
      .input-date {
        height: 20px;
        font-size: 12px;
        border: 1px solid #aaa;
        border-radius: 2px;
      }
      .checkbox {
        height: 14px;
        display: inline-block;
        width: 5%;
      }
    }
    td.info {
      padding: 3px;
    }
    td.button {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2px;
      border: 1px solid #aaa;
      border-radius: 2px;
      background-color: #fff !important;
    }
    td.mr-8 {
      margin-top: 8px;
    }

    .cell__image {
      width: 20%;
    }
  }
}
.button-upload {
  display: flex;
  align-items: center;
  height: 30px;
  margin-right: 20px;
  img {
    cursor: pointer;
  }
  .mr-20 {
    margin-right: 20px;
  }
}
</style>
<style lang="scss">
.input-date > .btn > .bi-calendar {
  display: none;
}
</style>
