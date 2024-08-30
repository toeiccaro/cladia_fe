<template>
  <div :key="refreshKey" class="add-form-enterprise">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-1">
          <td class="label">
            <span id="startDate">{{ $t('lbl_DWDStartDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              :value="form.startDate"
              typeable
              format="yyyy-MM-dd"
              :disabled="isDisabled"
              input-class="input__orderDate"
              :highlighted="highlighted"
              @input="changeStartDate"
            ></datepicker>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="endDate">{{ $t('lbl_DWDEndDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              :value="form.endDate"
              typeable
              format="yyyy-MM-dd"
              :disabled="isDisabled"
              input-class="input__orderDate"
              :highlighted="highlighted"
              @input="changeEndDate"
            ></datepicker>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="departmentID">
              {{ $t('lbl_DWDBankName_0') }}
            </span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.bankName"
              :options="currentAsset"
              class="select"
              :disabled="isDisabled"
            ></b-form-select>
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="departmentID">
              {{ $t('cmb_Currency_0') }}
            </span>
          </td>
          
          <td class="input">
            <b-form-select
              v-model="form.currencyId"
              :options="currencyOption"
              class="select"
              :disabled="isDisabled"
            ></b-form-select>
          </td>
          <td class="info">*</td>
          
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete.vue'

export default {
  name: 'OrderForm',
  components: { BaseTypeaheadAutocomplete },
  mixins: [dateTime],
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      refreshKey: Math.random() * 100000,
      form: this.data,
      listEmployee: {},
      listAllCustomerName: [],
      highlighted: {
        dates: [new Date()],
      },
      lang: this.$i18n.locale,
    }
  },
  async fetch() {
    try {
      await Promise.all([
        this.getDepartmentOptionsFromAPI(this.lang),
        this.getListCurrentAssets(this.lang),
        this.getCurrencyOptions(this.lang),
      ])
    } catch (err) {
      console.error(err)
    }
  },
  computed: {
    ...mapGetters('base', {
      departmentOptions: 'getDepartmentOptions',
      currencyOption: 'getCurrencyOptions',
      currentAsset: 'getListCurrentAssets',
    }),
  },
  watch: {
    data: {
      handler(value) {
        this.form = value
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    ...mapActions('base', [
      'getDepartmentOptionsFromAPI',
      'getCurrencyOptions',
      'getListCurrentAssets',
    ]),

    changeStartDate(value) {
      this.form.startDate = this.convertDate(value)
    },
    changeEndDate(value) {
      this.form.endDate = this.convertDate(value)
    },

    emitPayload() {
      const payload = {
        startDate: this.form.startDate,
        endDate: this.form.endDate,
        bankId: this.form.bankName,
        currencyId: this.form.currencyId,
      }
      this.$emit('updatePayload', payload)
    },
    refresh() {
      ++this.refreshKey
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vue-auto-complete.scss';
@import '@/assets/vuejs-datepicker.scss';
</style>
<style lang="scss" scoped>
select {
  font-size: 12px;
}


.add-form-enterprise {
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
        background-color: #fff;
        border-radius: 2px;
      }

      textarea {
        border: 1px solid #aaa;
        border-radius: 2px;
      }

      .number {
        text-align: right;
      }
    }

    td.info {
      padding: 3px;
    }
  }
}


input[disabled] {
  opacity: 0.5;
}

.autocomplete {
  position: absolute;
  top: 0px;
  padding: 2px;
}

input[disabled] {
  opacity: 0.5;
}
</style>
