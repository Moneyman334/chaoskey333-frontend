/**
 * Page selectors for E2E tests
 * These selectors are used across all test files for consistency
 */

export const selectors = {
  // Common selectors
  common: {
    loadingSpinner: '[data-testid="loading"]',
    errorMessage: '[data-testid="error"]',
    successMessage: '[data-testid="success"]',
    modal: '[data-testid="modal"]',
    closeButton: '[data-testid="close"]'
  },

  // Header/Navigation selectors
  nav: {
    logo: '[data-testid="logo"]',
    menuToggle: '[data-testid="menu-toggle"]',
    walletButton: '[data-testid="wallet-button"]',
    accountMenu: '[data-testid="account-menu"]',
    logout: '[data-testid="logout"]'
  },

  // Mint page selectors
  mint: {
    container: '[data-testid="mint-container"]',
    connectWallet: '#connectWallet, #connectCoinbase, button:has-text("Connect Wallet")',
    walletStatus: '#mint-status, #mintStatus',
    paymentButton: '#paymentBtn, button:has-text("Pay")',
    mintButton: '#mint-button, button:has-text("Mint")',
    mintStatus: '#mint-status',
    relicPreview: '[data-testid="relic-preview"]',
    priceDisplay: '[data-testid="price"]',
    quantity: '[data-testid="quantity"]',
    totalPrice: '[data-testid="total-price"]'
  },

  // Store page selectors (assuming these will exist)
  store: {
    container: '[data-testid="store-container"]',
    productGrid: '[data-testid="product-grid"]',
    productCard: '[data-testid="product-card"]',
    productImage: '[data-testid="product-image"]',
    productTitle: '[data-testid="product-title"]',
    productPrice: '[data-testid="product-price"]',
    addToCart: '[data-testid="add-to-cart"]',
    cart: '[data-testid="cart"]',
    cartItems: '[data-testid="cart-items"]',
    checkout: '[data-testid="checkout"]',
    searchInput: '[data-testid="search"]',
    filterButton: '[data-testid="filter"]',
    sortDropdown: '[data-testid="sort"]'
  },

  // Leaderboard page selectors (assuming these will exist)
  leaderboard: {
    container: '[data-testid="leaderboard-container"]',
    table: '[data-testid="leaderboard-table"]',
    row: '[data-testid="leaderboard-row"]',
    rank: '[data-testid="rank"]',
    playerName: '[data-testid="player-name"]',
    score: '[data-testid="score"]',
    avatar: '[data-testid="avatar"]',
    searchPlayer: '[data-testid="search-player"]',
    filterDropdown: '[data-testid="filter-dropdown"]',
    timeRange: '[data-testid="time-range"]',
    refreshButton: '[data-testid="refresh"]'
  },

  // Admin page selectors (assuming these will exist)
  admin: {
    container: '[data-testid="admin-container"]',
    loginForm: '[data-testid="login-form"]',
    username: 'input[name="username"]',
    password: 'input[name="password"]',
    loginButton: 'button[type="submit"]',
    dashboard: '[data-testid="dashboard"]',
    userManagement: '[data-testid="user-management"]',
    analytics: '[data-testid="analytics"]',
    settings: '[data-testid="settings"]',
    userTable: '[data-testid="user-table"]',
    editUser: '[data-testid="edit-user"]',
    deleteUser: '[data-testid="delete-user"]',
    addUser: '[data-testid="add-user"]',
    saveButton: '[data-testid="save"]',
    cancelButton: '[data-testid="cancel"]'
  },

  // Wallet connection selectors
  wallet: {
    connectModal: '[data-testid="wallet-modal"]',
    metamaskOption: '[data-testid="metamask"]',
    coinbaseOption: '[data-testid="coinbase"]',
    walletConnectOption: '[data-testid="walletconnect"]',
    connectedStatus: '[data-testid="connected"]',
    disconnectButton: '[data-testid="disconnect"]',
    networkSwitch: '[data-testid="network-switch"]',
    accountInfo: '[data-testid="account-info"]'
  },

  // Payment selectors
  payment: {
    stripeCheckout: '[data-testid="stripe-checkout"]',
    paypalCheckout: '[data-testid="paypal-checkout"]',
    coinbaseCheckout: '[data-testid="coinbase-checkout"]',
    cardNumber: 'input[name="cardNumber"]',
    expiry: 'input[name="cardExpiry"]',
    cvc: 'input[name="cardCvc"]',
    zipCode: 'input[name="postalCode"]',
    payButton: 'button[type="submit"]',
    paymentStatus: '[data-testid="payment-status"]',
    successPage: '[data-testid="payment-success"]',
    failurePage: '[data-testid="payment-failure"]'
  },

  // Test utility selectors
  test: {
    stripeTest: 'button:has-text("Test Stripe")',
    connectionTest: 'button:has-text("Test All Connections")',
    healthCheck: '[data-testid="health-check"]'
  }
};

/**
 * Helper function to build data-testid selectors
 */
export const testId = (id: string) => `[data-testid="${id}"]`;

/**
 * Helper function to build text-based selectors
 */
export const hasText = (text: string) => `:has-text("${text}")`;

/**
 * Helper function to build role-based selectors
 */
export const role = (role: string, name?: string) => 
  name ? `[role="${role}"][name="${name}"]` : `[role="${role}"]`;

export default selectors;