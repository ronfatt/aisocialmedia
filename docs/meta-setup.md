# Meta Developer App Setup & Configuration Guide

This document outlines the exact steps to configure your Meta Developer App for **Facebook Page** and **Instagram Professional Account** connections in the Social Command Center platform.

---

## 1. Create a Meta Developer Application

1. Go to the [Meta for Developers Portal](https://developers.facebook.com/) and log in with your Facebook account.
2. Click **My Apps** $\to$ **Create App**.
3. When prompted for an app type, select **Business** (*"Manage business assets such as Pages, events, groups, ads, and Instagram accounts"*).
4. Enter an **App Name** (e.g. `Social Command Center`) and your business contact email.
5. Click **Create App**.

---

## 2. Add Required Meta Products

In your App Dashboard left sidebar under **Add Products**:

1. **Facebook Login for Business**:
   - Click **Set Up**.
   - Navigate to **Facebook Login for Business** $\to$ **Settings**.
   - Verify:
     - **Client OAuth Login**: `Yes`
     - **Web OAuth Login**: `Yes`
     - **Enforce HTTPS**: Set to `No` during local development on `localhost`; must be `Yes` in production.
   - Under **Valid OAuth Redirect URIs**, add:
     - **Local Development**: `http://localhost:3000/api/auth/callback/meta`
     - **Production**: `https://<your-production-domain>/api/auth/callback/meta`
   - Click **Save Changes**.

2. **Instagram Graph API**:
   - In the App Dashboard, click **Add Product** and locate **Instagram Graph API**.
   - Click **Set Up**.

---

## 3. Configure App Settings

Navigate to **Settings** $\to$ **Basic** in the left menu:

1. **App Domains**:
   - Development: `localhost`
   - Production: `<your-production-domain.com>`
2. **Privacy Policy URL**:
   - Provide a valid HTTPS URL (required before moving app to Live Mode or passing App Review).
3. **User Data Deletion**:
   - Data Deletion Request URL: `https://<your-domain>/api/meta/data-deletion` (or custom support page).
4. **Category**:
   - Select **Business and Pages**.
5. Copy your credentials:
   - **App ID** $\to$ copy into `META_APP_ID`
   - **App Secret** $\to$ click *Show* and copy into `META_APP_SECRET`

---

## 4. Permissions & App Review

### Required Permissions:
| Permission Name | Platform | Description | Review Required? |
| :--- | :--- | :--- | :--- |
| `pages_show_list` | Facebook | Allows app to discover Pages the user manages (`/me/accounts`). | Yes (for public users) |
| `pages_read_engagement` | Facebook | Required to read Page metadata and detect linked Instagram accounts. | Yes (for public users) |
| `pages_manage_posts` | Facebook | Enables publishing posts to connected Facebook Pages. | Yes (for public users) |
| `instagram_basic` | Instagram | Reads linked Instagram Professional account profiles (username, ID, avatar). | Yes (for public users) |
| `business_management` | Meta | Reads Meta Business Manager assets and permissions. | Yes (for public users) |

### Development Mode Restrictions:
- While your Meta App is in **Development Mode**:
  - Only users with designated roles in your Meta App (Admins, Developers, or Testers) can complete the OAuth flow.
  - External agency clients cannot connect their accounts until your app completes **Meta App Review** for Advanced Access and is toggled to **Live Mode**.
- **Adding Test Users & Developers**:
  - In Meta App Dashboard, go to **App Roles** $\to$ **Roles**.
  - Add developer or tester Facebook accounts to test the connection immediately in development mode.

---

## 5. Environment Variables Configuration

Add the following variables to your `.env` file:

```env
# Meta Graph API Configuration
META_APP_ID="your_meta_app_id_here"
META_APP_SECRET="your_meta_app_secret_here"
META_REDIRECT_URI="http://localhost:3000/api/auth/callback/meta"
META_API_VERSION="v26.0"

# Token Encryption Key (AES-256-GCM)
# Minimum 32-character random string used to encrypt all OAuth access tokens at rest
SOCIAL_TOKEN_ENCRYPTION_KEY="replace_with_a_secure_random_32_char_key_for_production"
```

---

## 6. How Instagram Accounts Connect

According to current Meta Graph API guidelines:
1. Instagram accounts **must be Professional (Business or Creator)** accounts. Personal accounts are not supported by the Graph API.
2. The Instagram Professional account must be connected to a **Facebook Page** in Meta Business Suite or Facebook Page settings.
3. During OAuth, authorizing the Facebook Page automatically discovers the linked Instagram Business account via `GET /{page-id}?fields=instagram_business_account{id,username,name,profile_picture_url}`.
