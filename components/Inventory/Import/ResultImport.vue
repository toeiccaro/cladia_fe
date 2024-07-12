<template>
  <div style="overflow: auto; width: 100%; height: calc(100% - 130px)">
    <div>
      <table
        class="grid_detail"
        cellspacing="0"
        style="width: 1860px; border-collapse: collapse"
      >
        <tbody>
          <tr>
            <th
              v-for="(item, index) in headers"
              :key="index"
              scope="col"
              :class="`th-${index}`"
            >
              {{ item }}
            </th>
          </tr>
          <template v-if="dataImport.length === 0">
            <tr>
              <td align="left" colspan="15" style="height: 250px">
                {{ $t('msg_InputDetails_0') }}
              </td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="(item, index) in dataImport" :key="index" class="hover">
              <td align="left">{{ convertDateTime(item.transDate) }}</td>
              <td align="left">{{ checkStringNull(item.orderType) }}</td>
              <td align="left">{{ checkStringNull(item.orderNo) }}</td>
              <td align="left">{{ checkStringNull(item.itemCode) }}</td>
              <td align="left">{{ item.itemName }}</td>
              <td align="left">
                {{ makeFormatNumberWithCommas(item.quantity) }}
              </td>
              <td align="left">
                {{ checkStringNull(item.unit) }}
              </td>
              <td align="left">{{ makeFormatNumberWithCommas(item.price) }}</td>
              <td align="left">
                <input v-model="item.isBad" type="checkbox" name="chkIsBad" />
              </td>
              <td align="left">{{ checkStringNull(item.rackNo) }}</td>
              <td align="left">{{ (item.lotNo) }}</td>
              <td align="left">{{ checkStringNull(item.wareHouse) }}</td>
              <td align="left">{{ checkStringNull(item.departMent) }}</td>
              <td align="left">{{ checkStringNull(item.reason) }}</td>
              <td align="left">{{ checkStringNull(item.memo) }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import dateTime from '@/mixins/dateTime'
import { formatNumberWithCommas } from '~/utils/utils'
import systemMixins from '@/mixins/system'

export default {
  mixins: [dateTime, systemMixins],
  props: {
    listDetails: {
      type: Array,
      required: false,
      default: () => [],
    },
  },

  data() {
    return {
      headers: [
        this.$t('lbl_TransDate_0'),
        this.$t('lbl_OrderType_0'),
        this.$t('lbl_OrderNO_0'),
        this.$t('lbl_ItemCode_0'),
        this.$t('lbl_ItemName_0'),
        this.$t('lbl_Quantity_0'),
        this.$t('lbl_Unit_0'),
        this.$t('lbl_Price_0'),
        this.$t('lbl_IsBad_0'),
        this.$t('lbl_RackNO_0'),
        this.$t('lbl_LotNo_0'),
        this.$t('lbl_Warehouse_0'),
        this.$t('lbl_Department_0'),
        this.$t('lbl_Reason_0'),
        this.$t('lbl_Memo_0'),
      ],
      dataImport: [],
    }
  },
  watch: {
    listDetails: {
      handler(val) {
        this.dataImport =
          val.length > 0 ? JSON.parse(JSON.stringify(val)) : this.dataImport
      },
    },
  },
  created() {
    if (this.listDetails.length > 0) {
      this.dataImport = JSON.parse(JSON.stringify(this.listDetails))
    }
  },
  methods: {
    makeFormatNumberWithCommas(number) {
      return formatNumberWithCommas(number)
    },
    convertDateTime(date) {
      return date ? this.convertDate(date) : ''
    },
    checkStringNull(text) {
      return !text || text === 'null' || text === null ? '' : text
    },
  },
}
</script>
<style lang="scss" scoped>
.grid_detail {
  width: 100%;
  border-collapse: collapse;
  th {
    padding: 4px 3px 4px 3px;
    background-color: #bcdbf3;
    width: fit-content;
  }
  td {
    padding: 4px 3px 4px 3px;

    &.delete {
      width: 50px;
      span {
        cursor: pointer;
        color: blue;
        text-decoration: underline;
      }
    }
  }
  tr.alter {
    background-color: #f6fbfe;
  }
  tr.hover:hover {
    background: #d4e7f5;
  }
}
</style>
