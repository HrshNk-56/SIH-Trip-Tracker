import { MapPin, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTripState } from "@/context/TripState";
import { useState } from "react";

const QuickActions = () => {
  const { location } = useTripState();

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

  // Share Trip removed per requirements
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
            <span className="text-xs font-medium">Things To-Do Nearby</span>
          </Button>
        </div>

        {/* Quick Links module removed per requirements */}
      </div>
    </div>
  );
};

export default QuickActions;