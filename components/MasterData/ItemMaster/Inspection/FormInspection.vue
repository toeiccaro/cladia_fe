<template>
  <div class="header-form">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_ItemCode_0') }}</span>
          </td>
          <td class="input" colspan="7">
            <input
              v-model.trim="itemCode"
              v-auto-focus
              required
              type="text"
              disabled
            />
          </td>
          <td class="info">*</td>
        </tr>
        <tr>
          <td class="label">
            <span id="ItemName">{{ $t('lbl_ItemName_0') }}</span>
          </td>
          <td class="input" colspan="7">
            <textarea
              v-model="itemName"
              rows="2"
              cols="20"
              style="height: 30px; width: 100%"
              disabled
            ></textarea>
          </td>
          <td class="info">*</td>
        </tr>
        <tr>
          <td class="label">
            <span id="ItemType">{{ $t('lbl_CustomerText11_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText11" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_ProductionLT_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.productLT"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_InspectionType_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.inspectionType"
              :options="inspectionTypeOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="ItemType">{{ $t('lbl_CustomerText12_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText12" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_SafetyLT_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.safetyLT"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_ListBox8_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.listBox8"
              :options="listBox8Option"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_CustomerText13_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText13" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_NumberField9_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.numberField9"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_ListBox9_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.listBox9"
              :options="listBox9Option"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_CustomerText14_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText14" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_NumberField10_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.numberField10"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_ListBox10_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.listBox10"
              :options="listBox10Option"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_CustomerText15_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText15" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_NumberField11_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.numberField11"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_ListBox11_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.listBox11"
              :options="listBox11Option"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_CustomerText16_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText16" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_NumberField12_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.numberField12"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_ListBox12_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.listBox12"
              :options="listBox12Option"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_CustomerText17_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText17" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_NumberField13_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.numberField13"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_CheckBox5_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.checkbox5" type="checkbox" class="checkbox" />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_CustomerText18_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText18" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_NumberField14_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.numberField14"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_CheckBox6_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.checkbox6" type="checkbox" class="checkbox" />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_CustomerText19_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText19" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_NumberField15_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.numberField15"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_CheckBox7_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.checkbox7" type="checkbox" class="checkbox" />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_CustomerText20_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText20" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_NumberField16_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.numberField16"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_CheckBox8_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.checkbox8" type="checkbox" class="checkbox" />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_CustomerText20_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText20" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_NumberField16_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.numberField16"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_CheckBox8_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.checkbox8" type="checkbox" class="checkbox" />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="Memo">{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td colspan="7" class="input">
            <textarea
              v-model="form.memo"
              name="txtMemo"
              rows="2"
              cols="20"
              style="height: 100px; width: 100%"
            ></textarea>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  components: {},
  props: {
    defaultForm: {
      type: Object,
      required: false,
      default: () => {},
    },
    dataItemMaster: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      listEmployee: [],
      form: {},
      lang: this.$i18n.locale,
    }
  },
  async fetch() {
    this.form = this.defaultForm
    await Promise.all([
      this.getInspectionTypesFromAPI(this.lang),
      this.getListBox8OptionFromAPI(this.lang),
      this.getListBox9OptionFromAPI(this.lang),
      this.getListBox10OptionFromAPI(this.lang),
      this.getListBox11OptionFromAPI(this.lang),
      this.getListBox12OptionFromAPI(this.lang),
    ])
  },
  computed: {
    ...mapGetters({
      inspectionTypes: 'base/getInspectionTypes',
      listBox8Option: 'base/getListBox8',
      listBox9Option: 'base/getListBox9',
      listBox10Option: 'base/getListBox10',
      listBox11Option: 'base/getListBox11',
      listBox12Option: 'base/getListBox12',
    }),
    itemCode() {
      return this.dataItemMaster ? this.dataItemMaster?.itemCode : ''
    },
    itemName() {
      return this.dataItemMaster ? this.dataItemMaster?.itemName : ''
    },
    inspectionTypeOptions() {
      return this.inspectionTypes.filter(item => !!item.value)
    }
  },
  watch: {
    defaultForm: {
      handler(val) {
        this.form = val
      },
    },
  },

  methods: {
    ...mapActions({
      getInspectionTypesFromAPI: 'base/getInspectionTypesFromAPI',
      getListBox8OptionFromAPI: 'base/getListBox8OptionFromAPI',
      getListBox9OptionFromAPI: 'base/getListBox9OptionFromAPI',
      getListBox10OptionFromAPI: 'base/getListBox10OptionFromAPI',
      getListBox11OptionFromAPI: 'base/getListBox11OptionFromAPI',
      getListBox12OptionFromAPI: 'base/getListBox12OptionFromAPI',
    }),
  },
}
</script>
<style lang="scss" scoped>
.header-form {
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
</style>
