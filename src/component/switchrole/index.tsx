import { Component } from 'react'
import { View,  Radio } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import './index.scss'

import icon_switch  from '../../static/icon_switch.svg'


@inject('store')
@observer
class SwitchRole extends Component {

  constructor(props) {
    super(props)
    this.store = this.props.store.mainStore
    this.state = {
      userlist: props.userlist,
      // selRole: { emp: {sel: true, id: 0}, out: { sel:false , id: 0} },
      selRole: props.selRole,
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { userlist } = nextProps;
    if (userlist !== this.state.userlist) {
        this.setState({ userlist: userlist });
    }
  }


  doSelRole=async(role,id)=>{
    let params 
    let {selRole, userlist} = this.state
    switch(role) {
      case 0: 
        selRole = { emp: {sel:true,id:id}, out: {sel:false,id:0} };
        params = userlist.emp[id];
        break;
      case 1: 
        selRole = { emp: {sel:false,id:0}, out: {sel:true,id:id} };
        params = userlist.out[id];
        break;
    } 
    this.setState({ selRole: selRole })
    this.store.setRole(selRole)
    this.props.onSwitch(role,params);
  }

  

  render () {
    const { selRole, userlist } = this.state
    let empId = (selRole.emp.sel)?selRole.emp.id:-1
    let outId = (selRole.out.sel)?selRole.out.id:-1

    return (
      <View className="g-switch">
        <View className="m-warp">
          <View className="m-title">请选择您的身份</View>

          {(userlist.emp.length>0)&&
          <View className="m-item f-blue">我是教师</View>}
          {userlist.emp.map((item,i)=>
            <View className="m-item" onClick={this.doSelRole.bind(this,0,i)}>
              <View className="m-lt">
                <View className="m-name">{item.userName}</View>
                <View className="m-id">{item.orgName}</View>
              </View>
              <View className="m-rt">
                <Radio value='选中' color={'#508CFF'} checked={(empId==i)?true:false} ></Radio>
              </View>
            </View>)}
          
          
          {(userlist.out.length>0)&&
          <View className="m-item f-blue">我是安装师傅</View>}
          {userlist.out.map((item,i)=>
          <View className="m-item"  onClick={this.doSelRole.bind(this,1,i)}>
            <View className="m-lt">
              <View className="m-name">{item.userName}</View>
              <View className="m-id">{item.orgName}</View>
            </View>
            <View className="m-rt">
              <Radio value='选中' color={'#508CFF'} checked={(outId==i)?true:false}></Radio>
            </View>
          </View>)}
          
        </View>
      </View>
    )
  }
}

export default SwitchRole
