// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({env: 'meiblog-86be65'})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    //evevt (params  userInfo: openid appid)
    let result = null
    if(event.op === 1) {  // 新增
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
        pv: 0
      }
      result = await db.collection('b_post').add({
        data: params,
        success: res => {
          console.log('>>>>>>>post save success: ', res)
        },
        fail: err => {
          console.log('>>>>>>post save fail: ', err)
        }
      })

    } else if(event.op === 2) { // 修改
      let ctime = new Date().getTime()
      let id = event.id
      let params = {
        tag: event.tag,
        post: event.post,
        imgpath: event.imgpath,
        ctime: ctime
      }

      result = await db.collection('b_post').doc(id).update({
        data: params,
        success: function (res) {
          console.log(res)
        }, 
        fail: err => {
          console.log('>>>>>>post edit fail: ', err)
        }
      })

    } else if (event.op === 3) {  // 删除
      let id = event.id
      result = await db.collection('b_post').doc(id).update({
        data: {
          server_status: 0
        },
        success: function (res) {
          console.log(res)
        },
        fail: err => {
          console.log('>>>>>>post delete fail: ', err)
        }
      })
    }
    return result
  } catch (e) {
    console.error(e)
    return e
  }
}