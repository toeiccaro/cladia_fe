import axios from 'axios'
export default async (context, locale) => {
  const post = await axios.get(`${process.env.BASE_URL}i18n/${locale}`)
  return await Promise.resolve(post.data).catch({})
}
