<template>
  <div class="add-form">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-1">
          <td class="label">
            <span id="OrderNumber">{{ $t('lbl_OrderNO_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              :value="invoiceData.invoiceNo"
              disabled
              name="txtOrderNumber"
              type="text"
              required
            />
          </td>
          <td class="info"></td>

          <td class="label">
            <span id="OrderDate">{{ $t('lbl_OrderDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              :value="invoiceData.orderDate"
              typeable
              format="yyyy-MM-dd"
              input-class="input__orderDate"
              :highlighted="highlighted"
            ></datepicker>
          </td>
          <td class="info"></td>

          <td class="label">
            <span id="InvoiceCode">{{ $t('lbl_InvoiceCode_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              :value="invoiceData.invoiceCode"
              name="txtInvoiceCode"
              type="text"
              required
              disabled
            />
          </td>
          <td class="info"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'InformationRow',
  props: {
    invoiceData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      highlighted: {
        dates: [new Date()],
      },
    }
  },
}
</script>

<style lang="scss" scoped>
.add-form {
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
      border: 1px solid #aaa;
      padding-top: 2px;
      padding-bottom: 2px;
    }
    td.label {
      padding: 2px;
    }
    td.input {
      padding: 2px;
      .select {
        font-size: 12px;
        border: 1px solid #aaa;
        background-color: #fff !important;
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
</style>
