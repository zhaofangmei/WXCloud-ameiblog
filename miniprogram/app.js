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
  appShareHandle(e) {
    return {
      title: '阿梅博客，闲聊时光',
      path: '/pages/home/home',
      imageUrl: '',
      success: function (res) {
        // 转发成功
        console.log('>>>>>>>>转发成功:', res)
        if (res.errMsg === 'shareAppMessage:ok') {
          if (res.hasOwnProperty('shareTickets')) {
            // 分享到群
          } else {
            // 分享到个人
          }
        }
      },
      fail: function (obj) {
        // 转发失败
        console.log('>>>> share fail..')
      }
    }
  },
  globalData: {
    logined: true,
    userInfo: null
  }
})