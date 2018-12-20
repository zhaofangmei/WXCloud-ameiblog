// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'meiblog-86be65'
})
const db = cloud.database()
const _ = db.command
const moment = require('moment')



// 云函数入口函数
exports.main = async(event, context) => {
  console.log(event)
  let result = null
  try {
    // 保存当前openid和formid和失效72小时
    if (event.form_id != 'the formId is a mock one') {
      let saveFormIdResult = await cloud.callFunction({
        name: 'message',
        data: {
          op: 'save',
          openid: event.userInfo.openId,
          formId: event.form_id,
        }
      })
      console.log('>>>>>>>>>>save formid: ', saveFormIdResult)
    }

    let params = {
      comment: event.comment,
      user: event.user,
      postid: event.postid,
      parentid: event.parentid,
      replyer: event.replyer,
      openid: event.userInfo.openId,
      ctime: new Date().getTime()
    }

    // 保存评论
    result = await db.collection('b_comment').add({
      data: params,
      success: res => {
        console.log('>>>>>>>comment save success: ', res)
      },
      fail: err => {
        console.log('>>>>>>comment save fail: ', err)
      }
    })

    console.log('@@@@@@@@@result: ', result._id)

    // 根据博客的openid获取formid，推送消息
    let getFormIdResult = await cloud.callFunction({
      name: 'message',
      data: {
        op: 'get',
        openid: event.touser,
      }
    })
    console.log('>>>>>>>>>>get formid: ', JSON.stringify(getFormIdResult))
    
    let iTimeNow = Math.floor(new Date().getTime() / 1000)
    let formids = []
    formids = getFormIdResult.result.data.filter(function(item) {
      return (item.exp > iTimeNow)
    })
    if (formids.length > 0) {
      let form_id = formids[0].formId
      let msg = {
        touser: event.touser, // 要通知的用户的openID
        form_id: form_id, // 保存的form_id
        template_id: "mEEGbVg3OPrBXmSVpTX2HpaGQpOj5nLK7CxiKUsH5GQ", //模板id
        data: { // 要通知的模板数据
          "keyword1": {
            "value": event.title
          },
          "keyword2": {
            "value": moment(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')
          },
          "keyword3": {
            "value": event.comment
          },
          "keyword4": {
            "value": event.user
          }
        }
      }

      let sendMsgRes = await cloud.callFunction({
        name: 'wxapi',
        data: msg
      })
      console.log('>>>>>>>>>>', sendMsgRes)
    }

    return result

  } catch (e) {
    console.error(e)
    return e
  }
}