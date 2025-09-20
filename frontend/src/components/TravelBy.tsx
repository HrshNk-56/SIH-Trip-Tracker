import { Car, TrainFront as Train, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTripState } from "@/context/TripState";
import { useNavigate } from "react-router-dom";

type Props = { navigateOnSelect?: boolean };

const TravelBy = ({ navigateOnSelect = true }: Props) => {
  const { preferredTransport, setPreferredTransport } = useTripState();
  const navigate = useNavigate();

  const select = (mode: string) => {
    setPreferredTransport(mode);
    if (navigateOnSelect) navigate('/itinerary/day/1');
  };

  const item = (mode: string, label: string, Icon: any) => (
    <Button
      key={mode}
      variant={preferredTransport === mode ? "default" : "outline"}
      className={`h-16 rounded-2xl flex flex-col items-center justify-center gap-2 transition-transform duration-200 hover:scale-105 ${preferredTransport===mode? 'bg-gradient-primary text-white ring-2 ring-primary' : ''}`}
      onClick={() => select(mode)}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium">{label}</span>
    </Button>
  );

  return (
    <div className="mobile-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="font-semibold text-lg">Travel by</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {item('car','Car',Car)}
        {item('train','Train',Train)}
        {item('flight','Flight',Plane)}
      </div>
    </div>
  );
};

export default TravelBy;
