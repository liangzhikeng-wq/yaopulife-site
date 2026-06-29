// 生肖卡:注入一句性格 + hover 展开(更生动);顶栏滚动阴影
(function(){
  var traits=["Quick-witted","Steady & strong","Brave & bold","Gentle & lucky",
    "Mighty & proud","Wise & calm","Free-spirited","Kind & artistic",
    "Clever & playful","Confident","Loyal & honest","Generous"];
  document.querySelectorAll('#zodiac .zcard').forEach(function(c,i){
    var t=document.createElement('div'); t.className='trait'; t.textContent=traits[i]||''; c.appendChild(t);
  });
  var nav=document.querySelector('.nav');
  if(nav){addEventListener('scroll',function(){nav.classList.toggle('shrink',scrollY>20)});}
})();

// ③ Fate Thread 命运红线 — 阅读进度跟踪
(function(){
  var bar=document.querySelector('.fate-thread i');
  var art=document.querySelector('.art');
  if(!bar||!art) return;
  function upd(){
    var r=art.getBoundingClientRect();
    var vh=window.innerHeight||document.documentElement.clientHeight;
    var total=art.offsetHeight-vh;
    var pct;
    if(total>40){ pct=(-r.top)/total*100; }
    else { pct=r.top<vh?100:0; }
    bar.style.width=Math.max(0,Math.min(100,pct))+'%';
  }
  addEventListener('scroll',upd,{passive:true});
  addEventListener('resize',upd);
  upd();
})();

// ⑤ Quiz 小测 — 点击揭晓正误 + 解释
(function(){
  document.querySelectorAll('.quiz .q').forEach(function(q){
    var opts=q.querySelectorAll('.opt');
    opts.forEach(function(o){
      o.addEventListener('click',function(){
        if(q.classList.contains('answered')) return;
        q.classList.add('answered');
        opts.forEach(function(x){
          x.disabled=true;
          var m=x.querySelector('.mark');
          if(x.dataset.correct==='1'){ x.classList.add('correct'); if(m)m.textContent='✓'; }
          else if(x===o){ x.classList.add('wrong'); if(m)m.textContent='✗'; }
        });
      });
    });
  });
})();

// ===== 体验增强层:滚动揭幕 + 销名微互动(渐进增强) =====
(function(){
  var doc=document.documentElement;
  doc.classList.add('js-on');
  // 销名:点名字→朱砂划掉→揭payoff
  var xm=document.querySelector('.xiaoming');
  if(xm){
    var nm=xm.querySelector('.xm-name');
    if(nm) nm.addEventListener('click',function(){
      if(xm.classList.contains('struck')) return;
      xm.classList.add('struck');
      if(navigator.vibrate){ try{ navigator.vibrate(14); }catch(e){} }
    });
  }
  // 滚动揭幕(reduced-motion / 无 IO → 不动,内容全显)
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce || !('IntersectionObserver' in window)) return;
  doc.classList.add('anim-on');
  var sel='.art > h2, .art .charcard, .art .note, .art .timeline, .art .glossary, .art .quiz, .art .pull, .art > .callout, .art .xiaoming, .art .mi, .story-hero .hero-art';
  var els=[].slice.call(document.querySelectorAll(sel));
  if(!els.length) return;
  els.forEach(function(el){ el.classList.add('reveal'); });
  var io=new IntersectionObserver(function(ents){
    ents.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); if(e.target.tagName==='H2'&&window.YP&&window.YP.note)window.YP.note(); } });
  },{rootMargin:'0px 0px -8% 0px',threshold:0.08});
  els.forEach(function(el){ io.observe(el); });
  setTimeout(function(){ els.forEach(function(el){ el.classList.add('in'); }); },2600); // 安全兜底
})();

