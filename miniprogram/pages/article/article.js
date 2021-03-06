// pages/article/article.js
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    loading: false,
    imageList: [],
    isReload: 0,
    articleId: '',
    replyItem: '',
    commentList: [],
    comment: '',
    hiddenmodal: true,
    isCurrUser: false,
    article: ''
  },
  // 预览图片
  previewImg: function(e) {
    let index = e.currentTarget.dataset.index;
    let imgArr = [];
    this.data.imageList.map(item => {
      imgArr.push(item.pic)
    })
    wx.previewImage({
      current: imgArr[index], //当前图片地址
      urls: imgArr, //所有要预览的图片的地址集合 数组形式
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  // 编辑
  editHandler: function (e) {
    if (this.data.isCurrUser) {
      let articleId = e.currentTarget.id;
      wx.navigateTo({
        url: '../eidt/eidt?articleId=' + articleId,
      })
    } else {
      util.showModel('提示', '当前用户不可编辑')
    }
  },
  // 回复
  replyToEvent: function(e) {
    let item = e.detail.data
    this.setData({
      replyItem: item,
      hiddenmodal: false
    })

  },
  // 回复事件
  replyTo: function(e) {
    let replyItem = e.target.dataset.item
    this.setData({
      replyItem: replyItem,
      comment: '',
      hiddenmodal: !this.data.hiddenmodal
    })
  },
  // 绑定评论内容
  bindTextArea: function(e) {
    let comment = e.detail.value
    this.setData({
      comment: comment
    })
  },
  //取消按钮
  cancelModal: function() {
    this.setData({
      comment: '',
      hiddenmodal: true
    });
  },
  //确认按钮
  formSubmit: function(e) {
    let _this = this
    let form_id = e.detail.formId
    let title = _this.data.article.title
    let comment = _this.data.comment
    let userInfo = app.globalData.userInfo
    let postid = _this.data.article._id || ''
    let replyItem = _this.data.replyItem
    let replyer = ''
    let parentid = ''
    let touser = _this.data.article.openid
    if (replyItem != '') {
      replyer = replyItem.user
      parentid = replyItem._id
      touser = replyItem.openid
    }
    if (!comment) {
      util.showModel('参数异常', '评论不可为空！');
      return false;
    }

    let params = {
      touser: touser,
      form_id: form_id,
      title: title,
      comment: comment,
      user: userInfo.nickName,
      postid: postid,
      parentid: parentid,
      replyer: replyer
    }
    util.loading()
    wx.cloud.callFunction({
      name: 'commentsave',
      data: params,
      success: res => {
        util.showSuccess('操作成功！')
        //判断是否有打开过页面
        if (getCurrentPages().length != 0) {
          //刷新当前页面的数据
          getCurrentPages()[getCurrentPages().length - 1].onLoad()
        }
      },
      fail: err => {
        util.showModel('请求失败', err);
        console.log('request fail：', err);
        return false;
      }
    })
    _this.setData({
      comment: '',
      replyItem: '',
      hiddenmodal: true
    })
  },
  commentHandler: function() {
    this.setData({
      hiddenmodal: !this.data.hiddenmodal
    })
  },
  // 删除事件
  delRequest: function(id) {
    var _this = this
    wx.cloud.callFunction({
      name: 'postsave',
      data: {
        op: 3, //1新增 2修改 3 删除
        id: id
      },
      success: res => {
        if (res.result.errMsg == 'document.update:ok') {
          util.showSuccess('操作成功');
          wx.switchTab({
            url: '../home/home',
          })
        }
      },
      fail: err => {
        util.showModel('请求失败', 'error');
        console.log('request fail：', err);
        return false;
      }
    })
  },
  // 删除
  delHandler: function(e) {
    if (this.data.isCurrUser) {
      let _this = this
      wx.showModal({
        title: '删除',
        content: '是否删除该文章？',
        success: function(res) {
          if (res.confirm) {
            let articleId = e.currentTarget.id;
            _this.delRequest(articleId);

          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      util.showModel('提示', '当前用户不可删除')
    }
  },
  // 获取意见列表
  getComments: function(postid) {
    if (!postid) postid = this.data.article.id
    let _this = this
    let params = {
      postid: postid
    }
    wx.cloud.callFunction({
      name: 'commentlist',
      data: params,
      success: res => {
        if (res.result) {
          let data = res.result || []
          for (var item of data) {
            item.ctime = util.formatTime(item.ctime)
          }
          _this.setData({
            commentList: data
          })
        }
      },
      fail: err => {
        util.showModel('请求失败', 'error');
        console.log('request fail：', err);
        return false;
      }
    })

  },
  // 获取博客信息
  getData: function(id) {
    let _this = this
    let params = {
      op:'one',
      isReload: _this.data.isReload,
      id: id
    }
    wx.cloud.callFunction({
      name: 'postlist',
      data: params,
      success: res => {
        if (res.result) {
          let data = res.result
          data.ctime = util.formatTime(data.ctime)
          data.imgpath = JSON.parse(data.imgpath)
          _this.setData({
            article: data || '',
            imageList: data.imgpath || [],
          })
          _this.data.isCurrUser = data.isCurrUser
          delete data.isCurrUser
        }
      },
      fail: err => {
        util.showModel('请求失败', err);
        console.log('request fail：', err);
        return false;
      }
    })
  },
  // 监听页面加载
  onLoad: function(options) {
    let _this = this
    if (options) {
      let articleId = options.articleId || ''
      _this.setData({
        isReload: 0,
        articleId: articleId
      })
    } else {
      _this.setData({
        isReload: 1
      })
    }
    app.checkUserInfo(function(userInfo, isLogin) {
      if (!isLogin) {
        wx.redirectTo({
          url: '../authorization/authorization?backType=' + _this.data.articleId,
        })
      } else {
        _this.getData(_this.data.articleId)
        _this.getComments(_this.data.articleId)
      }
    });
  },
  // 分享
  onShareAppMessage: function(e) {
    return app.appShareHandle()
  }
})