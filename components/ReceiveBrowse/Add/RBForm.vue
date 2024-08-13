<template>
  <div :key="refreshKey" class="add-form-enterprise">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-1">
          <td class="label">
            <span id="orderNumber">{{ $t("lbl_RBOrderNO_0") }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.orderNumber"
              v-auto-focus
              name="txtOrderNumber"
              type="text"
              disabled
            />
          </td>
          <td class=""></td>

          <td class="label">
            <span id="entryDate">{{ $t("lbl_RBEntryDate_0") }}</span>
          </td>
          <td class="input">
            <datepicker
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              :value="form.entryDate"
              typeable
              format="yyyy-MM-dd"
              :disabled="isDisabled"
              input-class="input__orderDate"
              :highlighted="highlighted"
              @input="changeOrderDate"
            ></datepicker>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="totalDebitAmount">{{
              $t("lbl_RBTotalDebitAmount_0")
            }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.totalDebitAmount"
              :disabled="isDisabled"
              type="text"
              class="number"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr class="tr-2">
          <td class="label">
            <span id="departmentID">
              {{ $t("lbl_RBDepartment_0")}}
            </span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.departmentID"
              :options="departmentOptions"
              class="select"
              :disabled="isDisabled"
            ></b-form-select>
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="responsiblePerson">
              {{ $t("lbl_RBResponsiblePerson_0") }}
            </span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.responsiblePerson"
              :options="departmentOptions"
              class="select"
              :disabled="isDisabled"
            ></b-form-select>
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="totalCreditAmount">{{
              $t("lbl_RBTotalCreditAmount_0")
            }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.totalCreditAmount"
              :disabled="isDisabled"
              type="text"
              class="number"
            />
          </td>
        </tr>
        <tr>
          <td class="label">
            <span id="editor">{{ $t("lbl_RBEditor_0") }}</span>
          </td>
          <td class="input">
            <input v-model="form.editor" type="text" :disabled="isDisabled" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="editDate">{{ $t("lbl_RBEditingDate_0") }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.editDate"
              type="text"
              :disabled="isDisabled"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="margin">{{ $t("lbl_RBMargin_0") }}</span>
          </td>
          <td class="input">
            <input v-model="form.margin" type="text" :disabled="isDisabled" />
          </td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span id="memo">{{ $t("lbl_RBMemo_0") }}</span>
          </td>
          <td rows="1" colspan="4" class="input">
            <input
              v-model="form.memo"
              name="Memo"
              type="text"
              :disabled="isDisabled"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="checker">{{ $t("lbl_RBChecker_0") }}</span>
          </td>
          <td class="input">
            <input v-model="form.checker" type="text" :disabled="isDisabled" />
          </td>
          <td class="info">&nbsp;</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import api from "@/api/api";
import dateTime from "@/mixins/dateTime";
import BaseTypeaheadAutocomplete from "@/components/UI/BaseTypeaheadAutocomplete.vue";

export default {
  name: "OrderForm",
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
    };
  },
  async fetch() {
    try {
      await Promise.all([
        this.getEmployeeList(),
        this.getListCustomerName(),
        this.getDepartmentOptionsFromAPI(this.lang),
        this.getCurrencyOptions(this.lang),
        this.getPaymentTypeOptionsFromAPI(this.lang),
        this.getWarehouseOptions(this.lang),
        this.getOperationTypeOptionsFromAPI(this.lang),
      ]);
    } catch (err) {
      console.error(err);
    }
  },
  computed: {
    ...mapGetters("base", {
      departmentOptions: "getDepartmentOptions",
      currencyOptions: "getCurrencyOptions",
      paymentTypeOptions: "getPaymentTypeOptions",
      warehouseOptions: "getWarehouseOptions",
      operationTypeOptions: "getOperationTypeOptions",
    }),
    listOperationType() {
      return [
        { text: this.$t("cmb_OperType_0"), value: 0 },
        { text: this.$t("cmb_OperType_1"), value: 1 },
        { text: this.$t("cmb_OperType_2"), value: 2 },
        { text: this.$t("cmb_OperType_3"), value: 3 },
      ];
    },
    listEmployeeName() {
      const result = [];
      Object.keys(this.listEmployee).forEach((key) => {
        result.push({
          text: this.listEmployee[key],
          value: key,
        });
      });
      return result;
    },
    listCustomerName() {
      return this.listAllCustomerName.map((item) => ({
        text: item.companyName,
        value: item.id,
        appendText: `(${item.companyCode})`,
        taxRate: item.taxRate,
        discountRate: item.discountRate,
      }));
    },
  },
  watch: {
    data: {
      handler(value) {
        this.form = value;
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    ...mapActions("base", [
      "getDepartmentOptionsFromAPI",
      "getCurrencyOptions",
      "getPaymentTypeOptionsFromAPI",
      "getWarehouseOptions",
      "getOperationTypeOptionsFromAPI",
    ]),

    resetCustomerBindingData(select) {
      if (!select) {
        this.form = Object.assign(this.form, {
          customerId: "",
          currencyId: "",
          paymentId: "",
          responsibleMan: "",
          customerName: "",
        });
      }
    },

    changeCustomer(select) {
      this.form.taxRate = select?.taxRate;
      this.form.discountRate = select?.discountRate;

      this.form.customerId = select?.value;
      const result = this.listAllCustomerName.find(
        (item) => item.id === select?.value
      );
      this.form.customerName = result?.companyName;
      this.form.currencyId =
        Number(result?.currencyID) && Number(result?.currencyID) !== 0
          ? Number(result?.currencyID)
          : null;
      this.form.paymentId =
        Number(result?.paymentID) && Number(result?.paymentID) !== 0
          ? Number(result?.paymentID)
          : null;
      this.form.responsibleMan = result?.responsibleMan;
    },
    async getEmployeeList() {
      const response = await api("getEmployeeList");
      this.listEmployee = response?.data;
    },
    async getListCustomerName() {
      const response = await api("getEnterpriseCustomerNames");
      this.listAllCustomerName = response.data;
    },
    changeEmployee(select) {
      this.form.saler = select?.text;
      this.form.salerId = select?.value;
    },
    changeOrderDate(value) {
      this.form.orderDate = this.convertDate(value);
    },
    refresh() {
      ++this.refreshKey;
    },
  },
};
</script>
<style lang="scss">
@import "@/assets/vue-auto-complete.scss";
@import "@/assets/vuejs-datepicker.scss";
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
