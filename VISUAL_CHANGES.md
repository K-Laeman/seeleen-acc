# Visual Changes Guide

## Color Scheme Transformation

### Before (Orange Theme)
```
Primary: #ed7519 (orange-600)
Accent: Orange shades
```

### After (Green Theme)
```
Primary: #22c55e (emerald-500)
Accent: Green shades with status colors
```

## Component-by-Component Changes

### 1. Sidebar

#### Before
- White background
- Simple logo area
- Basic navigation links
- User info at bottom

#### After
- **Green gradient header** (from-primary-600 to-primary-500)
- **User avatar** with initials in header
- **Enhanced navigation** with active indicators
- **Mobile hamburger menu** with overlay
- **Improved visual hierarchy**

Visual Structure:
```
┌──────────────────────┐
│ 🍗 Fired Chicken    │ ← Green gradient background
│    ระบบบัญชี         │
│ ──────────────────  │
│ [A] Admin User      │ ← Avatar circle with initial
│     ผู้ดูแลระบบ      │
├──────────────────────┤
│ • แดชบอร์ด          │ ← Active item has green bg + dot
│   รายรับ             │
│   รายจ่าย            │
│   งบกำไรขาดทุน        │
├──────────────────────┤
│ [→] ออกจากระบบ      │
└──────────────────────┘
```

### 2. Dashboard Cards

#### Before
```
┌─────────────────┐
│ Title           │
│ ฿123,456        │
│ subtitle        │
└─────────────────┘
Simple white card with icon
```

#### After
```
┌─────────────────────┐
│ Title (colored)  📊 │ ← Colored icon in rounded bg
│                     │
│ ฿123,456           │ ← Larger, bolder text
│                     │
│ Details             │ ← Additional context
│ • Count info        │
└─────────────────────┘
Gradient background (green/orange/red/blue)
```

**Four Card Color Schemes:**
1. **Net Income:** `from-green-50 to-emerald-50` + green icon
2. **Platform Fees:** `from-orange-50 to-amber-50` + orange icon
3. **Expenses:** `from-red-50 to-pink-50` + red icon
4. **Net Profit:** `from-blue-50 to-indigo-50` (or red if negative)

### 3. Income/Expense Tables

#### Before
```
┌────────────────────────────────────────────┐
│ วันที่ | ช่องทาง | รายละเอียด | จำนวน | ... │
├────────────────────────────────────────────┤
│ Basic rows with text badges               │
│ Text action buttons                       │
└────────────────────────────────────────────┘
Simple gray header, white rows
```

#### After
```
┌────────────────────────────────────────────┐
│ GRADIENT HEADER (gray-50 to gray-100)     │
│ BOLD UPPERCASE LABELS                      │
├────────────────────────────────────────────┤
│ 15 มี.ค. 2568 | [หน้าร้าน] | ... | [✎][🗑] │ ← Badge + icon buttons
│ Hover: light gray background              │
├────────────────────────────────────────────┤
│ Empty State: Icon + Message               │
├────────────────────────────────────────────┤
│ FOOTER TOTALS (gradient background)       │
└────────────────────────────────────────────┘
```

**Table Features:**
- **Header:** Gradient background, semibold uppercase text
- **Rows:** Hover effect, consistent padding
- **Badges:** Color-coded rounded pills
- **Actions:** Icon buttons with hover backgrounds
- **Footer:** Bold totals with gradient background
- **Empty State:** Centered illustration with helpful message

### 4. Summary Cards (Income/Expense Pages)

#### Income Summary (3 Cards)
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ รายรับรวม    │ │ ค่าธรรมเนียม │ │ รายรับสุทธิ   │
│ Blue gradient│ │Orange gradient│ │Green gradient│
│              │ │              │ │              │
│ ฿500,000    │ │ -฿50,000    │ │ ฿450,000    │
│         [📈] │ │         [📉] │ │         [✓]  │
└──────────────┘ └──────────────┘ └──────────────┘
```

#### Expense Summary (Single Large Card)
```
┌─────────────────────────────────────────┐
│ รายจ่ายรวม                    [💰]      │
│ ฿300,000                                │
│                                         │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│ │วัตถุ│ │ค่าเช│ │น้ำไฟ│ │พนง.│ │อื่นๆ│   │
│ │ดิบ │ │า   │ │     │ │    │ │    │   │
│ └────┘ └────┘ └────┘ └────┘ └────┘   │
│  Top 5 categories with amounts         │
└─────────────────────────────────────────┘
Red gradient background
```

### 5. Filter Bar

#### Before
```
กรองตามช่องทาง: [Dropdown ▼]
Inline text and select
```

#### After
```
┌─────────────────────────────────────────┐
│ [🔍] กรองตามช่องทาง:    [Dropdown ▼]  │
└─────────────────────────────────────────┘
White card with shadow, icon, better spacing
```

### 6. Badges

#### Income Source Badges
- **หน้าร้าน:** Yellow badge (warning)
- **GrabFood:** Green badge (success)
- **LINE MAN:** Teal badge (teal)

#### Expense Category Badges
- **วัตถุดิบ:** Red badge (error)
- **ค่าเช่า:** Orange badge (warning)
- **ค่าแรงพนักงาน:** Green badge (success)
- **การตลาด:** Blue badge (info)
- **อุปกรณ์:** Purple badge
- **ซ่อมบำรุง:** Pink badge
- Others: Teal, cyan, gray

### 7. Action Buttons

#### Primary Button (Add Income/Expense)
```
Before: Simple orange button
After:  Green button with shadow
        [+] เพิ่มรายรับ
        Hover: Darker green + elevated shadow
