export default {
  computed: {
    tableDigitColumns() {
      return [
        {
          name: 'NO.', // FIXME: i18n
          fieldName: 'Id',
          fieldOrder: 1,
          fieldWide: '10%',
          align: 'center',
        },
        {
          gridName: 'SystemConfigDigit',
          fieldName: 'KeyName',
          name: this.$t('lbl_Name_0'),
          fieldOrder: 2,
          hidden: false,
          align: 'center',
        },
        {
          gridName: 'SystemConfigDigit',
          fieldName: 'Digit',
          filter: 'input',
          name: this.$t('lbl_DigitLength_0'),
          fieldOrder: 3,
          hidden: false,
          align: 'right',
        },
        {
          gridName: 'SystemConfigDigit',
          fieldName: 'CalculTypeId',
          name: this.$t('lbl_CalculType_0'),
          fieldOrder: 4,
          hidden: false,
        },
      ]
    },

    tableBillColumns() {
      return [
        {
          name: 'NO.', // FIXME: i18n
          fieldName: 'BillID',
          fieldOrder: 1,
          fieldWide: '8%',
          align: 'center',
        },
        {
          gridName: 'SystemConfigBill',
          fieldName: 'BillName',
          name: this.$t('lbl_BillName_0'),
          fieldOrder: 2,
          hidden: false,
          align: 'center',
        },
        {
          gridName: 'SystemConfigBill',
          fieldName: 'PrefixCode',
          name: this.$t('lbl_PrefixCode_0'),
          fieldOrder: 3,
          hidden: false,
        },
        {
          gridName: 'SystemConfigBill',
          fieldName: 'BillPrefix',
          name: this.$t('lbl_Falg_0'),
          fieldOrder: 4,
          hidden: false,
        },
        {
          gridName: 'SystemConfigBill',
          fieldName: 'BillFormat',
          name: this.$t('lbl_BillFormat_0'),
          fieldOrder: 5,
          hidden: false,
        },
        {
          gridName: 'SystemConfigBill',
          fieldName: 'SerialNumber',
          name: this.$t('lbl_SerialNumber_0'),
          fieldOrder: 6,
          hidden: false,
          align: 'right',
        },
        {
          gridName: 'SystemConfigBill',
          fieldName: 'CurrentCode',
          name: this.$t('lbl_CurrentCode_0'),
          fieldOrder: 7,
          hidden: false,
          align: 'center',
        },
      ]
    },

    calculateTypeOptions() {
      return [
        {
          text: this.$t('cmb_CalculType_1'),
          value: 1,
        },
        {
          text: this.$t('cmb_CalculType_2'),
          value: 2,
        },
        {
          text: this.$t('cmb_CalculType_3'),
          value: 3,
        },
      ]
    },
    companyCodeOptions() {
      return [
        {
          text: '',
          value: 0,
        },
        {
          text: this.$t('cmb_Billprefix_1'),
          value: 1,
        },
        {
          text: this.$t('cmb_Billprefix_2'),
          value: 2,
        },
      ]
    },
    billFormatOptions() {
      return [
        {
          text: '',
          value: '',
        },
        {
          text: 'YY',
          value: 'YY',
        },
        {
          text: 'YYYY',
          value: 'YYYY',
        },
        {
          text: 'YMDD',
          value: 'YMDD',
        },
        {
          text: 'YMMDD',
          value: 'YMMDD',
        },
        {
          text: 'YYM',
          value: 'YYM',
        },
        {
          text: 'YYMM',
          value: 'YYMM',
        },
        {
          text: 'YYMDD',
          value: 'YYMDD',
        },
        {
          text: 'YYMMDD',
          value: 'YYMMDD',
        },
        {
          text: 'YYYYM',
          value: 'YYYYM',
        },
        {
          text: 'YYYYMM',
          value: 'YYYYMM',
        },
        {
          text: 'YYYYMDD',
          value: 'YYYYMDD',
        },
        {
          text: 'YYYYMMDD',
          value: 'YYYYMMDD',
        },
      ]
    },
  },
}
