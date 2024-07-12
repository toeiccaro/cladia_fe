<template>
  <div class="login bg-neutral-50 font-size" :class="{ 'bg-slate-900': dark }">
    <div class="col-lg-8 col-md-6 card-img">
      <div class="width-100 d-flex">
        <img
          src="@/static/cladia_logpic.png"
          alt="Clàdia"
          class="login-logo width-100"
        />
      </div>
    </div>
    <b-form
      id="card_login"
      class="form col-lg-4 col-md-4 card-login pb-4 pb-md-0"
      autocomplete="on"
      @submit.prevent="postLogin"
    >
      <div class="login__wrapper pa-3">
        <div class="d-flex align-items-center mb-3">
          <label
            class="input-title text-nowrap p-0 col-4 text-gray-900 dark:text-gray-300"
            >{{ $t('lbl_UserLogin_0') }}
          </label>
        </div>
        <div
          class="d-flex align-items-center card-input mb-3 d-flex justify-between"
        >
          <label
            class="input-label p-0 col-4 text-gray-900 dark:text-gray-300 app__body--tiny"
          >
            {{ $t('lbl_CompanyCode_0') }}
          </label>
          <b-form-input
            v-model="user.companyCode"
            required
            type="text"
            class="base-input height-input"
            @change="$store.commit('login/SET_COMPANY_CODE', user.companyCode)"
          />
        </div>
        <div
          class="d-flex align-items-center card-input mb-3 d-flex justify-between"
        >
          <label
            class="input-label p-0 col-4 text-gray-900 dark:text-gray-300 app__body--tiny"
          >
            {{ $t('lbl_UserName_0') }}
          </label>
          <input
            v-model="user.username"
            name="username"
            type="text"
            class="form-control base-input height-input"
            autocomplete="username"
            @change="$store.commit('login/SET_USERNAME', user.username)"
          />
        </div>
        <div
          class="d-flex align-items-center card-input mb-3 d-flex justify-between"
        >
          <label
            class="input-label p-0 col-4 text-gray-900 dark:text-gray-300 app__body--tiny"
          >
            {{ $t('lbl_LoginPwd_0') }}</label
          >
          <b-form-input
            v-model="user.password"
            type="password"
            name="password"
            class="base-input height-input"
            autocomplete="current-password"
            @change="$store.commit('login/SET_PASSWORD', user.password)"
          />
        </div>
        <div
          class="d-flex align-items-center card-input mb-3 d-flex justify-between"
        >
          <label
            class="input-label p-0 col-4 text-gray-900 dark:text-gray-300 app__body--tiny"
          >
            {{ $t('lbl_Langeuage_0') }}
          </label>
          <select
            id="cars"
            v-model="lang"
            name="cars"
            class="select-input w-100"
            @change="getLang(lang)"
          >
            <option
              v-for="(language, index) in langs"
              :key="index"
              :value="language.value"
            >
              {{ language.text }}
            </option>
          </select>
        </div>
        <div
          v-if="isNotInputUserNameAndPassword"
          class="d-flex align-items-center card-input mb-3 d-flex justify-between"
        >
          <label></label>
          <div class="color-red text-center">
            {{ $t('msg_UserPasswordNotInput_0') }}
          </div>
        </div>
        <div
          class="d-flex align-items-center card-input mb-3 d-flex justify-between"
        >
          <label></label>
          <div v-show="hasError" class="color-red text-center">
            {{ $t(errorMessage) }}
          </div>
        </div>
        <div
          class="d-flex align-items-center card-input mb-3 d-flex justify-between"
        >
          <div class="checkbox-input">
            <input
              id="isRememberPassword"
              v-model="user.isRememberPassword"
              type="checkbox"
              class="text-gray-900 dark:text-gray-300 text-nowrap"
              name="is-remember"
            />
            <span class="text-gray-900 dark:text-gray-300">
              {{ $t('lbl_RememberPwd_0') }}</span
            >
          </div>
          <b-button class="base-button w-100" type="submit">
            {{ $t('btn_btnLogin_0') }}
          </b-button>
        </div>
      </div>
    </b-form>
    <BaseLoading v-if="loading"> </BaseLoading>
  </div>
