var axios = require('axios')
var config = require('../config');
var querystring = require('querystring');
module.exports = async (ctx, next) => {
    // 通过 Koa 中间件进行登录态校验之后
    // 登录信息会被存储到 ctx.state.$wxInfo
    // 具体查看：
    var wxInfo = ctx.state.$wxInfo;
    if (ctx.state.$wxInfo.loginState === 1) {
        // loginState 为 1，登录态校验成功
        ctx.state.$wxInfo.userinfo.openid = ctx.state.$wxInfo.userinfo.openId
        ctx.state.$wxInfo.userinfo.sex = ctx.state.$wxInfo.userinfo.gender
        ctx.state.$wxInfo.userinfo.nickname = ctx.state.$wxInfo.userinfo.nickName
        ctx.state.$wxInfo.userinfo.headimgurl = ctx.state.$wxInfo.userinfo.avatarUrl
        ctx.state.data = ctx.state.$wxInfo.userinfo
        ctx.state.data.serverTime = Date.now()
    } else {
        ctx.state.code = -1
    }
    if(wxInfo.userinfo.nickName.indexOf('rdgztest_') == 0 && !wxInfo.userinfo.avatarUrl){
        return
    }
    axios.post(config.apiHost + '/api/user/subscribe', querystring.stringify(ctx.state.$wxInfo.userinfo)).then((res)=>{
        console.log(res.data)
    }).catch(function (err) {
        console.log(err.response.data);
    });
}
