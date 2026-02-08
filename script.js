document.addEventListener('DOMContentLoaded', function(){
  const yes = document.getElementById('yes');
  const no = document.getElementById('no');
  const yes2 = document.getElementById('yes2');
  const no2 = document.getElementById('no2');
  let heartLayer = document.getElementById('heartLayer');
  let confettiCanvas = document.getElementById('confettiCanvas');
  const modal = document.getElementById('yesModal');
  const closeModal = document.getElementById('closeModal');
  const revealBtn = document.getElementById("revealMsg");
  const finalMsg = document.getElementById("finalMsg");
  const audio = document.getElementById("bgm");

  const START = 0;
  const END = 78;

  /* ---------- SESSION INIT (FIRST PAGE ONLY) ---------- */
  if (!sessionStorage.getItem("visited")) {
    localStorage.removeItem("audioTime");
    sessionStorage.removeItem("soundAllowed");
    sessionStorage.setItem("visited", "true");
  }

  /* ---------- RESTORE TIME ---------- */
  let savedTime = parseFloat(localStorage.getItem("audioTime")) || START;

  /* ---------- START AUDIO ---------- */
  function startAudio() {
    const soundAllowed = sessionStorage.getItem("soundAllowed") === "true";

    // restore time safely
    if (savedTime < START || savedTime > END) {
      savedTime = START;
    }

    audio.currentTime = savedTime;

    // 🔑 KEY LINE: mute ONLY if sound not allowed
    audio.muted = !soundAllowed;

    audio.play().catch(() => {});
  }

  /* ---------- EVENTS ---------- */
  audio.addEventListener("loadedmetadata", startAudio);

  audio.addEventListener("timeupdate", () => {
    localStorage.setItem("audioTime", audio.currentTime);

    if (audio.currentTime >= END) {
      audio.currentTime = START;
    }
  });

  /* ---------- USER CLICK (ONLY NEEDED ON FIRST PAGE) ---------- */
  document.addEventListener("click", () => {
    if (sessionStorage.getItem("soundAllowed") !== "true") {
      sessionStorage.setItem("soundAllowed", "true");
      audio.muted = false;
      audio.play().catch(() => {});
    }
  
  });

    // 🔁 Handle back / forward navigation
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      // Page restored from back-forward cache
      const soundAllowed = sessionStorage.getItem("soundAllowed") === "true";
      const savedTime = parseFloat(localStorage.getItem("audioTime")) || START;

      audio.currentTime = savedTime;
      audio.muted = !soundAllowed;
      audio.play().catch(() => {});
    }
  });

  // ensure heart layer exists (so second.html also gets hearts)
  if(!heartLayer){
    heartLayer = document.createElement('div');
    heartLayer.id = 'heartLayer';
    heartLayer.setAttribute('aria-hidden','true');
    document.body.appendChild(heartLayer);
  }
  if(!confettiCanvas){
    confettiCanvas = document.createElement('canvas');
    confettiCanvas.id = 'confettiCanvas';
    confettiCanvas.style.position = 'fixed';
    confettiCanvas.style.left = '0';
    confettiCanvas.style.top = '0';
    confettiCanvas.style.pointerEvents = 'none';
    confettiCanvas.style.zIndex = '9999';
    confettiCanvas.style.display = 'none';
    document.body.appendChild(confettiCanvas);
  }

  if(yes){
    yes.addEventListener('click', function(){
      // show joyful modal and play confetti
      yes.textContent = 'Yay! ❤';
      yes.disabled = true;
      popHearts(8);
      runConfetti();
      if(modal) modal.setAttribute('aria-hidden','false');
      // start drawing the heart inside the modal after it opens
      setTimeout(() => { if (typeof startHeartDrawing === 'function') startHeartDrawing(); }, 300);
      setTimeout(()=>{ yes.disabled = false; }, 1200);
    });
  }

  // No button should be fixed: navigate directly to second page
  if(no){
    no.addEventListener('click', function(e){
      window.location.href = 'second.html';
    });
  }

  // second page buttons: yes2 shows effects, no2 goes back
  if(yes2){
    yes2.addEventListener("click", function(){

      // 1. Effects
      popHearts(8);
      runConfetti();

      // 2. Button feedback
      yes2.textContent = "Yay! ❤";
      yes2.disabled = true;

      // 3. Open Modal
      if(modal) modal.setAttribute("aria-hidden","false");

      // 4. Start Infinity Drawing inside Modal
      setTimeout(() => {
        startInfinityDrawing();
      }, 400);

    });
  }

  if(no2){
    no2.addEventListener('click', function(e){
      // go forward to the third page in the sequence
      window.location.href = 'third.html';
    });
  }

  // third page buttons (if third.html is loaded)
  const yes3 = document.getElementById('yes3');
  const no3 = document.getElementById('no3');
  if(yes3){
    yes3.addEventListener("click", function(){

      popHearts(8);
      runConfetti();

      yes3.textContent = "Awww 💞";
      yes3.disabled = true;

      if(modal) modal.setAttribute("aria-hidden","false");

      setTimeout(() => {
        startSoulmateDrawing();
      }, 400);

    });
  }

  if(no3){
    no3.addEventListener('click', function(){
      // go forward to the fourth page in the sequence
      window.location.href = 'fourth.html';
    });
  }

  // fourth page buttons (if fourth.html is loaded)
  const yes4 = document.getElementById('yes4');
  const no4 = document.getElementById('no4');
  if(yes4){
    yes4.addEventListener('click', function(){
      // celebratory feedback then go to fifth page
      popHearts(8);
      runConfetti();
      yes4.textContent = 'Yay! ❤';
      yes4.disabled = true;
      setTimeout(()=>{ window.location.href = 'fifth.html'; }, 700);
    });
  }
  if(no4){
    // make the No button dodge the cursor on the fourth page
    let no4Offset = {x:0,y:0};
    let no4Dodge = 0;
    no4.addEventListener('click', function(){
      // fallback click if user manages to click it
      popHearts(2);
    });
    document.addEventListener('mousemove', function(e){
      const rect = no4.getBoundingClientRect();
      const nx = rect.left + rect.width/2;
      const ny = rect.top + rect.height/2;
      const dx = e.clientX - nx;
      const dy = e.clientY - ny;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < 140){
        no4Dodge++;
        const moveX = (Math.random()*2 - 1) * (80 + no4Dodge*8);
        const moveY = (Math.random()*2 - 1) * (40 + no4Dodge*4);
        no4Offset.x += moveX;
        no4Offset.y += moveY;
        no4Offset.x = Math.max(Math.min(no4Offset.x, 260), -260);
        no4Offset.y = Math.max(Math.min(no4Offset.y, 160), -160);
        no4.style.transform = `translate(${no4Offset.x}px, ${no4Offset.y}px)`;
        popHearts(1, e.clientX, e.clientY);
      }
    });
  }

  if(closeModal) closeModal.addEventListener('click', function(){ if(modal) modal.setAttribute('aria-hidden','true'); });

  // Create floating hearts
  function popHearts(count, x, y){
    for(let i=0;i<count;i++){
      const span = document.createElement('span');
      span.className = 'heart';
      span.textContent = '💖';
      const left = (x ? x : window.innerWidth/2) + (Math.random()*120 - 60);
      const top = (y ? y : window.innerHeight/2) + (Math.random()*24 - 12);
      span.style.left = left + 'px';
      span.style.top = top + 'px';
      span.style.fontSize = (16 + Math.random()*20) + 'px';
      span.style.animationDuration = (1.6 + Math.random()*1.2) + 's';
      heartLayer.appendChild(span);
      // remove after animation
      setTimeout(()=>{ span.remove(); }, 2200);
    }
  }

  // Simple confetti implementation (canvas)
  function runConfetti(){
    const canvas = confettiCanvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    canvas.style.display = 'block';
    const pieces = [];
    const colors = ['#ff6b6b','#ffd93d','#6bcB77','#6b9CFF','#d19cff'];
    for(let i=0;i<120;i++){
      pieces.push({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height - canvas.height,
        r: 6 + Math.random()*8,
        c: colors[Math.floor(Math.random()*colors.length)],
        vx: (Math.random()-0.5)*4,
        vy: 2 + Math.random()*4,
        rot: Math.random()*360,
        vr: (Math.random()-0.5)*8
      });
    }
    let t = 0;
    function frame(){
      t += 1/60;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for(const p of pieces){
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06; // gravity
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.rot*Math.PI/180);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*1.6);
        ctx.restore();
      }
      if(t < 2.2) requestAnimationFrame(frame);
      else{ canvas.style.display='none'; ctx.clearRect(0,0,canvas.width,canvas.height); }
    }
    requestAnimationFrame(frame);
  }
  if (revealBtn && finalMsg) {
  revealBtn.addEventListener("click", () => {
    revealBtn.style.display = "none";
    finalMsg.hidden = false;
    // optional extra love
    if (typeof popHearts === "function") popHearts(12);
    if (typeof runConfetti === "function") runConfetti();
  });
}
});

