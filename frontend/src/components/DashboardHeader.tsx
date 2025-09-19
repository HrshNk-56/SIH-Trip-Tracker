import { MapPin, Calendar, DollarSign, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero-travel.jpg";

const DashboardHeader = () => {
  const tripData = {
    destination: "Tokyo, Japan",
    startDate: new Date("2024-12-15"),
    endDate: new Date("2024-12-25"),
    budget: 3500,
    spent: 1250,
  };

  const daysUntilTrip = Math.ceil((tripData.startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const tripDuration = Math.ceil((tripData.endDate.getTime() - tripData.startDate.getTime()) / (1000 * 60 * 60 * 24));

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
          <Badge className="mb-3 bg-white/20 text-white border-white/30">
            Upcoming Trip
          </Badge>
          <h2 className="text-2xl font-bold text-white mb-2">{tripData.destination}</h2>
          <p className="text-white/80 text-sm mb-4">
            {tripData.startDate.toLocaleDateString()} - {tripData.endDate.toLocaleDateString()}
          </p>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{daysUntilTrip}</div>
              <div className="text-xs text-white/70">Days Left</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">${tripData.spent}</div>
              <div className="text-xs text-white/70">Spent</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">12</div>
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