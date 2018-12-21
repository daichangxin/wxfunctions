// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
/**
 * 云函数入口函数
 * 拉取formIndex开始的count数量的排行数据
 * 如果有userId则拉取userId的数据，并计算排行
 * 
 * @param type 数据库名字
 * @param fromIndex 查询开始索引
 * @param count 查询数量
 * @param userId 要查询的userId
 * @param orderBy 排序方式，仅接受从大到小'desc'和从小到大'asc'，默认'desc'
 */
exports.main = async (event, context) => {
    const db = cloud.database();
    const type = event.type;
    const fromIndex = event.fromIndex;
    let count = event.count;
    const userId = event.userId;
    let orderBy_type = event.orderBy;
    if (orderBy_type != 'desc' && orderBy_type != 'asc') {
        orderBy_type = 'desc';
    }

    const command = db.command;

    //查询到type总数据
    const typeQuery = await db.collection(type);
    const totalRes = await typeQuery.count();
    const total = totalRes.total;

    //查询个人信息
    let userInfo;
    if (userId) {
        const userQuery = await typeQuery.where({
            'userId': userId
        }).get();
        // console.log(userQuery);
        userInfo = userQuery.data && userQuery.data.length ? userQuery.data[0] : {};
        let userRankRes;
        if (orderBy_type == 'desc') {
            userRankRes = await typeQuery.where({
                score: command.gt(userInfo.score)
            }).count();
        } else {
            userRankRes = await typeQuery.where({
                score: command.lt(userInfo.score)
            }).count();
        }
        // console.log(userRankRes);
        userInfo.rank = userRankRes.total;
    }

    const scoreQuery = await typeQuery.orderBy('score', orderBy_type);

    //desc 从大到小
    let result = [];
    let query_count = count > 100 ? 100 : count;
    while (count > 0 && query_count > 0) {
        const res = await scoreQuery.skip(fromIndex + result.length).limit(query_count).get();
        if (res.data && res.data.length) {
            result = result.concat(res.data);
        }
        count -= query_count;
        query_count = count > 100 ? 100 : count;
    }
    return {
        data: result,
        total: total,
        user: userInfo
    };
}