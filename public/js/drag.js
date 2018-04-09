function startDrag(e) {
  // determine event object
  if (!e) {
    var e = window.event;
  }
  
  // IE uses srcElement, others use target
  var targ = e.target ? e.target : e.srcElement;
  console.log(targ.className)

  if (targ.className != 'imgInPdf') {return};
  // calculate event X, Y coordinates
    offsetX = e.clientX;
    offsetY = e.clientY;

  // assign default values for top and left properties
  if(!targ.style.left) { targ.style.left='0px'};
  if (!targ.style.top) { targ.style.top='0px'};

  // calculate integer values for top and left 
  // properties
  coordX = parseInt(targ.style.left);
  coordY = parseInt(targ.style.top);
  drag = true;

  // move div element
    document.getElementsByClassName('imgInPdf')[0].onmousemove=dragDiv;
  
}
function dragDiv(e) {
  var a4page = document.getElementById('a4Page');  
  if (!drag) {return};
  if (!e) { var e = window.event};
  var targ=e.target?e.target:e.srcElement;
  maxTop = a4page.offsetHeight - targ.offsetHeight;
  maxLeft = a4page.offsetWidth -  targ.offsetWidth;

  // move div element
  let left = coordX+e.clientX-offsetX
  left = (left >= 0 ) ? left : 0;
  left = (left <= maxLeft) ? left : maxLeft ;

  let top = coordY+e.clientY-offsetY ;
  top = (top>= 0) ? top : 0;
  top = ( top<maxTop) ? top : maxTop;
  console.log(top,left)
  targ.style.left=left+'px';
  targ.style.top=top+'px';
  return false;
}
function stopDrag() {
  drag=false;
  document.onmousemove = null;
}

