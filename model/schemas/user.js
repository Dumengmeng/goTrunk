/* 
 * 定义模式
 */
const mongoose = require("mongoose");

let UserSchema = new mongoose.Schema({
    userName: String,
    userPwd: String,
    meta: {
        createAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
});

MovieSchema.pre("save", function(next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
    } else {
        this.meta.updateAt = Date.now();
    }
    // 将控制权交给下一个中间件或者它自己的目标函数
    next();
})

/* 
 * Adds static "class" methods to Models compiled from this schema.
 * 添加静态方法，使得Models从模式里边编译
 * 添加一条静态方法可用static方法:
 * schems.static("[methodName]", fn)
 */
MovieSchema.statics = {
    // 取出目前数据库中的所有数据
    fetch: function(cb) {
        return this
            .find({})
            .sort("meta.updateAt")
            .exec(cb)
    },
    // 根据ID查询数据
    findById: function(id, cb) {
        return this
            .findOne({ _id: id })
            .exec(cb)
    }
}

module.exports = MovieSchema;