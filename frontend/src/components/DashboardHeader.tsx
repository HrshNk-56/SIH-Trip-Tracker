import { MapPin, Calendar, DollarSign, Settings, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero-travel.jpg";
import { useState, useEffect } from "react";
import { headerService } from "@/services/headerService";
import { useTripState } from "@/context/TripState";

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const toShortDate = (d: Date) => d.toLocaleDateString('en-IN');

const DashboardHeader = () => {
  const { setLocation } = useTripState();
  const [destination, setDestination] = useState<string>("Kochi, Kerala");
  const [startDate, setStartDate] = useState<Date>(new Date("2024-12-15"));
  const [endDate, setEndDate] = useState<Date>(new Date("2024-12-25"));
  const [spent, setSpent] = useState<number>(0);
  const [places, setPlaces] = useState<number>(12);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const now = new Date();
  const rawDaysUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilTrip = Math.max(0, rawDaysUntil);
  const statusLabel = rawDaysUntil > 0 ? 'Upcoming Trip' : (now <= endDate ? 'Ongoing Trip' : 'Completed Trip');

  const dateRange = `${toShortDate(startDate)} - ${toShortDate(endDate)}`;

  // Load from backend on mount
  useEffect(() => {
    (async () => {
      try {
        const h = await headerService.get();
        if (h.destination) { setDestination(h.destination); setLocation(h.destination); }
        if (h.startDate) setStartDate(new Date(h.startDate));
        if (h.endDate) setEndDate(new Date(h.endDate));
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
      startDate: startDate.toISOString().slice(0,10),
      endDate: endDate.toISOString().slice(0,10),
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
              <input type="date" value={startDate.toISOString().slice(0,10)} onChange={(e)=>setStartDate(new Date(e.target.value))} className="px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30" />
              <input type="date" value={endDate.toISOString().slice(0,10)} onChange={(e)=>setEndDate(new Date(e.target.value))} className="px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30" />
              <input type="number" value={spent} onChange={(e)=>setSpent(parseFloat(e.target.value)||0)} className="px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30" placeholder="Spent (₹)" />
              <input type="number" value={places} onChange={(e)=>setPlaces(parseInt(e.target.value)||0)} className="px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30" placeholder="Places" />
            </div>
          )}
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{daysUntilTrip}</div>
              <div className="text-xs text-white/70">Days Left</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{inr.format(spent)}</div>
              <div className="text-xs text-white/70">Spent</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{places}</div>
              <div className="text-xs text-white/70">Places</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <input 
          type="text" 
          placeholder="Search destinations..." 
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['Hotels', 'Flights', 'Activities', 'Restaurants'].map((filter) => (
          <Button
            key={filter}
            variant="outline"
            size="sm"
            className="flex-shrink-0 rounded-full text-xs px-4"
          >
            {filter}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DashboardHeader;