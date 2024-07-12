<template>
  <div class="form-edit-password">
    <table cellspacing="0" cellpadding="0" class="edit">
      <tbody>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_oldPwd_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.oldPassword"
              v-auto-focus
              name="txtEmployeeCode"
              type="password"
              required
            />
          </td>
          <td class="info">*</td>
          <td class="label">&nbsp;</td>
          <td rowspan="6" colspan="1" class="row-span"></td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_newPwd_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.newPassword"
              name="txtEmployeeName"
              type="password"
              required
            />
          </td>
          <td class="info">*</td>
          <td class="label">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_newPwd1_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.passwordAgain"
              name="txtEmployeeName"
              type="password"
              required
            />
          </td>
          <td class="info">*</td>
          <td class="label">&nbsp;</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  layout: 'default',
  data() {
    return {
      highlighted: {
        dates: [new Date()],
      },
      form: {},
      lang: this.$i18n.locale,
    }
  },

  methods: {
    clearData() {
      this.form = {}
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vuejs-datepicker.scss';
</style>
<style lang="scss" scoped>
.row-span {
  width: 50%;
}
.form-edit-password {
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
      padding: 2px;
      border: 1px solid #aaa;
      background-color: #fff;
      border-radius: 2px;
      height: 20px;
    }
    td.label {
      padding: 2px;
    }
    td.input {
      padding: 2px;
    }
    td.info {
      padding: 3px;
    }
  }
}

@media only screen and (max-width: 1550px) {
  .row-span {
    width: 40%;
  }
}
@media only screen and (max-width: 1395px) {
  .row-span {
    width: 30%;
  }
}
@media only screen and (max-width: 1275px) {
  .row-span {
    width: 20%;
  }
}
@media only screen and (max-width: 1115px) {
  .row-span {
    width: 10%;
  }
}
@media only screen and (max-width: 895px) {
  .row-span {
    width: 0%;
  }
}
</style>
