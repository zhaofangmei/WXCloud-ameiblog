// pages/home/home.js
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    complete: true,
    more: true,
    pageIndex: 1,
    pageSize: 5,
    postList: []
  },

  goDeatil: function (e) {
    let _this = this;
    let articleId = e.currentTarget.id;
    wx.navigateTo({
      url: '../article/article?articleId=' + articleId,
    })

  },

  getList: function () {
    let _this = this
    let params = {
      op:'paging',
      user: null,
      pageSize: _this.data.pageSize,
      pageIndex: _this.data.pageIndex
    }
    wx.cloud.callFunction({
      name: 'postlist',
      data: params,
      success: res => {
        console.log(res)
        let pots = res.result.data;
        if (Array.isArray(pots)) {
          pots.forEach(item => {
            item.ctime = util.formatTime(item.ctime)
          })
          _this.setData({
            postList: _this.data.postList.concat(pots),
          })
          if (pots.length <= 0) {
            _this.setData({
              more: false
            })
          }
          _this.data.pageIndex++
        }
      },
      fail: err => {
        _this.data.loading = false
        util.showModel('请求失败', err);
        console.log('request fail：', err);
        return false;
      }
    })
  },

  bindDownLoad: function () {
    var _this = this
    if (!_this.data.complete) {
      return;
    }
    if (_this.data.more) {
      _this.setData({
        complete: false
      })
      _this.getList()
      _this.setData({
        complete: true
      })
    }
  },

  onShow: function () {
    var _this = this
    //获取scrollHeight数值,微信必须要设置style:height才能监听滚动事件
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          scrollHeight: res.windowHeight
        })
      }
    })
    _this.setData({
      pageIndex: 1,
      postList: []
    })
    _this.getList()
  }
})