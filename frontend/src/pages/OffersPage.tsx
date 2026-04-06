import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  TrendingDown, 
  Calendar, 
  Info,
  CheckCircle2,
  Leaf,
  Scale,
  X,
  ArrowRight,
  Filter,
  ArrowUpDown,
  ChevronDown
} from "lucide-react";
import { useState, useMemo } from "react";
import { Card, Button, Badge } from "../components/UI";
import { MOCK_LOAN_OFFERS } from "../data/mockData";
import { formatCurrency, formatPercent, cn } from "../lib/utils";
import { LoanOffer } from "../types";

type SortKey = 'interestRate' | 'creditLimit' | 'esgAdjustment' | 'none';
type SortOrder = 'asc' | 'desc';

export function OffersPage() {
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('none');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [minCreditLimit, setMinCreditLimit] = useState<number>(0);
  const [maxInterestRate, setMaxInterestRate] = useState<number>(20);

  const toggleOfferSelection = (id: string) => {
    setSelectedOffers(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredAndSortedOffers = useMemo(() => {
    let result = [...MOCK_LOAN_OFFERS];

    // Filtering
    result = result.filter(offer => 
      offer.creditLimit >= minCreditLimit && 
      offer.interestRate <= maxInterestRate
    );

    // Sorting
    if (sortBy !== 'none') {
      result.sort((a, b) => {
        const valA = a[sortBy] as number;
        const valB = b[sortBy] as number;
        if (sortOrder === 'asc') return valA - valB;
        return valB - valA;
      });
    }

    return result;
  }, [sortBy, sortOrder, minCreditLimit, maxInterestRate]);

  const selectedData = MOCK_LOAN_OFFERS.filter(o => selectedOffers.includes(o.id));

  const getBestValue = (key: keyof LoanOffer, type: 'min' | 'max') => {
    if (selectedData.length < 2) return null;
    const values = selectedData.map(o => o[key] as number);
    return type === 'min' ? Math.min(...values) : Math.max(...values);
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-soft">Lender Offers</h1>
          <p className="text-slate-muted">Based on your ESG score of 845, we've found {filteredAndSortedOffers.length} tailored offers.</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedOffers.length > 0 && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setShowComparison(true)}
              disabled={selectedOffers.length < 2}
            >
              <Scale className="mr-2 h-4 w-4" />
              Compare {selectedOffers.length} Offers
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="bg-white/5 border-white/10 p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-indigo-primary" />
            <span className="text-sm font-medium text-slate-muted">Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-muted uppercase tracking-wider">Min Credit Limit</label>
              <select 
                value={minCreditLimit}
                onChange={(e) => setMinCreditLimit(Number(e.target.value))}
                className="bg-navy-deep border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-soft focus:outline-none focus:ring-1 focus:ring-indigo-primary/50"
              >
                <option value={0}>Any</option>
                <option value={500000}>₹5L+</option>
                <option value={1000000}>₹10L+</option>
                <option value={2000000}>₹20L+</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-muted uppercase tracking-wider">Max Interest Rate</label>
              <select 
                value={maxInterestRate}
                onChange={(e) => setMaxInterestRate(Number(e.target.value))}
                className="bg-navy-deep border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-soft focus:outline-none focus:ring-1 focus:ring-indigo-primary/50"
              >
                <option value={20}>Any</option>
                <option value={12}>Under 12%</option>
                <option value={10}>Under 10%</option>
                <option value={9}>Under 9%</option>
              </select>
            </div>

            <div className="h-6 w-px bg-white/10 mx-2" />

            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-indigo-primary" />
              <label className="text-xs text-slate-muted uppercase tracking-wider">Sort By</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="bg-navy-deep border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-soft focus:outline-none focus:ring-1 focus:ring-indigo-primary/50"
              >
                <option value="none">Default</option>
                <option value="interestRate">Interest Rate</option>
                <option value="creditLimit">Credit Limit</option>
                <option value="esgAdjustment">ESG Adjustment</option>
              </select>
              {sortBy !== 'none' && (
                <button 
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-muted hover:text-slate-soft transition-colors"
                >
                  <ChevronDown className={cn("h-4 w-4 transition-transform", sortOrder === 'desc' ? "rotate-180" : "")} />
                </button>
              )}
            </div>
          </div>

          <button 
            onClick={() => {
              setSortBy('none');
              setSortOrder('asc');
              setMinCreditLimit(0);
              setMaxInterestRate(20);
            }}
            className="ml-auto text-xs font-medium text-slate-muted hover:text-indigo-primary transition-colors"
          >
            Reset All
          </button>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedOffers.map((offer, i) => {
          const isSelected = selectedOffers.includes(offer.id);
          return (
            <Card 
              key={offer.id} 
              className={cn(
                "group relative flex flex-col overflow-hidden border-white/5 transition-all",
                isSelected ? "border-indigo-primary/50 ring-1 ring-indigo-primary/20" : "hover:border-indigo-primary/30"
              )}
            >
              {offer.interestRate < 10 && (
                <div className="absolute -right-12 top-6 rotate-45 bg-indigo-primary px-12 py-1 text-[10px] font-bold text-white uppercase tracking-widest">
                  Best ESG Value
                </div>
              )}

              <div className="absolute left-4 top-4 z-10">
                <input 
                  type="checkbox" 
                  checked={isSelected}
                  onChange={() => toggleOfferSelection(offer.id)}
                  className="h-5 w-5 rounded border-white/10 bg-white/5 text-indigo-primary focus:ring-indigo-primary/50"
                />
              </div>
              
              <div className="mb-6 flex items-center gap-4 pl-8">
                <img src={offer.lenderLogo} alt={offer.lenderName} className="h-12 w-12 rounded-xl" />
                <div>
                  <h3 className="font-bold text-slate-soft">{offer.lenderName}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-muted">
                    <ShieldCheck className="h-3 w-3" />
                    Verified Lender
                  </div>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-muted uppercase tracking-wider">Interest Rate</p>
                  <p className="text-2xl font-bold text-slate-soft">{offer.interestRate}%</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-xs text-slate-muted uppercase tracking-wider">Credit Limit</p>
                  <p className="text-2xl font-bold text-indigo-primary">₹{offer.creditLimit / 100000}L</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-muted uppercase tracking-wider">Tenure</p>
                  <p className="text-lg font-semibold text-slate-soft">{offer.tenureMonths} Months</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-xs text-slate-muted uppercase tracking-wider">ESG Adjustment</p>
                  <p className="text-lg font-semibold text-cyan-accent">
                    {offer.esgAdjustment > 0 ? "+" : ""}{offer.esgAdjustment}%
                  </p>
                </div>
              </div>

              <div className="mb-6 space-y-3 rounded-xl bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-muted">Processing Fee</span>
                  <span className="text-slate-soft">0.5%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-muted">Prepayment Penalty</span>
                  <span className="text-slate-soft">Nil</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold border-t border-white/5 pt-2">
                  <span className="text-slate-muted">Monthly EMI</span>
                  <span className="text-indigo-primary">₹{Math.round(offer.creditLimit / offer.tenureMonths).toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <Button className="w-full">Accept Offer</Button>
                <Button variant="ghost" size="sm" className="w-full">View Details</Button>
              </div>
            </Card>
          );
        })}
        {filteredAndSortedOffers.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-zinc-500 mb-4">
              <Filter className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white">No offers found</h3>
            <p className="text-zinc-400">Try adjusting your filters to see more results.</p>
            <Button 
              variant="ghost" 
              className="mt-4"
              onClick={() => {
                setSortBy('none');
                setSortOrder('asc');
                setMinCreditLimit(0);
                setMaxInterestRate(20);
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      <Card className="bg-indigo-primary/5 border-indigo-primary/20">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-primary/20 text-indigo-primary">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-soft">How ESG Adjustments Work</h4>
            <p className="text-sm text-slate-muted">
              Lenders on JustThryve offer lower interest rates to businesses with higher ESG scores. 
              Your current score of 845 has unlocked an average discount of 0.65% across all offers.
            </p>
          </div>
        </div>
      </Card>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparison && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComparison(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-navy-deep shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 p-6">
                <div className="flex items-center gap-3">
                  <Scale className="h-6 w-6 text-indigo-primary" />
                  <h2 className="text-xl font-bold text-slate-soft">Compare Loan Offers</h2>
                </div>
                <button 
                  onClick={() => setShowComparison(false)}
                  className="rounded-full p-2 text-slate-muted hover:bg-white/5 hover:text-slate-soft"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="overflow-x-auto p-6">
                <table className="w-full min-w-[600px] text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="pb-6 pt-2 font-medium text-slate-muted">Feature</th>
                      {selectedData.map(offer => (
                        <th key={offer.id} className="pb-6 pt-2 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <img src={offer.lenderLogo} alt="" className="h-10 w-10 rounded-lg" />
                            <span className="text-sm font-bold text-slate-soft">{offer.lenderName}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { label: "Interest Rate", key: "interestRate", suffix: "%", type: 'min' },
                      { label: "Credit Limit", key: "creditLimit", prefix: "₹", type: 'max' },
                      { label: "Tenure", key: "tenureMonths", suffix: " Months", type: 'max' },
                      { label: "ESG Adjustment", key: "esgAdjustment", suffix: "%", type: 'min' },
                    ].map((row) => {
                      const bestVal = getBestValue(row.key as keyof LoanOffer, row.type as 'min' | 'max');
                      return (
                        <tr key={row.key} className="group">
                          <td className="py-6 text-sm font-medium text-slate-muted">{row.label}</td>
                          {selectedData.map(offer => {
                            const val = offer[row.key as keyof LoanOffer] as number;
                            const isBest = val === bestVal;
                            return (
                              <td key={offer.id} className="py-6 text-center">
                                <span className={cn(
                                  "inline-block rounded-full px-3 py-1 text-lg font-bold",
                                  isBest ? "bg-indigo-primary/10 text-indigo-primary" : "text-slate-soft"
                                )}>
                                  {row.prefix}{row.key === 'creditLimit' ? (val / 100000).toFixed(1) + 'L' : val}{row.suffix}
                                </span>
                                {isBest && (
                                  <p className="mt-1 text-[10px] font-bold text-indigo-primary uppercase tracking-widest">Best</p>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                    <tr>
                      <td className="py-8 text-sm font-medium text-slate-muted">Action</td>
                      {selectedData.map(offer => (
                        <td key={offer.id} className="py-8 text-center">
                          <Button size="sm">Select Offer</Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Selection Bar */}
      <AnimatePresence>
        {selectedOffers.length > 0 && !showComparison && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-6 rounded-full border border-white/10 bg-navy-deep/80 px-8 py-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {selectedData.map(offer => (
                  <img 
                    key={offer.id} 
                    src={offer.lenderLogo} 
                    className="h-8 w-8 rounded-full border-2 border-navy-deep" 
                    alt="" 
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-slate-soft">
                {selectedOffers.length} {selectedOffers.length === 1 ? 'offer' : 'offers'} selected
              </p>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedOffers([])}
                className="text-sm font-medium text-slate-muted hover:text-slate-soft"
              >
                Clear
              </button>
              <Button 
                size="sm" 
                disabled={selectedOffers.length < 2}
                onClick={() => setShowComparison(true)}
              >
                Compare Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
