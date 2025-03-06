var http = require('http');
var fs = require('fs');
var request = require("request");
var cheerio = require('cheerio');
var mkdirp = require('mkdirp');

// 需要爬虫的url
var url = 'http:***';//staff blog

// 存放爬虫结果的文件夹
var dir = 'xxx';

// 记录下载图片的数量,并防止因为命名重复而导致的图片替换
var a = 0;
// 利用mkdirp 创建dir文件夹
mkdirp(dir,function(err){
	if(err){
		console.log("创建文件夹时出错："+err);
	}
})

// 请求头添加cookie，确保是登录状态
var options = {
	url : url,
	headers:{
		"User-Agent":"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
		'Cookie':'.....'
	},
}
// 封装一层函数
// function fetchPage(x){
// 	goToLoad(x);
// }
// 发请求
var goToLoad = function(){
	request.get(options, function(error, response, body){
		if(!error && response.statusCode == 200){
			// 根据需要修改
			var $ = cheerio.load(body);
			// var src = $('.photo').find('img').attr('src');
			$('.photo').each(function(i,elem){
				a++;		
				var src = $(this).find('img').attr('src');
				if(src){
					var filename = a+src.split('/')[7];
					download(src, dir, filename);
				}
			})
			// 更改url
			id = $('.paging').children().last().find('a').attr('href');
			// console.log(id);
			url = 'xxx'+id;

			options.url = url;
			console.log(url);
			// console.log(options.url);
			// 若找到该url，则继续执行该函数
			if(url){
				goToLoad();
			} else{
				console.log('下载完成');
			}
		} else {
			console.log(error);
		}
	})
}

// 下载文件函数
var download = function(url, dir, filename) {
		request.head(url,function(err,res,body){
        if(err){
            console.log(err);
        }
    })
    request(url).pipe(fs.createWriteStream(dir + "/" + filename));
}
// 执行函数
goToLoad();