// miniprogram/pages/admin/admin.js
wx.cloud.init({});
const db = wx.cloud.database().collection('store0');
const app = getApp()
const _ = wx.cloud.database().command

Page({

  /**
   * 页面的初始数据
   */
  data: {
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
        name: '到店自取',
      },
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
    orderlist: [],
    deliverprovv: '尚未选择',
    delivershow: false,
    deliverpovshow: false,
    delivernumber: '',
    orderdeliverid: '',
    orderidSerchshow: false,
    orderidS: '',
    ordercode: '',
    trackidSerchshow: false,
    trackidS: '',
    trackcode: '',
    priceshow: false,
    newprice: '',

  },

  //预览图片
  previewImage:function(e){
    let that = this;
    let src = e.currentTarget.dataset.imgid;
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: [src] // =============重点重点=============
    })
  },

  //订单号输入
  orderidSerchOpen(){
    this.setData({ orderidSerchshow: true });
  },
  orderidSerchClose() {
    this.setData({ orderidSerchshow: false });
  },
  onOrderNumberSearchChange(event) {
    this.setData({ orderidS: event.detail});
  },
  //订单号搜索
  orderidSerch: function () {
    this.setData({orderlist:[]})
    if(this.data.orderidS.length==13){
      db.where({ orderid: this.data.orderidS}).orderBy('createTime','desc').get({
        success: res=>{
          console.log(res)
          if(res.data[0]==null){
            wx.showToast({
              icon: 'none',
              title: '没有此订单'
            })
          }
          this.setData({
            orderlist: res.data,
            orderidS: '',
          })
          this.orderidSerchClose()
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询失败'
          })
          console.error('[数据库] [查询记录] 失败：', err)
        }
      })
    }else{
      wx.showToast({
        icon: 'none',
        title: '订单号长度错误'
      })
    }
  },

  //快递号输入
  trackidSerchOpen(){
    this.setData({ trackidSerchshow: true });
  },
  trackidSerchClose() {
    this.setData({ trackidSerchshow: false });
  },
  onTrackNumberSearchChange(event) {
    this.setData({ trackidS: event.detail});
  },
  //快递号扫描
  scanDeliverBarS:function(){
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        console.log(res.result)
        this.setData({ trackidS: res.result});
      }
    })
  },
  //快递号搜索
  trackidSerch: function () {
    wx.showToast({
      icon: 'loading',
      title: '正在搜索'
    })
    this.setData({orderlist:[]})
      db.where({  sendtrack: _.elemMatch(_.eq(this.data.trackidS)) }).get({
        success: res=>{
          console.log(res)
          if(res.data[0]==null){
            wx.showToast({
              icon: 'none',
              title: '没有此订单'
            })
          }
          this.setData({
            orderlist: res.data,
            trackidS: '',
          })
          this.trackidSerchClose()
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询失败'
          })
          console.error('[数据库] [查询记录] 失败：', err)
        }
      })
  },

  //查看客户已发出订单
  shipedSearch: function () {
    wx.showToast({
      icon: 'loading',
      title: '正在搜索'
    })
    this.setData({orderlist:[]})
    wx.cloud.callFunction({
      name: "searchOrder",
      data: {
        status: 1
      },
      success: res => {
        console.log(res.result)
        if(res.result.data[0]==null){
          wx.showToast({
            icon: 'none',
            title: '没有订单'
          })
        }
        this.setData({
          orderlist: res.result.data
        })
      },
      fail: err => {
        console.error('[云函数] 查看客户已发出订单调用失败', err)
      }
    })
  },

  //查看客户付款订单
  paidSearch: function () {
    wx.showToast({
      icon: 'loading',
      title: '正在搜索'
    })
    this.setData({orderlist:[]})
    wx.cloud.callFunction({
      name: "searchOrder",
      data: {
        status: 3
      },
      success: res => {
        console.log(res.result)
        if(res.result.data[0]==null){
          wx.showToast({
            icon: 'none',
            title: '没有订单'
          })
        }
        this.setData({
          orderlist: res.result.data
        })
      },
      fail: err => {
        console.error('[云函数] 查看客户付款订单调用失败', err)
      }
    })
  },

  //查看等待发货订单
  readySearch: function () {
    wx.showToast({
      icon: 'loading',
      title: '正在搜索'
    })
    this.setData({orderlist:[]})
    wx.cloud.callFunction({
      name: "searchOrder",
      data: {
        status: 4
      },
      success: res => {
        console.log(res.result)
        if(res.result.data[0]==null){
          wx.showToast({
            icon: 'none',
            title: '没有订单'
          })
        }
        this.setData({
          orderlist: res.result.data
        })
      },
      fail: err => {
        console.error('[云函数] 查看等待发货订单调用失败', err)
      }
    })
  },

  //扫描订单二维码搜索
  orderCodeSearch:function(){
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        console.log(res.result)
        this.setData({ ordercode: res.result});
        this.setData({orderlist:[]})
        db.where({ _id: this.data.ordercode}).get({
          success: res=>{
            console.log(res)
            if(res.data[0]==null){
              wx.showToast({
                icon: 'none',
                title: '没有此订单'
              })
            }
            this.setData({
              orderlist: res.data,
              ordercode: '',
            })
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '查询失败'
            })
            console.error('[数据库] [查询记录] 失败：', err)
          }
        })
      }
    })
    

  },

  //添加快递信息
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

  scanDeliverBar:function(){
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        console.log(res.result)
        this.setData({ delivernumber: res.result});
      }
    })
  },

  copyText: function (e) {
    console.log(e)
    wx.setClipboardData({
      data: '地址:'+e.currentTarget.dataset.text[0]+',\n收件人:'+e.currentTarget.dataset.text[1]+',\n电话:'+e.currentTarget.dataset.text[2],
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
    if(this.data.deliverprovv=='尚未选择'||this.data.delivernumber==''){
      wx.showToast({
        icon: 'none',
        title: '快递信息不完整'
      })
    }else{
      let theopenid=event.currentTarget.dataset.openid
      let theorderid=event.currentTarget.dataset.id
      let theprice=event.currentTarget.dataset.price
      console.log('添加',event.currentTarget.dataset.src,'的快递信息')
      this.setData({ delivershow: false });
      db.doc(this.data.orderdeliverid).update({
        data: {
          gettrack: [this.data.deliverprovv, this.data.delivernumber],
          statusv: 5
        },
        success: res => {
          this.setData({
            deliverprovv: '尚未选择',
            delivernumber: '',
            orderidS: event.currentTarget.dataset.id,
          })
          wx.showToast({
            icon: 'none',
            title: '快递信息更新成功'
          })
          this.orderidSerch()
          wx.cloud.callFunction({
            name: "sendtrack",
            data: {
              openid: theopenid,
              orderid: theorderid,
              price: theprice
            },
            success: res => {
              console.log('[云函数] 发送通知！！ ', res)
            },
            fail: err => {
              console.error('[云函数] 调用失败', err)
            }
          })
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

  //报价
  onPriceShow() {
    this.setData({ priceshow: true });
  },
  onPriceClose() {
    this.setData({ priceshow: false });
  },
  onNewPriceChange(event) {
    this.setData({ newprice: event.detail});
  },

  //报价更新
  setPrice: function(event){
    let that=this
    let theopenid=event.currentTarget.dataset.openid
    let theorderid=event.currentTarget.dataset.orderid
    let theprice=event.currentTarget.dataset.src
    let _id=event.currentTarget.dataset.id
    if(this.data.newprice==''){
      wx.showToast({
        icon: 'none',
        title: '请输入报价'
      })
    }else{
      console.log('添加',event.currentTarget.dataset.orderid,'的报价')
      db.doc(_id).update({
        data: {
          price: this.data.newprice,
          statusv: 2
        },
        success: res => {
          console.log(res)
          that.setData({
            
            newprice: '',
            orderidS: event.currentTarget.dataset.orderid,
            priceshow: false 
          })
          wx.showToast({
            icon: 'none',
            title: '报价成功'
          })
          wx.cloud.callFunction({
            name: "sendprice",
            data: {
              openid: theopenid,
              orderid: theorderid,
              price: theprice
            },
            success: res => {
              console.log('[云函数] 发送通知！！ ', res)
            },
            fail: err => {
              console.error('[云函数] 调用失败', err)
            }
          })
          that.orderidSerch()
        },
        fail: err => {
          console.error('[数据库] [更新记录] 失败：', err)
          wx.showToast({
            icon: 'none',
            title: '报价失败'
          })
        }
      })
    }
  },

  //开始服务状态更新
  startWork: function(event){
    let that=this
    wx.showModal({
      title: '提示',
      content: '确定开始服务吗？',
      success: function(res) {
        if (res.confirm) {
          that.setData({orderidS: event.currentTarget.dataset.orderid})
          db.doc(event.currentTarget.dataset.src).update({
            data: {
              statusv: 4,
            },
            success: res => {
              wx.showToast({
                icon: 'none',
                title: '开始服务啦'
              })
              that.orderidSerch()
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

  //店内付款
  payAtStore: function(event){
    let that=this
    wx.showModal({
      title: '确认后顾客无需在微信端付款',
      content: '确定顾客已在店内付款吗？',
      success: function(res) {
        if (res.confirm) {
          that.setData({orderidS: event.currentTarget.dataset.orderid})
          db.doc(event.currentTarget.dataset.src).update({
            data: {
              statusv: 3,
              price: '已在店内付款'
            },
            success: res => {
              wx.showToast({
                icon: 'none',
                title: '付款成功'
              })
              that.orderidSerch()
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

  }
})