#!/usr/bin/env node

/**
 * 🧪 Odyssey-1 Robust Lab Server
 * Auto-recovery wrapper for Vite development server
 * Handles crashes, port conflicts, and environment issues
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

class RobustLabServer {
    constructor() {
        this.maxRestarts = 10;
        this.restartCount = 0;
        this.basePort = 5173;
        this.currentPort = this.basePort;
        this.viteProcess = null;
        this.isShuttingDown = false;
        this.startTime = Date.now();
        
        // Bind methods
        this.handleExit = this.handleExit.bind(this);
        this.handleError = this.handleError.bind(this);
        this.restart = this.restart.bind(this);
        
        // Setup graceful shutdown
        process.on('SIGTERM', this.handleExit);
        process.on('SIGINT', this.handleExit);
        process.on('uncaughtException', this.handleError);
        process.on('unhandledRejection', this.handleError);
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        const emoji = {
            'INFO': '📄',
            'SUCCESS': '✅',
            'WARNING': '⚠️',
            'ERROR': '❌',
            'RESTART': '🔄',
            'PORT': '🔌'
        }[type] || '📄';
        
        console.log(`${emoji} [${timestamp}] ${message}`);
    }

    async checkPort(port) {
        return new Promise((resolve) => {
            const server = http.createServer();
            server.listen(port, () => {
                server.close(() => resolve(true));
            });
            server.on('error', () => resolve(false));
        });
    }

    async findAvailablePort() {
        let port = this.basePort;
        while (port < this.basePort + 100) {
            if (await this.checkPort(port)) {
                this.currentPort = port;
                this.log(`Found available port: ${port}`, 'PORT');
                return port;
            }
            port++;
        }
        throw new Error('No available ports found in range');
    }

    async preFlightChecks() {
        this.log('🧪 Odyssey-1 Lab Server Starting...', 'INFO');
        this.log('Running pre-flight checks...', 'INFO');

        // Check if package.json exists
        if (!fs.existsSync('package.json')) {
            throw new Error('package.json not found. Are you in the correct directory?');
        }

        // Check if node_modules exists
        if (!fs.existsSync('node_modules')) {
            this.log('node_modules not found. Installing dependencies...', 'WARNING');
            await this.runCommand('npm', ['install']);
        }

        // Check for vite config
        const viteConfigs = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs'];
        const hasViteConfig = viteConfigs.some(config => fs.existsSync(config));
        
        if (!hasViteConfig) {
            this.log('No Vite config found. This might cause issues.', 'WARNING');
        }

        // Find available port
        await this.findAvailablePort();

        this.log('Pre-flight checks completed', 'SUCCESS');
    }

    runCommand(command, args) {
        return new Promise((resolve, reject) => {
            const process = spawn(command, args, { stdio: 'inherit' });
            process.on('close', (code) => {
                code === 0 ? resolve() : reject(new Error(`Command failed with code ${code}`));
            });
        });
    }

    startVite() {
        if (this.isShuttingDown) return;

        this.log(`Starting Vite dev server on port ${this.currentPort}...`, 'INFO');

        const args = [
            'run', 'dev',
            '--port', this.currentPort.toString(),
            '--host', '0.0.0.0',
            '--open'
        ];

        // Use full npm path to avoid ENOENT errors
        const npmPath = process.platform === 'win32' ? 'F:\\npm.cmd' : 'npm';
        
        this.viteProcess = spawn(npmPath, args, {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
                ...process.env,
                FORCE_COLOR: '1',
                NODE_ENV: 'development',
                VITE_LAB_MODE: 'true'
            },
            shell: process.platform === 'win32'
        });

        this.viteProcess.stdout.on('data', (data) => {
            const output = data.toString();
            process.stdout.write(output);
            
            // Check for successful start
            if (output.includes('Local:') || output.includes('ready in')) {
                this.log('🚀 Odyssey-1 Lab Server is running!', 'SUCCESS');
                this.log(`🌐 Local: http://localhost:${this.currentPort}`, 'INFO');
                this.log(`📱 Network: http://0.0.0.0:${this.currentPort}`, 'INFO');
                this.restartCount = 0; // Reset restart counter on successful start
            }
        });

        this.viteProcess.stderr.on('data', (data) => {
            const error = data.toString();
            process.stderr.write(error);
            
            // Handle specific errors
            if (error.includes('EADDRINUSE')) {
                this.log(`Port ${this.currentPort} is in use, trying next port...`, 'WARNING');
                this.handlePortConflict();
            }
        });

        this.viteProcess.on('close', (code, signal) => {
            if (this.isShuttingDown) return;
            
            if (code !== 0 && code !== null) {
                this.log(`Vite process exited with code ${code}`, 'ERROR');
                this.restart();
            } else if (signal) {
                this.log(`Vite process killed with signal ${signal}`, 'WARNING');
                this.restart();
            }
        });

        this.viteProcess.on('error', (error) => {
            this.log(`Failed to start Vite process: ${error.message}`, 'ERROR');
            this.restart();
        });
    }

    async handlePortConflict() {
        if (this.viteProcess) {
            this.viteProcess.kill();
            this.viteProcess = null;
        }
        
        await this.findAvailablePort();
        setTimeout(() => this.startVite(), 1000);
    }

    restart() {
        if (this.isShuttingDown) return;
        
        this.restartCount++;
        this.log(`Restart attempt ${this.restartCount}/${this.maxRestarts}`, 'RESTART');

        if (this.restartCount >= this.maxRestarts) {
            this.log('Maximum restart attempts reached. Manual intervention required.', 'ERROR');
            process.exit(1);
        }

        if (this.viteProcess) {
            this.viteProcess.kill();
            this.viteProcess = null;
        }

        // Progressive delay: 1s, 2s, 4s, 8s, etc.
        const delay = Math.min(Math.pow(2, this.restartCount - 1) * 1000, 30000);
        this.log(`Restarting in ${delay/1000} seconds...`, 'INFO');
        
        setTimeout(() => {
            this.startVite();
        }, delay);
    }

    handleError(error) {
        this.log(`Unhandled error: ${error.message}`, 'ERROR');
        this.restart();
    }

    handleExit() {
        this.isShuttingDown = true;
        this.log('🛑 Shutting down Odyssey-1 Lab Server...', 'INFO');
        
        if (this.viteProcess) {
            this.viteProcess.kill('SIGTERM');
            
            // Force kill after 5 seconds
            setTimeout(() => {
                if (this.viteProcess && !this.viteProcess.killed) {
                    this.viteProcess.kill('SIGKILL');
                }
            }, 5000);
        }

        const uptime = ((Date.now() - this.startTime) / 1000 / 60).toFixed(1);
        this.log(`Lab server was running for ${uptime} minutes`, 'INFO');
        this.log('🧪 Odyssey-1 Lab Server stopped', 'SUCCESS');
        
        process.exit(0);
    }

    async start() {
        try {
            await this.preFlightChecks();
            this.startVite();
        } catch (error) {
            this.log(`Failed to start lab server: ${error.message}`, 'ERROR');
            process.exit(1);
        }
    }
}

// Start the lab server
const labServer = new RobustLabServer();
labServer.start();