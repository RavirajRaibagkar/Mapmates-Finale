# Connection & Chat System Fixes

## Issues Fixed

### 1. Duplicate Connection Prevention
**Problem**: Users could try to connect with someone they're already friends with

**Solution**: 
- Added connection check before showing connect modal
- Checks both directions (user1→user2 and user2→user1)
- Shows "Already Connected" message if connection exists
- Provides direct "Go to Chat" button

**Implementation**:
```typescript
// In ConnectModal.tsx
const checkExistingConnection = async () => {
  const { data } = await supabase
    .from('connections')
    .select('*')
    .or(`and(user1_id.eq.${currentUser.id},user2_id.eq.${targetUser.id}),and(user1_id.eq.${targetUser.id},user2_id.eq.${currentUser.id})`)
    .eq('status', 'accepted');
  
  if (data && data.length > 0) {
    setIsAlreadyConnected(true);
  }
};
```

### 2. Bidirectional Chat Connections
**Problem**: Chat only showed connections where current user was user1

**Solution**:
- Fetch connections from both directions
- User can see chats whether they initiated or received connection
- Combines both result sets

**Implementation**:
```typescript
// Fetch where user is user1
const { data: connections1 } = await supabase
  .from('connections')
  .select('*, other_user:profiles!connections_user2_id_fkey(*)')
  .eq('user1_id', uid)
  .eq('status', 'accepted');

// Fetch where user is user2
const { data: connections2 } = await supabase
  .from('connections')
  .select('*, other_user:profiles!connections_user1_id_fkey(*)')
  .eq('user2_id', uid)
  .eq('status', 'accepted');

// Combine both
const allConnections = [...(connections1 || []), ...(connections2 || [])];
```

### 3. Persistent Notifications
**Problem**: Notification read status was lost on page refresh

**Solution**:
- Store notifications in localStorage
- Persist read/unread status
- Persist deletions
- Load from localStorage on page load

**Implementation**:
```typescript
// Save to localStorage
localStorage.setItem('mapmates_notifications', JSON.stringify(notifications));

// Load from localStorage
const stored = localStorage.getItem('mapmates_notifications');
if (stored) {
  setNotifications(JSON.parse(stored));
}
```

### 4. Message Persistence
**Problem**: Messages might not persist properly

**Solution**:
- Messages are stored in Supabase database
- Real-time subscription for new messages
- Proper connection_id linking
- Messages persist across sessions

**How it works**:
1. User sends message → Stored in `messages` table
2. Real-time listener detects new message
3. Message appears in chat instantly
4. Messages reload from database on page refresh

## Features

### Connection Modal States

#### State 1: Loading
- Shows spinner while checking connection status
- Prevents premature actions

#### State 2: Already Connected
- Green success message
- Shows user is already a friend
- "Go to Chat" button
- No game or connection options

#### State 3: Not Connected - Game Selection
- Option to play mini-game
- Option to skip for 20 Mapos
- Shows user stats (level, Mapos)

#### State 4: Playing Game
- Mini-game interface
- "Skip Game & Connect" button
- Completes connection on game finish

### Chat Features

#### Connection List
- Shows all connections (both directions)
- Displays user avatar emoji
- Shows username and level
- Highlights selected connection

#### Chat Interface
- **Locked State**: Shows lock icon, requires 20 Mapos to unlock
- **Unlocked State**: Full messaging interface
- Real-time message updates
- Place sharing feature
- Message history persists

#### Place Sharing
- Click MapPin icon to open place selector
- Shows top 6 places
- Click to share with formatted message
- Includes place name, description, and rating

### Notification Features

#### Notification Types
1. **Connection**: New friend requests
2. **Message**: New chat messages
3. **Place Approved**: Submitted place approved
4. **Reward**: Mapos earned
5. **Announcement**: System messages

#### Notification Actions
- **Mark as Read**: Individual notification
- **Mark All as Read**: All notifications at once
- **Delete**: Remove notification
- **Persist**: All actions saved to localStorage

#### Visual Indicators
- Unread notifications have purple border
- Unread count badge in header
- Different icons for each type
- Timestamp for each notification

## Database Schema

### Connections Table
```sql
connections (
  id uuid PRIMARY KEY,
  user1_id uuid REFERENCES profiles(id),
  user2_id uuid REFERENCES profiles(id),
  status text, -- 'pending', 'accepted', 'rejected'
  unlocked_at timestamp,
  created_at timestamp
)
```

### Messages Table
```sql
messages (
  id uuid PRIMARY KEY,
  connection_id uuid REFERENCES connections(id),
  sender_id uuid REFERENCES profiles(id),
  content text,
  created_at timestamp
)
```

## User Flow

### Connecting with Someone

1. **Click on user marker on map**
2. **Connection modal opens**
   - If already connected → Shows "Already Connected" + Go to Chat button
   - If not connected → Shows game options
