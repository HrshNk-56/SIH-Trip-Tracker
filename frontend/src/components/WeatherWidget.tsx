import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const WeatherWidget = () => {
  const weatherData = {
    current: {
      location: "Tokyo, Japan",
      temperature: 18,
      condition: "Partly Cloudy",
      humidity: 65,
      windSpeed: 12,
      icon: Cloud,
    },
    forecast: [
      { day: "Today", high: 22, low: 15, condition: "Partly Cloudy", icon: Cloud },
      { day: "Tomorrow", high: 25, low: 18, condition: "Sunny", icon: Sun },
      { day: "Thu", high: 20, low: 14, condition: "Light Rain", icon: CloudRain },
      { day: "Fri", high: 23, low: 16, condition: "Sunny", icon: Sun },
    ],
    alerts: [
      { type: "info", message: "Perfect weather for outdoor activities tomorrow!" },
    ],
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny": return "text-warning";
      case "partly cloudy": return "text-muted-foreground";
      case "light rain": return "text-primary";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="mobile-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sun className="w-5 h-5 text-warning" />
        <h3 className="font-semibold text-lg">Weather Forecast</h3>
      </div>
      <div className="space-y-4">
        {/* Current Weather */}
        <div className="p-4 bg-secondary rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold text-base">{weatherData.current.location}</h4>
              <p className="text-muted-foreground text-sm">{weatherData.current.condition}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{weatherData.current.temperature}°C</div>
              <weatherData.current.icon className={`w-6 h-6 ${getConditionColor(weatherData.current.condition)} mx-auto mt-1`} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-primary" />
              <span className="text-sm">
                <span className="font-medium">{weatherData.current.humidity}%</span>
                <span className="text-muted-foreground ml-1">humidity</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-primary" />
              <span className="text-sm">
                <span className="font-medium">{weatherData.current.windSpeed} km/h</span>
                <span className="text-muted-foreground ml-1">wind</span>
              </span>
            </div>
          </div>
        </div>

        {/* 4-Day Forecast */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground mb-3">4-Day Forecast</h4>
          {weatherData.forecast.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <day.icon className={`w-4 h-4 ${getConditionColor(day.condition)}`} />
                <div>
                  <p className="font-medium text-sm">{day.day}</p>
                  <p className="text-xs text-muted-foreground">{day.condition}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm">
                  {day.high}° / {day.low}°
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Weather Alerts */}
        {weatherData.alerts.length > 0 && (
          <div className="space-y-2">
            {weatherData.alerts.map((alert, index) => (
              <div key={index} className="p-3 rounded-xl bg-success border border-success/20">
                <Badge className="bg-success/90 text-white mb-2 text-xs">
                  Weather Tip
                </Badge>
                <p className="text-sm text-foreground">{alert.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherWidget;