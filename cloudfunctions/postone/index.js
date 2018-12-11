// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'meiblog-86be65'
})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async(event, context) => {
  try {
    console.log('post onde >>>>>>>>>>>>>>>>>', event)
    let id = event.id;
    let isReload = event.isReload;
    let data = null
    let row = await db.collection('b_post').doc(id).get({
      success: function(res) {
        console.log('>>>>>>post one success: ', res)
      },
      fail: err => {
        console.log('>>>>>>post one fail: ', err)
      }
    })
    
    let result = row.data
    
    result.isCurrUser = false
    if (result.openid == event.userInfo.openId) {
      result.isCurrUser = true
    }
    if (isReload == 0) {
      await db.collection('b_post').doc(id).update({
        data: {
          pv: result.pv + 1
        },
        success: function(res) {
          console.log(res)
        }
      })
    }

    console.log('222222222>>>>>>>>>>>row: ', result)
    return result

  } catch (e) {
    console.error(e)
  }
}