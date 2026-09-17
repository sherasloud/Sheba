# Admin Guide - Managing Bill Providers & Donation Recipients

## Quick Links

- **Admin Panel**: `/admin/manage-bill-donate`
- **Bill Page (Users)**: `/bill`
- **Donate Page (Users)**: `/donate`

## How to Add Bill Providers

1. **Go to Admin Panel**: `/admin/manage-bill-donate`
2. **Select "Bill Providers" Tab** (should be active by default)
3. **Click "Add Bill Provider" Button**
4. **Fill in the form:**
   - **Provider Name**: Short name (e.g., "DESCO", "DWASA")
   - **Full Name** (Optional): Complete name for display
   - **Category**: Select from:
     - Electricity
     - Water
     - Gas
     - Internet & TV
     - Mobile
   - **Customer Service Number**: Contact number for the provider (e.g., "16118")
5. **Click "Add"**

### Example Bill Providers to Add

```
Electricity:
- DESCO (16118)
- DPDC (16110)
- REB (16102)

Water:
- DWASA (16103)
- CWASA (16104)

Gas:
- Titas Gas (16105)

Internet:
- BTCL (121)

Mobile:
- Grameenphone Postpaid (121)
```

## How to Add Donation Recipients

1. **Go to Admin Panel**: `/admin/manage-bill-donate`
2. **Click "Donation Recipients" Tab**
3. **Click "Add Donation Recipient" Button**
4. **Fill in the form:**
   - **Organization Name**: Full name of charity/NGO
   - **Contact Number/Account**: Phone number or account for donations
5. **Click "Add"**

### Example Donation Recipients to Add

```
- Save The Children Bangladesh (01234567890)
- UNICEF Bangladesh (01234567891)
- Oxfam Bangladesh (01234567892)
- World Vision Bangladesh (01234567893)
- Islamic Relief Bangladesh (01234567894)
- Grameen Foundation (01234567895)
```

## How to Delete Items

1. **Go to Admin Panel**: `/admin/manage-bill-donate`
2. **Find the item you want to delete**
3. **Click the red trash icon** on the right side
4. **Confirm deletion** when prompted

## Viewing Data

### Users See Only Added Data

- **Bill Page**: Users can only see bill providers you've added. They can't see hardcoded fake providers.
- **Donate Page**: Users can only see donation recipients you've added. They can't see hardcoded fake charities.

### Current Bill Provider Count
Shows as "(n Bill Providers Added)"

### Current Donation Recipient Count
Shows as "(n Donation Recipients Added)"

## Field Requirements

### Bill Provider
- **Provider Name**: Required (cannot be empty)
- **Category**: Required (must select from dropdown)
- **Customer Service Number**: Required (this is what users will see)
- **Full Name**: Optional but recommended for better context

### Donation Recipient
- **Organization Name**: Required (cannot be empty)
- **Contact Number**: Required (phone or account number)

## Important Notes

⚠️ **Data Persistence**
- Currently data is stored in memory and resets when server restarts
- Should be migrated to Neon database for production use

✅ **What Users See**
- Only the bill providers/donation recipients you explicitly add
- No fake or placeholder data
- Clean, real data only

🔒 **Admin-Only Control**
- Only you can manage bill providers and donation recipients
- Users can't add, edit, or delete items
- Users can only select from your approved list

## Troubleshooting

### Items not appearing for users
- Refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Check if you clicked "Add" button
- Verify all required fields were filled

### Item disappeared after adding
- Check if server was restarted (data in memory resets)
- Try adding again

### Can't access admin panel
- Verify you're accessing `/admin/manage-bill-donate`
- Make sure you're logged in as admin

## Future Improvements

Planned features:
- [ ] Persist data to Neon database
- [ ] Edit existing bill providers/donation recipients
- [ ] Bulk import from CSV
- [ ] Search and filter in admin panel
- [ ] Category management
- [ ] Logo upload for bill providers