// ===== 体验增强 v2:古琴点睛 + 命运红线脊 + 章节微互动 =====
(function(){
  if(!document.querySelector('.art')) return;

  // --- 古琴点睛(Web Audio 合成,默认关) ---
  var AC=null, sndOn=false, ni=0, penta=[261.63,293.66,329.63,392.00,440.00,523.25,587.33];
  function ac(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ AC=null; } } if(AC&&AC.state==='suspended')AC.resume(); return AC; }
  function pluck(f){ var c=ac(); if(!c)return; var t=c.currentTime; var o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter(); o.type='triangle';o2.type='sine';o.frequency.value=f;o2.frequency.value=f*2.002; lp.type='lowpass';lp.frequency.value=2000; g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.15,t+0.008);g.gain.exponentialRampToValueAtTime(0.0006,t+2.4); o.connect(lp);o2.connect(lp);lp.connect(g);g.connect(c.destination); o.start(t);o2.start(t);o.stop(t+2.5);o2.stop(t+2.5); }
  window.YP={ note:function(){ if(sndOn) pluck(penta[ni++ % penta.length]); } };
  var sb=document.createElement('button'); sb.className='sndbtn'; sb.type='button'; sb.setAttribute('aria-label','Toggle ambient guqin sound'); sb.textContent='♪';
  sb.addEventListener('click',function(){ sndOn=!sndOn; sb.classList.toggle('on',sndOn); if(sndOn){ ac(); pluck(penta[0]); } });
  document.body.appendChild(sb);

  // --- 命运红线 脊(桌面 ≥1101) ---
  (function(){
    if(window.innerWidth<1101) return;
    var art=document.querySelector('.art'); var hs=[].slice.call(art.querySelectorAll('h2[id]')); if(!hs.length) return;
    var sp=document.createElement('div'); sp.className='spine'; sp.innerHTML='<div class="fill"></div>'; document.body.appendChild(sp);
    var fill=sp.querySelector('.fill');
    var ks=hs.map(function(h){ var k=document.createElement('button'); k.className='knot'; k.type='button'; k.title=(h.textContent||'').slice(0,40); k.addEventListener('click',function(){ h.scrollIntoView({behavior:'smooth',block:'start'}); }); sp.appendChild(k); return {h:h,k:k}; });
    function place(){ var sh=document.documentElement.scrollHeight||1; ks.forEach(function(o){ o.k.style.top=Math.min(100,Math.max(0,o.h.offsetTop/sh*100))+'%'; }); }
    function upd(){ var dh=document.documentElement.scrollHeight-window.innerHeight; var p=dh>0?(window.scrollY/dh):0; fill.style.height=Math.min(100,p*100)+'%'; var sy=window.scrollY+window.innerHeight*0.42; ks.forEach(function(o){ o.k.classList.toggle('passed', o.h.offsetTop<=sy); }); }
    place(); upd(); addEventListener('scroll',upd,{passive:true}); addEventListener('resize',function(){ place(); upd(); });
  })();

  // --- 章节微互动 ---
  function fly(m){ var tok=m.querySelector('.mi-change'), st=m.querySelector('.mi-stage'); if(!tok||!st)return; var cur=0,max=0,drag=false,sy=0,sc=0;
    function bd(){ max=st.clientHeight-58-4-72; if(max<60)max=Math.max(60,st.clientHeight-90); }
    function set(y){ cur=Math.max(0,Math.min(max,y)); tok.style.transform='translate(-50%,-'+cur+'px)'; if(cur>=max-5&&!m.classList.contains('done'))fin(); }
    function fin(){ m.classList.add('done'); tok.style.transition='transform .55s ease'; tok.style.transform='translate(-50%,-'+max+'px)'; if(window.YP)window.YP.note(); }
    bd();
    tok.addEventListener('pointerdown',function(e){ if(m.classList.contains('done'))return; drag=true; sy=e.clientY; sc=cur; try{tok.setPointerCapture(e.pointerId);}catch(x){} tok.style.transition='none'; tok.style.cursor='grabbing'; });
    tok.addEventListener('pointermove',function(e){ if(!drag)return; set(sc+(sy-e.clientY)); });
    window.addEventListener('pointerup',function(){ if(drag){drag=false; tok.style.cursor='grab';} });
    tok.addEventListener('keydown',function(e){ if(e.key==='ArrowUp'||e.key==='Up'){ e.preventDefault(); tok.style.transition='transform .15s'; set(cur+26); } });
  }
  function shoot(m){ var suns=m.querySelectorAll('.sun'), b=m.querySelector('.mi-bow'), c=m.querySelector('.mi-count'); var left=suns.length, i=0; function u(){ if(c)c.textContent=left+' suns'; } u();
    b.addEventListener('click',function(){ if(left<=1)return; var s=suns[i++]; if(s)s.classList.add('out'); left--; u(); if(window.YP)window.YP.note(); if(left<=1){ b.disabled=true; m.classList.add('done'); } }); }
  function fill(m){ var sea=m.querySelector('.mi-sea'), b=m.querySelector('.mi-drop'), c=m.querySelector('.mi-count'); var n=0;
    b.addEventListener('click',function(){ n++; if(c)c.textContent=n; var p=document.createElement('span'); p.className='pebble'; p.style.left=(28+Math.random()*44)+'%'; sea.appendChild(p); setTimeout(function(){ if(p.parentNode)p.parentNode.removeChild(p); },1300); if(window.YP)window.YP.note(); if(n>=8&&!m.classList.contains('done'))m.classList.add('done'); }); }
  document.querySelectorAll('.mi').forEach(function(m){ var t=m.getAttribute('data-mi'); if(t==='fly')fly(m); else if(t==='shoot')shoot(m); else if(t==='fill')fill(m); });
})();
