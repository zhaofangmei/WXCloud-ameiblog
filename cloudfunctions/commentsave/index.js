// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'meiblog-86be65' })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  let result = null
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

    result = await db.collection('b_comment').add({
      data: params,
      success: res => {
        console.log('>>>>>>>comment save success: ', res)
      },
      fail: err => {
        console.log('>>>>>>comment save fail: ', err)
      }
    })

    let msg = {
      touser: event.userInfo.openId, // 要通知的用户的openID
      form_id: 1540380591153, // 保存的form_id
      template_id: "mEEGbVg3OPrBXmSVpTX2HpaGQpOj5nLK7CxiKUsH5GQ", //模板id
      data: { // 要通知的模板数据
        "keyword1": {
          "value": "文章标题"
        },
        "keyword2": {
          "value": "评论时间"
        },
        "keyword3": {
          "value": "评论内容"
        },
        "keyword4": {
          "value": "评论者"
        }
      }
    }

    let res = await cloud.callFunction({
      name: 'templatemsg',
      data: msg
    })
    console.log('>>>>>>>>>>', res)
    
    return result

  } catch (e) {
    console.error(e)
    return e
  }
}