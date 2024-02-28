import { Router } from 'express'
import { create, login, logout, extend, getProfile, edit, editFriend, getFriend } from '../controllers/users.js'
import * as auth from '../middlewares/auth.js'
// import upload from '../middlewares/upload.js'

const router = Router()

router.post('/', create)
router.post('/login', auth.login, login)
router.delete('/logout', auth.jwt, logout)
router.patch('/extend', auth.jwt, extend)
router.get('/me', auth.jwt, getProfile)
router.patch('/me', auth.jwt, edit)
router.patch('/friends', auth.jwt, editFriend) // 新增好友
router.get('/friends', auth.jwt, getFriend) // 搜尋OK
router.patch('/:id', auth.jwt, edit)

export default router
