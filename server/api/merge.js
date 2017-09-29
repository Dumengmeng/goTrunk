import { Router } from 'express'
import axios from 'axios'
import fs from 'fs'
import xlsx from 'xlsx'
import child_process from 'child_process'
import process from 'process'
import schedule from 'node-schedule'
import Log from '../../model/models/log'

const router = Router()
const exec = require("child_process").exec;

// 服务器上分支的路径前缀
const SERVER_PATH = "***************************";

// trunk本地路径前缀
const TRUNK_LOCAL = "E:\\trunk\\";

// 服务器上trunk的路径前缀
const TRUNK_REMOTE = "*****************************";

// jenkins-cli.jar的父级地址(注意文件路径不能包含空格哦！)
const JENKINS_PATH = "D:\\ProgramFiles\\jenkins";

/*
* 获取盘符和路径
* path: 需要操作的目录
*/
const getPathInfo = (path) => {

    //盘符
    let drive = path.slice(0, 1);
    //目录
    let directory = path.slice(2);

    return {
        drive: drive,
        directory: directory
    };
}

/*
* 回退代码处理
*/
const revert = (urlLocal, resolve) => {
    console.log("=>开始执行revert操作........................");
    exec(getPathInfo(urlLocal).drive + ": && cd " + getPathInfo(urlLocal).directory + " && svn revert " + urlLocal + " -R", function(error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            process.exit();
        }
        console.log(urlLocal + " revert操作执行ok! \n");
        resolve && resolve();
    })
}

/*
* 提交代码处理
*/
const commit = (urlLocal, suffixTrunk, revisions, resolve) => {
    var versionInfo = (revisions.indexOf("r") !== revisions.lastIndexOf("r")) ? /r(\d+)/.exec(revisions)[1] + " - " + revisions.slice(revisions.lastIndexOf("r") + 1).replace(/\D/g, "") : "r" + /r(\d+)/.exec(revisions)[1];
    console.log("\n=>开始执行commit操作........................");
    exec(getPathInfo(urlLocal).drive + ': && cd ' + getPathInfo(urlLocal).directory + ' && svn commit ' + urlLocal + ' -m "merge  ' + versionInfo + '  into trunk from ' + suffixTrunk + '"', function(error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            process.exit();
        }
        //若没有要提交的版本 则返回内容为空
        console.log("commit 输出:", stdout)
        console.log("commit操作执行成功！\n");
        resolve(stdout);
    })
}

/*
* 构建任务处理
*/
const buildTask = (commitLog, resolve) => {
    if (!commitLog) return;

    if (commitLog.indexOf("static_project") >= 0) {
        console.log("=>此为static_project前端项目\n");
        buildStaticProject(resolve);
    }
    if (commitLog.indexOf("static_zt") >= 0) {
        console.log("=>此为static_zt前端项目\n");
        buildStaticZt(resolve);
    }
    if (commitLog.indexOf("node_pro") >= 0) {
        console.log("=>此为node_pro后端项目\n");
        buildNodePro(resolve);
    }
    if (commitLog.indexOf("node_loc") >= 0) {
        console.log("=>此为node_loc后端项目\n");
        buildNodeLoc(resolve);
    }
}

/*
* 构建纯前端项目
*/
const buildStaticProject = (resolve) => {
    exec(getPathInfo(JENKINS_PATH).drive + ": && cd " + getPathInfo(JENKINS_PATH).directory + " && java -jar jenkins-cli.jar -s http://******************/jenkins/ build H5-and-Nodejs-Cimulation/test-HTML5-cimulation-static_project -s", function(error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            process.exit();
        }
        console.log(stdout);
        console.log("staticProject前端项目构建结束\n");
        resolve && resolve();
    })
}

/*
* 构建专题项目
*/
const buildStaticZt = (resolve) => {
    exec(getPathInfo(JENKINS_PATH).drive + ": && cd " + getPathInfo(JENKINS_PATH).directory + " && java -jar jenkins-cli.jar -s http://******************/jenkins/ build H5-and-Nodejs-Cimulation/test-HTML5-cimulation-static_zt -s", function(error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            process.exit();
        }
        console.log(stdout);
        console.log("staticZt前端项目构建结束\n");
        resolve && resolve();
    })
}

