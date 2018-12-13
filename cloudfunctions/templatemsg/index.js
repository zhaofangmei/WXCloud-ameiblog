// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'meiblog-86be65'
})
const db = cloud.database()
const _ = db.command
const axios = require('axios')
const appId = ''
const appSecret = ''
const TEMPLATE_MESSAGE_URL = 'https://api.weixin.qq.com/cgi-bin/{PATH}?access_token={ACCESS_TOKEN}'
const TOKEN_URL = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={APPID}&secret={APPSECRET}'

async function setToken() {
  let url = TOKEN_URL.replace('{APPID}', appId).replace('{APPSECRET}', appSecret)
  let result = await axios.get(url)
  if (result.status !== 200) {
    return null
  }
  if (result.data.errcode) { // 获取token失败
    console.log('获取token失败', result.data.errcode)
    return null

  } else {
    console.log('>>>>>>>>>>>>>>>>result.data: ', result.data)
    // 凭证有效时间
    let exp = new Date().getTime() / 1000 + result.data.expires_in
    return {
      access_token: result.data.access_token, // 获取到的凭证
      expires_time: exp
    }

  }
}

async function setUrl(fullUrl, path) {
  let result = await setToken()
  let access_token = token.access_token
  let expires_time = token.expires_time
  let now_time = new Date().getTime() / 1000
  let url = fullUrl.replace('{PATH}', path).replace('{ACCESS_TOKEN}', access_token)
  return url
}

// 云函数入口函数
exports.main = async(event, context) => {
  console.log(event)
  try {
    let requestData = {
      touser: event.touser,
      form_id: event.form_id, // 保存的form_id
      template_id: event.template_id, //模板id
      data: event.data
    }
    let url = await setUrl(TEMPLATE_MESSAGE_URL, 'message/wxopen/template/send')
    let result = await axios({
      url: url,
      data: params,
      method: 'post',
      headers: {
        'content-type': 'application/json'
      }
    })

    console.log('@@@@@@@@@@@result: ', result)

  } catch (e) {
    console.error(e)
  }
}