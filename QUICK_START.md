# PFOS Pre-Release Features - Quick Start Guide

Welcome to PFOS 1.5.0! This guide will help you quickly access and test all new features.

---

## 🔍 Global Search

### Access
- **Icon**: Click the search icon in the top-right navbar
- **Keyboard**: Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
- **Mobile**: Tap the search icon

### How to Use
1. Open search dialog using any method above
2. Start typing (e.g., "grocery", "account name")
3. Results appear grouped by type (Transactions, Accounts)
4. Use arrow keys to navigate or click to select
5. Press Enter to navigate to the item
6. Recent searches automatically saved

### Tips
- Recent searches appear when dialog is empty
- Clear recent searches with the trash icon
- Press Escape to close dialog
- Search is real-time as you type

---

## ⚡ Universal Quick Actions

### Access
- **Mobile**: Tap the blue floating action button (FAB) at bottom-right
- **Desktop**: FAB expands into full action sheet
- **Keyboard**: Use shortcuts (see below)

### 9 Quick Actions
1. **Add Expense** - `E` key
2. **Add Income** - `I` key
3. **Transfer** - `T` key
4. **Add Account** - `A` key
5. **Add Goal** - `G` key
6. **Add Investment** - `V` key
7. **Add Trade** - `D` key
8. **Add Reminder** - `R` key
9. **Add Subscription** - `S` key

### How to Use
1. Click FAB or use keyboard shortcut
2. Select action from expanded menu
3. Fill in the details
4. Save

### Tips
- Shortcuts work when action sheet is open
- Each action is color-coded for quick identification
- Actions organized by category
- Mobile: FAB sticks above navigation bar

---

## 💾 Backup & Restore

### Access
1. Click your profile in top-right navbar
2. Navigate to Settings
3. Look for "Data Management" section

### Export Data
1. Click "Export My Data"
2. Choose format:
   - **JSON** - Full backup including metadata
   - **CSV** - Transactions only (for spreadsheet import)
3. File automatically downloads
4. Name format: `pfos-backup-[date].json`

### Import Data
1. In Data Management section, click "Restore Backup"
2. Select previously exported JSON file
3. Confirm restoration
4. Data restored to your account

### What's Included
- ✅ Transactions
- ✅ Accounts
- ✅ Categories
- ✅ Goals
- ✅ Investments
- ✅ Reminders
- ✅ Backup metadata

### Important
- Backups are user-specific (only your data)
- Can only restore to your account
- No static data included
- All file transfers encrypted

---

## 🏥 System Diagnostics

### Access
- URL: `https://app.pfos.com/dashboard/diagnostics`
- **Warning**: Developer/QA access only

### What It Shows
1. **Firestore Status** - Database connection and response time
2. **Authentication** - Your user info and auth status
3. **Data Storage** - Collection counts and total size
4. **Notifications** - Notification API availability
5. **Offline Sync** - Offline persistence status
6. **Database Info** - Provider and configuration

### How to Use
1. Navigate to `/dashboard/diagnostics`
2. Review all status indicators (green = good, red = issue)
3. Click "Run Diagnostics" to refresh checks
4. Review debug information if needed

### Indicators
- 🟢 **Green** - System healthy/enabled
- 🔴 **Red** - System offline/error/disabled
- 🟡 **Yellow** - Warning/degraded

---

## ⚙️ QA Testing

### Access
- URL: `https://app.pfos.com/dashboard/qa`
- **Warning**: QA/Developer access only

### Automated Tests
Click "Run Tests" to check:
1. LocalStorage availability
2. Firebase configuration
3. Notification API support
4. Service Worker support
5. IndexedDB availability
6. Viewport meta tag
7. Dark mode CSS variables
8. Responsive design breakpoints
9. Console errors
10. Memory usage

### Manual Testing
Use the checklist provided to verify:
- Navigation functionality
- Global search works
- Quick actions work
- Dark theme consistent
- Mobile responsive
- Backup/export works
- Diagnostics page loads
- Logout works properly

### Target
- All 10 automated tests should pass ✅
- All manual checks should pass ✅

---

## 📱 Testing on Mobile

### Recommended Devices
- iPhone 12 (390x844)
- Samsung Galaxy S21 (360x800)
- Pixel 5 (393x851)
- Or use browser DevTools mobile emulation

### Key Features to Test
- [x] Bottom navigation visible
- [x] FAB accessible and functional
- [x] Global search works
- [x] Quick actions work
- [x] Touch targets adequate (44px+)
- [x] No horizontal scrolling
- [x] Readable font sizes
- [x] Modals display properly

### Browser DevTools
1. Open DevTools (F12)
2. Click device toggle (Cmd+Shift+M on Mac, Ctrl+Shift+M on Windows)
3. Select iPhone 12 preset
4. Test each feature

---

## 🚀 Performance Tips

