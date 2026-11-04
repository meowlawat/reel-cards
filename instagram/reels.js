const icons={reel:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="m10 8 6 4-6 4z"/>',save:'<path d="M5 3h14v18l-7-5-7 5z"/>',card:'<rect x="3" y="6" width="15" height="15" rx="3"/><path d="M7 3h12q2 0 2 2v12M7 12h7m-7 4h4"/>',next:'<path d="m5 9 7 7 7-7"/>',heart:'<path d="M12 21 3.5 12C-2 5 7 0 12 7c5-7 14-2 8.5 5z"/>'};
const icon=k=>'<svg aria-hidden="true" class="ico" viewBox="0 0 24 24">'+icons[k]+'</svg>';
let reelIndex=0,step=0,paused=false,bookmarks=[],likes=new Set(),startY;
try{const b=JSON.parse(localStorage.getItem('igconcept_bookmarks_v1'));if(Array.isArray(b))bookmarks=b.filter(byId)}catch{}
const action=(key,html,label)=>'<button type="button" data-ui="'+key+'" aria-label="'+label+'">'+html+'</button>';
const dock=()=>'<nav class="dock" aria-label="Collections">'+action('reels',icon('reel')+'Reels','Reels')+action('saved',icon('save')+'Saved','Saved')+action('learned',icon('card')+'Learned','Learned')+'</nav>';
feed=function(){const r=reels[reelIndex];return '<section class="stage"><img class="frame" src="'+r.id+'.jpg" alt=""><div class="veil"></div><div class="stepsbar">'+r.card.steps.map((_,i)=>'<i class="'+(i<=step?'on':'')+'"></i>').join('')+'</div><div class="top"><b>Reels</b>'+action('pause',paused?'▶':'Ⅱ',paused?'Play reel':'Pause reel')+'</div><div class="copy"><div class="creator"><span class="avatar">'+r.creatorAvatar+'</span>'+r.creator.slice(1)+'</div><h1>'+r.title+'</h1><small>Step '+(step+1)+' / '+r.card.steps.length+'</small><p>'+r.card.steps[step]+'</p></div><aside class="rail">'+action('like',icon('heart')+'<small>'+(likes.has(r.id)?'Liked':'Like')+'</small>','Like reel')+action('sheet',icon('save')+'<small>Save</small>','Save options')+action('next',icon('next')+'<small>Next</small>','Next reel')+'</aside></section>'};
const originalDraw=draw;
draw=function(){if(screen==='saved'){app.dataset.screen=screen;app.innerHTML='<section class="shelf"><h1>Saved reels</h1><p>Your bookmarks for watching again.</p>'+(bookmarks.length?bookmarks.map(id=>action('watch-'+id,'<img src="'+id+'.jpg" alt="">'+byId(id).title,'Watch '+byId(id).title)).join(''):'<p>No saved reels yet. Tap the bookmark on a reel.</p>')+'</section>'}else originalDraw();app.insertAdjacentHTML('beforeend',dock())};
const dialog=document.createElement('dialog');dialog.className='overlay';dialog.setAttribute('aria-label','Save options');document.body.append(dialog);
function openSheet(){const id=reels[reelIndex].id;dialog.innerHTML='<section class="sheet"><div class="handle"></div><h2>Save this reel</h2><button class="choice" data-ui="bookmark">'+icon('save')+'<span>'+(bookmarks.includes(id)?'Open saved reel':'Save')+'<small>Bookmark the original to watch again.</small></span></button><button class="choice card" data-ui="make">'+icon('card')+'<span>'+(cards[id]?'Open in Learned':'Save as Reel Card')+'<small>Keep an editable question and practise it later.</small></span></button>'+action('close','Cancel','Cancel')+'</section>';dialog.showModal()}
function next(n){reelIndex=(reelIndex+n+reels.length)%reels.length;step=0;draw()}
document.addEventListener('click',async e=>{const a=e.target.closest('[data-ui]')?.dataset.ui;if(!a){if(e.target===dialog)dialog.close();return}const id=reels[reelIndex].id;
 if(a==='sheet'){openSheet();return}
 if(dialog.open)dialog.close();
 if(a==='close')return;
 if(a==='next'){next(1);return}
 if(a==='like'){if(likes.has(id))likes.delete(id);else likes.add(id)}
 if(a==='pause')paused=!paused;
 if(a==='bookmark'){if(!bookmarks.includes(id)){bookmarks.push(id);try{localStorage.setItem('igconcept_bookmarks_v1',JSON.stringify(bookmarks));notify('Bookmarked in Saved')}catch{notify('Bookmarked for this session')}}else screen='saved'}
 if(a==='make'){await change('save',id);screen='library';notify(persistent?'Card added to Learned':'Card available this session')}
 if(a==='reels')screen='feed';
 if(a==='saved')screen='saved';
 if(a==='learned')screen='library';
 if(a.startsWith('watch-')){reelIndex=reels.findIndex(r=>r.id===a.slice(6));step=0;screen='feed'}
 draw()});
setInterval(()=>{if(screen==='feed'&&!paused&&!dialog.open&&!document.hidden){
 const steps=reels[reelIndex].card.steps;step=(step+1)%steps.length;
 app.querySelector('.copy p').textContent=steps[step];
 app.querySelector('.copy small').textContent='Step '+(step+1)+' / '+steps.length;
 app.querySelectorAll('.stepsbar i').forEach((bar,i)=>bar.classList.toggle('on',i<=step));
}},6500);
app.addEventListener('touchstart',e=>{startY=e.touches[0].clientY},{passive:true});
app.addEventListener('touchend',e=>{const dy=e.changedTouches[0].clientY-startY;if(screen==='feed'&&Math.abs(dy)>70)next(dy<0?1:-1)},{passive:true});
document.addEventListener('keydown',e=>{if(screen==='feed'&&!dialog.open&&['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();next(e.key==='ArrowDown'?1:-1)}});
init();
