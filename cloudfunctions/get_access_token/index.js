// 云函数入口文件
const cloud = require('wx-server-sdk')
const rq = require('request-promise')

cloud.init()

// 云函数入口函数
/**
 * 拉取微信access_token
 * 需要配置数据consts
 * @param token 已失效的token，其他地方使用的时候如果报错失效，则传过来旧的token以更新
 */
exports.main = async(event, context) => {
    const wxContext = cloud.getWXContext();
    let {
        OPENID,
        APPID,
        UNIONID
    } = cloud.getWXContext();

    const old_token = event.token;

    const db = cloud.database();
    const tokenQuery = await db.collection('consts').doc('wx_access_token').get();
    let cur_token = tokenQuery.data;
    console.log(cur_token);
    if (cur_token && cur_token.access_token != old_token) return cur_token;

    //没有token or 废弃token与现有token相同，说明已过期，请求新的token
    const secret = 'YourSecret';
    console.log('appId:' + APPID);
    const url_get_token = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + APPID + '&secret=' + secret;
    return new Promise(async(resolve, reject) => {
        await rq({
            method: 'GET',
            uri: url_get_token
        }).then(async(str_res) => {
            const res = JSON.parse(str_res);
            if (!res.errcode) {
                cur_token = {
                    access_token: res.access_token,
                    expires_in: db.serverDate({
                        offset: res.expires_in
                    })
                };
                await db.collection('consts').doc('wx_access_token').set({
                    data: cur_token
                });
                console.log('请求新的access_token成功');
                resolve(cur_token);
            } else {
                console.log('请求新的access_token出错:' + res);
                reject(res);
            }

        }).catch(err => {
            console.log('请求新的access_token出错:' + err);
            reject(err);
        });
    });

}