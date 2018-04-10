const express = require('express');
const path = require('path');
// const bodyParser = require('body-parser');
const pdf = require('html-pdf');
const morgan = require('morgan');
const fs  =require('fs');
const formidable = require('formidable');
const app = express()
//app-locals
app.set('port',5678)

app.use(morgan('tiny'))
// app.use(bodyParser.json({extended:true}));
// app.use(bodyParser.urlencoded({extended:true}))

//static routes
app.use(express.static(path.join(__dirname,'./public')));
app.use('/cropper',express.static(path.join(__dirname,'./node_modules/cropperjs/dist')));
app.use('/font-awesome',express.static(path.join(__dirname,'./node_modules/font-awesome/')));
app.use('/jspdf',express.static(path.join(__dirname,'./node_modules/jspdf/dist')));



app.post('/html2pdf',(req,res)=>{
  form =  new formidable.IncomingForm();
  form.parse(req,(err,fields,files)=>{

    let html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Image</title>
      <style>${fields['style']}</style>
    </head>
    <body>${fields['html']}</body></html>`;
    fs.writeFileSync('convert.html',html)
    //todo - name the file by getting name of image with the request
    pdf.create(html).toFile('converted.pdf',(err,result)=>{
    if(err)throw err;
    console.log(result)
    // res.setHeader('content-disposition','attachment;filename=converted.pdf');
    // res.download(__dirname+'/converted.pdf');
    // res.redirect('/downloadPdf')
    res.json({url:'/downloadPdf'});
    // res.end('see the file?')
    })


});
//---- form.parse -----
});

app.get('/downloadPdf',(req,res)=>{
  res.download(__dirname+'/converted.pdf'); 
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
  console.log(err);
})