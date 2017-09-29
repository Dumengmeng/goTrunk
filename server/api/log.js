import { Router } from 'express'
import Log from '../../model/models/log'

const router = Router()
/* mock data */
// let _log = new Log({
//     userName: 'ZanSan123',
//     msgTitle: '命令四(commit操作)执行完毕',
//     svnUrl: 'http://ipm.lvmama.com/index.php?m=task&f=view&task=60321',
//     msgShell: 'http://ipm.lvmama.com/index.php?m=task&f=view&task=60321http://ipm.lvmama.com/index.php?m=task&f=view&task=60321',
//     msgData: 'http://ipm.lvmama.com/index.php?m=task&f=view&task=60321http://ipm.lvmama.com/index.php?m=task&f=view&task=60321http://ipm.lvmama.com/index.php?m=task&f=view&task=60321http://ipm.lvmama.com/index.php?m=task&f=view&task=60321http://ipm.lvmama.com/index.php?m=task&f=view&task=60321http://ipm.lvmama.com/index.php?m=task&f=view&task=60321',
//     mergeTime: '2017/09/25 14:34',
// })


router.get('/log', function(req, res) {
    // 从数据库取log数据
    Log.fetch(function(err, logs) {
        if (err) { console.log('获取数据报错: ' + err); }
        console.log('logs : ' + logs)
        res.json({success: 1, loglist: logs})
    })
    
})

export default router 