/*
* 构建NodePro项目
*/
const buildNodePro = (resolve) => {
    exec(getPathInfo(JENKINS_PATH).drive + ": && cd " + getPathInfo(JENKINS_PATH).directory + " && java -jar jenkins-cli.jar -s http://******************/jenkins/ build H5-and-Nodejs-Cimulation/test-HTML5-cimulation-node_pro -s", function(error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            process.exit();
        }
        console.log(stdout);

        exec(getPathInfo(JENKINS_PATH).drive + ": && cd " + getPathInfo(JENKINS_PATH).directory + " && java -jar jenkins-cli.jar -s http://******************/jenkins/ console H5-and-Nodejs-Cimulation/restart_nodePro-cimulation", function(error1, stdout1, stderr1) {
            if (error1) {
                console.log(error1.stack);
                process.exit();
            }
            // console.log(stdout1);
            console.log("NodePro项目构建结束并已重启服务\n");
            resolve && resolve();
        })
    })
}

/*
* 构建NodeLoc项目
*/
const buildNodeLoc = (resolve) => {
    exec(getPathInfo(JENKINS_PATH).drive + ": && cd " + getPathInfo(JENKINS_PATH).directory + " && java -jar jenkins-cli.jar -s http://******************/jenkins/ build H5-and-Nodejs-Cimulation/test-HTML5-cimulation-node_loc -s", function(error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            process.exit();
        }
        console.log(stdout);

        exec(getPathInfo(JENKINS_PATH).drive + ": && cd " + getPathInfo(JENKINS_PATH).directory + " && java -jar jenkins-cli.jar -s http://******************/jenkins/ console H5-and-Nodejs-Cimulation/restart_nodeLoc-cimulation", function(error1, stdout1, stderr1) {
            if (error1) {
                console.log(error1.stack);
                process.exit();
            }
            // console.log(stdout1);
            console.log("NodeLoc项目构建结束并已重启服务\n");
            resolve && resolve();
        })

    })
}

/*
* 重启node服务
*/
const restart = () => {
    console.log("重启开始~");
    exec(getPathInfo(JENKINS_PATH).drive + ": && cd " + getPathInfo(JENKINS_PATH).directory + " && java -jar jenkins-cli.jar -s http://******************/jenkins/ build H5-and-Nodejs-Cimulation/restart_nodePro-cimulation -s", function(error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            process.exit();
        }
        console.log(stdout);
        console.log("重启结束~");
    })
}

/* 
* 脚本执行返回信息的对象构建
* @param {info} 为用户提供的可见的信息
* @param {path} 用户合并的项目SVN路径
* @param {msgTitle} 执行合并操作返回的结果自定义名称(数据库存储所需)
* @param {msgShell} 执行合并操作的命令(数据库存储所需)
* @param {msgData} 执行合并操作返回的结果内容(数据库存储所需)
* @returns 合并操作返回信息的数据对象
*/
const storeDate = (info, path, msgTitle, msgShell, msgData) => {
    let d = new Date()
    let nowTime = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + '-' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
    return {
        info: info,
        svnPath: path,
        msgTitle: msgTitle,
        msgShell: msgShell,
        msgData: msgData,
        mergeTime: nowTime
    }
}

