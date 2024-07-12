<template>
  <div class="add-form-enterprise">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-2">
          <td class="label">
            <span id="CustomerCode">{{ $t('lbl_CustomerCode_0') }}</span>
          </td>
          <td class="input position-relative">
            <BaseTypeaheadAutocomplete
              v-model="salePriceData.customerId"
              :items="finalListCustomerNames"
              :initial-text="getInitialCustomerName"
              :initial-value="salePriceData.customerId"
              @change="(event) => getCustomerDetail({ companyId: event.value })"
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="CustomerName">{{ $t('lbl_CustomerName_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input">
            <b-form-input
              v-model="salePriceData.customerName"
              name="txtCustomerName"
              type="text"
              disabled
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-4">
          <td class="label">
            <span id="ItemCode">{{ $t('lbl_ItemCode_0') }}</span>
          </td>
          <td class="input">
            <BaseTypeaheadAutocomplete
              v-model="salePriceData.itemId"
              :items="finalListItemCodes"
              :initial-text="getInitialItemCode"
              :initial-value="salePriceData.itemId"
              @change="(event) => getItemDetail({ itemId: event.value })"
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="ProductName">{{ $t('lbl_ItemName_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="salePriceData.itemName"
              type="text"
              disabled
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_CusPartsName_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="salePriceData.customerPartsName"
              name="CustomerPartsName"
              type="text"
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-4">
          <td class="label">
            <span id="EffectiveDate">{{ $t('lbl_EffectiveDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-model="salePriceData.effectiveDate"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__effectiveDate',
              }"
              typeable
              class="input-date"
              format="yyyy-MM-dd"
              input-class="input__effectiveDate"
              :highlighted="highlighted"
            ></datepicker>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span>{{ $t('lbl_Currency_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="salePriceData.currencyId"
              :options="listCurrencyOptions"
              class="select"
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span>{{ $t('lbl_Unit_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="salePriceData.unitId"
              :options="listUnitOptions"
              class="select"
            />
          </td>
          <td class="info">&nbsp;</td>
        </tr>

        <tr class="tr-5">
          <td class="label">
            <span>{{ $t('lbl_ItemBrand_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="salePriceData.apparelCodeID"
              :options="apparelCodeOptions"
              text-field="name"
              value-field="id"
              class="select"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span>{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input">
            <b-form-input v-model="salePriceData.memo" />
          </td>
          <td class="info">&nbsp;</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete'
import api from '@/api/api'
import commonOptionsMixins from '@/mixins/commonOptions'
export default {
  components: {
    BaseTypeaheadAutocomplete,
  },
  mixins: [commonOptionsMixins],
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      listCustomers: [],
      listItemMasters: [],
      highlighted: {
        dates: [new Date()],
      },
      salePriceData: {},
      lang: this.$i18n.locale,
      apparelCodeOptions: [],
      ApparelCode: 'ApparelCode',
    }
  },
  async fetch() {
    try {
      await Promise.all([
        this.getListCustomerNames(),
        this.getListItemCodes(),
        this.getCurrencyOptions(this.lang),
        this.getUnitOptions(this.lang),
        this.getListApparelCode(),
      ])
    } catch (err) {
      console.error(err)
    }
  },
  computed: {
    ...mapGetters('base', {
      listCurrencyOptions: 'getCurrencyOptions',
      listUnitOptions: 'getUnitOptions',
    }),
    getInitialCustomerName() {
      return this.finalListCustomerNames.find(
        (item) => item.value === this.salePriceData?.customerId
      )?.text
    },

    getInitialItemCode() {
      return this.finalListItemCodes.find(
        (item) => item.value === this.salePriceData?.itemId
      )?.text
    },

    finalListCustomerNames() {
      return this.listCustomers.map((item) => ({
        text: item.companyCode,
        value: item.id,
        appendText: `(${item.companyName})`,
      }))
    },

    finalListItemCodes() {
      return this.listItemMasters?.map((item) => ({
        text: item.key,
        value: item.itemId,
        appendText: `(${item.itemName})`,
        ...item,
      }))
    },
  },
  watch: {
    data: {
      deep: true,
      immediate: true,
      handler(data) {
        this.salePriceData = Object.assign({}, data)
      },
    },
  },
  methods: {
    ...mapActions('base', [
      'getCurrencyOptions',
      'getUnitOptions',
      'getApparelOptions',
    ]),
    async getListApparelCode() {
      this.listApparelCode = { keyCode: this.ApparelCode, language: this.lang }
      const res = await api('getParameter', this.listApparelCode)
      if (res && res.status === 200) {
        this.apparelCodeOptions = res.data
      }
    },
    async getListCustomerNames() {
      const response = await api('getEnterpriseCustomerNames')
      this.listCustomers = response.data
    },

    async getListItemCodes() {
      const res = await api('getItemCode')
      if (res && res.status === SERVER_RESPONSE_CODE.OK) {
        this.listItemMasters = res?.data
      }
    },

    getItemDetail({ itemId }) {
      const customerDetail = this.listItemMasters.find(
        (item) => item.itemId === itemId
      )

      if (!customerDetail) {
        return
      }

      const mapProperties = {
        unitId: 'unitID',
      }

      for (const prop in mapProperties) {
        customerDetail[prop] = customerDetail[mapProperties[prop]]
      }

      const acceptedDetailFields = ['itemName', 'unitId']

      const finalItemDetail = {}
      for (const field of acceptedDetailFields) {
        finalItemDetail[field] = customerDetail[field]
      }

      Object.assign(this.salePriceData, finalItemDetail)
    },

    getCustomerDetail({ companyId }) {
      const customerDetail = this.listCustomers.find(
        (item) => item.id === companyId
      )

      if (!customerDetail) {
        return
      }

      const mapProperties = {
        currencyId: 'currencyID',
      }

      for (const key in mapProperties) {
        customerDetail[key] = customerDetail[mapProperties[key]]
      }

      const acceptedDetailFields = ['currencyId', 'companyName']
      const finalCustomerDetail = {}
      for (const field of acceptedDetailFields) {
        finalCustomerDetail[field] = customerDetail[field]
      }

      Object.assign(this.salePriceData, finalCustomerDetail)
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vuejs-datepicker.scss';
@import '@/assets/vue-auto-complete.scss';
</style>
<style lang="scss" scoped>
.text-end {
  text-align: end !important;
}
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
      .input-date {
        height: 20px;
        font-size: 12px;
        border-radius: 2px;
      }
    }
    td.info {
      padding: 3px;
    }
  }
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
