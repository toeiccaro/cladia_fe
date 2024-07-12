import cookies from 'vue-cookies'
export default function ({ store,app, localePath,redirect }) {
  if (!store.state.locale.localeState) {
    store.commit('locale/SET_LOCALE_STATE', true)
    const locationLanguage = navigator.language
    if (locationLanguage === 'zh-CN') {
      app.i18n.setLocale('chinese_simplified')
    } else if (locationLanguage === 'ja' || locationLanguage === 'ja-JP') {
      app.i18n.setLocale('japanese')
    } else if (locationLanguage === 'vi-VN' || locationLanguage === 'vi') {
      app.i18n.setLocale('english')
    } else if(locationLanguage === 'ko' || locationLanguage === 'ko-KR') {
      app.i18n.setLocale('korean')
    } 
  }
  if (cookies.get('REFRESH_TOKEN')) {
    return redirect(`/${app.i18n.locale}`)
  }
}
