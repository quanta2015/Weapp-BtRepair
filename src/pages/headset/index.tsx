import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View, Button, Text,Form, Input, Image, Textarea } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import { getCurrentInstance } from '@tarojs/taro'
import { AtMessage } from 'taro-ui'
import {fspc,isN} from '../../utils/fn'
import Modal from '../../utils/modal'
import './index.scss'


import img_none     from '../../static/none.png'
import icon_load    from '../../static/loading.svg'
import icon_scan    from '../../static/scan_b.svg'
import icon_return  from '../../static/return.svg'
import icon_headset from '../../static/icon_headset.svg'



// 状态机定义
var STATUS_INIT = 0
var STATUS_BIND = 1
var STATUS_EDIT = 2


@inject('store')
@observer
class Headset extends Component {

  constructor(props) {
    super(props)
    this.store = this.props.store.mainStore
    this.state = {
      status: STATUS_INIT,
      id: null,
      addr: null,
      remark: '',
      bind: false,
      loading: false,
    }
  }



  async componentDidMount () {
    let params = getCurrentInstance().router.params

    if (params.status === 'bind' ) {
      this.setState({status: STATUS_BIND})
      this.doScan()
    }else{
      this.setState({loading: true})
      let r = await this.store.loadHsAddr()
      let data = r.dataSource
      if (data.length>0) {
        this.setState({
          loading: false,
          bind: true, 
          id:data[0].id, 
          addr:data[0].itemCode, 
          remark:data[0].remark, 
        })
      }else{
        this.setState({loading: false })
      }
    }
  }


  doUpdateItem=async ()=>{
    let {id,addr,remark} = this.state

    let params = {
      id: id,
      itemCode: addr,
      remark: remark,
    }
    console.log(params)

    if (isN(addr)) {
      Taro.atMessage({ 'message':'请输入耳机编号!', 'type':'error' })
    } else {
      this.setState({loading: true})
      let r = await this.store.addrUpdate(params)
      this.setState({loading: false, status: STATUS_INIT})
    }
  }

  doBindItem=async ()=>{
    let {addr,remark} = this.state
    let params = {
      itemCode: addr,
      remark:   remark,
    }
    if (isN(addr)) {
      Taro.atMessage({ 'message':'请输入耳机编号!', 'type':'error' })
    } else {
      this.setState({loading: true })
      let r = await this.store.addrBind(params)
      this.setState({loading: false, status: STATUS_INIT, bind: true, id:r.id})
    }
  }

  doBind=()=>{
    this.setState({status: STATUS_BIND })
  }
  doUnBind=()=>{
    this.setState({status: STATUS_INIT })
  }

  doScan=()=>{
    let that = this
    wx.scanCode({
      success(res) { that.setState({ addr: res.result}) }
    })
  }


  doChgAddr=(e)=>{
    let val = fspc(e.target.value)
    this.setState({ addr: val })
  }

  doChgRemark=(e)=>{
    let val = fspc(e.target.value)

    console.log(val)
    this.setState({ remark:val })
  }

  doEdit=()=>{
    this.setState({status: STATUS_EDIT })
  }
  

  

  render () {
    let { e_code,status,bind,addr,remark,loading } = this.state

    remark = isN(remark)?'':remark.substr(0,32)

    
    
    return (
      <View className="g-headset">
        <AtMessage/>

        {(loading)&&<View className="g-loading"><Image src={icon_load}></Image></View>}


        <View className="m-hd">
          {(status!==STATUS_INIT)&&
          <View className="m-return" onClick={this.doUnBind}>
            <Image className="f-icon" src={icon_return}></Image>
          </View>}

          <View className="m-tl">我的耳机</View>
        </View>

        {(status===STATUS_INIT)&&
        <View className="m-ret">
          {(!bind)&&
          <View className="m-wrap">
            <View className="m-none">
              <Image src={img_none}></Image>
              <Text>暂无设备</Text>
            </View>
            <View className="m-bind" onClick={this.doBind}>绑定设备</View>
          </View>}

          {(bind)&&
          <View className="m-hs" onClick={this.doEdit}>
            <Image className="f-icon" src={icon_headset}></Image>
            <View className="m-tl">{this.state.addr}</View>
            <View className="m-cnt">{this.state.remark}</View>
          </View>}
        </View>}

        {((status===STATUS_BIND)||(status===STATUS_EDIT))&&
        <View className="g-bind">
          <View className="m-row">
            <View className="m-tl">耳机编号</View>
            <View className="m-form">
              <Input placeholder="请输入或扫码" value={addr} onInput={this.doChgAddr} />
              <Image className="f-icon" src={icon_scan} onClick={this.doScan}></Image>
            </View>
          </View>
          
          <View className="m-row m-row-c">
            <View className="m-tl">耳机备注</View>
            <Textarea placeholder="请输入..." maxlength={32} value={remark.substr(0,32)} onInput={this.doChgRemark}></Textarea>
          </View>

          <View className="m-help">
            <View className="m-wrap">绑定操作说明，点击查看 ></View>
          </View>
          
          {(status===STATUS_BIND)&&
          <View className="m-fun">
            <View className="m-btn" onClick={this.doBindItem}> 绑定设备</View>
            <View className="m-btn" onClick={this.doUnBind}>上报维修</View>
          </View>}

          {(status===STATUS_EDIT)&&
          <View className="m-fun">
            <View className="m-btn" onClick={this.doUpdateItem}> 更换设备</View>
          </View>}


        </View>}
      </View>


    )
  }
}

export default Headset
