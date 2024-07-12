export default () => ({
  companyCode: localStorage.getItem('companyCode')
    ? JSON.parse(localStorage.getItem('companyCode'))
    : '',
  username: '',
  password: '',
  isRememberPassword: true,
})
