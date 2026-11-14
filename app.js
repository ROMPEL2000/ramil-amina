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
const form=$('#rsvp-form'),status=$('#form-status'),submit=$('.submit');let pending=false;let requestId=crypto.randomUUID();
form.addEventListener('change',()=>{const yes=form.elements.attendance.value==='yes';$('#guest-details').hidden=!yes;$('#guest-count').disabled=!yes;$('#guest-count').required=yes;$('#companions').disabled=!yes;status.textContent='';requestId=crypto.randomUUID()});
if(E.rsvpEndpoint)$('#demo-note').hidden=true;
form.addEventListener('submit',async e=>{e.preventDefault();if(pending)return;const name=$('#guest-name');name.setCustomValidity(name.value.trim().length<2?'Пожалуйста, укажите имя и фамилию.':'');if(!form.reportValidity())return;status.className='';if(!E.rsvpEndpoint){status.textContent='Поля заполнены корректно. Это демонстрация: ответ не отправлен и не сохранён. Приём ответов будет доступен после подключения формы.';status.focus({preventScroll:true});return}pending=true;submit.disabled=true;submit.textContent='Отправляем…';status.textContent='';const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);try{const attendance=form.elements.attendance.value;const response=await fetch(E.rsvpEndpoint,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':requestId},body:JSON.stringify({requestId,name:name.value.trim(),attendance,count:attendance==='yes'?Number($('#guest-count').value):null,companions:attendance==='yes'?$('#companions').value.trim():'',comment:$('#comment').value.trim()}),signal:controller.signal});if(!response.ok)throw Error();const result=await response.json();if(result.saved!==true||!result.id)throw Error();status.textContent='Спасибо! Ваш ответ сохранён. С теплом, '+names+'.';form.querySelectorAll('input,textarea').forEach(el=>el.disabled=true);submit.textContent='Ответ сохранён';submit.disabled=true}catch{status.className='error';status.textContent='Не удалось подтвердить сохранение ответа. Проверьте соединение и повторите отправку.';submit.disabled=false;submit.textContent='Повторить отправку ↗'}finally{clearTimeout(timer);pending=false}});
$('#guest-name').addEventListener('input',()=>$('#guest-name').setCustomValidity(''));
const mobile=$('.mobile-rsvp');new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.target.id==='rsvp')mobile.classList.toggle('is-hidden',entry.isIntersecting)})},{threshold:0}).observe($('#rsvp'));

