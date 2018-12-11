// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'meiblog-86be65' })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let postid = event.postid
    let row = await db.collection('b_comment').where({
      postid: postid
    }).orderBy('ctime', 'desc').get({
      success: function (res) {
        console.log('>>>>>>comment list success: ', res)
      },
      fail: err => {
        console.log('>>>>>>comment list fail: ', err)
      }
    })

    let allDatas = row.data || []
    let firstTmp = allDatas.filter(item => {
      return item.parentid == ""
    })

    filter(firstTmp, allDatas)

    function filter(tmp, all) {
      for (var i = 0; i < tmp.length; i++) {
        let item = tmp[i]
        item.childList = []
        for (var j = 0; j < all.length; j++) {
          let data = all[j]
          if (item._id + '' == data.parentid) {
            item.childList.push(data)
            filter(item.childList, all)
          }
        }
      }
    }

    console.log('>>>>>>>>>>>>>firstTmp: ', firstTmp)
    return firstTmp

  } catch (e) {
    console.error(e)
  }
}
