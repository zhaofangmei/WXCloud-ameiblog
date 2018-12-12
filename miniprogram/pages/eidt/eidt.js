// pages/eidt/eidt.js
const app = getApp()
const util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageList: [],
    loading: false,
    array: ['常用', '爱好', '随笔'],
    originArticle: '',
    article: {
      title: '',
      pickIndex: 0,
      tag: '',
      post: ''
    },
    articleId: ''
  },

  delImg: function(e) {
    let index = e.currentTarget.dataset.index
    let imageList = this.data.imageList
    console.log(index, imageList)
    if (index > -1) {
      let id = imageList[index].id;
      imageList.splice(index, 1)
      this.setData({
        imageList: imageList
      })
    }
  },

  chooseImage: function() {
    const _this = this
    let imageList = _this.data.imageList
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log(res)
        // tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths
        for (let img of tempFilePaths) {
          imageList.push({
            pic: img
          })
        }
        _this.setData({
          imageList: imageList
        })
      }
    })
  },

  bindPickerChange: function(e) {
    let pickIndex = e.detail.value;
    let tag = this.data.array[pickIndex];
    let article = this.data.article
    this.setData({
      article: {
        title: article.title,
        pickIndex: pickIndex,
        tag: tag,
        post: article.post
      }
    })

  },

  bindTextAreaBlur: function(e) {
    let article = this.data.article
    let post = e.detail.value
    this.setData({
      article: {
        title: article.title,
        pickIndex: article.pickIndex,
        tag: article.tag,
        post: post
      }
    })
  },
  //表单数据是否改变
  isDirty: function(originData, newData) {
    let dirty = false;
    let keys = Object.keys(originData);
    if (keys.length == 0) return true;
    for (let item in newData) {
      if (item == 'id') continue
      if (newData[item] != originData[item]) {
        dirty = true
      }
    }
    return dirty;
  },

  formSumbit: function(e) {
    var _this = this
    let article = _this.data.article
    let origin = _this.data.originArticle
    let isDirty = _this.isDirty(origin, article)
    if (!isDirty) {
      util.showModel('提示', '数据项未改变！');
      return false;
    }

    let tag = _this.data.article.tag || '';
    let post = _this.data.article.post || ''
    let id = _this.data.articleId || ''
    if (!post) {
      util.showModel('提示', '正文不可为空！');
      return false;
    }
    let imgpath = _this.data.imageList || [];

    let params = {
      op: 2, //1新增 2修改 3 删除
      id: id,
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

  getData: function(id) {
    let _this = this
    let params = {
      op: 'one',
      isReload: 1,
      id: id
    }
    wx.cloud.callFunction({
      name: 'postlist',
      data: params,
      success: res => {
        console.log(res)
        if (res.result) {
          let data = res.result
          data.ctime = util.formatTime(data.ctime)
          data.imgpath = JSON.parse(data.imgpath)
          
          let tag = data.tag
          let pickIndex = 0
          _this.data.array.forEach((item, index) => {
            if (item == tag) {
              pickIndex = index
            }
          })

          _this.setData({
            imageList: data.imgpath || [],
            article: {
              title: data.title,
              pickIndex: pickIndex || 0,
              tag: data.tag,
              post: data.post,
            }
          })

          _this.setData({
            originArticle: util.deepClone(_this.data.article)
          })

        }
      },
      fail: err => {
        util.showModel('请求失败', err);
        console.log('request fail：', err);
        return false;
      }
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let articleId = options.articleId || ''
    this.setData({
      articleId: articleId
    })
    this.getData(articleId)
  },
  onShareAppMessage: function(e) {
    return app.appShareHandle()
  }
})