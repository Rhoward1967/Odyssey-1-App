# 🧪 Odyssey-1 State-of-the-Art Development Lab

## Overview

Welcome to the Odyssey-1 Lab - a comprehensive development environment designed for building, testing, and deploying fixes for the Odyssey-1 AI platform. This lab provides automated development workflows, robust error recovery, and comprehensive work protection.

## 🚀 Quick Start

### Opening the Lab
1. Open VS Code
2. File → Open Workspace from File
3. Select `Odyssey-1-Lab.code-workspace`
4. The lab will automatically start when the workspace opens

### Lab Features
- **🔄 Automatic Server Management**: Robust dev server with auto-recovery
- **🛡️ Work Protection**: Automatic file backups and change tracking
- **📱 Live Preview**: Automatic browser preview with hot reload
- **🔧 Integrated Tools**: All development tools pre-configured
- **🎯 Task Automation**: One-click builds, tests, and deployments

## 📁 Lab Structure

```
Odyssey-1-Lab/
├── 🧪 Lab Configuration
│   ├── Odyssey-1-Lab.code-workspace    # Main workspace file
│   ├── robust-lab.cjs                  # Auto-recovery dev server
│   ├── work-protection.cjs             # File backup system
│   └── .vscode/                        # VS Code configuration
│       ├── tasks.json                  # Automated tasks
│       ├── settings.json               # Editor settings
│       └── launch.json                 # Debug profiles
├── 📱 Application Code
│   ├── src/                           # Source code
│   ├── public/                        # Static assets
│   └── supabase/                      # Backend functions
└── 🛡️ Work Protection
    └── .lab-backups/                  # Automatic backups
```

## 🛠️ Available Tasks

The lab includes pre-configured tasks accessible via `Ctrl+Shift+P` → "Tasks: Run Task":

- **🚀 Robust Lab Server**: Start the auto-recovery development server
- **🔄 Work Protection Service**: Start automatic file backup monitoring
- **📦 Install Dependencies**: Install or update npm packages
- **🧪 Run Tests**: Execute the test suite
- **🏗️ Build Project**: Create production build
- **🔍 Type Check**: Run TypeScript type checking

## 🛡️ Work Protection System

### Automatic Backups
- Monitors all source files for changes
- Creates timestamped backups automatically
- Maintains up to 10 versions per file
- Excludes node_modules and build artifacts

### Manual Backup Commands
```bash
# Start protection service
node work-protection.cjs start

# List all backups
node work-protection.cjs list

# List backups for specific file
node work-protection.cjs list src/App.tsx

# Restore file from latest backup
node work-protection.cjs restore src/App.tsx

# Restore from specific timestamp
node work-protection.cjs restore src/App.tsx 2025-09-21T10-30-00
```

## 🔧 Development Workflow

### Phase 4a Development Process
1. **Start Lab**: Open workspace (auto-starts servers)
2. **Create Feature Branch**: `git checkout -b feature/your-feature`
3. **Develop**: Write code with automatic backups
4. **Test**: Run automated tests via tasks
5. **Build**: Create production build
6. **Commit**: Push changes to feature branch
7. **Pull Request**: Submit for review

### Robust Server Features
- **Auto-Recovery**: Restarts on crashes
- **Port Management**: Finds available ports automatically
- **Error Handling**: Graceful error recovery
- **Environment Checks**: Validates setup before starting
- **Progressive Restart**: Intelligent restart delays

## 📊 Monitoring & Debugging

### Live Monitoring
- Server status and restart counts
- File change detection
- Backup creation logs
- Error tracking and recovery

### Debug Configurations
- **🌐 Launch Lab Preview**: Start with browser preview
- **🔍 Debug Odyssey-1 App**: Full debugging with breakpoints
- **🧪 Test Debugging**: Debug test execution

## 🎯 Project Context

### Recent History
The Odyssey-1 project has completed three major phases:
- **Phase 1**: UI Standardization and AI Chat V1
- **Phase 2**: Mobile-first Payroll & HR systems
- **Phase 3**: Ground-up budget management rebuild

