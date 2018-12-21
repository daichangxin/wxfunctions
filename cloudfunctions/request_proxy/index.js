// 云函数入口文件
const cloud = require('wx-server-sdk')
const rq = require('request-promise')
cloud.init()

/**
 * 请求代理
 */
exports.main = async (event, context) => {
    return await rq({
        method: event.method,
        uri: event.uri,
        headers: event.headers ? event.headers : {},
        body: event.body
    }).then(body => {
        return body
    }).catch(err => {
        return err
    })
}