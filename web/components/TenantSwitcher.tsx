'use client';
import { useEffect, useState } from 'react';

type Tenant = { slug: string; name: string; siteId?: string };

export default function TenantSwitcher() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [active, setActive] = useState('');

  useEffect(() => {
    fetch('/api/tenants').then((r) => r.json()).then((d) => {
      if (!d.authenticated) return;
      setTenants(d.tenants || []);
      setActive(d.active || d.tenants?.[0]?.slug || '');
    }).catch(() => {});
  }, []);

  if (!tenants.length) return null;

  async function onChange(slug: string) {
    setActive(slug);
    await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug })
    });
    window.location.reload();
  }

  return (
    <label className="text-[12px] flex items-center gap-2">
      <span className="text-slate-500">Tenant</span>
      <select value={active} onChange={(e) => onChange(e.target.value)} className="border rounded px-2 py-1 text-[12px]">
        {tenants.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
      </select>
    </label>
  );
}
