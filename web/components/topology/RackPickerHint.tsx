'use client';
import { readLastRack } from '@/lib/lastRack';
import { useEffect, useState } from 'react';

export default function RackPickerHint() {
  const [id, setId] = useState('');
  useEffect(() => setId(readLastRack()), []);
  if (!id) return null;
  return <p className="text-[12px] text-[#706E6B]">Dernier rack : <span className="font-mono">{id}</span></p>;
}
