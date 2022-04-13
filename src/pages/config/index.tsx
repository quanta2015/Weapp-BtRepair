import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View, Button, Text, Input, Image,Picker } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import { AtMessage, AtActivityIndicator } from "taro-ui";
import {openBle,bleCommand} from '../../utils/bt'
import {fspc, isN,urlParams} from '../../utils/fn'
import SwitchRole from '../../component/switchrole' 
import Modal  from '../../utils/modal'


import './index.scss'

import icon_load    from '../../static/loading.svg'
import icon_ref_b   from '../../static/refresh_b.svg'
import icon_ref_r   from '../../static/refresh_r.svg'
import icon_search  from '../../static/search.svg'
import icon_return  from '../../static/return.svg'
import icon_user    from '../../static/user.svg'
import icon_house   from '../../static/house.svg'
import icon_scan    from '../../static/scan_b.svg'
import img_info     from '../../static/info.png'
import img_none     from '../../static/none.png'
import icon_seno    from '../../static/icon_seno.svg'
import icon_switch  from '../../static/icon_switch.svg'
import img_lesson   from '../../static/lesson.png'
import bk_org       from '../../static/bk_org.png'
import bk_res       from '../../static/bk_res.png'



// 状态机定义
const STATUS_INIT = 0
const STATUS_ADDR = 1
const STATUS_CLAS = 2
const STATUS_BIND = 3
const STATUS_EDIT = 4
const STATUS_SORG = 5
const STATUS_SCLS = 6
const CMD_SEND_ADDR = 1
const CMD_RSET_CARD = 2

// 资源类型
const typeNameList = ['音响板卡','广告电视']
const typeValList  = ['audio_board','tv']
const getType = (e) => {
  let type 
  typeNameList.map((item,i)=>{ if (item===e) type = typeValList[i] })
  return type
}

const ST_BLE_INIT  = 0
const ST_BLE_CONN  = 1
const ST_BLE_SUCC  = 2
const ST_BLE_FAIL  = 3
const ST_BLE_REST  = 4
const ST_BLE_FINN  = 5
const ST_BLE_REFA  = 6

const MSG_CONN_INIT = '确定要连接，开始上课吗？'
const MSG_CONN_ING  = '设备连接中......'
const MSG_CONN_SUCC = '设备连接成功！'
const MSG_CONN_FAIL = '设备异常，请重启设备恢复或关闭电源重启恢复'
const MSG_CONN_REST = '设备重启中......'
const MSG_CONN_FINN = '设备重启成功'
const MSG_CONN_REFA = '设备重启失败'


var _TIME

@inject('store')
@observer
class Config extends Component {

  constructor(props) {
    super(props)
    this.store = this.props.store.mainStore
    this.state = {
      selOrg: -1,
      selCls: -1,
      selRes: -1,
      selType: 0,
      st_conn: 0,
      count: 5,
      connInfo: '',
      loading: false,
      showConn: false,
      showInfo: false,
      showSwitch: false,
      finishSearch: false,
      status: STATUS_INIT,
      equList: [],
      hisList: [],
      retList: [],
      clsList: [],
      e_code: null,
      e_type: null,
      e_name: null,
      e_id:   null,
      showActivity: false ,
      pageNoR: 1,
      pageNoS: 1,
      totalR: 0,
      totalS: 0,
    }
  }

  initVar =()=> {
    this.setState({
      selOrg: -1,
      selCls: -1,
      selRes: -1,
      selType: 0,
      loading: false,
      showInfo: false,
      showSwitch: false,
      finishSearch: false,
      status: STATUS_INIT,
      equList: [],
      hisList: [],
      retList: [],
      orgList: [],
      e_code: null,
      e_type: null,
      e_name: null,
      e_id:   null,
      showActivity: false ,
      pageNoS: 1,
      pageNoR: 1,
      totalS: 0,
      totalR: 0,
      keyword: '',
    })
  }


