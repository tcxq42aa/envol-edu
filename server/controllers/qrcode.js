const axios = require('axios')
const config = require('../config')

// module.exports = async (ctx, next) => {
//   const path = decodeURIComponent(ctx.request.query.path);
//
//   return authorization(path).then(result => {
//     console.log(1111111)
//     ctx.state.data = {
//       msg: 'Hello World'
//     }
//     return next()
//   })
// }
//
// function authorization(path) {
//   return axios.post(`https://api.weixin.qq.com/wxa/getwxacode?access_token=` + global.access_token_mini, { path }).then( response => {
//     return response;
//   })
// }

module.exports = async (ctx, next) => {
  const path = decodeURIComponent(ctx.request.query.path);
  const resp = await axios.post(`https://api.weixin.qq.com/wxa/getwxacode?access_token=` + global.access_token_mini, { path });
  // ctx.set('Content-Type', resp.headers['content-type']);
  // ctx.set('content-disposition',  resp.headers['content-disposition']);
  // ctx.set('Content-Length',  resp.headers['content-length']);
  ctx.type = 'image/jpg'; // type - string
  // ctx.type = 'application/octet-stream'; // type - string
  // ctx.attachment('test.jpg'); // name - string
  // console.log(Buffer.isBuffer(resp.data));
  ctx.length = resp.headers['content-length'];
  ctx.body = resp.data;
}