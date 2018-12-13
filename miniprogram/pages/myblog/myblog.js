// pages/myblog/myblog.js
const app = getApp()
const util = require('../../utils/util.js')
Page({
  data: {
    blogs: [],
    currentType: '常用',
    tags: ['常用', '爱好', '随笔']
  },
  orderBy: function (e) {
    let item = e.target.dataset.item;
    this.setData({
      currentType: item
    })
    this.getBlogList()
  },
  getBlogList: function () {
    let tag = this.data.currentType
    let params = {
      op: 'tag',
      tag: tag
    }
    wx.cloud.callFunction({
      name: 'postlist',
      data: params,
      success: res => {
        console.log(res)
        let blogs = res.result.data
        blogs.forEach(item => {
          item.ctime = util.formatTime(item.ctime)
        })
        this.setData({
          blogs: blogs
        })
      },
      fail: err => {
        _this.data.loading = false
        util.showModel('请求失败', 'error');
        console.log('request fail：', err);
        return false;
      }
    })

  },
  onLoad: function (options) {
    this.getBlogList()
  }
})