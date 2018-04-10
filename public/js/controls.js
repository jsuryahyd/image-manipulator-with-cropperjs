const controls = function(Cropper,dragFuncs) {
  let controls = Object.create(null) || {};

  let cropper;
  let activePreview = null; //data-preview_id
  let num_previews = 0;
  let appState_cropping = true;
  let draglib;
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
      saveToPdf.classList.remove("disabled");
    } else {
      saveToPdf.classList.remove("disabled");
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
  function instantiateCropper(event) {
    imageWrapper.style.backgroundColor = "";
    let imgSrc = setImage(event);
    if(!imgSrc) return;
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
    }
    filename.textContent = imgDialog.files[0].name;
    download_url = image.getAttribute("src");
    download_name = "uncropped-"+imgDialog.files[0].name;
    downloadLink.setAttribute("download", download_name);
    downloadLink.setAttribute("href", download_url);
  }

  function rotateImg(degrees) {
    if (!cropper) {
      console.log("no cropper. cannot rotate");
      return false;
    }
    cropper.rotate(degrees || 15);
  }

  /* starts : downloadBtn onclick*/
  function downloadPdf() {
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
      downloadLink.setAttribute("download", "cropped-" + size + ".png");
      downloadLink.setAttribute("href", download_url);
    } else {
      downloadLink.setAttribute("download", "Uncropped.png");
      downloadLink.setAttribute("href", image.getAttribute("src"));
    }
    //click event
    downloadLink.click(); //downloadLink.dispatchEvent('click')
  }
  /* ends : downloadBtn onclick*/

  function setImage(e) {
    let pic = e.target.files[0];
    console.log(pic);
    if (!pic) {
      return false;
    }
    let srcUrl = URL.createObjectURL(pic);
    return srcUrl;
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
  activePreview = e.target.getAttribute('data-preview_id')
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

function sendHtml(){
  let overlay = document.getElementById('overlay')
  overlay.style.display = 'flex';
  let img = document.getElementsByClassName('imgInPdf')[0];
  //styles
  styles = getComputedStyle(img);
  let req = new XMLHttpRequest();
  req.open('POST','/html2pdf');
  req.setRequestHeader('content-type',"application/json");
  req.onload = ()=>{
  let savePdf = document.createElement('a')
  savePdf.setAttribute('href',"/downloadPdf");
  savePdf.setAttribute('download','banner.pdf');
  document.body.appendChild(savePdf)
  savePdf.click();
  document.body.removeChild(savePdf);
  overlay.style.display = 'none';    
    
  }
  req.send(JSON.stringify({
    style:`html,body{height:100%;width:100%;margin:0;padding:0}#a4Page{display: block;
  background-color: white;height:100%;width:100%;
  position: relative} #img{position:absolute;width:${((parseInt(styles.width) / 595) * 100)}%;height:${(parseInt(styles.height) / 842 ) * 100}%;top:${(parseInt(styles.top) / 842 ) * 100}%;left:${((parseInt(styles.left) / 595) *100)}%}`,
  html:`<div id="a4Page"> <img id="img" src="${img.src}" /></div>`
  }));

  console.log(`#img{position:absolute;width:${((parseInt(styles.width) / 595) * 100)}%;height:${(parseInt(styles.height) / 842 ) * 100}%;top:${(parseInt(styles.top) / 842 ) * 100}%;left:${((parseInt(styles.left) / 595) *100)}%}`)
}

function appendPreviewToA4(){
  //add image to pdf preview
  let img = document.createElement('img');
      let active_preview = activePreview ? document.querySelector('[data-preview_id="'+activePreview+'"') : document.getElementsByClassName('savedPreviews__img')[0];
      img.src = active_preview.src;
      img.className = "imgInPdf";
      img.style.maXwidth = '100%';
      a4Page.innerHTML = '';
      a4Page.appendChild(img);
      //dragging
      img.onmousedown = draglib.startDrag;
      img.onmouseup = draglib.stopDrag;
}

  //public functions

  controls.domCache = function() {
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
    cropIcon = document.getElementById('cropIcon')
  };

  controls.init = function() {
    controls.domCache();
    draglib = dragFuncs(a4Page)
    image.addEventListener("crop", () => {
      // console.table(cropper.getData())
    });

    image.addEventListener("zoom", function() {
      console.log(cropper.getData().width, cropper.getData().height);
    });
    
    cropIcon.onclick = (event)=>{
      toggleCrop();
    };

    imgDialog.onchange = instantiateCropper;

    downloadBtn.onclick = (event)=>{
      downloadPdf()
    };

    rotateIcon.onclick = (event)=>{
      rotateImg()
    };

    saveToPdf.onclick = (event)=>{
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
  };

  return controls;
};



    