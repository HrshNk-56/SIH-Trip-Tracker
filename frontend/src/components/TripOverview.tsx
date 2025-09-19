import { Calendar, Clock, MapPin, Users, Plus, Trash2, Wand2, MapPinned } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { tripService, TripPredictionResponse } from "@/services/tripService";
import { useTripState } from "@/context/TripState";

interface Activity {
  id: string;
  title: string;
  time: string;
  location: string;
  status: 'Confirmed' | 'Pending';
  icon: any;
}

const TripOverview = () => {
  const { location, setLocation, days, setDays, budget, setBudget, planned, setPlanned, members, addMember, removeMember } = useTripState();
  const [activities, setActivities] = useState<Activity[]>([
    { id: '1', title: 'City Walk', time: '09:00 AM', location: 'Main Square', status: 'Confirmed', icon: MapPin },
  ]);

  const [newActivity, setNewActivity] = useState({ title: '', time: '', location: '' });
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [prediction, setPrediction] = useState<TripPredictionResponse | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictError, setPredictError] = useState<string | null>(null);

  // If planning just started and no location set, try to capture user's current coords
  useEffect(() => {
    if (planned && (!location || location.trim().length === 0) && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      });
    }
  }, [planned]);

  const parseTime = (t: string) => {
    const m = t.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!m) return Number.MAX_SAFE_INTEGER;
    let hh = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    const ap = m[3].toUpperCase();
    if (ap === 'PM' && hh !== 12) hh += 12;
    if (ap === 'AM' && hh === 12) hh = 0;
    return hh * 60 + mm;
  };
  const nextActivity = [...activities].sort((a, b) => parseTime(a.time) - parseTime(b.time))[0];

  const addActivity = () => {
    if (!newActivity.title || !newActivity.time || !newActivity.location) return;
    setActivities(prev => [...prev, { id: Date.now().toString(), ...newActivity, status: 'Pending', icon: MapPin }]);
    setNewActivity({ title: '', time: '', location: '' });
  };
  const removeActivity = (id: string) => setActivities(prev => prev.filter(a => a.id !== id));

  const addMemberLocal = () => { if (!newMemberName.trim()) return; addMember(newMemberName.trim()); setNewMemberName(''); };

  const handlePredict = async () => {
    try {
      setIsPredicting(true); setPredictError(null);
      const tripType = members.length > 1 ? 'friends' : 'solo';
      const res = await tripService.predictTrip({ destination: location, tripType, participantCount: members.length, days, budget });
      setPrediction(res);
    } catch (e: any) { setPredictError(e.message || 'Prediction failed. Is the ML API running?'); }
    finally { setIsPredicting(false); }
  };

  if (!planned) {
    return (
      <div className="mobile-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPinned className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Plan your trip</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">Set your destination, days and budget to start planning. We'll help with AI cost predictions and suggestions.</p>
        <div className="flex gap-2">
          <Button onClick={()=>setPlanned(true)}>Start Planning</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Trip Overview</h3>
      </div>
      <div className="space-y-4">

        {/* Editable Trip Details + AI Predict */}
        <div className="p-3 rounded-xl bg-secondary border border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg bg-input text-foreground" placeholder="City, State/Region" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Days</label>
              <input type="number" min={1} value={days} onChange={(e) => setDays(parseInt(e.target.value)||1)} className="w-full mt-1 px-3 py-2 border rounded-lg bg-input text-foreground" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Budget (₹)</label>
              <input type="number" min={0} value={budget} onChange={(e) => setBudget(parseFloat(e.target.value)||0)} className="w-full mt-1 px-3 py-2 border rounded-lg bg-input text-foreground" />
            </div>
            <div className="md:col-span-4 flex gap-2">
              <Button onClick={handlePredict} className="flex items-center gap-2"><Wand2 className="w-4 h-4" />{isPredicting ? 'Predicting...' : 'Predict Expenses (AI)'}</Button>
              {predictError && <span className="text-xs text-destructive self-center">{predictError}</span>}
            </div>
            {prediction && (
              <div className="md:col-span-4 text-sm bg-card border border-border rounded-xl p-3">
                <div className="flex flex-wrap gap-4">
                  <span>Predicted: <b>₹{prediction.predictedCost.toLocaleString()}</b></span>
                  <span>Category: {prediction.tripCategory}</span>
                  <span>Budget: {prediction.budgetStatus}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mt-2 text-muted-foreground">
                  <div>🏨 ₹{prediction.costBreakdown.accommodation.toLocaleString()}</div>
                  <div>🍽️ ₹{prediction.costBreakdown.food.toLocaleString()}</div>
                  <div>🚗 ₹{prediction.costBreakdown.transport.toLocaleString()}</div>
                  <div>🎯 ₹{prediction.costBreakdown.activities.toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Activity */}
        <div className="p-4 bg-gradient-primary rounded-2xl text-white">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm">Upcoming Activity</h4>
            <Badge className="bg-white/20 text-white border-white/30 text-xs">Today</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">{nextActivity ? nextActivity.title : 'No upcoming activity'}</p>
              {nextActivity && <p className="text-xs text-white/80">{nextActivity.time} - {nextActivity.location}</p>}
            </div>
          </div>
        </div>

        {/* Upcoming Activities (Add/Remove) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-muted-foreground text-sm">Upcoming Activities</h4>
            <div className="flex gap-2">
              <input value={newActivity.title} onChange={(e)=>setNewActivity({...newActivity, title:e.target.value})} placeholder="Title" className="px-2 py-1 border rounded text-xs" />
              <input value={newActivity.time} onChange={(e)=>setNewActivity({...newActivity, time:e.target.value})} placeholder="Time" className="px-2 py-1 border rounded text-xs" />
              <input value={newActivity.location} onChange={(e)=>setNewActivity({...newActivity, location:e.target.value})} placeholder="Location" className="px-2 py-1 border rounded text-xs" />
              <Button size="sm" onClick={addActivity} className="h-7 px-2"><Plus className="w-3 h-3" /></Button>
            </div>
          </div>
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border">
              <div className="flex items-center gap-3">
                <activity.icon className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.time} • {activity.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={activity.status === 'Confirmed' ? 'default' : 'secondary'} className="text-xs">{activity.status}</Badge>
                <Button variant="ghost" size="sm" onClick={()=>removeActivity(activity.id)} className="p-1"><Trash2 className="w-3 h-3 text-destructive"/></Button>
              </div>
            </div>
          ))}
        </div>

        {/* Travel Group (Edit Size/Members) */}
        <div className="p-3 bg-secondary rounded-xl border border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm">Travel Group</h4>
            <Badge variant="outline" className="text-xs">{members.length} members</Badge>
          </div>
          <div className="flex items-center gap-2 mb-2">
              <input value={newMemberName} onChange={(e)=>setNewMemberName(e.target.value)} placeholder="Member name" className="px-2 py-1 border rounded text-xs" />
            <Button size="sm" onClick={addMemberLocal} className="h-7 px-2"><Users className="w-3 h-3 mr-1"/>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-2 px-2 py-1 bg-card border border-border rounded-lg text-xs">
                <div className="flex items-center gap-1">
                  <Avatar className="w-5 h-5"><AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`} /><AvatarFallback className="text-[10px]">{m.name[0] || 'U'}</AvatarFallback></Avatar>
                  <span>{m.name}</span>
                </div>
                <button onClick={()=>removeMember(m.id)} className="text-destructive"><Trash2 className="w-3 h-3"/></button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TripOverview;
