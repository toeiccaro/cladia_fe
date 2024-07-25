<template>
  <div class="detail-panel">
    <div class="wrapper-table">
      <table class="grid_detail" cellspacing="0">
        <tbody>
          <tr>
            <th class="th-0"></th>
            <th
              v-for="(item, index) in headers"
              :key="index"
              align="left"
              scope="col"
              :class="`th-${index}`"
            >
              {{ item }}
            </th>
          </tr>
          <template v-if="dataImport.length === 0">
            <tr class="hover">
              <td align="left" colspan="10" style="height: 100px">
                {{ $t('msg_InputDetails_0') }}
              </td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="(item, index) in dataImport" :key="index" class="hover">
              <td align="left" class="delete">
                <span @click="handleDelete(item.lineID)">x</span>
              </td>
              <td align="left" class="th-0">
                {{ index + 1 }}
              </td>
              <td align="left">{{ item.orderNo }}</td>
              <td align="left">{{ convertDateTime(item.invoiceOrderDate) }}</td>
              <td align="left">{{ convertDateTime(item.deliveryDate) }}</td>
              <td align="left">{{ item.currency }}</td>
              <td align="right">
                {{ makeFormatNumberWithCommas(item.amount) }}
              </td>
              <td align="left">{{ item.editUser }}</td>
              <td align="left">
                {{ convertDateTime(item.editDate) }}
              </td>
              <td align="left">{{ item.orderMemo }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import dateTime from '@/mixins/dateTime'
import { formatNumberWithCommas } from '@/utils/utils'
export default {
  mixins: [dateTime],
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
        'ID',
        this.$t('lbl_OrderNO_0'),
        this.$t('lbl_OrderDate_0'),
        this.$t('lbl_DeliveryDate_0'),
        this.$t('lbl_Currency_0'),
        this.$t('lbl_ARAmount_0'),
        this.$t('lbl_EditUser_0'),
        this.$t('lbl_EditDate_0'),
        this.$t('lbl_MemoDTL_0'),
      ],
      dataImport: [],
    }
  },
  watch: {
    listDetails: {
      handler(val) {
        this.dataImport = val.length > 0 ? JSON.parse(JSON.stringify(val)) : []
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
    handleDelete(lineID) {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        const newData = this.dataImport.filter((item) => item.lineID !== lineID)
        this.dataImport = [...newData]
        this.$emit('changeData', this.dataImport)
      }
    },
    convertDateTime(date) {
      return date ? this.convertDate(date) : ''
    },
  },
}
</script>
<style lang="scss" scoped>
.wrapper-table {
  overflow: auto;
  width: 100%;
}
.grid_detail {
  width: 100%;
  border-collapse: collapse;
  th {
    padding: 4px 3px 4px 3px;
    background-color: #bcdbf3;
    &.th-0 {
      width: 50px;
    }
  }
  td {
    padding: 4px 3px 4px 3px;
    &.td-0 {
      width: 50px;
    }
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
