<template>
  <div class="add-form-enterprise">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-2">
          <td class="label">
            <span id="CustomerCode">{{ $t('lbl_CustomerCode_0') }}</span>
          </td>
          <td rows="1" colspan="14" class="input position-relative">
            <BaseTypeaheadAutocomplete
              v-model="batchSalePriceData.customerId"
              :items="finalListCustomerNames"
              :initial-text="batchSalePriceData.companyCode"
              :initial-value="batchSalePriceData.customerId"
              @change="(event) => getCustomerDetail({ companyId: event.value })"
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-4">
          <td class="label">
            <span id="ItemCode">{{ $t('lbl_ItemCode_0') }}</span>
          </td>
          <td rows="1" colspan="14" class="input">
            <BaseTypeaheadAutocomplete
              v-model="batchSalePriceData.itemId"
              :items="finalListItemCodes"
              :initial-text="batchSalePriceData.itemCode"
              :initial-value="batchSalePriceData.itemId"
              @change="(event) => getItemDetail({ itemId: event.value })"
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-4">
          <td class="label">
            <span id="EffectiveDate">{{ $t('lbl_EffectiveDate_0') }}</span>
          </td>
          <td rows="1" colspan="14" class="input">
            <datepicker
              v-model="batchSalePriceData.effectiveDate"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__effectiveDate',
              }"
              typeable
              class="input-date"
              format="yyyy-MM-dd"
              :value="batchSalePriceData.effectiveDate"
              input-class="input__effectiveDate"
              :highlighted="highlighted"
              @selected="(event) => updateBatchData(event)"
            ></datepicker>
          </td>
          <td class="info">*</td>
        </tr>

        <tr class="tr-5">
          <td class="label">
            <span>{{ $t('lbl_SOBatchRule_0') }}</span>
          </td>
        </tr>

        <tr class="tr-5">
          <td class="label">
            <span>{{ $t('lbl_FloatUp_0') }}</span>
          </td>
          <td rows="1" colspan="2" class="radio">
            <b-form-radio
              v-model="batchSalePriceData.useFloatUp"
              name="batchRule"
              :value="true"
            />
          </td>
          <td rows="1" colspan="12" class="input">
            <input
              v-model="batchSalePriceData.floatUp"
              oninput="this.value = this.value.replace(/(?!^-)[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
              class="text-right"
            />
          </td>
          <td>%</td>
        </tr>
        <tr class="tr-5">
          <td class="label">
            <span>{{ $t('lbl_FixedValue_0') }}</span>
          </td>
          <td rows="1" colspan="2" class="radio">
            <b-form-radio
              v-model="batchSalePriceData.useFloatUp"
              name="batchRule"
              :value="false"
            />
          </td>
          <td rows="1" colspan="12" class="input">
            <input
              v-model="batchSalePriceData.fixedValue"
              oninput="this.value = this.value.replace(/(?!^-)[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
              class="text-right"
            />
          </td>
          <td class="info">&nbsp;</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
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
      batchSalePriceData: {
        fixedValue: 1,
        floatUp: 1,
        useFloatUp: null,
        effectiveDate: new Date(),
      },
    }
  },
  async fetch() {
    try {
      await Promise.all([this.getListCustomerNames(), this.getListItemCodes()])
    } catch (err) {
      console.error(err)
    }
  },
  computed: {
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
    batchSalePriceData: {
      deep: true,
      handler(data) {
        this.$emit('update-sale-price-data', Object.assign({}, data))
      },
    },
  },
  methods: {
    updateBatchData(data) {
      Object.assign(this.batchSalePriceData, { effectiveDate: data })
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

      Object.assign(this.batchSalePriceData, finalItemDetail)
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

      Object.assign(this.batchSalePriceData, finalCustomerDetail)
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
    td.radio {
      width: 5%;
      padding: 2px;
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
