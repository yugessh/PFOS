'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionsPage;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var AddTransactionModal_1 = require("@/src/components/transactions/AddTransactionModal");
var useTransactions_1 = require("@/src/hooks/useTransactions");
var useAccounts_1 = require("@/src/hooks/useAccounts");
var AuthContext_1 = require("@/src/context/AuthContext");
var transactions_service_1 = require("@/src/services/firestore/transactions.service");
var TransactionsFilterBar_1 = require("@/src/components/transactions/TransactionsFilterBar");
var TransactionsCalendar_1 = require("@/src/components/transactions/TransactionsCalendar");
var finance_1 = require("@/src/lib/finance");
var currency_1 = require("@/src/lib/currency");
var date_1 = require("@/lib/date");
var CATEGORY_ICON_MAP = {
    food: '🍽️',
    groceries: '🛒',
    transportation: '🛵',
    transport: '🛵',
    shopping: '🛍️',
    entertainment: '🎬',
    bills: '💡',
    utilities: '💡',
    health: '🏥',
    healthcare: '🏥',
    salary: '💰',
    freelance: '💼',
    investments: '📈',
    transfer: '↔️',
};
function categoryIcon(category) {
    var key = "".concat(category || '').toLowerCase().trim();
    return CATEGORY_ICON_MAP[key] || '📦';
}
function parseTransaction(raw) {
    var _a, _b;
    return __assign({ id: raw.id, description: raw.description || raw.notes || raw.category || 'Transaction', amount: Number(raw.amount || 0), type: raw.type === 'income' ? 'income' : raw.type === 'transfer' ? 'transfer' : 'expense', category: raw.category || 'Other', date: ((_b = (_a = raw.date) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) || new Date(raw.date || Date.now()), account: raw.accountId || raw.account || '' }, (raw.toAccount ? { toAccount: raw.toAccount } : {}));
}
function TransactionsPage() {
    var _this = this;
    var _a;
    var _b = (0, react_1.useState)(false), addOpen = _b[0], setAddOpen = _b[1];
    var _c = (0, react_1.useState)(function () { return new Date(); }), displayMonth = _c[0], setDisplayMonth = _c[1];
    var _d = (0, react_1.useState)('timeline'), viewMode = _d[0], setViewMode = _d[1];
    var _e = (0, react_1.useState)('monthly'), timeFilter = _e[0], setTimeFilter = _e[1];
    var _f = (0, react_1.useState)(function () { return (0, date_1.formatDate)(new Date()); }), selectedDate = _f[0], setSelectedDate = _f[1];
    var _g = (0, react_1.useState)('all'), categoryFilter = _g[0], setCategoryFilter = _g[1];
    var _h = (0, react_1.useState)('all'), accountFilter = _h[0], setAccountFilter = _h[1];
    var _j = (0, react_1.useState)([]), transactions = _j[0], setTransactions = _j[1];
    var _k = (0, react_1.useState)(false), filterLoading = _k[0], setFilterLoading = _k[1];
    var _l = (0, react_1.useState)(null), filterError = _l[0], setFilterError = _l[1];
    var auth = (0, AuthContext_1.useAuthContext)();
    var addTransaction = (0, useTransactions_1.useTransactions)().addTransaction;
    var accounts = (0, useAccounts_1.useAccounts)().accounts;
    var accountNameById = (0, react_1.useMemo)(function () {
        var map = new Map();
        accounts.forEach(function (account) { return map.set(account.id, account.name); });
        return map;
    }, [accounts]);
    var selectedDateObject = (0, react_1.useMemo)(function () { return new Date(selectedDate); }, [selectedDate]);
    var activeRange = (0, react_1.useMemo)(function () {
        if (viewMode === 'calendar') {
            return (0, finance_1.getMonthRange)(displayMonth.getFullYear(), displayMonth.getMonth() + 1);
        }
        if (timeFilter === 'daily') {
            return (0, finance_1.getDayRange)(selectedDateObject);
        }
        if (timeFilter === 'weekly') {
            return (0, finance_1.getWeekRange)(selectedDateObject);
        }
        return (0, finance_1.getMonthRange)(displayMonth.getFullYear(), displayMonth.getMonth() + 1);
    }, [displayMonth, selectedDateObject, timeFilter, viewMode]);
    (0, react_1.useEffect)(function () {
        if (viewMode === 'calendar') {
            setSelectedDate((0, date_1.formatDate)(new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1)));
        }
    }, [displayMonth, viewMode]);
    (0, react_1.useEffect)(function () {
        if (timeFilter !== 'monthly') {
            setSelectedDate((0, date_1.formatDate)(new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1)));
        }
    }, [timeFilter, displayMonth]);
    var loadTransactions = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var userId, response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    userId = (_a = auth === null || auth === void 0 ? void 0 : auth.user) === null || _a === void 0 ? void 0 : _a.uid;
                    if (!userId) {
                        setTransactions([]);
                        return [2 /*return*/];
                    }
                    setFilterLoading(true);
                    setFilterError(null);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, transactions_service_1.transactionsService.getUserTransactionsByRange(userId, activeRange.start, activeRange.end, {
                            accountId: accountFilter === 'all' ? undefined : accountFilter,
                            category: categoryFilter === 'all' ? undefined : categoryFilter,
                        }, { orderBy: { field: 'date', direction: 'desc' }, limit: 500 })];
                case 2:
                    response = _b.sent();
                    if (!response.success || !response.data) {
                        throw new Error(response.error || 'Failed to load transactions');
                    }
                    setTransactions(response.data.data.map(parseTransaction));
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    setFilterError((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || String(error_1));
                    setTransactions([]);
                    return [3 /*break*/, 5];
                case 4:
                    setFilterLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [(_a = auth === null || auth === void 0 ? void 0 : auth.user) === null || _a === void 0 ? void 0 : _a.uid, activeRange, accountFilter, categoryFilter]);
    (0, react_1.useEffect)(function () {
        void loadTransactions();
    }, [loadTransactions]);
    var onSaveTransaction = (0, react_1.useCallback)(function (tx) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, addTransaction(tx)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, loadTransactions()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [addTransaction, loadTransactions]);
    var monthLabel = (0, react_1.useMemo)(function () { return (0, finance_1.getMonthLabel)(displayMonth); }, [displayMonth]);
    var grouped = (0, react_1.useMemo)(function () { return (0, finance_1.groupTransactionsByDate)(transactions); }, [transactions]);
    var sortedDates = (0, react_1.useMemo)(function () { return Object.keys(grouped).sort(function (a, b) { return (a > b ? -1 : 1); }); }, [grouped]);
    var filteredTransactions = (0, react_1.useMemo)(function () {
        if (viewMode === 'calendar')
            return transactions;
        if (timeFilter === 'daily') {
            return transactions.filter(function (tx) { return (0, date_1.formatDate)(new Date(tx.date)) === selectedDate; });
        }
        if (timeFilter === 'weekly') {
            var _a = (0, finance_1.getWeekRange)(selectedDateObject), start_1 = _a.start, end_1 = _a.end;
            return transactions.filter(function (tx) {
                var date = new Date(tx.date);
                return date >= start_1 && date <= end_1;
            });
        }
        return transactions;
    }, [transactions, viewMode, timeFilter, selectedDate, selectedDateObject]);
    var _m = (0, react_1.useMemo)(function () { return (0, finance_1.computeTotals)(filteredTransactions); }, [filteredTransactions]), income = _m.income, expenses = _m.expenses, savings = _m.savings;
    var categories = (0, react_1.useMemo)(function () { return Array.from(new Set(transactions.map(function (tx) { return tx.category; }))).sort(); }, [transactions]);
    var selectedDayTransactions = (0, react_1.useMemo)(function () { return grouped[selectedDate] || []; }, [grouped, selectedDate]);
    var selectedDaySummary = (0, react_1.useMemo)(function () {
        return selectedDayTransactions.reduce(function (sum, tx) {
            if (tx.type === 'income')
                sum.income += tx.amount;
            if (tx.type === 'expense')
                sum.expenses += tx.amount;
            return sum;
        }, { income: 0, expenses: 0 });
    }, [selectedDayTransactions]);
    return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-28 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-teal-600 to-sky-700 dark:from-slate-900 dark:to-slate-800 text-white px-4 pt-6 pb-7 rounded-b-3xl shadow-lg">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-sky-100 text-xs mb-1">Daily finance timeline</p>
            <h1 className="text-3xl font-bold">{monthLabel}</h1>
          </div>
          <div className="rounded-3xl bg-white/15 px-3 py-2 text-right">
            <p className="text-[11px] text-sky-100">Visible total</p>
            <p className="text-lg font-semibold">{(0, currency_1.formatCurrencyCompact)(savings)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-3xl bg-white/10 p-3">
            <p className="text-[11px] text-sky-100">Income</p>
            <p className="text-sm font-semibold">{(0, currency_1.formatCurrencyCompact)(income)}</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-3">
            <p className="text-[11px] text-sky-100">Expense</p>
            <p className="text-sm font-semibold">{(0, currency_1.formatCurrencyCompact)(expenses)}</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-3">
            <p className="text-[11px] text-sky-100">Net</p>
            <p className="text-sm font-semibold">{(0, currency_1.formatCurrencyCompact)(income - expenses)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-4">
        <TransactionsFilterBar_1.TransactionsFilterBar monthLabel={monthLabel} viewMode={viewMode} timeFilter={timeFilter} categoryFilter={categoryFilter} accountFilter={accountFilter} categories={categories} accounts={accounts.map(function (account) { return ({ id: account.id, name: account.name }); })} onPreviousMonth={function () { return setDisplayMonth(function (current) { return new Date(current.getFullYear(), current.getMonth() - 1, 1); }); }} onNextMonth={function () { return setDisplayMonth(function (current) { return new Date(current.getFullYear(), current.getMonth() + 1, 1); }); }} onViewModeChange={function (mode) { return setViewMode(mode); }} onTimeFilterChange={function (value) { return setTimeFilter(value); }} onCategoryChange={function (value) { return setCategoryFilter(value); }} onAccountChange={function (value) { return setAccountFilter(value); }}/>

        {filterLoading ? (<div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm text-center text-sm text-gray-500 dark:text-gray-400">
            Loading your timeline...
          </div>) : null}

        {viewMode === 'calendar' ? (<>
            <TransactionsCalendar_1.TransactionsCalendar currentMonth={displayMonth} transactions={transactions} selectedDate={selectedDate} onSelectDate={function (dateKey) { return setSelectedDate(dateKey); }} onPreviousMonth={function () { return setDisplayMonth(function (current) { return new Date(current.getFullYear(), current.getMonth() - 1, 1); }); }} onNextMonth={function () { return setDisplayMonth(function (current) { return new Date(current.getFullYear(), current.getMonth() + 1, 1); }); }}/>

            <section className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Selected day</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-green-600 dark:text-green-400">+{(0, currency_1.formatCurrencyCompact)(selectedDaySummary.income)}</p>
                  <p className="text-red-600 dark:text-red-400">-{(0, currency_1.formatCurrencyCompact)(selectedDaySummary.expenses)}</p>
                </div>
              </div>

              {selectedDayTransactions.length === 0 ? (<p className="text-sm text-gray-500 dark:text-gray-400">No transactions on this day.</p>) : (<div className="space-y-3">
                  {selectedDayTransactions.map(function (tx) {
                    var accountName = accountNameById.get(tx.account) || 'Unknown';
                    var amountClass = tx.type === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : tx.type === 'transfer'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-red-600 dark:text-red-400';
                    var prefix = tx.type === 'income' ? '+' : tx.type === 'transfer' ? '↔' : '-';
                    return (<article key={tx.id} className="rounded-3xl border border-gray-100 bg-gray-50 px-4 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-11 w-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">{tx.type === 'income' ? '💰' : tx.type === 'transfer' ? '↔️' : categoryIcon(tx.category)}</div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{tx.description || tx.category}</p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{accountName} • {tx.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={"text-sm font-semibold ".concat(amountClass)}>{prefix}{(0, currency_1.formatCurrency)(tx.amount)}</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">{new Date(tx.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      </article>);
                })}
                </div>)}
            </section>
          </>) : (<div className="space-y-4">
            {sortedDates.length === 0 ? (<div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm text-center text-sm text-gray-500 dark:text-gray-400">
                No transactions found for this range.
              </div>) : (sortedDates.map(function (dateKey) {
                var dayTransactions = grouped[dateKey] || [];
                var daySummary = dayTransactions.reduce(function (sum, tx) {
                    if (tx.type === 'income')
                        sum.income += tx.amount;
                    if (tx.type === 'expense')
                        sum.expenses += tx.amount;
                    return sum;
                }, { income: 0, expenses: 0 });
                return (<section key={dateKey} className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(dateKey).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Net {(0, currency_1.formatCurrencyCompact)(daySummary.income - daySummary.expenses)}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                        <span className="text-green-600 dark:text-green-400">+{(0, currency_1.formatCurrencyCompact)(daySummary.income)}</span>
                        <span className="text-red-600 dark:text-red-400">-{(0, currency_1.formatCurrencyCompact)(daySummary.expenses)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {dayTransactions.map(function (tx) {
                        var accountName = accountNameById.get(tx.account) || 'Unknown account';
                        var amountClass = tx.type === 'income'
                            ? 'text-green-600 dark:text-green-400'
                            : tx.type === 'transfer'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-red-600 dark:text-red-400';
                        var prefix = tx.type === 'income' ? '+' : tx.type === 'transfer' ? '↔' : '-';
                        return (<article key={tx.id} className="flex items-center justify-between gap-3 rounded-3xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-11 w-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
                                {tx.type === 'income' ? '💰' : tx.type === 'transfer' ? '↔️' : categoryIcon(tx.category)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{tx.description || tx.category}</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{accountName} • {tx.category}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={"text-sm font-semibold ".concat(amountClass)}>{prefix}{(0, currency_1.formatCurrency)(tx.amount)}</p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">{new Date(tx.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </article>);
                    })}
                    </div>
                  </section>);
            }))}
          </div>)}

        {filterError ? (<div className="rounded-3xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200">
            {filterError}
          </div>) : null}
      </div>

      <button type="button" onClick={function () { return setAddOpen(true); }} aria-label="Add transaction" className="fixed bottom-24 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-xl transition-transform hover:scale-105 active:scale-95">
        <lucide_react_1.Plus className="size-6"/>
      </button>

      <AddTransactionModal_1.AddTransactionModal open={addOpen} onOpenChange={setAddOpen} onSave={onSaveTransaction}/>
    </div>);
}
