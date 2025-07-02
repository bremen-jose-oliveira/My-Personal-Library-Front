# My Personal Library (Expo App)

A cross-platform mobile and web app to manage your personal book collection, connect with friends, and discover new books. Built with [Expo](https://expo.dev), React Native, and TypeScript.

---

## Features

- **User Authentication**: Register, login, and social login (Google, Apple).
- **Book Library**: Add, view, and delete books in your personal collection.
- **Book Details**: View detailed information about each book.
- **Barcode Scanning**: Scan ISBN barcodes to quickly add books.
- **Book Search**: Search for books using the Google Books API.
- **Friends System**: Add friends, view friend list, and manage friend requests.
- **Account Settings**: Manage your account and logout securely.
- **Password Reset**: Forgot/reset password via email.
- **Responsive UI**: Works on Android, iOS, and web.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or later recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd My-Personal-Library-Front
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the app:**
   ```bash
   npx expo start
   ```
   - Use the QR code to open on your device with Expo Go, or run on an emulator/simulator.

---

## Project Structure

```
app/                # Main app screens and navigation (file-based routing)
  (tabs)/           # Tab navigation: Home, Library, Friends, AccountSettings
    Library/        # Book library features (add, display books)
    Friends/        # Friend list, add friend, friend requests
  BookDetails/      # Book details screen
  Login/, Register/ # Auth screens
  ForgotPassword.tsx, ResetPassword.tsx
components/         # Reusable UI components (Avatar, BarcodeScanner, etc.)
utils/              # Context providers, API utilities, storage helpers
assets/             # Images, fonts, and static assets
constants/          # App-wide constants (colors, etc.)
Interfaces/         # TypeScript interfaces for data models
```

---

## API & Backend Integration

- **Authentication**: Uses JWT tokens stored securely. Supports Google and Apple OAuth.
- **Book Data**: Fetches book info from Google Books API and your own backend (set `EXPO_PUBLIC_API_URL` in your environment).
- **Friends**: All friend operations (add, remove, requests) are handled via backend API endpoints.
- **Password Reset**: Email-based reset via backend API.

> **Note:** You must configure the `EXPO_PUBLIC_API_URL` and OAuth client IDs in your environment for full functionality.

---

## Customization & Theming
- Uses [Tailwind CSS](https://tailwindcss.com/) for styling via `nativewind`.
- Custom colors and fonts are defined in `constants/Colors.ts` and `assets/fonts/`.

<<<<<<< HEAD
---

## Scripts
- `npm start` – Start Expo development server
- `npm run android` – Run on Android device/emulator
- `npm run ios` – Run on iOS simulator
- `npm run web` – Run on web
- `npm run reset-project` – Reset to a blank project

---

## Learn More
- [Expo Documentation](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)

---

## License
MIT
=======
- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

>>>>>>> 91474d6e2b9997503393dc3d2e19cb514d614e89
