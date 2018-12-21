// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();

/**
 * 上报用户数据到user数据库
 */
exports.main = async (event, context) => {
    let {
        OPENID
    } = cloud.getWXContext();
    const db = cloud.database();
    let curUserData = {
        update_time: db.serverDate(),
        openId: OPENID,
        userId: event.userId
    };
    if (event.unionId) {
        curUserData.unionId = event.unionId;
        curUserData.nickName = event.nickName;
        curUserData.avatarUrl = event.avatarUrl;
        curUserData.gender = event.gender;
        curUserData.province = event.province;
        curUserData.city = event.city;
        curUserData.country = event.country;
    }
    await db.collection('user').doc(curUserData.userId).set({
        data: curUserData
    });
    return curUserData;
}