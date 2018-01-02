const Koa = require('koa')
const app = new Koa()
const debug = require('debug')('koa-weapp-demo')
const response = require('./middlewares/response')
const bodyParser = require('koa-bodyparser')
const koaStatic = require('koa-static')
const proxy = require('koa-proxy');
const qiniu = require('qiniu');
const config = require('./config')

app.use(proxy({
    host:  'http://127.0.0.1:8080', // proxy alicdn.com...
    match: /^\/attach\//
}));

app.use(proxy({
    host:  'http://127.0.0.1:8080', // proxy alicdn.com...
    match: /^\/api\//
}));

app.use(koaStatic(__dirname + '/static'));

// 使用响应处理中间件
app.use(response)

// 解析请求体
app.use(bodyParser())

// 引入路由分发
const router = require('./routes')
app.use(router.routes())

// 启动程序，监听端口
app.listen(config.port, () => debug(`listening on port ${config.port}`))

// var mac = new qiniu.auth.digest.Mac('PxhHnzXZ93eeGp_kCSJaraO_N2FYSfc1CgU-kAVU', 'IwmAjZ1frkGqlZcqDDiTq3PbmByOpNxEbtGC0Nwy');
// var qiniuconfig = new qiniu.conf.Config();
// var bucketManager = new qiniu.rs.BucketManager(mac, qiniuconfig);
// var privateBucketDomain = 'http://oss.edu.envol.vip';
// var deadline = parseInt(Date.now() / 1000) + 20; // 1小时过期
// var privateDownloadUrl = bucketManager.privateDownloadUrl(privateBucketDomain, '86CC4AF1-06E8-49BF-956D-5AEB1EEBDD9C.png', deadline);
// console.log(privateDownloadUrl);

