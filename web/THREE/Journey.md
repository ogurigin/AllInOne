## 基础

#### 关于旋转
在默认情况下，mesh的旋转都是按照XYZ的顺序旋转的，哪怕你先设置Y轴的旋转，在设置X轴的旋转。
如果想改变旋转的顺序可以设置：

```js
 mesh.rotation.reorder('YXZ')
```

### 关于动画
一般使用 `window.requstAnimationFrame()`来实现
这个方法实际不单单可以作为创建动画使用，他参数是一个方法，表示在下一帧的时候调用这个方法。

因为不同的设备，刷新率不一致，为了让我们的动画保持一致，
我们一般使用`Clock 类`中的 `getElapsedTime()`方法,它表示时钟实例创建以来经过的总时间（单位：s）;
```js
const clock = new THREE.Clock();
function animate() {
  const elapsedTime = clock.getElapsedTime();
  // 立方体每秒旋转1弧度（约57°）
  mesh.rotation.x = elapsedTime; 
  
}
```
利用这个时间，和sin/cos函数，就可以实现例如在X/Y轴上来回移动的动画
```js
     mesh.rotation.x = sin(elapsedTime); 
```
甚至是围绕原点转圈
```js
     mesh.rotation.x = cos(elapsedTime); 
     mesh.rotation.y = sin(elapsedTime); 
```
嗯，需要理解一下。

__Clock类中的getDelta__

之前看的教程，一般是使用这个方法，但最好不要用。
`getDelta()`指的是获取当前帧到上一帧的时间差，有时候会导致微小的误差。 
而且当浏览器关闭或者切换页面的时候，`requestAnimoationFrame()`会暂停，当切回来时候，`getDelta()`会出现一个比较大的值，而导致动画跳帧现象。
总而言之：
__使用getElapsedTime方法就好__

（动画可以了解下GreenSock）

### 关于相机
__透视相机：perspectiveCamera__
```js
const camera = new THREE.perspectiveCamera(
     fov,
     aspect,
     near,
     far
)
```
__正交相机：orthographicCamera__
```js
const camera = new THREE.orthographicCamera(
     left,
     right
     top,
     bottom,
     near,
     far,
)
```
***
#### 不错的canvas全屏的方法
（比我之前一直是用的100vw，100vh的方法来的好）
```css
*{margin:0;padding:0;}
html,body{overflow:hidden;}
/* 画布 */
#myCanvas{
     position:fixed;
     top:0;
     left:0;
     outline:none;/* 取消部分浏览器窗口的蓝色边框 */
}

```

#### 监听画布大小
```js
/* 开头定义sizes保存原始画布大小，一般全屏就是使用浏览器显示大小 */
sizes = {
     width:window.innerWidth,
     winth:window.innerHeight,
}
window.addEventListener('resize',()=>{
     /* 赋值sizes */
     sizes.width = window.innerWidth;
     sizes.height = window.innerHeight;

     /* 改变相机长宽比 */
     camera.aspect = sizes.width/sizes.height;
     camera.updateProjectMatrix();

     /* 调整渲染器*/
     renderer.setSize(sizes.width,sizes.height);
     /* 可以将设置像素比放在这里，以便改变浏览器缩放或者
     从一台显示器移动到另外一台显示器的时候及时更新（看情况增加吧） */
     //考虑性能，一般不需要超出2
     renderer.setPixelRadio(Math.min(window.devicePixelRadio,2))
})
```

### 双击全屏
```js
/* 视频说safari 不支持requestFullscreen，
需要使用webkitRequestFullscreen，不过我查了下16.4以后的版本应该支持了
所以就不写判断啦。*/
window.addEventListener('dblclick',()=>{
    if(!document.fullscreenElement){
        canvas.requestFullscreen()
    }else{
        document.exitFullscreen();
    }
})
```
***
### 关于GUI
__lil.gui:__
继承dat.GUI ，原本的dat.GUI 已经停止更新了，尽量使用这个，使用方法和dat一样。
除了这个还有些比较推荐的gui：
__[Tweakpane:](https://tweakpane.github.io/docs/)__
界面不错，比`lil`好看，但是比较麻烦，例如颜色什么的需要自己手动修改。
__[ControlKit:]()__


### 贴图
[看贴图](./贴图.md)


### 材质
#### 材质类型
__基础材质__
``const material = new THREE.MeshBasicMaterial``

#### 材质的基本属性
1. 改变材质的颜色：``material.color.set() || meterial.color = new THREE.Colir()``
2. 显示线框：``material.wireframe = true``
3. 透明度
```js
     //所有设置关于透明度的属性时，需要把这个打开
     material.transparent = true;
     material.opacity = 0.5;
```
4. 显示背面前面
```js
     material.side = THREE.FrontSide||THREE.BackSide||THREE.DoubleSide
```

#### 关于Mipmaps 技术
mipmaps技术就是指，threejs在加载材质的时候，会预先生成一系列纹理的副本，每个副本的分辨率都是前面一个的一半。当物体在场景中移动的时候，会自动旋转mipmap的级别。

设置方式：``texture.geometryMipmaps = false||true``

优化：
1. 关闭不必要的Mipmaps：比如UI元素的
2. 当时用压缩纹理的时候，可以关闭。
3. 动态纹理的时候也可以关闭。


#### 网站
1. 提供各种各样的[MatCaps](https://observablehq.com/d/2c53c7ee9f619740?ui=classic)

2. 各种[环境贴图](https://polyhaven.com/hdris)