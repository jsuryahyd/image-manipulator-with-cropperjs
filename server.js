const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');

const PORT = 4567;

const routes = (req,res)=>{
  //https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/
  let {method,url} = req;
  console.log(`${method} request made to ${url}`);
  //req_body
  let req_body = []
  req.on('data',(data_chunk)=>{
    req_body.push(data_chunk);
  }).on('end',()=>{
    //The concat() method joins all buffer objects in an array into one buffer object.
    req_body = Buffer.concat(req_body).toString()//defaults to 'utf8'
  });
  //error
  req.on('error',err=>{
    console.log('-------request error-------\n',err.stack)
  });
  //routes
  if(url == '/'){
    // let readStream = fs.createReadStream('./public/index.html');
    // readStream.on('end',()=>{
    //   res.end();
    // })
    // readStream.on('open',()=>{
    //   res.writeHead(200,{
    //     'content-type':"text/html",
    //   });
    //   readStream.pipe(res);

    // });
    // readStream.on('error',()=>{
    //   res.end('error providing you the html file')
    // });

    sendFile(res,path.join(__dirname,'public/index.html'),'text/html')
  }else{
    let contentType = 'application/js';
    if(req.url.indexOf('.css')){
    contentType = 'text/css';      
    }
    // if(req.url.split('.').reverse())
    sendFile(res,path.join(__dirname,'public',req.url),contentType)
  }
}

http.createServer(routes).listen(PORT,()=>{
  console.log('Server listening on localhost:',PORT)
});

//utilities
function sendFile(res,filename,contentType){
  fs.readFile(filename,'utf8',(err,data)=>{
    if(err){
      console.log(err);
      return res.end('Cannot get main page');
    }
    res.writeHead(200,{
          'content-type':contentType,
        });
    res.end(data);
  })
}