  initData=async()=>{
    this.initVar()
    let userName = this.store.getCurUser().userName
    this.setState({loading: true, userName:userName  })
    let r = await this.store.listOrgHis()
    this.setState({hisList: r.dataSource, loading: false})
  }


  initScan = async() => {
    let scanRid = this.store.getScanRid()
    let scanOid = this.store.getScanOid()
    let scanTo  = this.store.getScanTo()
    let params = { orgId: scanOid, resourceId: scanRid}
    console.log('params',params)
    if (!isN(scanTo)) {
      this.setState({loading: true})
      let r = await this.store.listCls(params)

      console.log(r)
      this.setState({loading: false, showInfo: true, selOrgId:scanOid, selOrgName: "",selResId:scanRid, equList:r.dataSource[0].equipmentList, status: STATUS_CLAS})
    }
  } 


  async componentDidMount () { 
    await this.initData()
    // await this.initScan()
  }


  // 选择资源对象
  doSel = async(e)=>{

    switch(this.state.status) {
      case STATUS_INIT: 
      case STATUS_SORG:
        this.setState({keyword: ''})
        this.searchCls({orgId:e.orgId, keyword:'', pageNo:1, pageSize: 20})
        this.setState({showInfo: true, selOrgId:e.orgId, selOrgName: e.name, status: STATUS_ADDR});break;
      case STATUS_ADDR:
      case STATUS_SCLS:
        this.setState({showInfo: true, selResId:e.id, selClsName:e.resourceName, equList: e.equipmentList, status: STATUS_CLAS});break;
    }   
  }

  // 显示绑定对话框
  doBind =()=>{
    this.setState({
      showInfo:false, 
      e_code:'', 
      e_name:'',
      e_type:typeNameList[0],
      status: STATUS_BIND
    })
  }

  // 扫码二维码
  doScan=()=>{
    let that = this
    wx.scanCode({
      success(res) { that.setState({ e_code: res.result}) }
    })
  }

  doScanInit =async()=>{
    let that = this
    wx.scanCode({
      async success(res) {
        let url = res.result
        let rid = urlParams(url).id
        let oid = urlParams(url).orgId
        that.doScanWork(rid,oid)
        console.log(url)
      }
    })
  }


  doScanWork = async(rid,oid)=>{

    if (!isN(rid)&&!isN(oid)) {
      let params = { orgId: oid, resourceId: rid}
      this.setState({loading: true})
      let r = await this.store.listEqu(params)

      console.log(r)
      let orgName,d,resourceName,equList

      switch(r.errorCode) {
        case null:
          orgName = r.orgName
          resourceName = r.resourceName
          equList = r.equipmentList
          this.searchCls({orgId:oid, keyword:'', pageNo:1, pageSize: 20})
          this.setState({loading: false, showInfo: true, selOrgId:oid, selOrgName:orgName, selResId:rid, selClsName:resourceName, equList:equList, status: STATUS_CLAS})
          break;
        case 30113:
          orgName = r.orgName
          Taro.atMessage({ "message": `${r.message}`, "type": "error" })
          this.searchCls({orgId:oid, keyword:'', pageNo:1, pageSize: 20})
          this.setState({showInfo: true, selOrgId:oid, selOrgName: orgName, status: STATUS_ADDR});
          break;
        case 30511:
          Taro.atMessage({ "message": `${r.message}`, "type": "error" })
          this.setState({loading: false});
          break;
        default:
          Taro.atMessage({ "message": `${r.message}`, "type": "error" })
          this.setState({loading: false});
      }
    }else{
      Taro.atMessage({ 'message':'二维码信息错误', 'type':'error' })
    }
  }

  // 更新类型
  doSelType=(e)=>{
    let id = e.detail.value
    this.setState({ e_type: typeNameList[id], selType:id  })
  }
  // 更新名称
  doChgName=(e)=>{
    let val = fspc(e.target.value)
    this.setState({ e_name: val})
  }
  // 更新地址编码
  doChgCode=(e)=>{
    let val = fspc(e.target.value)
    this.setState({ e_code: val})
  }

