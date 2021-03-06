// miniprogram/pages/mine/mine.js
wx.cloud.init({});
const db = wx.cloud.database().collection('member');
const app = getApp()
var QR = require('../../utils/QRCodes')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    memberinfo: '',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    newid: 0,
    ilevel: 0,
    memberlevel: ['正在查询','一级会员','二级会员','三级会员'],
    showqr: false,
    userqr: ''
  },

  searchMine: function () {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        db.where({ _openid: res.result.openid}).get({
          success: res=>{
            console.log(res.data)
            if(res.data[0]==null){
              console.log('新会员');
              this.newCardID();
            }
            else{
              this.setData({
                ilevel:res.data[0].ilevel
              })
            }
            this.setData({
              memberinfo: res.data
            })
          },
          fail: err => {
          }
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err) 
      }
    })
  },

  newCardID: function(){
    console.log('生成新id')
    db.orderBy('createTime','desc').limit(1).get({
      success: res=>{
        console.log(res)
        this.setData({
          newid: res.data[0].memberid + 1
        })
        this.newMember()
      },
      fail: err => {
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  newMember: function(){
    console.log('添加新会员');
    var timestamp = Date.parse(new Date());  
    timestamp = timestamp / 1000; 
    db.add({      //db之前宏定义的 在这里指数据库中的Room表； add指 插入
      data: {          // data 字段表示需新增的 JSON 数据       
        iorder: 0,    //将我们获取到的Rname1的value值给Room表中的Rname
        ilevel: 1,
        iadmin: 0,
        createTime: timestamp,
        memberid: app.globalData.openid.substring(25,)+this.data.newid,
        iaddress: '',
        icoupon: []
      },          
      success: res=> {
        this.setData({
          ilevel:1
        })
        console.log("新会员创建成功", res)  
        this.searchMine()
      },
    })  
  },

  myorder: function(){
    wx.navigateTo({
      url: '/pages/myorder/myorder',
    })
  },

  //打开会员二维码
  showUserQR: function(event){
    this.setData({
      userqr: QR.createQrCodeImg(app.globalData.openid),
      showqr: true
    })
  },

  //关闭会员二维码
  onQRClose: function(){
    this.setData({showqr: false})
  },

  handleContact (e) {
    console.log(e.detail.path)
    console.log(e.detail.query)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.getSetting({
    //   success: function(res){
    //    if (res.authSetting['scope.userInfo']) {
    //     // 已经授权，可以直接调用 getUserInfo 获取头像昵称
    //     wx.getUserInfo({
    //      success: function(res) {
    //       console.log(res.userInfo)
    //      }
    //     })
    //    }
    //   }
    //  })
    this.searchMine();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (typeof this.getTabBar === 'function' &&
    this.getTabBar()) {
    this.getTabBar().setData({
      active: 1
    })
  }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '【喜鞋 Sneaker Spa】\n \t球鞋清洗，球鞋修复。\n ALL FOR SNEAKER ',
      imageUrl: 'https://github.com/JarryZhai/sneakerimg/blob/master/logo1.jpg?raw=true',
      path: '/pages/home/home'
    }
  }
})