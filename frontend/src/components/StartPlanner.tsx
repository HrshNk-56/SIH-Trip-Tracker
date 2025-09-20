import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTripState } from "@/context/TripState";
import { useNavigate } from "react-router-dom";
import { Wand2, MapPin, Calendar, Users, Wallet } from "lucide-react";
import { tripService } from "@/services/tripService";

const StartPlanner = () => {
  const navigate = useNavigate();
  const { setLocation, setDays, setBudget, setPlanned, members } = useTripState();

  const today = new Date().toISOString().slice(0,10);
  const tomorrow = new Date(Date.now() + 24*60*60*1000).toISOString().slice(0,10);

  const [form, setForm] = useState({
    start: "",
    destination: "Kochi, Kerala",
    startDate: today,
    endDate: tomorrow,
    budget: 30000,
    people: Math.max(1, members.length || 1),
    isSubmitting: false,
    error: "",
  });

  const calcDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const d = Math.max(1, Math.ceil((e.getTime() - s.getTime())/(1000*60*60*24)) + 1);
    return d;
  };

  const onPlan = async () => {
    setForm(f => ({ ...f, isSubmitting: true, error: "" }));
    try {
      const days = calcDays(form.startDate, form.endDate);
      setLocation(form.destination);
      setDays(days);
      setBudget(form.budget);
      setPlanned(true);

      // Call AI predictor (non-blocking for success UI)
      try {
        await tripService.predictTrip({
          destination: form.destination,
          tripType: form.people > 1 ? 'friends' : 'solo',
          participantCount: form.people,
          days,
          budget: form.budget,
        });
      } catch {}

      navigate('/itinerary');
    } catch (e: any) {
      setForm(f => ({ ...f, error: e?.message || 'Failed to plan trip' }));
    } finally {
      setForm(f => ({ ...f, isSubmitting: false }));
    }
  };

  return (
    <div className="mobile-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Wand2 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Plan your trip</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">From</label>
          <div className="relative mt-1">
            <input
              value={form.start}
              onChange={(e)=>setForm({...form, start: e.target.value})}
              placeholder="Start location (optional)"
              className="w-full px-3 py-2 border rounded-lg bg-input text-foreground pr-8"
            />
            <MapPin className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Destination</label>
          <div className="relative mt-1">
            <input
              value={form.destination}
              onChange={(e)=>setForm({...form, destination: e.target.value})}
              placeholder="City, State/Region"
              className="w-full px-3 py-2 border rounded-lg bg-input text-foreground pr-8"
            />
            <MapPin className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Date of Start</label>
          <div className="relative mt-1">
            <input
              type="date"
              value={form.startDate}
              onChange={(e)=>setForm({...form, startDate: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg bg-input text-foreground pr-8"
            />
            <Calendar className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Date of End</label>
          <div className="relative mt-1">
            <input
              type="date"
              value={form.endDate}
              onChange={(e)=>setForm({...form, endDate: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg bg-input text-foreground pr-8"
            />
            <Calendar className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Budget (₹)</label>
          <div className="relative mt-1">
            <input
              type="number"
              min={0}
              value={form.budget}
              onChange={(e)=>setForm({...form, budget: parseFloat(e.target.value)||0})}
              className="w-full px-3 py-2 border rounded-lg bg-input text-foreground pr-8"
            />
            <Wallet className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">No. of People</label>
          <div className="relative mt-1">
            <input
              type="number"
              min={1}
              value={form.people}
              onChange={(e)=>setForm({...form, people: Math.max(1, parseInt(e.target.value)||1)})}
              className="w-full px-3 py-2 border rounded-lg bg-input text-foreground pr-8"
            />
            <Users className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {form.error && <div className="text-xs text-destructive mt-2">{form.error}</div>}

      <div className="mt-4">
        <Button onClick={onPlan} disabled={form.isSubmitting} className="w-full md:w-auto">
          <Wand2 className="w-4 h-4 mr-2" /> {form.isSubmitting ? 'Planning...' : 'Plan Trip with Travel_AI'}
        </Button>
      </div>
    </div>
  );
};

export default StartPlanner;
