"use client";
import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Download, ExternalLink, Globe, Rocket, ShoppingBag, X } from "lucide-react";
import type { Project } from "@/lib/schema";

const QUICK_STEPS = [
  { title: "Download", sub: "Get your website files" },
  { title: "Unzip", sub: "Open the downloaded folder" },
  { title: "Put it online", sub: "Free hosting in seconds" },
];

export function PublishWizard({
  project,
  onClose,
  onExport,
  onShopifyExport,
}: {
  project: Project;
  onClose: () => void;
  onExport: () => Promise<boolean>;
  onShopifyExport: () => Promise<boolean>;
}) {
  const [step, setStep] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [isShopifyExporting, setIsShopifyExporting] = useState(false);
  const [shopifyExportDone, setShopifyExportDone] = useState(false);
  const [shopifyError, setShopifyError] = useState("");

  const downloadShopify = async () => {
    setIsShopifyExporting(true);
    setShopifyError("");
    try {
      if (await onShopifyExport()) setShopifyExportDone(true);
      else setShopifyError("Could not create the Shopify theme ZIP. Please try again.");
    } catch {
      setShopifyError("Could not create the Shopify theme ZIP. Please try again.");
    } finally {
      setIsShopifyExporting(false);
    }
  };

  const download = async () => {
    setIsExporting(true);
    setDownloadError("");
    try {
      const succeeded = await onExport();
      if (succeeded) setStep(1);
      else setDownloadError("The download could not be created. Please try again.");
    } catch {
      setDownloadError("The download could not be created. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="publish-modal" role="dialog" aria-modal="true" aria-labelledby="publish-title">
        <header className="publish-head">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-white/15"><Rocket size={20} /></div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[.14em] text-white/65">Webloom publish guide</div>
              <h2 id="publish-title" className="truncate text-lg font-extrabold">Let’s get your website online</h2>
            </div>
          </div>
          <button className="publish-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>

        <div className="publish-progress">
          {QUICK_STEPS.map((s, i) => (
            <button key={s.title} className={`publish-progress-step ${step === i ? "active" : step > i ? "done" : ""}`} onClick={() => setStep(i)}>
              <span className="publish-progress-num">{step > i ? <Check size={13} /> : i + 1}</span>
              <span><strong>{s.title}</strong><small>{s.sub}</small></span>
            </button>
          ))}
        </div>

        <div className="publish-body">
          {step === 0 ? (
            <div className="publish-step-content">
              <div className="publish-illustration"><Download size={34} /></div>
              <p className="publish-kicker">STEP 1 OF 3</p>
              <h3>First, download your finished website</h3>
              <p className="publish-copy">We’ll package <strong>{project.name || "your website"}</strong> into a ZIP file. It contains your pages, design, images and a simple guide — everything you need, no hidden pieces.</p>
              <div className="publish-file-row">
                <span className="publish-file-icon">ZIP</span>
                <span className="min-w-0 flex-1"><strong className="block truncate">{project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "my-website"}.zip</strong><small>Your complete website, ready to upload</small></span>
                <Check size={17} className="text-emerald-500" />
              </div>
              <button className="btn-app primary !w-full !justify-center !py-3" onClick={download} disabled={isExporting}>
                <Download size={16} /> {isExporting ? "Preparing your website…" : "Download my website"}
              </button>
              {downloadError ? <p role="alert" className="text-center text-xs font-semibold text-red-600">{downloadError}</p> : null}
              <p className="publish-footnote">Your ZIP is created on your device. Your website stays yours.</p>

              <div className="rounded-2xl border border-[#e3def4] bg-[#faf9ff] p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-[#efedfc] text-[#6d5ae6]"><ShoppingBag size={17} /></span>
                  <div>
                    <strong className="block text-sm text-[#29233d]">Building a Shopify store?</strong>
                    <p className="mt-1 text-xs leading-relaxed text-[#716b86]">Create a Shopify theme ZIP with store, product, collection, cart and checkout flows. Upload it in Shopify Admin → Online Store → Themes → Add theme → Upload zip.</p>
                  </div>
                </div>
                <button className="btn-app ghost !mt-3 !w-full !justify-center" onClick={() => void downloadShopify()} disabled={isShopifyExporting}>
                  <ShoppingBag size={14} /> {isShopifyExporting ? "Building Shopify theme…" : shopifyExportDone ? "Download another Shopify theme" : "Download Shopify theme ZIP"}
                </button>
                {shopifyExportDone ? <p className="mt-2 text-center text-xs font-semibold text-emerald-700">Theme ZIP ready. Preview it in your Shopify store before publishing.</p> : null}
                {shopifyError ? <p role="alert" className="mt-2 text-center text-xs font-semibold text-red-600">{shopifyError}</p> : null}
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="publish-step-content">
              <div className="publish-illustration sky"><span className="text-3xl">📂</span></div>
              <p className="publish-kicker">STEP 2 OF 3</p>
              <h3>Open the ZIP file you just downloaded</h3>
              <p className="publish-copy">A ZIP is a bundle. Your computer has a built-in way to open it — there is no special software to install.</p>
              <div className="publish-platform-grid">
                <div><strong>On Windows</strong><span>Right-click the ZIP → <b>Extract All…</b> → click <b>Extract</b>.</span></div>
                <div><strong>On Mac</strong><span>Double-click the ZIP. A folder appears beside it.</span></div>
                <div><strong>On a phone</strong><span>Tap the ZIP in your Downloads. Your Files app can open it.</span></div>
              </div>
              <div className="publish-tip"><strong>Which folder do I upload?</strong><br />Open the new folder and look for <code>index.html</code>. Upload that folder — not the ZIP file itself.</div>
              <div className="publish-actions">
                <button className="btn-app ghost" onClick={() => setStep(0)}><ArrowLeft size={14} /> Back</button>
                <button className="btn-app primary" onClick={() => setStep(2)}>I have the folder <ArrowRight size={14} /></button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="publish-step-content">
              <div className="publish-illustration green"><Globe size={34} /></div>
              <p className="publish-kicker">STEP 3 OF 3 · THE FUN PART</p>
              <h3>Put your site online — for free</h3>
              <p className="publish-copy">We recommend Netlify Drop. It does not require you to create an account to try it. Just open the page and drop your website folder.</p>
              <a className="netlify-launch" href="https://app.netlify.com/drop" target="_blank" rel="noreferrer">
                <span className="netlify-icon">N</span>
                <span className="flex-1"><strong>Open Netlify Drop</strong><small>Drag your extracted folder onto the page</small></span>
                <ExternalLink size={16} />
              </a>
              <ol className="publish-numbered">
                <li><b>Open Netlify Drop</b> using the purple button above.</li>
                <li><b>Drag the folder</b> (the one with <code>index.html</code>) into the upload area.</li>
                <li><b>Wait a few seconds.</b> Netlify gives you a link — your website is live!</li>
              </ol>
              <div className="publish-tip green-tip"><strong>Want your own web address?</strong><br />You can connect a domain (like <code>yourname.com</code>) later from Netlify’s site settings. It’s optional — your free link works right away.</div>
              <div className="publish-other">
                <span>Prefer another host?</span>
                <a href="https://pages.github.com/" target="_blank" rel="noreferrer">GitHub Pages <ExternalLink size={11} /></a>
                <a href="https://pages.cloudflare.com/" target="_blank" rel="noreferrer">Cloudflare Pages <ExternalLink size={11} /></a>
                <a href="https://vercel.com/" target="_blank" rel="noreferrer">Vercel <ExternalLink size={11} /></a>
              </div>
              <div className="publish-actions">
                <button className="btn-app ghost" onClick={() => setStep(1)}><ArrowLeft size={14} /> Back</button>
                <button className="btn-app primary" onClick={onClose}>Done <Check size={14} /></button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
