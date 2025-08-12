import React from 'react';
import MintRelicButton from '../components/MintRelicButton';

/**
 * Example integration showing how to use the Superman Relic components
 * in an existing React/Next.js project.
 */
const IntegrateSupermanRelic: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          color: 'white', 
          fontSize: '2.5rem', 
          marginBottom: '10px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          ChaosKey333 Ecosystem
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
          Your gateway to legendary NFT collections
        </p>
      </header>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '30px'
      }}>
        {/* Superman Relic Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '30px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#dc2626',
              borderRadius: '50%',
              margin: '0 auto 15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              🦸‍♂️
            </div>
            <h2 style={{ color: '#1f2937', marginBottom: '10px' }}>
              Superman Relic Collection
            </h2>
            <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
              Mint your exclusive Superman Relic NFT and become part of the legendary collection.
            </p>
          </div>

          {/* Integrated Mint Component */}
          <MintRelicButton />
        </div>

        {/* Future Collections Preview */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '30px',
          maxWidth: '400px',
          width: '100%',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <h3 style={{ marginBottom: '20px' }}>🚀 Coming Soon</h3>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>🛡️</div>
              <p>Batman Relic Series</p>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>⚡</div>
              <p>Wonder Woman Collection</p>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>🏃‍♂️</div>
              <p>Flash Velocity Series</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center',
        marginTop: '60px',
        color: 'rgba(255,255,255,0.8)',
        fontSize: '14px'
      }}>
        <p>
          Built on Sepolia Testnet | 
          <a 
            href="https://chaoskey333.web.app" 
            style={{ color: 'rgba(255,255,255,0.9)', marginLeft: '5px' }}
          >
            Learn More
          </a>
        </p>
      </footer>
    </div>
  );
};

export default IntegrateSupermanRelic;