// The look of the conversation box: one stylesheet (injected once per page)
// holding the shared layout, the motion, and the four themes. A theme is a
// class on the box (rpgc-theme-<name>) that sets the --rpgc-* variables the
// layout reads, plus whatever decoration is its own.
//
//   oldgold       dark leather and ebony, gold filigree edges, engraved
//                 capitals; letters glint gold as they land
//   blackpanther  obsidian and violet energy - angular, a charge running the
//                 edges; letters flicker on like neon
//   whiteheaven   pearl and marble in soft gold, light falling through;
//                 letters bloom out of the glow
//   oldrpg        the classic blue window with the white border, pixel
//                 letters popping on, the blinking arrow

export const THEMES = {
    oldgold: {
        fonts: "family=Cinzel:wght@600;700&family=Cormorant+Garamond:wght@500;600;700",
        voice: "quill",
    },
    blackpanther: {
        fonts: "family=Orbitron:wght@600;700&family=Rajdhani:wght@500;600;700",
        voice: "pulse",
    },
    whiteheaven: {
        fonts: "family=Cinzel:wght@600;700&family=Cormorant+Garamond:wght@500;600;700",
        voice: "breath",
    },
    oldrpg: {
        fonts: "family=Press+Start+2P",
        voice: "chip",
    },
}
export const DEFAULT_THEME = "oldgold"

const STYLE_ID = "rpg-convers-style"

/** Puts the stylesheet on the page once. */
export function injectStyle(doc){
    if(doc.getElementById(STYLE_ID)) return
    const style = doc.createElement("style")
    style.id = STYLE_ID
    style.textContent = CSS
    doc.head.append(style)
}

/** Loads a theme's web fonts (Google Fonts) once per page. */
export function loadThemeFonts(doc, theme){
    const fonts = THEMES[theme]?.fonts
    if(!fonts) return
    const id = `rpg-convers-fonts-${theme}`
    if(doc.getElementById(id)) return
    const link = doc.createElement("link")
    link.id = id
    link.rel = "stylesheet"
    link.href = `https://fonts.googleapis.com/css2?${fonts}&display=swap`
    doc.head.append(link)
}

