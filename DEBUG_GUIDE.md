# How to Debug Expo Go App

## Method 1: Terminal Logs (Easiest)

All `console.log`, `console.error`, and `console.warn` statements appear in your terminal where you run `expo start`.

**To see more detailed logs:**
```bash
cd frontend
EXPO_DEBUG=true npx expo start --clear
```

## Method 2: Shake Your Phone

1. **Shake your physical device** (or press `Cmd+D` on iOS Simulator)
2. Tap **"Debug Remote JS"**
3. This opens **Chrome DevTools** in your browser
4. Go to **Console** tab to see all logs
5. Go to **Network** tab to see API calls

## Method 3: React Native Debugger

1. Install React Native Debugger (optional):
   ```bash
   brew install --cask react-native-debugger
   ```
2. Shake phone → "Debug Remote JS"
3. React Native Debugger will open automatically

## Method 4: Metro Bundler Logs

In your terminal, watch for:
- **Red text** = Errors
- **Yellow text** = Warnings
- **Green text** = Success messages

## Method 5: Enable Verbose Logging

Add to your `.env` file:
```env
EXPO_DEBUG=true
```

Then restart:
```bash
npx expo start --clear
```

## Method 6: Check Bundle Status

Look at terminal for:
- `Bundling...` = Still compiling
- `Bundled successfully` = Ready
- `Error:` = Something broke

## Method 7: Network Debugging

1. Shake phone → "Debug Remote JS"
2. Open Chrome DevTools
3. Go to **Network** tab
4. See all API calls, requests, responses

## Method 8: Component Debugging

Add logs to components:
```javascript
useEffect(() => {
  console.log('Component mounted');
  return () => console.log('Component unmounted');
}, []);
```

## Common Issues:

### "Taking much longer" = Bundle not completing
- Check terminal for **RED errors**
- Look for syntax errors
- Check for missing imports

### No logs at all = Bundle failed silently
- Run: `npx expo export --dev` to see errors
- Check for syntax errors in code

### App crashes = Check red screen
- Red screen shows the error
- Copy the error message
- Check stack trace

## Quick Debug Commands:

```bash
# Clear everything and restart with debug
cd frontend
rm -rf node_modules/.cache .expo
EXPO_DEBUG=true npx expo start --clear

# Check for syntax errors
npx expo export --dev

# View Metro bundler logs
# (They appear automatically in terminal)
```

## What to Look For:

1. **In Terminal:**
   - `✅ Firebase initialized successfully` = Good
   - `❌ Error:` = Problem
   - `🚀 App.js: Starting...` = App loading
   - `🔐 AuthProvider: Initializing...` = Auth loading

2. **In Chrome DevTools Console:**
   - All console.log statements
   - JavaScript errors
   - Network requests

3. **On Phone:**
   - Red screen = Error (read the message!)
   - Yellow warnings = Non-fatal issues
   - White screen = App crashed silently

