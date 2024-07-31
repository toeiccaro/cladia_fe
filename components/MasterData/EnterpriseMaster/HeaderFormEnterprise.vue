<template>
  <div class="add-form-enterprise p-0">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr>
          <td class="label">
            <span id="CompanyCode">{{ $t('lbl_CompanyCode_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="paramsEnterprise.companyCode"
              v-auto-focus
              name="txtCompanyCode"
              type="text"
              required
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="CompanyName">{{ $t('lbl_CompanyName_0') }}</span>
          </td>
          <td rowspan="1" colspan="4" class="input">
            <input
              v-model="paramsEnterprise.companyName"
              name="txtCompanyName"
              type="text"
              required
            />
          </td>
          <td class="info">*</td>
        </tr>
        <tr>
          <td class="label">
            <span id="CompanyType">{{ $t('lbl_CompanyType_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="paramsEnterprise.companyTypeID"
              :options="companyTypeOptions"
              class="select"
              required
            ></b-form-select>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="EnglishName">{{ $t('lbl_EnglishName_0') }}</span>
          </td>
          <td rowspan="1" colspan="4" class="input">
            <input
              v-model="paramsEnterprise.englishName"
              name="txtEnglishName"
              type="text"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="ShortName">{{ $t('lbl_ShortName_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="paramsEnterprise.shortName"
              name="txtShortName"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="MemoryCode">{{ $t('lbl_MemoryCode_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="paramsEnterprise.memoryCode"
              name="txtMemoryCode"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="RelateCompany">{{ $t('lbl_RelateCompany_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="paramsEnterprise.relateCompanyId"
              :options="listRelatedCompanyName"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span id="Address">{{ $t('lbl_Address_0') }}</span>
          </td>
          <td rowspan="1" colspan="4" class="input">
            <input
              v-model="paramsEnterprise.address1"
              name="txtAddress1"
              type="text"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="COCustom1">{{ $t('lbl_COCustom1_0') }}</span>  
          </td>
          <td class="input">
            <b-form-select
              v-model="paramsEnterprise.cocustom1"
              :options="listCOCustom1"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr>
          <td class="info"></td>
          <td rowspan="1" colspan="4" class="input">
            <input
              v-model="paramsEnterprise.address2"
              name="txtAddress2"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="COCustom2">{{ $t('lbl_COCustom2_0') }}</span> 
          </td>
          <td class="input">
            <b-form-select
              v-model="paramsEnterprise.cocustom2"
              :options="listCOCustom2"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr>
          <td class="info"></td>
          <td rowspan="1" colspan="4" class="input">
            <input
              v-model="paramsEnterprise.address3"
              name="txtAddress3"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="BTransDate">{{ $t('lbl_BTransDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              :value="paramsEnterprise.btransDate"
              typeable
              format="yyyy-MM-dd"
              input-class="input__orderDate"
              :highlighted="highlighted"
              @input="changeBTDate"
            ></datepicker>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="AddressEN">{{ $t('lbl_AddressEN_0') }}</span>
          </td>
          <td rowspan="1" colspan="4" class="input">
            <input
              v-model="paramsEnterprise.addressEN1"
              name="txtAddressEN1"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="ETransDate">{{ $t('lbl_ETransDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              :value="paramsEnterprise.etransDate"
              typeable
              format="yyyy-MM-dd"
              input-class="input__orderDate"
              :highlighted="highlighted"
              @input="changeETDate"
            ></datepicker>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="info"></td>
          <td rowspan="1" colspan="4" class="input">
            <input
              v-model="paramsEnterprise.addressEN2"
              name="txtAddressEN2"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td class="label" style="width: 4%">
            <span id="TaxRate">{{ $t('lbl_TaxRate_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="paramsEnterprise.taxRate"
              name="txtTaxRate"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="info"></td>
          <td rowspan="1" colspan="4" class="input">
            <input
              v-model="paramsEnterprise.addressEN3"
              name="txtAddressEN3"
              type="text"
            />
          </td>
          <td class="info"></td>
           <td class="label" style="width: 4%">
            <span id="discountRate">{{ $t('lbl_QDiscountRate_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="paramsEnterprise.discountRate"
              name="txtDiscountRate"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="PaymentType">{{ $t('lbl_PaymentType_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="paramsEnterprise.paymentID"
              :options="paymentTypeOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="PayPeriod">{{ $t('lbl_PayPeriod_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="paramsEnterprise.payPeriod"
              v-only-number
              name="txtPayPeriod"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>

          <td class="label">
            <span id="SettleDate">{{ $t('lbl_SettleDate_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="paramsEnterprise.settleDate"
              v-only-number
              name="txtSettleDate"
              type="text"
              class="number"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="PostCode">{{ $t('lbl_PostCode_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="paramsEnterprise.postCode"
              name="txtPostCode"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="Currency">{{ $t('lbl_Currency_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="paramsEnterprise.currencyID"
              :options="listCurrency"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="ResponsibleMan">{{ $t('lbl_ResponsibleMan_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="paramsEnterprise.responsibleMan"
              name="txtResponsibleMan"
              type="text"
            />
          </td>
        </tr>
        <tr>
          <td class="label">
            <span id="Tel">{{ $t('lbl_Tel_0') }}</span>
          </td>
          <td class="input">
            <input v-model="paramsEnterprise.tel" name="txtTel" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="Fax">{{ $t('lbl_Fax_0') }}</span>
          </td>
          <td class="input">
            <input v-model="paramsEnterprise.fax" name="txtFax" type="text" />
          </td>
          <td class="info"></td>
          <td class="label" style="width: 4%">
            <span id="WebPage">{{ $t('lbl_WebPage_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="paramsEnterprise.webPage"
              name="txtWebPage"
              type="text"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="Bank">{{ $t('lbl_Bank_0') }}</span>
          </td>
          <td class="input">
            <input v-model="paramsEnterprise.bank" name="txtBank" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="AccountNo">{{ $t('lbl_AccountNo_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="paramsEnterprise.accountNo"
              name="txtAccountNo"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td class="label" style="width: 4%">
            <span id="Email">{{ $t('lbl_Email_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="paramsEnterprise.email"
              name="txtEmail"
              type="text"
            />
          </td>
          <td class="info">
            <a href="mailto:">
              <img id="Image1" src="/images/mail_replay1.png" />
            </a>
          </td>
        </tr>

        <tr>
          <td class="label">
            <span id="Attachments">{{ $t('lbl_Attachments_0') }}</span>
          </td>
          <td colspan="7" class="input">
            <input
              id="txtAttachments"
              v-model="paramsEnterprise.attachments"
              name="txtAttachments"
              type="text"
              config="readonly"
              readonly="readonly"
              disabled
              style="background-color: rgb(235, 239, 246)"
            />
          </td>
        </tr>
        <tr>
          <td class="label">
            <span id="Memo">{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td colspan="7" class="input">
            <textarea
              v-model="paramsEnterprise.memo"
              name="txtMemo"
              rows="2"
              cols="20"
              style="height: 197px; width: 100%"
            ></textarea>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'

export default {
  mixins: [dateTime],
  props: {
    dataFormEnterprise: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      paramsEnterprise: {
        
      },
      listRelatedCompany: [],
      highlighted: {
        dates: [new Date()],
      },
      lang: this.$i18n.locale,
    }
  },
  computed: {
    ...mapGetters('base', {
      listCurrency: 'getCurrencyOptions',
      paymentTypeOptions: 'getPaymentTypeOptions',
      companyTypeOptions: 'getCompanyTypeOptions',
      listCOCustom1: 'getListCOCustom1',
      listCOCustom2: 'getListCOCustom2'
    }),
    listRelatedCompanyName() {
      const result = []
      Object.keys(this.listRelatedCompany).forEach((key) => {
        result.push({
          text: this.listRelatedCompany[key],
          value: key,
        })
      })
      result.unshift({
        text: '',
        value: '',
      })
      return result
    },
  },
  watch: {
    listCOCustom1(defaultValue) {
      if (!this.paramsEnterprise.cocustom1 && defaultValue.length) {
        this.paramsEnterprise.cocustom1 = defaultValue[2].value
      }
    },
    dataFormEnterprise: {
      handler(val) {
        this.paramsEnterprise = val
      },
      
    },
  },
  async created() {
    this.paramsEnterprise = this.dataFormEnterprise
    await Promise.all([
      this.getListRelatedCompany(),
      this.getCurrencyOptions(this.lang),
      this.getPaymentTypeOptionsFromAPI(this.lang),
      this.getCompanyTypeOptions(this.lang),
      this.getListCOCustom1OptionFromAPI(this.lang),
      this.getListCOCustom2OptionFromAPI(this.lang)
    ])
  },
  methods: {
    ...mapActions('base', [
      'getCurrencyOptions',
      'getPaymentTypeOptionsFromAPI',
      'getCompanyTypeOptions',
      'getListCOCustom1OptionFromAPI',
      'getListCOCustom2OptionFromAPI',
    ]),
    async getListRelatedCompany() {
      const response = await api('getRelatedCompany')
      this.listRelatedCompany = response?.data
    },
    changeETDate(value) {
      this.paramsEnterprise.etransDate = this.convertDate(value)
    },
    changeBTDate(value) {
      this.paramsEnterprise.btransDate = this.convertDate(value)
    },
  },
}
</script>
<style lang="scss" scoped>
.add-form-enterprise {
  font-size: 12px;
  margin: 0px 1px;
  background: #ebeff6;
  color: #222;
  table.edit {
    width: 100%;
    background-color: #ebeff6;
    td input {
      width: 100%;
      padding: 2px;
    }
    td.label {
      padding: 2px;
    }
    td.input {
      padding: 2px;
      .select {
        font-size: 12px;
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
