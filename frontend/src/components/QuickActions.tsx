import { Plus, MapPin, Calendar, Share2, Phone, FileText, CreditCard, Zap, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatbotWidget from "./ChatbotWidget";
import { useTripState } from "@/context/TripState";
import { useState } from "react";

const QuickActions = () => {
  const { location } = useTripState();
  const [showEmergency, setShowEmergency] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [docs, setDocs] = useState<{ name: string; url?: string }[]>([
    { name: 'Flight Ticket' },
    { name: 'Hotel Booking' },
  ]);
  const [newDoc, setNewDoc] = useState({ name: '', url: '' });

  const openMap = () => {
    const q = location || 'Kerala, India';
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`, '_blank');
  };

  const bookExperience = () => {
    // Try to use the user's current location first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          // Open Google Maps search centered on user's current coords
          const url = `https://www.google.com/maps/search/things+to+do/@${latitude},${longitude},14z`;
          window.open(url, '_blank');
        },
        () => {
          const q = location ? `things to do in ${location}` : 'things to do near me';
          window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      const q = location ? `things to do in ${location}` : 'things to do near me';
      window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
    }
  };

  const shareTrip = async () => {
    const shareData = {
      title: 'Map My Trip',
      text: `Planning a trip to ${location || 'Kerala'}! Check out my plan on Map My Trip.`,
      url: window.location.origin,
    };
    try {
      if ((navigator as any).share) {
        await (navigator as any).share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Trip link copied to clipboard');
      }
    } catch (e) {
      console.warn('Share failed', e);
    }
  };
  return (
    <div className="mobile-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-accent" />
        <h3 className="font-semibold text-lg">Quick Actions</h3>
      </div>
      <div className="space-y-4">

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            className="h-16 flex flex-col items-center justify-center gap-2 bg-gradient-primary hover:opacity-90 transition-all duration-200 rounded-2xl text-white"
            onClick={() => document.getElementById('expense-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs font-medium">Add Expense</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex flex-col items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-2xl"
            onClick={openMap}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-xs font-medium">Open Map</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex flex-col items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-2xl"
            onClick={bookExperience}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs font-medium">Book Experience</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex flex-col items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-2xl"
            onClick={shareTrip}
          >
            <Share2 className="w-5 h-5" />
            <span className="text-xs font-medium">Share Trip</span>
          </Button>
        </div>

        {/* Quick Links + Chatbot */}
        <div className="space-y-3">
          <h4 className="font-medium text-muted-foreground text-sm flex items-center justify-between">
            <span>Quick Links</span>
          </h4>
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start h-auto p-3 hover:bg-muted/50 transition-colors rounded-xl"
              onClick={() => setShowEmergency(true)}
            >
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium text-sm">Emergency Contacts</p>
                  <p className="text-xs text-muted-foreground">Access help numbers</p>
                </div>
              </div>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start h-auto p-3 hover:bg-muted/50 transition-colors rounded-xl"
              onClick={() => setShowDocs(true)}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium text-sm">Travel Documents</p>
                  <p className="text-xs text-muted-foreground">Tickets & reservations</p>
                </div>
              </div>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start h-auto p-3 hover:bg-muted/50 transition-colors rounded-xl"
              onClick={() => window.open('https://www.google.com/finance/converter?from=USD&to=INR&amount=1', '_blank')}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium text-sm">Currency Exchange (INR)</p>
                  <p className="text-xs text-muted-foreground">Real-time rates</p>
                </div>
              </div>
            </Button>
          </div>

          {/* Inline AI Chatbot near Quick Links */}
          <ChatbotWidget theme="kerala" size="small" />
        </div>

      </div>

      {/* Emergency Modal */}
      {showEmergency && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl p-4 w-full max-w-md border border-border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Emergency Contacts</h4>
              <Button variant="ghost" size="sm" onClick={()=>setShowEmergency(false)}><X className="w-4 h-4"/></Button>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span>Police (Kerala)</span>
                <a href="tel:100" className="text-primary underline">100</a>
              </li>
              <li className="flex items-center justify-between">
                <span>Ambulance</span>
                <a href="tel:102" className="text-primary underline">102</a>
              </li>
              <li className="flex items-center justify-between">
                <span>Tourist Helpline</span>
                <a href="tel:18004254238" className="text-primary underline">1800-425-4238</a>
              </li>
              <li className="flex items-center justify-between">
                <span>Women Helpline</span>
                <a href="tel:181" className="text-primary underline">181</a>
              </li>
            </ul>
            <div className="mt-3 text-xs text-muted-foreground">Tip: Save these numbers on your phone before starting the trip.</div>
          </div>
        </div>
      )}

      {/* Travel Documents Modal */}
      {showDocs && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl p-4 w-full max-w-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Travel Documents</h4>
              <Button variant="ghost" size="sm" onClick={()=>setShowDocs(false)}><X className="w-4 h-4"/></Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-auto">
              {docs.map((d, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded-lg bg-card">
                  <div className="text-sm">
                    <div className="font-medium">{d.name}</div>
                    {d.url && <a href={d.url} target="_blank" className="text-xs text-primary underline flex items-center gap-1">Open <ExternalLink className="w-3 h-3"/></a>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={()=> setDocs(prev => prev.filter((_,i)=>i!==idx))}>Remove</Button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <input value={newDoc.name} onChange={(e)=>setNewDoc({...newDoc, name:e.target.value})} placeholder="Document name" className="px-2 py-2 border rounded col-span-1 md:col-span-2" />
              <input value={newDoc.url} onChange={(e)=>setNewDoc({...newDoc, url:e.target.value})} placeholder="URL (optional)" className="px-2 py-2 border rounded col-span-2 hidden md:block" />
              <Button onClick={()=>{ if(!newDoc.name) return; setDocs(prev=>[...prev, {name:newDoc.name, url:newDoc.url}]); setNewDoc({name:'', url:''}); }}>Add</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;