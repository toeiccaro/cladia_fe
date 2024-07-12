<template>
  <div :key="refreshFormKey" class="form-purchase-price">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-2">
          <td class="label">
            <span id="CustomerCode">{{ $t('lbl_SupplierCode_0') }}</span>
          </td>
          <td class="input position-relative">
            <BaseTypeaheadAutocomplete
              v-model="purchasePriceData.supplierId"
              :items="finalListCustomerNames"
              :initial-text="purchasePriceData.supplierCode"
              :initial-value="purchasePriceData.supplierId"
              @change="(event) => getCustomerDetail({ companyId: event.value })"
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="CustomerName">{{ $t('lbl_SupplierName_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="purchasePriceData.supplierName"
              name="txtCustomerName"
              type="text"
              disabled
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="EditDate">{{ $t('lbl_EditDate_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="purchasePriceData.editDate"
              type="text"
              disabled
            />
          </td>
        </tr>

        <tr class="tr-4">
          <td class="label">
            <span id="ItemCode">{{ $t('lbl_ItemCode_0') }}</span>
          </td>
          <td class="input">
            <BaseTypeaheadAutocomplete
              v-model="purchasePriceData.itemId"
              :items="finalListItemCodes"
              :initial-text="purchasePriceData.itemCode"
              :initial-value="purchasePriceData.itemId"
              @change="(event) => getItemDetail({ itemId: event.value })"
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="ProductName">{{ $t('lbl_ItemName_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="purchasePriceData.itemName"
              type="text"
              disabled
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_SupPartsName_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="purchasePriceData.supPartsName"
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
              v-model="purchasePriceData.effectiveDate"
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
              v-model="purchasePriceData.currencyId"
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
              v-model="purchasePriceData.unitId"
              :options="listUnitOptions"
              class="select"
            />
          </td>
          <td class="info">*</td>
        </tr>

        <tr class="tr-5">
          <td class="label">
            <span>{{ $t('lbl_ItemBrand_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="purchasePriceData.apparelCode"
              :options="listApparelCodeOptions"
              class="select"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span>{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input">
            <b-form-input v-model="purchasePriceData.memo" />
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
export default {
  components: {
    BaseTypeaheadAutocomplete,
  },
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      listSuppliers: [],
      listItemMasters: [],
      highlighted: {
        dates: [new Date()],
      },
      purchasePriceData: {},
      lang: this.$i18n.locale,
      refreshFormKey: Math.random() * 100000,
    }
  },
  async fetch() {
    try {
      await Promise.all([
        this.getListSuppliers(),
        this.getListItemCodes(),
        this.getCurrencyOptions(this.lang),
        this.getUnitOptions(this.lang),
        this.getApparelOptions(this.lang),
      ])
    } catch (err) {
      console.error(err)
    }
  },
  computed: {
    ...mapGetters('base', {
      listCurrencyOptions: 'getCurrencyOptions',
      listUnitOptions: 'getUnitOptions',
      listApparelCodeOptions: 'getApparelOptions',
    }),
    finalListCustomerNames() {
      return this.listSuppliers.map((item) => ({
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
      handler(value) {
        this.purchasePriceData = JSON.parse(JSON.stringify(value))
      },
    },
  },
  methods: {
    ...mapActions('base', [
      'getCurrencyOptions',
      'getUnitOptions',
      'getApparelOptions',
    ]),
    async getListSuppliers() {
      const response = await api('getMixedSupplierName', { companyType: 'Supplier,Outward' })
      const validResponse =
        response && response.status === SERVER_RESPONSE_CODE.OK

      if (validResponse) {
        this.listSuppliers = response.data
      }
    },

    async getListItemCodes() {
      const response = await api('getItemCode')
      const validResponse =
        response && response.status === SERVER_RESPONSE_CODE.OK

      if (validResponse) {
        this.listItemMasters = response?.data
      }
    },

    getItemDetail({ itemId }) {
      const customerDetail = this.listItemMasters.find(
        (item) => item.itemId === itemId
      )

      if (!customerDetail) {
        return
      }

      const mapProperties = [
        {
          origin: 'unitID',
          to: 'unitId',
        },
      ]

      mapProperties.forEach((prop) => {
        customerDetail[prop.to] = customerDetail[prop.origin]
      })

      const acceptedDetailFields = ['itemName', 'unitId']
      const finalItemDetail = {}
      for (const field of acceptedDetailFields) {
        finalItemDetail[field] = customerDetail[field]
      }

      this.purchasePriceData = Object.assign(
        {},
        this.purchasePriceData,
        finalItemDetail
      )
    },

    getCustomerDetail({ companyId }) {
      const customerDetail = this.listSuppliers.find(
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

      const mapProps = {
        companyName: 'supplierName',
      }

      for (const prop in mapProps) {
        finalCustomerDetail[mapProps[prop]] = finalCustomerDetail[prop]
      }

      this.purchasePriceData = Object.assign(
        {},
        this.purchasePriceData,
        finalCustomerDetail
      )
    },

    async resetData() {
      this.purchasePriceData = {}
      ++this.refreshFormKey
      await this.$fetch()
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
.form-purchase-price {
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