### For Users
- Recent searches cached for instant access
- Global search optimized (70% faster)
- Transaction lists render 71% faster
- Dashboard loads 29% faster
- All optimizations automatic

### For Testers
- Monitor browser DevTools Performance tab
- Check Lighthouse score (target >90)
- Monitor memory (should not exceed 80MB)
- Test with throttled network

---

## 🐛 Troubleshooting

### Global Search Not Working
- [ ] Clear browser cache
- [ ] Try keyboard shortcut instead of icon
- [ ] Check browser console (F12) for errors
- [ ] Verify you're logged in

### Quick Actions Not Opening
- [ ] Check FAB is visible (scroll to bottom)
- [ ] Try keyboard shortcut instead
- [ ] Refresh page
- [ ] Check browser console for errors

### Backup Not Downloading
- [ ] Check browser allows downloads
- [ ] Verify you have storage space
- [ ] Try different format (JSON vs CSV)
- [ ] Check browser console for errors

### Diagnostics Shows Errors
- [ ] Click "Run Diagnostics" to refresh
- [ ] Check internet connection
- [ ] Verify Firestore is accessible
- [ ] Check browser console for details

### Performance Issues
- [ ] Clear browser cache
- [ ] Close other browser tabs
- [ ] Check available RAM
- [ ] Try in different browser
- [ ] Run Lighthouse audit

---

## ✅ Feature Checklist

### Week 1 Testing
- [ ] Global search works with keyboard shortcut
- [ ] Quick actions accessible from FAB
- [ ] Each quick action opens correct modal
- [ ] Keyboard shortcuts work for actions
- [ ] All dark theme colors consistent

### Week 2 Testing
- [ ] Backup export downloads successfully
- [ ] Backup includes all data types
- [ ] CSV export opens in spreadsheet
- [ ] Diagnostics page loads and shows status
- [ ] QA tests run and pass

### Week 3 Testing
- [ ] Performance improvements verified
- [ ] Mobile responsive on all sizes
- [ ] No console errors
- [ ] Capacitor compatible
- [ ] All features work offline

### Final Sign-Off
- [ ] All features working
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Ready for production

---

## 📞 Support

### Quick Help
- **Search not working?** Press Escape and try again
- **Actions frozen?** Refresh the page
- **Data missing?** Check your backup was created successfully
- **Errors?** Check browser console (F12)

### Getting More Help
1. Check `QA_CHECKLIST.md` for detailed test procedures
2. Review `PERFORMANCE_AUDIT.md` for optimization details
3. Read `IMPLEMENTATION_GUIDE.md` for architecture
4. Run `/dashboard/qa` for automated diagnostics

### Report Issues
When reporting issues, include:
- [ ] Browser name and version
- [ ] Device/screen size
- [ ] Steps to reproduce
- [ ] Screenshots if possible
- [ ] Browser console errors

---

## 🎉 What's New

### May 2026 Release
- 🔍 **Global Search** - App-wide search with Cmd+K
- ⚡ **Quick Actions** - 9 fast actions with shortcuts
- 💾 **Backup/Restore** - Export and import your data
- 🏥 **Diagnostics** - System health monitoring
- 🚀 **Performance** - ~70% faster operations
- ✅ **QA Tools** - Comprehensive testing framework

### Performance Improvements
- Search: 70% faster (~60ms)
- Transactions: 71% faster (~35ms)
- Dashboard: 29% faster (~1.5s)

### What's Preserved
- ✅ All Firestore data
- ✅ Authentication system
- ✅ Existing design
- ✅ Android navigation
- ✅ All reports
- ✅ All business logic

---

## 📚 Documentation

### For Users
- This Quick Start Guide (you are here!)
- Help tooltips in app

### For QA
- `QA_CHECKLIST.md` - Detailed test procedures
- `/dashboard/qa` - Automated test runner

### For Developers
- `IMPLEMENTATION_GUIDE.md` - Complete architecture
- `PERFORMANCE_AUDIT.md` - Optimization details
- `FILE_MANIFEST.md` - File listing and changes

### For Product Team
- `RELEASE_SUMMARY.md` - Executive summary
- `IMPLEMENTATION_GUIDE.md` - Deployment steps

---

## 🚀 Ready to Test?

### Start Here
1. Open PFOS in your browser
2. Click search icon or press `Cmd+K`
3. Try typing something
4. Click FAB to see quick actions
5. Visit Settings → Data Management for backup
6. Navigate to `/dashboard/qa` to run tests

### Pro Tips
- Use keyboard shortcuts for speed
- Test on both desktop and mobile
- Check `/dashboard/diagnostics` to verify system health
- Review documentation for detailed instructions

---

## Version Info
- **Release**: 1.5.0-pre-release
- **Date**: May 16, 2026
- **Status**: Ready for testing and QA
- **Features**: 7 major components

---

*Welcome to PFOS 1.5.0! We're excited about these new features and hope you enjoy testing them. Happy testing! 🎉*
