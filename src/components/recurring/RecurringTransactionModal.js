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
exports.RecurringTransactionModal = RecurringTransactionModal;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var useAccounts_1 = require("@/src/hooks/useAccounts");
var FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'];
var TYPES = ['income', 'expense', 'transfer'];
function RecurringTransactionModal(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, onSave = _a.onSave, _b = _a.saving, saving = _b === void 0 ? false : _b;
    var accounts = (0, useAccounts_1.useAccounts)().accounts;
    var _c = (0, react_1.useState)(''), title = _c[0], setTitle = _c[1];
    var _d = (0, react_1.useState)('expense'), type = _d[0], setType = _d[1];
    var _e = (0, react_1.useState)(''), amount = _e[0], setAmount = _e[1];
    var _f = (0, react_1.useState)(''), category = _f[0], setCategory = _f[1];
    var _g = (0, react_1.useState)(''), accountId = _g[0], setAccountId = _g[1];
    var _h = (0, react_1.useState)(''), toAccountId = _h[0], setToAccountId = _h[1];
    var _j = (0, react_1.useState)('monthly'), frequency = _j[0], setFrequency = _j[1];
    var _k = (0, react_1.useState)('1'), interval = _k[0], setInterval = _k[1];
    var _l = (0, react_1.useState)(new Date().toISOString().slice(0, 10)), startDate = _l[0], setStartDate = _l[1];
    (0, react_1.useEffect)(function () {
        if (open && accounts.length > 0 && !accountId) {
            setAccountId(accounts[0].id);
            var fallbackTransfer = accounts.find(function (acc) { return acc.id !== accounts[0].id; });
            if (type === 'transfer' && fallbackTransfer) {
                setToAccountId(fallbackTransfer.id);
            }
        }
    }, [open, accounts, accountId, type]);
    var _m = (0, react_1.useState)(''), endDate = _m[0], setEndDate = _m[1];
    var _o = (0, react_1.useState)(''), notes = _o[0], setNotes = _o[1];
    var _p = (0, react_1.useState)('2'), reminderDaysBefore = _p[0], setReminderDaysBefore = _p[1];
    var _q = (0, react_1.useState)(null), error = _q[0], setError = _q[1];
    var destinationAccounts = (0, react_1.useMemo)(function () { return accounts.filter(function (acc) { return acc.id !== accountId; }); }, [accounts, accountId]);
    function handleSave() {
        return __awaiter(this, void 0, void 0, function () {
            var parsedAmount, intervalNumber, start;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setError(null);
                        if (!title.trim()) {
                            setError('Title is required');
                            return [2 /*return*/];
                        }
                        if (!accountId) {
                            setError('Select source account');
                            return [2 /*return*/];
                        }
                        if (type === 'transfer' && !toAccountId) {
                            setError('Select destination account');
                            return [2 /*return*/];
                        }
                        parsedAmount = Number(amount);
                        if (!parsedAmount || parsedAmount <= 0) {
                            setError('Enter a valid amount');
                            return [2 /*return*/];
                        }
                        if (type !== 'transfer' && !category.trim()) {
                            setError('Category is required');
                            return [2 /*return*/];
                        }
                        intervalNumber = Math.max(1, Math.trunc(Number(interval) || 1));
                        start = new Date(startDate || Date.now());
                        return [4 /*yield*/, onSave(__assign(__assign({ title: title.trim(), type: type, amount: parsedAmount, category: type === 'transfer' ? 'transfer' : category.trim(), accountId: accountId }, (type === 'transfer' ? { toAccountId: toAccountId } : {})), { frequency: frequency, interval: intervalNumber, startDate: start, nextRunDate: start, lastRunDate: null, endDate: endDate ? new Date(endDate) : null, notes: notes.trim(), currency: 'INR', reminderDaysBefore: Math.max(0, Math.trunc(Number(reminderDaysBefore) || 0)), isActive: true }))];
                    case 1:
                        _a.sent();
                        setTitle('');
                        setType('expense');
                        setAmount('');
                        setCategory('');
                        setAccountId('');
                        setToAccountId('');
                        setFrequency('monthly');
                        setInterval('1');
                        setStartDate(new Date().toISOString().slice(0, 10));
                        setEndDate('');
                        setNotes('');
                        setReminderDaysBefore('2');
                        onOpenChange(false);
                        return [2 /*return*/];
                }
            });
        });
    }
    if (!open)
        return null;
    return (<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Recurring Transaction</h2>
          <button type="button" onClick={function () { return onOpenChange(false); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <lucide_react_1.X className="size-5 text-gray-500"/>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Template Name</label>
            <input_1.Input value={title} onChange={function (event) { return setTitle(event.target.value); }} placeholder="Salary, Rent, EMI" className="mt-2"/>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {TYPES.map(function (value) { return (<button key={value} type="button" onClick={function () { return setType(value); }} className={"rounded-xl border px-3 py-2 text-sm font-medium capitalize transition-colors ".concat(value === type
                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-400'
                : 'bg-white border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300')}>
                {value}
              </button>); })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
              <input_1.Input value={amount} onChange={function (event) { return setAmount(event.target.value); }} inputMode="decimal" placeholder="10000" className="mt-2"/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <input_1.Input value={category} onChange={function (event) { return setCategory(event.target.value); }} placeholder={type === 'income' ? 'Salary' : type === 'expense' ? 'Utilities' : 'transfer'} className="mt-2" disabled={type === 'transfer'}/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Source Account</label>
              <select value={accountId} onChange={function (event) { return setAccountId(event.target.value); }} className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm dark:bg-gray-800 dark:border-gray-600">
                <option value="">Select</option>
                {accounts.map(function (acc) { return (<option key={acc.id} value={acc.id}>{acc.name}</option>); })}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Destination</label>
              <select value={toAccountId} onChange={function (event) { return setToAccountId(event.target.value); }} className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm dark:bg-gray-800 dark:border-gray-600" disabled={type !== 'transfer'}>
                <option value="">{type === 'transfer' ? 'Select' : 'Not required'}</option>
                {destinationAccounts.map(function (acc) { return (<option key={acc.id} value={acc.id}>{acc.name}</option>); })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</label>
              <select value={frequency} onChange={function (event) { return setFrequency(event.target.value); }} className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm dark:bg-gray-800 dark:border-gray-600">
                {FREQUENCIES.map(function (value) { return (<option key={value} value={value} className="capitalize">{value}</option>); })}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Every</label>
              <input_1.Input value={interval} onChange={function (event) { return setInterval(event.target.value); }} inputMode="numeric" className="mt-2"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
              <input_1.Input type="date" value={startDate} onChange={function (event) { return setStartDate(event.target.value); }} className="mt-2"/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
              <input_1.Input type="date" value={endDate} onChange={function (event) { return setEndDate(event.target.value); }} className="mt-2"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reminder (days before)</label>
              <input_1.Input value={reminderDaysBefore} onChange={function (event) { return setReminderDaysBefore(event.target.value); }} inputMode="numeric" className="mt-2"/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
              <input_1.Input value={notes} onChange={function (event) { return setNotes(event.target.value); }} placeholder="Optional" className="mt-2"/>
            </div>
          </div>

          {error ? (<div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
              {error}
            </div>) : null}
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3">
          <button_1.Button variant="outline" className="flex-1" onClick={function () { return onOpenChange(false); }} disabled={saving}>Cancel</button_1.Button>
          <button_1.Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Recurring'}
          </button_1.Button>
        </div>
      </div>
    </div>);
}
