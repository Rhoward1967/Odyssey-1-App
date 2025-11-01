/**
 * ODYSSEY-1 Workforce Dashboard Component
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 * 
 * NOTE: This file now serves as a compatibility layer.
 * The actual Workforce Management System is in WorkspaceManager.tsx
 * and is accessed via UserManual.tsx
 */

// Simply re-export UserManual to avoid component duplication
export { UserManual as default, UserManual } from './UserManual';

// OLD WorkforceManagementSystem component REMOVED to prevent conflicts
// All workforce functionality is now in WorkspaceManager.tsx