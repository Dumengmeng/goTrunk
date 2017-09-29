<template>
  <section class="container">
    <header>
      <h2>
        日志列表
      </h2>
    </header>
    <div>
      <!-- <th @click='search'>查询</th> -->
    </div>
    <div class="table_wrap">
      <table>
        <thead>
            <tr>
                <th class="name">用户名</th>
                <th class="title">日志标题</th>
                <th class="url">SVN路径</th>
                <th class="order">执行命令</th>
                <th class="content">执行结果</th>
                <th class="time">合并时间</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(log, index) in loglist" :key="index">
                <td class="name">{{log.userName}}</td>
                <td class="title">{{log.msgTitle}}</td>
                <td class="url">{{log.svnPath}}</td>
                <td class="order">{{log.msgShell}}</td>
                <td class="content">{{log.msgData}}</td>
                <td class="time">{{log.mergeTime}}</td>
            </tr>
        </tbody>
    </table> 
    </div>
  </section>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  data () {
    return {
      isLogin: false,
      loglist: []
    }
  },
  head () {
    return {
      title: 'LogData'
    }
  },
  // 后台请求的url会自动在前边拼接域名和端口号,并且域名固定为localhost
  // Nuxt.js 会将 asyncData 返回的数据融合组件 data 方法返回的数据一并返回给当前组件
  // 由于asyncData方法是在组件 初始化 前被调用的，所以在方法内是没有办法通过 this 来引用组件的实例对象
  created () {
    this.$nextTick(this.login)
  },
  mounted () {
    this.getLog()
  },
  methods: {
    login () {
      // 判断登陆
      let ipmMyUrl = 'http://ipm.lvmama.com/index.php?m=my&f=profile&t=json'
      axios.get(ipmMyUrl).then(res => {
        res = res.data
        let data = JSON.parse(res.data)
        if (res.status === 'success' && data.hasOwnProperty('user')) {
          this.isLogin = true
          console.log('用户已登录禅道')
        } else {
          console.log('用户未登录')
          window.location.href = '/goTrunk/login?url=' + location.href
        }
      }).catch(err => {
        console.log(err)
      })
    },
    getLog () {
      // 获取日志数据
      axios.get('/api/log').then(res => {
        let data = res.data
        if (data.success === 1) {
          this.loglist = data.loglist
        }
      }).catch(err => {
        console.log('api/log接口请求失败: ' + err)
      })
    },
    search () {
      // TODO
    }
  }
}
</script>

<style scoped>

  .container{
    color: #fff;
  }

  .table_wrap{
    padding: 20px;
  }

  table{
    width: 100%;
    /* padding: 20px; */
    color: #ccc;
    border: 1px solid #666;
    border-collapse: collapse;
  }

  table th, table td{
    padding: 8px;
    border: 1px solid #666;
  }

   table th{
    white-space: nowrap;
   }

   table td{
     word-break: break-all;
     word-wrap: break-word;
   }

   table tbody tr:hover{
    color: #D3E01C;
   }

</style>
