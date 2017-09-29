import { Router } from 'express'
import axios from 'axios'

const router = Router()
const users = [
    { name: 'Alexandre', pwd: "123" },
    { name: 'Pooya', pwd: "123" },
    { name: 'Sébastien', pwd: "123" },
    { name: 'Lydia', pwd: "123" },
]
router.get('/login', function(req, res, next) {
    res.json(users)
})

export default router