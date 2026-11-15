const E=window.EVENT;
const $=s=>document.querySelector(s);
const format=(d,options)=>new Intl.DateTimeFormat('ru-RU',{...options,timeZone:'UTC'}).format(new Date(d+'T12:00:00Z'));
const names=E.groom+' и '+E.bride;
document.querySelectorAll('[data-groom]').forEach(e=>e.textContent=E.groom);
document.querySelectorAll('[data-bride]').forEach(e=>e.textContent=E.bride);
$('[data-date-long]').textContent=format(E.date,{day:'numeric',month:'long',year:'numeric'}).replace(' г.','');
$('[data-time]').textContent=E.time;
$('[data-weekday]').textContent=format(E.date,{weekday:'long',day:'numeric',month:'long'});
$('[data-deadline]').textContent=format(E.rsvpDeadline,{day:'numeric',month:'long',year:'numeric'}).replace(' г.',' года');
$('.signature span').textContent=names;
$('.final-names').textContent=E.groom+' & '+E.bride;
$('[data-area]').textContent=E.area;
$('.venue-copy h2').textContent=E.venue.replace(/^кафе\s*/i,'');
$('.hero-bottom>span:first-child').textContent=E.date.split('-').reverse().join(' / ');
$('footer>span:last-child').textContent=E.date.split('-').reverse().join(' · ');
$('.envelope-date').textContent=E.date.split('-').reverse().join(' · ');
document.title=names+' — Сад нашей любви';
const opening=$('#opening');let openingBusy=false;let returnFocus;
function showEnvelope(){returnFocus=document.activeElement;opening.classList.remove('opening');opening.showModal();document.body.classList.add('modal-open');$('#open-invite').focus()}
function closeEnvelope(animated){if(openingBusy)return;openingBusy=true;if(animated)opening.classList.add('opening');setTimeout(()=>{opening.close();document.body.classList.remove('modal-open');try{localStorage.setItem('garden-opened-v1','yes')}catch{}openingBusy=false;(returnFocus&&returnFocus.id==='reopen'?returnFocus:$('#main')).focus({preventScroll:true})},animated&&!matchMedia('(prefers-reduced-motion: reduce)').matches?800:0)}
let seen=false;try{seen=localStorage.getItem('garden-opened-v1')==='yes'}catch{}if(!seen&&!location.hash)showEnvelope();
$('#open-invite').onclick=()=>closeEnvelope(true);$('#skip-intro').onclick=()=>closeEnvelope(false);opening.addEventListener('cancel',e=>{e.preventDefault();closeEnvelope(false)});$('#reopen').onclick=showEnvelope;
const [year,month,day]=E.date.split('-').map(Number);const grid=$('#calendar-grid');
$('#month-label').textContent=format(E.date,{month:'long'}).replace(/^./,c=>c.toUpperCase());$('#year-label').textContent=year;grid.setAttribute('aria-label',format(E.date,{month:'long',year:'numeric'}));
['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'].forEach(t=>{const s=document.createElement('span');s.textContent=t;s.className='weekday';grid.append(s)});
const offset=(new Date(Date.UTC(year,month-1,1)).getUTCDay()+6)%7;for(let i=0;i<offset;i++)grid.append(document.createElement('span'));
for(let i=1;i<=new Date(Date.UTC(year,month,0)).getUTCDate();i++){const s=document.createElement('span');s.textContent=i;if(i===day){s.className='chosen';s.setAttribute('aria-label',`${i} — день нашего никаха`)}grid.append(s)}
const escapeICS=s=>s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
$('#calendar').onclick=()=>{let start=E.date.replaceAll('-','')+'T'+E.time.replace(':','')+'00';let prefix='DTSTART:';if(E.timeZone&&E.startISO&&Number.isFinite(Date.parse(E.startISO))){start=new Date(E.startISO).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z')}const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Garden of Love//Invitation//RU','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:ramil-amina-'+E.date+'@garden-invitation','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z'),prefix+start,'SUMMARY:'+escapeICS('Никах — '+names),'LOCATION:'+escapeICS([E.venue,E.area,E.city,E.address].filter(Boolean).join(', ')),'DESCRIPTION:'+escapeICS('Приглашение на наш никах. '+(!E.timeZone?'Время местное. Часовой пояс будет уточнён.':'')),'END:VEVENT','END:VCALENDAR'];const url=URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='ramil-amina.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#calendar-note').textContent=E.timeZone?'Файл календаря подготовлен.':'Файл подготовлен с местным временем 15:00. Часовой пояс пока не указан.'};
if(E.timeZone&&E.startISO&&Number.isFinite(Date.parse(E.startISO))){const counter=$('#countdown');counter.hidden=false;function tick(){const diff=Date.parse(E.startISO)-Date.now();counter.textContent=diff<=0?'Этот день наступил. Спасибо, что вы с нами!':`До нашего дня: ${Math.floor(diff/86400000)} д · ${Math.floor(diff/3600000)%24} ч · ${Math.floor(diff/60000)%60} мин`}tick();setInterval(tick,60000)}
if(E.address){$('#address-note').hidden=true;$('#address-actions').hidden=false;$('#address-text').textContent=[E.city,E.address].filter(Boolean).join(', ');$('#copy-address').onclick=async()=>{try{await navigator.clipboard.writeText($('#address-text').textContent);$('#copy-status').textContent='Адрес скопирован.'}catch{$('#copy-status').textContent='Не удалось скопировать. Выделите адрес выше и скопируйте вручную.'}};if(/^https:\/\//.test(E.mapUrl)){$('#route').hidden=false;$('#route').href=E.mapUrl;$('#route').target='_blank';$('#route').rel='noopener noreferrer'}}
if(E.contacts.length){$('#contacts').hidden=false;E.contacts.forEach(c=>{const p=document.createElement('p');p.textContent=c.name+' — '+c.value;$('#contacts').append(p)})}

// One gentle entrance per section; content remains visible without JavaScript.
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
if('IntersectionObserver' in window&&!reduceMotion.matches){
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:0.08});
 document.querySelectorAll('.reveal').forEach(el=>{el.classList.add('will-reveal');observer.observe(el)});
 reduceMotion.addEventListener('change',()=>{if(reduceMotion.matches){document.querySelectorAll('.will-reveal').forEach(el=>el.classList.add('is-visible'));observer.disconnect()}});
}
const slides=[...document.querySelectorAll('.venue-slide')],dots=[...document.querySelectorAll('.gallery-dots button')];let slideIndex=0;
function showSlide(index){slideIndex=(index+slides.length)%slides.length;slides.forEach((slide,i)=>{slide.hidden=i!==slideIndex;slide.classList.toggle('is-active',i===slideIndex)});dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===slideIndex)));$('.gallery-counter').textContent=String(slideIndex+1).padStart(2,'0')+' / 04'}
$('#gallery-prev').onclick=()=>showSlide(slideIndex-1);$('#gallery-next').onclick=()=>showSlide(slideIndex+1);dots.forEach((dot,i)=>dot.onclick=()=>showSlide(i));
$('.venue-gallery').addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();showSlide(slideIndex+(e.key==='ArrowRight'?1:-1))}});
let touchStart=null;$('.gallery-viewport').addEventListener('touchstart',e=>{touchStart={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}},{passive:true});$('.gallery-viewport').addEventListener('touchend',e=>{if(!touchStart)return;const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))showSlide(slideIndex+(dx<0?1:-1));touchStart=null},{passive:true});