/* ================================
   HEART DRAWING (YES MODAL)
================================ */

// function startHeartDrawing() {
//   const heartPanel = document.getElementById("heartPanel");
//   const canvas = document.getElementById("heartCanvas");
//   if (!heartPanel || !canvas) return;

//   heartPanel.classList.remove("hidden");

//   const ctx = canvas.getContext("2d");
//   const W = canvas.width;
//   const H = canvas.height;

//   ctx.clearRect(0, 0, W, H);
//   ctx.save();

//   // Center + flip Y like Desmos
//   ctx.translate(W / 2, H / 2);
//   ctx.scale(1, -1);

//   ctx.strokeStyle = "#f48ca3";
//   ctx.lineWidth = 1;

//   let k = 0;
//   const maxK = 100;

//   const animate = setInterval(() => {
//     ctx.clearRect(-W, -H, W * 2, H * 2);

//     for (let x = -Math.sqrt(3); x <= Math.sqrt(3); x += 0.01) {
//       const base = Math.pow(Math.abs(x), 2 / 3);
//       const wave = 0.9 * Math.sin(k * x) * Math.sqrt(3 - x * x);
//       const y = base + wave;

//       // Scale to canvas space
//       const px = x * 70;
//       const py = y * 45;

//       // 🔑 THIS IS WHAT WAS MISSING BEFORE
//       ctx.beginPath();
//       ctx.moveTo(px, -py); // bottom half
//       ctx.lineTo(px, py);  // top half
//       ctx.stroke();
//     }

