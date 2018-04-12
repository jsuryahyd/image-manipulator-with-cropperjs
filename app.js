const express = require('express');
const path = require('path');
// const bodyParser = require('body-parser');
const pdf = require('html-pdf');
const morgan = require('morgan');
const fs  =require('fs');
const formidable = require('formidable');
const app = express();
const cors = require('cors')
//app-locals
app.set('port',5678);
// var whitelist = ['https://drive.google.com',"http://localhost:5678"]
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }
// app.use(cors())
// app.use(cors(corsOptions));
app.use(morgan('tiny'));
app.use((req,res,next)=>{
  console.log('ip address : ',req.headers['x-forwarded-for'] || req.connection.remoteAddress);
  next();
})
// app.use(bodyParser.json({extended:true}));
// app.use(bodyParser.urlencoded({extended:true}))

//static routes
app.use(express.static(path.join(__dirname,'./public')));
app.use('/cropper',express.static(path.join(__dirname,'./node_modules/cropperjs/dist')));
app.use('/font-awesome',express.static(path.join(__dirname,'./node_modules/font-awesome/')));
app.use('/jspdf',express.static(path.join(__dirname,'./node_modules/jspdf/dist')));



app.post('/html2pdf',(req,res)=>{
res.setHeader('Access-Control-Allow-Origin','*')
  
  form =  new formidable.IncomingForm();
  form.parse(req,(err,fields,files)=>{
    //fields
    let styleSheet = fields['style'];
    let htmlStr = fields['html'];
    let fileName = fields['title']
    let html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Image</title>
      <style>${styleSheet}</style>
    </head>
    <body>${htmlStr}</body></html>`;
    //TODO - strip .png from fileName
    fs.writeFileSync(__dirname+'/convertedPdfs/'+fileName+'.html',html)
    //todo - name the file by getting name of image with the request
    pdf.create(html).toFile(__dirname+'/convertedPdfs/'+fileName+'.pdf',(err,result)=>{
    if(err)throw err;
    console.log(result)
    // res.setHeader('content-disposition','attachment;filename=converted.pdf');
    // res.download(__dirname+'/converted.pdf');
    // res.redirect('/downloadPdf')
    res.json({url:'/convertedPdf/'});
    // res.end('see the file?')
    });
});
/*---- form.parse -----*/
});

app.get('/convertedPdf/:filename',(req,res)=>{
res.setHeader('Access-Control-Allow-Origin','*');
let filepath = path.join(__dirname,'convertedPdfs',req.params.filename+'.pdf');
fs.exists(filepath,(exists)=>{
  // console.log('exists :',exists);
  if(!exists) res.status(402).send('File does not exist');
  res.download(filepath); 
})
  // res.end();
// try{
//    fs.unlink(__dirname+'/converted.pdf');
// }catch(err){
//   console.log(err)
// }
})

app.listen(app.get('port'),()=>{
  console.log('app listening on localhost:'+app.get('port'))
});

app.use((err,req,res,next)=>{
  console.log('error :',err);
  res.end();
})