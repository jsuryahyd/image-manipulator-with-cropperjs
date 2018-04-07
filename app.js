const express = require('express');
const path = require('path')
const app = express()
app.set('port',5678)
app.use(express.static(path.join(__dirname,'./public')));
app.use('/cropper',express.static(path.join(__dirname,'./node_modules/cropperjs/dist')));
app.use('/font-awesome',express.static(path.join(__dirname,'./node_modules/font-awesome/')))
// app.get('/')

app.listen(app.get('port'),()=>{
  console.log('app listening on localhost:'+app.get('port'))
})