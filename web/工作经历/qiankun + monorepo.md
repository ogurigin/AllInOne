monorepo 使用的是 pnpm自带 workspaces;

1.  安装pnpm

```bash
yarn glabol add pnpm  / npm install -g pnpm

yarn glabol add pnpm // npm install -g pnpm
```

1. 建立空白项目文件，cd到该文件,并初始化

```bash
pnpm init
```

1. 根目录创建：pnpm-workspaces.yaml文件，用来配置monorepo项目

```bash
packages:
 - 'packages/*'
```

1. 创建主项目，项目目录记得写 packages/XXX 已有项目可以copy文件到该目录下

```bash
pnpm create vite
```

1. cd到主项目目录下，安装qiankun

```bash
pnpm i qiankun -S
```

1. 主项目src 文件下新建 config.ts 用于存放子应用信息，根据需要修改

```bash
export default {
  subApps: [
    {
      name: 'app-vue3', // 子应用名称，跟package.json一致
      entry: '//localhost:7001', // 子应用入口，本地环境下指定端口
      container: '#sub-container', // 挂载子应用的dom
      activeRule: '/app/app-vue3', // 路由匹配规则
      props: {} // 主应用与子应用通信传值
    },
    {
      name: 'app-vue2',
      entry: '//localhost:7002',
      container: '#sub-container',
      activeRule: '/app/app-vue2',
      props: {}
    }
  ]
}
```

1. src下新建 utils/qiankun，用于开启qiankun

```bash
import { registerMicroApps } from 'qiankun'
import config from '@/config'

const { subApps } = config
//生命周期，按需配置
export function registerApps() {
  try {
    registerMicroApps(subApps, {
      beforeLoad: [
        app => {
          console.log('before load', app)
        }
      ],
      beforeMount: [
        app => {
          console.log('before mount', app)
        }
      ],
      afterUnmount: [
        app => {
          console.log('before unmount', app)
        }
      ]
    })
  } catch (err) {
    console.log(err)
  }
}
```

1. 在src/components下新建一个用于挂载子应用的通用组件，需要和config文件中保持一致，这里我们用 SubContainer.vue

```bash
<template>
    <div id="sub-container"></div>
  </template>
  
  <script>
  import { start } from 'qiankun'
  import { registerApps } from '@/utils/qiankun'
  export default {
    mounted() {
      if (!window.qiankunStarted) {
        window.qiankunStarted = true
        registerApps()
        start({
          sandbox: {
            experimentalStyleIsolation: true // 样式隔离
          }
        })
      }
    }
  }
  </script>
```

1. router中配置对应的路由

```bash
const routes = [
  {
    path: '',
    redirect: { name: 'home' },
    meta: { title: '首页' },
    children: [
      {
        path: '/home',
        name: 'home',
        component: () => import('../views/home/index.vue')
      },
      {
        // history模式需要通配所有路由，详见vue-router文档
        path: '/app/app-vue3/:pathMatch(.*)*',
        name: 'app-vue3',
        meta: {},
        component: () => import('@/components/SubContainer.vue')
      },
    ]
  }
]

export default routes
```

1. 创建子应用 于主应用类似 包名 packages/subXXX

```bash
cd ../../  //切回monorepo项目根目录
pnpm creata vue
```

1. vite子项目需要安装适配qiankun插件  vite-plugin-qiankun

```bash
pnpm  i vite-plugin-qiankun --save-dev
```

1. 在vite.config.js 中引入qiankun，

```bash
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    qiankun('app-vue3', {
      useDevMode: true
    })
  ],
  server: {
    port: 7001,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
})
```

1. 路由模式是 history的话 需要匹配子应用的入口规则：修改 router/index

```bash
import {
  createRouter,
  createWebHistory
} from 'vue-router'
import routes from './routes'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const router = createRouter({
//哈希模式的话,路有前 加#/
  history: createWebHistory(
    qiankunWindow.__POWERED_BY_QIANKUN__
      ? '/app/app-vue3/'
      : '/'
  ),
  routes
})

export default router
```

1. 在main.ts里添加生命周期