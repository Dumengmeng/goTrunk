<template>
  <section class="container">
    <header>
      <h2>合并</h2>
    </header>
    <div class="center">
        <p><textarea name="" id="taskUrl" rows="1" placeholder="上线任务链接" autofocus="true" @keyup.enter="nextInput"></textarea></p>
        <p><input id="taskID" type="text" placeholder="上线任务ID" @keyup.enter="nextInput"></p>
        <p><span id="errMsg"></span></p>
        <p><button id="merge" @click="merge">仿真合并</button></p>
    </div>

    <div id="loading">
      <div class="dataLoading"><i></i><i></i><span>加载中...</span></div>
    </div>

    <div class="output">
      <ol>
        <li v-for="(item, index) in output" :key="index">{{item.svnPath}}
          <!-- <p>{{item.svnPath}}</p> -->
          <p>{{item.info}}</p>
        </li>
      </ol>
    </div>

  </section>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  data () {
    return {
      isLogin: false,
      output: []
    }
  },
  head () {
    return {
      title: 'Trunk Merge'
    }
  },
  mounted () {
    this.$nextTick(this.login)
  },
  methods: {
    login () {
      let ipmMyUrl = 'http://ipm.lvmama.com/index.php?m=my&f=profile&t=json'
      axios.get(ipmMyUrl).then(res => {
        res = res.data
        let data = JSON.parse(res.data)
        if (res.status === 'success' && data.hasOwnProperty('user')) {
          this.isLogin = true
          console.log('用户已登录禅道!')
        } else {
          console.log('用户未登录')
          window.location.href = '/goTrunk/login?url=' + location.href
        }
      }).catch(err => {
        console.log(err)
      })
    },
    getElem (selector) {
      return document.querySelector(selector)
    },
    alertInfo (str, fn) {
      let msgElem = this.getElem('#errMsg')
      msgElem.innerHTML = str
      setTimeout(() => {
        msgElem.innerHTML = ''
        if ({}.toString.call(fn) === '[object Function]') {
          fn()
        }
      }, 3000)
    },
    hideLoading () {
      this.getElem('#loading') && (this.getElem('#loading').style.display = 'none')
    },
    showLoading () {
      this.getElem('#loading') && (this.getElem('#loading').style.display = 'block')
    },
    merge () {
      // 需有一个总的权限开关，用于紧急情况关闭该上仿真入口！

      let taskID = this.getElem('#taskID').value // 禅道任务ID
      let taskUrl = this.getElem('#taskUrl').value.replace(/\s*/, '') // 禅道任务URL
      let regExp = /http:\/\/***********\/svn\/others\/branches(\/[\w|.|_]+)+/g
      let testUrlReg = /http:\/\/ipm.lvmama.com\/index.php\?m=task&f=view&(task|taskID)=/g
      let userName = document.cookie.split('=')[1]
      let publishDay // 是否为发布日
      let finishTime // 当天截止发布的时间

      this.showLoading()
      this.getElem('.output').style.display = 'none'

      // 判断当天是否为发布日(当前暂定发布日为每周的周一和周三)
      let nowDay = new Date()
      let week = nowDay.getDay()
      if (week === 1 || week === 3) {
        publishDay = true
        finishTime = new Date(nowDay.getFullYear(), nowDay.getMonth(), nowDay.getDate(), 17, 30, 0)
      } else if (week === 2 || week === 4 || week === 5) {
        publishDay = false
        finishTime = new Date(nowDay.getFullYear(), nowDay.getMonth(), nowDay.getDate(), 20, 30, 0)
      } else {
        this.alertInfo('周六、周日需手动上仿真')
        return
      }

      // 发布日: 17:30之后，需手动上仿真
      // 非发布日: 20:30之后，需手动上仿真
      if (publishDay && (nowDay >= finishTime)) {
        this.alertInfo('发布日: 17:30之后，需手动上仿真')
        this.hideLoading()
        return
      } else if (!publishDay && (nowDay >= finishTime)) {
        this.alertInfo('非发布日: 20:30之后，需手动上仿真')
        this.hideLoading()
        return
      }

      // 判断禅道url或id格式是否有效
      // 若URL和ID同时输入，则以URL为准
      if (taskUrl !== '' || taskID !== '') {
        if (taskUrl !== '') {
          if (taskUrl.replace(testUrlReg, '').replace(/\d*/, '').length > 0) {
            this.alertInfo('禅道URL无效')
            this.hideLoading()
            return
          }
          taskUrl = taskUrl + '&t=json'
        } else if (taskID !== '') {
          if (taskID.replace(/\d*/, '').length > 0) {
            this.alertInfo('禅道ID无效')
            this.hideLoading()
            return
          }
          taskUrl = 'http://ipm.lvmama.com/index.php?m=task&f=view&task=' + taskID + '&t=json'
        }
      } else {
        this.alertInfo('请输入禅道URL或禅道ID')
        this.hideLoading()
        return
      }

      /* 
      * 判断禅道时间是否有效 (仅考虑周一到周五工作日的合并)：
      * （一个禅道里边包含多个路径，比如升级插件，或接口升级等涉及多个项目的）
      * 周二 00:00 -> 周三24:00 本周三发布（周三 二次发布或凌晨发布的情况，需手动上仿真）
      * 周四 00:00 -> 周一24:00 -> 本周一发布（周一 二次发布或凌晨发布的情况，需手动上仿真）
      * 紧急发布需手动上仿真
      */
      axios.get(taskUrl).then(res => {
        try {
          this.hideLoading()
          let data = res.data
          if (res.data.status === 'success') {
            data = JSON.parse(data.data)
            let deadline = data.task.deadline // 禅道截止日期
            let taskSvnPath = data.taskrelease.releasetrunk || '' // 禅道任务涉及项目的SVN路径
            let chandaoDay = new Date(Date.parse(deadline.replace(/-/g, '/')))
            // taskSvnPath可能为多个项目路径
            const goTrunk = (taskSvnPath) => {
              console.log(taskSvnPath)
              if (taskSvnPath) {
                this.alertInfo('禅道有效，开始合仿真操作...')
                axios.post('/api/merge', {
                  path: encodeURIComponent(taskSvnPath),
                  userName: userName || ''
                }).then(res => {
                  let resData = res.data
                  if (Array.isArray(resData.msgArr) && resData.msgArr.length > 0) {
                    this.output = resData.msgArr
                    this.getElem('.output').style.display = 'block'
                  } else {
                    console.log('合并出错，请稍后重试')
                  }
                }).catch(err => {
                  console.log('合并出错，请稍后重试', err)
                })
              } else {
                this.alertInfo('禅道任务涉及项目的SVN路径为空')
              }
            }

            // 判断禅道是否为H5的任务: 暂时仅支持node_pro、static_project、node_loc、static_zt路径下任务的合并
            if (taskSvnPath) {
              let pathArr = taskSvnPath.match(regExp)
              let res = pathArr.every(item => {
                return (item.indexOf('node_pro') >= 0 || item.indexOf('static_project') >= 0 || item.indexOf('static_zt') >= 0 || item.indexOf('node_loc'))
              })
              if (!res) {
                this.alertInfo('请确认该任务涉及的项目是否均为H5的SVN路径')
                return
              }
            }

            // 除周一、周三发布的，暂时均视为紧急发布，需手动上仿真
            if ((chandaoDay.getDay() + 1) === 2 || (chandaoDay.getDay() + 1) === 4 || (chandaoDay.getDay() + 1) === 5) {
              this.alertInfo('请确认该任务是否为紧急发布，紧急任务需手动上仿真')
              return
            }

            // 周一、三上仿真的情况：发布日，上仿真禅道时间不能超过当天
            if (chandaoDay.getDay() === 1) {
              if (chandaoDay.getDate() - 4 <= nowDay.getDate() <= chandaoDay.getDate()) {
                goTrunk(taskSvnPath)
              } else {
                this.alertInfo('该禅道截止时间非下个发布日，请重新确认禅道')
                return
              }
            } else if (chandaoDay.getDay() === 3) {
              if (nowDay.getDate() === chandaoDay.getDate() - 1 || nowDay.getDate() === chandaoDay.getDate()) {
                goTrunk(taskSvnPath)
              } else {
                this.alertInfo('该禅道截止时间非下个发布日，请重新确认禅道')
                return
              }
            } else {
              goTrunk(taskSvnPath)
            }
          } else {
            this.alertInfo('禅道URL或禅道ID无效，请刷新页面重试')
            this.hideLoading()
          }
        } catch (err) {
          console.log(err)
        }
      }).catch(err => {
        this.alertInfo('禅道URL或禅道ID无效，请刷新页面重试')
        this.hideLoading()
        console.log(err)
      })
    },
    nextInput () {
      let currentEle = event.target
      let currentId = event.target.id
      let nextEle

      if (currentId === 'taskUrl') {
        nextEle = this.getElem('#taskID')
      } else if (currentId === 'taskID') {
        nextEle = this.getElem('#merge')
      }

      if (currentId === 'taskUrl') {
        nextEle.focus()
      } else {
        currentEle.blur()
        nextEle.click()
      }
    }
  }
}
</script>

<style scoped>
  textarea{
    padding: 2px;
    width: 40%;
    height: 30px;
    font-size: 16px;
  }

  p input{
    width: 40%;
  }

  @media screen and (max-width:600px) {
    p input, textarea{
      width: 70%;
    }
  }

  .center{
    top: 38%
  }

  .output{
    display: none;
    padding: 10px;
    width: 100%;
    position: absolute;
    margin: 10px;
    top: 50%;
    max-height: 250px;
    overflow-y: scroll;
  }

  .output ol{
    margin-left: -16px;
    word-break: break-all;
    word-wrap: break-word;
  }

  .output ol li{
    color: #fff;
    margin-bottom: 10px;
  }

  .output ol li p{
    margin: 0;
    text-align: left;
    display: inline-block;
    word-break: break-all;
    word-wrap: break-word;
  }



</style>
