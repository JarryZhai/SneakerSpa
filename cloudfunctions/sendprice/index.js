// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  console.log('开始调用云函数')
  try {
    const result = await cloud.openapi.subscribeMessage.send({ 
    touser: event.openid,     //接收openid
    page: '/pages/myorder/myorder',        //page
    templateId: 'ANQ5eH28X701TG5U7zAw1ZIUsmT8Vr7a0ka4oKzMp2E' ,   //模板id
    miniprogram_state: 'trial',
    data: { 
      name6: {value: '您的喜鞋订单'}, 
      amount8: {value: event.price + '元'}, 
      thing10: {value: "点击此卡片进入订单界面" }, 
      phrase2: {value: "等待支付" }, }, 
    }) 
    console.log(result)
    return result 
  } catch (err) { 
    console.log(err)
    return err 
  }
}