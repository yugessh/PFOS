# PFOS Pre-Release QA Checklist

## Part 1: Navigation & Routing

### Dashboard Navigation
- [ ] Home dashboard loads without errors
- [ ] Month switcher works (Previous/Next buttons)
- [ ] Navigation to all dashboard sections works
- [ ] Sidebar navigation loads correctly on desktop
- [ ] Mobile bottom navigation displays correctly
- [ ] Breadcrumbs display correctly (if implemented)
- [ ] Back button works on all pages
- [ ] URL parameters are preserved on refresh
- [ ] 404 page displays for invalid routes

### Route Protection
- [ ] Unauthenticated users redirected to login
- [ ] Authenticated users cannot access login/register
- [ ] Session persists on page reload
- [ ] Logout works correctly
- [ ] Protected routes return to login after logout

## Part 2: Dark Theme Consistency

### Color Scheme
- [ ] All text is readable on dark background
- [ ] All buttons have sufficient contrast
- [ ] Borders are visible but not overwhelming
- [ ] Accent colors (mint green) are consistent throughout
- [ ] Cards have proper depth/elevation
- [ ] Hover states are visible on dark background
- [ ] Focus states are clearly visible (accessibility)

### Component Styling
- [ ] TopNavbar styled correctly
- [ ] Sidebar background is correct
- [ ] Modal/Sheet backgrounds match design
- [ ] Input fields styled correctly
- [ ] Tables have proper row styling
- [ ] Charts colors match dark theme
- [ ] Icons colors are consistent

### Responsive Dark Mode
- [ ] Dark mode works on mobile
- [ ] Dark mode works on tablet
- [ ] Dark mode works on desktop
- [ ] No light mode colors bleeding through
- [ ] CSS variables override Tailwind defaults

## Part 3: Sidebar Navigation

### Desktop Sidebar
- [ ] Sidebar displays all navigation items
- [ ] Active route highlighted correctly
- [ ] Icons display correctly
- [ ] Text labels are readable
- [ ] Hover states work
- [ ] Collapse/expand works (if implemented)
- [ ] Scrollable if content overflows

### Mobile Bottom Navigation
- [ ] Bottom nav shows on mobile
- [ ] 5 main items visible (as per repo notes)
- [ ] Active item highlighted
- [ ] Navigation works for all items
- [ ] No overlap with FAB
- [ ] Sticky positioning works correctly
- [ ] Touch targets are adequate (48px minimum)

## Part 4: Authentication & Logout

### Login Flow
- [ ] Login page loads
- [ ] Email input validation works
- [ ] Password input validation works
- [ ] Submit button enabled only with valid inputs
- [ ] Error messages display correctly
- [ ] Successful login redirects to dashboard
- [ ] Remember me works (if implemented)

### Logout
- [ ] Logout confirmation dialog displays
- [ ] Canceling logout returns to page
- [ ] Confirming logout clears session
- [ ] User data not visible after logout
- [ ] Cannot access protected routes after logout
- [ ] Redirects to login after logout

### Session Management
- [ ] Session persists on page reload
- [ ] Session persists in new tab
- [ ] Session ends on browser close (if set)
- [ ] Multiple tabs sync correctly
- [ ] Token refresh works
- [ ] Expired tokens handled gracefully

## Part 5: Settings Page

### Data Management
- [ ] Export JSON option visible
- [ ] Export CSV option visible
- [ ] Import/Restore option visible
- [ ] Backup metadata displays correctly
- [ ] Last backup date shows
- [ ] Last restore date shows (if available)

### Settings Navigation
- [ ] All settings sections load
- [ ] Settings don't scroll unexpectedly
- [ ] Save/Update buttons work
- [ ] Settings persist after reload
- [ ] Can navigate away and back to settings

## Part 6: Mobile Responsiveness

### Desktop (1920x1080+)
- [ ] Full sidebar visible
- [ ] Two-column layout where applicable
- [ ] Charts display properly
- [ ] Tables visible without horizontal scroll
- [ ] No overflow on any element

### Tablet (768px - 1024px)
- [ ] Layout adapts properly
- [ ] Sidebar collapses or stacks
- [ ] Touch targets are adequate
- [ ] No horizontal scrolling
- [ ] Readable text size

### Mobile (320px - 767px)
- [ ] Single column layout
- [ ] Bottom navigation visible
- [ ] FAB positioned correctly
- [ ] Modals/Sheets display fullscreen or as drawer
- [ ] Keyboard doesn't cover inputs
- [ ] Readable font sizes
- [ ] Touch targets adequate (44px minimum)
- [ ] No horizontal scrolling
- [ ] Status bar doesn't overlap content

### Landscape Mode
- [ ] Layout adapts to landscape
- [ ] No content cut off
- [ ] FAB repositioned if needed
- [ ] Inputs accessible
- [ ] Modals still modal (not forced fullscreen)

## Part 7: Capacitor Compatibility

### Android Platform
- [ ] App launches without crashes
- [ ] Navigation works
- [ ] Dialogs display correctly
- [ ] Keyboard appears for input
- [ ] Status bar color correct
- [ ] Hardware back button works
- [ ] Long-press gestures work
- [ ] Swipe gestures work (if implemented)
- [ ] Permissions requested correctly

### iOS Platform
- [ ] App launches without crashes
- [ ] Navigation works
- [ ] Safe area respected
- [ ] Notch doesn't cover content
- [ ] Keyboard appearance handled
- [ ] Status bar color correct
- [ ] Swipe gestures don't conflict

