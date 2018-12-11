// pages/me/me.js
const app = getApp()

Page({
  data: {
    userInfo: {}
  },
  // 监听页面加载
  onLoad: function (options) {
    const that = this;
    app.checkUserInfo(function (userInfo, isLogin) {
      if (!isLogin) {
        wx.redirectTo({
          url: '../authorization/authorization?backType=me',
        })
      } else {
        that.setData({
          userInfo: userInfo
        });
      }
    });

  },

})