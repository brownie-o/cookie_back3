import 'dotenv/config' // 讀env檔, 把讀到的放process.env裡面
import express from 'express' // 網頁伺服器
import mongoose from 'mongoose'
import cors from 'cors' // 是否允許跨域請求
import routeUsers from './routes/users.js'
// import routeProfile from './routes/profile.js'
import { StatusCodes } from 'http-status-codes'
import './passport/passport.js'

const app = express() // 建立server

// cors 設定允許哪些跨域請求
app.use(cors({
  // origin: 請求的來源 (如果用postman, origin 會是 undefined, 後端的請求也是)
  // callback(錯誤, 是否允許)
  origin (origin, callback) {
    if (origin === undefined || origin.includes('github') || origin.includes('localhost') || origin.includes('192.168') || origin.includes('devtunnels.ms')) {
      callback(null, true) // null: 沒有錯誤, true: 允許
    } else {
      callback(new Error('CORS'), false)
    }
  }
}))
app.use((_, req, res, next) => {
  res.status(StatusCodes.FORBIDDEN).json({
    success: false,
    message: '資料格式錯誤'
  })
})

// 解析進來的資料
app.use(express.json())
app.use((_, req, res, next) => {
  res.status(StatusCodes.BAD_REQUEST).json({
    // json格式不對
    success: false,
    message: '資料格式錯誤'
  })
})
app.use((req, res, next) => {
  console.log(req.body)
  next()
})
// 如果請求有被接受, 且來源是'/users' 就會進到 routes/users.js
app.use('/users', routeUsers)
// app.use('/profile', routeProfile)

// 讓其他沒有寫的路徑直接回應404
app.all('*', (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: '找不到'
  })
})

// 使用遠端伺服器使用的port 或是 4000
app.listen(process.env.PORT || 4000, async () => {
  console.log('伺服器啟動')
  await mongoose.connect(process.env.DB_URL)
  console.log('資料庫連線成功')
})
