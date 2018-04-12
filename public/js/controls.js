const controls = function(Cropper,dragFuncs) {
  let controls = Object.create(null) || {};

  let cropper;
  let num_previews = 0;
  let activePreview = null;
  let appState_cropping = true;
  let draglib;
  let converted_previews = [];
  let imageFile
  // dom
  let image;
  let imageWrapper;
  let imgDialog;
  let downloadBtn;
  let rotateIcon;
  let filename;
  let downloadLink;
  let saveBtn;
  let savedPreviews;
  let cropReset;
  let pdfWork;
  let saveToPdf;
  let a4Page;
  let convertToPdf;
  let overlay;

  //private functions
  function resetCropper() {
    if (cropper && cropper.cropped) {
      cropper.reset();
    }
  }

  /*
    - save the cropped region to sidebar as an image( with src=data:imag...)
    - can be reused and toggle b/w such images
    */
  function saveToPreview() {
    if (!appState_cropping) {
      //TODO - savePdf
      //...
      return false;
    }
    // appendImg()
    let url = cropper.getCroppedCanvas().toDataURL("image/png");
    let img = document.createElement("img");
    img.src = url;
    img.setAttribute("data-cropData", JSON.stringify(cropper.getData()));
    img.setAttribute("class", "savedPreviews__img");
    img.onclick = event => {
      loadSavedPreview(event);
    };
    num_previews += 1;
    img.setAttribute("data-preview_id", num_previews);
    activePreview = String(num_previews)
    savedPreviews.appendChild(img);
    savedPreviews.scrollTop = savedPreviews.offsetHeight;
  }

  function pdfToggle() {
    // let img = document.getElementsByClassName('imgInPdf')[0]
    if (!cropper || !num_previews) {
      return false;
    }
    appState_cropping = !appState_cropping;
    if (imageWrapper.style.zIndex == "-1") {
      //show cropper area
      imageWrapper.style.zIndex = "1";
      a4Page.style.display = "none";

      //re-enable cropper controls
      Array.prototype.slice
        .call(document.getElementsByClassName("cropper_controls"))
        .forEach(el => {
          el.classList.remove("disabled");
        });
      convertToPdf.classList.add("disabled");
    } else {
      convertToPdf.classList.remove("disabled");
      //show pdf area
      imageWrapper.style.zIndex = "-1";
      a4Page.style.display = "block";
      //disable cropper controls
      Array.prototype.slice
        .call(document.getElementsByClassName("cropper_controls"))
        .forEach(el => {
          el.classList.add("disabled");
        });
      appendPreviewToA4();
    }
  }
    /*
    - create new cropper at first time
    - subsequently, replaces the image (via setting new dataurl) for the cropper - cropper.replace(url)
    */
  function instantiateCropper(imgSrc) {
    if(!appState_cropping){
      pdfToggle();
    }
    //imgDetails
    imageWrapper.style.backgroundColor = "";
    if (cropper) {
      //image is being changed
      newSrc = imgSrc;
      console.log(newSrc);
      if (!newSrc) {
        console.log("cancelled file input");
        return false;
      }
      cropper.replace(newSrc);
      //clear saved previews
      while (savedPreviews.hasChildNodes) {
        savedPreviews.removeChild(savedPreviews.lastChild);
      }
      a4Page.removeChild(a4Page.firstChild)//btw this returns the removed child
      // cropper = null
    } else {
      image.setAttribute("src", imgSrc);
      cropper = new Cropper(image, {
        scalable: true,
        rotatable: true,
        // zoomable:false,
        dragMode: "move", //move image
        ready: function() {
          console.log("init and cropping");
          this.cropper.crop();
          imageWrapper.style.opacity = 1;
          image.addEventListener("crop", () => {
            cropper.getData();
          });
        }
      });
      controls.cropper = cropper;
      console.log(controls.cropper,cropper)
    }
    // download_url = image.getAttribute("src");
    // download_name = "uncropped-"+imgDialog.files[0].name;
    // downloadLink.setAttribute("download", download_name);
    // downloadLink.setAttribute("href", download_url);
  }

  // Use the Google API Loader script to load the google.picker script.



  function rotateImg(degrees) {
    if (!cropper) {
      console.log("no cropper. cannot rotate");
      return false;
    }
    cropper.rotate(degrees || 15);
  }

  /* starts : downloadBtn onclick*/
  function downloadImage() {
    console.log("downloading");
    if (!image.getAttribute("src")) {
      event.preventDefault();

      console.log("aborting", event.target);
    }

    if (cropper && cropper.cropped) {
      let download_url = cropper.getCroppedCanvas().toDataURL("image/png"); //alternatively getCropBoxData().width,height and set them to getCroppedCanvas({w:,h:});
      let size = `${Math.ceil(cropper.getData().width)}x${Math.ceil(
        cropper.getData().height
      )}`;
      //asynchronous function - cannot put after if-else block
      // downloadLink.setAttribute("download", "cropped-" + size + ".png");
      // downloadLink.setAttribute("href", download_url);
      setDownloadLink("cropped-" + size + ".png",download_url)
    } else {
      // downloadLink.setAttribute("download", "Uncropped.png");
      // downloadLink.setAttribute("href", image.getAttribute('src'));
      setDownloadLink("Uncropped.png",image.getAttribute('src'))
      
    }

    overlayToggle('show');

    //click event
    // downloadLink.click(); //downloadLink.dispatchEvent('click')
  }
  /* ends : downloadBtn onclick*/

  function setImage(pic,drive) {
    if(drive) {
      //pic is data.docs[0] from google drive picker callback
      // setting imageFile variable (global controls variable)
      imageFile = {srcUrl:pic.srcUrl,name:pic.name,mimType:pic.mimeType,id:pic.id,size:pic.sizeBytes}
    }else{
        // pic is File() object
      imageFile = {
        srcUrl:URL.createObjectURL(pic),
        name:pic.name,
        mimeType:pic.type,
        id:null,
        size:pic.size
      }

    }
    
    return instantiateCropper(imageFile.srcUrl);
  }


  function toggleCrop() {
    if(!cropper){
      return false;
    }
    let image = document.getElementById('image');
    let imageWrapper =  document.getElementById('imgWrapper');
    let download_url, download_name;
    let downloadBtn = document.getElementById('downloadBtn')
    if (cropper && cropper.cropped) {
      // console.log('clearing')
      cropper.clear()
    } else {
      console.log('cropping')
      cropper.crop();
    }

  }

function loadSavedPreview(e){
  //set active preview img
  console.log(e.target);
  let data = JSON.parse(e.target.getAttribute('data-cropData'));
  activePreview = e.target.getAttribute('data-preview_id');
  cropper.setData(data);
  appendPreviewToA4()
  // pdfWork.click();
}

// function saveToPdf_jsPdf(name,html){
//   let pdf = new jsPDF();
//   let a4Page = document.getElementById('a4Page');
//   let img= document.getElementsByClassName('imgInPdf')[0];
//   console.log(a4Page)
//   //rect
//   options = a4Page.getBoundingClientRect();

//   options.w = options.width;
//   options.h = options.height;
//   options.style = "F";
//   console.log(options)
//   //if no html,
//   // pdf.rect({options});
//   pdf.text('')
//   pdf.addImage(img.src, 'JPEG',img.offsetLeft,img.offsetTop,img.offsetWidth,img.offsetHeight)
//   console.log(img.src, 'JPEG',img.offsetLeft,img.offsetTop,img.offsetWidth,img.offsetHeight)
//   pdf.save((name || 'a4Pdf.pdf'))
// }

function overlayToggle(command){
  commands = {'show':'flex','hide':'none'}
  overlay.style.display = commands[command];
}

function setDownloadLink(filename,link){
  if(!link) link = "/convertedPdf/"+filename;
  overlay.classList.add('downloaded'); 
  saveToPdf.setAttribute('href',link);
  saveToPdf.setAttribute('download',filename);

  renderSaveToDrive({
    src:link,
    filename:filename+'.pdf'
  })
}

function sendHtml(){
  overlayToggle('show');
  let img = document.getElementsByClassName('imgInPdf')[0];
  let parent = a4Page;
  console.log('a4Page',a4Page)
  let imgName = imageFile.name;
  //styles
  let styles = getComputedStyle(img);
  let parentDimensions = getComputedStyle(a4Page)
  let preview_num = img.getAttribute('data-preview_item');
  let title = preview_num + '-' +imgName
  console.log(converted_previews,preview_num)
  //if already converted, set download link and get out
  if(converted_previews.indexOf(preview_num) !== -1){
    return setDownloadLink(title);
  }
  overlay.classList.remove('downloaded');//show gif and hide buttons
  //if not continue
  let req = new XMLHttpRequest();
  req.open('POST','/html2pdf');
  req.setRequestHeader('content-type',"application/json");
  req.onload = ()=>{
    console.log('downloaded')
    setDownloadLink(title);
    //now converted, dont send this image for conversion anymore.
    converted_previews.push(preview_num);
  }
  
  // // % values 
  // let imgWidth = (parseInt(styles.width) / parseInt(parentDimensions.width)) * 100
  // let imgHeight = (parseInt(styles.height) / parseInt(parentDimensions.height) ) * 100;
  // let imgTop = (parseInt(styles.top) / parseInt(parentDimensions.height) * 100);
  // let imgLeft = ((parseInt(styles.left) / parseInt(parentDimensions.width)) *100)
  //img
  let imgWidth = img.offsetWidth / parent.offsetWidth * 100;
  let imgHeight = img.offsetHeight / (parent.offsetWidth * 1.41) * 100;//parent.offsetHeight
  let imgTop = img.offsetTop / parent.offsetHeight * 100;
  let imgLeft = img.offsetLeft / parent.offsetWidth * 100;

  /*
  - alternatively set width and height of parent in px(in css) to make it exact looking
  */

  //construct fields to send
  htmlObj = {
    style:`html,body{height:100%;width:100%;margin:0;padding:0}#a4Page{display: block;
  background-color: white;height:100%;width:100%;
  position: relative} #img{position:absolute;width:${imgWidth}%;height:${imgHeight}%;top:${imgTop}%;left:${imgLeft}%}`,
  html:`<div id="a4Page"> <img id="img" src="${img.src}" /></div>`,
  title:title
  }

  req.send(JSON.stringify(htmlObj));
}

function appendPreviewToA4(){
  //add image to pdf preview
  let img = document.createElement('img');
  //activePreview is data-preview_id  of currently active image
  let active_preview = activePreview ? document.querySelector('[data-preview_id="'+activePreview+'"') : document.getElementsByClassName('savedPreviews__img')[0];
  img.src = active_preview.src;
  img.className = "imgInPdf";
  img.style.maXwidth = '100%';
  img.setAttribute('data-preview_item',activePreview)
  a4Page.innerHTML = '';
  a4Page.appendChild(img);
  //dragging
  img.onmousedown = draglib.startDrag;
  img.onmouseup = draglib.stopDrag;
}

  //public functions

  function domCache() {
    image = document.getElementById("image");
    imageWrapper = document.getElementById("imgWrapper");
    imgDialog = document.getElementById("imgDialog");
    downloadBtn = document.getElementById("downloadBtn");
    rotateIcon = document.getElementById("rotateIcon");
    filename = document.getElementById("currentImgName");
    downloadLink = document.getElementById("downloadLink");
    saveBtn = document.getElementById("saveBtn");
    savedPreviews = document.getElementById("savedPreviews");
    cropReset = document.getElementById("resetCrop");
    pdfWork = document.getElementById("pdfWork");
    saveToPdf = document.getElementById("saveToPdf");
    a4Page = document.getElementById("a4Page");
    cropIcon = document.getElementById('cropIcon');
    convertToPdf = document.getElementById('convertToPdf');
    overlay = document.getElementById('overlay')
    
  };

  function renderSaveToDrive({src,filename}) {
    config = {
      src: 'http://localhost:5678'+src,
      filename: filename,
    }
    config.sitename = 'my sitename';
    console.log(config)
    gapi.savetodrive.render('saveToDrive', config);
  }

      

  controls.init = function() {
    domCache();
    draglib = dragFuncs(a4Page)
    // image.addEventListener("crop", () => {
    //   console.table(cropper.getData())
    // });

    // image.addEventListener("zoom", function() {
    //   console.log(cropper.getData().width, cropper.getData().height);
    // });
    
    cropIcon.onclick = (event)=>{
      toggleCrop();
    };
    // imgDialog.onclick = checkAppState;

    imgDialog.onchange = (event)=>{
      if(!event.target.files[0]){
        //do nothing if file dialog was cancelled by user
        return false;
      }
      //passing file as parameter
      setImage(event.target.files[0])  
    };

    downloadBtn.onclick = (event)=>{
      downloadImage()
    };

    rotateIcon.onclick = (event)=>{
      rotateImg()
    };

    convertToPdf.onclick = (event)=>{
      sendHtml(); 
    };

    saveBtn.onclick = (event)=>{
      saveToPreview()
    };

    cropReset.onclick = (event)=>{
      resetCropper() 
    };

    pdfWork.onclick = (event)=>{
      pdfToggle()
    };



    // controls.cropper = cropper

  };
  //init here as this doesnot require dependencies
  // controls.init();
controls.setImage = setImage;
  return controls;
};



    