  // 显示绑定资源
  doEdit = async(e,i)=>{
    this.setState({ 
      status: STATUS_EDIT, 
      showInfo: false, 
      e_code:e.code, 
      e_type: e.typeDesc, 
      e_name:e.name,
      e_id: e.id,
      selRes: i,
    })
  }

  // 绑定资源
  doBindItem=async()=>{
    let {equList,e_code,e_type,e_name,selType} = this.state

    if (isN(e_code)||isN(e_type)||isN(e_name)) {
      Taro.atMessage({ "message": "请输入信息", "type": "success", })
    }else{
      let params = {
        orgId: this.state.selOrgId,
        resourceId: this.state.selResId,
        code: e_code,
        type: typeValList[selType],
        name: e_name,
      }

      console.log(params)
      this.setState({loading: true})
      let r = await this.store.equBind(params)
      if (r.code===0) {
        let s = await this.store.listOrgHis()
        Taro.atMessage({ 'message':'绑定设备成功', 'type':'success' })
        equList.push(r.data)
        this.setState({ 
          loading: false,
          equList: equList,
          status: STATUS_CLAS, 
          e_code: null,
          e_type: null,
          e_name: null,
          e_id: r.data.id,
          showInfo: true,
          hisList: s.dataSource,
        })
      }else{
        this.setState({ loading: false })
      }
      
    }
  }
  
  // 更新资源
  doChgEqu=async(e,i)=>{ 
    let {e_code,e_name,e_type,selRes,selType,e_id,equList} = this.state
    let params = {
      orgId: this.state.selOrgId,
      resourceId: this.state.selResId,
      code: e_code,
      type: getType(e_type), //typeValList[selType] ,
      name: e_name,
      id: e_id,
    }
    if (isN(e_code)||isN(e_name)) {
      Taro.atMessage({ 'message':' 请输入完整的设备信息！', 'type':'error' })
    }else{
      this.setState({loading: true})
      let r = await this.store.equUpdate(params)
      if (r.code===0) {
        Taro.atMessage({ 'message':'更新设备成功', 'type':'success' })
        equList[selRes].name = e_name
        equList[selRes].code = e_code
        equList[selRes].type = getType(e_type)
        equList[selRes].typeDesc = e_type
        this.setState({ 
          loading: false,
          equList: equList,
          status: STATUS_CLAS, 
          e_code: null,
          e_type: null,
          e_name: null,
          showInfo: true,
        })
      }else{
        this.setState({ loading: false })
      }
    }
  }

  
  // 返回
  doReturn=()=>{
    switch(this.state.status) {
      case STATUS_ADDR: 
        this.setState({status: STATUS_INIT,retList:[], showInfo: false,pageNoS:1 }); break;
      case STATUS_CLAS: 
        console.log(this.state.retList)
        this.setState({status: STATUS_ADDR,pageNoS:1 }); break;
      case STATUS_BIND: 
        this.setState({status: STATUS_CLAS,showInfo: true }); break;
      case STATUS_EDIT: 
        this.setState({status: STATUS_CLAS,showInfo: true }); break;
      case STATUS_SORG: 
        this.setState({status: STATUS_INIT, retList:[], finishSearch:false, pageNoS:1 });break;
      case STATUS_SCLS:
        this.setState({status: STATUS_ADDR, retList:[], finishSearch:false, pageNoS:1 });break;
    }
  }

  // 显示搜索对话框
  doShowSearch=()=>{
    switch(this.state.status) {
      case STATUS_INIT:
        this.setState({status: STATUS_SORG, finishSearch:false});break;
      case STATUS_ADDR:
        this.setState({status: STATUS_SCLS, totalS:0, retList:[], finishSearch:false});break;
    }
  }

