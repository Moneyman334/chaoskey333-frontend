/**
 * Payment provider mocks for E2E testing
 * Supports Coinbase, Stripe, and PayPal providers
 */

export class PaymentMocks {
  /**
   * Setup payment provider mocks based on environment
   */
  static async setupProviderMocks(page: any, provider: 'coinbase' | 'stripe' | 'paypal' = 'coinbase') {
    switch (provider) {
      case 'coinbase':
        await this.setupCoinbaseMocks(page);
        break;
      case 'stripe':
        await this.setupStripeMocks(page);
        break;
      case 'paypal':
        await this.setupPayPalMocks(page);
        break;
      default:
        console.warn(`Unknown payment provider: ${provider}, using coinbase`);
        await this.setupCoinbaseMocks(page);
    }
  }

  /**
   * Setup Coinbase Commerce mocks
   */
  static async setupCoinbaseMocks(page: any) {
    // Mock Coinbase Commerce API calls
    await page.route('**/api/coinbase/**', async (route: any) => {
      const url = route.request().url();
      
      if (url.includes('/charges')) {
        // Mock charge creation
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              id: 'cb_charge_test_123',
              code: 'CB123TEST',
              name: 'ChaosKey333 Relic',
              description: 'Frankenstein Vault Relic',
              hosted_url: 'https://commerce.coinbase.com/charges/CB123TEST',
              created_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 3600000).toISOString(),
              pricing: {
                local: { amount: '33.33', currency: 'USD' },
                bitcoin: { amount: '0.001', currency: 'BTC' },
                ethereum: { amount: '0.02', currency: 'ETH' }
              },
              payments: [],
              timeline: [
                {
                  time: new Date().toISOString(),
                  status: 'NEW'
                }
              ]
            }
          })
        });
      } else if (url.includes('/webhooks')) {
        // Mock webhook handling
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ received: true })
        });
      }
    });

    // Mock Coinbase Wallet connection
    await page.addInitScript(() => {
      (window as any).coinbaseWalletExtension = {
        request: async (params: any) => {
          if (params.method === 'eth_requestAccounts') {
            return ['0x742d35Cc6A6B3Adf9C72Dd0Ac5B96EBC64ee6A0e'];
          }
          if (params.method === 'wallet_requestPermissions') {
            return [{ method: 'eth_accounts' }];
          }
          if (params.method === 'eth_chainId') {
            return '0x1'; // Mainnet
          }
          return null;
        },
        isConnected: () => true,
        selectedAddress: '0x742d35Cc6A6B3Adf9C72Dd0Ac5B96EBC64ee6A0e',
        isCoinbaseWallet: true
      };
    });
  }

  /**
   * Setup Stripe mocks
   */
  static async setupStripeMocks(page: any) {
    // Mock Stripe API calls
    await page.route('**/api/create-checkout-session*', async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionId: 'cs_test_1234567890abcdef'
        })
      });
    });

    await page.route('**/config*', async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          publicKey: 'pk_test_51234567890abcdef'
        })
      });
    });

    // Mock Stripe.js library
    await page.addInitScript(() => {
      (window as any).Stripe = (publicKey: string) => ({
        redirectToCheckout: async (options: any) => {
          console.log('Mock Stripe redirect:', options);
          // Simulate successful payment
          setTimeout(() => {
            window.location.href = window.location.origin + '/?payment=success&session_id=' + options.sessionId;
          }, 1000);
          return { error: null };
        },
        confirmCardPayment: async (clientSecret: string, data: any) => {
          return {
            paymentIntent: {
              id: 'pi_test_1234567890',
              status: 'succeeded'
            },
            error: null
          };
        }
      });
    });
  }

  /**
   * Setup PayPal mocks
   */
  static async setupPayPalMocks(page: any) {
    // Mock PayPal API calls
    await page.route('**/api/paypal/**', async (route: any) => {
      const url = route.request().url();
      
      if (url.includes('/orders')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'pp_order_test_123',
            status: 'CREATED',
            links: [
              {
                href: 'https://www.sandbox.paypal.com/checkoutnow?token=pp_order_test_123',
                rel: 'approve',
                method: 'GET'
              }
            ]
          })
        });
      } else if (url.includes('/capture')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'pp_order_test_123',
            status: 'COMPLETED',
            purchase_units: [
              {
                payments: {
                  captures: [
                    {
                      id: 'pp_capture_test_456',
                      status: 'COMPLETED',
                      amount: {
                        currency_code: 'USD',
                        value: '33.33'
                      }
                    }
                  ]
                }
              }
            ]
          })
        });
      }
    });

    // Mock PayPal SDK
    await page.addInitScript(() => {
      (window as any).paypal = {
        Buttons: (options: any) => ({
          render: (selector: string) => {
            const element = document.querySelector(selector);
            if (element) {
              const button = document.createElement('button');
              button.textContent = 'Pay with PayPal';
              button.onclick = () => {
                if (options.createOrder) {
                  options.createOrder().then((orderID: string) => {
                    console.log('Mock PayPal order created:', orderID);
                    if (options.onApprove) {
                      options.onApprove({ orderID });
                    }
                  });
                }
              };
              element.appendChild(button);
            }
          }
        })
      };
    });
  }
}

