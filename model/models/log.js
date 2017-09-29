/* 
* 定义模型
*/
import mongoose from 'mongoose'
import LogSchema from '../schemas/log'

const Log = mongoose.model("Log", LogSchema)

export default Log