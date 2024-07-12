export default {
  computed: {
    yesNoOptions() {
      return [
        {
          value: '',
          text: '',
        },
        {
          value: 1,
          text: 'Yes',
        },
        {
          value: 0,
          text: 'No',
        },
      ]
    },
    booleanOptions() {
      return [
        {
          value: '',
          text: '',
        },
        {
          value: true,
          text: 'Yes',
        },
        {
          value: false,
          text: 'No',
        },
      ]
    },

    shareTypeOptions() {
      return [
        { text: '', value: 0 },
        { text: this.$t('cmb_ShareType_1'), value: 1 },
        { text: this.$t('cmb_ShareType_2'), value: 2 },
        { text: this.$t('cmb_ShareType_3'), value: 3 },
      ]
    },
  },
  methods: {},
}
