const lb=document.createElement('div');lb.className='city-lightbox';const lbImg=document.createElement('img');lb.appendChild(lbImg);document.body.appendChild(lb);
const closeLb=()=>lb.classList.remove('is-open');
lb.addEventListener('click',closeLb);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLb();});
document.querySelectorAll('.city-gallery-item img').forEach(img=>{img.style.cursor='zoom-in';img.addEventListener('click',()=>{lbImg.src=img.src;lbImg.alt=img.alt;lb.classList.add('is-open');});});