### Capacitor Features
- [ ] Offline persistence works
- [ ] Sync on reconnect works
- [ ] Notifications display (if implemented)
- [ ] File access works
- [ ] Camera access works (if used)
- [ ] Location access works (if used)

## Part 8: New Features Testing

### Part 1: Global Search
- [ ] Search dialog opens from icon
- [ ] Search dialog opens with Cmd+K
- [ ] Search dialog opens with Ctrl+K
- [ ] Keyboard navigation works (arrow keys)
- [ ] Recent searches display
- [ ] Search results group correctly
- [ ] Click on result navigates correctly
- [ ] Clear recent searches works
- [ ] No console errors

### Part 2: Universal Quick Actions
- [ ] FAB displays on mobile
- [ ] FAB expands to show actions
- [ ] All 9 actions visible
- [ ] Each action navigates correctly
- [ ] Keyboard shortcuts work (E, I, T, A, G, V, D, R, S)
- [ ] Actions sheet displays on desktop
- [ ] Touch targets adequate
- [ ] No console errors

### Part 3: Backup/Restore
- [ ] Export JSON downloads file
- [ ] Export CSV downloads file
- [ ] File is valid JSON/CSV
- [ ] Backup metadata displays
- [ ] Import file picker works
- [ ] Import processes file correctly
- [ ] Error messages display
- [ ] No console errors

### Part 4: Diagnostics
- [ ] Diagnostics page loads
- [ ] URL is `/dashboard/diagnostics`
- [ ] All status badges display
- [ ] Firestore connection shows
- [ ] Auth status shows
- [ ] Collection counts display
- [ ] Refresh button works
- [ ] No sensitive data exposed
- [ ] Debug info displays

## Part 9: Data Integrity

### Firestore
- [ ] Data saves correctly
- [ ] Data loads correctly
- [ ] No data loss on logout
- [ ] No data loss on refresh
- [ ] Offline changes sync on reconnect
- [ ] Duplicate data not created
- [ ] Deleted data removed correctly
- [ ] Updated data reflected correctly

### Local Storage
- [ ] Recent searches persist
- [ ] Backup metadata persists
- [ ] User preferences persist
- [ ] No sensitive data stored
- [ ] Clear data on logout
- [ ] Storage quota not exceeded

## Part 10: Performance

### Load Times
- [ ] Dashboard loads in < 3 seconds
- [ ] Search results < 500ms
- [ ] Page transitions smooth
- [ ] No janky animations
- [ ] No memory leaks
- [ ] CPU usage reasonable

### Lists Performance
- [ ] 100+ transactions load quickly
- [ ] Scrolling is smooth (60 FPS)
- [ ] No lag when filtering
- [ ] No lag when sorting

## Part 11: Accessibility

### Keyboard Navigation
- [ ] Tab key navigates through elements
- [ ] Tab order is logical
- [ ] Can submit forms with Enter
- [ ] Can close modals with Escape
- [ ] Keyboard shortcuts visible

### Screen Reader
- [ ] Page structure is semantic
- [ ] Images have alt text
- [ ] Buttons are labeled
- [ ] Inputs have labels
- [ ] Error messages associated with inputs
- [ ] Dynamic updates announced

### Color Contrast
- [ ] WCAG AA compliance
- [ ] Text readable without relying on color
- [ ] Color not sole method of conveying info

## Part 12: Error Handling

### Network Errors
- [ ] No console errors on bad network
- [ ] Offline functionality works
- [ ] Reconnection message displays
- [ ] Data syncs when reconnected
- [ ] User can retry failed operations

### Validation Errors
- [ ] Form validation messages clear
- [ ] Invalid inputs highlighted
- [ ] Can't submit invalid forms
- [ ] Error messages helpful
- [ ] Errors clear when fixed

### Edge Cases
- [ ] Handle empty states gracefully
- [ ] Handle null/undefined data
- [ ] Handle very long text (truncate/wrap)
- [ ] Handle missing images
- [ ] Handle API timeouts

## Part 13: Security

### Authentication
- [ ] Passwords never logged
- [ ] Sensitive data not in URLs
- [ ] Session tokens secure
- [ ] HTTPS enforced
- [ ] No hardcoded secrets

### Data
- [ ] User data isolated per account
- [ ] Can't access other users' data
- [ ] Firestore rules enforced
- [ ] No data exposure in errors
- [ ] Backups only for own data

## Part 14: Browser Compatibility

### Chrome/Chromium
- [ ] All features work
- [ ] No console errors
- [ ] Performance good

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Performance good

### Safari
- [ ] All features work
- [ ] No console errors
- [ ] Performance good

### Edge
- [ ] All features work
- [ ] No console errors
- [ ] Performance good

## Part 15: Documentation & Monitoring

### Code Quality
- [ ] No console.log statements in production code
- [ ] No debugger statements
- [ ] No commented-out code
- [ ] No TODO comments without context
- [ ] Type safety maintained
- [ ] No ESLint warnings

### Error Monitoring
- [ ] Sentry integrated (if using)
- [ ] Error tracking configured
- [ ] Source maps uploaded
- [ ] Alerts configured

### Analytics
- [ ] Key user flows tracked
- [ ] Performance metrics logged
- [ ] User engagement tracked
- [ ] Error rates monitored

## Sign-Off

### QA Lead
- [ ] Name: ________________
- [ ] Date: ________________
- [ ] All checks passed: Yes / No

### Developer Lead
- [ ] Issues addressed: Yes / No
- [ ] Name: ________________
- [ ] Date: ________________

### Product Owner
- [ ] Approved for release: Yes / No
- [ ] Name: ________________
- [ ] Date: ________________

## Notes
Use this section to document any issues found and their resolution status.
