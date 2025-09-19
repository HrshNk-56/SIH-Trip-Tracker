import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TripOverview = () => {
  const upcomingActivities = [
    {
      id: 1,
      title: "Tokyo Skytree Visit",
      time: "09:00 AM",
      location: "Sumida District",
      status: "Confirmed",
      icon: MapPin,
    },
    {
      id: 2,
      title: "Sushi Making Class",
      time: "02:00 PM",
      location: "Shibuya District", 
      status: "Pending",
      icon: Clock,
    },
    {
      id: 3,
      title: "Mount Fuji Day Trip",
      time: "06:00 AM",
      location: "Fuji-Hakone-Izu Park",
      status: "Confirmed",
      icon: MapPin,
    },
  ];

  return (
    <div className="mobile-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Trip Overview</h3>
      </div>
      <div className="space-y-4">
        
        {/* Next Activity */}
        <div className="p-4 bg-gradient-primary rounded-2xl text-white">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm">Next Activity</h4>
            <Badge className="bg-white/20 text-white border-white/30 text-xs">
              Today
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">Visit Senso-ji Temple</p>
              <p className="text-xs text-white/80">2:30 PM - Asakusa District</p>
            </div>
          </div>
        </div>

        {/* Upcoming Activities */}
        <div className="space-y-3">
          <h4 className="font-medium text-muted-foreground text-sm">Upcoming Activities</h4>
          {upcomingActivities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border">
              <div className="flex items-center gap-3">
                <activity.icon className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.time} • {activity.location}</p>
                </div>
              </div>
              <Badge variant={activity.status === "Confirmed" ? "default" : "secondary"} className="text-xs">
                {activity.status}
              </Badge>
            </div>
          ))}
        </div>

        {/* Travel Group */}
        <div className="p-3 bg-secondary rounded-xl border border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm">Travel Group</h4>
            <Badge variant="outline" className="text-xs">4 members</Badge>
          </div>
          <div className="flex -space-x-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Avatar key={i} className="w-8 h-8 border-2 border-white">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} />
                <AvatarFallback className="text-xs">U{i + 1}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TripOverview;