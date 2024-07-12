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
              v-model="newSalePriceData.customerId"
              :items="finalListCustomerNames"
              :initial-text="newSalePriceData.companyCode"
              :initial-value="newSalePriceData.customerId"
              @change="(event) => getCustomerDetail({ companyId: event.value })"
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="CustomerName">{{ $t('lbl_CustomerName_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input">
            <b-form-input
              v-model="newSalePriceData.companyName"
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
              v-model="newSalePriceData.itemId"
              :items="finalListItemCodes"
              :initial-text="newSalePriceData.itemCode"
              :initial-value="newSalePriceData.itemId"
              @change="(event) => getItemDetail({ itemId: event.value })"
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="ProductName">{{ $t('lbl_ItemName_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="newSalePriceData.itemName"
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
              v-model="newSalePriceData.customerPartsName"
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
              v-model="newSalePriceData.effectiveDate"
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
              v-model="newSalePriceData.currencyId"
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
              v-model="newSalePriceData.unitId"
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
              v-model="newSalePriceData.apparelCodeID"
              :options="apparelCodeOptions"
              class="select"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span>{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input">
            <b-form-input v-model="newSalePriceData.memo" />
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
  data() {
    return {
      listCustomers: [],
      listItemMasters: [],
      highlighted: {
        dates: [new Date()],
      },
      newSalePriceData: {},
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
    newSalePriceData: {
      deep: true,
      handler(data) {
        this.$emit('update-sale-price-data', Object.assign({}, data))
      },
    },
  },
  created() {
    this.getListApparelCode()
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
        this.apparelCodeOptions = res.data.map((item) => ({
          text: item.name,
          value: item.id,
        }))
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

      this.newSalePriceData = Object.assign(
        {},
        this.newSalePriceData,
        finalItemDetail
      )
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

      this.newSalePriceData = Object.assign(
        {},
        this.newSalePriceData,
        finalCustomerDetail
      )
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
