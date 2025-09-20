import { useMemo, useState } from "react";
import BudgetTracker from "@/components/BudgetTracker";
import { useTripState } from "@/context/TripState";
import { Camera, Hotel, MapPin, ShoppingBag, Utensils, Ticket } from "lucide-react";

const CaptureReceipt: React.FC<{ day: number }> = ({ day }) => {
  const [fileName, setFileName] = useState<string>("");
  return (
    <div className="p-3 bg-card border border-border rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <Camera className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Capture receipts (Day {day})</span>
      </div>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e)=>setFileName(e.target.files?.[0]?.name || "")}
        className="text-xs"
      />
      {fileName && <div className="text-xs text-muted-foreground mt-1">Selected: {fileName}</div>}
    </div>
  );
};

const ItineraryBudget = () => {
  const { location, days } = useTripState();

  const cappedDays = Math.min(3, Math.max(1, days || 1));

  const itinerary = useMemo(() => {
    const arr: any[] = [];
    for (let d = 1; d <= cappedDays; d++) {
      if (d === 1) {
        arr.push({
          day: 1,
          title: "Arrival & Stay",
          blocks: [
            { icon: Hotel, label: "Places to stay", items: [
              `Check-in at a homestay in ${location || 'Kochi'}`,
              "Evening walk at Fort Kochi Beach",
            ]},
            { icon: MapPin, label: "Places to visit", items: [
              "Chinese Fishing Nets",
              "St. Francis Church",
            ]},
          ],
        });
      } else if (d === 2) {
        arr.push({
          day: 2,
          title: "Food & Shopping",
          blocks: [
            { icon: Utensils, label: "Food", items: [
              "Breakfast: Puttu & Kadala curry",
              "Dinner: Malabar biryani",
            ]},
            { icon: ShoppingBag, label: "Shopping", items: [
              "Spice market visit",
              "Handicrafts at Jew Town",
            ]},
          ],
        });
      } else {
        arr.push({
          day: 3,
          title: "Departure",
          blocks: [
            { icon: Ticket, label: "Tickets to leave", items: [
              "Confirm bus/train/flight",
              "Checkout and travel to station/airport",
            ]},
          ],
        });
      }
    }
    return arr;
  }, [location, cappedDays]);

  return (
    <div className="space-y-4">
      {/* Itinerary */}
      <div className="mobile-card p-4">
        <h3 className="font-semibold text-lg mb-2">Itinerary (max 3 days)</h3>
        <div className="space-y-4">
          {itinerary.map((d) => (
            <div key={d.day} className="p-3 bg-secondary rounded-xl border border-border">
              <div className="font-medium text-sm mb-2">Day {d.day}: {d.title}</div>
              <div className="space-y-2">
                {d.blocks.map((b: any, idx: number) => (
                  <div key={idx} className="p-2 bg-card rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <b.icon className="w-4 h-4 text-primary" />
                      <div className="text-xs font-medium">{b.label}</div>
                    </div>
                    <ul className="list-disc list-inside text-xs text-muted-foreground">
                      {b.items.map((it: string, j: number) => <li key={j}>{it}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <CaptureReceipt day={d.day} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Day-wise budget tracker (reuse component; expenses list remains) */}
      <BudgetTracker />
    </div>
  );
};

export default ItineraryBudget;
