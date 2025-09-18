# Odyssey-1 Client Portal

## Overview
This is a secure, client-facing application for Odyssey-1 subscribers. It provides authentication-protected access to subscriber services while keeping all administrative functions separate and secure.

## Features
- **Secure Authentication**: Local storage-based authentication system
- **Subscriber Dashboard**: Access to personal subscription data only
- **Protected Content**: No access to administrative or sensitive company data
- **Responsive Design**: Works on all devices
- **Easy Deployment**: Static HTML/CSS/JS files ready for GoDaddy hosting

## Security Features
- No administrative access for subscribers
- Protected sensitive company information
- User isolation - subscribers only see their own data
- No backend dependencies - all client-side processing
- Secure authentication flow

## Installation for GoDaddy
1. Download all files as a ZIP
2. Upload ZIP to GoDaddy File Manager in public_html folder
3. Extract the ZIP file
4. The application will be accessible at your domain

## File Structure
- `index.html` - Main application entry point
- `styles.css` - Custom styling and responsive design
- `js/auth.js` - Authentication system
- `js/components.js` - React components for public pages
- `js/dashboard.js` - Subscriber dashboard components
- `js/app.js` - Main application logic and routing

## Usage
1. Visitors see public landing page with features
2. Users can sign up or sign in
3. Authenticated users access their personal dashboard
4. No administrative functions exposed to subscribers

## Important Notes
- This application does NOT affect your main dashboard
- Administrative areas remain completely protected
- Subscribers cannot edit or access company-sensitive data
- All authentication is handled client-side for simplicity
- Perfect for GoDaddy static hosting