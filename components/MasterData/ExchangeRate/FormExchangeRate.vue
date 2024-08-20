<template>
  <div class="wrap-table">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_CurrencyMain_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.currencyMainId"
              :options="currencyOptions"
              class="select"
            />
          </td>
          <td class="info">*</td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_CurrencyChange_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.currencyChangeId"
              :options="currencyOptions"
              class="select"
            />
          </td>
          <td class="info">*</td>
        </tr>
        <tr>
          <td class="label">
            <span id="Rate">{{ $t('lbl_Rate_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.rate"
              name="txtRate"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info">*</td>
        </tr>
        <tr>
          <td class="label">
            <span id="EffectiveDate">{{ $t('lbl_EffectiveDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              ref="datepickerInput"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              :v-model="form.effectiveDate === null ? '' : form.effectiveDate"
              typeable
              format="yyyy-MM-dd"
              input-class="input__orderDate"
              :highlighted="highlighted"
              @input="changeEffectiveDate"
              @change="changeEffectiveDateBlur"
            ></datepicker>
          </td>
          <td class="info">*</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import dateTime from '@/mixins/dateTime'
import { formatNumberWithCommas } from '~/utils/utils'

export default {
  mixins: [dateTime],
  props: {
    dataForm: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  data() {
    return {
      form: this.dataForm,
      lang: this.$i18n.locale,
      highlighted: {
        dates: [new Date()],
      },
    }
  },

  computed: {
    ...mapGetters('base', {
      currencyOptions: 'getCurrencyOptions',
    }),
  },
  watch: {
    dataForm: {
      handler(val) {
        this.form = val
        const formatNumberFields = ['rate']
        for (const key of formatNumberFields) {
          this.form[key] = formatNumberWithCommas(this.form[key]) || 0
        }
      },
      deep: true,
    },
  },
  created() {
    this.getCurrencyOptions(this.lang)
  },
  methods: {
    ...mapActions({
      getCurrencyOptions: 'base/getCurrencyOptions',
    }),

    changeEffectiveDate(value) {
      const convertedDate = this.convertDate(value)
      this.form.effectiveDate = convertedDate
    },
    changeEffectiveDateBlur() {
      const inputElement = this.$refs.datepickerInput.$el.querySelector('input')
      if (inputElement) {
        this.changeEffectiveDate(inputElement.value)

        if (this.form.effectiveDate === null) {
          inputElement.value = ''
        }
      }
    },
    setupFocusOutListener() {
      this.$nextTick(() => {
        const inputElement =
          this.$refs.datepickerInput.$el.querySelector('input')
        if (inputElement) {
          inputElement.addEventListener(
            'focusout',
            this.changeEffectiveDateBlur
          )
        }
      })
    },
  },
  mounted() {
    this.setupFocusOutListener()
  },
  beforeDestroy() {
    const inputElement = this.$refs.datepickerInput?.$el?.querySelector('input')
    if (inputElement) {
      inputElement.removeEventListener('focusout', this.changeEffectiveDateBlur)
    }
  },
}
</script>
<style lang="scss" scoped>
.wrap-table {
  background-color: #ebeff6;
}
table.edit {
  td input {
    width: 100%;
    padding: 2px;
    border: 1px solid #aaa;
    background-color: #fff;
    border-radius: 2px;
  }

  td.label {
    padding: 2px;
    width: 150px;
  }

  td.input {
    padding: 2px;
    width: 250px;
    .select {
      height: 20px;
      font-size: 12px;
      border: 1px solid #aaa;
      background-color: #fff;
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
  }

  td.info {
    padding: 3px;
  }
}
</style>
