# Admin Dashboard Verification Walkthrough

This guide helps you verify the new Admin Dashboard and related features.

## Prerequisites

1.  **Run SQL Schema**: Ensure you have run the `supabase_schema.sql` script in your Supabase SQL Editor.
2.  **Create Admin User**:
    -   Sign up a new user (or use an existing one) in the app.
    -   Go to Supabase Table Editor -> `user_roles` table.
    -   Insert a row: `user_id` = [Your User ID], `role` = 'admin'.

## Verification Steps

### 1. Admin Access Control
-   [ ] Log out if currently logged in.
-   [ ] Try to access `http://localhost:8083/admin`.
-   [ ] **Expected**: You should be redirected to the login page or home page with an "Access denied" message.
-   [ ] Log in with your **Admin** account.
-   [ ] Navigate to `http://localhost:8083/admin`.
-   [ ] **Expected**: You should see the Admin Dashboard with statistics cards.

### 2. College Management
-   [ ] Navigate to **Colleges** tab in Admin Dashboard.
-   [ ] Click **Add College**.
-   [ ] Enter details (e.g., "Test College", "Test Location", "Engineering").
-   [ ] Click **Create**.
-   [ ] **Expected**: The new college should appear in the list.
-   [ ] Go to the public "Explore Colleges" page (`/colleges`).
-   [ ] **Expected**: "Test College" should be visible there.

### 3. Mentor Application Flow
-   [ ] Open an Incognito window (or log out).
-   [ ] Register a new account and go to "Register as Mentor".
-   [ ] Fill in the form and submit.
-   [ ] **Expected**: Success message "Application submitted!".
-   [ ] Switch back to your **Admin** account window.
-   [ ] Navigate to **Applications** tab.
-   [ ] **Expected**: You should see the new application with "pending" status.
-   [ ] Click the **Approve** (Checkmark) button.
-   [ ] **Expected**: Status changes to "approved".
-   [ ] Navigate to **Mentors** tab in Admin.
-   [ ] **Expected**: The new mentor should be listed.
-   [ ] Go to public "Mentors" page (`/mentors`).
-   [ ] **Expected**: The new mentor should be visible.

### 4. Booking History
-   [ ] As a student (non-admin), book a session with a mentor.
-   [ ] Log in as **Admin**.
-   [ ] Navigate to **Bookings** tab.
-   [ ] **Expected**: You should see the new booking record.

## Troubleshooting
-   **Missing Data**: If lists are empty, ensure you have run the SQL script to create tables and insert dummy data.
-   **Permission Errors**: Check the `user_roles` table in Supabase to ensure your user has the 'admin' role.
