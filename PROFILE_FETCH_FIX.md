# User Profile Fetch Error Fix

## Problem

Error: `Cannot coerce the result to a single JSON object` with HTTP 406 status

- Occurred when fetching user profile
- The `.single()` method failed because it couldn't find exactly one record

## Root Cause

The query was trying to fetch a user profile that:

1. Doesn't exist in the database yet
2. Or the user_id column mismatch

## Solution Implemented

### 1. **Removed `.single()` Call**

- Changed from `.select("*").eq(...).single()`
- To `.select("*").eq(...)`
- This allows handling 0, 1, or many results gracefully

### 2. **Added Fallback Logic**

- If no profile exists in database, return default values from auth metadata
- This prevents the app from crashing when profile doesn't exist yet

### 3. **Better Error Handling**

- Added console warnings when profile not found
- Gracefully creates a default profile object from Supabase auth data

### 4. **New Helper Function**

- `createUserProfileIfNotExists()` - Creates a user profile on first login
- Checks if profile exists before creating
- Properly handles metadata from auth object

## Files Modified

### `/src/services/authService.ts`

- Updated `getCurrentUserProfile()` method
- Removed `.single()` to allow 0+ results
- Added fallback to auth metadata
- Better error messages

### `/src/services/api.ts`

- Updated `getUserProfile()` to handle empty results
- Added `createUserProfileIfNotExists()` helper function
- Improved error handling

## How It Works Now

```
User Profile Request
    ↓
Query users table for user_id
    ↓
Found? → Return profile data
    ↓
Not Found? → Return default from auth metadata
    ↓
Success - App continues working
```

## Database Schema Expected

```sql
users {
  id: uuid (primary key)
  user_id: uuid (foreign key to auth.users)
  email: string
  firstname: string
  lastname: string
  phone: string
  address: string (optional)
  zip: string (optional)
  city: string (optional)
  state: string (optional)
  created_at: timestamp
  updated_at: timestamp
}
```

## Using the New Helper Function

To create a user profile on first login:

```typescript
import { createUserProfileIfNotExists } from "../services/api";

// In your login/signup handler
const authUser = await getCurrentUser();
await createUserProfileIfNotExists(authUser.id, authUser.email, {
  firstname: authUser.user_metadata?.firstname,
  lastname: authUser.user_metadata?.lastname,
  phone: authUser.user_metadata?.phone,
});
```

## Testing the Fix

1. Clear browser cache/local storage
2. Log in with your test account
3. Navigate to Profile page
4. Should load without 406 error
5. If profile exists - shows real data
6. If profile doesn't exist - shows default values from auth
7. Edit and save - creates/updates profile in database

## Next Steps

Consider adding to your signup flow:

```typescript
// After successful signup
const profile = await createUserProfileIfNotExists(
  newUser.id,
  newUser.email,
  userData,
);
```

This ensures profiles are created immediately on signup rather than on first profile view.
