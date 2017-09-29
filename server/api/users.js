import { Router } from 'express'

const router = Router()

// Mock Users
const users = [
    { name: 'Alexandre', pwd: "123" },
    { name: 'Pooya', pwd: "123" },
    { name: 'Sébastien', pwd: "123" },
    { name: 'Lydia', pwd: "123" },
]

/* GET users listing. */
router.get('/users', function(req, res, next) {
    console.log(123)
    res.json(users)
})

/* GET user by ID. */
// router.get('/users/:id', function(req, res, next) {
//     const id = parseInt(req.params.id)
//     if (id >= 0 && id < users.length) {
//         res.json(users[id])
//     } else {
//         res.sendStatus(404)
//     }
// })


export default router