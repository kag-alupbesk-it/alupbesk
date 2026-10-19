"use client";

import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { customStyles as styles } from "../../style/style";
import type { GudangCategory } from "@/backend/modules/gudangInventory";

interface Props {
  categories: GudangCategory[];
  onComplete: () => void;
}

export default function QuickReceiveForm({ categories, onComplete }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    itemName: "",
    categoryId: categories[0]?.id || "",
    brand: "",
    modelNo: "",
    unit: "pcs",
    lots: [{ length: null, width: null, quantity: 1, rackGroup: "", subRow: "", lotCode: "" }]
  });

  const addLot = () => {
    setForm({ ...form, lots: [...form.lots, { length: null, width: null, quantity: 1, rackGroup: "", subRow: "", lotCode: "" }] });
  };

  const removeLot = (index: number) => {
    setForm({ ...form, lots: form.lots.filter((_, i) => i !== index) });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gudang/inventory/quick-receive", {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        alert("Barang diterima!");
        onComplete();
      } else {
        const error = await res.json();
        alert(`Gagal menerima barang: ${error.error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <select className={styles.field} value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input className={styles.field} placeholder="Nama Barang" value={form.itemName} onChange={e => setForm({...form, itemName: e.target.value})} />
        <input className={styles.field} placeholder="Merek" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
        <input className={styles.field} placeholder="No. Model" value={form.modelNo} onChange={e => setForm({...form, modelNo: e.target.value})} />
      </div>
      
      <div className="space-y-2">
        <label className="font-bold text-sm">Lot Bahan</label>
        {form.lots.map((lot, index) => (
          <div key={index} className="grid grid-cols-5 gap-2 items-center border p-2 rounded">
            <input className={styles.field} type="number" placeholder="Panjang (mm)" onChange={e => {
              const newLots = [...form.lots];
              newLots[index].length = Number(e.target.value);
              setForm({...form, lots: newLots});
            }} />
            <input className={styles.field} type="number" placeholder="Qty" value={lot.quantity} onChange={e => {
              const newLots = [...form.lots];
              newLots[index].quantity = Number(e.target.value);
              setForm({...form, lots: newLots});
            }} />
            <input className={styles.field} placeholder="Rak" onChange={e => {
              const newLots = [...form.lots];
              newLots[index].rackGroup = e.target.value;
              setForm({...form, lots: newLots});
            }} />
            <input className={styles.field} placeholder="Kode Lot" onChange={e => {
              const newLots = [...form.lots];
              newLots[index].lotCode = e.target.value;
              setForm({...form, lots: newLots});
            }} />
            <button onClick={() => removeLot(index)} className="text-red-500"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
      
      <button onClick={addLot} className="text-secondary text-sm flex items-center gap-1"><Plus size={16}/> Tambah Lot</button>
      <button onClick={handleSubmit} disabled={loading} className="w-full bg-secondary text-white p-2 rounded-lg font-bold flex items-center justify-center gap-2">
        <Save size={16}/> {loading ? "Memproses..." : "Simpan Penerimaan"}
      </button>
    </div>
  );
}
