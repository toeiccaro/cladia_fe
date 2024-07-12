<template>
  <div>
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr>
          <td class="label">
            <span id="OrderNO">{{ $t('lbl_OrderNO_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.orderNO" name="txtOrderNO" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="ItemName">{{ $t('lbl_ItemName_0') }}</span>
          </td>
          <td class="input">
            <BaseTypeaheadAutocomplete
              :items="productNameOptions"
              :initial-text="form.itemCode && form.itemName ? `${form.itemName} (${form.itemCode})` : ''"
              :initial-value="form.itemName"
              binding-text="itemName"
              binding-value="text"
              @change="handleChangeItemName"
              @hit="removeChangeItem"
            >
            </BaseTypeaheadAutocomplete>
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="WarehouseID">{{ $t('lbl_Warehouse_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.warehouseID"
              :options="warehouseOptions"
              class="select"
              @change="(value) => handleChangeWarehouse(value)"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="ItemType">{{ $t('lbl_ItemType_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.itemTypeID"
              :options="itemTypeOptions"
              class="select"
              @change="(value) => handleChangeItemType(value)"
            ></b-form-select>
          </td>
          <td class="info"></td>

          <td class="label">
            <span id="EndDate">{{ $t('lbl_EndDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-model="form.endDate"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              typeable
              format="yyyy-MM-dd"
              :highlighted="highlighted"
              input-class="input__orderDate"
            ></datepicker>
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="OrderType">{{ $t('lbl_OrderType_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.orderTypeID"
              :options="orderTypeOptions"
              class="select"
              @change="(value) => handleChangeOrderType(value)"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="IsBad">{{ $t('lbl_IsBad_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.isBad" type="checkbox" class="checkbox" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="LotNo">{{ $t('lbl_LotNo_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.lotNO" name="txtLotNO" type="text" maxlength="256" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="RackNO">{{ $t('lbl_RackNO_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.rackNo" name="txtRackNO" type="text" maxlength="256" />
          </td>
          <td class="info"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import api from '@/api/api'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete'

export default {
  components: {
    BaseTypeaheadAutocomplete,
  },
  props: {
    searchForm: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  data() {
    return {
      form: {
        isBad: true,
      },
      lang: this.$i18n.locale,
      itemTypeOptions: [],
      orderTypeOptions: [],
      productNameOptions: [],
      highlighted: {
        dates: [new Date()],
      },
    }
  },
  computed: {
    ...mapGetters('base', {
      warehouseOptions: 'getWarehouseOptions',
    }),
  },
  watch: {
    searchForm: {
      handler(val) {
        this.form = val
      },
      deep: true,
      immediate: true,
    },
  },

  async created() {
    await Promise.all([
      await this.getWarehouseOptions(this.lang),
      await this.getItemTypeFromAPI(),
      await this.getItemNameFromAPI(),
      await this.getOrderTypeFromAPI(),
    ])
  },
  methods: {
    ...mapActions('base', ['getWarehouseOptions']),
    async getItemTypeFromAPI() {
      const res = await api('getItemType')
      if (res) {
        this.itemTypeOptions = res.data.map((item) => {
          return {
            text: this.$t(item.key),
            value: item.keyId,
          }
        })
        this.itemTypeOptions.unshift({
          text: '',
          value: '',
        })
      }
    },
    handleChangeWarehouse(value) {
      this.form.warehouse = this.warehouseOptions.find(
        (item) => item.value === value
      )?.text
    },
    handleChangeOrderType(value) {
      this.form.orderType = this.orderTypeOptions.find(
        (item) => item.value === value
      )?.text
    },

    handleChangeItemType(value) {
      this.form.itemType = this.itemTypeOptions.find(
        (item) => item.value === value
      )?.text
    },
    async getItemNameFromAPI() {
      const res = await api('getItemCode')
      if (res) {
        this.productNameOptions = res.data.map((item) => {
          return {
            text: `${item.itemName} (${item.key})`,
            value: item.itemName,
            appendText: `(${item.key})`,
            ...item,
          }
        })
        this.productNameOptions.unshift({
          text: '',
          value: '',
        })
      }
    },
    handleChangeItemName(selected) {
      this.form.itemCode = selected?.key
      this.form.itemName = selected?.itemName
    },
    removeChangeItem(item) {
      if (!item) {
        this.form.itemCode = ''
        this.form.itemName = ''
      }
    },
    async getOrderTypeFromAPI() {
      const res = await api('getOrderType')
      if (res) {
        this.orderTypeOptions = res.data.map((item, index) => {
          return {
            text: item,
            value: index,
          }
        })
        this.orderTypeOptions.unshift({
          text: '',
          value: '',
        })
      }
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vue-auto-complete.scss';
@import '@/assets/vuejs-datepicker.scss';
</style>
<style lang="scss" scoped>
table.edit {
  width: 100%;
  background: #ebeff6;
  td.input {
    width: 20% !important;
    .select {
      font-size: 12px;
      border: 1px solid #aaa;
      background-color: #fff !important;
      border-radius: 2px;
    }
    .checkbox {
      height: 14px;
    }
  }
  td input {
    width: 100%;
    padding: 2px;
    height: 20px;
  }
  td.label {
    padding: 2px;
    width: 10% !important;
  }
}
</style>