### Current Objective: Phase 4a
Prepare incremental deployment including:
- ConversationalAIChat component integration
- Build optimizations
- Code cleanup and documentation
- Stable update via Pull Request

## 🔗 Integration Points

### VS Code Extensions (Auto-installed)
- TypeScript support
- Tailwind CSS IntelliSense
- Prettier formatting
- Deno support for Supabase functions
- Path IntelliSense

### Environment Variables
```env
NODE_ENV=development
VITE_LAB_MODE=true
FORCE_COLOR=1
```

## 🚨 Troubleshooting

### Common Issues
1. **Port conflicts**: Lab automatically finds available ports
2. **Node modules missing**: Auto-installs on startup
3. **Vite crashes**: Auto-restarts with progressive delays
4. **File corruption**: Restore from automatic backups

### Emergency Recovery
```bash
# Restore from backup
node work-protection.cjs restore src/App.tsx

# Force restart lab server
Ctrl+C then reopen workspace

# Clean restart
rm -rf node_modules && npm install
```

---

## 🤖 AI Assistant Core Operational Protocols

### Protocol 1: Context Preservation
- Always maintain full context of the current development phase
- Reference project history and recent changes before making modifications
- Understand the relationship between current work and overall project goals
- **NEVER** proceed with development tasks without understanding the current phase

### Protocol 2: Git Safety
- **NEVER** execute `git push --force` commands under any circumstances
- Always verify branch context before executing git operations
- Create feature branches for experimental work: `git checkout -b feature/description`
- Commit frequently with descriptive messages that explain the "why"
- If git operations fail, analyze the error before retrying with different approaches

### Protocol 3: Environment Validation
- Verify development environment is properly configured before starting work
- Check for proper dependencies, configurations, and lab systems functionality
- Use the work protection system to safeguard against data loss
- Address environmental issues completely before proceeding with development tasks
- **NEVER** ignore environment setup failures

### Protocol 4: Progressive Problem Solving
- If a command or operation fails, analyze the root cause before retrying
- Use different approaches rather than repeating identical failed commands
- Implement exponential backoff for retry operations
- Escalate to manual intervention when automated solutions fail repeatedly
- Document problems and solutions in commit messages for future reference

### Protocol 5: Work Protection
- Utilize the automatic backup system for all code changes
- Create manual backups before major refactoring or risky operations
- Test changes incrementally to minimize risk and enable rollback
- Maintain clean, recoverable state at all development checkpoints
- **ALWAYS** verify backup system is active before beginning work

---

## 📞 Support

For lab-related issues:
1. Check automatic logs in VS Code terminal
2. Review backup system status with `node work-protection.cjs list`
3. Consult troubleshooting section above
4. Use emergency recovery procedures if needed
5. Contact project architect for critical issues that cannot be resolved

---

## 🔄 Lab Maintenance

### Daily Operations
- Check server uptime and restart counts
- Verify backup system is creating backups
- Monitor disk space in .lab-backups directory
- Review error logs for recurring issues

### Weekly Maintenance
- Clean old backup files (automated)
- Update dependencies if needed
- Review and optimize lab configuration
- Test emergency recovery procedures

---

## 🎓 Lab Usage Best Practices

### For AI Assistants
1. **Read this README completely** before starting any work
2. **Verify lab environment** is running before code changes
3. **Use the protocols above** as mandatory operational guidelines
4. **Create backups** before major changes
5. **Test incrementally** to maintain system stability

### For Human Developers
1. Open workspace file to get full lab environment
2. Use provided tasks for common operations
3. Rely on automatic backups but create manual ones for critical work
4. Monitor lab server status in terminal
5. Use debug configurations for troubleshooting

---

**🧪 Odyssey-1 Lab - Where Innovation Meets Reliability**

*Lab Version: 1.0*  
*Created: September 21, 2025*  
*Project: Odyssey-1 State-of-the-Art Development Environment*