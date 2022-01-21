import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View, Button, Text, Input, Image,Picker } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import { AtMessage, AtActivityIndicator } from "taro-ui";
import {fspc, isN,urlParams} from '../../utils/fn' 
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


@inject('store')
@observer
class Config extends Component {

  constructor(props) {
    super(props)
    this.store = this.props.store.mainStore
    this.state = {
      showInfo: false
    }
  }



  async componentDidMount () { 
  }


  doLogin=()=>{
    Taro.switchTab({ url: `/pages/index/index` });
  }



  render () {


    return (
      <View className='g-blank'>


        <View className="m-hd">
          <Image className="f-icon" src={icon_scan} />
          <View className="m-tl">
            <View>尚未登录</View>
          </View>
          <Image className="f-icon-s m-icon-user" src={icon_user} />
        </View>

        <View className="m-bd">
          <View className="f-tl">快速搜索</View>
          <View className="f-search">
            <View className="f-wrap">
              <Image className="f-icon" src={icon_search}></Image>
              <View className="f-input">请输入名称进行搜索</View>
          </View>
          </View>
          
          <View className="f-tl">最近管理的组织</View>

          <View className="m-none">无资源数据</View>

          <View className="m-login" onClick={this.doLogin}>登 录</View>

        </View>

      </View>
    )
  }
}

export default Config
