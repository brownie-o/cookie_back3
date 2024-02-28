// 想手動新增分類
import { Schema, model } from 'mongoose'

const schema = new Schema({
  categories: {
    type: [String]
  }
})

export default model('categories', schema)

// const category = ref(['課業', '家務', '休閒', '自我管理'])
