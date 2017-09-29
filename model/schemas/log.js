/* 
* 定义模式
*/
import mongoose from 'mongoose'

let LogSchema = new mongoose.Schema({
    userName: String,
    mergeTime: {
        type: String,
        default: new Date()
    },
    svnUrl: String,
    msgTitle: String,
    msgShell: String,
    msgData: String,
})

LogSchema.statics = {
    // 取出目前数据库中的所有数据
    fetch: function(cb) {
        return this
            .find({})
            .sort("mergeTime")
            .exec(cb)
    }
}

export default LogSchema