/**
 * Blockchain and wallet mocks
 */
export class BlockchainMocks {
  /**
   * Setup comprehensive blockchain mocks
   */
  static async setupBlockchainMocks(page: any) {
    await page.addInitScript(() => {
      // Mock Web3 provider
      (window as any).ethereum = {
        request: async (params: any) => {
          switch (params.method) {
            case 'eth_requestAccounts':
              return ['0x742d35Cc6A6B3Adf9C72Dd0Ac5B96EBC64ee6A0e'];
            case 'eth_accounts':
              return ['0x742d35Cc6A6B3Adf9C72Dd0Ac5B96EBC64ee6A0e'];
            case 'eth_chainId':
              return '0x5'; // Goerli testnet
            case 'wallet_switchEthereumChain':
              return null;
            case 'wallet_addEthereumChain':
              return null;
            case 'eth_sendTransaction':
              return '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
            case 'eth_getBalance':
              return '0x1bc16d674ec80000'; // 2 ETH
            case 'eth_getTransactionCount':
              return '0x1';
            case 'eth_gasPrice':
              return '0x4a817c800'; // 20 gwei
            case 'eth_estimateGas':
              return '0x5208'; // 21000 gas
            case 'eth_call':
              return '0x0000000000000000000000000000000000000000000000000000000000000001';
            default:
              return null;
          }
        },
        isMetaMask: true,
        isConnected: () => true,
        selectedAddress: '0x742d35Cc6A6B3Adf9C72Dd0Ac5B96EBC64ee6A0e',
        chainId: '0x5',
        networkVersion: '5'
      };

      // Mock ethers.js
      if ((window as any).ethers) {
        const originalProvider = (window as any).ethers.providers.Web3Provider;
        (window as any).ethers.providers.Web3Provider = class MockWeb3Provider {
          getSigner() {
            return {
              getAddress: () => Promise.resolve('0x742d35Cc6A6B3Adf9C72Dd0Ac5B96EBC64ee6A0e'),
              getBalance: () => Promise.resolve((window as any).ethers.utils.parseEther('2.0')),
              getTransactionCount: () => Promise.resolve(1),
              sendTransaction: (tx: any) => Promise.resolve({
                hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                wait: () => Promise.resolve({
                  blockNumber: 123456,
                  status: 1,
                  gasUsed: (window as any).ethers.BigNumber.from('21000')
                })
              }),
              signMessage: (message: string) => Promise.resolve('0x123456789abcdef'),
              connect: (provider: any) => this
            };
          }
          
          getNetwork() {
            return Promise.resolve({
              name: 'goerli',
              chainId: 5
            });
          }
          
          getBlockNumber() {
            return Promise.resolve(123456);
          }
        };

        // Mock contract interactions
        const originalContract = (window as any).ethers.Contract;
        (window as any).ethers.Contract = class MockContract {
          constructor(address: string, abi: any, signer: any) {
            this.address = address;
            this.abi = abi;
            this.signer = signer;
          }
          
          mintRelic() {
            return Promise.resolve({
              hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
              wait: () => Promise.resolve({
                blockNumber: 123456,
                status: 1,
                events: [
                  {
                    event: 'Transfer',
                    args: {
                      from: '0x0000000000000000000000000000000000000000',
                      to: '0x742d35Cc6A6B3Adf9C72Dd0Ac5B96EBC64ee6A0e',
                      tokenId: 1
                    }
                  }
                ]
              })
            });
          }
          
          balanceOf(address: string) {
            return Promise.resolve(1);
          }
          
          ownerOf(tokenId: number) {
            return Promise.resolve('0x742d35Cc6A6B3Adf9C72Dd0Ac5B96EBC64ee6A0e');
          }
          
          tokenURI(tokenId: number) {
            return Promise.resolve('https://example.com/metadata/1.json');
          }
        };
      }
    });
  }
}

/**
 * API mocks for server endpoints
 */
export class APIMocks {
  /**
   * Setup server API mocks
   */
  static async setupAPIMocks(page: any) {
    // Mock health check
    await page.route('**/health', async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: '✅ Server is alive and kickin\''
      });
    });

    // Mock Stripe test endpoints
    await page.route('**/api/test-stripe', async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          accountId: 'acct_test_123',
          currency: 'usd',
          message: 'Stripe connection successful'
        })
      });
    });

    // Mock comprehensive test endpoint
    await page.route('**/api/test-all', async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          server: { 
            status: 'running', 
            timestamp: new Date().toISOString() 
          },
          stripe: {
            connected: true,
            accountId: 'acct_test_123',
            currency: 'usd'
          },
          environment: {
            publicKey: true,
            secretKey: true,
            port: 5000
          }
        })
      });
    });

    // Mock mint API (if exists)
    await page.route('**/api/mint', async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          tokenId: 1,
          metadata: {
            name: 'ChaosKey333 Relic',
            description: 'Frankenstein Vault Relic',
            image: 'https://example.com/relic.png'
          }
        })
      });
    });
  }
}