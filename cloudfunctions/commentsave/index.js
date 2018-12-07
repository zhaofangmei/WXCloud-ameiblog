// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'meiblog-86be65' })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let params = {
      comment: event.comment,
      user: event.user,
      postid: event.postid,
      parentid: event.parentid,
      replyer: event.replyer,
      openid: event.userInfo.openId,
      ctime: new Date().getTime()
    }

    return await db.collection('b_comment').add({
      data: params,
      success: res => {
        console.log('>>>>>>>comment save success: ', res)
      },
      fail: err => {
        console.log('>>>>>>comment save fail: ', err)
      }
    })

  } catch (e) {
    console.error(e)
  }
}