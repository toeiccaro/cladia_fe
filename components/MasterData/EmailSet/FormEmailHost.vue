<template>
  <div class="form-email-host mb-2 py-2">
    <table cellspacing="0" cellpadding="0" class="edit">
      <tbody>
        <tr class="d-flex justify-start form__row">
          <td class="label">
            <span>{{ $t('lbl_EmailHost_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.emailHost" />
          </td>
          <td class="info"></td>

          <td class="label">
            <span>{{ $t('lbl_Port_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.port" />
          </td>
          <td class="info"></td>

          <td class="label">
            <span>{{ $t('lbl_Email_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.email" />
          </td>
          <td class="info"></td>

          <td class="label">
            <span>{{ $t('lbl_LoginPwd_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.pwd" type="password" readonly />
          </td>
          <td class="info"></td>

          <td class="label">
            <span>{{ $t('lbl_IsEnable_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.isEnable" type="checkbox" />
          </td>
          <td class="info"></td>

          <td class="input">
            <input
              type="button"
              class="px-1"
              :value="$t('btn_btnUpdateRow_0')"
              @click="updateEmailSet"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr class="d-flex justify-start form__row mt-1">
          <td class="label">
            <span>{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td class="textarea">
            <textarea v-model="form.memo" rows="2" />
          </td>
          <td class="info"></td>
          <td class="info"></td>
          <td class="info"></td>
          <td class="info"></td>
          <td class="info"></td>
          <td rowspan="6" colspan="1" class="row-span"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import api from '@/api/api'
import { SERVER_RESPONSE_CODE } from '~/constants'
export default {
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: {},
      loading: false,
    }
  },
  watch: {
    data: {
      deep: true,
      immediate: true,
      handler(value) {
        this.form = value
      },
    },
    loading: {
      handler(data) {
        this.$emit('setLoading', data)
      },
    },
  },
  methods: {
    async updateEmailSet() {
      try {
        this.loading = true
        const payload = {
          ...this.form,
        }
        const res = await api('updateEmailSet', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK

        if (validResponse) {
          this.$emit('refetchEmailHostData')
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

<style scoped>
.form-email-host {
  border: 1px solid #5180d8;
}
.label {
  min-width: fit-content !important;
}
.input,
.textarea {
  display: flex;
  min-width: fit-content;
}
.form__row {
  gap: 7px;
}

.textarea,
textarea {
  width: 100%;
}

textarea {
  border: 1px solid #aaa;
}

input[type='button'] {
  background: #e0dee5 !important;
  border-radius: 2px;
}
</style>
