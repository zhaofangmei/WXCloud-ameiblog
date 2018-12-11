// pages/authorization/authorization.js
const util = require('../../utils/util.js')
const app = getApp()


Page({
  data: {
    backType: 'home'
  },
  // 授权登录
  bindGetUserInfo: function(e) {
    const _this = this
    util.loading()
    let backType = _this.data.backType;
    if (e.detail.userInfo) { //已授权
      let userInfo = e.detail.userInfo
      app.globalData.userInfo = userInfo
      if (backType == 'home') {
        wx.switchTab({
          url: '../home/home',
        })
      } else if (backType == 'me') {
        wx.switchTab({
          url: '../me/me',
        })
      } else if (backType == 'post') {
        wx.switchTab({
          url: '../post/post',
        })
      } else {
        wx.redirectTo({
          url: '../article/article?articleId=' + backType
        })
      }

    }
  },
  // 返回首页
  navigateBack: function() {
    wx.switchTab({
      url: '../home/home',
    })
  },
  // 页面加载
  onLoad: function(options) {
    this.setData({
      backType: options.backType
    });
  },
  // 分享
  onShareAppMessage: function(e) {
    return app.appShareHandle()
  }
})