</template>
<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import cookies from 'vue-cookies'
import api from '@/api/api'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import { SERVER_RESPONSE_CODE } from '@/constants'
export default {
  name: 'Login',
  components: {
    BaseLoading,
  },
  layout: 'auth',
  middleware: 'notAuthenticated',
  data() {
    return {
      user: {
        companyCode:
          this.$store.state.login.companyCode || cookies.get('COMPANY_CODE'),
        username: this.$store.state.login.username,
        password: this.$store.state.login.password,
        isRememberPassword: this.$store.state.login.isRememberPassword,
      },
      langs: [],
      lang: this.$i18n.locale,
      hasError: false,
      errorMessage: '',
      loading: false,
      isNotInputUserNameAndPassword: false,
    }
  },

  async fetch() {
    const res = await axios.get(`${process.env.BASE_URL}language`)
    if (res && res.status === SERVER_RESPONSE_CODE.OK) {
      res?.data?.forEach((element) => {
        this.langs.push({
          text: this.$t(`${element.displayName}`),
          value: element.languageName.toLowerCase(),
        })
      })
    }
  },
  computed: {
    ...mapGetters(['dark']),
  },
  methods: {
    // eslint-disable-next-line require-await
    async postLogin() {
      if (!this.user.username || !this.user.password) {
        this.isNotInputUserNameAndPassword = true
        return
      }
      this.loading = true
      const res = await api('login', this.user)
      this.loading = false
      const errorResponse = res?.data?.response?.data
      if (res && res.status === SERVER_RESPONSE_CODE.OK) {
        cookies.set(
          'COMPANY_CODE',
          this.user.companyCode,
          new Date(
            new Date(res?.data?.expirationTimeToken).getTime() +
              86400 * 365 * 1000 * 10
          )
        )
        cookies.set(
          'JWT_TOKEN',
          res?.data?.accessToken,
          new Date(res.data?.expirationTimeToken)
        )
        cookies.set(
          'REFRESH_TOKEN',
          res?.data?.refreshToken,
          new Date(
            new Date(res.data?.expirationTimeToken).getTime() +
              86400 * 365 * 1000 * 10
          )
        )
        cookies.set(
          'LOGIN_TIME',
          new Date().getTime(),
          new Date(
            new Date(res?.data?.expirationTimeToken).getTime() +
              86400 * 365 * 1000 * 10
          )
        )
        this.$router.push(this.localePath({ path: '/' }))
      } else if (res && errorResponse?.status === 403) {
        this.hasError = true
        this.isNotInputUserNameAndPassword = false
        this.errorMessage = errorResponse?.message
        // window.alert(this.$t(this.errorMessage))
      }
    },
    getLang(lang) {
      this.$router.push(this.switchLocalePath(lang))
    },
  },
}
</script>
<style scoped lang="scss">
.base-button {
  border-radius: 0 !important;
  max-width: 186px;
  margin: 0 !important;
  height: 32px;
  border: solid 1px #bbb;
  margin-top: 10px;
  margin-right: 2px;
  color: #ffffff;
  cursor: pointer;
  background-color: #364d9d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.base-input {
  border-radius: 0;
  max-width: 186px;
  border: solid 1px #b5b8c8;
}
.base-input:focus {
  border: 2px solid #000000;
  outline: none !important;
  border-radius: 4px !important;
  box-shadow: none !important;
}
.login__wrapper {
  width: 370px;
}
.to-header {
  z-index: 2;
}
.login {
  padding: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  top: 50px;
  padding: 100px;
  position: absolute;
  z-index: 10;
  height: 100%;
}
.input-title {
  font-size: 20px;
  font-weight: bold;
}
.form {
  margin: auto;
  height: auto;
  vertical-align: top;
}
.login-logo {
  padding-left: 20px;
  margin: 0 auto;
  padding: 0;
  max-width: 947.41px;
  max-height: 626.88px;
  height: auto;
}
.height-input {
  height: 22px;
  font-size: 12px;
}
.select-input {
  height: 24px;
  font-size: 12px;
  max-width: 186px;
  border: solid 1px #b5b8c8;
}
.checkbox-input {
  font-size: 12px;
  cursor: pointer;
  span {
    font-size: 12px;
    font-weight: bold;
  }
}

.color-red {
  color: red;
}
.bg-neutral-50 {
  background-color: rgb(255, 255, 255);
}

@media screen and (max-width: 850px) {
  .login {
    flex-direction: column;
  }
  .col-md-5 {
    max-width: 75%;
  }
  .col-md-7 {
    max-width: 70%;
  }
}
@media screen and (max-width: 750px) {
  .login {
    flex-direction: column;
  }
  .col-sm-5 {
    max-width: 75%;
  }
  .col-sm-6 {
    max-width: 70%;
  }
}
@media screen and (max-width: 710px) {
  .card-input {
    flex-direction: column;
    align-items: flex-start !important;
    .input-label {
      margin-bottom: 5px;
      white-space: nowrap;
    }
  }
  .card-img {
    flex: none !important;
  }
  .login {
    padding: 50px;
    padding-top: 100px;
  }
  .col-sm-6 {
    max-width: 80%;
  }
}
@media screen and (max-width: 500px) {
  .card-login {
    border-radius: 4px;
    padding-top: 10px;
  }
  .dark_card-login {
    background: #222222 !important;
  }
  .card-input {
    flex-direction: column;
    align-items: flex-start !important;
    .input-label {
      margin-bottom: 3px;
      white-space: nowrap;
    }
  }
  .card-img {
    flex: none !important;
    max-width: 100%;
    padding: 0;
  }
  .login-logo {
    height: 245px;
  }
  .login {
    padding: 0px;
    padding-top: 100px;
  }
}
@media screen and (max-width: 400px) {
  .login {
    padding-top: 140px;
  }
  .login-logo {
    height: 200px;
  }
}
</style>
