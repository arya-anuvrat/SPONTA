# How to View Logs in Expo Go

## Method 1: Terminal/Console Logs (Easiest)
The logs appear automatically in your terminal where you ran `npm start` or `expo start`.

Look for:
- Red errors
- Yellow warnings  
- Console.log statements

## Method 2: Expo DevTools (Browser)
1. When Expo starts, it opens a browser window with DevTools
2. Or go to: http://localhost:19002
3. Click on "Logs" tab to see all console output

## Method 3: React Native Debugger
1. Shake your phone (or press `Cmd+D` on iOS simulator)
2. Select "Debug Remote JS"
3. Opens Chrome DevTools with console logs

## Method 4: Metro Bundler Logs
In your terminal where Expo is running, you'll see:
- Bundle compilation errors
- Module resolution errors
- Runtime errors

## Method 5: Device Logs (iOS)
```bash
# View device logs in terminal
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "Expo"' --level debug
```

## Common Issues to Check:
1. **Red Screen of Death** - Shows the actual error
2. **Yellow warnings** - Usually non-fatal but should be fixed
3. **"Taking much longer"** - Usually means:
   - Module import error
   - Infinite loop
   - Blocking operation
   - Missing dependency

## Quick Debug Commands:
```bash
# Clear cache and restart
cd frontend
npx expo start --clear

# Check for syntax errors
npx expo start --no-dev --minify

# View detailed logs
EXPO_DEBUG=true npx expo start
```

