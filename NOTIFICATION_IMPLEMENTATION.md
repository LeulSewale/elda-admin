# 🔔 Real-Time Notification System Implementation

## Overview
This document describes the implementation of the real-time notification system using Server-Sent Events (SSE) for the ELDA Frontend application.

## 🎯 Features Implemented

### 1. **Server-Sent Events (SSE) Integration**
- Real-time notification streaming from backend
- Automatic reconnection with exponential backoff
- Connection status indicator
- Handles tab visibility (reconnects when user returns)

### 2. **Notification Management**
- Fetch notifications with pagination
- Mark individual notifications as read
- Mark all notifications as read
- Delete individual notifications
- Clear all notifications
- Unread count badge
- Search/filter notifications

### 3. **UI Enhancements**
- Real-time toast notifications for new alerts
- Connection status indicator (Wifi icon)
- Type-based icons and badges
- Clickable notifications with navigation to related content
- Smooth loading states and error handling

## 📁 Files Modified

### 1. **lib/types.ts**
Updated `Notification` interface to match backend structure:
```typescript
export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  data?: Record<string, any>
  link?: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
  updated_at: string
}
```

### 2. **lib/api/notifications.ts**
- Updated API endpoints to match backend
- Added `createEventSource()` function for SSE connection
- Removed old pagination logic in favor of limit/offset

**Key Endpoints:**
- `GET /notifications?limit=20&offset=0` - Fetch notifications
- `GET /notifications/stream` - SSE connection
- `POST /notifications/:id/read` - Mark notification as read
- `POST /notifications/read-all` - Mark all notifications as read
- `DELETE /notifications/:id` - Delete notification
- `GET /notifications/unread-count` - Get unread count

### 3. **hooks/use-notifications.tsx**
Complete rewrite with:
- SSE connection management
- Auto-reconnection with exponential backoff (max 5 attempts)
- Tab visibility detection
- Context API for global notification state
- Real-time notification addition
- Optimistic UI updates

**Context Provides:**
- `unreadCount` - Number of unread notifications
- `notifications` - Array of all notifications
- `isConnected` - SSE connection status
- `refreshNotifications()` - Manually refresh notifications
- `markAsRead(id)` - Mark notification as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification(id)` - Delete notification

### 4. **components/modals/notifications-modal.tsx**
Complete rewrite with:
- Integration with notification context
- Type-based icons and styling
- Click-to-navigate functionality
- Infinite scroll support
- Connection status indicator
- Improved error handling

## 🚀 How It Works

### SSE Connection Flow

```
1. User logs in / Page loads
   ↓
2. NotificationsProvider mounts
   ↓
3. Fetch initial notifications (GET /notifications)
   ↓
4. Connect to SSE stream (GET /notifications/stream)
   ↓
5. Listen for real-time events
   ↓
6. On new notification → Update state + Show toast
   ↓
7. On disconnect → Attempt reconnection with backoff
```

### Reconnection Logic
- **Attempt 1:** Wait 1 second
- **Attempt 2:** Wait 2 seconds
- **Attempt 3:** Wait 4 seconds
- **Attempt 4:** Wait 8 seconds
- **Attempt 5:** Wait 16 seconds
- **Max Attempts Reached:** Stop reconnecting (user must refresh)

### Tab Visibility Handling
When user switches back to the tab:
1. Refresh notifications from API
2. Refresh unread count
3. Reconnect SSE if disconnected

## 🔧 Backend Requirements

Your backend should provide these endpoints:

### 1. GET `/notifications/stream`
**Response:** SSE stream
```
event: connected
data: Connected to notification stream

event: notification
data: {"id":"...", "user_id":"...", "type":"ticket_assigned", ...}
```

### 2. GET `/notifications?limit=20&offset=0`
**Response:**
```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "data": [
    {
      "id": "340971df-9713-4e69-bbce-1f43175ce771",
      "user_id": "9120866f-6c00-4d65-aeea-f63cccb763ca",
      "type": "ticket_assigned",
      "title": "Ticket assigned to you",
      "body": "You have been assigned a ticket.",
      "data": { "ticket_id": "..." },
      "link": "/tickets/...",
      "is_read": false,
      "read_at": null,
      "created_at": "2025-10-12T19:21:25.025Z",
      "updated_at": "2025-10-12T19:21:25.025Z"
    }
  ],
  "paging": {
    "limit": 20,
    "hasNextPage": false
  }
}
```

### 3. PATCH `/notifications/:id/read`
Mark notification as read

### 4. PATCH `/notifications/read-all`
Mark all user's notifications as read

### 5. DELETE `/notifications/:id`
Delete a notification

### 6. GET `/notifications/unread-count`
**Response:**
```json
{
  "success": true,
  "data": {
    "unread": 5
  }
}
```

## 🎨 Notification Types

The system supports various notification types with custom styling:

| Type | Icon | Color |
|------|------|-------|
| `ticket_assigned` | Bell | Blue |
| `ticket_created` | Bell | Blue |
| `ticket_updated` | Bell | Blue |
| `ticket_completed` | CheckCircle | Green |
| `request_approved` | CheckCircle | Green |
| `ticket_urgent` | AlertCircle | Yellow |
| `deadline_approaching` | AlertCircle | Yellow |
| `ticket_rejected` | AlertCircle | Red |
| `request_rejected` | AlertCircle | Red |
| Default | Info | Gray |

## 🧪 Testing

### Manual Testing Steps

1. **Initial Load**
   - Open browser console
   - Look for `[SSE] Connecting to notification stream...`
   - Should see `[SSE] Connection opened`

2. **Receive Notification**
   - Trigger a backend event (e.g., assign a ticket)
   - Should see toast notification appear
   - Unread badge should increment
   - Notification should appear in dropdown

3. **Mark as Read**
   - Click on a notification
   - Should navigate to link (if provided)
   - Notification should be marked as read
   - Unread count should decrement

4. **Reconnection**
   - Kill backend server
   - Should see reconnection attempts in console
   - Restart backend
   - Connection should be re-established

5. **Tab Visibility**
   - Switch to another tab for 30+ seconds
   - Trigger a notification
   - Switch back to the app tab
   - Should refresh notifications and show new ones

## 📊 Console Logs

The system provides detailed logging:

```
[SSE] Connecting to notification stream...
[SSE] Connection opened
[SSE] Received notification: {...}
[Notifications] Failed to fetch unread count: ...
[SSE] Connection error: ...
[SSE] Reconnecting in 2000ms (attempt 2/5)
```

## ⚙️ Configuration

SSE endpoint is configured in `lib/config.ts`:
```typescript
const API_BASE_URL = 'https://elda-backend.onrender.com/api/v1'
```

## 🐛 Troubleshooting

### Issue: SSE not connecting
**Solution:** Check browser console for CORS errors. Backend must allow credentials:
```javascript
res.setHeader('Access-Control-Allow-Credentials', 'true')
```

### Issue: Notifications not showing
**Solution:** Verify backend is sending correct event format:
```javascript
res.write(`event: notification\n`)
res.write(`data: ${JSON.stringify(notification)}\n\n`)
```

### Issue: Reconnection not working
**Solution:** Check if EventSource is supported:
```javascript
if (typeof EventSource === 'undefined') {
  console.error('EventSource not supported')
}
```

## 🔐 Security Considerations

1. **Authentication:** SSE connection uses `withCredentials: true` to send cookies
2. **CORS:** Backend must allow credentials and set appropriate CORS headers
3. **Rate Limiting:** Consider rate limiting SSE connections per user
4. **Data Validation:** Always validate notification data on frontend

## 🚀 Future Enhancements

- [ ] Browser push notifications (Web Push API)
- [ ] Sound notifications
- [ ] Notification preferences/settings
- [ ] Notification categories/filtering
- [ ] Mark as unread functionality
- [ ] Batch operations
- [ ] Notification history pagination
- [ ] Desktop notifications permission

## 📝 Notes

- SSE is preferred over WebSockets for one-way communication (server → client)
- EventSource automatically handles reconnection (but we added custom logic for better control)
- Notifications are stored in context for global access
- Toast notifications are shown automatically for new notifications
- The system gracefully handles disconnections and network issues

---

**Implementation Date:** October 12, 2025
**Version:** 1.0.0

