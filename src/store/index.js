import { observable, action } from 'mobx'
import Taro from '@tarojs/taro'
import dayjs from 'dayjs'
import req from '../utils/request'
import * as urls from '../constant/apis'


const appid     = 'wx6f28827eb42ae4e7'

// const APP_SERVER         = 'https://gateway.community-sit.easyj.top/'
// const API_SERVER         = 'https://gateway.community-sit.easyj.top/user-center/'

const APP_SERVER         = 'https://gateway.suosihulian.com/'
const API_SERVER         = 'https://gateway.suosihulian.com/user-center/'


const URL_PARAMS         = 'auth/oauth/token?client_id=prod&client_secret=prod&grant_type=password&from=wx_app&'
const URL_LOAD_USER_ADDR = API_SERVER + '/mobile/assets/personal/assetsDetail'
const URL_ADDR_UPDATE    = API_SERVER + '/mobile/assets/personal/updateOne'
const URL_ADDR_BIND      = API_SERVER + '/mobile/assets/personal/saveOne'
const URL_LOAD_RES_ADDR  = API_SERVER + '/mobile/assets/personal/detail'
const URL_SAVE_CONN_INFO = API_SERVER + '/mobile/assets/personal/saveConnectInfo'

const URL_LIST_ORG_HIS   = API_SERVER + '/mobile/assets/outsider/findList'
const URL_LIST_ORG       = API_SERVER + '/mobile/assets/outsider/searchPageList'
const URL_LIST_CLS       = API_SERVER + '/mobile/assets/outsider/resource/searchPageList'
const URL_LIST_EQU       = API_SERVER + '/mobile/assets/outsider/getEquipmentList'
const URL_EQU_BIND       = API_SERVER + '/mobile/assets/outsider/saveEquipment'
const URL_EQU_UPDATE     = API_SERVER + '/mobile/assets/outsider/updateEquipment'


const URL_GET_PHONE      = `${APP_SERVER}external-service/feign/wechat/mini/user/phoneNumber`
const URL_SWITCH_USER    = APP_SERVER + 'user-center/switch/school'



const jstoken=(e,mobile) =>{ return `${APP_SERVER}${URL_PARAMS}appId=${appid}&mobile=${mobile}&code=${e}` }
const aptoken=(i,j,k) =>{ return `${APP_SERVER}${URL_PARAMS}orgId=${i}&userId=${j}&userType=${k}` }


const empty = {dataSource:[]}
const check = (r,c)=>{
  if (r.data.code===0) {
    // console.log(r)
    return r.data.data
  }else{
    Taro.atMessage({ "message": `${r.data.msg}`, "type": "error" })
    return empty
  }
}
const checkP = (r,c)=>{
  if (r.data.code===0) {
    return r.data
  }else{
    Taro.atMessage({ "message": `${r.data.msg}`, "type": "error" })
    return empty
  }
}

class mainStore {

  token = null;
  scanRid = null;
  scanOid = null;
  scanTo  = null;
  userList = { emp:[], out:[], role: null } ;
  role  = { emp: {sel: false, id: 0}, out: { sel:true , id: 0} }

  getToken = ( ) =>{ return this.token }
  getUser  = ( ) =>{ return this.userList }
  getRole  = ( ) =>{ return this.role }
  setRole  = (r) =>{ this.role = r}
  setScanRid= (r) =>{ this.scanRid = r }
  getScanRid= (r) =>{ return this.scanRid }
  setScanOid= (r) =>{ this.scanOid = r }
  getScanOid= (r) =>{ return this.scanOid }
  setScanTo = (r) =>{ this.scanTo = r }
  getScanTo = (r) =>{ return this.scanTo }


  


  getCurUser = () =>{
    if (this.role.emp.sel) {
      let id = this.role.emp.id
      return this.userList.emp[id]
    }else{
      let id = this.role.out.id
      return this.userList.out[id]
    }
  }

