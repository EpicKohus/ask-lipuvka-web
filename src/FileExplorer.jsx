import React from 'react';
import { Link } from 'react-router-dom';

const RELEASES = 'https://github.com/EpicKohus/File-Explorer/releases';
const REPO = 'https://github.com/EpicKohus/File-Explorer';
const KOFI = 'https://ko-fi.com/pruzkumnik';
const SOL = 'C5LH6LDigi2DvhmqskCZ4fvp37panR6FPYVAbswwg4pc';

const features = [
  { icon: '📁', title: 'File management', text: 'Browse and organize files on your Android device.' },
  { icon: '🖼️', title: 'Gallery', text: 'Explore images in a convenient gallery view.' },
  { icon: '📷', title: 'Scanner', text: 'Access document scanning tools from one place.' },
  { icon: '🌙', title: 'Dark interface', text: 'A clean, modern interface designed for comfortable browsing.' },
];

export default function FileExplorer({ privacy = false, terms = false }) {
  return (
    <div className="min-h-screen bg-[#080c18] text-slate-100" style={{fontFamily:'Inter,system-ui,sans-serif'}}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(115,74,234,.25),transparent_65%)]" />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Link to="/fileexplorer" className="flex items-center gap-3 font-bold tracking-tight text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#9945ff] to-[#14f195] text-xl">📂</span>
          <span>File Explorer</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-300">
          <Link to="/fileexplorer" className="hover:text-white">Home</Link>
          <Link to="/fileexplorer/privacy" className="hover:text-white">Privacy</Link>
          <Link to="/fileexplorer/terms" className="hover:text-white">Terms</Link>
          <a href={REPO} target="_blank" rel="noopener noreferrer" className="hidden hover:text-white sm:inline">GitHub</a>
        </nav>
      </header>

      {terms ? (
        <main className="relative z-10 mx-auto max-w-3xl px-5 pb-24 pt-14">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[.2em] text-[#14f195]">File Explorer</p>
          <h1 className="mb-6 text-4xl font-extrabold text-white md:text-5xl">Terms of Use</h1>
          <p className="mb-8 text-slate-300">Last updated: November 17, 2026</p>
          <div className="space-y-7 leading-7 text-slate-300">
            <section><h2 className="mb-2 text-xl font-bold text-white">1. About the app</h2><p>File Explorer is an Android application for browsing and managing files on your device. By installing or using the app, you agree to these Terms of Use. If you do not agree, please do not use the app.</p></section>
            <section><h2 className="mb-2 text-xl font-bold text-white">2. Use of the app</h2><p>You may use the app for lawful personal or business purposes. You are responsible for the files you access, modify, move, share, compress, extract, or delete, and for complying with applicable laws and the rights of others.</p></section>
            <section><h2 className="mb-2 text-xl font-bold text-white">3. Files and backups</h2><p>File operations may change or permanently delete data. Review your selections carefully and keep independent backups of important files before performing potentially destructive operations.</p></section>
            <section><h2 className="mb-2 text-xl font-bold text-white">4. Availability and changes</h2><p>The app is provided as available. Features may change, be updated, or be discontinued. We do not guarantee uninterrupted or error-free operation.</p></section>
            <section><h2 className="mb-2 text-xl font-bold text-white">5. No warranties</h2><p>To the extent permitted by applicable law, the app is provided without warranties of any kind. Nothing in these terms limits rights or remedies that cannot legally be excluded.</p></section>
            <section><h2 className="mb-2 text-xl font-bold text-white">6. Responsibility</h2><p>To the extent permitted by applicable law, the developer is not responsible for loss of files, data, or other damage arising from use of the app. This does not exclude liability where exclusion is prohibited by law.</p></section>
            <section><h2 className="mb-2 text-xl font-bold text-white">7. Privacy</h2><p>For information about file access and privacy, read our <Link to="/fileexplorer/privacy" className="text-[#14f195] underline">Privacy Policy</Link>.</p></section>
            <section><h2 className="mb-2 text-xl font-bold text-white">8. Contact</h2><p>For questions about these terms, contact the developer through the project's <a href={`${REPO}/issues`} className="text-[#14f195] underline" target="_blank" rel="noopener noreferrer">GitHub Issues</a> page.</p></section>
          </div>
        </main>
      ) : privacy ? (
        <main className="relative z-10 mx-auto max-w-3xl px-5 pb-24 pt-14">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[.2em] text-[#14f195]">FileExplorer Community</p>
          <h1 className="mb-6 text-4xl font-extrabold text-white md:text-5xl">Privacy Policy</h1>
          <p className="mb-8 text-slate-300">Last updated: November 17, 2026</p>
          <div className="space-y-7 leading-7 text-slate-300">
            <p>FileExplorer Community is an Android file-management application. It requires access to files and media on your device to provide its core features.</p>
            <section><h2 className="mb-2 text-xl font-bold text-white">File and media access</h2><p>FileExplorer requests access to files or media that you choose to manage. This access is intended to support browsing, opening, organizing, and other user-initiated file operations. Your files are not made public by using this website.</p></section>
            <section><h2 className="mb-2 text-xl font-bold text-white">External services</h2><p>This website links to GitHub for application downloads and to Ko-fi for voluntary support. Those services have their own privacy policies.</p></section>
            <section><h2 className="mb-2 text-xl font-bold text-white">Contact and questions</h2><p>For privacy questions, please use the project's <a className="text-[#14f195] underline" href={`${REPO}/issues`} target="_blank" rel="noopener noreferrer">GitHub Issues</a> page.</p></section>
            <p className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-amber-100"><strong>Publisher note:</strong> Before submitting to an app store, verify this policy against the actual app code, including analytics, network requests, permissions, and any data sharing. Update it if necessary.</p>
          </div>
        </main>
      ) : (
        <main className="relative z-10">
          <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 md:pt-24">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-[#14f195]/30 bg-[#14f195]/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#14f195]">Android file manager</span>
              <h1 className="mt-7 text-5xl font-black leading-[1.06] tracking-tight text-white md:text-7xl">Your files.<br/><span className="bg-gradient-to-r from-[#9945ff] via-[#b5a0ff] to-[#14f195] bg-clip-text text-transparent">Your control.</span></h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">Meet FileExplorer Community — an Android file manager with a modern interface, gallery, and scanning tools.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href={RELEASES} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#14f195] px-7 py-4 font-bold text-[#08120f] shadow-lg shadow-emerald-400/10 transition hover:bg-[#6af8bb]">Download APK ↗</a>
                <a href={REPO} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/20 bg-white/5 px-7 py-4 font-bold text-white transition hover:bg-white/10">View on GitHub ↗</a>
              </div>
              <p className="mt-4 text-sm text-slate-400">Android · Download the latest available release from GitHub</p>
            </div>
          </section>
          <section className="border-y border-white/10 bg-white/[.025] py-20">
            <div className="mx-auto max-w-6xl px-5">
              <p className="text-sm font-bold uppercase tracking-widest text-[#14f195]">Features</p>
              <h2 className="mt-3 mb-10 text-3xl font-bold text-white md:text-4xl">Everything in one place</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {features.map(f => <div key={f.title} className="rounded-2xl border border-white/10 bg-[#12182a] p-6"><div className="mb-5 text-3xl">{f.icon}</div><h3 className="mb-2 text-lg font-bold text-white">{f.title}</h3><p className="leading-6 text-slate-400">{f.text}</p></div>)}
              </div>
            </div>
          </section>
          <section className="mx-auto grid max-w-6xl gap-8 px-5 py-20 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-[#12182a] p-8"><h2 className="text-2xl font-bold text-white">Support development</h2><p className="mt-3 leading-7 text-slate-300">FileExplorer Community is an independent project. If you enjoy using it, you can support future development.</p><a href={KOFI} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block rounded-xl bg-white px-5 py-3 font-bold text-[#111827]">Support on Ko-fi ↗</a></div>
            <div className="rounded-3xl border border-white/10 bg-[#12182a] p-8"><h2 className="text-2xl font-bold text-white">Support with SOL</h2><p className="mt-3 text-slate-300">Solana wallet address</p><p className="mt-4 break-all rounded-xl bg-black/30 p-4 font-mono text-sm text-[#14f195]">{SOL}</p><button type="button" onClick={() => navigator.clipboard?.writeText(SOL)} className="mt-4 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">Copy address</button></div>
          </section>
        </main>
      )}
      <footer className="relative border-t border-white/10 px-5 py-8 text-center text-sm text-slate-400">© 2026 File Explorer · <Link to="/fileexplorer/privacy" className="text-slate-200 underline">Privacy Policy</Link> · <Link to="/fileexplorer/terms" className="text-slate-200 underline">Terms of Use</Link> · <a href={REPO} className="text-slate-200 underline" target="_blank" rel="noopener noreferrer">GitHub</a></footer>
    </div>
  );
}
