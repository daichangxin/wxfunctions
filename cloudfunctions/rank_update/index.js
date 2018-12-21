// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

/**
 * 上报score数据
 * @param type 数据库name
 * @param userId 用户userId
 * @param score 数值
 */
exports.main = async (event, context) => {
    const db = cloud.database();

    const type = event.type;
    const userId = event.userId;
    const score = event.score;

    const cur_data = {
        userId: userId,
        score: score,
        updateTime: db.serverDate()
    };
    await db.collection(type).doc(userId).set({
        data: cur_data
    });

    return cur_data;
}