```

#### Icon Buttons (Edit/Delete)
```
Before: Text links
        แก้ไข | ลบ

After:  Icon-only buttons with hover background
        [✎] [🗑]
        Hover: Light colored background
```

### 8. Empty States

#### Before
```
ยังไม่มีรายการ
Simple text
```

#### After
```
     [📄 Large Icon]

     ยังไม่มีรายการรายรับ
     คลิก "เพิ่มรายรับ" เพื่อเริ่มต้นบันทึก

Centered, with icon and helpful instruction
```

## Spacing & Typography Changes

### Headings
- **Before:** `text-2xl` (24px)
- **After:** `text-3xl` (30px)

### Card Padding
- **Before:** `p-4` (16px)
- **After:** `p-6` (24px) with hover effects

### Table Cells
- **Before:** `px-6 py-3`
- **After:** `px-6 py-4` (more breathing room)

### Shadows
- **Before:** Basic `shadow-sm`
- **After:** Custom shadows
  - `shadow-card`: Subtle for cards
  - `shadow-elevated`: Pronounced for hover/active

## Responsive Behavior

### Mobile (< 640px)
- Sidebar becomes overlay with hamburger menu
- Cards stack vertically
- Table scrolls horizontally
- Reduced padding (p-4)

### Tablet (640px - 1024px)
- 2-column grid for metric cards
- Sidebar visible but narrower
- Medium padding (p-6)

### Desktop (> 1024px)
- 4-column grid for metric cards
- Full sidebar always visible
- Maximum padding (p-8)
- Max width 1600px, centered

## Animation & Transitions

### Hover Effects
```css
/* Cards */
hover:shadow-elevated transition-shadow

/* Buttons */
hover:bg-primary-700 transition-all

/* Table Rows */
hover:bg-gray-50 transition-colors

/* Icon Buttons */
hover:bg-primary-50 transition-colors
```

### Mobile Menu
```css
/* Sidebar slide-in */
transform transition-transform duration-200 ease-in-out

/* Overlay fade-in */
bg-black bg-opacity-50
```

## Color Usage Guidelines

### When to Use Each Color

**Green (Primary)**
- Primary actions (add buttons)
- Net income displays
- Success states
- Active navigation items

**Red**
- Expenses
- Delete actions
- Negative values
- Error states

**Orange**
- Platform fees
- Warning states
- In-store sales (amber variant)

**Blue**
- Gross income/revenue
- Info messages
- Positive profit

**Gray**
- Neutral elements
- Borders
- Disabled states
- Secondary text

## Accessibility Features

### Focus Indicators
```css
focus:outline-none focus:ring-2 focus:ring-primary-500
```

### Color Contrast
- All text: Minimum 4.5:1 ratio
- Large text (≥18pt): Minimum 3:1 ratio
- Icons with background: Proper contrast

### Keyboard Navigation
- All buttons: Tab-accessible
- Dropdowns: Arrow key navigation
- Modals: Escape to close

## Print Styles (Future Enhancement)
```css
@media print {
  /* Hide sidebar, filters */
  /* Show only tables and summaries */
  /* Black and white friendly */
}
```

## Icon System

Using Heroicons (outline style):
- **Dashboard:** Home icon
- **Income:** Currency dollar icon
- **Expenses:** Wallet icon
- **P&L:** Chart bar icon
- **Edit:** Pencil icon
- **Delete:** Trash icon
- **Filter:** Funnel icon
- **Add:** Plus icon
- **Sign Out:** Logout icon

## Component States

### Button States
1. **Default:** Primary color
2. **Hover:** Darker shade + shadow
3. **Active:** Even darker
4. **Disabled:** 50% opacity
5. **Focus:** Ring indicator

### Card States
1. **Default:** shadow-card
2. **Hover:** shadow-elevated
3. **Active:** (same as hover)

### Table Row States
1. **Default:** White background
2. **Hover:** Gray-50 background
3. **Selected:** (future: primary-50)

This comprehensive visual guide helps understand every design decision in the redesign!
