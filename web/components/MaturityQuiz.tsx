'use client';

import { useMemo, useState } from 'react';
import {
  AXES,
  QUESTIONS,
  Answers,
  scoreAxes,
  globalScore,
  levelLabel,
  formatContactBody
} from '@/lib/maturity';

export default function MaturityQuiz({ locale }: { locale: string }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [form, setForm] = useState({ name: '', email: '', company: '', site: '', message: '' });
  const [sent, setSent] = useState<'idle' | 'ok' | 'err'>('idle');

  const total = QUESTIONS.length;
  const done = step >= total;
  const q = QUESTIONS[step];
  const axes = useMemo(() => scoreAxes(answers), [answers]);
  const global = useMemo(() => globalScore(axes), [axes]);

  function pick(score: 0 | 1 | 2 | 3) {
    if (!q) return;
    setAnswers((a) => ({ ...a, [q.id]: score }));
    setStep((s) => s + 1);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = formatContactBody({
      ...form,
      global,
      axes: axes.map((a) => ({ title: a.title, pct: a.pct, module: a.module }))
    });
    try {
      const res = await fetch('/api/maturite/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, global, axes, body })
      });
      if (!res.ok) throw new Error('fail');
      setSent('ok');
    } catch {
      const mailto = `mailto:contact@qinode.eu?subject=${encodeURIComponent('Diagnostic Qinode ' + global + '/100')}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
      setSent('ok');
    }
  }

  if (!done) {
    return (
      <div className="max-w-[720px] mx-auto">
        <div className="text-[12px] font-semibold text-[#0176D3] mb-2">
          Question {step + 1} / {total}
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full mb-6">
          <div className="h-1.5 bg-[#0176D3] rounded-full" style={{ width: `${(step / total) * 100}%` }} />
        </div>
        <h2 className="text-[24px] md:text-[28px] font-extrabold leading-tight">{q.title}</h2>
        {q.help && <p className="mt-3 text-[14px] text-slate-500">{q.help}</p>}
        <div className="mt-6 space-y-3">
          {q.choices.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => pick(c.score)}
              className="w-full text-left border rounded-xl px-4 py-3 hover:border-[#0176D3] hover:bg-[#E6F2FE] transition"
            >
              {c.label}
            </button>
          ))}
        </div>
        {step > 0 && (
          <button type="button" className="mt-6 text-[13px] text-slate-500" onClick={() => setStep((s) => s - 1)}>
            ← Question précédente
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto space-y-10">
      <div className="rounded-2xl border bg-white p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
        <div className="w-28 h-28 rounded-full border-8 border-[#0176D3] grid place-items-center shrink-0">
          <div className="text-center">
            <div className="text-[28px] font-black leading-none">{global}</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400">/ 100</div>
          </div>
        </div>
        <div>
          <div className="text-[12px] font-bold uppercase tracking-widest text-[#0176D3]">{levelLabel(global)}</div>
          <h2 className="text-[26px] font-extrabold mt-1">Votre salle, en huit points</h2>
          <p className="mt-2 text-slate-600 text-[15px]">
            Chaque barre pointe vers l’écran Qinode qui comble le trou. Le dossier européen compte autant que le courant.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {axes.map((a) => (
          <a key={a.id} href={`/${locale}${a.path}`} className="block border rounded-2xl p-4 bg-white hover:border-[#0176D3]">
            <div className="flex justify-between text-[13px] font-semibold">
              <span>{a.title}</span>
              <span>{a.pct}/100</span>
            </div>
            <div className="mt-2 h-2 bg-slate-100 rounded-full">
              <div className={`h-2 rounded-full ${a.pct < 40 ? 'bg-orange-400' : a.pct < 70 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${a.pct}%` }} />
            </div>
            <div className="mt-2 text-[12px] text-[#0176D3]">Écran conseillé : {a.module} →</div>
          </a>
        ))}
      </div>

      <form onSubmit={submit} className="border rounded-2xl p-6 md:p-8 bg-white space-y-4">
        <h3 className="text-[22px] font-extrabold">Envoyer ce diagnostic</h3>
        <p className="text-[14px] text-slate-600">
          Les huit scores partent avec votre message. On vous rappelle pour prioriser — pas pour un tampon automatique.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <input required placeholder="Nom" className="border rounded-lg px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required type="email" placeholder="E-mail" className="border rounded-lg px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Organisation" className="border rounded-lg px-3 py-2" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <input placeholder="Site / salle" className="border rounded-lg px-3 py-2" value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} />
        </div>
        <textarea placeholder="Précision (facultatif)" className="border rounded-lg px-3 py-2 w-full min-h-[90px]" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        <button type="submit" className="bg-[#0176D3] text-white px-6 py-3 rounded-full font-semibold">
          Envoyer les résultats
        </button>
        {sent === 'ok' && <p className="text-[13px] text-emerald-700">Message prêt. Si votre messagerie ne s’ouvre pas, écrivez à contact@qinode.eu.</p>}
      </form>

      <button type="button" className="text-[13px] text-slate-500" onClick={() => { setStep(0); setAnswers({}); setSent('idle'); }}>
        Recommencer le diagnostic
      </button>
    </div>
  );
}
