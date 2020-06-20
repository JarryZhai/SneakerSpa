// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const MAX_LIMIT = 100
// 云函数入口函数a

exports.main = async (event, context) => {
  try {
    return await db.collection('store0').where({  statusv:event.status }).orderBy('createTime','asc').get();
  } catch (e) {
    console.error(e);
  }
}