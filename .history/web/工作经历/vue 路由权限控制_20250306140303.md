### 方案1：前端路由列表管理权限

选择的方案是在路由列表中增加权限，然后通过`router.addRoute()`实现。

1. 登录的时候记录用户的权限（角色等）
2. 在路由的配置项里配置权限
    
    `router/index.js`文件内
    
    ```json
    export const constantRoutes = [];//无需权限判断的页面
    export const asyncRoutes = []; //需要权限处理的页面
    //需要判断的页面 增加 配置项
    meta:{
    	roles: ['admin', 'editor'] //根据项目要求可以变更格式
    }
    ```
    
3. 路由钩子判断权限  (router目录下新增permission.js文件）
    
    ```js
    router.beforeEach((to, from, next) => {
    	//...省略 登录token的判断
    	const addRoutes = store.getters.addRoutes;//取vuex中存的addRoutes列表
    	if(addRoutes.length){//如何长度不为0  说明已经生成了路由列表 直接跳转即可
    		next();
    	} else {//不然就要根据用户权限，生成
    			const {roles} = store.getters.userInfo;//取用户权限信息
    			store.dispatch('permission/generateRoutes', roles ).then(() => { // 生成可访问的路由表
            router.addRoutes(store.getters.addRoutes) // 动态添加可访问路由表
            next({ ...to, replace: true }) // hack方法 确保addRoutes已完成 ,
          })
    	}
    }
    ```
    
4. 在store中添加对 路由的保存
    
    `store/modules/permission.js` 内
    
    ```js
    //引入  路由
    import { constantRoutes, asyncRoutes } from './index';
    
    //根据权限判断路由
    function hasPermission(roles, route) {
      if (route.meta && route.meta.roles) {
        return roles.some(role => route.meta.roles.includes(role))
      } else {
        return true
      }
    }
    
    /**
     * Filter asynchronous routing tables by recursion
     * @param routes asyncRoutes
     * @param roles
     */
    //遍历所有路由，包括子路由
    export function filterAsyncRoutes(routes, roles) {
      const res = []
      routes.forEach(route => {
        const tmp = { ...route }
        if (hasPermission(roles, tmp)) {
          if (tmp.children) {
            tmp.children = filterAsyncRoutes(tmp.children, roles)
          }
          res.push(tmp)
        } 
      })
      return res
    }
    
    //储存路由
    const state = {
    	routes:constantRoutes,//默认只添加不需要权限判断的路由列表
    	addRoutes:[],//存 权限判断后生成的列表
    }
    
    //更新state的mutation
    const mutations = {
    	SET_ROUTES:(state,routes){
    		state.addRoutes = routes;
    		state.routes = constantRoutes.concat(routes);
    	}
    }
    
    //异步actions
    const actions = {
    	generateRoutes({commit}, roles){
    		return new Promise(resolve => {
          let accessedRoutes;
          if (roles.includes('admin')) {
            accessedRoutes = asyncRoutes || []
          } else {
            accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
          }
          commit('SET_ROUTES', accessedRoutes)
          resolve(accessedRoutes)
        })
    	}
    }
    ```
    
    ### 方案2：后台存储权限路由。
    
    1. 在登录的时候，请求后台获取菜单列表，并处理。
    
    处理的函数如下
    
    ```tsx
    export function filterAsyncRouter(asyncRouterMap) {
        //注意这里的 asyncRouterMap 是一个数组
        const accessedRouters = asyncRouterMap.filter(route => {
            if (route.path && !route.IsButton) { //只有 path有值，并且不为按钮类型的需要处理
                if (route.Component === 'baseLayout') {//Layout组件特殊处理
                    route.component = Layout  //一般 以及菜单引入基础Layout，用于显示侧边栏，顶部栏等
                } else if(route.Component === 'blankLayout'){
                    route.component = blankLayout  //中间菜单则为空白模板
                }else if(route.Component === 'pageView'){
    								//显示页面 则根据path   导入对应的页面
                    try {
                        route.component = _import(route.path.replace('/:id',''))
                    } catch (e) {
                        try {
                            route.component = () => import('@/views' + route.path.replace('/:id',''));
                        } catch (error) {
                            console.info('%c 当前路由 ' + route.path.replace('/:id','') + '.vue 不存在，因此如法导入组件，请检查接口数据和组件是否匹配，并重新登录，清空缓存!', "color:red")
                        }
                    }
                }
            } 
    				//存在下级菜单的话，则递归执行此函数。
            if (route.children && route.children.length && !route.IsButton) {
                route.children = filterAsyncRouter(route.children)
            }
            return true
        })
    				//最好返回路由。
            return accessedRouters
    }
    ```
    
    1. 先通过vuex 存储在localstorage上。
    2. 处理完的菜单，通过router.addRouter添加到路由上 , 添加方法封装
    
    ```tsx
    router.$addRoutes = (params) => {
    //除去 按钮部分
      var f = item => {
          if (item['children']) {
              item['children'] = item['children'].filter(f);
              return true;
          } else if (item['IsButton']) {
              return item['IsButton']===false;
          }  else {
            return true;
          }
      }
      var params = params.filter(f);
      /* addRoutes  改成 addRoute 需要遍历 */
        for(let i=0;i<params.length;i++){
            // 暂时也从本地获取目录
            router.addRoute(params[i]);
        }
    }
    ```
