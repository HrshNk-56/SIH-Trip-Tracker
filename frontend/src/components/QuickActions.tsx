import { Plus, MapPin, Calendar, Share2, Phone, FileText, CreditCard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const QuickActions = () => {
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
            onClick={() => console.log("Add expense clicked")}
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs font-medium">Add Expense</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex flex-col items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-2xl"
            onClick={() => console.log("View Map clicked")}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-xs font-medium">View Map</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex flex-col items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-2xl"
            onClick={() => console.log("Book Activity clicked")}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs font-medium">Book Activity</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex flex-col items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-2xl"
            onClick={() => console.log("Share Trip clicked")}
          >
            <Share2 className="w-5 h-5" />
            <span className="text-xs font-medium">Share Trip</span>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="font-medium text-muted-foreground text-sm">Quick Links</h4>
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start h-auto p-3 hover:bg-muted/50 transition-colors rounded-xl"
              onClick={() => console.log("Emergency contacts clicked")}
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
              onClick={() => console.log("Travel documents clicked")}
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
              onClick={() => console.log("Currency exchange clicked")}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium text-sm">Currency Exchange</p>
                  <p className="text-xs text-muted-foreground">Real-time rates</p>
                </div>
              </div>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuickActions;