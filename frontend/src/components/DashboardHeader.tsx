import { MapPin, Calendar, DollarSign, Settings, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero-travel.jpg";
import { useState, useEffect } from "react";
import { headerService } from "@/services/headerService";
import { useTripState } from "@/context/TripState";
import { useNavigate } from "react-router-dom";
import { tripService } from "@/services/tripService";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarWidget } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const toShortDate = (d: Date) => d.toLocaleDateString('en-IN');

const formatDDMMYYYY = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth()+1).padStart(2, '0');
  const yy = d.getFullYear();
  return `${dd}-${mm}-${yy}`;
};

// Parse DD-MM-YYYY or YYYY-MM-DD (and common separators / or -)
const parseDateFlex = (s?: string): Date | null => {
  if (!s) return null;
  const str = s.trim();
  // Try DD-MM-YYYY or DD/MM/YYYY
  let m = str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (m) {
    const dd = parseInt(m[1],10), mm = parseInt(m[2],10)-1, yy = parseInt(m[3],10);
    const d = new Date(yy, mm, dd);
    return isNaN(d.getTime()) ? null : d;
  }
  // Try YYYY-MM-DD
  m = str.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (m) {
    const yy = parseInt(m[1],10), mm = parseInt(m[2],10)-1, dd = parseInt(m[3],10);
    const d = new Date(yy, mm, dd);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { setLocation, setDays, setBudget, setPlanned, members } = useTripState();
  const [destination, setDestination] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [spent, setSpent] = useState<number>(0);
  const [places, setPlaces] = useState<number>(12);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Planning form local state (moved into hero module)
  const [startFrom, setStartFrom] = useState<string>("");
  const [planBudget, setPlanBudget] = useState<string>("");
  const [people, setPeople] = useState<string>("");
  const [planning, setPlanning] = useState<boolean>(false);
  const [planError, setPlanError] = useState<string>("");

  const now = new Date();
  const parsedStart = parseDateFlex(startDate);
  const parsedEnd = parseDateFlex(endDate);
  const rawDaysUntil = parsedStart ? Math.ceil((parsedStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const daysUntilTrip = Math.max(0, rawDaysUntil);
  const statusLabel = (parsedStart && parsedEnd)
    ? (rawDaysUntil > 0 ? 'Upcoming Trip' : (now <= parsedEnd ? 'Ongoing Trip' : 'Completed Trip'))
    : 'Plan Trip';

  const dateRange = (parsedStart && parsedEnd) ? `${toShortDate(parsedStart)} - ${toShortDate(parsedEnd)}` : 'Set your dates';

  const handlePlan = async () => {
    setPlanError("");
    setPlanning(true);
    try {
      if (!destination || !startDate || !endDate) throw new Error('Please set destination and dates');
      const ps = parseDateFlex(startDate);
      const pe = parseDateFlex(endDate);
      if (!ps || !pe) throw new Error('Please use DD-MM-YYYY or YYYY-MM-DD');
      const days = Math.max(1, Math.ceil((pe.getTime() - ps.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      setLocation(destination);
      setDays(days);
      setBudget(parseFloat(planBudget) || 0);
      setPlanned(true);
      try {
        await tripService.predictTrip({
          destination,
          tripType: (parseInt(people||'1') || 1) > 1 ? 'friends' : 'solo',
          participantCount: parseInt(people||'1') || 1,
          days,
          budget: parseFloat(planBudget) || 0,
        });
      } catch {}
      navigate('/itinerary/day/1');
    } catch (e: any) {
      setPlanError(e?.message || 'Failed to plan trip');
    } finally {
      setPlanning(false);
    }
  };

  // Load from backend on mount
  useEffect(() => {
    (async () => {
      try {
        const h = await headerService.get();
        if (h.destination) { setDestination(h.destination); setLocation(h.destination); }
        if (h.startDate) setStartDate(h.startDate);
        if (h.endDate) setEndDate(h.endDate);
        if (typeof h.spentINR === 'number') setSpent(h.spentINR);
        if (typeof h.places === 'number') setPlaces(h.places);
      } catch (e) {
        // ignore if not set yet
      }
    })();
  }, []);

  const saveHeader = async () => {
    await headerService.update({
      destination,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      spentINR: Math.round(spent),
      places
    });
  };

  return (
    <div className="p-6">
      {/* App Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Map My Trip</h1>
        </div>
        <Button variant="outline" size="sm" className="rounded-full">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Trip Header Card */}
      <div className="mobile-card p-6 mb-4 bg-gradient-hero relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative">
          <div className="flex items-start justify-between mb-2">
            <Badge className="bg-white/20 text-white border-white/30">
              {statusLabel}
            </Badge>
            {!isEditing ? (
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={()=>setIsEditing(true)}>
                <Pencil className="w-4 h-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={async ()=>{await saveHeader(); setIsEditing(false);}}>
                  <Check className="w-4 h-4 mr-1"/>Save
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={()=>setIsEditing(false)}>
                  <X className="w-4 h-4"/>
                </Button>
              </div>
            )}
          </div>

          {!isEditing ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">{destination}</h2>
              <p className="text-white/80 text-sm mb-4">{dateRange}</p>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
              <input value={destination} onChange={(e)=>setDestination(e.target.value)} className="px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30" placeholder="Destination" />

              <Popover>
                <PopoverTrigger asChild>
                  <button className="px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 w-full flex items-center justify-between placeholder-white/70">
                    <span className="text-left text-sm opacity-90">{startDate || 'DD-MM-YYYY'}</span>
                    <CalendarIcon className="w-4 h-4 opacity-80" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <CalendarWidget
                    mode="single"
                    selected={parseDateFlex(startDate) || undefined}
                    onSelect={(d: any)=> d && setStartDate(formatDDMMYYYY(d))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 w-full flex items-center justify-between placeholder-white/70">
                    <span className="text-left text-sm opacity-90">{endDate || 'DD-MM-YYYY'}</span>
                    <CalendarIcon className="w-4 h-4 opacity-80" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <CalendarWidget
                    mode="single"
                    selected={parseDateFlex(endDate) || undefined}
                    onSelect={(d: any)=> d && setEndDate(formatDDMMYYYY(d))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <input type="number" value={spent} onChange={(e)=>setSpent(parseFloat(e.target.value)||0)} className="px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30" placeholder="Spent (₹)" />
              <input type="number" value={places} onChange={(e)=>setPlaces(parseInt(e.target.value)||0)} className="px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30" placeholder="Places" />
            </div>
          )}

          {/* Plan your trip inside hero */}
          <div className="mt-2 p-3 bg-white/10 rounded-xl border border-white/20">
            <div className="text-white/90 text-sm font-medium mb-2">Plan your trip</div>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
              <input value={startFrom} onChange={(e)=>setStartFrom(e.target.value)} placeholder="Start location (optional)" className="px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 md:col-span-2" />
              <input value={destination} onChange={(e)=>setDestination(e.target.value)} placeholder="Destination" className="px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 md:col-span-2" />

              {/* Start Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 w-full flex items-center justify-between placeholder-white/70">
                    <span className="text-left text-sm opacity-90">{startDate || 'DD-MM-YYYY'}</span>
                    <CalendarIcon className="w-4 h-4 opacity-80" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <CalendarWidget
                    mode="single"
                    selected={parseDateFlex(startDate) || undefined}
                    onSelect={(d: any)=> d && setStartDate(formatDDMMYYYY(d))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* End Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 w-full flex items-center justify-between placeholder-white/70">
                    <span className="text-left text-sm opacity-90">{endDate || 'DD-MM-YYYY'}</span>
                    <CalendarIcon className="w-4 h-4 opacity-80" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <CalendarWidget
                    mode="single"
                    selected={parseDateFlex(endDate) || undefined}
                    onSelect={(d: any)=> d && setEndDate(formatDDMMYYYY(d))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <input type="number" min={0} value={planBudget} onChange={(e)=>setPlanBudget(e.target.value)} className="px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 md:col-span-2" placeholder="Budget (₹)" />
              <input type="number" min={1} value={people} onChange={(e)=>setPeople(e.target.value)} className="px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30" placeholder="No. of People" />
            </div>
            {planError && <div className="text-xs text-red-200 mt-2">{planError}</div>}
            <div className="mt-3 flex justify-center">
              <Button onClick={handlePlan} disabled={planning} className="rounded-full px-6">
                {planning ? 'Planning...' : 'Plan Trip with Travel_AI'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar removed per requirements */}

      {/* Quick Filter Buttons removed per requirements */}
    </div>
  );
};

export default DashboardHeader;