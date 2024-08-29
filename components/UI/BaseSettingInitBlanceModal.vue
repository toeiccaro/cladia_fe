<template>
  <div
    v-if="showModal && !loading"
    class="modal-container"
    :style="{
      width: calculateContainerWidth,
    }"
  >
    <div class="modal-item-master" @click="closeModal"></div>
    <div class="modal-content">
      <div class="bg-cladia d-flex align-items-center justify-content-between">
        <div class="text-white pl-2">{{ $t('lbl_columnset_0') }}</div>
        <div class="text-white pr-2 cursor-pointer" @click="closeModal">x</div>
      </div>
      <ToolBar
        :list-tools="listToolBars"
        @changeActiveToolBar="changeActiveToolBar"
      ></ToolBar>
      <BaseValidateMessage
        :is-error="true"
        :list-error-message="listErrorMessage"
      />
      <div class="base-set-column pl-10 py-10">
        <tr>
          <td class="label">
            <span id="amount">{{ $t('lbl_DWDBankAccount_0') }}</span>
          </td>
          <td class="input">
            <input
              class="w-100 border"
              v-model="form.amount"
              name="amount"
              type="text"
              :disabled="isDisabled"
            />
          </td>
        </tr>
        <tr>
          <td class="label">
            <span id="departmentID">
              {{ $t('lbl_DWDBankName_0') }}
            </span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.bankName"
              :options="currentAsset"
              class="select"
              :disabled="isDisabled"
            ></b-form-select>
          </td>
          <td class="info">*</td>
        </tr>
        <tr>
          <td class="label">
            <span id="departmentID">
              {{ $t('lbl_DWDCurrency_0') }}
            </span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.currencyId"
              :options="currencyOption"
              class="select"
              :disabled="isDisabled"
            ></b-form-select>
          </td>
          <td class="info">*</td>
        </tr>
        <tr>
          <td class="label">
            <span id="startDate">{{ $t('lbl_DWDStartDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              :value="form.startDate ?? this.defaultStartDate"
              typeable
              format="yyyy-MM-dd"
              :disabled="isDisabled"
              input-class="input__orderDate"
              :highlighted="highlighted"
              @input="changeStartDate"
            ></datepicker>
          </td>
          <td class="info">*</td>
        </tr>
      </div>
    </div>
  </div>
  <div
    v-else-if="loading"
    class="spinner content d-flex justify-content-center align-items-center"
  >
    <b-spinner
      b-spinner
      style="width: 3rem; height: 3rem"
      label="Loading..."
    ></b-spinner>
  </div>
</template>

<script>
import { BIconArrowUp, BIconArrowDown } from 'bootstrap-vue'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import { mapGetters, mapActions } from 'vuex'
import ToolBar from '../UI/ToolBar.vue'
import api from '~/api/api'
import BaseTable from '~/components/UI/BaseTable.vue'
import dateTime from '@/mixins/dateTime'
import { getUnique } from '@/utils/utils'
export default {
  name: 'BaseSetColumn',
  // eslint-disable-next-line vue/no-unused-components
  components: {
    BaseTable,
    BIconArrowUp,
    BIconArrowDown,
    ToolBar,
    BaseValidateMessage,
  },
  mixins: [dateTime],
  props: {
    labelMapping: {
      type: Object,
      required: false,
      default: () => {},
    },
    body: {
      type: Object,
      required: false,
      default: () => {},
    },
    fullWidth: {
      type: Boolean,
      default: () => false,
    },

    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      showModal: false,
      listErrorMessage: [],
      listToolBars: [
        {
          key: 'save',
          label: this.$t('btn_btnSave_0'),
          icon: require('@/static/images/save.png'),
        },
        {
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: require('@/static/images/close.png'),
        },
      ],
      data: [],
      ratio: ['40%', '20%', '20%', '20%'],
      header: [
        {
          key: 'FieldText',
          name: this.$t('lbl_FieldText_0'),
        },
        {
          key: 'FieldWide',
          name: this.$t('lbl_Wide_0'),
        },
        {
          key: 'Order',
          name: '表示順',
        },
        {
          key: 'IsHidden',
          name: this.$t('lbl_Hidden_0'),
        },
      ],
      form: {
        startDate: new Date(),
      },
      defaultStartDate:new Date(),
      highlighted: {
        dates: [new Date()],
      },
      lang: this.$i18n.locale,
    }
  },

  computed: {
    ...mapGetters(
      'base',
      {
        currencyOption: 'getCurrencyOptions',
        currentAsset: 'getListCurrentAssets',
      },
      ['getDataColumnHides', 'getStatusExpandSideBar']
    ),
    calculateContainerWidth() {
      if (this.fullWidth) {
        return '100%'
      }

      if (this.getStatusExpandSideBar) {
        return 'calc(100% - 215px)'
      }

      return 'calc(100% - 215px)'
    },
    dataMapping() {
      return this.data.map((item, index) => {
        return {
          FieldText: {
            orderByList: 0,
            value:
              this.labelMapping && this.labelMapping[item.fieldName]
                ? this.labelMapping[item.fieldName]
                : this.$t(`lbl_${item.fieldName}_0`),
            text: 'center',
          },
          FieldWide: {
            orderByList: 1,
            value: item.fieldWide,
            text: 'right',
          },
          Order: {
            orderByList: 2,
            value: index + 1,
            text: 'right',
          },
          IsHidden: {
            orderByList: 3,
            value: item.hidden,
            text: 'center',
            type: 'slot',
          },
        }
      })
    },
  },
  watch: {
    getDataColumnHides: {
      handler(val) {
        if (val && val.length > 0) {
          this.initDataColumn()
        }
      },
    },
    data: {
      handler(value) {
        this.form = value
      },
      deep: true,
      immediate: true,
    },
  },
  created() {},

  async fetch() {
    try {
      await Promise.all([
        this.getListCurrentAssets(this.lang),
        this.getCurrencyOptions(this.lang),
      ])
    } catch (err) {
      console.error(err)
    }
  },

  methods: {
    ...mapActions('base', ['getCurrencyOptions', 'getListCurrentAssets']),
    validateForm() {
      const errors = []
      const dataTable = this.availableListDetails

      const requiredFields = {
        startDate: 'DWDStartDate',
        bankName: 'DWDBankName',
        currencyId: 'DWDCurrency',
      }

      Object.keys(requiredFields).forEach((field) => {
        if (!this.form[field]) {
          errors.push({
            fieldName: this.$t(`lbl_${requiredFields[field]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      })

      this.listErrorMessage = getUnique(errors, 'fieldName')
      if (this.listErrorMessage.length > 0) {
        return
      }

      return {
        dataTableFilter: dataTable,
        payload: this.form,
      }
    },
    changeHidden(event) {},
    async changeActiveToolBar(key) {
      if (key === 'close') {
        return this.closeModal()
      }
      // eslint-disable-next-line no-use-before-define
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }
      const validateInfo = this.validateForm()
      if (validateInfo) {
        const params = {
          amount: this.form.amount,
          startDate: this.form.startDate,
          bankId: this.form.bankName,
          currencyId: this.form.currencyId,
        }
        try {
          this.loading = true
          await api('saveSettingBlance', params)

          const errorCode = response?.data?.response?.message
          
          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
          }
          if (response.status === 200) {
            window.alert(this.$t('msg_IsSaved_0'))
            this.$emit('on-close')
            this.$emit('reloadSet')
            this.showModal = false
          }
        } catch (error) {
          window.alert(this.$t(response?.message))
          console.error(error)
        } finally {
          this.loading = false
        }
      }
    },
    changeStartDate(value) {
      this.form.startDate = this.convertDate(value)
    },

    emitPayload() {
      const payload = {
        startDate: this.form.startDate,
        bankId: this.form.bankName,
        currencyId: this.form.currencyId,
      }
      this.$emit('updatePayload', payload)
    },
    closeModal() {
      this.showModal = false
    },
  },
}
</script>

<style lang="scss" scoped>
.modal-container {
  top: 0;
  position: fixed;
  height: 100vh;
  z-index: 2;

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
  }

  td.info {
    padding: 3px;
    color: red;
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
.modal-item-master {
  position: absolute;
  top: 0;
  left: 0;
  background: rgb(204, 204, 204);
  opacity: 0.6;
  width: 100%;
  height: 100%;
  z-index: 1;
}
input {
  cursor: pointer;
}
.modal-content {
  background-color: white;
  z-index: 2;
  width: 380px;
  height: 420px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid rgb(42, 78, 161);
  padding: 1px;
}
.base-set-column {
  width: auto !important;
  background-color: rgb(236, 239, 246);
}
a.move-arrow:-webkit-any-link {
  color: -webkit-link;
  cursor: pointer;
  text-decoration: underline;
}
</style>
