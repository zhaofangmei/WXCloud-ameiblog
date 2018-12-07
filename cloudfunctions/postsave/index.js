// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({env: 'meiblog-86be65'})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    //evevt (params  userInfo: openid appid)
    let params = {
      user: event.user,
      openid: event.userInfo.openId,
      head: event.head,
      title: event.title,
      tag: event.tag,
      ctime: new Date().getTime(),
      post: event.post,
      imgpath: event.imgpath,
      server_status: 1,
      pv:0
    }

    return await db.collection('b_post').add({
      data: params,
      success: res =>  {
        console.log('>>>>>>>post save success: ', res)
      },
      fail: err => {
        console.log('>>>>>>post save fail: ', err)
      }
    })

  } catch (e) {
    console.error(e)
  }
}