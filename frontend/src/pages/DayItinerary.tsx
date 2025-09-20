import { useMemo, useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTripState } from "@/context/TripState";
import ChatbotWidget from "@/components/ChatbotWidget";
import { Car, TrainFront as Train, Plane, Camera } from "lucide-react";
import { billService } from "@/services/billService";
import { visionController } from "@/services/visionController";
import CameraOverlay from "@/components/CameraOverlay";
import LeafletMap from "@/components/LeafletMap";
import { getLeafletSuggestionsForDay, osmPlaceUrl } from "@/services/leafletPlacesService";

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
  const { location, days, preferredTransport, addExpense, activities, addActivity, removeActivity } = useTripState() as any;
  const d = Math.max(1, Math.min(parseInt(day || '1'), Math.max(1, days || 1), 3));

  const [showCamera, setShowCamera] = useState(false);
  const [suggested, setSuggested] = useState<Record<string, any[]>>({});
  const [center, setCenter] = useState<{lat:number; lon:number} | null>(null);
  const maxSuggestions = 10;
  const autoAddedRef = useRef<Record<number, boolean>>({});

  const describe = (p: any) => {
    if (!p) return '';
    const base = p.name || 'this place';
    if (/hotel|resort|stay|inn|lodge/i.test(base)) return `Convenient stay option near ${location}.`;
    if (/museum|fort|palace|temple|park|beach|lake|falls|attraction/i.test(base)) return `Popular attraction to explore in ${location}.`;
    if (/restaurant|cafe|food|eat|diner/i.test(base)) return `Well-rated spot to try local food in ${location}.`;
    // Fallback: no generic text; rating will be shown separately
    return '';
  };

  const estimateRating = (p: any) => {
    const s = (p?.name || '').length + (p?.address || '').length;
    const base = 3.8 + ((s % 12) / 60); // ~3.8 - 4.0
    return Number(base.toFixed(1));
  };


  const [showBillModal, setShowBillModal] = useState(false);
  const [billName, setBillName] = useState("");
  const todayISO = new Date().toISOString().slice(0,10);
  const [billForm, setBillForm] = useState({ title: "Bill", amount: "", category: "Misc", date: todayISO });

  // Floating chatbot toggle
  const [chatOpen, setChatOpen] = useState(false);
  const [endTripOpen, setEndTripOpen] = useState(false);

  const openCamera = async () => {
    try {
      const file = await visionController.pickImageViaCamera();
      setBillName(file.name);
      // Call backend process_bill to auto-extract expense data
      const items = await billService.process_bill(file);
      if (items && items.length > 0) {
        items.forEach(it => addExpense({ title: it.title, amount: it.amount, category: it.category, date: it.date }));
        return; // auto-added
      }
      // Fallback to manual modal
      setBillForm(prev => ({ ...prev, title: `Bill - Day ${d}` }));
      setShowBillModal(true);
    } catch (_) {
      // If camera not available, fallback to manual modal
      setBillForm(prev => ({ ...prev, title: `Bill - Day ${d}` }));
      setShowBillModal(true);
    }
  };
  const normalizeCategory = (c?: string) => {
    if (!c) return 'Misc';
    const s = c.toLowerCase();
    if (/(stay|hotel|accom|lodge|resort)/.test(s)) return 'Stay';
    if (/(food|meal|restaurant|cafe|dine|beverage)/.test(s)) return 'Food & Beverages';
    if (/(activity|ticket|entry|experience|tour)/.test(s)) return 'Activities';
    if (/(transport|taxi|cab|bus|train|flight|fuel)/.test(s)) return 'Transport';
    if (/(shop|purchase|gift|mall|souvenir)/.test(s)) return 'Shopping';
    return 'Misc';
  };

  const saveBill = () => {
    const amt = parseFloat(billForm.amount || "0");
    if (!amt) { setShowBillModal(false); return; }
    addExpense({ title: billForm.title, amount: amt, category: billForm.category, date: billForm.date });
    setShowBillModal(false);
    setBillForm({ title: "Bill", amount: "", category: "Misc", date: todayISO });
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await getLeafletSuggestionsForDay(location || '', d);
        setSuggested(res.sections);
        setCenter(res.center);
      } catch {}
    })();
  }, [location, d]);

  // Auto-add up to 5 suggestions to the plan for this day (once per day)
  useEffect(() => {
    if (!suggested || Object.values(suggested).flat().length === 0) return;
    // Storage-based guard so switching day pills does not re-add
    const storageKey = `autoAdded:${location || 'unknown'}:${d}`;
    if (sessionStorage.getItem(storageKey) === '1') return;
    if (autoAddedRef.current[d]) return; // already added for this day in-memory

    const existing = new Set(activities.filter((a:any)=>a.day===d).map((a:any)=>a.title+"|"+a.location));
    // If user already has items for this day, consider it done and mark stored
    if (existing.size > 0) {
      autoAddedRef.current[d] = true;
      sessionStorage.setItem(storageKey, '1');
      return;
    }

    const pool = Object.values(suggested).flat();
    const toAdd = pool.filter((p:any)=>!existing.has(p.name+"|"+(p.address||""))).slice(0,3);
    if (toAdd.length === 0) {
      autoAddedRef.current[d] = true;
      sessionStorage.setItem(storageKey, '1');
      return;
    }
    toAdd.forEach((p:any)=> addActivity({ title: p.name, time: '', location: p.address || '', status: 'Pending', day: d, description: describe(p), rating: p.rating ?? estimateRating(p) }));
    autoAddedRef.current[d] = true;
    sessionStorage.setItem(storageKey, '1');
  }, [suggested, d, activities, location]);

  // Static sample hints removed; we rely on “Planned list” + OSM suggestions below.

  const summaryItems = useMemo(() => {
    const planned = activities.filter((a:any)=>a.day===d);
    const items = (planned.length > 0
      ? planned.slice(0,3).map((a:any)=>({ title: a.title, desc: a.description || '', rating: (a as any).rating }))
      : Object.values(suggested).flat().slice(0,3).map((p:any)=>({ title: p.name, desc: describe(p), rating: p.rating ?? estimateRating(p) })));
    return items;
  }, [activities, d, suggested]);

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
        {/* 'You can visit …' summary as bullet points with why visit + rating if available */}
        <div className="mb-2">
          {summaryItems && summaryItems.length > 0 && (
            <ul className="list-disc pl-5 text-xs text-muted-foreground">
              {summaryItems.map((it:any, idx:number)=> (
                <li key={idx} className="mb-1"><span className="text-foreground font-medium">{it.title}</span> — {it.desc} {it.rating ? <span>(rating: {it.rating})</span> : null}</li>
              ))}
            </ul>
          )}
        </div>
        {/* Planned list for the current day */}
        <div className="space-y-2">
          {activities.filter((a:any)=>a.day===d).map((a:any)=> (
            <div key={a.id} className="flex items-start justify-between p-2 bg-card rounded-lg border border-border">
              <div className="text-xs">
                <div className="font-medium">{a.title}</div>
                <div className="text-muted-foreground">{a.location}</div>
                {a.description && <div className="text-muted-foreground/80 mt-1">{a.description}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map preview with markers (planned items preferred, else suggestions) */}
      {center && (
        <div className="mobile-card p-3">
          <LeafletMap
            center={center}
            markers={(activities.filter((a:any)=>a.day===d).length>0
              ? activities.filter((a:any)=>a.day===d).map((a:any)=>({ lat: center.lat, lon: center.lon, label: a.title }))
              : Object.values(suggested).flat().slice(0,10).map((p:any)=>({lat:p.lat, lon:p.lon, label:p.name})))}
            height={220}
          />
        </div>
      )}

      {/* Scan bills card placed below plan module */}
      <div className="mobile-card p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Scan bills</div>
          <button onClick={()=>setShowCamera(true)} className="px-3 py-2 rounded-lg border border-border bg-card text-sm inline-flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span>Open camera</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={()=>go(Math.max(1, d-1))} className="px-3 py-2 rounded-lg border border-border bg-card text-sm" disabled={d<=1}>← Prev</button>
        <div className="text-xs text-muted-foreground">{`Day ${d} of ${Math.min(3, Math.max(1, days||1))}`}</div>
        <div className="flex items-center gap-2">
          <button onClick={()=>go(Math.min(Math.min(3, Math.max(1, days||1)), d+1))} className="px-3 py-2 rounded-lg border border-border bg-card text-sm" disabled={d>=Math.min(3, Math.max(1, days||1))}>Next →</button>
          <button onClick={()=>setEndTripOpen(true)} className="px-3 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm">End Trip</button>
        </div>
      </div>

      {/* Camera overlay */}
      {showCamera && (
        <CameraOverlay
          onClose={()=>setShowCamera(false)}
          onCapture={async (file)=>{
            setBillName(file.name);
            const items = await billService.process_bill(file);
            setShowCamera(false);
            if (items && items.length > 0) {
              const total = items.reduce((s:any, it:any)=> s + (parseFloat(it.amount)||0), 0);
              const first = items[0] || {};
              setBillForm({
                title: first.title || `Bill - Day ${d}`,
                amount: String(total || first.amount || ''),
                category: normalizeCategory(first.category),
                date: (first.date && String(first.date).slice(0,10)) || todayISO
              });
              setShowBillModal(true);
            } else {
              setBillForm(prev => ({ ...prev, title: `Bill - Day ${d}` }));
              setShowBillModal(true);
            }
          }}
        />
      )}

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

      {/* End Trip modal */}
      {endTripOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl p-4 w-full max-w-sm">
            <div className="text-sm font-semibold mb-2">Finish Trip</div>
            <p className="text-xs text-muted-foreground mb-3">Choose how to finalize your expenses.</p>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-3 rounded-lg border border-border bg-card text-sm">Split Bill</button>
              <button className="p-3 rounded-lg border border-border bg-card text-sm">Total Bill</button>
            </div>
            <div className="mt-3 text-right">
              <button onClick={()=>setEndTripOpen(false)} className="px-3 py-2 rounded-lg border border-border text-sm">Close</button>
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
