// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'meiblog-86be65' })
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
  return { limit: limit, offset: offset }
}

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    //evevt (params  userInfo: openid appid)
    // await mysql('blog_post').select('*').limit(limit).offset(offset).where('server_status', 1).orderBy('ctime', 'desc')
    let params = {
      pageSize: event.pageSize,
      pageIndex: event.pageIndex
    }
    let { limit, offset } = _4page(params)
    
    return await db.collection('b_post').where({
      server_status: 1
    }).skip(offset).limit(limit).orderBy('ctime', 'desc').get({
      success: function (res) {
        console.log('>>>>>>post list success: ', res)
      },
      fail: err => {
        console.log('>>>>>>post list fail: ', err)
      }
    })
  } catch (e) {
    console.error(e)
  }
}
