# Labels System - User Guide

## Overview

A comprehensive WhatsApp Business-style labels system for organizing and filtering conversations. This system allows you to categorize conversations with custom labels, making it easier to manage and prioritize your chats.

---

## Features

### 1. **Label Management (Settings)**

Navigate to **Settings > Business Tools** to access label management:

-   **View All Labels**: See all 8 predefined labels plus custom labels you've created
-   **Create New Labels**: Click "Create new label" to add custom labels (max 20 total)
-   **Edit Labels**: Click the edit icon to modify label name and color
-   **Delete Labels**: Remove labels you no longer need
-   **Color Picker**: Choose from 8 predefined colors for each label

#### Predefined Labels:

1. **New customer** (Blue)
2. **New order** (Green)
3. **Pending payment** (Yellow)
4. **Paid** (Green)
5. **Order complete** (Green)
6. **To do** (Orange)
7. **Important** (Red)
8. **Follow up** (Purple)

---

## How to Use Labels

### **Assigning Labels to Conversations**

#### Method 1: Right-Click Menu (Desktop)

1. In the sidebar conversation list, **right-click** on any conversation
2. A label assignment menu will appear
3. Click on any label to assign/remove it from the conversation
4. A checkmark (✓) indicates the label is assigned
5. Click the X or click outside to close the menu

#### Method 2: Long Press (Mobile - Future Implementation)

-   Long press on a conversation to open the label assignment menu
-   Same functionality as right-click

### **Viewing Label Pills**

-   Conversations with assigned labels show a small colored pill below the last message
-   Only the **first label** is displayed if multiple labels are assigned
-   The pill shows the label's color indicator and name

---

## Filtering Conversations by Labels

### **Label Filter Tabs** (Located below the search box)

#### **1. All Tab** (Default)

-   Shows all conversations regardless of labels
-   This is the default view when you open the app

#### **2. Critical Tab**

-   Shows conversations where **Takeover is ON**
-   Displays a badge count of critical conversations
-   Automatically updated when takeover is activated/deactivated
-   Red badge indicator for visibility

#### **3. Labels Dropdown**

-   Click the "Labels" button with chevron icon
-   Shows list of all available labels
-   Click any label to filter conversations by that label
-   Active filter is highlighted with a checkmark (✓)
-   Currently filtered label name appears on the button

### **Search + Filter Combination**

-   You can use the search box while a label filter is active
-   The search will only apply to conversations in the current filter
-   Example: Filter by "Important" label, then search for a customer name

---

## Label System Workflow

### **Typical Use Case: E-commerce Store**

1. **New Customer Inquiry**

    - Right-click conversation → Assign "New customer" label
    - Conversation appears in blue pill

2. **Customer Places Order**

    - Right-click → Remove "New customer"
    - Assign "New order" label (green)

3. **Waiting for Payment**

    - Change label to "Pending payment" (yellow)

4. **Payment Received**

    - Change to "Paid" label (green)

5. **Order Completed**

    - Update to "Order complete" label

6. **Follow-up Required**

    - Assign "Follow up" label for customer service

7. **Critical Issues**
    - Activate **Takeover** for immediate attention
    - Conversation automatically appears in "Critical" tab

---

## Managing Labels

### **Creating Custom Labels**

1. Go to **Settings > Business Tools**
2. Scroll to the "Labels" section
3. Click "Manage Labels"
4. Click "Create new label"
5. Enter label name (max 50 characters)
6. Choose a color from the palette
7. Click "Create"

### **Editing Labels**

1. Navigate to Labels Management
2. Click the edit icon (pencil) next to any label
3. Modify the name or color
4. Click "Save"

### **Deleting Labels**

1. Navigate to Labels Management
2. Click the trash icon next to the label
3. Confirm deletion
4. **Note**: All label assignments will be removed from conversations

### **Label Limitations**

-   **Maximum**: 20 labels per workspace
-   **Name Length**: 50 characters max
-   **Duplicate Names**: Not allowed
-   **Color Palette**: 8 predefined colors available

---

## Technical Details (For Developers)

### **Database Schema Required**

#### `labels` Table:

