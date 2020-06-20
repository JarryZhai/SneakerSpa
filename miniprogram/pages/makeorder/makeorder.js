// miniprogram/pages/makeorder/makeorder.js
wx.cloud.init({});
const db = wx.cloud.database().collection('store0');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeshow: false,
    storechoice: '总店（地址）',
    storeactions: [
      {
        name: '总店（地址）',
      },
      {
        name: '分店',
        subname: '（功能对接中）',
        disabled: true
      },
      {
        name: '占位',
        disabled: true
      },
      {
        name: '占位',
        disabled: true
      },
    ],
    serviceList: [{
      value: '清洗',
      selected: false ,
      price: '￥ 59起'
    },{
      value: '粘胶',
      selected: false ,
      price: '￥ 49起'
    },{
      value: '补伤',
      selected: false ,
      price: '￥ 49起'
    },{
      value: '破洞修复',
      selected: false ,
      price: '￥ 69起'
    },{
      value: '特殊去污',
      selected: false ,
      price: '￥ 49起'
    },{
      value: '贴底',
      selected: false ,
      price: '￥ 99起'
    },{
      value: '翻毛皮提色',
      selected: false ,
      price: '￥ 49起'
    },{
      value: '补漆',
      selected: false ,
      price: '￥119起'
    },{
      value: '气垫修复',
      selected: false ,
      price: '￥200起'
    },{
      value: '漆皮',
      selected: false ,
      price: '￥350起'
    },{
      value: 'BOOST底',
      selected: false ,
      price: '￥ 158'
    },{
      value: '发黄去氧化',
      selected: false ,
      price: '￥ 139'
    },{
      value: '防水处理',
      selected: false ,
      price: '￥ 29 '
    },{
      value: '特殊修复',
      selected: false ,
      price: '单独报价'
    }],
    chosenService: [],
    iintro: '',
    fileList6: [],
    imgID: '',
    cloudPath: [],
    checked: false,
    loading: false,
    adminshow: false,
    adminpass: '',
    rulechecked: false,
    ruleshow: false,

    mainActiveIndex: 0,
    activeId: 0,
  },

  onMenuChange(event) {
    const { key } = event.currentTarget.dataset;
    this.setData({
      [key]: event.detail
    });
  },

  checkboxChange(e){
    console.log('checkboxChange e:',e);
    let string = "serviceList["+e.target.dataset.index+"].selected"
        this.setData({
            [string]: !this.data.serviceList[e.target.dataset.index].selected
        })
        let detailValue = this.data.serviceList.filter(it => it.selected).map(it => it.value)
        console.log('所有选中的值为：', detailValue)
        this.setData({
          chosenService: detailValue
        },function() {
          if(this.data.chosenService[12]=="特殊修复"){
            this.setData({adminshow:true})
          }
        })
  },

  //tree
  onClickNav({ detail }) {
    this.setData({
      mainActiveIndex: detail.index || 0
    });
  },

  onClickItem({ detail }) {
    const activeId = this.data.activeId === detail.id ? null : detail.id;

    this.setData({ activeId });
  },

  //服务须知
  onRuleShow: function(){
    this.setData({ruleshow:true})
  },
  ruleClose: function(){
    this.setData({ruleshow:false})
  },
  agreeRule: function(){
    this.setData({rulechecked:true, ruleshow:false})
  },
  disagreeRule: function(){
    this.setData({rulechecked:false, ruleshow:false})
  },


  onAdminClose() {
    this.setData({ adminshow: false });
  },
  onPassChange(event) {
    this.setData({ adminpass: event.detail});
  },
  becomeAdmin: function(event){
    wx.cloud.init({});
    const db = wx.cloud.database().collection('member');
    console.log('管理员')

    if(event.currentTarget.dataset.src==123){
      wx.showToast({
        title: '你已成为管理员',
        duration: 3000,
        icon: 'none'
      })
      db.where({_openid: app.globalData.openid}).update({
        data: {
          iadmin: 1
        },
      })
      this.onAdminClose()
    }else if(event.currentTarget.dataset.src==456){
      wx.showToast({
        title: '你已不是管理员',
        duration: 3000,
        icon: 'none'
      })
      db.where({_openid: app.globalData.openid}).update({
        data: {
          iadmin: 0
        },
      })
      this.onAdminClose()
    }else{
      wx.showToast({
        title: '密码错误\n顾客误入请点击阴影离开',
        duration: 3000,
        icon: 'none'
      })
    }

    
  },

  chooseStore(){
    this.setData({ storeshow: true });
  },

  onStoreClose() {
    this.setData({ storeshow: false });
  },

  onStoreSelect(event) {
    this.setData({ storechoice: event.detail.name });
  },

  onIntroChange(e) {
    this.setData({
      iintro: e.detail,
    });
  },

  back: function(){
    wx.navigateBack();
  },


  //上传图片
  beforeRead(event) {
    const { file, callback = () => {} } = event.detail;
    callback(true);
  },

  afterRead(event) {
    const { file, name } = event.detail;
    const fileList = this.data[`fileList${name}`];

    this.setData({ [`fileList${name}`]: fileList.concat(file) });
  },

  delete(event) {
    const { index, name } = event.detail;
    const fileList = this.data[`fileList${name}`];
    fileList.splice(index, 1);
    this.setData({ [`fileList${name}`]: fileList });
  },

  clickPreview() {},

  uploadToCloud() {
    const { fileList6: fileList = [] } = this.data;
    var timestamp = Date.parse(new Date());  
      timestamp = timestamp / 1000;  
        if (this.data.chosenService[0]==null){
          wx.showToast({ title: '还没有添加项目喔', icon: 'none' });
        }else{
          if (!fileList.length) {
            wx.showToast({ title: '还没有添加图片喔', icon: 'none' });
          } else {
            if (this.data.rulechecked==false) {
              wx.showToast({ title: '请同意服务须知', icon: 'none' });
            } else {
              this.setData({loading:"ture"});
              wx.showToast({ title: '正在处理请稍候', icon: 'loading' });
              const finalname = app.globalData.openid + timestamp+'.jpg'
              const uploadTasks = fileList.map((file, index) =>
              this.uploadFilePromise(finalname, file)
              );
              Promise.all(uploadTasks)
              .then(data => {
              // wx.showToast({ title: '上传成功', icon: 'none' });
              wx.showToast({
                title: '询价成功',
                duration: 2000,
              })
              const fileList = data.map(item => ({ url: item.fileID }));
              this.data.imgID = fileList[0].url;
              this.setData({ cloudPath: data, fileList6: fileList});
              this.onClickButton();
              })
              .catch(e => {
              wx.showToast({ title: '由于您的网络问题，发布可能需要更长时间', icon: 'none' });
              console.log(e);
              this.data.loading=false;
              });
            }
          }
        }
      
  },

  uploadFilePromise(fileName, chooseResult) {
    return wx.cloud.uploadFile({
      cloudPath: fileName,
      filePath: chooseResult.path,
    });
  },


  onClickButton: function (e) {    
    let that = this;
    console.log();
    var timestamp = Date.parse(new Date());  
      timestamp = timestamp / 1000; 
      db.add({      //db之前宏定义的 在这里指数据库中的Room表； add指 插入
        data: {          // data 字段表示需新增的 JSON 数据       
          istore: 0,                          //分店
          iservice: this.data.chosenService,  //服务项目
          iintro: this.data.iintro,           //备注
          imgID: this.data.imgID,             //图片地址
          createTime: timestamp,              //时间戳
          paid: 0,                            //支付状态
          orderid: app.globalData.openid.substring(25,) + timestamp,  //订单号(添加openid后三位)
          sendtrack: '',                      //顾客寄送快递号
          gettrack: '',                       //顾客接收快递号
          price: null,                        //价格
          address: '',                        //地址
          coupon: '',                         //优惠券
          status: '',                         //当前进度
          statusv: 0                          //进度百分比
        },          
        success: function (res) {
          console.log("上传成功", res)  
          wx.switchTab({
            url: '/pages/mine/mine',
          })
        },
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