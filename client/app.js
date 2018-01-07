//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')
var util = require('./utils/util.js')
var fundebug = require('./vendor/fundebug.0.0.3.min.js')
fundebug.apikey = 'f24ac51aec6a37d209d9dc8d85e9ec1ab21ec9d8dc872ef292850b072b6e881e';

App({
    onLaunch: function () {
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
      })
    },
    // 用户登录示例
    login: function (cb) {
      util.showBusy('正在登录')
      var that = this
      this._ready = new Promise(function(resolve, reject){

        // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
        qcloud.request({
          url: config.service.requestUrl,
          login: true,
          success(result) {
            // util.showSuccess('登录成功')
            that.globalData.userInfo = result.data.data
            that.globalData.logged = true
            resolve(that.globalData)
            cb && cb(that.globalData)
          },

          fail(error) {
            // util.showModel('请求失败', error)
            console.log('request fail', error)
          },

          complete() {
            wx.hideToast()
          }
        })

        // 调用登录接口
        // qcloud.login({
        //   success(result) {
        //     if (result) {
        //       // util.showSuccess('登录成功')
        //       that.globalData.userInfo = result
        //       that.globalData.logged = true
        //       cb && cb(result)
        //       resolve(result)
        //       wx.hideToast()
        //     } else {
        //       // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
        //       qcloud.request({
        //         url: config.service.requestUrl,
        //         login: true,
        //         success(result) {
        //           // util.showSuccess('登录成功')
        //           that.globalData.userInfo = result.data.data
        //           that.globalData.logged = true
        //           resolve(result.data.data)
        //           cb && cb(result.data.data)
        //         },

        //         fail(error) {
        //           util.showModel('请求失败', error)
        //           console.log('request fail', error)
        //         },

        //         complete() {
        //           wx.hideToast()
        //         }
        //       })
        //     }
        //   },

        //   fail(error) {
        //     util.showModel('登录失败', error)
        //     console.log('登录失败', error)
        //   }
        // })
      });
    },

    _ready: null,
    ready: function (cb) {
      this._ready.then(cb)
    },
    globalData: {}
})