import Taro from '@tarojs/taro'
import { HTTP_STATUS } from '../constant/status'
import { API_SERVER }  from '../constant/apis'


const logError = (name, action, info) => {
  if (!info) {
    info = 'empty'
  }
  try {
    let deviceInfo = wx.getSystemInfoSync()
    var device = JSON.stringify(deviceInfo)
  } catch (e) {
    console.error('not support getSystemInfoSync api', err.message)
  }
  let time = formatTime(new Date())
  console.error(time, name, action, info, device)
  if (typeof info === 'object') {
    info = JSON.stringify(info)
  }
}
 
// const token = ''
 
export default {
  baseOptions(params, method = 'GET') {
    let { url, data, token } = params
    // console.log('params', params)
    // let contentType = 'application/x-www-form-urlencoded'
    // contentType = params.contentType || contentType
    const option = {
      isShowLoading: false,
      loadingText: '正在加载',
      url: url,
      data: data,
      method: method,
      header: { 'Authorization': token },
      success(res) {
        if (res.statusCode === HTTP_STATUS.NOT_FOUND) {
          return logError('api', '请求资源不存在')
        } else if (res.statusCode === HTTP_STATUS.BAD_GATEWAY) {
          return logError('api', '服务端出现了问题')
        } else if (res.statusCode === HTTP_STATUS.FORBIDDEN) {
          return logError('api', '没有权限访问')
        } else if (res.statusCode === HTTP_STATUS.SUCCESS) {

          return res.data
        }
      },
      error(e) {
        logError('api', '请求接口出现问题', e)
      }
    }
    // console.log('option', option)
    return Taro.request(option)
  },
  get(url, data = '', token='') {
    // console.log('token: ', token)
    let option = { url, data, token }
    return this.baseOptions(option)
  },
  post: function (url, data, token='') {
    let params = { url, data, token }
    return this.baseOptions(params, 'POST')
  }
}