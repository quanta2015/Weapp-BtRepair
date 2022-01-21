import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View, Button, Text,Form, Input, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import './index.scss'


import icon_user2   from '../../static/user2.svg'
import icon_go      from '../../static/icon_go.svg'
import icon_child   from '../../static/icon_child.svg'
import icon_headset from '../../static/icon_headset.svg'


@inject('store')
@observer
class User extends Component {

  constructor(props) {
    super(props)
    this.store = this.props.store.mainStore
    this.state = {
      userName: null
    }
  }

  doGotoHeadset=()=>{
    Taro.navigateTo({ url: `/pages/headset/index` })
  }



  async componentDidShow () {     
    let userName = this.store.getCurUser().userName
    this.setState({userName: userName})
    console.log('userName',userName)
  }


  render () {

    let {userName} = this.state 

    return (
      <View className="g-user">
        <View className="m-hd">
          <View className="m-tl">我的</View>
        </View>
        <View className="m-user">
          <Image src={icon_user2}> </Image>
          <Text>{userName}</Text>
        </View>

        <View className="m-sect">
          <View className="m-row">
            <Image className="f-icon" src={icon_child}> </Image>
            <Text>小助理</Text>
            <Image className="f-icon" src={icon_go} > </Image>
          </View>


          <View className="m-row" onClick={this.doGotoHeadset}>
            <Image className="f-icon" src={icon_headset}> </Image>
            <Text>我的耳机</Text>
            <Image className="f-icon" src={icon_go} > </Image>
          </View>
        </View>
      </View>
    )
  }
}

export default User
