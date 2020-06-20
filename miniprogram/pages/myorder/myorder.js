// miniprogram/pages/myorder/myorder.js
wx.cloud.init({});
const db = wx.cloud.database().collection('store0');
const app = getApp()
var QR = require('../../utils/QRCodes')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderlist: [],
    storename: [                        //分店
      {
        name: '总店',
        address: '总店地址: xx省xx市xx区xxxxxxxxxxxxxxxxxxxxxxxxxx',
      },
      {
        name: '分店',
        address: '分店地址: xx省xx市xx区xxxxxxxxxxxxxxxxxxxxxxxxxx',
      },
      {
        name: '占位',
      },
      {
        name: '占位',
      },
    ],
    steps: [                            //订单当前状态
      {
        text: '下单',
      },
      {
        text: '已寄出',
      },
      {
        text: '已报价',
      },
      {
        text: '已付款',
      },
      {
        text: '服务中',
      },
      {
        text: '已发货',
      },
      {
        text: '签收',
      },
    ],
    deliverprov: [                     //快递公司清单
      {
        name: '顺丰',
      },
      {
        name: '百世',
      },
      {
        name: '中通',
      },
      {
        name: '申通',
      },
      {
        name: '圆通',
      },
      {
        name: '韵达',
      },
      {
        name: '邮政',
      },
      {
        name: 'EMS',
      },
      {
        name: '天天',
      },
      {
        name: '优速',
      },
      {
        name: '京东',
      },
      {
        name: '德邦',
      },
      {
        name: '宅急送',
      },
      {
        name: '其他',
      },
    ],
    deliverprovv: '尚未选择',
    delivershow: false,
    deliverpovshow: false,
    delivernumber: '',
    orderdeliverid: '',
    orderqr: '',
    showqr: false,
    getaddress0: '',
    getaddress1: '',
    getaddress2: '',
    sendTrackShow: false,
    todo: ['等待您将鞋子寄出或带到店内，点击【去发货】', '鞋子到达店员会即刻为你报价【等待报价】', '报价成功等待支付，点击【去支付】', '即将开始处理您的订单', '正在处理您的订单', '您的订单已发货，收到请点击【签收】', '订单完成，感谢您的使用']
  },

  back: function(){
    wx.switchTab({
      url: '/pages/mine/mine',
    })
  },

  //搜索我的订单
  searchMine: function () {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        db.where({ _openid: res.result.openid}).orderBy('createTime','desc').get({
          success: res=>{
            console.log(res)
            this.setData({
              orderlist: res.data
            })
          },
          fail: err => {
           wx.showToast({
             icon: 'none',
             title: '查询记录失败'
           })
           console.error('[数据库] [查询记录] 失败：', err)
         }
    })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err) 
      }
    })
  },

  //删除订单
  onDelete: function(e) {
    var that = this;
    let src=e.currentTarget.dataset.src;
    let imgid=e.currentTarget.dataset.imgid;
    wx.showModal({
      title: '提示',
      content: '确定要删除订单吗？',
      success: function(res) {
        if (res.confirm) {
          wx.showToast({
            icon: 'loading',
            title: '正在删除',
            duration: 3000,
          })
          wx.cloud.callFunction({
            name: "deleteOrder",
            data: {
              _id: src,
            },
            success: res => {
              console.log(src)
              console.log('[云函数] [deleteBook] 删除成功！！ ', res)
              wx.hideLoading();
            },
            fail: err => {
              console.error('[云函数] [deleteBook] 调用失败', err)
            }
          })
          wx.cloud.deleteFile({
            fileList: [imgid]
          }).then(res => {
            console.log(res.fileList)
          }).catch(error => {
          })
        } else if (res.cancel) {
          return false;
        }
      }
    })
    setTimeout(function () {
      that.searchMine();
     }, 2000)
  },

  //物流信息输入
  chooseDevilerPov(){
    this.setData({ deliverpovshow: true });
  },
  onDeliverShow(e) {
    this.setData({ delivershow: true, orderdeliverid: e.currentTarget.dataset.src});
  },
  onDeliverClose() {
    this.setData({ delivershow: false });
  },
  onDeliverSelectClose() {
    this.setData({ deliverpovshow: false });
  },
  onDeliverSelect(event) {
    this.setData({ deliverprovv: event.detail.name });
  },
  onDeliverNumberChange(event) {
    // event.detail 为当前输入的值
    this.setData({ delivernumber: event.detail});
  },
  onAddressChange0(event) {
    // event.detail 为当前输入的值
    this.setData({ getaddress0: event.detail});
  },
  onAddressChange1(event) {
    // event.detail 为当前输入的值
    this.setData({ getaddress1: event.detail});
  },
  onAddressChange2(event) {
    // event.detail 为当前输入的值
    this.setData({ getaddress2: event.detail});
  },

  //扫描快递单号
  scanDeliverBar:function(){
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        console.log(res.result)
        this.setData({ delivernumber: res.result});
      }
    })
  },

  //复制点击信息dataset.text
  copyText: function (e) {
    console.log(e)
    wx.setClipboardData({
      data: e.currentTarget.dataset.text,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  },

  //物流信息更新
  updateDeliver: function(event){
    wx.requestSubscribeMessage({
      tmplIds: ['ANQ5eH28X701TG5U7zAw1ZIUsmT8Vr7a0ka4oKzMp2E'],
      success (res) { 
        console.log(res)
      }
    })
    if(this.data.deliverprovv=='尚未选择'||this.data.delivernumber==''||this.data.getaddress0==''||this.data.getaddress1==''||this.data.getaddress2==''){
      wx.showToast({
        icon: 'none',
        title: '快递信息不完整'
      })
    }else{
      console.log('添加',event.currentTarget.dataset.src,'的快递信息')
      this.setData({ delivershow: false });
      db.doc(this.data.orderdeliverid).update({
        data: {
          sendtrack: [this.data.deliverprovv, this.data.delivernumber],
          statusv: 1,
          address: [this.data.getaddress0,this.data.getaddress1,this.data.getaddress2]
        },
        success: res => {
          this.setData({
            deliverprovv: '尚未选择',
            delivernumber: '',
            getaddress0: '',
            getaddress1: '',
            getaddress2: '',
          })
          wx.showToast({
            icon: 'none',
            title: '快递信息更新成功'
          })
          this.searchMine()
        },
        fail: err => {
          console.error('[数据库] [更新记录] 失败：', err)
          wx.showToast({
            icon: 'none',
            title: '快递信息更新失败'
          })
        }
      })
    }
  },

  //打开订单二维码
  showOrderQR: function(event){
    var qrnumber = event.currentTarget.dataset.src;
    this.setData({
      orderqr: QR.createQrCodeImg(qrnumber),
      showqr: true
    })
  },

  //关闭订单二维码
  onQRClose: function(){
    this.setData({showqr: false})
  },

  // //查询客户的快递信息
  // onSendTrackShow: function(event){
  //   this.setData({sendTrackShow: true})
  //   //查询快递-调用api
  //   wx.request({
  //     url: 'http://api.kdniao.com/Ebusiness/EbusinessOrderHandle.aspx',
  //     data:{
  //       ShipperCode: 'STO',
  //       LogisticCode: '773039240215662',
  //     }
  //   })
  //   success: res =>{
  //     console.log(res)
  //   }
  // },

  // onSendTrackClose: function(){
  //   this.setData({sendTrackShow: false})
  // },

//调用微信支付支付订单
PAY: function(e){
  let that=this
  wx.showModal({
    title: '提示',
    content: '确定支付吗？',
    success: function(res) {
      wx.requestSubscribeMessage({
        tmplIds: ['ANQ5eH28X701TG5U7zAw1ZIUsmT8Vr7a0ka4oKzMp2E'],
        success (res) { 
          console.log(res)
        }
      })
      var timestamp = Date.parse(new Date());  
      timestamp = timestamp / 1000; 
      if (res.confirm) {
        wx.requestPayment({
          "timeStamp": timestamp,
          "nonceStr": "xxXXyyYYzzZZ",
          "package": "",
          "signType": "MD5",
          "paySign": "",
          "success":function(res){
            console.log(res)
          },
          "fail":function(res){
          }
       })
        db.doc(e.currentTarget.dataset.src).update({
          data: {
            statusv: 3,
          },
          success: res => {
            wx.showToast({
              icon: 'none',
              title: '支付完成'
            })
            that.searchMine()
          },
          fail: err => {
            console.error('[数据库] [更新记录] 失败：', err)
            wx.showToast({
              icon: 'none',
              title: '请重试'
            })
          }
        })
      } else if (res.cancel) {
        return false;
      }
    }
  })
},



  //签收结束订单
  ALLSET: function(e){
    let that=this
    wx.showModal({
      title: '提示',
      content: '确定签收订单吗？',
      success: function(res) {
        if (res.confirm) {
          db.doc(e.currentTarget.dataset.src).update({
            data: {
              statusv: 6,
            },
            success: res => {
              wx.showToast({
                icon: 'none',
                title: '订单完成啦'
              })
              that.searchMine()
            },
            fail: err => {
              console.error('[数据库] [更新记录] 失败：', err)
              wx.showToast({
                icon: 'none',
                title: '请重试'
              })
            }
          })
        } else if (res.cancel) {
          return false;
        }
      }
    })
  },

  //调用快递100
  track100: function(e){
    let tracknu = e.currentTarget.dataset.src[1]
    let trackurl = 'pages/result/result?nu='+tracknu+'&com=&querysource=third_xcx'
    wx.navigateToMiniProgram({
      appId: 'wx6885acbedba59c14', // 要跳转的小程序的appid
      path: trackurl, // 跳转的目标页面
      success(res) {
        // 打开成功  
      }
    }) 
  },

  handleContact (e) {
    console.log(e.detail.path)
    console.log(e.detail.query)
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.searchMine();
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
    this.searchMine()
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

  }
})