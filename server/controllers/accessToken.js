const axios = require('axios')
const config = require('../config')

setInterval(function () {
  getAccessToken()
}, 7000000)
getAccessToken()
function getAccessToken(cb) {
  if (process.env.NODE_ENV == 'development') {
    axios.get('http://edu.envol.vip/weapp/accessToken').then((res)=> {
      global.access_token = res.data;
      console.log('access_token=' + global.access_token);
      cb && cb()
    });
  } else {
    axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.gzAppId}&secret=${config.gzAppSecret}`)
        .then(function (response) {
          global.access_token = response.data.access_token;
          console.log('access_token=' + global.access_token);
          cb && cb()
        })
        .catch(function (error) {
          console.log(error);
        });
  }
}

module.exports = ctx => {
    ctx.body = global.access_token
}