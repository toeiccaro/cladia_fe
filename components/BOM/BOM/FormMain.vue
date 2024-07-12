<template>
  <div class="add-form-enterprise">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-2">
          <td class="label">
            <span id="CustomerName">{{ $t('lbl_ItemCode_0') }}</span>
          </td>
          <td class="input position-relative">
            <BaseTypeaheadAutocomplete
              :initial-value="form.itemId"
              :initial-text="form.itemCode"
              :items="listItemCode"
              :disable-input="dataExists || isEdit"
              @change="(event) => changeItemCode(event)"
            >
            </BaseTypeaheadAutocomplete>
          </td>
          <td class="info">*</td>

          <td class="label">
            <span>{{ $t('lbl_ItemName_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input">
            <input v-model="form.itemName" type="text" disabled />
          </td>
          <td class="info">*</td>
        </tr>
        <tr>
          <td class="label">
            <span id="CustomerName">{{ $t('lbl_Unit_0') }}</span>
          </td>
          <td class="input position-relative">
            <b-form-select
              v-model="form.unit"
              :options="unitOptions"
              class="select"
              disabled
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_Quantity_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.quantity"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span>{{ $t('lbl_FailRate_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.failRate"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-5">
          <td class="label">
            <span id="Memo">{{ $t('lbl_EditUser_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.editUser"
              name="EditUser"
              type="text"
              disabled
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_EditDate_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.editDate" type="text" disabled />
          </td>
          <td class="info">&nbsp;</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete.vue'
import { SERVER_RESPONSE_CODE, SERVER_ERROR_MESSAGE } from '~/constants'
import { isEmptyValue } from '~/utils/utils'
export default {
  components: { BaseTypeaheadAutocomplete },
  mixins: [dateTime],
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    listItemMaster: {
      type: Array,
      default: () => [],
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      form: this.data,
      highlighted: {
        dates: [new Date()],
      },
      lang: this.$i18n.locale,
      dataExists: null,
    }
  },
  computed: {
    ...mapGetters('base', {
      unitOptions: 'getUnitOptions',
    }),
    listItemCode() {
      return this.listItemMaster?.map((item) => ({
        text: item.key,
        value: item.itemId,
        appendText: item.itemName ? `(${item.itemName})` : '',
        ...item,
      }))
    },
  },
  watch: {
    data: {
      handler(value) {
        this.form = value
      },
      deep: true,
      immediate: true,
    },
  },
  async created() {
    await Promise.all([this.getListSupplier(), this.getUnitOptions(this.lang)])
  },
  methods: {
    ...mapActions('base', ['getUnitOptions']),

    async changeItemCode(select) {
      this.dataExists = null

      this.form.itemName = select?.itemName
      this.form.itemCode = select?.key
      this.form.itemId = select.itemId

      const payload = {
        itemID: select?.itemId,
        language: this.lang,
      }

      const res = await api('getBOMDetail', payload)
      const inValidResponse =
        res &&
        res.status !== SERVER_RESPONSE_CODE.OK &&
        res.data?.response?.data?.message ===
          SERVER_ERROR_MESSAGE.BOM_ITEM_ID_NOT_EXISTS

      if (inValidResponse) {
        this.dataExists = false
        return this.$forceUpdate()
      }

      this.dataExists = true

      const bomDetail = res.data
      this.form.editDate = bomDetail.editDate
      this.form.editUser = bomDetail.editUser
      this.form.failRate = bomDetail.failRate
      this.form.quantity = bomDetail.quantity
      this.form.unit = this.getUnitId(bomDetail.unit)

      const childDetails = bomDetail.bomChildDetails || []
      const hasChildren = childDetails.length
      if (hasChildren) {
        childDetails.forEach((item, idx) =>
          Object.assign(item, {
            lineID: idx + 1,
            unitID: this.getUnitId(item.unit),
          })
        )
      }

      this.$emit('changeTable', childDetails)

      this.$forceUpdate()
    },
    async getListSupplier() {
      const response = await api('getSupplierName')
      this.listSupplierName = response.data
    },
    changeOrderDate(value) {
      this.form.orderDate = this.convertDate(value)
    },
    getUnitId(unitText) {
      const unitId = this.unitOptions.find(
        (item) => item.text === unitText
      )?.value

      if (isEmptyValue(unitId)) {
        return ''
      }

      return unitId
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vue-auto-complete.scss';
@import '@/assets/vuejs-datepicker.scss';
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
