// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'meiblog-86be65'
})
const db = cloud.database()
const _ = db.command

function _4page(params) {
  let pageSize = params.pageSize && parseInt(params.pageSize) || 20;
  pageSize = pageSize > 0 && pageSize < 100 && pageSize || 20;

  let pageIndex = params.pageIndex && parseInt(params.pageIndex) || 1;
  pageIndex = pageIndex > 0 && pageIndex || 1;

  let limit = pageSize;
  let offset = (pageIndex - 1) * pageSize;
  delete params.pageIndex;
  delete params.pageSize;
  return {
    limit: limit,
    offset: offset
  }
}

// 云函数入口函数
exports.main = async(event, context) => {
  // paging one tag
  try {
    let result = null
    if (event.op == 'paging') { // 分页查询
      let params = {
        pageSize: event.pageSize,
        pageIndex: event.pageIndex
      }
      let {
        limit,
        offset
      } = _4page(params)

      result = await db.collection('b_post').where({
        server_status: 1
      }).skip(offset).limit(limit).orderBy('ctime', 'desc').get({
        success: function(res) {
          console.log('>>>>>>post list success: ', res)
        },
        fail: err => {
          console.log('>>>>>>post list fail: ', err)
        }
      })

    } else if (event.op == 'one') { // id查询
      console.log('post onde >>>>>>>>>>>>>>>>>', event)
      let id = event.id;
      let isReload = event.isReload;
      let row = await db.collection('b_post').doc(id).get({
        success: function(res) {
          console.log('>>>>>>post one success: ', res)
        },
        fail: err => {
          console.log('>>>>>>post one fail: ', err)
        }
      })
      let data = row.data
      data.isCurrUser = false
      if (data.openid == event.userInfo.openId) {
        data.isCurrUser = true
      }
      if (isReload == 0) {
        await db.collection('b_post').doc(id).update({
          data: {
            pv: data.pv + 1
          },
          success: function(res) {
            console.log(res)
          }
        })
      }
      console.log('>>>>>>>>>>>data: ', data)
      result = data

    } else if (event.op == 'tag') { // tag查询
      let openid = event.userInfo.openId
      let tag = event.tag
      result = await db.collection('b_post').where({
        server_status: 1,
        openid: openid,
        tag: tag
      }).orderBy('ctime', 'desc').get({
        success: function (res) {
          console.log('>>>>>>post tag success: ', res)
        },
        fail: err => {
          console.log('>>>>>>post tag fail: ', err)
        }
      })
    }
    
    return result
  } catch (e) {
    console.error(e)
    return e
  }
}