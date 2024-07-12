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
              v-model.trim="itemMaster.itemCode"
              v-auto-focus
              name="txtItemCode"
              required
              type="text"
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
              v-model="itemMaster.itemName"
              name="txtItemName"
              rows="2"
              cols="20"
              required
              style="height: 30px; width: 100%"
            ></textarea>
          </td>
          <td class="info">*</td>
        </tr>
        <tr>
          <td class="label">
            <span id="ItemType">{{ $t('lbl_ItemType_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="itemMaster.itemTypeId"
              :options="itemTypeOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span>{{ $t('lbl_AliasName_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="itemMaster.aliasName"
              type="text"
              name="txtItemCode"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_Color_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="itemMaster.colorId"
              :options="colorOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="Barcode">{{ $t('lbl_Barcode_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="itemMaster.barcode"
              type="text"
              name="txtItemCode"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="Description">{{ $t('lbl_Description_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="itemMaster.description"
              type="text"
              name="txtDescription"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="BoxType">{{ $t('lbl_BoxType_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="itemMaster.boxType"
              :options="listBoxTypes"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span id="DepartType">{{ $t('lbl_DepartType_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="itemMaster.departId"
              :options="departmentOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="ResponsibleMan">{{ $t('lbl_ResponsibleMan_0') }}</span>
          </td>
          <td class="input">
            <BaseTypeaheadAutocomplete
              v-model="itemMaster.responsible"
              :initial-value="itemMaster.responsible"
              :initial-text="itemMaster.responsible"
              binding-value="text"
              :items="listEmployeeName"
            >
            </BaseTypeaheadAutocomplete>
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_SOPrice_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="itemMaster.soprice"
              name="txtSOPrice"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="Unit">{{ $t('lbl_Unit_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="itemMaster.unitId"
              :options="unitOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="OutRate">{{ $t('lbl_OutRate_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="itemMaster.outRate"
              name="txtOutRate"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="PurchasePeriod">{{ $t('lbl_PurchasePeriod_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="itemMaster.purchasePeriod"
              name="txtPurchasePeriod"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
        </tr>
        <tr>
          <td class="label">
            <span id="PurchaseUnit">{{ $t('lbl_PurchaseUnit_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="itemMaster.purchaseUnitId"
              :options="unitOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="OutUnit">{{ $t('lbl_OutUnit_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="itemMaster.outUnitID"
              :options="unitOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="OutPeriod">{{ $t('lbl_OutPeriod_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="itemMaster.outPeriod"
              name="txtOutPeriod"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
        </tr>
        <tr>
          <td class="label">
            <span id="WeightUnit">{{ $t('lbl_WeightUnit_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="itemMaster.weightId"
              :options="weightUnitOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="Weight">{{ $t('lbl_Weight_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="itemMaster.weight"
              name="txtWeight"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="IgnoreMRP">{{ $t('lbl_IsNotNeedMRP_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="itemMaster.isNotNeedMRP"
              type="checkbox"
              name="chkIgnoreMRP"
              class="checkbox"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="SPQ">{{ $t('lbl_SPQ_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="itemMaster.spq"
              name="txtSPQ"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>

          <td class="label">
            <span id="MOQ">{{ $t('lbl_MOQ_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="itemMaster.moq"
              name="txtMOQ"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info">
            <input id="txtPicUrl" type="hidden" name="txtPicUrl" />
            <input id="txtPicUrl1" type="hidden" name="txtPicUrl1" />
            <input id="txtPicUrl2" type="hidden" name="txtPicUrl2" />
            <input id="txtPicUrl3" type="hidden" name="txtPicUrl3" />
            <input id="txtItemID" type="hidden" name="txtItemID" value="0" />
          </td>
          <td class="label">
            <span id="IsCommon">{{ $t('lbl_IsCommon_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="itemMaster.isCommon"
              type="checkbox"
              name="chkIsCommon"
              class="checkbox"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="PackPeriod" class="number">{{
              $t('lbl_PackPeriod_0')
            }}</span>
          </td>
          <td class="input">
            <input
              v-model="itemMaster.packPeriod"
              name="txtPackPeriod"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="SalePeriod">{{ $t('lbl_SalePeriod_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="itemMaster.salePeriod"
              name="txtSalePeriod"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="WarehouseID">{{ $t('lbl_Warehouse_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="itemMaster.warehouseId"
              :options="warehouseOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span id="SafeQty">{{ $t('lbl_SafeQty_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="itemMaster.safeQty"
              name="txtSafeQty"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="CostPrice">{{ $t('lbl_CostPrice_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="itemMaster.price"
              name="txtPrice"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="ItemCustom">{{ $t('lbl_ItemCustom_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="itemMaster.itemCustom"
              :options="itemCustomOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span id="Attachments">{{ $t('lbl_Attachments_0') }}</span>
          </td>
          <td colspan="7" class="input">
            <input
              v-model="itemMaster.attachments"
              name="txtAttachments"
              type="text"
              config="readonly"
              disabled
              readonly
              style="background-color: rgb(235, 239, 246)"
            />
          </td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span id="Memo">{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td colspan="7" class="input">
            <textarea
              v-model="itemMaster.memo"
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
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete'
import api from '@/api/api'

export default {
  components: {
    BaseTypeaheadAutocomplete,
  },
  props: {
    paramsItemMaster: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  data() {
    return {
      listEmployee: [],
      isCommon: false,
      itemMaster: {},
      lang: this.$i18n.locale,
    }
  },
  async fetch() {
    this.itemMaster = this.paramsItemMaster
    await Promise.all([
      await this.getEmployeeList(),
      await this.getWarehouseOptions(this.lang),
      await this.getItemCustomOptionsFromAPI(this.lang),
      await this.getColorOptionsFromAPI(this.lang),
      await this.getPaymentTypeOptionsFromAPI(this.lang),
      await this.getDepartmentOptionsFromAPI(this.lang),
      await this.getCurrencyOptions(this.lang),
      await this.getUnitOptions(this.lang),
      await this.getWeightUnitOptionsFromAPI(this.lang),
      this.getItemTypeOptionsFromAPI(),
    ])
  },
  computed: {
    ...mapGetters('base', {
      listBox: 'getListBox',
      currencyOptions: 'getCurrencyOptions',
      paymentTypeOptions: 'getPaymentTypeOptions',
      colorOptions: 'getColorOptions',
      unitOptions: 'getUnitOptions',
      itemCustomOptions: 'getItemCustomOptions',
      warehouseOptions: 'getWarehouseOptions',
      departmentOptions: 'getDepartmentOptions',
      weightUnitOptions: 'getWeightUnitOptions',
      getItemTypeOptions: 'getItemTypeOptions',
    }),
    itemTypeOptions() {
      return this.getItemTypeOptions.map((item) => ({
        text: this.$t(`${item.text}`),
        value: item.value,
      }))
    },
    listEmployeeName() {
      const result = []

      for (const key in this.listEmployee) {
        const employeeValue = this.listEmployee[key] || ''
        const lastIndexOfOpenParenthese = employeeValue.lastIndexOf('(') || 0

        const appendText = employeeValue.substring(lastIndexOfOpenParenthese)
        const responsibleManValue = employeeValue.substring(
          0,
          lastIndexOfOpenParenthese
        )

        result.push({
          text: responsibleManValue,
          value: responsibleManValue,
          appendText,
        })
      }

      return result
    },
    listBoxTypes() {
      return this.listBox.map((item) => ({
        text: item.boxType,
        value: item.boxType,
      }))
    },
  },
  watch: {
    paramsItemMaster: {
      handler(val) {
        this.itemMaster = val
      },
    },
  },

  methods: {
    ...mapActions('base', [
      'getWarehouseOptions',
      'getUnitOptions',
      'getCurrencyOptions',
      'getDepartmentOptionsFromAPI',
      'getPaymentTypeOptionsFromAPI',
      'getColorOptionsFromAPI',
      'getItemCustomOptionsFromAPI',
      'getWeightUnitOptionsFromAPI',
      'getItemTypeOptionsFromAPI',
    ]),
    async getEmployeeList() {
      const response = await api('getEmployeeList')
      this.listEmployee = response?.data
    },
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
