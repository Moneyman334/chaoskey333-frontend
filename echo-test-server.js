/**
 * Test Server for Multi-Channel Echo Architecture
 * Runs without Stripe or external dependencies for development
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Main route - serve our cosmic replay terminal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'cosmic-replay-terminal-v2.html'));
});

// Original index for reference
app.get('/original', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ensure cosmic terminal is served directly
app.get('/cosmic', (req, res) => {
    res.sendFile(path.join(__dirname, 'cosmic-replay-terminal-v2.html'));
});

// PR #38 Echo Integration Test Environment
app.get('/pr38', (req, res) => {
    res.sendFile(path.join(__dirname, 'pr38-echo-test-environment.html'));
});

// Test environment
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-environment.html'));
});

// Vault page
app.get('/vault', (req, res) => {
    res.sendFile(path.join(__dirname, 'vault.html'));
});

// Mock config endpoint for testing
app.get('/config', (req, res) => {
    res.json({
        publicKey: 'pk_test_mock_key_for_development',
        environment: 'development'
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'Multi-Channel Echo Architecture Test Server',
        timestamp: new Date().toISOString()
    });
});

// API endpoint for echo synchronization testing
app.post('/api/echo-sync', (req, res) => {
    const { channels, precision } = req.body;
    
    // Simulate echo synchronization
    setTimeout(() => {
        res.json({
            success: true,
            channels: channels || ['low', 'mid', 'high'],
            precision: precision || '0.001ms',
            timestamp: new Date().toISOString(),
            message: 'Echo channels synchronized successfully'
        });
    }, 500);
});

// API endpoint for glyph manifestation
app.post('/api/glyph-manifest', (req, res) => {
    const { solverImprint, harmonicFreq } = req.body;
    
    res.json({
        success: true,
        manifestation: 'GLYPH_DECODED',
        solverImprint: solverImprint || 'UNKNOWN_SOLVER',
        harmonicFreq: harmonicFreq || 440,
        glyphType: 'CONVERGENCE',
        intensity: Math.floor(Math.random() * 100) + 1,
        timestamp: new Date().toISOString()
    });
});

// API endpoint for singularity flash
app.post('/api/singularity-flash', (req, res) => {
    res.json({
        success: true,
        event: 'SINGULARITY_FLASH',
        harmonicLock: true,
        echoConvergence: 'COMPLETE',
        vaultWideSync: true,
        timestamp: new Date().toISOString(),
        message: 'Singularity moment achieved - vault-wide broadcast complete'
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not found',
        path: req.path 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🌌 Multi-Channel Echo Architecture Test Server running on port ${PORT}`);
    console.log(`📡 Cosmic Replay Terminal: http://localhost:${PORT}/`);
    console.log(`🎯 PR #38 Echo Integration: http://localhost:${PORT}/pr38`);
    console.log(`🏠 Original Vault: http://localhost:${PORT}/original`);
    console.log(`🧪 Test Environment: http://localhost:${PORT}/test`);
    console.log(`🔧 Health Check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('🎯 Ready for vault-wide immersive broadcast event testing!');
});

module.exports = app;