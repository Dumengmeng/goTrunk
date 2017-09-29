<template>
  <section class="container">
    <header>
      <h2>登录</h2>
    </header>
    
    <div id="panel-content" class="center">
        <p><input id="account" type="text" placeholder="用户名" autofocus="true" @keyup.enter="nextInput"></p>
        <p><input id="password" type="password" placeholder="密码" @keyup.enter="nextInput"></p>
        <p><span id="errMsg"></span></p>
        <p><button id="btnLogin" @click="login">登录</button></p>
    </div>

  </section>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  data () {
    return {}
  },
  head () {
    return {
      title: 'Login'
    }
  },
  mounted () {
    this.$nextTick(this.testLogin)
  },
  methods: {
    testLogin () {
      let ipmMyUrl = 'http://ipm.lvmama.com/index.php?m=my&f=profile&t=json'
      let jumpUrl = window.location.href.indexOf('?') ? window.location.href.slice(window.location.href.indexOf('?') + 5) : ''
      axios.get(ipmMyUrl).then(res => {
        res = res.data
        let data = JSON.parse(res.data)
        if (res.status === 'success' && data.hasOwnProperty('user')) {
          console.log('用户已登录禅道!')
          if (jumpUrl) {
            window.location.href = decodeURIComponent(jumpUrl) || window.location.href
          }
          // window.location.href = '/goTrunk/merge'
        } else {
          console.log('用户未登录')
        }
      }).catch(err => {
        console.log(err)
      })
    },
    getElem (selector) {
      return document.querySelector(selector)
    },
    nextInput () {
      let currentEle = event.target
      let currentId = event.target.id
      let nextEle

      if (currentId === 'account') {
        nextEle = this.getElem('#password')
      } else if (currentId === 'password') {
        nextEle = this.getElem('#btnLogin')
      }

      if (currentEle.value === '') {
        currentEle.style.borderColor = '#d30775'
        setTimeout(() => {
          currentEle.style = 'none'
        }, 600)
      } else {
        if (currentId === 'account') {
          nextEle.focus()
        } else {
          nextEle.click()
        }
      }
    },
    login () {
      let that = this
      let impLoginUrl = 'http://ipm.lvmama.com/index.php?m=user&f=login&t=json'
      let pwd = this.getElem('#password').value
      let account = this.getElem('#account').value
      let jumpUrl = window.location.href.indexOf('?') ? window.location.href.slice(window.location.href.indexOf('?') + 5) : ''

      axios.get(impLoginUrl + '&account=' + account + '&password=' + pwd).then(res => {
        res = res.data
        if (res.status === 'success' && res.hasOwnProperty('user')) {
          document.cookie = 'userName=' + encodeURIComponent(res.user.realname)
          window.location.href = decodeURIComponent(jumpUrl) || window.location.href
        } else {
          that.getElem('#errMsg').innerHTML = res.reason
          setTimeout(() => {
            this.getElem('#errMsg').innerHTML = ''
          }, 3000)
          console.log(res.reason)
        }
      }).catch(err => {
        console.log('登陆失败！', err)
      })
    }
  }
}
</script>

<style scoped>
  h2{
    color: #fff;
  }
  .center .msg{
    margin: 0;
  }
  
  @media screen and (max-width:600px) {
    p input, textarea{
      width: 70%;
    }
  }

</style>
