import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import TripOverview from "@/components/TripOverview";
import BudgetTracker from "@/components/BudgetTracker";
import QuickActions from "@/components/QuickActions";
import { TripStateProvider } from "@/context/TripState";
import { MapPin, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient();

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:8080';

  const checkAuth = async () => {
    console.log('🔐 React App: Starting authentication check...');
    try {
      // First check if we have a stored user session
      const storedUser = localStorage.getItem('user');
      console.log('📦 Stored user data:', storedUser ? 'Found' : 'None');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('✅ Parsed stored user:', parsedUser);
          setUser(parsedUser);
        } catch (parseError) {
          console.warn('❌ Invalid stored user data, clearing...', parseError);
          localStorage.removeItem('user');
        }
      }

      // Then verify with server
      console.log('🌐 Making request to verify authentication...');
      const response = await fetch(`${API_BASE_URL}/api/user`, {
        credentials: 'include'
      });

      console.log('📡 Server response:', response.status, response.statusText);

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Authentication successful! User:', userData);
        setUser(userData);
        // Store user data for persistence
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        console.log('❌ Authentication failed, status:', response.status);
        setUser(null);
        localStorage.removeItem('user');
        // Immediately redirect on authentication failure
        console.log('🔄 Redirecting to login page...');
        setIsLoading(false); // Stop loading before redirect
        window.location.href = 'http://localhost:3000/login.html';
        return; // Exit early to prevent further execution
      }
    } catch (error) {
      console.error('💥 Auth check failed with error:', error);
      setUser(null);
      localStorage.removeItem('user');
      setIsLoading(false); // Stop loading before redirect
      console.log('🔄 Redirecting to login page due to error...');
      window.location.href = 'http://localhost:3000/login.html';
      return; // Exit early to prevent further execution
    } finally {
      setIsLoading(false);
      console.log('🏁 Authentication check completed');
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      window.location.href = 'http://localhost:3000/login.html';
    }
  };

  useEffect(() => {
    console.log('🔐 Authentication check ENABLED');
    // Add a small delay to ensure cookies are set properly after login redirect
    setTimeout(() => {
      checkAuth();
    }, 100);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  // Notifications state (empty by default)
  const [notifOpen, setNotifOpen] = useState(false);
  type Noti = { id: string; title: string; body?: string; time: string; read?: boolean };
  const [notifications, setNotifications] = useState<Noti[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ backgroundImage: 'linear-gradient(135deg, hsl(45, 30%, 96%) 0%, hsl(180, 15%, 88%) 100%)' }}>
      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-card to-secondary shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Map My Trip</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative" onClick={()=>setNotifOpen(true)} aria-label="Open notifications">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
              
              <div className="flex items-center space-x-3">
                {user && (
                  <span className="text-sm font-medium text-gray-700">
                    Welcome, {user.firstName}!
                  </span>
                )}
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <User className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Notification Drawer */}
      {notifOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30" onClick={()=>setNotifOpen(false)} />
          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-80 bg-background border-l border-border shadow-xl flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                <button
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={()=>setNotifications([])}
                  disabled={notifications.length===0}
                >
                  Clear All
                </button>
                <button className="text-sm" onClick={()=>setNotifOpen(false)} aria-label="Close">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-3 space-y-2">
              {notifications.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4">No notifications yet.</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="p-3 rounded-lg border border-border bg-card">
                    <div className="text-sm font-medium">{n.title}</div>
                    {n.body && <div className="text-xs text-muted-foreground mt-1">{n.body}</div>}
                    <div className="text-[10px] text-muted-foreground mt-1">{n.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <TripStateProvider>
      <main className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="lg:hidden">
          <DashboardHeader />
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome back, {user.firstName}!
              </h2>
              <p className="text-lg text-muted-foreground">
                Here's your coastal journey overview and quick actions.
              </p>
            </div>
            
            {/* Desktop Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Trip Overview */}
              <div className="space-y-6">
                <TripOverview />
                <QuickActions />
              </div>
              
              {/* Middle Column - Budget & Weather */}
              <div className="space-y-6">
                <BudgetTracker />
              </div>
              
              {/* Right Column - Additional Content */}
              <div className="space-y-6">
                {/* Recent Activity Card */}
                <div className="mobile-card p-4">
                  <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New trip planned</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">$</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Expense added</p>
                        <p className="text-xs text-gray-500">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bell className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Weather alert</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Stats Card */}
                <div className="mobile-card p-4">
                  <h3 className="font-semibold text-lg mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-indigo-50 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">3</div>
                      <div className="text-sm text-gray-600">Active Trips</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">12</div>
                      <div className="text-sm text-gray-600">Countries</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">58</div>
                      <div className="text-sm text-gray-600">Memories</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">$2.3k</div>
                      <div className="text-sm text-gray-600">Saved</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="space-y-4 pb-6">
            <TripOverview />
            <BudgetTracker />
            <QuickActions />
          </div>
        </div>
      </main>
      </TripStateProvider>
    </div>
  );
};

const LoadingScreen: React.FC = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
);

// Additional route components for future expansion
const TripsPage: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Trips</h1>
        <p className="text-gray-600">Manage and view all your trips here.</p>
        {/* Future: Add trip management components */}
      </div>
    </div>
  );
};

const BudgetPage: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Budget Management</h1>
        <BudgetTracker />
      </div>
    </div>
  );
};

const WeatherPage: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Weather Forecast</h1>
        <WeatherWidget />
      </div>
    </div>
  );
};

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <LoadingScreen />;
  }
  
  return <>{children}</>;
};

const App = () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/trips" element={
                <ProtectedRoute>
                  <TripsPage />
                </ProtectedRoute>
              } />
              <Route path="/budget" element={
                <ProtectedRoute>
                  <BudgetPage />
                </ProtectedRoute>
              } />
              <Route path="/weather" element={
                <ProtectedRoute>
                  <WeatherPage />
                </ProtectedRoute>
              } />
              <Route path="*" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
);

export default App;
