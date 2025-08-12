import React from 'react';
import MintRelicButton from '../components/MintRelicButton';

const MintPage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          color: 'white', 
          fontSize: '3rem', 
          marginBottom: '10px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          ChaosKey333 Vault
        </h1>
        <p style={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontSize: '1.2rem',
          maxWidth: '600px',
          lineHeight: '1.6'
        }}>
          Mint your exclusive Superman Relic NFT and join the legendary collection. 
          Each relic is a unique piece of digital history on the Sepolia testnet.
        </p>
      </header>

      {/* Main Content */}
      <main style={{ 
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#dc2626',
            borderRadius: '50%',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem'
          }}>
            🦸‍♂️
          </div>
          <h2 style={{ 
            color: '#1f2937', 
            fontSize: '2rem', 
            marginBottom: '10px' 
          }}>
            Superman Relic
          </h2>
          <p style={{ 
            color: '#6b7280', 
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            A legendary collectible that embodies the power and legacy of the Man of Steel. 
            This exclusive NFT grants access to special benefits within the ChaosKey333 ecosystem.
          </p>
        </div>

        {/* Features */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#374151', marginBottom: '15px', fontSize: '1.2rem' }}>
            Relic Features:
          </h3>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            color: '#6b7280',
            lineHeight: '1.8'
          }}>
            <li style={{ marginBottom: '8px' }}>✨ Legendary rarity level</li>
            <li style={{ marginBottom: '8px' }}>🔗 ERC-721 standard compliance</li>
            <li style={{ marginBottom: '8px' }}>🌐 Hosted on IPFS for permanence</li>
            <li style={{ marginBottom: '8px' }}>🎯 Exclusive ecosystem access</li>
            <li style={{ marginBottom: '8px' }}>⚡ Maximum power level attributes</li>
          </ul>
        </div>

        {/* Mint Component */}
        <MintRelicButton />

        {/* Additional Info */}
        <div style={{ 
          marginTop: '30px', 
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '10px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ color: '#374151', marginBottom: '10px' }}>
            📝 Important Notes:
          </h4>
          <ul style={{ 
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.6',
            paddingLeft: '20px'
          }}>
            <li>This is a testnet deployment on Sepolia</li>
            <li>Ensure you have Sepolia ETH for gas fees</li>
            <li>MetaMask will automatically switch networks</li>
            <li>Each wallet can mint multiple relics (if supply allows)</li>
            <li>Transaction confirmation may take 1-2 minutes</li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        marginTop: '40px', 
        textAlign: 'center',
        color: 'rgba(255,255,255,0.8)',
        fontSize: '14px'
      }}>
        <p>
          Powered by ChaosKey333 | 
          <a 
            href="https://chaoskey333.web.app" 
            style={{ color: 'rgba(255,255,255,0.9)', marginLeft: '5px' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit our ecosystem
          </a>
        </p>
      </footer>
    </div>
  );
};

export default MintPage;