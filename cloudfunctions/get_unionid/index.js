// 云函数入口文件
const cloud = require('wx-server-sdk')
const rq = require('request');
const WXBizDataCrypt = require('./WXBizDataCrypt')

cloud.init()

/**
 * 获取用户信息，不传参数则只返回openId，否则会返回用户信息
 * @param code wx.login获取
 * @param iv wx.getUserInfo获取
 * @param encryptedData wx.getUserInfo获取
 */
exports.main = async (event, context) => {
    let {
        OPENID,
        APPID,
        UNIONID
    } = cloud.getWXContext()
    let code = event.code;
    let iv = event.iv;
    let encryptedData = event.encryptedData;
    console.log(`code:${code}, iv:${iv}, encryptedData:${encryptedData}`);
    if (!code || !iv || !encryptedData) {
        return {
            openId: OPENID,
            appid: APPID,
            unionId: UNIONID
        };
    }
    let secret = '填入你的小程序开发密钥';
    let url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + APPID + '&secret=' + secret + '&js_code=' + event.code + '&grant_type=authorization_code';
    return new Promise((resolve, reject) => {
        new Promise((resolve, reject) => {
            try {
                rq(url, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        return resolve(body);
                    } else {
                        return reject(error);
                    }
                })
            } catch (err) {
                return reject(err);
            }
        }).then(res => {
            let result = JSON.parse(res);
            let sessionKey = result.session_key;
            // console.log(sessionKey);
            let pc = new WXBizDataCrypt(APPID, sessionKey);
            let data = pc.decryptData(encryptedData, iv);
            return resolve(data);
        });
    });
}