  // 搜索
  doSearch=async(e)=>{
    let keyword = fspc(e.detail.value)

    if (isN(keyword)) {
      Taro.atMessage({ 'message':' 请输入搜索关键字', 'type':'error' })
      return
    }
    let u = this.store.getUser()
    let orgId = this.store.getCurUser().orgId
    this.setState({loading: true, finishSearch:true, keyword: keyword, pageNoS:1 })
    if (this.state.status === STATUS_SORG)　{
      let params = { keyword:keyword, orgId: orgId, pageSize:20, pageNo:1 }
      let r = await this.store.listOrg(params)
      console.log(r)
      let total = r.pagination.total
      let page = parseInt(total/r.pagination.pageSize)+1
      this.setState({retList: r.dataSource, loading: false, pageS: page, totalS: total, pageNoR: 1})
    }else{
      let params = { keyword:keyword, orgId:this.state.selOrgId, pageNo: 1, pageSize:20 }
      this.searchCls(params)
    }
  }



  // 搜索教室
  searchCls = async(params) => {
    let { status } = this.state
    console.log(params)
    this.setState({loading: true, pageNoS: 1})
    let r = await this.store.listCls(params)
    console.log(r)
    let total = r.pagination.total
    let page = parseInt(total/r.pagination.pageSize)+1

    switch(status) {
      case STATUS_SORG:
      case STATUS_INIT:
        this.setState({clsList: r.dataSource, loading: false, pageR: page, totalR: total})
        break;
      case STATUS_SCLS:
        this.setState({retList: r.dataSource, loading: false, pageS: page, totalS: total})
        break;

      default:
        this.setState({ loading: false})
    }

  }

  doRepair=(e)=>{ }

  doSwitch = ()=>{
    let u = this.store.getUser()
    this.setState({showSwitch: true,userlist: u })
  }

  doSelRole=async(role,params)=>{
    this.setState({showSwitch: false, loading:true})
    await this.store.switch(params)
    switch(role) {
      case 0: Taro.switchTab({url:`/pages/lesson/index`});break;
      case 1: this.initData();break;
    } 
  }


  onPullDownRefresh =async()=>{
    // let {status, keyword } = this.state
    // if ((status === STATUS_SORG)||(status === STATUS_SCLS)) {
    //   Taro.startPullDownRefresh()
    //   await this.doSearch({detail: {value: keyword}})
    //   Taro.stopPullDownRefresh()
    // }else{
    //   Taro.stopPullDownRefresh()
    // }
  }

  onReachBottom = async() => {
    let {pageNoR,pageNoS, retList, pageR, pageS, keyword, clsList} = this.state

    console.log(pageNoR)
    console.log(pageR)
    console.log(pageNoS)
    console.log(pageS)

    let r
    this.setState({ showActivity: true })
    let orgId = this.state.selOrgId
    

    switch(this.state.status) {
      case STATUS_SORG:
        if (pageNoS+1 <= pageS) {
          let params = { keyword:keyword, orgId: orgId, pageNo:pageNoS+1, pageSize: 20 }
          r = await this.store.listOrg(params); 
          console.log(r)
          retList.push(...r.dataSource)
          this.setState({retList: retList, pageNoS: pageNoS+1 })
        }
        break;
      case STATUS_ADDR:
        if (pageNoR+1 <= pageR) {
          let params = { keyword:'', orgId: orgId, pageNo:pageNoR+1, pageSize: 20 }
          console.log(params)
          r = await this.store.listCls(params); 
          console.log(r)
          clsList.push(...r.dataSource)
          this.setState({clsList: clsList, pageNoR: pageNoR+1 })
        }
        break;
      case STATUS_SCLS:
        if (pageNoS+1 <= pageS) {
          let params = { keyword:keyword, orgId: orgId, pageNo:pageNoS+1, pageSize: 20 }
          r = await this.store.listCls(params); 
          console.log(r)
          retList.push(...r.dataSource)
          this.setState({retList: retList, pageNoS: pageNoS+1 })
        }
        break;
    }

    this.setState({ showActivity: false })
    // if (pageNoR+1 <= page) {
    //   let r
    //   this.setState({ showActivity: true })
    //   let orgId = this.state.selOrgId
    //   let params = { keyword:keyword, orgId: orgId, pageNo:pageNo+1, pageSize: 20 }

    //   switch(this.state.status) {
    //     case STATUS_SORG:
    //       r = await this.store.listOrg(params); 
    //       retList.push(...r.dataSource)
    //       this.setState({retList: retList, pageNoS: pageNo+1,showActivity: false })
    //       break;
    //     case STATUS_ADDR:
    //       r = await this.store.listCls(params); 
    //       clsList.push(...r.dataSource)
    //       this.setState({clsList: clsList, pageNoR: pageNo+1,showActivity: false })
    //       break;
    //     case STATUS_SCLS:
    //       r = await this.store.listCls(params); 
    //       retList.push(...r.dataSource)
    //       this.setState({retList: retList, pageNoS: pageNo+1,showActivity: false })
    //       break;
    //   }

      
    // }
  }