//     k += 1;

//     if (k >= maxK) {
//       clearInterval(animate);
//       ctx.restore();

//       setTimeout(() => {
//         window.location.href = "heart-message.html";
//       }, 1200);
//     }
//   }, 30);
// }

function startHeartDrawing() {
  const canvas = document.getElementById("heartCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  const step = 0.01;
  const limit = Math.sqrt(3);

  let k = 0;
  const maxK = 100;

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    ctx.save();

    // Center the drawing and flip Y-axis
    ctx.translate(W / 2, H / 2 + 50);
    ctx.scale(1, -1);

    ctx.strokeStyle = "#ff4d6d";
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = -limit; x <= limit; x += step) {
      // YOUR EXACT EQUATION (UNCHANGED)
      const term1 = Math.pow(Math.abs(x), 2 / 3);
      const term2 =
        0.9 * Math.sin(k * x) * Math.sqrt(3 - Math.pow(x, 2));
      const y = term1 + term2;

      const px = x * 70;
      const py = y * 80;

      if (x === -limit) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.stroke();
    ctx.restore();

    // Animate k from 0 → 100
    if (k < maxK) {
      k += 0.3;
      requestAnimationFrame(drawFrame);
    } else {
      // ❤️ After heart completes → open message page
      setTimeout(() => {
        window.location.href = "heart-message.html";
      }, 1200);
    }
  }

  drawFrame();
}

