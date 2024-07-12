<template>
  <div class="form-email-set">
    <table cellspacing="0" cellpadding="0" class="edit">
      <tbody>
        <tr>
          <td class="label">
            <!-- FIXME: use i18n label -->
            <span>模块</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.moduleID"
              :options="listModuleOptions"
              field-text="text"
              field-value="value"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">*</td>
          <td class="label">&nbsp;</td>
          <td rowspan="6" colspan="1" class="row-span"></td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_EmployeeName_0') }}</span>
          </td>
          <td class="input">
            <BaseTypeaheadAutocomplete
              :key="refreshEmployeeKey"
              :initial-value="form.employeeID"
              :initial-text="form.employeeName"
              :items="listEmployeeOptions"
              @change="(event) => changeItemCode(event)"
            >
            </BaseTypeaheadAutocomplete>
          </td>
          <td class="info">*</td>
          <td class="label">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_Email_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.email" readonly />
          </td>
          <td class="info"></td>
          <td class="label">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_EditUser_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.editUser" readonly />
          </td>
          <td class="info"></td>
          <td class="label">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_EditDate_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.editDate" readonly />
          </td>
          <td class="info"></td>
          <td class="label">&nbsp;</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import api from '@/api/api'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete.vue'
import dateTimeMixins from '@/mixins/dateTime'
import { SERVER_RESPONSE_CODE } from '~/constants'
export default {
  layout: 'default',
  mixins: [dateTimeMixins],
  components: { BaseTypeaheadAutocomplete },
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: {},
      lang: this.$i18n.locale,
      listModules: [],
      listEmployees: [],
      refreshEmployeeKey: Math.random() * 10000,
    }
  },
  computed: {
    listEmployeeOptions() {
      const result = []

      for (const key in this.listEmployees) {
        const employeeValue = this.listEmployees[key] || ''
        const lastIndexOfOpenParenthese = employeeValue.lastIndexOf('(') || 0

        const appendText = employeeValue.substring(lastIndexOfOpenParenthese)
        const responsibleManValue = employeeValue.substring(
          0,
          lastIndexOfOpenParenthese
        )

        result.push({
          text: responsibleManValue,
          value: Number(key),
          appendText,
        })
      }

      return result
    },

    listModuleOptions() {
      const options = this.listModules?.map((item) => ({
        value: item,
        text: this.$t(`lbl_${item}_0`),
      }))

      options.unshift({
        text: '',
        value: '',
      })

      return options
    },
  },
  watch: {
    data: {
      deep: true,
      immediate: true,
      handler(value) {
        this.form = Object.assign(value, {
          editDate: this.convertDate(value.editDate),
        })
        ++this.refreshEmployeeKey
      },
    },
  },
  async fetch() {
    try {
      const [moduleRes, employeeRes] = await Promise.all([
        api('getListModuleIds'),
        api('getEmployeeList'),
      ])

      const validGetModuleResponse =
        moduleRes && moduleRes.status === SERVER_RESPONSE_CODE.OK
      if (validGetModuleResponse) {
        this.listModules = moduleRes.data || []
      }

      const validGetItemCodeResponse =
        employeeRes && employeeRes.status === SERVER_RESPONSE_CODE.OK
      if (validGetItemCodeResponse) {
        this.listEmployees = employeeRes.data || []
      }
    } catch (err) {
      console.error(err)
    }
  },
  methods: {
    changeItemCode(select) {
      this.form.employeeID = select?.value
      this.form.employeeName = select?.text
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vuejs-datepicker.scss';
</style>
<style lang="scss" scoped>
.row-span {
  width: 50%;
}
.form-email-set {
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
    }
    td.info {
      padding: 3px;
    }
  }
}

@media only screen and (max-width: 1550px) {
  .row-span {
    width: 40%;
  }
}
@media only screen and (max-width: 1395px) {
  .row-span {
    width: 30%;
  }
}
@media only screen and (max-width: 1275px) {
  .row-span {
    width: 20%;
  }
}
@media only screen and (max-width: 1115px) {
  .row-span {
    width: 10%;
  }
}
@media only screen and (max-width: 895px) {
  .row-span {
    width: 0%;
  }
}
</style>
