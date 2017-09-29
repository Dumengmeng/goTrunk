import { Router } from 'express'

import users from './users'

import login from './login'

import merge from './merge'

import log from './log'


const router = Router()

router.use(login)
router.use(merge)
router.use(log)

// Add USERS Routes
router.use(users)

export default router