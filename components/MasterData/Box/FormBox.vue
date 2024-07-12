<template>
  <div class="form-box">
    <table cellspacing="0" cellpadding="0" class="edit">
      <tbody>
        <tr>
          <td class="label">
            <span id="BoxType">{{ $t('lbl_BoxType_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.boxType" name="txtBoxType" type="text" />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="PackQty">{{ $t('lbl_PackQty_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.packQty"
              name="txtPackQty"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info">*</td>
        </tr>
        <tr>
          <td class="label">
            <span id="Long">{{ $t('lbl_Long_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.boxLong"
              name="txtLong"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
              @input="onChangeInput()"
            />
          </td>
          <td class="info">mm</td>
          <td class="label">
            <span id="Unit">{{ $t('lbl_Unit_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.unit"
              :options="unitOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="Width">{{ $t('lbl_Width_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.width"
              name="txtWidth"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
              @input="onChangeInput()"
            />
          </td>
          <td class="info">mm</td>
          <td class="label">
            <span id="Weight">{{ $t('lbl_Weight_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.weight"
              name="txtWeight"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info">*</td>
        </tr>
        <tr>
          <td class="label">
            <span id="High">{{ $t('lbl_High_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.high"
              name="txtHigh"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
              @input="onChangeInput()"
            />
          </td>
          <td class="info">mm</td>
          <td class="label">
            <span id="WeightUnit">{{ $t('lbl_WeightUnit_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.weightUnit"
              :options="weightUnitOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="CBM">CBM</span>
          </td>
          <td class="input">
            <input
              :value="makeFormatNumberWithCommas(form.cbm)"
              name="txtCBM"
              type="text"
              class="number"
              config="readonly"
              readonly="readonly"
              style="background-color: rgb(235, 239, 246)"
              @input="onChangeInput()"
            />
          </td>
          <td class="info">m³</td>
          <td class="label">
            <span id="WeightUnit">{{ $t('lbl_Capacity_0') }}</span>
          </td>
          <td class="input">
            <div class="input-box">
              <span class="prefix">{{ prefixCapacity }}</span>
              <input
                v-model="form.capacity"
                name="txtHigh"
                type="text"
                class="number"
              />
            </div>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="WeightUnit">{{ $t('lbl_Pallet_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.pallet"
              :options="palletOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="Attachments">{{ $t('lbl_Attachments_0') }}</span>
          </td>
          <td colspan="4" class="input">
            <input
              v-model="form.attachments"
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
              style="height: 120px; width: 100%"
            ></textarea>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import systemMixin from '@/mixins/system'
import { formatNumberWithCommas } from '@/utils/utils'
export default {
  mixins: [systemMixin],
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
      prefixCapacity: '≦',
    }
  },
  computed: {
    ...mapGetters('base', {
      unitOptions: 'getUnitOptions',
      weightUnitOptions: 'getWeightUnitOptions',
      palletOptions: 'getPalletOptions',
    }),
  },
  watch: {
    dataForm: {
      handler(val) {
        this.form = val
      },
      deep: true,
    },
  },

  async created() {
    await Promise.all([
      this.getUnitOptions(this.lang),
      this.getWeightUnitOptionsFromAPI(this.lang),
      this.getPalletOptionsFromAPI(this.lang),
    ])
  },
  methods: {
    ...mapActions('base', [
      'getUnitOptions',
      'getWeightUnitOptionsFromAPI',
      'getPalletOptionsFromAPI',
    ]),
    makeFormatNumberWithCommas(number) {
      return formatNumberWithCommas(number)
    },
    onChangeInput() {
      const areaBox =
        Number(this.form.boxLong) *
        Number(this.form.width) *
        Number(this.form.high)
      const CHANGE_UNIT__MM_M = 1000000000
      this.form.cbm = parseFloat(areaBox / CHANGE_UNIT__MM_M).toFixed(6)
    },
  },
}
</script>

<style scoped lang="scss">
.form-box {
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
        font-size: 12px;
        border: 1px solid #aaa;
        background-color: #fff !important;
        border-radius: 2px;
      }

      .checkbox {
        height: 14px;
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
    }

    td.info {
      padding: 3px;
    }
  }
}
.input-box {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #aaa;
  padding-left: 0.5rem;
  overflow: hidden;
}

.input-box .prefix {
  font-weight: 700;
  font-size: 13px;
  color: #999;
}

.input-box input {
  width: 100%;
  padding: 2px;
  flex-grow: 1;
  font-size: 12px;
  background: #fff;
  border: none !important;
  outline: none;
  padding: 0.5rem;
}

.input-box:focus-within {
  border-color: #aaa;
}
</style>