3. **Choose action**:
   - Play game → Complete game → Connected
   - Skip (20 Mapos) → Instant connection
   - Skip during game → Instant connection
4. **Redirect to chat** after connection

### Chatting

1. **Go to Chat page**
2. **See all connections** (from both directions)
3. **Select a connection**
4. **If locked**:
   - Pay 20 Mapos to unlock
   - Shows current Mapos balance
   - Button disabled if insufficient funds
5. **If unlocked**:
   - Send messages
   - Share places
   - Real-time updates
   - Message history persists

### Notifications

1. **Click bell icon** in dashboard
2. **View all notifications**
3. **Unread notifications** have purple border
4. **Actions**:
   - Click checkmark to mark as read
   - Click X to delete
   - Click "Mark all as read" button
5. **Changes persist** across sessions

## Testing Checklist

### Connection System
- [ ] Click on user shows modal
- [ ] Modal checks existing connection
- [ ] Already connected shows correct message
- [ ] "Go to Chat" button works
- [ ] Game option works
- [ ] Skip option works (costs 20 Mapos)
- [ ] Skip during game works
- [ ] Connection created successfully
- [ ] Redirects to chat after connection

### Chat System
- [ ] Shows all connections (both directions)
- [ ] Can select connection
- [ ] Locked chat shows lock screen
- [ ] Unlock button works (costs 20 Mapos)
- [ ] Unlocked chat shows messages
- [ ] Can send messages
- [ ] Messages appear in real-time
- [ ] Messages persist on refresh
- [ ] Place sharing works
- [ ] Shared places show correctly

### Notification System
- [ ] Notifications load from localStorage
- [ ] Unread count shows correctly
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Delete works
- [ ] Changes persist on refresh
- [ ] Different icons for types
- [ ] Timestamps display correctly

## Known Limitations

1. **Notifications**: Currently using mock data and localStorage
   - Future: Implement real notifications table in database
   - Future: Real-time notification updates

2. **Connection Requests**: Currently auto-accepted
   - Future: Add pending/accept/reject flow
   - Future: Notification for connection requests

3. **Message Read Status**: Not tracked
   - Future: Add read/unread status for messages
   - Future: Show "typing..." indicator

4. **Place Sharing**: Basic text format
   - Future: Rich message format with images
   - Future: Click to view place details

## Future Enhancements

1. **Connection Requests**
   - Pending state
   - Accept/Reject buttons
   - Notifications for requests

2. **Chat Features**
   - Message read receipts
   - Typing indicators
   - Image/photo sharing
   - Voice messages
   - Message reactions

3. **Notifications**
   - Database-backed notifications
   - Real-time push notifications
   - Notification preferences
   - Email notifications

4. **Group Chats**
   - Create groups
   - Group messaging
   - Group place sharing

5. **Advanced Features**
   - Video calls
   - Location sharing
   - Trip planning together
   - Shared wishlists

## Troubleshooting

### Issue: "Already Connected" not showing
**Solution**: Check database for connections in both directions
```sql
SELECT * FROM connections 
WHERE (user1_id = 'USER_A' AND user2_id = 'USER_B')
   OR (user1_id = 'USER_B' AND user2_id = 'USER_A');
```

### Issue: Chat not showing connections
**Solution**: Verify connections exist and are accepted
```sql
SELECT * FROM connections 
WHERE (user1_id = 'YOUR_ID' OR user2_id = 'YOUR_ID')
  AND status = 'accepted';
```

### Issue: Messages not persisting
**Solution**: Check messages table and connection_id
```sql
SELECT * FROM messages 
WHERE connection_id = 'CONNECTION_ID'
ORDER BY created_at DESC;
```

### Issue: Notifications not persisting
**Solution**: Check browser localStorage
```javascript
// In browser console
console.log(localStorage.getItem('mapmates_notifications'));
```

## API Reference

### Check Connection
```typescript
const { data } = await supabase
  .from('connections')
  .select('*')
  .or(`and(user1_id.eq.${user1},user2_id.eq.${user2}),and(user1_id.eq.${user2},user2_id.eq.${user1})`)
  .eq('status', 'accepted');
```

### Create Connection
```typescript
const { error } = await supabase
  .from('connections')
  .insert({
    user1_id: currentUser.id,
    user2_id: targetUser.id,
    status: 'accepted',
    unlocked_at: new Date().toISOString()
  });
```

### Send Message
```typescript
const { error } = await supabase
  .from('messages')
  .insert({
    connection_id: connectionId,
    sender_id: userId,
    content: message
  });
```

### Subscribe to Messages
```typescript
const channel = supabase
  .channel(`messages:${connectionId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `connection_id=eq.${connectionId}`
  }, (payload) => {
    // Handle new message
  })
  .subscribe();
```
