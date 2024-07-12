<template>
  <div class="form-edit-password">
    <table cellspacing="0" cellpadding="0" class="edit">
      <tbody>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_LoginName_0') }}</span>
          </td>
          <td class="input">
            <input
              ref="inputLoginName"
              v-model="form.loginName"
              v-auto-focus
              type="text"
              required
              :disabled="isAdmin"
            />
          </td>
          <td class="info">*</td>
          <td class="label">&nbsp;</td>
          <td rowspan="6" colspan="1" class="row-span"></td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_EmployeeName_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.employeeId"
              :options="listEmployeeName"
              class="select"
              :disabled="isAdmin"
            ></b-form-select>
          </td>
          <td class="info">*</td>
          <td class="label">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_LoginPwd_0') }}</span>
          </td>
          <td class="input">
            <div class="wrap-input-pwd" :class="{ disabled: isAdmin }">
              <input
                v-if="isShowPassword"
                v-model="form.loginPwd"
                type="text"
                :disabled="isAdmin"
              />
              <input
                v-else
                v-model="form.loginPwd"
                type="password"
                :disabled="isAdmin"
              />
              <div class="eye-pwd" @click="toggleShow">
                <b-icon-eye-slash v-if="isShowPassword"></b-icon-eye-slash>
                <BIconEye v-else> </BIconEye>
              </div>
            </div>
          </td>
          <td class="info">*</td>
          <td class="label">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_UserGroupName_0') }}</span>
          </td>
          <td class="input">
            <multiselect
              v-model="listUserSelected"
              :options="listUserGroupOptions"
              :searchable="true"
              :multiple="true"
              :preserve-search="true"
              track-by="text"
              label="text"
              :close-on-select="false"
              :show-labels="false"
              :placeholder="''"
              class="multi-select-user"
              :disabled="isAdmin"
            >
              <template slot="selection" slot-scope="{ values, isOpen }"
                ><span
                  v-if="values.length && !isOpen"
                  class="multiselect__single"
                  >{{ values.length }} {{ $t('lbl_OptionSelected_0') }}</span
                ></template
              >

              <template slot="option" slot-scope="props">
                <input
                  v-model="form.userGroupID"
                  type="checkbox"
                  :value="props.option.value"
                  class="checkbox"
                />
                <span class="option-text">{{ props.option.text }}</span>
              </template>
            </multiselect>
          </td>
          <td class="info">*</td>
          <td class="label">&nbsp;</td>
        </tr>
        <tr>
          <td class="label"></td>
          <td class="input">
            <div class="wrap-select-checkbox">
              <div
                v-for="item in listUserSelected"
                :key="item.value"
                class="select-item"
              >
                <span
                  class="text"
                  @click="handleRedirectSecurity(item.isSave, item.value)"
                  >{{ item.text }}</span
                >
                <span
                  v-if="!isAdmin"
                  class="delete-item"
                  @click="removeItemSelected(item.value)"
                  >(x)</span
                >
              </div>
            </div>
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_IsEnable_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.enable"
              type="checkbox"
              class="checkbox"
              :disabled="isAdmin"
            />
          </td>
          <td class="info"></td>
          <td class="label">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <!-- FIXME: BE them i18n -->
            <span>Google Account</span>
          </td>
        </tr>
        <tr>
          <td class="label">
            <!-- FIXME: BE them i18n -->
            <span>GoogleName</span>
          </td>
          <td class="input">
            <input v-model="form.googleName" type="text" :disabled="isAdmin" />
          </td>
          <td class="info"></td>
          <td class="label">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <!-- FIXME: BE them i18n -->
            <span>GooglelPwd</span>
          </td>
          <td class="input">
            <input
              v-model="form.googlePwd"
              type="password"
              :disabled="isAdmin"
            />
          </td>
          <td class="info"></td>
          <td class="label">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.memo" type="text" :disabled="isAdmin" />
          </td>
          <td class="info"></td>
          <td class="label">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_EditUser_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.editUser" disabled />
          </td>
          <td class="info"></td>
          <td class="label">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_EditDate_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.editDate" disabled />
          </td>
          <td class="info"></td>
          <td class="label">&nbsp;</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import { BIconEye, BIconEyeSlash } from 'bootstrap-vue'
import Multiselect from 'vue-multiselect'
import api from '@/api/api'

