暂时 只找到 修改node_modules 的方法

1. 在`node_modules/pdfjs-dist/build/pdf.worker.js`中
    
    ```js
    if (data.fieldType === "Sig") {
          data.fieldValue = null;
          // 注释掉底下这行 就可以显示电子签章
          // this.setFlags(_util.AnnotationFlag.HIDDEN);
    }
    ```
    
2. 在`node_modules/pdfjs-dist/es5/build/pdf.worker.js`中 同样的
    
    ```js
    if (data.fieldType === "Sig") {
          data.fieldValue = null;
          // 注释掉底下这行 就可以显示电子签章
          // this.setFlags(_util.AnnotationFlag.HIDDEN);
    }
    ```
    
3. 这个未测试 需不需要注释 
    
    在`node_modules/vue-pdf/src/pdfjsWrapper.js`中 
    
    ```js
    注释  
    //annotationLayerElt.style.visibility = 'hidden';
    ```