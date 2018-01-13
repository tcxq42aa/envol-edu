const axios = require('axios')
const config = require('../config')

setInterval(function () {
  getAccessToken()
}, 7000000)
getAccessToken()
function getAccessToken(cb) {
  if (process.env.NODE_ENV == 'development') {
    axios.get('http://edu.envol.vip/weapp/accessToken4Mini').then((res)=> {
      global.access_token_mini = res.data;
      console.log('access_token_mini=' + global.access_token_mini);
      cb && cb()
    });
  } else {
    axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appId}&secret=${config.appSecret}`)
        .then(function (response) {
          global.access_token_mini = response.data.access_token;
          console.log('access_token_mini=' + global.access_token_mini);
          cb && cb()
        })
        .catch(function (error) {
          console.log(error);
        });
  }
}

module.exports = ctx => {
    ctx.body = global.access_token_mini
}