  initToken = (r) => { return `${r.tokenHead}${r.accessToken}` }
  
   // 微信用户登录取 code
  weLogin = async () => {
    return new Promise ( resolve => {
      Taro.login({ 
        success: res => { resolve(res.code) },
        fail:    err => { console.log(err) }
      })
    })
  }

  getPhone = async(code,enc,iv) =>{
    let params = {
      code: code,
      iv: iv,
      appId: appid,
      encryptedData: enc
    }
    console.log(params)
    let r = await req.post(URL_GET_PHONE,params,this.token)
    console.log(r)
    return r.data
  }


  init = async(mobile) => {
    let code   = await this.weLogin()
    let ret    = await req.get(jstoken(code,mobile))
    if (ret.data.code!==0) {
      Taro.atMessage({ 'message':ret.data.msg, 'type':'error' })
      return null
    }
    this.token = this.initToken(ret.data.data)
    let r = await req.get(URL_SWITCH_USER,'',this.token)
    let list = check(r,100)
    // console.log(list)

    list.map((item,i)=>{
      switch(item.userType) {
        // case 'employee': u.emp.push(item);break;
        case 'outsider': this.userList.out.push(item);break;
      }
    })

    return this.userList.out[0]
  }

  switch = async(e) => {
    let url = aptoken(e.orgId,e.userId,e.userType)
    let r = await req.get(url)
    this.token = this.initToken(r.data.data)
    // console.log(this.token)
  }


  listResHis = async () =>{
    let r = await req.get(URL_LIST_RES_HIS,'',this.token)
    return check(r,101)
  }

  listRes = async (params) =>{
    let r = await req.get(URL_FIND_RES,params,this.token)
    return check(r,102)
  }

  loadHsAddr = async (params) =>{
    let r = await req.get(URL_LOAD_USER_ADDR,null,this.token)
    return check(r,103)
  }


  addrUpdate =async(params)=>{
    let r = await req.post(URL_ADDR_UPDATE,params,this.token)
    return check(r,104)
  }
  
  addrBind =async(params)=>{
    let r = await req.post(URL_ADDR_BIND,params,this.token)
    return check(r,105)
  }


  loadResAddr = async (params) =>{
    let r = await req.get(URL_LOAD_RES_ADDR,params,this.token)
    return check(r,106)
  }


  saveConnInfo =async(params)=>{
    let r = await req.post(URL_SAVE_CONN_INFO,params,this.token)
    return check(r,107)
  }
  
  
  /* --- 维护人员接口    --- */

  //查询历史维护记录
  listOrgHis= async (params) =>{
    let r = await req.get(URL_LIST_ORG_HIS,params,this.token)

    return check(r,201)
  }

  //查询学校
  listOrg = async (params) =>{
    let r = await req.get(URL_LIST_ORG,params,this.token)
    return check(r,202)
  }

  //查询教室
  listCls = async (params) =>{
    let r = await req.get(URL_LIST_CLS,params,this.token)
    return check(r,203)
  }

  listEqu = async (params) => {
    let r = await req.get(URL_LIST_EQU,params,this.token)
    return check(r,204)
  }

  // 绑定资源
  equBind = async (params) =>{
    let r = await req.post(URL_EQU_BIND,params,this.token)
    return checkP(r,205)
  }

  // 更新资源
  equUpdate = async (params) =>{
    let r = await req.post(URL_EQU_UPDATE,params,this.token)
    return checkP(r,206)
  }



  /* --- 本地缓存接口    --- */
  loadPhone =()=> {
    try {
      var value = Taro.getStorageSync('BLE_USER_PHONE')
      if (value) {
        return value
      }
    } catch (e) {
      console.log('获取本地手机失败')
    }
  }

  savePhone = (v) =>{
    try {
      Taro.setStorageSync('BLE_USER_PHONE', v)
      console.log('save',v)
    } catch (e) { 
      console.log('保存本地手机失败')
    }
  }

}


export default new mainStore()

