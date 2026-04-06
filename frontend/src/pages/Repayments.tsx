import { Card, Badge, Button } from "../components/UI";
import { formatCurrency } from "../lib/utils";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export function Repayments() {
  const repayments = [
    { id: "rp_1", date: "Apr 01, 2026", amount: 97500, status: "Upcoming", type: "Auto-debit" },
    { id: "rp_2", date: "Mar 01, 2026", amount: 97500, status: "Paid", type: "Auto-debit" },
    { id: "rp_3", date: "Feb 01, 2026", amount: 97500, status: "Paid", type: "Auto-debit" },
    { id: "rp_4", date: "Jan 01, 2026", amount: 97500, status: "Paid", type: "Auto-debit" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-soft">Repayments</h1>
        <p className="text-slate-muted">Manage your loan repayments and flow-based ECS schedules.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-indigo-primary/5 border-indigo-primary/20">
          <p className="text-sm text-slate-muted">Total Repaid</p>
          <p className="text-2xl font-bold text-slate-soft">{formatCurrency(292500)}</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-white/5">
            <div className="h-full w-[12%] rounded-full bg-indigo-primary" />
          </div>
          <p className="mt-2 text-xs text-slate-muted">12% of total loan</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-muted">Remaining Balance</p>
          <p className="text-2xl font-bold text-slate-soft">{formatCurrency(2207500)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-muted">Next EMI Date</p>
          <p className="text-2xl font-bold text-indigo-primary">Apr 01, 2026</p>
        </Card>
      </div>

      <Card>
        <h3 className="mb-6 text-lg font-bold text-slate-soft">Payment History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs text-slate-muted uppercase tracking-wider">
                <th className="pb-4 font-medium">Date</th>
                <th className="pb-4 font-medium">Amount</th>
                <th className="pb-4 font-medium">Method</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {repayments.map((rp) => (
                <tr key={rp.id} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4 text-sm text-slate-soft">{rp.date}</td>
                  <td className="py-4 text-sm font-bold text-slate-soft">{formatCurrency(rp.amount)}</td>
                  <td className="py-4 text-sm text-slate-muted">{rp.type}</td>
                  <td className="py-4">
                    <Badge variant={rp.status === "Paid" ? "success" : "warning"}>
                      {rp.status}
                    </Badge>
                  </td>
                  <td className="py-4 text-right">
                    <Button variant="ghost" size="sm">Receipt</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-start gap-4 rounded-2xl bg-indigo-primary/5 border border-indigo-primary/20 p-6">
        <AlertCircle className="h-6 w-6 text-indigo-primary shrink-0" />
        <div>
          <h4 className="font-bold text-slate-soft">Flow-based Adjustment</h4>
          <p className="text-sm text-slate-muted">
            Your EMI is dynamically adjusted to 15% of your verified GST revenue. 
            If your revenue drops below threshold, your tenure will automatically extend to maintain healthy cash flows.
          </p>
        </div>
      </div>
    </div>
  );
}
