import users from '../models/users.js'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import validator from 'validator'

export const create = async (req, res) => {
  try {
    await users.create(req.body) // 建立使用者
    res.status(StatusCodes.OK).json({
      success: true,
      message: ''
    })
  } catch (error) {
    console.log(error)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
      // 11000 = 重複的錯誤
    } else if (error.name === 'MongoServer' && error.code === 11000) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: '帳號已註冊'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

export const login = async (req, res) => {
  try {
    // jwt.sign(保存的資料, SECRET, 設定)
    const token = jwt.sign(
      { _id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7 days' }
    )
    req.user.tokens.push(token)
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      // 要回使用者資料
      result: {
        _id: req.user._id,
        account: req.user.account,
        email: req.user.email,
        token,
        role: req.user.role,
        name: req.user.name,
        avatar: req.user.avatar,
        finalGoal: req.user.finalGoal,
        cookieNum: req.user.cookieNum,
        accomplishment: req.user.accomplishment,
        startDate: req.user.startDate,
        friendsCode: req.user.friendsCode,
        status: req.user.status,
        uptime: req.user.uptime,
        todoList: req.user.todoList,
        createdAt: req.user.createdAt,
        friendsList: req.user.friendsList
      }
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

export const logout = async (req, res) => {
  try {
    // 過濾: 每一個token不等於這次請求的token
    req.tokens = req.user.tokens.filter(token => token !== req.token)
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: ''
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

export const extend = async (req, res) => {
  try {
    const idx = req.user.tokens.findIndex(token => token === req.token)
    // 簽新的token
    const token = jwt.sign(
      { _id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7 days' }
    )
    // 替換成新的token
    req.user.tokens[idx] = token
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: token
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

export const getProfile = (req, res) => {
  try {
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        _id: req.user._id,
        account: req.user.account,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name,
        avatar: req.user.avatar,
        finalGoal: req.user.finalGoal,
        cookieNum: req.user.cookieNum,
        accomplishment: req.user.accomplishment,
        startDate: req.user.startDate,
        friendsCode: req.user.friendsCode,
        status: req.user.status,
        uptime: req.user.uptime,
        todoList: req.user.todoList,
        createdAt: req.user.createdAt,
        friendsList: req.user.friendsList
      }
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

// 修改使用者資料(可以改頭貼 - 待新增)
export const edit = async (req, res) => {
  try {
    // 檢查 req.params.id 是否為有效的 MongoDB 的 ID
    if (!validator.isMongoId(req.params.id)) throw new Error('ID')

    // 1. 先把圖片路徑放進 req.body.image
    // 編輯時前端不一定會傳圖片，req.file 是 undefined，undefined 沒有 .path 所以要用 ?. 避免錯誤
    // instead of throwing an error, it will simply return undefined.
    req.body.avatar = req.file?.path
    // 2. 再丟 req.body 更新資料，如果沒有圖片 req.file?.path 就是 undefined，不會更新圖片
    // .findByIdAndUpdate(要修改的資料 ID, 要修改的資料, { 更新時是否執行驗證: 預設 false })
    await users.findByIdAndUpdate(req.params.id, req.body, { runValidators: true }).orFail(new Error('NOT FOUND')) // orFail() 如果沒有找到資料，就自動丟出錯誤

    res.status(StatusCodes.OK).json({
      success: true,
      message: ''
    })
  } catch (error) {
    console.log(error)
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'ID 格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '查無使用者'
      })
    } else if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

export const editFriend = async (req, res) => {
  try {
    if (!validator.isMongoId(req.body.userId)) throw new Error('ID')
    if (req.user.friendsList.find(friend => friend.friendsId === req.body.friendsId)) throw new Error('ADDED')
    req.user.friendsList.push({
      friendsId: req.body.friendsId,
      poked: req.body.poked
    })
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: req.user.friendsList
    })
  } catch (error) {
    console.log('editFriend', error)
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'ID 格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '查無使用者'
      })
    } else if (error.message === 'ADDED') {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: '已是好友'
      })
    } else if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(StatusCodes.BAD_GATEWAY).json({
        success: false,
        message
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

export const getFriend = async (req, res) => {
  try {
    // search by multiple codes
    // const friendsCodes = req.query.search

    // const data = await users.find({
    //   friendsCode: { $in: friendsCodes }
    // })

    // search by one code
    // const regex = new RegExp(req.query.search || '', 'i')
    // 找完全相同的friendsCode

    const data = await users.find({
      friendsCode: req.query.search
    })
    // console.log('req.query.search', req.query.search)
    // console.log('data', data)

    if (data.length === 0) throw new Error('NOT FOUND')
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: data
    })
  } catch (error) {
    console.log(error)
    if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '查無使用者'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}
