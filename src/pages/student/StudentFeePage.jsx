import { useMemo } from "react";
import { CreditCard, CheckCircle2, DollarSign, Upload, Calendar, Clock, Building2 } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { MetricCard, Card, StatusBadge, PageHeader, BranchBadge } from "../../components/shared";

export default function StudentFeePage() {
  const { branches } = useAppContext();
  const { user } = useAuth();
  const branchName = user?.branchName || user?.branches?.[0]?.name || "";

  const branchData = branches.find((b) => b.name === branchName);

  const totalFee = branchData?.totalFee ?? 0;
  const installmentsCount = branchData?.installmentsCount ?? 1;
  const dueDayValue = branchData?.dueDayValue ?? "—";

  const installmentPlan = useMemo(() => {
    if (!totalFee || installmentsCount < 1) return [];
    const base = Math.floor(totalFee / installmentsCount);
    const remainder = totalFee - base * installmentsCount;
    return Array.from({ length: installmentsCount }, (_, i) => ({
      number: i + 1,
      amount: i === 0 ? base + remainder : base,
    }));
  }, [totalFee, installmentsCount]);

  const paidCount = 1;
  const totalPaid = installmentPlan.length > 0 ? installmentPlan[0].amount : 0;
  const totalDue = totalFee - totalPaid;

  return (
    <div className="space-y-6">
      <PageHeader icon={CreditCard} title="Fee Status" subtitle="Your course fee installment breakdown" />

      {/* Branch-specific info banner */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
            <Clock size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-800 flex items-center gap-2">
              Payment Schedule
              <BranchBadge branch={branchName} />
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Your branch (<span className="font-semibold">{branchName}</span>) has a course fee of{" "}
              <span className="font-semibold">Rs. {totalFee.toLocaleString()}</span> divided into{" "}
              <span className="font-semibold">{installmentsCount} installment{installmentsCount > 1 ? "s" : ""}</span>.
              Due cycle: <span className="font-semibold">{dueDayValue}</span>.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard icon={CheckCircle2} label="Installments Paid" value={paidCount} color="green" sub={`out of ${installmentsCount}`} />
        <MetricCard icon={DollarSign} label="Balance Due" value={`Rs. ${totalDue.toLocaleString()}`} color="amber" sub="Remaining balance" />
        <MetricCard icon={CreditCard} label="Total Course Fee" value={`Rs. ${totalFee.toLocaleString()}`} color="blue" sub={`${installmentsCount} installments`} />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="text-left py-3 px-5 font-semibold">#</th>
                <th className="text-left py-3 px-5 font-semibold">Installment</th>
                <th className="text-left py-3 px-5 font-semibold">Amount</th>
                <th className="text-left py-3 px-5 font-semibold">Due Cycle</th>
                <th className="text-left py-3 px-5 font-semibold">Status</th>
                <th className="text-left py-3 px-5 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {installmentPlan.map((inst) => {
                const isPaid = inst.number <= paidCount;
                return (
                  <tr key={inst.number} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 text-slate-400 text-xs">{inst.number}</td>
                    <td className="py-3.5 px-5 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">{inst.number}</span>
                        Installment {inst.number}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">Rs. {inst.amount.toLocaleString()}</td>
                    <td className="py-3.5 px-5 text-slate-600">
                      <span className="inline-flex items-center gap-1.5"><Calendar size={12} className="text-slate-400" />{dueDayValue}</span>
                    </td>
                    <td className="py-3.5 px-5"><StatusBadge status={isPaid ? "Paid" : "Pending"} /></td>
                    <td className="py-3.5 px-5">
                      {isPaid ? (
                        <span className="text-xs text-slate-400 flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500" /> Confirmed</span>
                      ) : (
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer">
                          <Upload size={12} /> Upload Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-sm font-medium text-slate-600">Total Course Fee</span>
            <span className="text-xs text-slate-400 ml-2">({installmentsCount} installments · {branchName} branch)</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Paid</span>
              <span className="text-sm font-bold text-emerald-600">Rs. {totalPaid.toLocaleString()}</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Due</span>
              <span className="text-sm font-bold text-amber-600">Rs. {totalDue.toLocaleString()}</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total</span>
              <span className="text-lg font-bold text-slate-800">Rs. {totalFee.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
