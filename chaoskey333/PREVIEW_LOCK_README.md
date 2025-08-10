# Preview Lock & Vault Test Implementation

This implementation adds password protection for preview environments and IP-based access control for vault-test environments.

## Features Implemented

### 1. Preview Password Protection
- **Password**: `Chaos333` (configurable via `PREVIEW_PASSWORD` environment variable)
- **Middleware Protection**: Automatically redirects unauthorized users to password entry page
- **Session Management**: Uses secure HTTP-only cookies for session persistence
- **Error Handling**: Displays user-friendly error messages for invalid passwords

### 2. Vault Test IP Allowlist
- **Environment**: `vault-test` (set via `NEXT_PUBLIC_ENV=vault-test`)
- **IP Restrictions**: Configurable via `IP_ALLOWLIST` environment variable (comma-separated)
- **Automatic Blocking**: Returns 403 Access Denied for non-allowlisted IPs

### 3. SEO Protection
- **No-Index Headers**: Automatically adds `x-robots-tag: noindex, nofollow` for preview/vault-test environments
- **Meta Tags**: Includes `<meta name="robots" content="noindex,nofollow">` in HTML head
- **Search Engine Protection**: Prevents indexing of preview and test environments

## File Structure

```
src/
├── middleware.ts                 # Main security middleware
├── app/
│   ├── layout.tsx               # Updated with no-index meta tags
│   ├── page.tsx                 # Main vault page
│   ├── preview/
│   │   └── page.tsx             # Password entry page
│   └── api/
│       └── preview-auth/
│           └── route.ts         # Password verification API
└── .env.example                 # Environment variable template
```

## Environment Variables

Create a `.env.local` file with:

```bash
# Environment type (production, preview, vault-test)
NEXT_PUBLIC_ENV=production

# Preview password (default: Chaos333)
PREVIEW_PASSWORD=Chaos333

# Vault Test IP allowlist (comma-separated)
IP_ALLOWLIST=127.0.0.1,::1,192.168.1.100
```

## Deployment Configuration

### Preview Environment
```bash
NEXT_PUBLIC_ENV=preview
PREVIEW_PASSWORD=Chaos333
```

### Vault Test Environment
```bash
NEXT_PUBLIC_ENV=vault-test
IP_ALLOWLIST=YOUR_ALLOWED_IPS_HERE
```

## Security Features

1. **HTTP-Only Cookies**: Session cookies cannot be accessed via JavaScript
2. **Secure Cookies**: Cookies are marked secure in production
3. **SameSite Protection**: Cookies use `strict` SameSite policy
4. **24-Hour Session**: Sessions expire after 24 hours
5. **Client IP Detection**: Supports various proxy headers for accurate IP detection

## Testing

### Preview Lock Test
1. Set `NEXT_PUBLIC_ENV=preview`
2. Visit any page - should redirect to password entry
3. Enter `Chaos333` to gain access
4. Verify session persists across page navigation

### Vault Test IP Restrictions
1. Set `NEXT_PUBLIC_ENV=vault-test`
2. Set `IP_ALLOWLIST` with allowed IPs
3. Test access from allowed/disallowed IPs
4. Verify 403 response for unauthorized IPs

### SEO Protection Test
1. Check response headers for `x-robots-tag: noindex, nofollow`
2. Verify `<meta name="robots" content="noindex,nofollow">` in HTML
3. Confirm robots directive only appears in preview/vault-test environments