  doTestBle=async(item, e)=>{
    e.stopPropagation()
    let { selOrgId, selResId} = this.state
    this.setState({loading: true })
    let r = await this.store.loadHsAddr()
    let rs = r.dataSource

    console.log(r)
    if (rs.length>0) { 
      let params = { resourceId:selResId, orgId:selOrgId }
      console.log(params)
      
      let r = await this.store.listEqu(params)
      console.log(r)
      let list = r.equipmentList
      if (list.length===0) {
        Taro.atMessage({ 'message': '尚未绑定板卡','type': 'error' })
        this.setState({ loading: false })
      }else{
        let card 
        list.forEach((item,i)=>{
          if (item.type === "audio_board") {
            card = item
          }
        })
        let resourceName = r.resourceName
        let addrCard = card.code
        let addrHdst = rs[0].itemCode
        let command  = bleCommand(addrHdst,addrCard)
        let info = {
          equipmentId: card.id,
          itemId: rs[0].id,
          orgId: r.orgId,
          resourceId: card.resourceId,
          message: 'success',
          status: 'success',
        }
        console.log('command:',command)
        this.setState({ 
          loading: false, 
          showConn: true, 
          connInfo:MSG_CONN_INIT, 
          selClsName: resourceName,
          cmd:command, 
          info:info 
        })
      }
    }else{
      this.setState({showModal: true,loading: false})
    }
  }


  // 显示连接板卡对话框
  doShowConn = async(e) =>{
  }

  // 连接计数器
  doCounter=(e)=>{
    this.setState({count: e})
    _TIME = setInterval(() => { 
      switch(this.state.st_conn) {
        case ST_BLE_SUCC:
          clearTimeout(_TIME);
          break;
        case ST_BLE_CONN:
          if (this.state.count>0) {
            this.setState({ count:(this.state.count-1)})
          }else{
            clearTimeout(_TIME);
            this.setState({ st_conn: ST_BLE_FAIL,connInfo: MSG_CONN_FAIL })
          };
          break;
        case ST_BLE_FAIL:
          if (this.state.count>0) {
            this.setState({ count:(this.state.count-1)})
          }else{
            clearTimeout(_TIME);
          };
          break;
        case ST_BLE_REST:
          if (this.state.count>0) {
            this.setState({ count:(this.state.count-1)})
          }else{
            clearTimeout(_TIME);
            this.setState({ st_conn:ST_BLE_REFA, connInfo: MSG_CONN_REFA })
          };
          break;
      }
    }, 1000)
  }