```sql
CREATE TABLE labels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL,
    workspace_id INTEGER REFERENCES workspaces(id),
    position INTEGER,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `conversation_labels` Junction Table:

```sql
CREATE TABLE conversation_labels (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    label_id INTEGER REFERENCES labels(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(conversation_id, label_id)
);
```

### **API Endpoints Needed**

| Method | Endpoint                                 | Description                    |
| ------ | ---------------------------------------- | ------------------------------ |
| GET    | `/api/labels`                            | Get all labels for workspace   |
| POST   | `/api/labels`                            | Create new label               |
| PUT    | `/api/labels/:id`                        | Update label                   |
| DELETE | `/api/labels/:id`                        | Delete label                   |
| POST   | `/api/labels/reorder`                    | Reorder labels                 |
| POST   | `/api/conversations/:id/labels`          | Assign label to conversation   |
| DELETE | `/api/conversations/:id/labels/:labelId` | Remove label from conversation |
| GET    | `/api/conversations?label=:labelId`      | Get conversations by label     |

### **Data Structure**

#### Label Object:

```javascript
{
    id: "label-123",
    name: "New customer",
    color: "#53BDEB",
    isDefault: true,
    position: 1
}
```

#### Conversation with Labels:

```javascript
{
    id: "conv-456",
    name: "John Doe",
    phone: "+1234567890",
    labels: [
        {
            id: "label-123",
            name: "New customer",
            color: "#53BDEB"
        }
    ],
    // ... other conversation fields
}
```

---

## Keyboard Shortcuts (Future Enhancement)

-   `Ctrl/Cmd + L`: Open label assignment for selected conversation
-   `Ctrl/Cmd + F`: Focus search + filter
-   `Ctrl/Cmd + 1-9`: Quick filter by label position

---

## UI Components

### **Created Components:**

1. `LabelPill.jsx` - Small colored pill display
2. `LabelDropdown.jsx` - Filter dropdown menu
3. `LabelAssignmentMenu.jsx` - Right-click assignment menu
4. `LabelsManagement.jsx` - Settings page for label CRUD

### **Updated Components:**

1. `Sidebar.jsx` - Added filter tabs, pills, right-click handler
2. `SettingsSidebar.jsx` - Added Labels entry
3. `SettingsPage.jsx` - Added Labels view routing
4. `QuickRepliesSettings.jsx` - Added Labels section

### **State Management:**

1. `useLabelsStore.js` - Label state and CRUD operations
2. `useChatStore.js` - Label assignment to conversations

---

## Best Practices

### **For Users:**

1. Create labels that match your workflow
2. Use the Critical tab for urgent conversations
3. Combine search with label filters for precise results
4. Regularly clean up unused labels
5. Use consistent color coding (e.g., red for urgent, green for complete)

### **For Developers:**

1. All label operations include optimistic updates
2. API calls are marked with TODO comments
3. Database migration instructions included in stores
4. Error handling with toast notifications
5. Proper PropTypes validation on all components

---

## Troubleshooting

### **Labels not showing?**

-   Ensure labels are created in Settings > Business Tools > Manage Labels
-   Check that `useLabelsStore.initializeDefaultLabels()` is called

### **Can't assign labels?**

-   Right-click functionality requires desktop browser
-   Ensure labels exist before trying to assign
-   Check browser console for errors

### **Filter not working?**

-   Clear search query and try again
-   Verify conversations have labels assigned
-   Check selectedLabelFilter state in dev tools

### **Maximum labels reached?**

-   Delete unused labels to free up space
-   Maximum of 20 labels per workspace

---

## Future Enhancements

1. **Drag and drop** label reordering
2. **Bulk label assignment** (select multiple conversations)
3. **Label analytics** (count of conversations per label)
4. **Custom color picker** (beyond predefined palette)
5. **Label templates** for different business types
6. **Export/Import** labels configuration
7. **Keyboard shortcuts** for quick access
8. **Mobile gestures** (swipe to assign labels)

---

## Support

For issues or feature requests:

1. Check this documentation first
2. Review console for error messages
3. Verify database schema is properly migrated
4. Ensure all API endpoints are implemented
5. Check that conversation objects include `labels` array

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**License**: MIT
