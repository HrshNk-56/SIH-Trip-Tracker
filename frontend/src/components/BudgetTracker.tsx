import { DollarSign, Home, Utensils, MapPin, Car, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTripState } from "@/context/TripState";
import { useState, useMemo } from "react";

const BudgetTracker = () => {
  const { budget, expenses, addExpense, removeExpense } = useTripState();
  const [form, setForm] = useState({ title: '', amount: '', category: 'Accommodation', date: new Date().toISOString().slice(0,10) });

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + (e.amount || 0), 0), [expenses]);
  const categories = useMemo(() => {
    const agg: Record<string, number> = {};
    expenses.forEach(e => { agg[e.category] = (agg[e.category] || 0) + e.amount; });
    return agg;
  }, [expenses]);

  const handleAddExpense = () => {
    if (!form.title || !form.amount) return;
    addExpense({ title: form.title, amount: parseFloat(form.amount), category: form.category, date: form.date });
    setForm({ title: '', amount: '', category: 'Accommodation', date: new Date().toISOString().slice(0,10) });
  };

  return (
    <div className="mobile-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Budget Tracker</h3>
        </div>
        <Badge className="bg-success text-success-foreground text-xs">
          On Track
        </Badge>
      </div>
      <div className="space-y-4">

        {/* Budget Overview */}
        <div className="p-4 bg-secondary rounded-2xl" id="budget-tracker">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm">Total Budget</h4>
            <span className="text-xl font-bold text-primary">₹{budget.toLocaleString()}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Spent: ₹{totalSpent.toLocaleString()}</span>
              <span className="text-muted-foreground">Left: ₹{(budget - totalSpent).toLocaleString()}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalSpent / Math.max(1, budget)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Add Expense - available on itinerary page only; keeping component intact */}
        <div className="p-4 bg-card rounded-2xl border border-border" id="expense-form">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm">Add Expense</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <input value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} placeholder="Title" className="px-3 py-2 border rounded-lg bg-input text-foreground" />
            <input value={form.amount} onChange={(e)=>setForm({...form, amount:e.target.value})} placeholder="Amount (₹)" type="number" className="px-3 py-2 border rounded-lg bg-input text-foreground" />
            <select value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} className="px-3 py-2 border rounded-lg bg-input text-foreground">
              <option>Stay</option>
              <option>Food & Beverages</option>
              <option>Activities</option>
              <option>Transport</option>
              <option>Shopping</option>
              <option>Misc</option>
            </select>
            <input value={form.date} onChange={(e)=>setForm({...form, date:e.target.value})} type="date" className="px-3 py-2 border rounded-lg bg-input text-foreground" />
            <button onClick={handleAddExpense} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground flex items-center justify-center gap-2"><Plus className="w-4 h-4"/>Add</button>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-muted-foreground text-sm">Category Breakdown</h4>
          {Object.keys(categories).length === 0 && (
            <div className="text-xs text-muted-foreground">No expenses yet. Add your first expense above.</div>
          )}
          {Object.entries(categories).map(([name, spent]) => (
            <div key={name} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-primary" />
                <div>
                  <p className="font-medium text-sm">{name}</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{spent.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Expenses */}
        <div className="space-y-3">
          <h4 className="font-medium text-muted-foreground text-sm">Recent Expenses</h4>
          {expenses.slice().reverse().slice(0, 5).map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">{expense.category.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{expense.title}</p>
                  <p className="text-xs text-muted-foreground">{expense.date} • {expense.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-destructive">-₹{expense.amount.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default BudgetTracker;