// 云函数入口文件
const cloud = require('wx-server-sdk')
const rq = require('request-promise')
cloud.init();

const get_token = async (old_token) => {
    return new Promise((resolve, reject) => {
        cloud.callFunction({
            name: 'get_access_token',
            data: {
                token: old_token
            }
        }).then(res => {
            resolve(res.result.access_token);
        }).catch(reject);
    });
}

const request_check_msg = async (content, access_token) => {
    return new Promise(async (resolve, reject) => {
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
                access_token = await get_token(access_token);
                await request_check_msg(content, access_token).then(resolve);
            } else {
                resolve(res);
            }
        }).catch(err => {
            console.log('request_check_msg, reject');
            reject(err);
        })
    });
}

// 云函数入口函数
exports.main = async (event, context) => {
    const content = event.content;
    console.log('content:' + content);

    let access_token = await get_token();
    return request_check_msg(content, access_token);
}