/*
* 合并主程序入口
*/
const mergeMain = (path, resolveExec) => {
    console.log(new Date().toLocaleString() + "**********************************************************");
    let inputStr = path.replace('http://10.200.3.7/svn/others/branches/', '');

    //若输入的参数为空，则直接退出
    if (!inputStr) {
        console.log("请输入分支路径部分(带构建仿真！！！)");
        process.exit();
    }

    //反斜杠统一替换为正斜杠、去掉字符串中的所有空格、去掉字符串开头和结束的正斜杠
    //由于前后替换的顺序有依赖关系，不建议一次性使用一个正则去判断
    inputStr = inputStr.replace(/\\/g, "/").replace(/\s\:/g, "").replace(/^\/+|\/+$/g, "").replace(/[\u4e00-\u9fa5]/g, "");

    // 需考虑是否提供各个环境的构建入口
    if (inputStr === "build") {

        //若输入字符串为build，依次构建各个项目
        Promise.resolve()
            .then(function(data) {
                return new Promise(function(resolve, reject) {
                    buildStaticProject(resolve);
                })
            })
            .then(function(data) {
                return new Promise(function(resolve, reject) {
                    buildStaticZt(resolve);
                })
            })
            .then(function(data) {
                return new Promise(function(resolve, reject) {
                    buildNodePro(resolve);
                })
            })
            .then(function(data) {
                return new Promise(function(resolve, reject) {
                    buildNodeLoc(resolve);
                })
            })
    } else {

        //截取第一个"/"之后的路径
        let str = inputStr;
        let suffixTrunk = "";
        if (str.indexOf("/") > -1) {
            suffixTrunk = str.slice(str.indexOf("/") + 1);
        }

        let suffixBranch = inputStr;

        //被合并的branch服务器路径
        let urlBranches = SERVER_PATH + suffixBranch;
        //需要合并的trunk本地路径
        let urlLocal = TRUNK_LOCAL + suffixTrunk;

        //trunk的服务器路径
        let urlTrunk = TRUNK_REMOTE + suffixTrunk;

        /*
        * 程序主逻辑模块
        */
        exec(getPathInfo(urlLocal).drive + ": && cd " + getPathInfo(urlLocal).directory + " && svn update && svn log " + TRUNK_REMOTE + " -l 1 -q", function(error, stdout, stderr) {
            if (error) {
                console.log("路径无效，请检查路径是否正确 : " + getPathInfo(urlLocal).drive + ": && cd " + getPathInfo(urlLocal).directory + " && svn update && svn log " + TRUNK_REMOTE + " -l 1 -q");
                console.log(error.stack);
                resolveExec && resolveExec(storeDate(
                    "路径无效，请检查路径是否正确!",
                    path,
                    "命令一(获取版本信息)执行错误",
                    getPathInfo(urlLocal).drive + ": && cd " + getPathInfo(urlLocal).directory + " && svn update && svn log " + TRUNK_REMOTE + " -l 1 -q",
                    error.stack
                ))
                // process.exit();
            }
            console.log(urlLocal + "路径有效~\n");
            let last_version = /r(\d+)/.exec(stdout)[1];

            new Promise(function(resolve, reject) {
                revert(urlLocal, resolve);
            }).then(function(data) {

                //获取merge过来的所有版本信息
                exec(getPathInfo(urlLocal).drive + ": && cd " + getPathInfo(urlLocal).directory + " && svn mergeinfo --show-revs=eligible " + urlBranches + " " + urlTrunk, function(error1, stdout1, stderr1) {
                    if (error1) {
                        console.log(error1.stack);
                        resolveExec && resolveExec(storeDate(
                            "获取SVN版本信息出错，请手动执行合并操作",
                            path,
                            "命令二(获取合并项目版本信息)执行错误",
                            getPathInfo(urlLocal).drive + ": && cd " + getPathInfo(urlLocal).directory + " && svn mergeinfo --show-revs=eligible " + urlBranches + " " + urlTrunk,
                            error1.stack
                        ))
                        // process.exit();
                    }
                    
                    //该步需要在上一步执行完之后再执行
                    //若命令执行结果为空，则没有需要合并的版本
                    if (!stdout1) {
                        console.log("WARN : 没有需要合并的版本!\n");
                        resolveExec && resolveExec(storeDate(
                            "没有需要合并的版本!",
                            path,
                            "命令二(获取合并项目版本信息)执行完毕",
                            getPathInfo(urlLocal).drive + ": && cd " + getPathInfo(urlLocal).directory + " && svn mergeinfo --show-revs=eligible " + urlBranches + " " + urlTrunk,
                            "没有需要合并的版本" + stdout1
                        ))
                        // process.exit();
                    } else {
                        let revisions = /r(\d+)/.exec(stdout1)[1];
                        // console.log("trunk分支最新版本：" + last_version);
                        // console.log("branch分支最新版本：" + revisions);
                        console.log("=>开始执行merge操作........................");

                        //执行merge操作，根据返回信息执行不同操作
                        console.log(getPathInfo(urlLocal).drive + ": && cd " + getPathInfo(urlLocal).directory + " && svn merge --accept mc " + urlBranches);
                        exec(getPathInfo(urlLocal).drive + ": && cd " + getPathInfo(urlLocal).directory + " && svn merge --accept mc " + urlBranches, function(error2, stdout2, stderr2) {

                            // 如果出现冲突，则终止合并，并revert；否则，进行提交、构建操作
                            if (error2) {

                                //TODO 需测试该操作冲突时具体返回的是什么
                                console.log(suffixBranches + "合并出现了冲突！");
                                revert(urlLocal);
                                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                                console.log("执行完毕，自动有冲突，请手动合并（已回退本地合并内容）!");
                                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                                console.log(error2.stack);

                                resolveExec && resolveExec(storeDate(
                                    "合并出现冲突，请手动执行合并操作!",
                                    path,
                                    "命令三(merge操作)执行错误",
                                    getPathInfo(urlLocal).drive + ": && cd " + getPathInfo(urlLocal).directory + " && svn merge --accept mc " + urlBranches,
                                    error2.stack
                                ))
                                // process.exit();
                            }

                            //merge返回的数据，若有"C"，则表明有冲突
                            let resultArr = stdout2.split("\n");
                            let conflictTag = false;
                            for (let i = 0, len = resultArr.length; i < len; i++) {
                                if (resultArr[i].slice(0, 2).indexOf("C") >= 0) {
                                    conflictTag = true;
                                    break;
                                };
                            }

                            if (conflictTag) {

                                //有冲突的情况
                                revert(urlLocal);
                                console.log("执行完毕，自动有冲突，请手动合并（已回退本地合并内容）!")
                                resolveExec && resolveExec(storeDate(
                                    "合并出现冲突，请手动执行操作!",
                                    path,
                                    "命令三(merge操作)执行错误",
                                    getPathInfo(urlLocal).drive + ": && cd " + getPathInfo(urlLocal).directory + " && svn merge --accept mc " + urlBranches,
                                    stdout2
                                ))
                            } else {
                                //无冲突的情况
                                let commitMsg;
                                console.log("merge操作结束！");
                                new Promise.resolve()
                                    .then(function(data) {
                                        return new Promsie(function(resolve, reject) {
                                            commit(urlLocal, inputStr, stdout1, resolve);
                                        })
                                    })
                                    .then(function(data) {
                                        return new Promise(function(resolve, reject) {
                                            let url = res + " " + urlTrunk;
                                            // 考虑一个恰当的构建方式，当所有的svn路径合并完之后统一执行构建操作，还是添加构建入口，还是每一次commit操作都自带构建
                                            // 若没有需要合并的版本则不需要构建
                                            buildTask(url, resolve);
                                        })
                                    })
                                    .then(function(data) {
                                        resolveExec && resolveExec(storeDate(
                                            "上仿真操作执行完毕，并已构建重启!",
                                            path,
                                            "命令四(commit操作)执行完毕",
                                            getPathInfo(urlLocal).drive + ': && cd ' + getPathInfo(urlLocal).directory + ' && svn commit ' + urlLocal + ' -m "merge  ' + versionInfo + '  into trunk from ' + suffixTrunk + '"',
                                            data
                                        ))
                                    })
                            }
                        })
                    }
                })
            });
        })
    }
}