  // 连接完成写日志
  dolog = async(e)=>{
    let {info} = this.state

    switch(e) {
      case 0: 
        this.setState({ st_conn: ST_BLE_SUCC,connInfo: MSG_CONN_SUCC })
        break;
      case 1:
        this.setState({ st_conn:ST_BLE_FINN, connInfo: MSG_CONN_FINN })
        break;
    }

    let s = await this.store.saveConnInfo(info)
    Taro.atMessage({ 'message':'保存连接信息成功', 'type':'success' })
  }

  // 连接蓝牙板卡
  doConnBleCard = () =>{
    this.setState({ st_conn:ST_BLE_CONN, connInfo: MSG_CONN_ING })
    this.doCounter(5)
    openBle(CMD_SEND_ADDR, this.state.cmd, this.dolog)
  }

  // 重置蓝牙板卡
  doResetCard=()=>{
    this.setState({ st_conn:ST_BLE_REST, connInfo: MSG_CONN_REST })
    this.doCounter(10)
    openBle(CMD_RSET_CARD, null, this.dolog)
  }

  // 关闭 modal 对话框
  doCancel = ()=>{
    this.setState({showConn: false, st_conn: ST_BLE_INIT})
  }

  // 绑定耳机资源
  doBindBle = ()=>{
    this.setState({showModal: false})
    Taro.navigateTo({ url: `/pages/headset/index` })
  }

    // 跳转用户中心
  doGotoUser = ()=>{
    Taro.navigateTo({ url: `/pages/user/index` })
  }


