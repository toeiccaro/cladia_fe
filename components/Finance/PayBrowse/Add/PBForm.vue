<template>
  <div :key="refreshKey" class="add-form-enterprise">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-1">
          <td class="label">
            <span id="orderNumber">
              {{ $t("lbl_RBorderNumber_0") }}
            </span>
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
            <span id="entryDate">{{ $t("lbl_RBentryDate_0") }}</span>
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
              $t("lbl_RBtotalDebitAmount_0")
            }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.totalDebitAmount"
              :disabled="true"
              type="text"
              class="number"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr class="tr-2">
          <td class="label">
            <span id="departmentID">
              {{ $t("lbl_RBdepartmentID_0")}}
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
              {{ $t("lbl_RBresponsiblePerson_0") }}
            </span>
          </td>
          <td class="input">
            <input
              v-model="form.responsiblePerson"
              :disabled="isDisabled"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="totalCreditAmount">{{
              $t("lbl_RBtotalCreditAmount_0")
            }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.totalCreditAmount"
              :disabled="true"
              type="text"
              class="number"
            />
          </td>
        </tr>
        <tr>
          <td class="label">
            <span id="editor">{{ $t("lbl_RBeditor_0") }}</span>
          </td>
          <td class="input">
            <input v-model="form.editor" type="text" :disabled="true" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="editDate">{{ $t("lbl_RBeditDate_0") }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.editDate"
              type="text"
              :disabled="true"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="margin">{{ $t("lbl_RBmargin_0") }}</span>
          </td>
          <td class="input">
            <input 
              v-model="form.margin"
              type="text"
              :disabled="true"
              class="number"
            />
          </td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span id="memo">{{ $t("lbl_RBmemo_0") }}</span>
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
            <span id="checker">{{ $t("lbl_RBchecker_0") }}</span>
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
        this.getDepartmentOptionsFromAPI(this.lang),
        
      ]);
    } catch (err) {
      console.error(err);
    }
  },
  computed: {
    ...mapGetters("base", {
      departmentOptions: "getDepartmentOptions",
      
    }),
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
    ]),

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
