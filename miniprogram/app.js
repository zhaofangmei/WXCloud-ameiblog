//app.js
App({
  onLaunch: function() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'meiblog-86be65',
        traceUser: true
      })
    }
    this.globalData = {}
  },
  checkUserInfo: function (cb) {
    const _this = this
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log('logined .............')
              _this.globalData.userInfo = res.userInfo
              _this.globalData.logined = true
              typeof cb == "function" && cb(_this.globalData.userInfo, true);
            }
          })
        } else {
          console.log('not login .............')
          _this.globalData.logined = false
          typeof cb == "function" && cb(_this.globalData.userInfo, false)
        }
      }
    })
  },
  globalData: {
    logined: true,
    userInfo: null
  }
})