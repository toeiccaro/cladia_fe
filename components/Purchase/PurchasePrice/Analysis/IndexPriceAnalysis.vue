<template>
  <div class="h-100">
    <ToolBar
      :list-tools="listToolBars"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr>
          <td class="label">
            <span id="SupplierName">{{ $t('lbl_SupplierName_0') }}</span>
          </td>
          <td class="input position-relative">
            <BaseTypeaheadAutocomplete
              :initial-value="form.supplierId"
              :initial-text="form.supplierName"
              :items="listSupplier"
              @change="(event) => changeSupplier(event)"
            >
            </BaseTypeaheadAutocomplete>
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="CustomerName">{{ $t('lbl_CustomerName_0') }}</span>
          </td>
          <td class="input position-relative">
            <BaseTypeaheadAutocomplete
              :initial-value="form.customerId"
              :initial-text="form.customerName"
              :items="listCustomerName"
              @change="(event) => changeCustomer(event)"
            >
            </BaseTypeaheadAutocomplete>
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="Currency">{{ $t('lbl_Currency_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.currencyId"
              :options="currencyOptions"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="ItemCode">{{ $t('lbl_ItemCode_0') }}</span>
          </td>
          <td class="input position-relative">
            <BaseTypeaheadAutocomplete
              :initial-value="form.itemCode"
              :initial-text="form.itemName"
              :items="listItemCode"
              @change="(event) => changeItemCode(event)"
            >
            </BaseTypeaheadAutocomplete>
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="ItemName">{{ $t('lbl_ItemName_0') }}</span>
          </td>
          <td class="input">
            <input
              id="txtItemName"
              v-model="form.productName"
              name="txtItemName"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td class="label"></td>
          <td class="input"></td>
          <td class="info"></td>
        </tr>
      </tbody>
    </table>
    <TablePriceAnalysis
      :data-header-price="dataHeader"
      :data-table-price="dataTable"
      :total-page="total"
    ></TablePriceAnalysis>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import TablePriceAnalysis from '@/components/Purchase/PurchasePrice/Analysis/TablePriceAnalysis'
import { SERVER_RESPONSE_CODE } from '@/constants'
import ToolBar from '@/components/UI/ToolBar'
import api from '@/api/api'
import { downloadFileExcel } from '@/utils/utils'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete'

export default {
  components: { ToolBar, BaseTypeaheadAutocomplete, TablePriceAnalysis },
  props: {
    listToolBars: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      form: {
        currencyId: '',
        customerId: '',
        itemCode: '',
        language: this.$i18n.locale,
        pageNo: 1,
        pageSize: 30,
        productName: '',
        supplierId: '',
      },
      listSupplierName: [],
      listAllCustomerName: [],
      listItemMaster: [],
      dataTable: [],
      total: 0,
      lang: this.$i18n.locale,
    }
  },
  //  fetch() {
  //   try {
  //     // this.form = cloneDeep(this.getCurrentItemMaster)
  //     // const mapProps = {
  //     //   productName: 'itemName',
  //     // }
  //     // for (const prop in mapProps) {
  //     //   this.form[prop] = this.form[mapProps[prop]]
  //     // }
  //   } catch (err) {
  //     console.error(err)
  //   }
  // },

  computed: {
    ...mapGetters('base', {
      currencyOptions: 'getCurrencyOptions',
    }),
    listSupplier() {
      return this.listSupplierName.map((item) => ({
        text: item.companyName,
        value: item.id,
        appendText: `(${item.companyCode})`,
      }))
    },
    listCustomerName() {
      return this.listAllCustomerName.map((item) => ({
        text: item.companyName,
        value: item.id,
        appendText: `(${item.companyCode})`,
      }))
    },
    listItemCode() {
      return this.listItemMaster?.map((item) => ({
        text: item.key,
        value: item.key,
        appendText: `(${item.itemName})`,
        ...item,
      }))
    },
    dataHeader() {
      return [
        {
          id: 759,
          fieldName: 'ItemCode',
          fieldOrder: '1',
          key: 'itemCode',
          fieldWide: '100',
          labelName: this.$t('lbl_ItemCode_0'),
          gridName: 'ItemViewGrid',
          hidden: false,
          color: '',
        },
        {
          id: 760,
          fieldName: 'ItemName',
          fieldOrder: '2',
          key: 'itemName',
          fieldWide: '100',
          labelName: this.$t('lbl_ItemName_0'),
          gridName: 'ItemViewGrid',
          hidden: false,
          color: '',
        },
        {
          id: 761,
          fieldName: 'POPrice',
          fieldOrder: '3',
          fieldWide: '100',
          key: 'poprice',
          labelName: this.$t('lbl_POPrice_0'),
          gridName: 'ItemViewGrid',
          hidden: false,
          color: 'red',
        },
        {
          id: 762,
          fieldName: 'PurchaseCurrency',
          fieldOrder: '4',
          fieldWide: '100',
          key: 'currencyId',
          labelName: this.$t('lbl_Currency_0'),
          gridName: 'ItemViewGrid',
          hidden: false,
          color: 'red',
        },
        {
          id: 763,
          fieldName: 'PurchaseRate',
          fieldOrder: '5',
          fieldWide: '100',
          key: 'porate',
          labelName: this.$t('lbl_Rate_0'),
          gridName: 'ItemViewGrid',
          hidden: false,
          color: 'red',
        },
        {
          id: 764,
          fieldName: 'PriceConvert',
          fieldOrder: '6',
          fieldWide: '100',
          key: 'poprice_Convert',
          labelName: this.$t('lbl_Price_0'),
          gridName: 'ItemViewGrid',
          hidden: false,
          color: 'red',
        },
        {
          id: 765,
          fieldName: 'SOPrice',
          fieldOrder: '7',
          fieldWide: '150',
          key: 'soprice',
          labelName: this.$t('lbl_SOPrice_0'),
          gridName: 'ItemViewGrid',
          hidden: false,
          color: 'blue',
        },
        {
          id: 766,
          fieldName: 'SaleCurrency',
          fieldOrder: '8',
          fieldWide: '150',
          key: 'socurrencyID',
          labelName: this.$t('lbl_Currency_0'),
          gridName: 'ItemViewGrid',
          hidden: false,
          color: 'blue',
        },
        {
          id: 767,
          fieldName: 'SaleRate',
          fieldOrder: '9',
          fieldWide: '150',
          labelName: this.$t('lbl_Rate_0'),
          gridName: 'ItemViewGrid',
          hidden: false,
          color: 'blue',
        },
        {
          id: 768,
          fieldName: 'PriceSaleConvert',
          fieldOrder: '10',
          fieldWide: '150',
          key: 'soprice_Convert',
          labelName: this.$t('lbl_Price_0') + '[RMB]',
          gridName: 'ItemViewGrid',
          hidden: false,
          color: 'blue',
        },
        {
          id: 769,
          fieldName: 'GP',
          fieldOrder: '11',
          fieldWide: '150',
          key: 'gp',
          labelName: 'G/P',
          gridName: 'ItemViewGrid',
          hidden: false,
          color: 'blue',
        },
      ]
    },
  },
  watch: {
    'form.itemCode': {
      deep: true,
      handler(val) {
        if (val) {
          const result = this.listItemMaster.find(
            (item) => item.itemCode === val
          )
          this.form.itemName = result?.productName
        }
      },
    },
  },
  async created() {
    await Promise.all([
      this.getListCustomerName(),
      this.getCurrencyOptions(this.lang),
      this.getListSupplier(),
      this.getItemCode(),
    ])
  },
  methods: {
    ...mapActions('base', ['getCurrencyOptions']),
    async getItemCode() {
      const res = await api('getItemCode')
      if (res && res.status === SERVER_RESPONSE_CODE.OK) {
        this.listItemMaster = res?.data
      }
    },
    async getListSupplier() {
      const response = await api('getMixedSupplierName', { companyType: 'Supplier,Outward' })
      this.listSupplierName = response.data
    },
    async getListCustomerName() {
      const response = await api('getEnterpriseCustomerNames')
      this.listAllCustomerName = response.data
    },
    changeActiveToolBar(key) {
      if (key === 'queryPrice') {
        this.handleQuery()
      } else if (key === 'exportPrice') {
        this.handleExportExcel()
      } else if (key === 'closePrice') {
        this.$router.push(this.localePath({ path: '/' }))
      }
    },
    async handleQuery() {
      try {
        const params = {}
        for (const property in this.form) {
          if (this.form[property]) {
            params[property] = this.form[property]
          }
        }

        const requiredFields = {
          supplierId: 'NoselectSupplier',
          customerId: 'NoselectCustomer',
        }

        for (const property in requiredFields) {
          if (!params[property]) {
            window.alert(this.$t(`msg_${requiredFields[property]}_0`))
            return
          }
        }

        const response = await api('getPriceAnalysis', params)
        this.dataTable = response.data?.content
        this.total = response.data?.totalPages
      } catch (error) {
        window.alert(error)
      }
    },
    async handleExportExcel() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (confirm) {
        const params = {}
        for (const property in this.form) {
          if (this.form[property]) {
            params[property] = this.form[property]
          }
        }
        const response = await api('exportExcelPriceAnalysis', params)
        if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
          downloadFileExcel(response.data)
        }
      }
    },
    changeCustomer(select) {
      this.form.customerId = select?.value
      this.form.customerName = select?.text
    },
    changeItemCode(select) {
      this.form.itemCode = select?.value
      this.form.itemName = select?.text
    },
    changeSupplier(select) {
      this.form.supplierId = select?.value
      this.form.supplierName = select?.text
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vue-auto-complete.scss';
</style>
<style lang="scss" scoped>
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
</style>
