import React, { createContext, useContext, useMemo, useState } from 'react';

export type ActivityStatus = 'Confirmed' | 'Pending';

export interface Activity {
  id: string;
  title: string;
  time: string;
  location: string;
  status: ActivityStatus;
}

export interface Member {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string; // ISO YYYY-MM-DD
}

interface TripState {
  location: string;
  days: number;
  budget: number;
  planned: boolean;
  preferredTransport: string; // '', 'car', 'train', 'flight'
  members: Member[];
  activities: Activity[];
  expenses: Expense[];
  setLocation: (v: string) => void;
  setDays: (v: number) => void;
  setBudget: (v: number) => void;
  setPlanned: (v: boolean) => void;
  setPreferredTransport: (v: string) => void;
  addMember: (name: string) => void;
  removeMember: (id: string) => void;
  addActivity: (a: Omit<Activity, 'id'>) => void;
  removeActivity: (id: string) => void;
  addExpense: (e: Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;
}

const TripStateContext = createContext<TripState | undefined>(undefined);

export const TripStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<string>('Kochi, Kerala');
  const [days, setDays] = useState<number>(3);
  const [budget, setBudget] = useState<number>(50000);
  const [planned, setPlanned] = useState<boolean>(false);
  const [preferredTransport, setPreferredTransport] = useState<string>("");
  const [members, setMembers] = useState<Member[]>([
    { id: '1', name: 'You' },
    { id: '2', name: 'Sarah' },
    { id: '3', name: 'John' },
    { id: '4', name: 'Maya' },
  ]);
  const [activities, setActivities] = useState<Activity[]>([
    { id: '1', title: 'Fort Kochi Heritage Walk', time: '09:00 AM', location: 'Fort Kochi', status: 'Confirmed' },
    { id: '2', title: 'Backwater Cruise', time: '02:00 PM', location: 'Vembanad Lake', status: 'Pending' },
  ]);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 'e1', title: 'Hotel Booking - Grand Hotel', amount: 4500, category: 'Accommodation', date: '2025-09-15' },
    { id: 'e2', title: 'Flight Tickets', amount: 12000, category: 'Transportation', date: '2025-09-14' },
  ]);

  const value = useMemo<TripState>(() => ({
    location,
    days,
    budget,
    planned,
    preferredTransport,
    members,
    activities,
    expenses,
    setLocation,
    setDays,
    setBudget,
    setPlanned,
    setPreferredTransport,
    addMember: (name: string) => setMembers(prev => [...prev, { id: Date.now().toString(), name }]),
    removeMember: (id: string) => setMembers(prev => prev.filter(m => m.id !== id)),
    addActivity: (a) => setActivities(prev => [...prev, { id: Date.now().toString(), ...a }]),
    removeActivity: (id: string) => setActivities(prev => prev.filter(a => a.id !== id)),
    addExpense: (e) => setExpenses(prev => [...prev, { id: Date.now().toString(), ...e }]),
    removeExpense: (id: string) => setExpenses(prev => prev.filter(ex => ex.id !== id)),
  }), [location, days, budget, planned, preferredTransport, members, activities, expenses]);

  return (
    <TripStateContext.Provider value={value}>{children}</TripStateContext.Provider>
  );
};

export const useTripState = () => {
  const ctx = useContext(TripStateContext);
  if (!ctx) throw new Error('useTripState must be used within TripStateProvider');
  return ctx;
};