  render () {

    var { userName,status,showInfo,retList,clsList,equList,hisList,showSwitch,showConn,e_name,e_code,e_type,selOrgName,selClsName } = this.state
    const focus = (this.state.finishSearch)?false:true


    hisList=[{name:'杭州师傅大学'}]

    let addr 
    switch(status) {
      case STATUS_INIT: addr = '';break;
      case STATUS_ADDR: addr = (showInfo)?selOrgName:"";break;
      case STATUS_CLAS: addr = (showInfo)?selClsName:"";break;
    }

    console.log(status)
    console.log('clsList',clsList)
    console.log('retList',retList)
    console.log('pageNoS',this.state.pageNoS)
    console.log('pageNoR',this.state.pageNoR)



    return (
      <View className='g-config'>
        <AtMessage/>

        <Modal isOpened={this.state.showModal} title={'提示'} confirmText={'去绑定'}
               content="未绑定耳机，请先绑定耳机"  onConfirm = {this.doBindBle} />

        {(this.state.loading)&&<View className="g-loading"><Image src={icon_load}></Image></View>}


        {((status!== STATUS_BIND)&&(status!==STATUS_EDIT))&&
        <View className="m-hd">
          <Image className="f-icon" src={icon_scan} onClick={this.doScanInit}></Image>
          <View className="m-tl">
            <View>{userName}</View>
          </View>
          <Image className="f-icon-s m-icon-user" src={icon_user} onClick={this.doGotoUser}></Image>
        </View>}

        {((status=== STATUS_BIND)||(status===STATUS_EDIT))&&
        <View className="m-hd">
          <View className="m-return" onClick={this.doReturn}>
            <Image className="f-icon" src={icon_return}></Image>
          </View>
          <View className="m-user">绑定设备</View>
          <Image className="f-icon-s m-icon-user" src={icon_user} onClick={this.doGotoUser}></Image>
        </View>}


        {(status=== STATUS_ADDR)&&
        <View className="m-info">
          <View className="m-wrap">
            
            <View className="m-bk">
              <Image src={bk_org}></Image>
            </View>
            <View className="m-tl">{addr}</View>
            <View className="m-chg org"  onClick={this.doReturn}>
              <Text>更换</Text>
              <Image className="f-icon-s" src={icon_ref_b}></Image>
            </View>
          </View>
        </View>}

        {(status===STATUS_CLAS)&&
        <View className="m-info">
          <View className="m-wrap">
            <View className="m-bk">
              <Image src={bk_res}></Image>
            </View>
            <View className="m-tl">{addr}</View>
            <View className="m-chg res"  onClick={this.doReturn}>
              <Text>更换</Text>
              <Image className="f-icon-s" src={icon_ref_r}></Image>
            </View>
          </View>
        </View>}


        <View className="m-bd">
          {(status===STATUS_INIT)&&<View className="f-tl">快速搜索</View>}

          {((status===STATUS_INIT)||(status==STATUS_ADDR))&&
          <View className="f-search">
            <View className="f-wrap">
              <Image className="f-icon" src={icon_search}></Image>
              <View className="f-input" onClick={this.doShowSearch}>请输入名称进行搜索</View>
            </View>
          </View>}
          
          {(status===STATUS_INIT)&&<View className="f-tl">最近管理的组织</View>}

          {(status==STATUS_INIT)&&
          <View className="m-wrap">
            {hisList.map((item,i)=>
              <View className="f-res" onClick={this.doSel.bind(this,item)}>
                <View className="f-hd">
                  <Image className="f-icon" src={icon_house}></Image>
                </View>
                <View className="f-bd">
                  <View className="f-bud">{item.name}</View>
                  <View className="f-cls">{item.cls}</View>
                </View>
              </View>
            )}
          </View>}


          {((status===STATUS_SORG)||(status===STATUS_SCLS))&&
          <View className="m-sear">
            <View className="f-sear">
              <View className="f-wrap">
                <Image className="f-icon-s" src={icon_search}></Image>
                <Input className="f-input" 
                       placeholder="请输入名称进行搜索"  
                       onConfirm={this.doSearch}
                       confirm-type="search" focus={focus}></Input>
              </View>
              <View className="f-cancel" onClick={this.doReturn}> 取消</View>
            </View>

            {(retList.length!==0)&&
            <View className="m-count">
               搜索到 <Text>{this.state.totalS}</Text> 条相关内容
            </View>}
            {(retList.length!==0)&&
            <View className="m-wrap">
              {retList.map((item,i)=>
                <View className="f-res" onClick={this.doSel.bind(this,item)}>
                  <View className="f-hd">
                    <Image className="f-icon" src={icon_house}></Image>
                  </View>
                  <View className="f-bd">
                    {(status===STATUS_SORG)&& <View className="f-bud">{item.name}</View>}

                    {(status===STATUS_SCLS)&& <View className="f-bud">{item.resourceName}</View>}
                  </View>
                </View>
              )}
            </View>}

            {(retList.length===0)&&
            <View className="m-wrap">
              <View className="m-none">
                <Image src={icon_seno}></Image>
                <Text>暂无匹配记录</Text>
              </View>
            </View>}

            {(this.state.showActivity)&&
            <View className="m-end">
              <AtActivityIndicator></AtActivityIndicator>
            </View>}

            {((this.state.pageNo===this.state.page)&&(retList.length!==0))&&
              <View className="m-end"> ---- 没有更多内容啦 ----</View>}
          </View>}


          {(status==STATUS_ADDR)&&(clsList.length!==0)&&
          <View className="m-count">
             共有 <Text>{this.state.totalR}</Text> 条相关内容
          </View>}

          {(status===STATUS_ADDR)&&
          <View className="m-wrap">
            {clsList.map((item,i)=>
              <View className="f-res" onClick={this.doSel.bind(this,item)}>
                <View className="f-hd">
                  <Image className="f-icon" src={icon_house}></Image>
                </View>
                <View className="f-bd">
                  <View className="f-bud">{item.resourceName}</View>
                </View>
              </View>
            )}
          </View>}


          {(status=== STATUS_CLAS)&& <View className="f-tl">关联设备</View>}


          {(status=== STATUS_CLAS)&&
          <View className="m-ret">

            {(equList.length===0)&&
            <View className="m-wrap">
              <View className="m-none">
                <Image src={img_none}></Image>
                <Text>暂无设备</Text>
              </View>
            </View>}


            {(equList.length!==0)&&
            <View className="m-wrap">
              {equList.map((item,i)=>
                <View className="m-item" onClick={this.doEdit.bind(this,item,i)}>
                  <View className="m-name">{item.name}</View>
                  <View className="m-label">{item.typeDesc}</View>
                  <View className="m-label">{item.code}</View>
                  {(item.type==='audio_board')&&
                  <View className="m-test" onClick={this.doTestBle.bind(this,item)}>测</View>}
                </View>
              )}
            </View>}


            <View className="m-bind" onClick={this.doBind}>
              <Text> 绑定</Text>
              <Text> 设备</Text>
            </View>
          </View>}

    
          {((status=== STATUS_BIND)||(status===STATUS_EDIT))&&
          <View className="g-bind">
            <View className="m-row">
              <View className="m-tl">设备编号</View>
              <View className="m-form">
                <Input placeholder="请输入或扫码" value={e_code} onInput={this.doChgCode} />
                <Image className="f-icon" src={icon_scan} onClick={this.doScan}></Image>
              </View>
            </View>
            <View className="m-row">
              <View className="m-tl">设备类型</View>
              <View className="m-form">
                <Picker mode='selector' range={typeNameList} onChange={this.doSelType}>
                {(this.state.e_type===null)&& <View className='picker'> 请选择：</View>}
                {(this.state.e_type!==null)&&<View className='picker'> {e_type} </View>}
              </Picker>
              </View>
            </View>
            <View className="m-row">
              <View className="m-tl">设备名称</View>
              <View className="m-form">
                <Input placeholder="请输入" onInput={this.doChgName} value={e_name}  />
              </View>
            </View>
            <View className="m-row"></View>

            {(status=== STATUS_BIND)&&
            <View className="m-fun">
              <View className="m-btn" onClick={this.doBindItem}> 绑定设备</View>
            </View>}

            {(status=== STATUS_EDIT)&&
            <View className="m-fun">
              <View className="m-btn" onClick={this.doChgEqu}> 更换设备</View>
              <View className="m-btn" onClick={this.doRepair}> 上报维修</View>
            </View>}

          </View>}
        </View>


        {(showConn)&&
        <View className="g-conn">
          <View className="m-wrap">
            <View className="m-hd">
              {((this.state.st_conn == ST_BLE_INIT)||(this.state.st_conn == ST_BLE_SUCC)||(this.state.st_conn == ST_BLE_FAIL)||(this.state.st_conn===ST_BLE_FINN)||(this.state.st_conn===ST_BLE_REFA))&&
              <Image src={img_lesson} mode="widthFix"> </Image>}

              {((this.state.st_conn == ST_BLE_CONN)||(this.state.st_conn == ST_BLE_REST))&&
              <View className="m-count">{this.state.count}</View>}
            </View>
            
            <View className="m-info">
              <View className="m-cls f-blue">{this.state.selClsName}</View>
              <View className="m-cls">{this.state.connInfo}</View>
            </View>

            {(this.state.st_conn===ST_BLE_INIT)&&
            <View className="m-fun">
              <View className="m-btn" onClick={this.doCancel}>取消</View>
              <View className="m-btn f-blue" onClick={this.doConnBleCard}>确定</View>
            </View>}

            {((this.state.st_conn===ST_BLE_SUCC)||(this.state.st_conn===ST_BLE_FINN)||(this.state.st_conn===ST_BLE_REFA))&&
            <View className="m-fun">
              <View className="m-btn f-blue" onClick={this.doCancel}>确定</View>
            </View>}

            {(this.state.st_conn===ST_BLE_FAIL)&&
            <View className="m-fun">
              <View className="m-btn" onClick={this.doCancel}>取消</View>
              <View className="m-btn f-blue" onClick={this.doResetCard}> 重启</View>
            </View>}

          </View>
        </View>}  
      </View>
    )
  }
}

export default Config
