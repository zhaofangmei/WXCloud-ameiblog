// pages/post/post.js
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    imageList: [],
    loading: false,
    tag: '',
    title: '',
    pickIndex: 0,
    array: ['常用', '爱好', '随笔'],
    post: '',
    userInfo: {}
  },
  // 删除图片
  delImg: function (e) {
    let index = e.currentTarget.dataset.index
    let imageList = this.data.imageList
    console.log(index, imageList)
    if (index > -1) {
      imageList.splice(index, 1)
      this.setData({
        imageList: imageList
      })
    }
  },
  // 选择图片
  chooseImage: function () {
    const that = this
    let imageList = that.data.imageList
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log(res)
        let tempFilePaths = res.tempFilePaths
        for (let img of tempFilePaths) {
          imageList.push({ pic: img })
        }
        that.setData({
          imageList: imageList
        })
      }
    })
  },
  // 提交
  formSumbit: function (e) {
    var _this = this
    let openid = app.globalData.openid
    let title = e.detail.value.title || '';
    let tag = _this.data.tag || '';
    let post = _this.data.post || '';
    let userInfo = _this.data.userInfo;
    if (!(title && post)) {
      util.showModel('参数异常', '标题或正文不可为空！');
      return false;
    }
    let imgpath = _this.data.imageList || [];

    let params = {
      op: 1, //1新增 2修改 3 删除
      openid: openid,
      user: userInfo.nickName,
      head: userInfo.avatarUrl || '',
      title: title,
      tag: tag,
      post: post,
      imgpath: JSON.stringify(imgpath)
    }
    _this.setData({
      loading: true
    })
    wx.cloud.callFunction({
      name: 'postsave',
      data: params,
      success: res => { 
        _this.setData({
          loading: false
        })
        util.showSuccess('操作成功！')
        _this.setData({
          title: '',
          tag: '',
          pickIndex: 0,
          post: '',
          imageList: []
        })
        wx.switchTab({
          url: '../home/home',
        })
        
      },
      fail: err => {
        _this.setData({
          loading: false
        })
        util.showModel('请求失败', 'error');
        console.log('request fail：', err);
        return false;
      }
    })

  },
  // 标签选择监听
  bindPickerChange: function (e) {
    let pickIndex = e.detail.value;
    let tag = this.data.array[pickIndex];
    this.setData({
      pickIndex: pickIndex,
      tag: tag
    })
  },
  // 正文内容监听
  bindTextAreaBlur: function (e) {
    this.setData({
      post: e.detail.value
    })
  },
  //监听页面加载
  onLoad: function (options) {
    const that = this;
    app.checkUserInfo(function (userInfo, isLogin) {
      if (!isLogin) {
        wx.redirectTo({
          url: '../authorization/authorization?backType=post',
        })
      } else {
        let tag = that.data.array[that.data.pickIndex];
        that.setData({
          userInfo: userInfo,
          tag: tag
        });

      }
    });
  }
})