// 云函数入口文件
const cloud = require('wx-server-sdk')
const rq = require('request-promise')
cloud.init()

const request_token = async () => {
    return new Promise(async (resolve, reject) => {
        const secret = '这里填入你的小程序开发密钥';
        let {
            APPID
        } = cloud.getWXContext();
        let url_get_token = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + APPID + '&secret=' + secret;
        rq({
            method: 'GET',
            uri: url_get_token
        }).then(async (str_res) => {
            const res = JSON.parse(str_res);
            const db = cloud.database();
            const token = res ? res.access_token : null;
            console.log(url_get_token, res, token);
            await db.collection('consts').doc('wx_access_token').set({
                data: {
                    value: token
                }
            });
            console.log('请求新的access_token成功:' + token);
            resolve(token);
        }).catch(err => {
            console.log('请求新的access_token出错:' + err);
            reject(err);
        });
    });
}

const request_check_msg = async (content, access_token) => {
    return new Promise(async (resolve, reject) => {
        if (!access_token) {
            await request_token().then(res => {
                access_token = res;
            });
        }
        if (!access_token) {
            reject();
            return;
        }
        const url_check_msg = 'https://api.weixin.qq.com/wxa/msg_sec_check?access_token=' + access_token;
        console.log('请求内容检查, content:' + content);
        rq({
            method: 'POST',
            uri: url_check_msg,
            body: JSON.stringify({
                content: content
            })
        }).then(async (str_res) => {
            console.log('msg_check.res:' + str_res);
            const res = JSON.parse(str_res);
            const errcode = parseInt(res.errcode);
            if (errcode == -1 || errcode == 40001) {
                console.log('内容检查失败, token error, retry...');
                await request_check_msg(content, null).then(resolve);
                return;
            } else {
                resolve(res);
            }
        }).catch(err => {
            console.log('request_check_msg, reject');
            reject(err);
        })
    });
}

/**
 * 内容检查
 * TODO access_token单独拎出来
 */
exports.main = async (event, context) => {
    const content = event.content;
    const db = cloud.database();
    console.log('content:' + content);
    var access_token;
    await db.collection('consts').doc('wx_access_token').get().then(res => {
        access_token = res.data.value;
    });
    console.log('查找数据的access_token:' + access_token);
    return request_check_msg(content, access_token);
}