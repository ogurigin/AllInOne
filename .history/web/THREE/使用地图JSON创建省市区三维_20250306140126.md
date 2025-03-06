首先需要去 [地图网站](https://datav.aliyun.com/portal/school/atlas/area_selector) 下载一下 所需地图的 JSON 。

放在 项目里 并用 `import` 导入就好了

### 开始three 基础部分

相机，场景，渲染器，灯光eg. 不赘述。

渲染器 `renderer.setClearColor`  可以设置颜色透明度

### 利用 JSON 生产地图的mesh

1. 先实现一个 利用 子对象产生mesh的方法
    
    使用 d3 的 墨卡托投影
    
    ```js
    const createMash = (data) => {  //传入的 子对象 数据
        const shape = new THREE.Shape(); //创建形状
        const points = [];
         // 墨卡托投影转换
        const projection = d3
          .geoMercator()
          .center([110.0, 37.5]) //设置中心点
          .scale(100)//放大倍数
          .translate([-18, -17]) //移动距离
         data.forEach((item, idx) => {
          const [x,y] =projection(item); //获取每个点 进行转化后的 位置
          points.push(new THREE.Vector3(x, -y, .6))
          if (idx === 0) shape.moveTo(x, -y);//第一个点 移动形状起点
          else shape.lineTo(x, -y); //绘制
        });
        
        /* 地图模块 挤压缓冲几何体 */
        const shapeGeometry = new THREE.ExtrudeGeometry(shape,{
          depth: .6,
          bevelEnabled: false,
        });
        /* 地图块材质 */ 
        // 根据之前得到的 形状集 生成一个几何体
        const shapeMaterial = new THREE.MeshStandardMaterial({
          color: '#4F9B8E',
          emissive: 0x000000,
          roughness: 0.5,
          metalness: 0.4,
          transparent: true,
          opacity: 0.8,
        });
    
        /* 边界线 */
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        /* 边界线 材质 */
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    
        const mesh = new THREE.Mesh(shapeGeometry, shapeMaterial);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        return [mesh, line] ;
      }
    ```
    
2. 遍历全部json，并把所有的mesh 添加进用`object3D`创建的 基础的3d物体 里
    
    ```js
    const createMap = (data)=>{  //data 为导入的map JSON
    	 //创建基础的 3d 
        const map = new THREE.Object3D();
        data.features.forEach(feature => {
            /* 针对地图每个  部分创建3d模块 */
            const unit = new THREE.Object3D();
            /* 从地图json中获取坐标等信息 */
            const {coordinates,type} = feature.geometry;
            coordinates.forEach(coordinate =>{
              if(type === 'MultiPolygon') coordinate.forEach(item => fn(item));
              if(type === 'Polygon') fn(coordinate)
              function fn(coordinate){
                const mesh =createMash(coordinate)
                unit.add(...mesh);
              }
              
            })
            map.add(unit);
        });
        return map;
      }
    ```
    
3. 运行 `createMap`  生成地图的mesh
    
    `mapMesh = createMap(mapJson);`
    
    并添加进场景
    
     `scene.add( mapMesh );`
    

截止，一个3d的地图就已经生成了，下面可以 加其他的交互等

### 添加鼠标交互

项目用的vue 直接在元素 加 `@mousemove="handleMouse”`

```js
/* 鼠标交互 */
 const handleMouse = (event)=>{
   const mouse = new THREE.Vector2();
    //将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const  raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse,camera); // 设置鼠标相机的射线
     // 计算物体和射线的焦点
    const intersects = raycaster.intersectObjects(mapMesh.children)
                                .filter((item) => item.object.type !== "Line"); //排除 线条
    if(!intersects.length) { //没有交叉物体的话 
    //检测是否有之前划过的物体，并重置透明度。intersect为全局变量
        if (intersect) isAplha(intersect, 0.8); 
        return;
    };
    const {type} = intersects[0].object;
    if("Mesh" === type) { 
      if (intersect) isAplha(intersect, 0.8); //先将之前的 重置
      intersect = intersects[0].object.parent; //赋值新的物体
      isAplha(intersect, 1); //变化透明度
    } 
    if ( "Sprite" ===  type) { //如果加了点精灵的话 可以另写函数
      console.log(intersects[0].object);
    }

 }  
 function isAplha(intersects, opacity) {
    intersects.children.forEach((item) => {
      if (item.type === "Mesh") {
        item.material.opacity = opacity;
      }
    });
  }
```