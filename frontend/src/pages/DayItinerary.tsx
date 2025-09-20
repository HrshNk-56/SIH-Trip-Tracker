import { useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTripState } from "@/context/TripState";
import ChatbotWidget from "@/components/ChatbotWidget";
import { Car, TrainFront as Train, Plane, Camera } from "lucide-react";

const TransportBadge = ({ mode }: { mode: string }) => {
  const map: Record<string, any> = { car: Car, train: Train, flight: Plane };
  const Icon = map[mode] || Car;
  if (!mode) return null;
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs">
      <Icon className="w-4 h-4" />
      <span className="font-medium capitalize">Preferred: {mode}</span>
    </div>
  );
};

const DayItinerary = () => {
  const { day } = useParams();
  const navigate = useNavigate();
  const { location, days, preferredTransport, addExpense } = useTripState() as any;
  const d = Math.max(1, Math.min(parseInt(day || '1'), Math.max(1, days || 1), 3));


  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [billName, setBillName] = useState("");
  const todayISO = new Date().toISOString().slice(0,10);
  const [billForm, setBillForm] = useState({ title: "Bill", amount: "", category: "Misc", date: todayISO });

  // Floating chatbot toggle
  const [chatOpen, setChatOpen] = useState(false);

  const openCamera = () => { fileInputRef.current?.click(); };
  const onPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setBillName(f.name);
      setBillForm(prev => ({ ...prev, title: `Bill - Day ${d}` }));
      setShowBillModal(true);
    }
  };
  const saveBill = () => {
    const amt = parseFloat(billForm.amount || "0");
    if (!amt) { setShowBillModal(false); return; }
    addExpense({ title: billForm.title, amount: amt, category: billForm.category, date: billForm.date });
    setShowBillModal(false);
    setBillForm({ title: "Bill", amount: "", category: "Misc", date: todayISO });
  };

  const blocks = useMemo(() => {
    if (d === 1) return [
      { label: 'Places to stay', items: [ `Check-in at homestay in ${location || 'Kochi'}`, 'Fort Kochi sunset' ] },
      { label: 'Places to visit', items: [ 'Chinese Fishing Nets', 'St. Francis Church' ] },
    ];
    if (d === 2) return [
      { label: 'Food', items: [ 'Puttu & Kadala breakfast', 'Malabar biryani dinner' ] },
      { label: 'Shopping', items: [ 'Spice market', 'Handicrafts at Jew Town' ] },
    ];
    return [
      { label: 'Tickets to leave', items: [ 'Confirm bus/train/flight', 'Checkout and head to station/airport' ] },
    ];
  }, [d, location]);

  const go = (next: number) => navigate(`/itinerary/day/${next}`);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
<button onClick={()=>navigate(-1)} className="mt-10 px-3 py-2 rounded-lg border border-border bg-card text-sm">← Back</button>
        <h2 className="text-xl font-semibold">Day {d} Itinerary</h2>
        <TransportBadge mode={preferredTransport} />
      </div>

      {/* Top pills for day navigation */}
      <div className="flex items-center justify-center gap-2">
        {[1,2,3].slice(0, Math.min(3, Math.max(1, days||1))).map((n)=> (
          <button
            key={n}
            onClick={()=>go(n)}
            className={`px-4 py-1 rounded-full text-xs border transition-colors ${d===n ? 'bg-gradient-primary text-white border-transparent' : 'bg-card border-border hover:bg-muted'}`}
          >
            {`Day ${n}`}
          </button>
        ))}
      </div>

      <div className="mobile-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium">Plan for Day {d}</div>
        </div>
        <div className="space-y-3">
          {blocks.map((b, i) => (
            <div key={i} className="p-3 bg-secondary rounded-xl border border-border">
              <div className="text-sm font-medium mb-1">{b.label}</div>
              <ul className="list-disc list-inside text-xs text-muted-foreground">
                {b.items.map((it, j) => <li key={j}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Scan bills card placed below plan module */}
      <div className="mobile-card p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Scan bills</div>
          <button onClick={openCamera} className="px-3 py-2 rounded-lg border border-border bg-card text-sm inline-flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span>Open camera</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPicked} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={()=>go(Math.max(1, d-1))} className="px-3 py-2 rounded-lg border border-border bg-card text-sm" disabled={d<=1}>← Prev</button>
        <div className="text-xs text-muted-foreground">{`Day ${d} of ${Math.min(3, Math.max(1, days||1))}`}</div>
        <button onClick={()=>go(Math.min(Math.min(3, Math.max(1, days||1)), d+1))} className="px-3 py-2 rounded-lg border border-border bg-card text-sm" disabled={d>=Math.min(3, Math.max(1, days||1))}>Next →</button>
      </div>

      {/* Bill modal */}
      {showBillModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl p-4 w-full max-w-sm">
            <div className="text-sm font-semibold mb-2">Add expense from bill</div>
            <div className="text-xs text-muted-foreground mb-3 truncate">{billName}</div>
            <div className="space-y-2 text-sm">
              <input value={billForm.title} onChange={(e)=>setBillForm({...billForm, title:e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-input text-foreground" placeholder="Title" />
              <input value={billForm.amount} onChange={(e)=>setBillForm({...billForm, amount:e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-input text-foreground" placeholder="Amount (₹)" type="number" />
              <select value={billForm.category} onChange={(e)=>setBillForm({...billForm, category:e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-input text-foreground">
                <option>Stay</option>
                <option>Food & Beverages</option>
                <option>Activities</option>
                <option>Transport</option>
                <option>Shopping</option>
                <option>Misc</option>
              </select>
              <input value={billForm.date} onChange={(e)=>setBillForm({...billForm, date:e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-input text-foreground" type="date" />
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button onClick={()=>setShowBillModal(false)} className="px-3 py-2 rounded-lg border border-border text-sm">Cancel</button>
              <button onClick={saveBill} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating chatbot with toggle button */}
      <div className="fixed bottom-4 right-4 z-40">
        {chatOpen && (
          <div className="mb-2 w-[22rem] h-[28rem] bg-background border border-border rounded-xl shadow-xl overflow-hidden">
            <ChatbotWidget theme="kerala" size="small" />
          </div>
        )}
        <button onClick={()=>setChatOpen(v=>!v)} className="rounded-full bg-primary text-primary-foreground w-12 h-12 shadow-lg">{chatOpen ? '×' : '💬'}</button>
      </div>
    </div>
  );
};

export default DayItinerary;
