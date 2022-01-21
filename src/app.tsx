import { Component } from 'react'
import { Provider } from 'mobx-react'
import { observer, inject } from 'mobx-react'
import { View } from '@tarojs/components'
import './app.scss'
import mainStore from './store'

const store = {
  mainStore
}

class App extends Component {

  async componentDidMount () {
    // let r = await this.store.init()
    // this.setState({ refresh: true })
  }

  componentDidShow () {
    wx.hideTabBar({})
  }

  componentDidHide () {}

  componentDidCatchError () {}

  // this.props.children 就是要渲染的页面
  render () {
    return (
      <Provider store={store}>
        {this.props.children}
      </Provider>
    )
  }
}

export default App
