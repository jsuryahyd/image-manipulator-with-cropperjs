const controls = function(mainImg){
  let controls = Object.create(null)|| {};

  controls.setImage = function (e){
    // console.log(e,e.target)
    let pic = e.target.files[0];
    console.log(pic)
    if(!pic){
      return false;
    }
    let srcUrl = URL.createObjectURL(pic);
    mainImg.setAttribute('src',srcUrl);
    return srcUrl
  }

  return controls;
}