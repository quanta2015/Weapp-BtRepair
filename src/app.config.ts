export default {
  pages: [
    
    'pages/index/index',
    'pages/config/index',
    'pages/headset/index',
    'pages/user/index',
    'pages/blank/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '即装即用',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    "borderStyle":"white",
    list: [{
      pagePath: 'pages/index/index',
    },{
      pagePath: 'pages/config/index',
    },{
      pagePath: 'pages/blank/index',
    }]
  }
}
