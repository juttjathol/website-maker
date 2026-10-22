/**
 * THE site stylesheet.
 * Used by (1) the editor canvas and (2) every exported website (copied verbatim
 * into assets/site.css). Hand-written CSS with variables + container queries so
 * the canvas and the export are pixel-identical and exports are framework-free.
 */
export const SITE_CSS = `/* Webloom generated site stylesheet */
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0}
img,video{max-width:100%;height:auto;display:block}
button{font:inherit;cursor:pointer}
a{color:inherit}

.wk-site{
  --wk-primary:#6d5ae6;
  --wk-primary-contrast:#ffffff;
  --wk-bg:#ffffff;
  --wk-text:#161224;
  --wk-muted:#5c5675;
  --wk-surface:#f4f2fb;
  --wk-accent:#e8622c;
  --wk-radius:14px;
  --wk-font:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  --wk-shadow:0 10px 30px rgba(22,18,36,.08);
  --wk-wrap:1120px;
  container-type:inline-size;
  background:var(--wk-bg);
  color:var(--wk-text);
  font-family:var(--wk-font);
  font-size:16px;
  line-height:1.65;
  min-height:100%;
}
.wk-site.wk-font-serif{--wk-font:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif}
.wk-site.wk-font-rounded{--wk-font:ui-rounded,"Hiragino Maru Gothic ProN","Trebuchet MS",Verdana,system-ui,sans-serif}
.wk-site.wk-font-mono{--wk-font:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}

/* ---------- generic helpers ---------- */
.wk-wrap{max-width:var(--wk-wrap);margin:0 auto;padding-left:24px;padding-right:24px;width:100%}
.wk-hide-desktop,.wk-hide-tablet,.wk-hide-mobile{display:revert}
@container (max-width:980px){.wk-hide-tablet{display:none!important}}
@container (max-width:720px){.wk-hide-mobile{display:none!important}}
@container (min-width:981px){.wk-hide-desktop{display:none!important}}

.wk-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:13px 26px;border-radius:var(--wk-radius);border:1px solid transparent;
  font-weight:600;font-size:15px;line-height:1.2;text-decoration:none;
  transition:transform .15s ease,box-shadow .15s ease,background .15s ease;
  white-space:nowrap;
}
.wk-btn:hover{transform:translateY(-1px)}
.wk-btn-primary{background:var(--wk-primary);color:var(--wk-primary-contrast);box-shadow:0 8px 20px color-mix(in srgb,var(--wk-primary) 30%,transparent)}
.wk-btn-primary:hover{filter:brightness(1.07)}
.wk-btn-secondary{background:transparent;color:var(--wk-text);border-color:color-mix(in srgb,var(--wk-text) 22%,transparent)}
.wk-btn-secondary:hover{border-color:var(--wk-text)}
.wk-btn-accent{background:var(--wk-accent);color:#fff}
.wk-btn-ghost{background:transparent;color:var(--wk-primary)}
.wk-btn-sm{padding:9px 18px;font-size:14px}
.wk-btn-lg{padding:16px 32px;font-size:16.5px}

.wk-eyebrow{font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--wk-primary);margin:0 0 12px}
.wk-h1,.wk-h2,.wk-h3,.wk-h4{margin:0;line-height:1.15;letter-spacing:-.02em;font-weight:800}
.wk-h1{font-size:clamp(2.1rem,5.2cqw,3.6rem)}
.wk-h2{font-size:clamp(1.7rem,3.6cqw,2.5rem)}
.wk-h3{font-size:clamp(1.25rem,2.4cqw,1.6rem)}
.wk-h4{font-size:1.15rem}
.wk-lead{font-size:clamp(1.02rem,1.6cqw,1.25rem);color:var(--wk-muted);line-height:1.7}
.wk-muted{color:var(--wk-muted)}
.wk-center{text-align:center}

/* ---------- layout blocks ---------- */
.wk-block{position:relative}
.wk-section{width:100%}
.wk-section-inner{width:100%}
.wk-columns{display:grid;gap:28px;width:100%}
.wk-cols-1{grid-template-columns:1fr}
.wk-cols-2{grid-template-columns:1fr 1fr}
.wk-cols-3{grid-template-columns:1fr 1fr 1fr}
.wk-cols-4{grid-template-columns:repeat(4,1fr)}
@container (max-width:980px){
  .wk-cols-3,.wk-cols-4{grid-template-columns:1fr 1fr}
}
@container (max-width:720px){
  .wk-cols-2,.wk-cols-3,.wk-cols-4{grid-template-columns:1fr}
}
.wk-divider{border:0;border-top:2px solid color-mix(in srgb,var(--wk-text) 10%,transparent);width:100%;margin:0}
.wk-divider-dots{border:0;text-align:center;letter-spacing:12px;color:color-mix(in srgb,var(--wk-text) 30%,transparent);overflow:hidden}
.wk-divider-dots::before{content:"• • •"}
.wk-spacer{width:100%}

/* ---------- content blocks ---------- */
.wk-heading{margin:0}
.wk-text p{margin:0 0 1em}
.wk-text p:last-child{margin-bottom:0}
.wk-image img{border-radius:var(--wk-radius);width:100%}
.wk-image.wk-image-round img{border-radius:999px}
.wk-image figcaption{font-size:13px;color:var(--wk-muted);text-align:center;margin-top:8px}
.wk-video{position:relative;width:100%;aspect-ratio:16/9;border-radius:var(--wk-radius);overflow:hidden;background:#000}
.wk-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.wk-list{margin:0;padding:0;list-style:none;display:grid;gap:12px}
.wk-list li{display:flex;gap:12px;align-items:flex-start}
.wk-list .wk-check{flex:none;width:22px;height:22px;border-radius:999px;background:color-mix(in srgb,var(--wk-primary) 16%,transparent);color:var(--wk-primary);display:grid;place-items:center;font-size:12px;font-weight:800;margin-top:2px}
.wk-icon{display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:calc(var(--wk-radius) - 4px);background:color-mix(in srgb,var(--wk-primary) 14%,transparent);color:var(--wk-primary)}
.wk-icon svg{width:26px;height:26px}
.wk-gallery{display:grid;gap:14px;grid-template-columns:repeat(3,1fr)}
.wk-gallery img{width:100%;height:100%;object-fit:cover;border-radius:var(--wk-radius);aspect-ratio:1}
@container (max-width:720px){.wk-gallery{grid-template-columns:repeat(2,1fr)}}
.wk-social{display:flex;gap:12px;flex-wrap:wrap}
.wk-social a{width:42px;height:42px;border-radius:999px;display:grid;place-items:center;background:color-mix(in srgb,var(--wk-text) 8%,transparent);color:var(--wk-text);text-decoration:none;transition:.15s}
.wk-social a:hover{background:var(--wk-primary);color:var(--wk-primary-contrast)}
.wk-social svg{width:19px;height:19px}
.wk-map{width:100%;aspect-ratio:16/9;border-radius:var(--wk-radius);overflow:hidden;border:1px solid color-mix(in srgb,var(--wk-text) 10%,transparent)}
.wk-map iframe{width:100%;height:100%;border:0}
.wk-countdown{display:flex;gap:14px;flex-wrap:wrap}
.wk-countdown-item{min-width:82px;padding:14px 10px;border-radius:var(--wk-radius);background:var(--wk-surface);text-align:center}
.wk-countdown-item strong{display:block;font-size:1.9rem;line-height:1.1;letter-spacing:-.02em}
.wk-countdown-item span{font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:var(--wk-muted)}
.wk-embed{width:100%;border-radius:var(--wk-radius);overflow:auto}
.wk-code-frame{display:block;height:200px;border:1px solid color-mix(in srgb,var(--wk-text) 14%,transparent);background:#fff}
.wk-code-frame{display:block;height:200px;border:1px solid color-mix(in srgb,var(--wk-text) 14%,transparent);background:#fff}

/* ---------- navbar ---------- */
.wk-navbar{position:sticky;top:0;z-index:50;background:color-mix(in srgb,var(--wk-bg) 88%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid color-mix(in srgb,var(--wk-text) 8%,transparent)}
.wk-navbar-inner{display:flex;align-items:center;gap:22px;min-height:68px}
.wk-brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:18px;text-decoration:none;letter-spacing:-.01em}
.wk-brand img{width:30px;height:30px;border-radius:8px;object-fit:cover}
.wk-brand-dot{width:11px;height:11px;border-radius:999px;background:var(--wk-primary);box-shadow:0 0 0 4px color-mix(in srgb,var(--wk-primary) 22%,transparent)}
.wk-nav-links{display:flex;gap:6px;margin-left:auto;align-items:center}
.wk-nav-links a{padding:9px 13px;border-radius:9px;text-decoration:none;font-size:14.5px;font-weight:500;color:var(--wk-muted)}
.wk-nav-links a:hover{color:var(--wk-text);background:color-mix(in srgb,var(--wk-text) 6%,transparent)}
.wk-nav-toggle{display:none;margin-left:auto;background:none;border:1px solid color-mix(in srgb,var(--wk-text) 16%,transparent);border-radius:9px;padding:8px 10px}
.wk-nav-toggle svg{width:20px;height:20px;display:block}
@container (max-width:720px){
  .wk-nav-links{display:none}
  .wk-nav-links.wk-open{display:flex;flex-direction:column;position:absolute;left:12px;right:12px;top:72px;background:var(--wk-bg);border:1px solid color-mix(in srgb,var(--wk-text) 10%,transparent);border-radius:var(--wk-radius);padding:10px;box-shadow:var(--wk-shadow);margin-left:0}
  .wk-nav-links.wk-open a{padding:12px}
  .wk-nav-toggle{display:block}
  .wk-navbar-inner{flex-wrap:wrap;position:relative}
}
.wk-navbar.wk-nav-dark .wk-nav-links a{color:rgba(255,255,255,.82)}
.wk-navbar.wk-nav-dark .wk-nav-links a:hover{color:#fff;background:rgba(255,255,255,.12)}

/* ---------- hero ---------- */
.wk-hero{position:relative;overflow:hidden}
.wk-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:52px;align-items:center}
@container (max-width:980px){.wk-hero-grid{grid-template-columns:1fr;gap:36px}}
.wk-hero-centered .wk-hero-grid{grid-template-columns:1fr;text-align:center;max-width:820px;margin:0 auto}
.wk-hero-centered .wk-hero-actions,.wk-hero-centered .wk-hero-stats{justify-content:center}
.wk-hero-actions{display:flex;gap:14px;flex-wrap:wrap;margin-top:28px}
.wk-hero-media img{width:100%;border-radius:calc(var(--wk-radius) + 8px);box-shadow:var(--wk-shadow)}
.wk-hero-blob{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.wk-hero-blob i{position:absolute;border-radius:999px;filter:blur(70px);opacity:.5}
.wk-hero-blob i:nth-child(1){width:420px;height:420px;left:-120px;top:-140px;background:color-mix(in srgb,var(--wk-primary) 55%,transparent)}
.wk-hero-blob i:nth-child(2){width:380px;height:380px;right:-110px;bottom:-160px;background:color-mix(in srgb,var(--wk-accent) 45%,transparent)}
.wk-hero-stats{display:flex;gap:34px;flex-wrap:wrap;margin-top:34px}
.wk-hero-stats div strong{display:block;font-size:1.55rem;letter-spacing:-.02em}
.wk-hero-stats div span{font-size:13px;color:var(--wk-muted)}
.wk-hero.wk-hero-dark{background:radial-gradient(1100px 520px at 20% -10%,color-mix(in srgb,var(--wk-primary) 45%,#0b0820),#0b0820 62%);color:#fff}
.wk-hero-dark .wk-lead{color:rgba(255,255,255,.78)}
.wk-hero-dark .wk-eyebrow{color:color-mix(in srgb,var(--wk-primary) 60%,#fff)}

/* ---------- features / cards ---------- */
.wk-features-grid{display:grid;gap:22px;grid-template-columns:repeat(3,1fr)}
@container (max-width:980px){.wk-features-grid{grid-template-columns:repeat(2,1fr)}}
@container (max-width:720px){.wk-features-grid{grid-template-columns:1fr}}
.wk-card{background:var(--wk-surface);border:1px solid color-mix(in srgb,var(--wk-text) 7%,transparent);border-radius:var(--wk-radius);padding:26px;height:100%;transition:transform .18s ease,box-shadow .18s ease}
.wk-card:hover{transform:translateY(-3px);box-shadow:var(--wk-shadow)}
.wk-card h3{margin:16px 0 8px;font-size:1.12rem;letter-spacing:-.01em}
.wk-card p{margin:0;color:var(--wk-muted);font-size:.955rem}
.wk-features-list{display:grid;gap:18px}
.wk-feature-row{display:flex;gap:18px;align-items:flex-start}
.wk-feature-row h3{margin:2px 0 6px}

/* ---------- about / split ---------- */
.wk-split{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
.wk-split.wk-split-reverse .wk-split-media{order:2}
@container (max-width:900px){.wk-split{grid-template-columns:1fr;gap:30px}.wk-split.wk-split-reverse .wk-split-media{order:0}}
.wk-split-media img{width:100%;border-radius:calc(var(--wk-radius) + 6px);box-shadow:var(--wk-shadow)}
.wk-checklist{list-style:none;margin:22px 0 0;padding:0;display:grid;gap:12px}
.wk-checklist li{display:flex;gap:12px;align-items:center;font-weight:500}
.wk-checklist li::before{content:"✓";flex:none;width:24px;height:24px;border-radius:999px;background:var(--wk-primary);color:#fff;font-size:12.5px;font-weight:800;display:grid;place-items:center}

/* ---------- services ---------- */
.wk-services-grid{display:grid;gap:20px;grid-template-columns:repeat(3,1fr)}
@container (max-width:980px){.wk-services-grid{grid-template-columns:repeat(2,1fr)}}
@container (max-width:720px){.wk-services-grid{grid-template-columns:1fr}}
.wk-service{padding:28px;border-radius:var(--wk-radius);border:1px solid color-mix(in srgb,var(--wk-text) 9%,transparent);background:var(--wk-bg);height:100%}
.wk-service h3{margin:14px 0 8px}
.wk-service p{margin:0 0 14px;color:var(--wk-muted)}
.wk-service a{font-weight:600;color:var(--wk-primary);text-decoration:none;font-size:.93rem}

/* ---------- testimonials ---------- */
.wk-testimonials-grid{display:grid;gap:20px;grid-template-columns:repeat(3,1fr)}
@container (max-width:980px){.wk-testimonials-grid{grid-template-columns:1fr}}
.wk-quote{background:var(--wk-bg);border:1px solid color-mix(in srgb,var(--wk-text) 8%,transparent);border-radius:var(--wk-radius);padding:28px;height:100%;display:flex;flex-direction:column;gap:18px}
.wk-quote-stars{color:#e8b931;letter-spacing:3px;font-size:15px}
.wk-quote p{margin:0;font-size:1.02rem;line-height:1.7;flex:1}
.wk-quote-person{display:flex;align-items:center;gap:12px}
.wk-quote-person img{width:46px;height:46px;border-radius:999px;object-fit:cover}
.wk-quote-person strong{display:block;font-size:.95rem}
.wk-quote-person span{font-size:.83rem;color:var(--wk-muted)}

/* ---------- pricing ---------- */
.wk-pricing-grid{display:grid;gap:22px;grid-template-columns:repeat(3,1fr);align-items:stretch}
@container (max-width:980px){.wk-pricing-grid{grid-template-columns:1fr}}
.wk-plan{background:var(--wk-bg);border:1.5px solid color-mix(in srgb,var(--wk-text) 10%,transparent);border-radius:calc(var(--wk-radius) + 4px);padding:32px;display:flex;flex-direction:column;position:relative}
.wk-plan-featured{border-color:var(--wk-primary);box-shadow:0 24px 50px color-mix(in srgb,var(--wk-primary) 22%,transparent)}
.wk-plan-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--wk-primary);color:#fff;font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:999px;white-space:nowrap}
.wk-plan h3{margin:0;font-size:1.05rem}
.wk-plan-price{font-size:2.7rem;font-weight:800;letter-spacing:-.03em;margin:14px 0 2px}
.wk-plan-price span{font-size:.95rem;font-weight:500;color:var(--wk-muted);letter-spacing:0}
.wk-plan ul{list-style:none;margin:22px 0 28px;padding:0;display:grid;gap:11px;flex:1}
.wk-plan ul li{display:flex;gap:10px;align-items:center;font-size:.95rem;color:var(--wk-muted)}
.wk-plan ul li::before{content:"✓";color:var(--wk-primary);font-weight:800}
.wk-plan .wk-btn{width:100%}

/* ---------- faq ---------- */
.wk-faq{display:grid;gap:12px;max-width:820px}
.wk-faq-item{border:1px solid color-mix(in srgb,var(--wk-text) 10%,transparent);border-radius:calc(var(--wk-radius) - 2px);background:var(--wk-bg);overflow:hidden}
.wk-faq-item summary{cursor:pointer;list-style:none;display:flex;gap:14px;align-items:center;justify-content:space-between;padding:19px 22px;font-weight:650;font-size:1.01rem}
.wk-faq-item summary::-webkit-details-marker{display:none}
.wk-faq-item summary::after{content:"+";font-size:1.45rem;font-weight:400;color:var(--wk-primary);transition:transform .2s}
.wk-faq-item[open] summary::after{transform:rotate(45deg)}
.wk-faq-item .wk-faq-a{padding:0 22px 20px;color:var(--wk-muted);line-height:1.7}

/* ---------- contact / forms ---------- */
.wk-form{display:grid;gap:15px;width:100%}
.wk-form label{font-size:.88rem;font-weight:600;display:grid;gap:6px}
.wk-form input,.wk-form textarea,.wk-form select{
  width:100%;padding:12px 14px;border-radius:calc(var(--wk-radius) - 4px);
  border:1.5px solid color-mix(in srgb,var(--wk-text) 14%,transparent);
  background:var(--wk-bg);color:var(--wk-text);font:inherit;font-size:.95rem;
}
.wk-form input:focus,.wk-form textarea:focus,.wk-form select:focus{outline:2px solid color-mix(in srgb,var(--wk-primary) 45%,transparent);border-color:var(--wk-primary)}
.wk-form textarea{min-height:130px;resize:vertical}
.wk-form-row{display:grid;grid-template-columns:1fr 1fr;gap:15px}
@container (max-width:720px){.wk-form-row{grid-template-columns:1fr}}
.wk-form-note{font-size:.83rem;color:var(--wk-muted)}
.wk-contact-grid{display:grid;grid-template-columns:1fr 1.1fr;gap:48px}
@container (max-width:900px){.wk-contact-grid{grid-template-columns:1fr;gap:30px}}
.wk-contact-info{display:grid;gap:18px;align-content:start}
.wk-contact-info-item{display:flex;gap:14px;align-items:flex-start}
.wk-contact-info-item strong{display:block;font-size:.95rem}
.wk-contact-info-item span{color:var(--wk-muted);font-size:.92rem}

/* ---------- cta ---------- */
.wk-cta{border-radius:calc(var(--wk-radius) + 8px);padding:56px 40px;background:linear-gradient(120deg,var(--wk-primary),color-mix(in srgb,var(--wk-primary) 55%,var(--wk-accent)));color:#fff;text-align:center}
.wk-cta h2{color:#fff}
.wk-cta p{color:rgba(255,255,255,.85);max-width:560px;margin:14px auto 26px}
.wk-cta .wk-btn-white{background:#fff;color:var(--wk-primary)}
.wk-cta .wk-btn-ghostw{background:transparent;color:#fff;border-color:rgba(255,255,255,.5)}

/* ---------- footer ---------- */
.wk-footer{background:#12101d;color:#cfc9e2;padding:64px 0 28px;margin-top:auto}
.wk-footer h4{color:#fff;font-size:.95rem;letter-spacing:.04em;text-transform:uppercase;margin:0 0 16px}
.wk-footer-grid{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:36px}
@container (max-width:980px){.wk-footer-grid{grid-template-columns:1fr 1fr}}
@container (max-width:720px){.wk-footer-grid{grid-template-columns:1fr}}
.wk-footer a{color:#a49bc4;text-decoration:none;display:block;padding:5px 0;font-size:.93rem}
.wk-footer a:hover{color:#fff}
.wk-footer-bottom{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,.12);margin-top:44px;padding-top:22px;font-size:.86rem;color:#8d85ab}

/* ---------- team / newsletter / blog / popup ---------- */
.wk-team-grid{display:grid;gap:22px;grid-template-columns:repeat(4,1fr)}
@container (max-width:980px){.wk-team-grid{grid-template-columns:repeat(2,1fr)}}
@container (max-width:560px){.wk-team-grid{grid-template-columns:1fr}}
.wk-member img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:var(--wk-radius)}
.wk-member h3{margin:14px 0 2px;font-size:1.05rem}
.wk-member span{color:var(--wk-muted);font-size:.9rem}
.wk-newsletter{display:flex;gap:12px;flex-wrap:wrap;max-width:520px}
.wk-newsletter input{flex:1;min-width:220px;padding:13px 16px;border-radius:var(--wk-radius);border:1.5px solid color-mix(in srgb,var(--wk-text) 14%,transparent);background:var(--wk-bg);font:inherit}
.wk-blog-grid{display:grid;gap:22px;grid-template-columns:repeat(3,1fr)}
@container (max-width:980px){.wk-blog-grid{grid-template-columns:1fr 1fr}}
@container (max-width:720px){.wk-blog-grid{grid-template-columns:1fr}}
.wk-post{border-radius:var(--wk-radius);overflow:hidden;background:var(--wk-surface);height:100%;display:flex;flex-direction:column;border:1px solid color-mix(in srgb,var(--wk-text) 7%,transparent)}
.wk-post img{width:100%;aspect-ratio:16/10;object-fit:cover}
.wk-post-body{padding:20px;display:flex;flex-direction:column;gap:8px;flex:1}
.wk-post-body h3{margin:0;font-size:1.08rem;line-height:1.35}
.wk-post-body p{margin:0;color:var(--wk-muted);font-size:.93rem;flex:1}
.wk-post-body a{color:var(--wk-primary);font-weight:600;text-decoration:none;font-size:.92rem}
.wk-popup{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:rgba(12,10,24,.55);padding:20px}
.wk-popup-card{background:var(--wk-bg);color:var(--wk-text);border-radius:calc(var(--wk-radius) + 6px);padding:40px;max-width:460px;width:100%;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,.35);position:relative}
.wk-popup-card h3{margin:0 0 10px;font-size:1.5rem}
.wk-popup-card p{color:var(--wk-muted);margin:0 0 22px}
.wk-popup-close{position:absolute;top:12px;right:14px;background:none;border:0;font-size:1.4rem;color:var(--wk-muted);line-height:1}
.wk-popup-preview-badge{position:absolute;top:-12px;left:16px;background:var(--wk-accent);color:#fff;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:4px 12px;border-radius:999px}

/* ---------- buttons row / misc ---------- */
.wk-buttons{display:flex;gap:12px;flex-wrap:wrap}
.wk-badge{display:inline-flex;align-items:center;gap:8px;padding:7px 15px;border-radius:999px;background:color-mix(in srgb,var(--wk-primary) 12%,transparent);color:var(--wk-primary);font-size:13px;font-weight:650}
.wk-anim-fade{animation:wkfade .6s ease both}
@keyframes wkfade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}

/* ---------- free-plan watermark ---------- */
.wk-watermark{position:fixed;right:14px;bottom:14px;z-index:9999;display:inline-flex;align-items:center;gap:7px;padding:7px 13px;border-radius:999px;background:rgba(20,16,38,.85);color:#fff;font-size:11px;font-weight:700;letter-spacing:.04em;box-shadow:0 6px 18px rgba(20,16,38,.28);backdrop-filter:blur(6px);pointer-events:none;line-height:1}
.wk-watermark-dot{width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#8d7bf1,#6d5ae6);flex:none}
.wk-watermark-text b{font-weight:800}

/* ---------- editor-only chrome never exported ---------- */
.wk-empty-drop{border:2px dashed color-mix(in srgb,var(--wk-primary) 45%,transparent);border-radius:var(--wk-radius);padding:46px 20px;text-align:center;color:var(--wk-muted);background:color-mix(in srgb,var(--wk-primary) 5%,transparent)}

/* Lightweight 3D scene: six real CSS planes; no external runtime or model assets. */
.wk-scene{position:relative;max-width:1120px;margin:0 auto;border-radius:var(--wk-radius);overflow:hidden;box-shadow:0 24px 60px rgba(16,11,36,.28)}
.wk-scene-content{color:#fff;position:relative;isolation:isolate;background-image:radial-gradient(circle at 50% 35%,rgba(139,92,246,.28),transparent 68%)}
.wk-scene-copy{padding:32px 28px 0;position:relative;z-index:2;pointer-events:none}
.wk-scene-copy h2{color:inherit;margin:0 0 8px;font-size:clamp(24px,4vw,42px);line-height:1.15}
.wk-scene-copy p{color:inherit;opacity:.78;margin:0}
.wk-scene-stage{position:relative;overflow:hidden;isolation:isolate}
.wk-scene-stage::before{content:"";position:absolute;inset:35% -15% -25%;background-image:linear-gradient(to right,rgba(167,139,250,.18) 1px,transparent 1px),linear-gradient(to bottom,rgba(167,139,250,.18) 1px,transparent 1px);background-size:36px 36px;transform:perspective(520px) rotateX(64deg);transform-origin:center top;pointer-events:none;opacity:.75}
.wk-3d-object{transform-style:preserve-3d;position:absolute;transform:translate(-50%,-50%);outline:none}
.wk-3d-object[role=button]{cursor:grab;touch-action:none;user-select:none}
.wk-3d-object[role=button]:active{cursor:grabbing}
.wk-3d-object[role=button]:focus-visible{outline:2px dashed #fff;outline-offset:20px}
.wk-3d-solid,.wk-3d-still,.wk-3d-float{width:100%;height:100%;transform-style:preserve-3d}
.wk-3d-solid{transform:translateZ(var(--obj-distance)) rotateX(var(--obj-x)) rotateY(var(--obj-y)) rotateZ(var(--obj-z))}
.wk-3d-face{position:absolute;display:block;background:var(--obj-color);border:1px solid rgba(255,255,255,.32);box-shadow:inset 0 0 18px rgba(255,255,255,.16);backface-visibility:hidden}
.wk-3d-front,.wk-3d-back{width:100%;height:100%}
.wk-3d-front{transform:translateZ(var(--obj-half));filter:brightness(1.14)}
.wk-3d-back{transform:rotateY(180deg) translateZ(var(--obj-half));filter:brightness(.65)}
.wk-3d-right,.wk-3d-left{width:var(--obj-depth);height:100%;left:calc((var(--obj-size) - var(--obj-depth))/2)}
.wk-3d-right{transform:rotateY(90deg) translateZ(calc(var(--obj-size)/2));filter:brightness(.72)}
.wk-3d-left{transform:rotateY(-90deg) translateZ(calc(var(--obj-size)/2));filter:brightness(.88)}
.wk-3d-top,.wk-3d-bottom{width:100%;height:var(--obj-depth);top:calc((var(--obj-size) - var(--obj-depth))/2)}
.wk-3d-top{transform:rotateX(90deg) translateZ(calc(var(--obj-size)/2));filter:brightness(1.32)}
.wk-3d-bottom{transform:rotateX(-90deg) translateZ(calc(var(--obj-size)/2));filter:brightness(.55)}
.wk-3d-float{animation:wk-3d-float 7s ease-in-out infinite}
@keyframes wk-3d-float{0%,100%{transform:translateY(-12px) rotateX(6deg) rotateY(-18deg)}50%{transform:translateY(12px) rotateX(-6deg) rotateY(18deg)}}
.wk-scene-hint{margin:0;padding:0 20px 18px;text-align:center;font-size:12px;color:#ddd6fe}
.wk-scene-empty{position:absolute;inset:40% 20px auto;text-align:center;color:#ddd6fe}
.wk-scene-locked{display:none;padding:32px;background:var(--wk-surface);color:var(--wk-text);border:1px dashed var(--wk-muted);border-radius:var(--wk-radius)}
.wk-site[data-plan=free] .wk-scene-content{display:none}
.wk-site[data-plan=free] .wk-scene-locked{display:block}

/* Mobile organization & responsive polish for generated sites */
@container (max-width:720px){
  .wk-wrap{padding-left:18px;padding-right:18px}
  .wk-cta{padding:36px 22px}
  .wk-plan{padding:24px 20px}
  .wk-quote,.wk-card,.wk-service{padding:22px 18px}
  .wk-hero-actions .wk-btn,.wk-buttons .wk-btn{width:100%;justify-content:center}
  .wk-hero-stats{gap:20px}
  .wk-scene-copy{padding:22px 18px 0}
  .wk-3d-object{transform:translate(-50%,-50%) scale(.76)}
}
@media(prefers-reduced-motion:reduce){.wk-3d-float{animation:none}}
`;
