import { Schema, model, Error } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'
import UserRole from '../enums/UserRole.js'

const todoSchema = new Schema({
  task: {
    type: String,
    required: [true, '請輸入項目名稱'],
    default: '寫作業'
  },
  category: {
    type: String,
    required: [true, '請選擇項目類別'],
    enum: {
      values: ['工作', '學習', '休閒', '家務', '自我管理', '其他'],
      message: '項目類別錯誤'
    },
    default: '學習'
  },
  note: {
    type: String,
    default: ''
  },
  time: {
    type: Number,
    required: [true, '請設定預計花費的時間'],
    default: 1
  },
  id: {
    type: Number,
    default: 0
  },
  done: {
    type: Boolean,
    default: false
  },
  edit: {
    type: Boolean,
    default: false
  }
})

const friendsSchema = new Schema({
  friendsId: {
    type: String // 取別人的好友代碼
  },
  poked: {
    type: Boolean,
    default: false
  }
})

const schema = new Schema({
  account: {
    type: String,
    required: [true, '缺少使用者帳號'],
    minlength: [6, '使用者帳號長度不符'],
    maxlength: [20, '使用者帳號長度不符'],
    unique: true,
    validate: {
      validator (value) {
        return validator.isAlphanumeric(value)
      },
      message: '使用者帳號格式錯誤'
    }
  },
  email: {
    type: String,
    required: [true, '缺少使用者信箱'],
    unique: true,
    validate: {
      validator (value) {
        return validator.isEmail(value)
      },
      message: '使用者信箱格式錯誤'
    }
  },
  password: {
    // 驗證要另外寫
    type: String,
    required: [true, '缺少使用者密碼']
  },
  tokens: {
    type: [String]
  },
  role: {
    type: Number,
    default: UserRole.USER
  },
  name: {
    type: String,
    required: [true, '缺少用戶名稱'],
    minlength: [0, '使用者帳號長度不符'],
    default () {
      return this.account
    }
  },
  avatar: {
    type: String, // 要改(要能上傳圖片)
    default () {
      return `https://source.boringavatars.com/beam/120/${this.account}?colors=907363,BFAE9F,D9CDBF,F2E8DC,8FA9BF`
    }
  },
  finalGoal: {
    type: String
  },
  cookieNum: {
    type: Number,
    minlength: [0, '你沒有餅乾了'],
    default: 0
  },
  accomplishment: {
    type: Number
  },
  friendsCode: {
    // 隨機生成
    type: String,
    default () {
      return `${this.account}#${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    }
  },
  status: {
    type: String,
    default: '休息中'
  },
  uptime: {
    type: String,
    default: '0:00'
  },
  todoList: {
    type: [todoSchema],
    default: [
      {
        task: '寫作業',
        category: '學習',
        note: '',
        time: 1,
        id: 0,
        done: false,
        edit: false
      }
    ]
  },
  friendsList: {
    type: [friendsSchema]
  }
}, {
  timestamps: true,
  versionKey: false
})

schema.pre('save', function (next) {
  const user = this // this = 要保存的資料, 給他一個叫做user的名字

  if (user.isModified('password')) {
    // 驗證
    if (user.password.length < 6 || user.password.length > 20) {
      const error = new Error.ValidationError(null)
      error.addError('password', new Error.ValidationError({ message: '密碼長度不符' }))
      next(error)
      return
    } else {
      user.password = bcrypt.hashSync(user.password, 10)
    }
  }
  next()
})

export default model('users', schema)
