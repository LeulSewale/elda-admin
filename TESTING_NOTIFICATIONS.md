# 🧪 Testing Real-Time Notifications

## Quick Start Testing Guide

### 1. **Check SSE Connection**

Open your browser's Developer Console and look for these logs:

```
[SSE] Connecting to notification stream...
[SSE] Connection opened
```

If you see these, the connection is working! ✅

### 2. **Test from Browser Console**

You can manually test the notification system by opening the browser console:

```javascript
// Check connection status
window.__notificationDebug = true

// Get notification context (while on the app)
// Open console and check if notifications are being fetched
```

### 3. **Trigger Test Notification from Backend**

If you have access to the backend, trigger a test notification:

**Example Backend Code (Node.js/Express):**
```javascript
// Send a test notification via SSE
const testNotification = {
  id: crypto.randomUUID(),
  user_id: "YOUR_USER_ID",
  type: "ticket_assigned",
  title: "Test Notification",
  body: "This is a test notification from the backend",
  data: { ticket_id: "test-123" },
  link: "/tickets/test-123",
  is_read: false,
  read_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// Send to SSE client
res.write(`event: notification\n`)
res.write(`data: ${JSON.stringify(testNotification)}\n\n`)
```

### 4. **Visual Tests**

#### Test 1: Bell Icon Badge
1. Open the app
2. Check the bell icon in the header
3. If you have unread notifications, you should see a red badge with a number

#### Test 2: Open Dropdown
1. Click the bell icon
2. Should see:
   - List of notifications
   - Search bar
   - Connection status (Wifi icon - green if connected)
   - "Mark All Read" and "Clear All" buttons

#### Test 3: Click Notification
1. Click on an unread notification (has green dot)
2. Should:
   - Mark as read (green dot disappears)
   - Navigate to the link (if provided)
   - Decrease unread count

#### Test 4: Real-time Update
1. Keep the app open
2. Trigger a notification from backend (e.g., assign a ticket)
3. Should see:
   - Toast notification appear (bottom right)
   - Bell badge increment
   - Notification appear in dropdown (if open)

#### Test 5: Reconnection
1. Stop the backend server
2. Should see in console: `[SSE] Connection error`
3. Should see reconnection attempts
4. Restart backend
5. Should reconnect automatically

#### Test 6: Tab Switching
1. Open the app
2. Switch to another tab for 1-2 minutes
3. Trigger a notification while on another tab
4. Switch back to the app
5. Should refresh and show new notification

## 🐛 Common Issues & Solutions

### Issue 1: SSE Not Connecting
**Symptoms:** No `[SSE] Connection opened` in console

**Solutions:**
1. Check if backend is running: `curl https://elda-backend.onrender.com/api/v1/notifications/stream`
2. Check CORS settings on backend
3. Verify cookies are being sent (check Application > Cookies in DevTools)
4. Check if user is authenticated

### Issue 2: Notifications Not Appearing
**Symptoms:** SSE connected but no notifications show up

**Solutions:**
1. Check if backend is sending correct event format
2. Verify notification structure matches the Notification interface
3. Check console for JSON parse errors
4. Verify user_id matches logged-in user

### Issue 3: Unread Count Wrong
**Symptoms:** Badge shows wrong number

**Solutions:**
1. Check backend `/notifications/unread-count` endpoint
2. Verify `is_read` field is being updated correctly
3. Refresh the page to sync state

### Issue 4: Toast Not Showing
**Symptoms:** Notification received but no toast

**Solutions:**
1. Check if `useToast` is working
2. Verify Toaster component is in the layout
3. Check if notification is marked as read on arrival

## 📊 Backend Testing with cURL

### Test GET Notifications
```bash
curl -X GET "https://elda-backend.onrender.com/api/v1/notifications?limit=20&offset=0" \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test SSE Stream
```bash
curl -N -H "Cookie: access_token=YOUR_TOKEN" \
  "https://elda-backend.onrender.com/api/v1/notifications/stream"
```

### Test Mark as Read
```bash
curl -X POST "https://elda-backend.onrender.com/api/v1/notifications/NOTIFICATION_ID/read" \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test Mark All as Read
```bash
curl -X POST "https://elda-backend.onrender.com/api/v1/notifications/read-all" \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test Get Unread Count
```bash
curl -X GET "https://elda-backend.onrender.com/api/v1/notifications/unread-count" \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test Delete Notification
```bash
curl -X DELETE "https://elda-backend.onrender.com/api/v1/notifications/NOTIFICATION_ID" \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

## 🔍 Browser DevTools Inspection

### Check Network Tab
1. Open DevTools > Network
2. Filter by "stream"
3. Should see a connection to `/notifications/stream` with status "200 OK" and Type "eventsource"
4. Click on it to see SSE events in real-time

### Check Application Tab
1. Open DevTools > Application > Cookies
2. Verify `access_token` and `refresh_token` are present
3. These are needed for SSE authentication

### Check Console Tab
Look for these key logs:
- `[SSE] Connecting to notification stream...`
- `[SSE] Connection opened`
- `[SSE] Received notification: {...}`
- `[Notifications] Failed to fetch unread count:` (if error)

## 🎯 Test Scenarios Checklist

- [ ] Initial load shows correct unread count
- [ ] SSE connects successfully on login
- [ ] Notifications load in dropdown
- [ ] Can search notifications
- [ ] Can mark individual notification as read
- [ ] Can mark all as read
- [ ] Can delete individual notification
- [ ] Can clear all notifications
- [ ] Real-time notification appears as toast
- [ ] Real-time notification increments badge
- [ ] Connection status indicator shows green when connected
- [ ] Reconnection works after network failure
- [ ] Tab switching refreshes notifications
- [ ] Clicking notification navigates to link
- [ ] Pagination/infinite scroll works
- [ ] Connection reconnects on page focus

## 📱 Mobile Testing

Test on mobile browsers:
1. Chrome mobile
2. Safari mobile (iOS)
3. Firefox mobile

**Note:** Some mobile browsers may not support EventSource. The code handles this gracefully.

## 🚀 Production Checklist

Before deploying to production:

- [ ] SSE endpoint is secured with authentication
- [ ] CORS is properly configured
- [ ] Rate limiting is in place
- [ ] Error logging is set up
- [ ] Backend has proper reconnection handling
- [ ] Notification types are documented
- [ ] Load testing completed
- [ ] Mobile browser compatibility verified
- [ ] Connection timeout is appropriate
- [ ] Backend can handle multiple concurrent SSE connections

## 📝 Test Report Template

```
Date: _____________
Tester: _____________
Environment: [ ] Dev [ ] Staging [ ] Production

Test Results:
1. SSE Connection: [ ] Pass [ ] Fail
2. Load Notifications: [ ] Pass [ ] Fail
3. Real-time Updates: [ ] Pass [ ] Fail
4. Mark as Read: [ ] Pass [ ] Fail
5. Delete: [ ] Pass [ ] Fail
6. Reconnection: [ ] Pass [ ] Fail
7. Tab Switching: [ ] Pass [ ] Fail
8. Mobile: [ ] Pass [ ] Fail [ ] N/A

Issues Found:
___________________________________
___________________________________

Notes:
___________________________________
___________________________________
```

---

Happy Testing! 🎉

If you encounter any issues not covered here, check the console logs and network tab for more details.

