import cookies from 'vue-cookies'
export default function (context) {
  if (!cookies.get('REFRESH_TOKEN')) {
    return context.redirect(`/${context.app.i18n.locale}${'/login'}`)
  }
  return context.redirect(`/${context.app.i18n.locale}${'/mrp/demand-supply'}`)
}
