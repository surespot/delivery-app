# Surespot Delivery

A mobile application for delivery drivers built with React Native and Expo.

## Overview

Surespot Delivery is a driver-facing app that enables delivery personnel to manage their availability, view and accept orders, track earnings, and access support resources.

## Features

### Home & Availability
- Toggle online/offline status to receive delivery requests
- View today's delivery statistics
- Access available orders

### Profile & Account
- View and edit personal information
- Update email and phone with OTP verification
- Manage account settings

### Settings
- General app settings
- Login and security settings
- Language preferences (multi-language support)

### Support & Legal
- FAQ section with expandable answers
- Contact support with categorized help:
  - Account & Verification issues
  - Delivery Problems
  - Earnings & Payouts inquiries
- Report issues with document attachments
- Track support request history
- Terms and Conditions
- Privacy Policy
- Account deactivation

## Tech Stack

- **Framework:** React Native with Expo
- **Navigation:** Expo Router (file-based routing)
- **State Management:** Zustand
- **Icons:** Expo Vector Icons (Ionicons, Feather)
- **SVG Support:** react-native-svg

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Expo CLI
- iOS Simulator / Android Emulator / Physical device with Expo Go

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd surespot-delivery
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run on your preferred platform:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your device

## Project Structure

```
surespot-delivery/
├── app/                    # Screen components (file-based routing)
│   ├── (tabs)/            # Tab navigation screens
│   ├── auth/              # Authentication screens
│   ├── docs/              # Legal document screens
│   └── home/              # Main app screens
├── assets/                # Images and static assets
├── components/            # Reusable UI components
├── constants/             # Theme and app constants
├── hooks/                 # Custom React hooks
├── store/                 # Zustand state stores
│   ├── auth-store.ts     # Authentication & user state
│   ├── orders-store.ts   # Orders state
│   └── support-store.ts  # Support reports state
└── scripts/              # Utility scripts
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
API_URL=your_api_url_here
```

## Design Reference

See `REFERENCE.md` for design guidelines including:
- Typography specifications
- Color palette
- Spacing system
- Component specifications

## Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web browser
- `npm run reset-project` - Reset to fresh project state

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the design guidelines in `REFERENCE.md`
3. Test on both iOS and Android
4. Submit a pull request

## License

Proprietary - All rights reserved.
