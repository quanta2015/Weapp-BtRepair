// import decode from 'jwt-decode'

const TOKEN_KEY = 'AIRSEN_TOKEN'

export const getToken = () => {
  return wx.getItem(TOKEN_KEY)
}

export const saveToken = (data) => {
  wx.setStorage(TOKEN_KEY, data)
}

export const removeToken = () => {
  window.localStorage.removeItem(TOKEN_KEY)
}

export const decodeToken = () => {
  return null
  // return decode(window.localStorage.getItem(TOKEN_KEY))
}




export default { getToken, saveToken, removeToken, decodeToken }