const CSS = `
/* ── the box ─────────────────────────────────────────────────────────── */
.rpgc{position:fixed;left:50%;bottom:var(--rpgc-bottom,calc(max(3vh,env(safe-area-inset-bottom,0px)) + 8px));
  width:var(--rpgc-width,min(960px,calc(100vw - 32px)));transform:translateX(-50%);z-index:var(--rpgc-z,900);
  display:none;color:var(--rpgc-text);-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;
  user-select:none;-webkit-user-select:none}
.rpgc *,.rpgc *::before,.rpgc *::after{box-sizing:border-box}
.rpgc-body{position:relative;min-height:122px;padding:32px 36px 26px;cursor:pointer;opacity:0;
  font:var(--rpgc-weight,500) var(--rpgc-size,1.12rem)/var(--rpgc-leading,1.55) var(--rpgc-font,Georgia,serif)}
.rpgc-shown .rpgc-body{animation:var(--rpgc-open,rpgc-rise .55s cubic-bezier(.2,.9,.25,1.12) forwards)}
.rpgc-closing .rpgc-body{animation:var(--rpgc-close,rpgc-sink .38s ease-in forwards)}
@keyframes rpgc-rise{0%{opacity:0;transform:translateY(28px) scale(.94);filter:blur(6px)}
  55%{opacity:1;filter:blur(0)}100%{opacity:1;transform:none;filter:none}}
@keyframes rpgc-sink{from{opacity:1}to{opacity:0;transform:translateY(18px) scale(.97);filter:blur(4px)}}
.rpgc.rpgc-shake{animation:rpgc-shake .34s cubic-bezier(.36,.07,.19,.97)}
@keyframes rpgc-shake{0%,100%{transform:translateX(-50%)}20%{transform:translateX(calc(-50% - 5px)) rotate(-.5deg)}
  40%{transform:translateX(calc(-50% + 4px)) rotate(.4deg)}60%{transform:translateX(calc(-50% - 3px))}80%{transform:translateX(calc(-50% + 2px))}}

/* its face: the theme's surface, or the image given */
.rpgc-surface{position:absolute;inset:0;border-radius:var(--rpgc-radius,6px);background:var(--rpgc-surface);
  box-shadow:var(--rpgc-shadow,0 18px 50px rgba(0,0,0,.6));overflow:hidden}
.rpgc-has-image .rpgc-surface{background:var(--rpgc-image) center/var(--rpgc-image-size,100% 100%) no-repeat}
.rpgc-has-image .rpgc-surface::after{content:"";position:absolute;inset:0;background:var(--rpgc-image-tint,transparent)}

/* the frame: drawn out from the middle as it opens */
.rpgc-frame{position:absolute;inset:0;border-radius:var(--rpgc-radius,6px);border:var(--rpgc-border,1px solid rgba(255,255,255,.3));pointer-events:none}
.rpgc-shown .rpgc-frame{animation:var(--rpgc-draw,rpgc-draw .75s .05s cubic-bezier(.6,0,.2,1) both)}
@keyframes rpgc-draw{from{clip-path:inset(-20px 50% -20px 50%)}to{clip-path:inset(-20px -20px -20px -20px)}}
.rpgc-corner{position:absolute;display:none;pointer-events:none}
.rpgc-tl{top:-5px;left:-5px}.rpgc-tr{top:-5px;right:-5px}.rpgc-bl{bottom:-5px;left:-5px}.rpgc-br{bottom:-5px;right:-5px}

/* a light sweeping across as it opens */
.rpgc-sheen{position:absolute;inset:0;border-radius:var(--rpgc-radius,6px);overflow:hidden;pointer-events:none}
.rpgc-sheen::before{content:"";position:absolute;top:-10%;bottom:-10%;width:38%;left:-60%;
  background:linear-gradient(100deg,transparent,var(--rpgc-sheen,rgba(255,255,255,.14)),transparent);transform:skewX(-18deg)}
.rpgc-shown .rpgc-sheen::before{animation:rpgc-sweep 1.15s .2s ease-out both}
@keyframes rpgc-sweep{from{left:-60%}to{left:130%}}

/* who is speaking: a plate on the speaker's side, over the top edge */
.rpgc-name{position:absolute;top:0;left:30px;max-width:62%;padding:6px 18px 7px;transform:translateY(-58%);
  font:700 var(--rpgc-name-size,.8rem)/1 var(--rpgc-name-font,Georgia,serif);letter-spacing:var(--rpgc-name-spacing,.16em);
  text-transform:var(--rpgc-name-case,uppercase);color:var(--rpgc-name-color);background:var(--rpgc-name-bg);
  border:var(--rpgc-name-border,none);border-radius:var(--rpgc-name-radius,3px);box-shadow:var(--rpgc-name-shadow,0 6px 16px rgba(0,0,0,.5));
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:0;pointer-events:none;z-index:2}
.rpgc-right .rpgc-name{left:auto;right:30px}
.rpgc-named .rpgc-name{opacity:1}
.rpgc-name.rpgc-name-in{animation:rpgc-name-in .5s cubic-bezier(.2,.9,.3,1.35) both}
@keyframes rpgc-name-in{from{opacity:0;transform:translateY(-10%) scale(.7);filter:blur(3px)}to{opacity:1;transform:translateY(-58%) scale(1);filter:none}}

/* the speaker's picture, standing on the box at their side */
.rpgc-portrait{position:absolute;bottom:0;left:-6px;height:calc(100% + 96px);max-width:26%;object-fit:contain;object-position:bottom;
  display:none;pointer-events:none;filter:drop-shadow(0 8px 18px rgba(0,0,0,.55));z-index:1}
.rpgc-right .rpgc-portrait{left:auto;right:-6px}
.rpgc-has-portrait .rpgc-portrait{display:block;animation:rpgc-portrait .5s cubic-bezier(.2,.9,.3,1.1) both}
@keyframes rpgc-portrait{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.rpgc-has-portrait.rpgc-left .rpgc-text{padding-left:24%}
.rpgc-has-portrait.rpgc-right .rpgc-text{padding-right:24%}
/* the name plate steps in past the picture rather than sitting on it */
.rpgc-has-portrait.rpgc-left .rpgc-name{left:calc(24% + 30px)}
.rpgc-has-portrait.rpgc-right .rpgc-name{right:calc(24% + 30px)}

/* the words: every letter lands on its own */
.rpgc-text{position:relative;margin:0;min-height:3.1em;text-shadow:var(--rpgc-text-shadow,none);z-index:2;
  transition:opacity .12s ease,transform .12s ease}
.rpgc-text.rpgc-leaving{opacity:0;transform:translateY(-7px)}
.rpgc-text b,.rpgc-text strong,.rpgc-text em{color:var(--rpgc-accent)}
.rpgc-w{white-space:nowrap}
.rpgc-ch{display:inline-block;opacity:0;white-space:pre}
/* spaces stay ordinary breakable spaces - the letters' white-space:pre on them
   left a line nowhere to wrap, and it ran out of the box */
.rpgc-sp{display:inline;opacity:1;white-space:normal}
.rpgc-ch.rpgc-on{animation:var(--rpgc-letter,rpgc-letter .42s cubic-bezier(.2,.8,.3,1) both)}
@keyframes rpgc-letter{0%{opacity:0;transform:translateY(.45em) scale(.7);filter:blur(5px);color:var(--rpgc-accent);text-shadow:0 0 14px var(--rpgc-glow)}
  55%{opacity:1;filter:blur(0)}100%{opacity:1;transform:none;filter:none}}
/* a word shouted in capitals slams in, in the accent */
.rpgc-loud .rpgc-ch{color:var(--rpgc-accent)}
.rpgc-loud .rpgc-ch.rpgc-on{animation:rpgc-loud .5s cubic-bezier(.2,.9,.3,1.2) both}
@keyframes rpgc-loud{0%{opacity:0;transform:scale(1.9) rotate(-7deg);filter:blur(3px);text-shadow:0 0 20px var(--rpgc-glow)}
  60%{opacity:1;transform:scale(.92);filter:none}100%{opacity:1;transform:none}}

/* the way on: a cue bobbing once the line is all out, and the button */
.rpgc-foot{position:absolute;right:16px;bottom:0;transform:translateY(42%);display:flex;align-items:center;gap:12px;z-index:3}
.rpgc-cue{width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:9px solid var(--rpgc-accent);
  opacity:0;filter:drop-shadow(0 0 6px var(--rpgc-glow));transition:opacity .2s}
.rpgc-done .rpgc-cue{opacity:1;animation:var(--rpgc-cue,rpgc-bob .9s ease-in-out infinite)}
@keyframes rpgc-bob{0%,100%{transform:translateY(-2px)}50%{transform:translateY(3px)}}
.rpgc-next{font:700 var(--rpgc-btn-size,.72rem)/1 var(--rpgc-name-font,Georgia,serif);letter-spacing:var(--rpgc-btn-spacing,.22em);
  text-transform:uppercase;padding:10px 18px;border-radius:var(--rpgc-btn-radius,4px);cursor:pointer;color:var(--rpgc-btn-color);
  background:var(--rpgc-btn-bg);border:var(--rpgc-btn-border,none);box-shadow:var(--rpgc-btn-shadow,none);
  transition:transform .15s,filter .2s,box-shadow .35s,opacity .25s;-webkit-tap-highlight-color:transparent}
.rpgc:not(.rpgc-done) .rpgc-next{opacity:.72}
.rpgc-done .rpgc-next{box-shadow:var(--rpgc-btn-shadow,none),0 0 22px var(--rpgc-glow)}
.rpgc-next:hover{transform:translateY(-1px);filter:brightness(1.12)}
.rpgc-next:active{transform:translateY(1px) scale(.97)}
.rpgc-next:focus-visible{outline:2px solid var(--rpgc-accent);outline-offset:3px}

/* a burst off the last letter as a line finishes */
.rpgc-sparks{position:absolute;inset:0;pointer-events:none;z-index:3}
.rpgc-spark{position:absolute;width:4px;height:4px;margin:-2px 0 0 -2px;border-radius:50%;background:var(--rpgc-spark,#fff);
  box-shadow:0 0 8px 2px var(--rpgc-glow);animation:rpgc-spark .8s ease-out forwards}
@keyframes rpgc-spark{from{opacity:1;transform:translate(0,0) scale(1)}to{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.2)}}

/* small screens and phones held sideways */
@media (max-width:560px),(max-height:500px){
  .rpgc-body{min-height:96px;padding:24px 22px 22px;font-size:calc(var(--rpgc-size,1.12rem) * .88)}
  .rpgc-name{left:18px;font-size:calc(var(--rpgc-name-size,.8rem) * .9)}
  .rpgc-right .rpgc-name{right:18px}
  .rpgc-portrait{height:calc(100% + 60px)}
}
@media (prefers-reduced-motion:reduce){
  .rpgc-ch.rpgc-on,.rpgc-loud .rpgc-ch.rpgc-on{animation:none;opacity:1}
  .rpgc-shown .rpgc-body{animation:none;opacity:1}
  .rpgc.rpgc-shake,.rpgc-done .rpgc-cue,.rpgc-shown .rpgc-sheen::before,.rpgc-shown .rpgc-frame{animation:none}
  .rpgc-spark{display:none}
}

/* ── OLD GOLD ────────────────────────────────────────────────────────── */
.rpgc-theme-oldgold{--rpgc-font:'Cormorant Garamond','Caudex',Georgia,serif;--rpgc-weight:600;--rpgc-size:1.22rem;--rpgc-leading:1.5;
  --rpgc-name-font:'Cinzel',Georgia,serif;--rpgc-text:#f1e4c8;--rpgc-accent:#f6d48a;--rpgc-glow:rgba(255,176,72,.6);--rpgc-spark:#ffe3a3;
  --rpgc-sheen:rgba(255,220,150,.2);--rpgc-radius:6px;
  --rpgc-surface:radial-gradient(120% 160% at 50% -10%,rgba(130,78,24,.38),transparent 60%),linear-gradient(180deg,#1f150c,#0d0906);
  --rpgc-shadow:0 18px 50px rgba(0,0,0,.65),0 0 0 1px rgba(0,0,0,.85),inset 0 0 44px rgba(0,0,0,.6);
  --rpgc-border:1px solid rgba(214,170,96,.78);--rpgc-text-shadow:0 1px 0 rgba(0,0,0,.85),0 0 18px rgba(0,0,0,.6);
  --rpgc-name-bg:linear-gradient(180deg,#2c1d0f,#130c06);--rpgc-name-color:#f6d48a;--rpgc-name-border:1px solid rgba(214,170,96,.85);
  --rpgc-name-shadow:0 6px 18px rgba(0,0,0,.6),0 0 14px rgba(255,170,70,.18);
  --rpgc-btn-bg:linear-gradient(180deg,#ffe2a6,#d39a4a 55%,#a8692a);--rpgc-btn-color:#1c0f05;--rpgc-btn-border:1px solid rgba(255,220,160,.85);
  --rpgc-btn-shadow:0 2px 0 rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.5)}
.rpgc-theme-oldgold .rpgc-frame{box-shadow:inset 0 0 0 4px rgba(0,0,0,.45),inset 0 0 0 5px rgba(214,170,96,.28)}
.rpgc-theme-oldgold .rpgc-corner{display:block;width:10px;height:10px;background:linear-gradient(135deg,#fff0c4,#d9a95a);
  transform:rotate(45deg);box-shadow:0 0 0 2px rgba(0,0,0,.7),0 0 10px rgba(255,190,90,.8)}
.rpgc-theme-oldgold .rpgc-name::before,.rpgc-theme-oldgold .rpgc-name::after{content:"";position:absolute;top:50%;width:5px;height:5px;
  margin-top:-2.5px;background:#e6c27a;transform:rotate(45deg)}
.rpgc-theme-oldgold .rpgc-name::before{left:6px}.rpgc-theme-oldgold .rpgc-name::after{right:6px}
.rpgc-theme-oldgold.rpgc-has-image{--rpgc-image-tint:radial-gradient(120% 160% at 50% -10%,rgba(130,78,24,.22),transparent 60%)}

/* ── BLACK PANTHER ───────────────────────────────────────────────────── */
.rpgc-theme-blackpanther{--rpgc-font:'Rajdhani','Segoe UI',sans-serif;--rpgc-weight:600;--rpgc-size:1.18rem;--rpgc-leading:1.5;
  --rpgc-name-font:'Orbitron','Rajdhani',sans-serif;--rpgc-name-size:.74rem;--rpgc-name-spacing:.22em;
  --rpgc-text:#ece8ff;--rpgc-accent:#c9a6ff;--rpgc-glow:rgba(150,90,255,.75);--rpgc-spark:#dcc6ff;--rpgc-sheen:rgba(170,120,255,.2);--rpgc-radius:2px;
  --rpgc-surface:repeating-linear-gradient(135deg,rgba(255,255,255,.022) 0 2px,transparent 2px 9px),
    radial-gradient(90% 130% at 50% 130%,rgba(110,50,220,.32),transparent 60%),linear-gradient(180deg,#0c0a14,#050408);
  --rpgc-shadow:0 18px 50px rgba(0,0,0,.75),0 0 34px rgba(120,60,255,.2);
  --rpgc-border:1px solid rgba(160,110,255,.6);--rpgc-text-shadow:0 0 1px rgba(0,0,0,.9),0 0 16px rgba(120,60,255,.25);
  --rpgc-name-bg:linear-gradient(90deg,#160f2a,#0a0812);--rpgc-name-color:#e2d2ff;--rpgc-name-border:1px solid rgba(180,130,255,.85);
  --rpgc-name-radius:0;--rpgc-name-shadow:0 0 16px rgba(130,70,255,.45);
  --rpgc-btn-bg:linear-gradient(180deg,rgba(130,70,255,.22),rgba(60,20,140,.35));--rpgc-btn-color:#efe6ff;--rpgc-btn-border:1px solid rgba(190,150,255,.9);
  --rpgc-btn-radius:0;--rpgc-btn-shadow:0 0 12px rgba(130,70,255,.35),inset 0 0 12px rgba(150,90,255,.25);
  --rpgc-letter:rpgc-neon .4s linear both}
@keyframes rpgc-neon{0%{opacity:0;color:#fff;text-shadow:0 0 10px #c9a6ff,0 0 22px #7a3cff;transform:translateX(-3px)}
  25%{opacity:.85}38%{opacity:.25}52%{opacity:1;transform:none}66%{opacity:.6}100%{opacity:1}}
.rpgc-theme-blackpanther .rpgc-name{clip-path:polygon(10px 0,100% 0,calc(100% - 10px) 100%,0 100%)}
.rpgc-theme-blackpanther .rpgc-next{clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
.rpgc-theme-blackpanther .rpgc-frame::before,.rpgc-theme-blackpanther .rpgc-frame::after{content:"";position:absolute;height:2px;width:140px;
  background:linear-gradient(90deg,transparent,#d4b8ff,transparent);filter:drop-shadow(0 0 6px #9b5cff)}
.rpgc-theme-blackpanther .rpgc-frame::before{top:-1px;animation:rpgc-run 3.2s linear infinite}
.rpgc-theme-blackpanther .rpgc-frame::after{bottom:-1px;animation:rpgc-run-back 3.2s 1.6s linear infinite}
@keyframes rpgc-run{from{left:-140px}to{left:100%}}
@keyframes rpgc-run-back{from{left:100%}to{left:-140px}}
.rpgc-theme-blackpanther .rpgc-corner{display:block;width:18px;height:18px;border:2px solid #b98cff;filter:drop-shadow(0 0 5px #8a4dff)}
.rpgc-theme-blackpanther .rpgc-tl{border-right:0;border-bottom:0;top:-3px;left:-3px}
.rpgc-theme-blackpanther .rpgc-tr{border-left:0;border-bottom:0;top:-3px;right:-3px}
.rpgc-theme-blackpanther .rpgc-bl{border-right:0;border-top:0;bottom:-3px;left:-3px}
.rpgc-theme-blackpanther .rpgc-br{border-left:0;border-top:0;bottom:-3px;right:-3px}
.rpgc-theme-blackpanther.rpgc-has-image{--rpgc-image-tint:linear-gradient(180deg,rgba(40,10,90,.18),rgba(0,0,0,.25))}

/* ── WHITE HEAVEN ────────────────────────────────────────────────────── */
.rpgc-theme-whiteheaven{--rpgc-font:'Cormorant Garamond',Georgia,serif;--rpgc-weight:600;--rpgc-size:1.26rem;--rpgc-leading:1.48;
  --rpgc-name-font:'Cinzel',Georgia,serif;--rpgc-text:#2c2416;--rpgc-accent:#a9741c;--rpgc-glow:rgba(255,226,150,.95);--rpgc-spark:#fff3cf;
  --rpgc-sheen:rgba(255,255,255,.8);--rpgc-radius:16px;
  --rpgc-surface:radial-gradient(70% 140% at 50% -30%,#fffefa,rgba(255,255,255,0) 70%),linear-gradient(180deg,#fbf8f0,#ebe3d2);
  --rpgc-shadow:0 0 0 5px rgba(255,255,255,.55),0 0 46px rgba(255,236,190,.65),0 18px 40px rgba(0,0,0,.35);
  --rpgc-border:1px solid rgba(201,160,80,.85);--rpgc-text-shadow:0 1px 0 rgba(255,255,255,.85);
  --rpgc-name-bg:linear-gradient(180deg,#ffffff,#f3ead6);--rpgc-name-color:#8f6418;--rpgc-name-border:1px solid rgba(201,160,80,.9);
  --rpgc-name-radius:999px;--rpgc-name-shadow:0 0 18px rgba(255,230,160,.9),0 4px 12px rgba(0,0,0,.18);
  --rpgc-btn-bg:linear-gradient(180deg,#ffffff,#f1e6cc);--rpgc-btn-color:#8f6418;--rpgc-btn-border:1px solid rgba(201,160,80,.95);
  --rpgc-btn-radius:999px;--rpgc-btn-shadow:0 0 14px rgba(255,230,160,.8),0 2px 6px rgba(0,0,0,.18);
  --rpgc-letter:rpgc-bloom .55s ease-out both}
@keyframes rpgc-bloom{0%{opacity:0;filter:blur(6px) brightness(2.2);text-shadow:0 0 18px #ffe7a8,0 0 30px #fff;transform:translateY(-.2em) scale(1.15)}
  60%{opacity:1;filter:blur(0) brightness(1.2)}100%{opacity:1;filter:none;transform:none}}
.rpgc-theme-whiteheaven .rpgc-frame{box-shadow:inset 0 0 0 5px rgba(255,255,255,.7),inset 0 0 0 6px rgba(201,160,80,.35)}
.rpgc-theme-whiteheaven .rpgc-surface::before{content:"";position:absolute;left:-20%;right:-20%;top:-160%;height:260%;opacity:.55;
  background:repeating-conic-gradient(from 0deg at 50% 0%,rgba(255,255,255,0) 0deg 7deg,rgba(255,244,210,.55) 7deg 9deg);
  animation:rpgc-rays 9s ease-in-out infinite alternate;pointer-events:none}
@keyframes rpgc-rays{from{transform:rotate(-4deg);opacity:.35}to{transform:rotate(4deg);opacity:.65}}
.rpgc-theme-whiteheaven .rpgc-corner{display:block;width:8px;height:8px;border-radius:50%;background:#fff;box-shadow:0 0 10px 4px rgba(255,226,150,.95)}
.rpgc-theme-whiteheaven.rpgc-has-image{--rpgc-image-tint:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,250,235,.4))}

/* ── OLD RPG ─────────────────────────────────────────────────────────── */
.rpgc-theme-oldrpg{--rpgc-font:'Press Start 2P','Courier New',monospace;--rpgc-weight:400;--rpgc-size:.8rem;--rpgc-leading:2.05;
  --rpgc-name-font:'Press Start 2P','Courier New',monospace;--rpgc-name-size:.66rem;--rpgc-name-spacing:.04em;--rpgc-name-case:none;
  --rpgc-text:#ffffff;--rpgc-accent:#ffe066;--rpgc-glow:rgba(255,255,255,.25);--rpgc-spark:#ffffff;--rpgc-sheen:rgba(255,255,255,0);--rpgc-radius:8px;
  --rpgc-surface:linear-gradient(180deg,#3a50c4,#16218a 62%,#0c1460);
  --rpgc-shadow:0 0 0 2px #090920,0 8px 0 rgba(0,0,0,.35);
  --rpgc-border:3px solid #ffffff;--rpgc-text-shadow:2px 2px 0 #070a30;
  --rpgc-name-bg:linear-gradient(180deg,#3a50c4,#16218a);--rpgc-name-color:#ffffff;--rpgc-name-border:3px solid #ffffff;
  --rpgc-name-radius:6px;--rpgc-name-shadow:0 0 0 2px #090920;
  --rpgc-btn-bg:linear-gradient(180deg,#3a50c4,#16218a);--rpgc-btn-color:#ffffff;--rpgc-btn-border:3px solid #ffffff;--rpgc-btn-radius:6px;
  --rpgc-btn-shadow:0 0 0 2px #090920;--rpgc-btn-size:.6rem;--rpgc-btn-spacing:.05em;
  --rpgc-letter:rpgc-pop .06s steps(1) both;--rpgc-cue:rpgc-blink .7s steps(1) infinite;
  --rpgc-open:rpgc-unfold .26s steps(5) forwards;--rpgc-close:rpgc-fold .2s steps(4) forwards;
  --rpgc-draw:none}
@keyframes rpgc-pop{from{opacity:0}to{opacity:1}}
@keyframes rpgc-blink{0%{opacity:1}50%{opacity:0}}
@keyframes rpgc-unfold{from{opacity:1;transform:scaleY(.05)}to{opacity:1;transform:none}}
@keyframes rpgc-fold{from{opacity:1;transform:none}to{opacity:0;transform:scaleY(.05)}}
.rpgc-theme-oldrpg .rpgc-frame{box-shadow:inset 0 0 0 2px #090920}
.rpgc-theme-oldrpg .rpgc-cue{border-left-width:8px;border-right-width:8px;border-top:10px solid #fff;filter:none}
.rpgc-theme-oldrpg .rpgc-loud .rpgc-ch.rpgc-on{animation:rpgc-pop .06s steps(1) both}
.rpgc-theme-oldrpg .rpgc-portrait{image-rendering:pixelated}
.rpgc-theme-oldrpg .rpgc-spark{border-radius:0;box-shadow:none}
.rpgc-theme-oldrpg.rpgc-has-image{--rpgc-image-tint:rgba(10,16,80,.35)}
`
