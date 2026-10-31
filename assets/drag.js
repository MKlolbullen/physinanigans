/* Pointer capture makes scrubbing work outside the original mark, with touch and pen too.
   A native range input is always provided as the keyboard/screen-reader alternative. */
function attachTunnelDrag(svg,input,fractionAt) {
  let pointer=null;
  function update(event) {
    const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(svg.getScreenCTM().inverse());
    const f=Math.max(0,Math.min(1,fractionAt(point)));
    const min=Number(input.min),max=Number(input.max),step=Number(input.step)||.001;
    input.value=String(Math.max(min,Math.min(max,min+Math.round((f*(max-min))/step)*step)));
    input.dispatchEvent(new Event('input',{bubbles:true}));
  }
  svg.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button!==0||input.disabled)return;
    pointer=event.pointerId;svg.setPointerCapture(pointer);update(event);event.preventDefault();
  });
  svg.addEventListener('pointermove',event=>{if(pointer===event.pointerId)update(event);});
  const finish=event=>{if(pointer===event.pointerId)pointer=null;};
  svg.addEventListener('pointerup',finish);
  svg.addEventListener('pointercancel',finish);
  svg.addEventListener('lostpointercapture',finish);
}