export default {
  components: { BIconEye, BIconEyeSlash, Multiselect },
  layout: 'default',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      highlighted: {
        dates: [new Date()],
      },
      form: {},
      listUserSelected: [],
      listUserSelectedFromAPI: [],
      isShowPassword: false,
      lang: this.$i18n.locale,
      loading: false,
      listEmployee: {},
      listUserGroupConvert: [],
      ADMIN: 1,
    }
  },
  async fetch() {
    try {
      this.loading = true
      await Promise.all([
        this.getUserGroupOptionsFromAPI(this.lang),
        this.getEmployeeList(),
      ])
      this.loading = false
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },

  computed: {
    ...mapGetters({
      userGroupOptions: 'base/getUserGroupOptions',
    }),
    isAdmin() {
      return this.form?.loginID && this.form?.loginID === this.ADMIN
    },
    listEmployeeName() {
      const result = []
      Object.keys(this.listEmployee).forEach((key) => {
        result.push({
          text: this.listEmployee[key],
          value: key,
        })
      })
      return result
    },

    listUserGroupOptions() {
      const clonedUserGroupList = JSON.parse(
        JSON.stringify(this.listUserGroupConvert)
      )
      clonedUserGroupList.shift()
      return clonedUserGroupList
    },
  },
  watch: {
    data: {
      deep: true,
      immediate: true,
      handler(value) {
        this.form = Object.assign({}, this.form, value)
      },
    },
    userGroupOptions: {
      deep: true,
      handler(val) {
        this.listUserGroupConvert = JSON.parse(JSON.stringify(val))
      },
    },
    listUserSelected: {
      handler(value) {
        const listIdSelected = value?.map((item) => item.value)
        this.form.userGroupID = Array.from(new Set(listIdSelected))
      },
    },
    'form.userGroupIDSelected': {
      deep: true,
      handler(value) {
        if (value && value.length > 0) {
          this.listUserSelected = this.listUserGroupConvert
            .filter((item) => value.includes(item.value))
            .map((_el) => {
              _el.isSave = true
              return _el
            })
        }
      },
    },
  },
  created() {
    this.listUserGroupConvert = JSON.parse(
      JSON.stringify(this.userGroupOptions)
    )
  },
  methods: {
    ...mapActions({
      getUserGroupOptionsFromAPI: 'base/getUserGroupOptionsFromAPI',
    }),
    refresh() {
      this.$refs.inputLoginName.focus()
      this.$forceUpdate()
    },
    toggleShow() {
      this.isShowPassword = !this.isShowPassword
    },
    async getEmployeeList() {
      const response = await api('getEmployeeList')
      this.listEmployee = response?.data
    },
    handleRedirectSecurity(isSave, userGroupId) {
      if (isSave && userGroupId && this.form.loginID) {
        this.$router.push(
          this.localePath(
            `/system-maintenance/security?userGroupID=${userGroupId}&loginID=${this.form.loginID}`
          )
        )
      }
    },
    removeItemSelected(userGroupId) {
      this.listUserSelected = this.listUserSelected.filter(
        (item) => item.value !== userGroupId
      )
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vuejs-datepicker.scss';
@import '@/assets/vue-multiselect.scss';
</style>
<style lang="scss" scoped>
::v-deep .multi-select-user > .multiselect__content-wrapper {
  max-height: 190px !important;
}
.row-span {
  width: 50%;
}
select {
  font-size: 12px;
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
    td .checkbox {
      display: flex;
      justify-content: center;
    }
    td input[type='text'] {
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
      .wrap-select-checkbox {
        display: flex;
        flex-direction: column;
        .select-item {
          color: #5180d8;
          .text {
            text-decoration: underline;
            cursor: pointer;
          }

          .delete-item {
            cursor: pointer;
            margin-left: 4px;
          }
        }
      }
      .select {
        height: 20px;
        font-size: 12px;
        border: 1px solid #aaa;
        background-color: #fff;
        border-radius: 2px;
      }
      .wrap-input-pwd {
        display: flex;
        align-items: center;
        border: 1px solid #aaa;
        width: 100%;
        padding: 2px;
        background-color: #fff;
        border-radius: 2px;
        height: 20px;
        input {
          border: none !important;
          height: 100%;
          border-radius: 0 !important;
          &:focus {
            border: none !important;
            outline: none !important;
          }
        }

        .eye-pwd {
          margin-right: 6px;
        }
      }
    }
    td.info {
      padding: 3px;
    }
  }
}
.option-text {
  margin-left: 8px;
}
.checkbox {
  width: 14px !important;
  height: 14px !important;
}
.disabled {
  background: #ebeff6 !important;
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