router.post('/merge', function(req, res, next) {

    // 禅道测试链接：http://ipm.lvmama.com/index.php?m=task&f=view&task=60321
    // 需测试单条svn路径的情况
    let taskSvnPath = decodeURIComponent(req.body.path || '')
    let userName = decodeURIComponent(req.body.userName || '')
    let regExp = /http:\/\/10.200.3.7\/svn\/others\/branches(\/[\w|\.\_]+)+/g
    let pathArr = taskSvnPath.match(regExp)

    /*
     * 主程序入口
     * 逐条合并svn路径，并将每一条合并执行返回的结果保存
     * @param {pathArr} 要合并的svn路径数组
     * @returns {promiseArr} 每一条svn路径对应的Promise对象
     */
    const main = (pathArr = []) => {
        let promiseArr = []
        if (pathArr.length > 0) {
            promiseArr = pathArr.map((item, i) => {
                return new Promise((resolve, reject) => {
                    /* 
                    * 若执行成功，数据库只保存最后一次命令执行返回的结果
                    * 若执行失败，数据库只保存最后一次命令执行返回的结果
                    * 不保存每一条命令执行返回的结果
                    */
                    console.log("item: " + item)
                    mergeMain(item, resolve)
                })
            })
        }
       return promiseArr
    }

    /* 
    * 执行所有svn路径对应的Promise对象
    * 只有当所有的promise都执行完，才会返回数组数据
    *  resArr、errArr为每一个promise执行结果的数组
    */
    // TODO 不顺序执行会导致多个合并操作同时进行 从而svn被locked
    const execAll = () => {
        return Promise.all(main(pathArr))
    }
    execAll().then(resArr => {
        resArr.forEach((item, i) => {
            item.userName = userName
        })
        console.log(resArr)
        /* 数据存储,插入文档对象 */
        Log.collection.insert(resArr, function(err, docs) {
            if (err) { console.log('保存出错: ' + err) }
        })
        res.json({success: 1, message: '脚本执行完毕', msgArr: resArr})
    }).catch(errArr => {
        console.log("err : ", errArr)
        res.json({success: 0, message: '脚本执行出错', msgArr: errArr})
    })

})

export default router