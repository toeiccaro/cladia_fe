<template>
  <div>
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <BatchAddSalePriceForm
      ref="salePriceBatchAddForm"
      :key="refreshFormAddInvoiceKey"
      @update-sale-price-data="(data) => (batchAddSalePriceData = data)"
    />
    <div
      v-if="loading"
      class="spinner content d-flex justify-content-center align-items-center"
    >
      <b-spinner
        b-spinner
        style="width: 3rem; height: 3rem"
        label="Loading..."
      ></b-spinner>
    </div>
  </div>
</template>
<script>
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
import { dateFormatYYYY } from '@/utils/utils'
import systemMixins from '@/mixins/system'
import ToolBar from '@/components/UI/ToolBar'
import BatchAddSalePriceForm from '@/components/Sale/SalePrice/Add/BatchAddSalePriceForm'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
export default {
  name: 'SalePriceAdd',
  components: {
    ToolBar,
    BatchAddSalePriceForm,
    BaseValidateMessage,
  },
  mixins: [systemMixins],
  data() {
    return {
      listErrorMessage: [],
      listDetails: [],

      refreshFormAddInvoiceKey: 0,
      listToolBars: [
        {
          key: 'save',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      loading: false,
      batchAddSalePriceData: {},
    }
  },

  methods: {
    handleAction(key) {
      if (key === 'save') {
        return this.handleButtonBatchAdd()
      }
      if (key === 'close') {
        this.$emit('handleShow')
      }
    },
    async handleButtonBatchAdd() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }

        this.listErrorMessage = []

        this.loading = true

        const payload =
          this.$refs.salePriceBatchAddForm.batchSalePriceData || {}

        const convertDateFields = ['effectiveDate']
        const convertToNumberFields = ['fixedValue', 'floatUp']

        for (const field of convertDateFields) {
          if (payload[field]) {
            payload[field] = dateFormatYYYY(new Date(payload[field]))
          }
        }

        for (const field of convertToNumberFields) {
          payload[field] = this.parseStringToFloat(payload[field])
        }

        if (payload.useFloatUp === null) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_SOBatchRule_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }

        const requiredFields = {
          effectiveDate: 'EffectiveDate',
        }

        for (const prop in requiredFields) {
          if (!payload[prop]) {
            this.listErrorMessage.push({
              fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
              text: this.$t('msg_NoInput_0'),
            })
          }
        }

        this.$emit('validation-errors', this.listErrorMessage)

        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }

        const response = await api('batchAddSalePrice', payload)
        const errorCode = response?.data?.response?.status
        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        const validResponse =
          response && response.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          window.alert(this.$t('msg_IsSaved_0'))
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
