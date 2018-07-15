//app.js
var Promise = require('./vendor/es6-promise').Promise;
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')
var util = require('./utils/util.js')
var fundebug = require('./vendor/fundebug.0.6.1.min')
fundebug.init({
  apikey: "f24ac51aec6a37d209d9dc8d85e9ec1ab21ec9d8dc872ef292850b072b6e881e"
});

App({
    onShow: function() {
      //this.processRef()
    },
    onLaunch: function () {
      //this.processRef()
      qcloud.setLoginUrl(config.service.loginUrl)
      var that = this
      this.login(function (result){
        that.globalData = {
          userInfo: result.userInfo,
          logged: true
        }
        fundebug.userInfo = result.userInfo;
      })
      wx.getSystemInfo({
        success: function (res) {
          fundebug.systemInfo = res;
        }
      });
      wx.getStorage({
        key: 'currentSemester',
        success: function(res) {
          console.log(res)
        },
        fail: function(err){
          wx.redirectTo({
            url: 'pages/index/index',
          })
        }
      })
    },
    // 用户登录示例
    login: function (cb) {
      console.log('login')
      this.createPms(cb)
    },

    createPms: function(cb) {
      var that = this
      
      this._ready = new Promise(function (resolve, reject) {
        function handle(data) {
          that.globalData.userInfo = data
          that.globalData.logged = true
          resolve(that.globalData)
          cb && cb(that.globalData)
        }
        // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
        let cached = wx.getStorageSync('userInfo');
        const useCache = cached && cached.expireTime > Date.now();
        console.log('useCache = ', cached);
        if (useCache) {
          wx.hideToast();
          handle(cached);
        } else {
          util.showBusy('正在登录')
        }
        !useCache && qcloud.request({
          url: config.service.requestUrl,
          login: true,
          success(result) {
            // util.showSuccess('登录成功')
            that.globalData.userInfo = result.data.data
            that.globalData.logged = true
            wx.setStorage({
              key: 'userInfo',
              data: { ...result.data.data, expireTime: Date.now() + config.expireTime }
            })
            if (!useCache) {
              resolve(that.globalData)
              cb && cb(that.globalData)
            }
          },

          fail(error) {
            // util.showModel('请求失败', error)
            console.log('request fail', error)
          },

          complete() {
            wx.hideToast()
          }
        })
      });
    },

    processRef: function(options){
    },
    _ready: null,
    ready: function (cb) {
      if(!this._ready) {
        this.createPms()
      }
      this._ready.then(cb)
      this._ready = null;
    },
    
    globalData: {}
})