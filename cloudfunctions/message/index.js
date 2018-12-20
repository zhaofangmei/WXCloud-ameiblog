// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'meiblog-86be65'
})
const db = cloud.database()
const _ = db.command

const saveFormId = async function(params) {
  try {
    if (params.formId == undefined || params.formId == null || params.formId == '') {
      return false
    }

    // 判断formid是否过期
    let formidRow = await getFormId(params.openid)
    let iTimeNow = Math.floor(new Date().getTime() / 1000)
    console.log('>>>>>>>>>formidRow:', formidRow)

    let data = formidRow.data
    // 清除过期formid
    for (let row of data) {
      if (row.exp < iTimeNow) {
        db.collection('b_formid').doc(row._id).remove({
          success: console.log,
          fail: console.error
        })
      }
    }

    //插入新的formid
    let obj = {
      openid: params.openid,
      formId: params.formId,
      exp: iTimeNow + (3600 * 24 * 7),
    }
    saveResult = await db.collection('b_formid').add({
      data: obj,
      success: res => {
        console.log('>>>>>>>formid save success: ', res)
      },
      fail: err => {
        console.log('>>>>>>formid save fail: ', err)
      }
    })
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

const getFormId = async function(openid) {
  try {
    let row = await db.collection('b_formid').where({
      openid: openid
    }).get({
      success: function(res) {
        console.log('>>>>>>form list success: ', res)
      },
      fail: err => {
        console.log('>>>>>>form list fail: ', err)
      }
    })
    return row
  } catch (e) {
    console.log('>>>>>>>>>error:', e)
    console.error(e)
    return null
  }
}

// 云函数入口函数
exports.main = async(event, context) => {
  try {
    if (event.op == 'save') { // saveFormid
      let params = {
        openid: event.openid,
        formId: event.formId,
      }
      return await saveFormId(params)
    } else if (event.op == 'get') { // getFormid
     return await getFormId(event.openid)
    }

  } catch (e) {
    console.error(e)
    return e
  }

}