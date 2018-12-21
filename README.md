# wxfunctions
小程序云函数

## 已实现

### get_unionid 
获取用户信息，获取用户授权后传参则返回用户信息，不传参则只返回openId

### msg_check 
微信内容检查接口调用，拉取access_token并检查
TODO access_token单独拎出来云函数方便其他地方使用

### rank_get 
排行拉取，拉取指定索引开始的指定数量排行数据，如果传入userId，则顺带userId的数据

### rank_update 
排行上报，需指定数据库名称和userId

### request_proxy 
转发代理，不需要在开发后台设置合法域名即可发送请求

### update_user 
更新用户信息，统计用户数据到user数据库
