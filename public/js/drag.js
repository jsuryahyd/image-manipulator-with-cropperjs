//got from http://jsfiddle.net/laurence/YNMEX/
const dragFuncs = function (dragArea){

  let drag;//boolean (todrag or not)

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
    if (!drag) {return};
    if (!e) { var e = window.event};
    var targ=e.target?e.target:e.srcElement;
    let maxTop = dragArea.offsetHeight - targ.offsetHeight;
    let maxLeft = dragArea.offsetWidth -  targ.offsetWidth;
  
    // move div element
    let left = coordX+e.clientX-offsetX
    left = (left >= 0 ) ? left : 0;
    left = (left <= maxLeft) ? left : maxLeft ;
  
    let top = coordY+e.clientY-offsetY ;
    top = (top>= 0) ? top : 0;
    top = ( top < maxTop) ? top : maxTop;
    // console.log(top,left)
    targ.style.left=left+'px';
    targ.style.top=top+'px';
    return false;
  }
  function stopDrag() {
    drag=false;
    document.onmousemove = null;
  }

  return {startDrag,
  stopDrag
  }
  
  
}