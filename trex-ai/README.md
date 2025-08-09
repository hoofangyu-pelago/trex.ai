# trex.ai — Expo + Tamagui app

This is an [Expo](https://expo.dev) project using [Expo Router](https://docs.expo.dev/router/introduction) and [Tamagui](https://tamagui.dev) with a monochrome theme and mock authentication/data.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   # General
   npx expo start

   # Web (recommended for quick preview)
   npm run web

   # iOS Simulator
   npm run ios

   # Android Emulator
   npm run android
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the `app/` directory. This project uses file-based routing.

## Features implemented

- Expo Router structure with protected `(app)` and public `(auth)` segments
  - Tabs: `Home`, `Calendar`, `Activities`, `Profile`
  - Detail routes: `workout/[id]`, coach views under `coach/*` (placeholders)
- Mock authentication provider and hook (`providers/AuthProvider.tsx`, `hooks/useAuth.ts`)
  - Protected routes via `app/(app)/_layout.tsx`
- UI System with Tamagui components
  - `Button`, `Card`, `Typography`, `Layout/Screen`, `LoadingSpinner`
  - Monochrome theme tokens in `tamagui.config.ts`
- Training Calendar screen
  - Month/Week views on web, Day view on mobile
  - Navigation controls (Prev/Today/Next)
  - Mock calendar/workout data (`data/mockCalendar.ts`)
- Activities screen
  - Monthly summary cards and workout list items
  - Generated mock workouts (~2–3 months) in `data/mockWorkouts.ts`
- Profile screen showing current user info with Sign Out
- TypeScript strict mode and path alias `@/*`

## Mock accounts

- `athlete@example.com`
- `coach@example.com`

On the login screen, enter one of the emails above and press Continue.

## Tech notes

- Router typed routes enabled in `app.json` (`experiments.typedRoutes: true`)
- Babel plugins: only `react-native-reanimated/plugin` (do not add `expo-router/babel` on SDK 50+)
- App icons, favicon and splash images configured under `assets/images/*`

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the `app-example` directory and create a blank `app` directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
