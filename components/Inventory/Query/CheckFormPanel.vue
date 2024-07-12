<template>
  <div>
    <table cellpadding="0" cellspacing="0" width="100%">
      <tbody>
        <tr style="height: 35px">
          <td style="width: 5%">
            &nbsp;
            <span id="WarehouseID1">{{ $t('lbl_Warehouse_0') }}</span>
          </td>
          <td style="width: 10%">
            <input
              v-model="form.warehouseCheck"
              type="checkbox"
              name="chkWarehouseID"
            />
          </td>

          <td>
            <span id="ItemCode1">{{ $t('lbl_ItemCode_0') }}</span>
          </td>

          <td>
            <input
              v-model="form.itemCodeCheck"
              type="checkbox"
              name="chkItemCode"
            />
          </td>

          <td style="width: 5%">
            <span id="TransDate1">{{ $t('lbl_TransDate_0') }}</span>
          </td>
          <td style="width: 10%">
            <input
              v-model="form.transDateCheck"
              type="checkbox"
              name="chkTransDate"
            />
          </td>

          <td style="width: 5%">
            <span id="IsBad1">{{ $t('lbl_IsBad_0') }}</span>
          </td>
          <td style="width: 10%">
            <input v-model="form.isBadCheck" type="checkbox" name="chkIsBad" />
          </td>

          <td style="width: 5%">
            <span id="RackNO1">{{ $t('lbl_RackNO_0') }}</span>
          </td>

          <td style="width: 10%">
            <input
              v-model="form.rackNoCheck"
              type="checkbox"
              name="chkRackNO"
            />
          </td>
        </tr>
        <tr style="height: 35px">
          <td>
            &nbsp;
            <span id="ItemTypeID1">{{ $t('lbl_ItemType_0') }}</span>
          </td>
          <td>
            <input
              v-model="form.itemTypeCheck"
              type="checkbox"
              name="chkItemTypeID"
            />
          </td>

          <td style="width: 5%">
            <span id="OrderType1">{{ $t('lbl_OrderType_0') }}</span>
          </td>

          <td style="width: 10%">
            <input
              v-model="form.orderTypeCheck"
              type="checkbox"
              name="chkOrderType"
            />
          </td>
          <td>
            <span id="OrderNO1">{{ $t('lbl_OrderNO_0') }}</span>
          </td>

          <td>
            <input
              v-model="form.orderNOCheck"
              type="checkbox"
              name="chkOrderNO"
            />
          </td>

          <td>
            <span id="LotNO1">{{ $t('lbl_LotNo_0') }}</span>
          </td>

          <td>
            <input v-model="form.lotNOCheck" type="checkbox" name="chkLotNO" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  props: {
    checkForm: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  data() {
    return {
      form: { itemCodeCheck: true, warehouseCheck: true },
    }
  },
  watch: {
    checkForm: {
      handler(val) {
        this.form = val
      },
      deep: true,
      immediate: true,
    },
  },
}
</script>
<style lang="scss" scoped>
table {
  border-collapse: separate;
  border-spacing: 2px;
  border: 2px solid black;
  background: #ebeff6;
}
</style>
