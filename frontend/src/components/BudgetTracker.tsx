import { DollarSign, Home, Utensils, MapPin, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BudgetTracker = () => {
  const budgetData = {
    totalBudget: 3500,
    totalSpent: 1250,
    categories: [
      { name: "Accommodation", spent: 650, budget: 1200, icon: Home },
      { name: "Food & Dining", spent: 320, budget: 800, icon: Utensils },
      { name: "Activities", spent: 180, budget: 600, icon: MapPin },
      { name: "Transportation", spent: 100, budget: 400, icon: Car },
    ],
    recentExpenses: [
      { description: "Hotel Booking - Grand Hotel", amount: 450, date: "Dec 10", category: "Accommodation" },
      { description: "Flight Tickets", amount: 200, date: "Dec 8", category: "Transportation" },
      { description: "Restaurant Dinner", amount: 85, date: "Dec 12", category: "Food" },
    ],
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
        <div className="p-4 bg-secondary rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm">Total Budget</h4>
            <span className="text-xl font-bold text-primary">${budgetData.totalBudget.toLocaleString()}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Spent: ${budgetData.totalSpent.toLocaleString()}</span>
              <span className="text-muted-foreground">Left: ${(budgetData.totalBudget - budgetData.totalSpent).toLocaleString()}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(budgetData.totalSpent / budgetData.totalBudget) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-muted-foreground text-sm">Category Breakdown</h4>
          {budgetData.categories.map((category, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <category.icon className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium text-sm">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ${category.spent} of ${category.budget}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{Math.round((category.spent / category.budget) * 100)}%</p>
                <div className="w-12 bg-muted rounded-full h-1 mt-1">
                  <div 
                    className="bg-primary h-1 rounded-full transition-all duration-300"
                    style={{ width: `${(category.spent / category.budget) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Expenses */}
        <div className="space-y-3">
          <h4 className="font-medium text-muted-foreground text-sm">Recent Expenses</h4>
          {budgetData.recentExpenses.map((expense, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">{expense.category.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{expense.description}</p>
                  <p className="text-xs text-muted-foreground">{expense.date} • {expense.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm text-destructive">-${expense.amount}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default BudgetTracker;