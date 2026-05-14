'use client';
"use strict";
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
exports.RecurringTransactionsPage = RecurringTransactionsPage;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var currency_1 = require("@/src/lib/currency");
var useAccounts_1 = require("@/src/hooks/useAccounts");
var useRecurringTransactions_1 = require("@/src/hooks/useRecurringTransactions");
var RecurringTransactionModal_1 = require("./RecurringTransactionModal");
var FREQUENCY_LABEL = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
};
function RecurringTransactionsPage() {
    var _this = this;
    var _a = (0, react_1.useState)(false), open = _a[0], setOpen = _a[1];
    var accounts = (0, useAccounts_1.useAccounts)().accounts;
    var _b = (0, useRecurringTransactions_1.useRecurringTransactions)(), recurringTransactions = _b.recurringTransactions, recurringAlerts = _b.recurringAlerts, loading = _b.loading, saving = _b.saving, error = _b.error, saveRecurring = _b.saveRecurring, removeRecurring = _b.removeRecurring;
    var accountMap = (0, react_1.useMemo)(function () { return new Map(accounts.map(function (item) { return [item.id, item.name]; })); }, [accounts]);
    var totals = (0, react_1.useMemo)(function () {
        return recurringTransactions.reduce(function (sum, item) {
            if (!item.isActive)
                return sum;
            if (item.type === 'income')
                sum.income += item.amount;
            else if (item.type === 'expense')
                sum.expenses += item.amount;
            return sum;
        }, { income: 0, expenses: 0 });
    }, [recurringTransactions]);
    return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-800 dark:to-indigo-900 text-white px-4 pt-6 pb-7 rounded-b-3xl shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-indigo-100 text-xs mb-1">Recurring Finance</p>
            <h1 className="text-2xl font-bold">Automation</h1>
          </div>
          <button_1.Button size="sm" className="bg-white text-indigo-700 hover:bg-indigo-50" onClick={function () { return setOpen(true); }}>
            <lucide_react_1.Plus className="size-4"/>
          </button_1.Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-indigo-100">Templates</p>
            <p className="text-sm font-semibold">{recurringTransactions.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-indigo-100">Income</p>
            <p className="text-sm font-semibold">{(0, currency_1.formatCurrencyCompact)(totals.income)}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-indigo-100">Expense</p>
            <p className="text-sm font-semibold">{(0, currency_1.formatCurrencyCompact)(totals.expenses)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-3">
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <lucide_react_1.BellRing className="size-4 text-amber-500"/>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Upcoming Alerts</h2>
          </div>
          {recurringAlerts.length === 0 ? (<p className="text-xs text-gray-500 dark:text-gray-400">No payments due in the next 7 days.</p>) : (<div className="space-y-2">
              {recurringAlerts.slice(0, 4).map(function (alert) { return (<div key={"".concat(alert.recurringId, "-").concat(alert.dueDate.toISOString())} className="rounded-lg bg-gray-50 dark:bg-gray-700/60 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{alert.title}</p>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{(0, currency_1.formatCurrency)(alert.amount)}</p>
                  </div>
                  <p className={"text-[11px] mt-1 ".concat(alert.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400')}>
                    {alert.isOverdue ? "".concat(Math.abs(alert.daysUntilDue), " days overdue") : alert.daysUntilDue === 0 ? 'Due today' : "Due in ".concat(alert.daysUntilDue, " days")}
                  </p>
                </div>); })}
            </div>)}
        </section>

        {loading ? (<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            Loading recurring templates...
          </div>) : recurringTransactions.length === 0 ? (<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-900 dark:text-white">No recurring templates yet</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Set salary, rent, subscriptions, utilities, and EMI once.</p>
            <button_1.Button className="mt-4" onClick={function () { return setOpen(true); }}>Create Recurring</button_1.Button>
          </div>) : (recurringTransactions.map(function (item) {
            var _a;
            var isOverdue = new Date(item.nextRunDate) < new Date();
            return (<article key={item.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                      {item.type} • {item.category} • {FREQUENCY_LABEL[item.frequency]}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
                      From {accountMap.get(item.accountId) || 'Account'}{item.type === 'transfer' ? " \u2192 ".concat(accountMap.get((_a = item.toAccountId) !== null && _a !== void 0 ? _a : '') || 'Destination') : ''}
                    </p>
                  </div>
                  <button type="button" onClick={function () { return removeRecurring(item.id); }} className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <lucide_react_1.Trash2 className="size-4 text-gray-500"/>
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-700/60 p-2">
                    <p className="text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{(0, currency_1.formatCurrency)(item.amount)}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-700/60 p-2">
                    <p className="text-gray-500 dark:text-gray-400">Next</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{new Date(item.nextRunDate).toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-700/60 p-2">
                    <p className="text-gray-500 dark:text-gray-400">Interval</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">Every {item.interval}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    <lucide_react_1.Repeat2 className="size-3"/>
                    {FREQUENCY_LABEL[item.frequency]}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    <lucide_react_1.Clock3 className="size-3"/>
                    Reminder {item.reminderDaysBefore}d
                  </span>
                  {isOverdue ? (<span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      <lucide_react_1.AlertTriangle className="size-3"/>
                      Overdue
                    </span>) : null}
                </div>
              </article>);
        }))}

        {error ? (<div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>) : null}
      </div>

      <RecurringTransactionModal_1.RecurringTransactionModal open={open} onOpenChange={setOpen} saving={saving} onSave={function (payload) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, saveRecurring(payload)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }}/>
    </div>);
}