function startInfinityDrawing() {

  const heartPanel = document.getElementById("heartPanel");
  const canvas = document.getElementById("heartCanvas");

  if (!canvas || !heartPanel) return;

  heartPanel.classList.remove("hidden");

  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  // ✅ Setup transform ONCE
  ctx.save();
  ctx.translate(W / 2, H / 2);

  ctx.strokeStyle = "#ff4d6d";
  ctx.lineWidth = 2;

  let t = 0;
  const tMax = 10;
  const tStep = 0.02;

  let first = true;

  function drawFrame() {

    // Equation: x=1.6cos(2t), y=0.5sin(4t)
    const x = 1.6 * Math.cos(2 * t);
    const y = 0.5 * Math.sin(4 * t);

    const px = x * 75;
    const py = y * 130;

    if (first) {
      ctx.beginPath();
      ctx.moveTo(px, py);
      first = false;
    } else {
      ctx.lineTo(px, py);
      ctx.stroke();
    }

    t += tStep;

    if (t <= tMax) {
      requestAnimationFrame(drawFrame);
    } else {
      // ✅ Restore only AFTER animation ends
      ctx.restore();

      setTimeout(() => {
        window.location.href = "infinity-message.html";
      }, 100);
    }
  }

  drawFrame();
}

/* ================================
   SOULMATE HEARTS (THIRD PAGE)
================================ */
function startSoulmateDrawing() {
  const heartPanel = document.getElementById("heartPanel");
  const canvas = document.getElementById("heartCanvas");
  const text = document.getElementById("heartText");

  if (!canvas || !heartPanel) return;

  heartPanel.classList.remove("hidden");

  if (text) {
    text.innerHTML = "Two hearts… slowly finding each other 💞";
  }

  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  // Heart curve parameters
  let t = 0;
  const tMax = Math.PI * 2;
  const step = 0.02;

  // Starting distance between hearts
  let offset = 90; // wide apart
  const mergeSpeed = 0.6; // how fast they come together

  function heartPoint(theta, offsetX) {
    const x = 16 * Math.pow(Math.sin(theta), 3);
    const y =
      13 * Math.cos(theta) -
      5 * Math.cos(2 * theta) -
      2 * Math.cos(3 * theta) -
      Math.cos(4 * theta);

    return {
      px: x * 4 + offsetX,
      py: -y * 4
    };
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    ctx.save();

    // Center canvas
    ctx.translate(W / 2, H / 2);

    ctx.strokeStyle = "#ff4d6d";
    ctx.lineWidth = 2;

    // Draw LEFT heart
    ctx.beginPath();
    for (let a = 0; a <= t; a += step) {
      const p = heartPoint(a, -offset);
      if (a === 0) ctx.moveTo(p.px, p.py);
      else ctx.lineTo(p.px, p.py);
    }
    ctx.stroke();

    // Draw RIGHT heart
    ctx.beginPath();
    for (let a = 0; a <= t; a += step) {
      const p = heartPoint(a, offset);
      if (a === 0) ctx.moveTo(p.px, p.py);
      else ctx.lineTo(p.px, p.py);
    }
    ctx.stroke();

    ctx.restore();

    // Progress drawing
    if (t < tMax) {
      t += step;
    } 
    // After full hearts are drawn → start merging
    else if (offset > 0) {
      offset -= mergeSpeed;
    } 
    // Once merged → redirect
    else {
      setTimeout(() => {
        window.location.href = "soul-message.html";
      }, 1200);
      return;
    }

    requestAnimationFrame(animate);
  }

  animate();
}


/* ================================
   INDEX PAGE: TAP TO ENABLE MUSIC
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("soundPopup");
  const audio = document.getElementById("bgm");

  // Only run on index.html (popup exists only there)
  if (!popup || !audio) return;

  function enableMusic() {
    audio.muted = false;
    audio.play().catch(() => {});

    popup.style.display = "none";

    // Remove listener after first click
    document.removeEventListener("click", enableMusic);
  }

  // Wait for first user interaction
  document.addEventListener("click", enableMusic);
});

