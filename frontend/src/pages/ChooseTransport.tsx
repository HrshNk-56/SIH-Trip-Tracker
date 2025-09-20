import TravelBy from "@/components/TravelBy";
import { useNavigate } from "react-router-dom";

const ChooseTransportPage = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="mobile-card p-4">
        <div className="flex items-center justify-between mb-2">
<button onClick={()=>navigate(-1)} className="mt-10 px-3 py-2 rounded-lg border border-border bg-card text-sm">← Back</button>
          <h2 className="font-semibold text-lg">Choose your travel mode</h2>
          <div />
        </div>
        <p className="text-xs text-muted-foreground mb-3">Pick a preferred way to travel. You can change it later.</p>
        <TravelBy />
      </div>
    </div>
  );
};

export default ChooseTransportPage;
