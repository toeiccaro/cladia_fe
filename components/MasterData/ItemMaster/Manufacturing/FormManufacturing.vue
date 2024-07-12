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
            <span id="ItemType">{{ $t('lbl_CustomerText1_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText1" type="text" />
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
            <span>{{ $t('lbl_ListBox1_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.listBox1"
              :options="listBox1Option"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="ItemType">{{ $t('lbl_CustomerText2_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText2" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_DeliveryLT_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.deliveryLT"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_ListBox2_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.listBox2"
              :options="listBox2Option"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_CustomerText3_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText3" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_ProdCapacityPerDay_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.prodCapacityPerDay"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_ListBox3_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.listBox3"
              :options="listBox3Option"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_CustomerText4_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText4" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_NumberField1_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.numberField1"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_ListBox4_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.listBox4"
              :options="listBox4Option"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_CustomerText5_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText5" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_NumberField2_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.numberField2"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_ListBox5_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.listBox5"
              :options="listBox5Option"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_CustomerText6_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText6" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_NumberField3_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.numberField3"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_ListBox6_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.listBox6"
              :options="listBox6Option"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_CustomerText7_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText7" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_NumberField4_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.numberField4"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_CheckBox1_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.checkbox1" type="checkbox" class="checkbox" />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_CustomerText8_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText8" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_NumberField5_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.numberField5"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_CheckBox2_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.checkbox2" type="checkbox" class="checkbox" />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_CustomerText9_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText9" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_NumberField6_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.numberField6"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_CheckBox3_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.checkbox3" type="checkbox" class="checkbox" />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_CustomerText10_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText10" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_NumberField7_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.numberField7"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_CheckBox4_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.checkbox4" type="checkbox" class="checkbox" />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="info">&nbsp;</td>
          <td class="info">&nbsp;</td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span>{{ $t('lbl_NumberField8_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.numberField8"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
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
      form: {
        productionLT: 0,
        deliveryLT: 0,
        prodCapacityPerDay: 0,
        numberField1: 0,
        numberField2: 0,
        numberField3: 0,
        numberField4: 0,
        numberField5: 0,
        numberField6: 0,
        numberField7: 0,
        numberField8: 0,
      },
      lang: this.$i18n.locale,
    }
  },
  async fetch() {
    this.form = this.defaultForm
    await Promise.all([
      this.getListBox1OptionFromAPI(this.lang),
      this.getListBox2OptionFromAPI(this.lang),
      this.getListBox3OptionFromAPI(this.lang),
      this.getListBox4OptionFromAPI(this.lang),
      this.getListBox5OptionFromAPI(this.lang),
      this.getListBox6OptionFromAPI(this.lang),
    ])
  },
  computed: {
    ...mapGetters({
      listBox1Option: 'base/getListBox1',
      listBox2Option: 'base/getListBox2',
      listBox3Option: 'base/getListBox3',
      listBox4Option: 'base/getListBox4',
      listBox5Option: 'base/getListBox5',
      listBox6Option: 'base/getListBox6',
    }),
    itemCode() {
      return this.dataItemMaster ? this.dataItemMaster?.itemCode : ''
    },
    itemName() {
      return this.dataItemMaster ? this.dataItemMaster?.itemName : ''
    },
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
      getListBox1OptionFromAPI: 'base/getListBox1OptionFromAPI',
      getListBox2OptionFromAPI: 'base/getListBox2OptionFromAPI',
      getListBox3OptionFromAPI: 'base/getListBox3OptionFromAPI',
      getListBox4OptionFromAPI: 'base/getListBox4OptionFromAPI',
      getListBox5OptionFromAPI: 'base/getListBox5OptionFromAPI',
      getListBox6OptionFromAPI: 'base/getListBox6OptionFromAPI',
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
