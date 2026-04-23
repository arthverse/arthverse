/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  // App ID format: reverse-DNS. Use your own domain once you have one.
  // For Play Store submission this must be unique and stable forever.
  appId: 'com.arthverse.app',
  appName: 'ArthVyay',

  // Tells Capacitor which folder to bundle as the app's web assets.
  // We ship the CRA production build → `build/`.
  webDir: 'build',

  ios: {
    contentInset: 'always',
    scrollEnabled: true,
    backgroundColor: '#f8fafc',
  },
  android: {
    backgroundColor: '#f8fafc',
    allowMixedContent: false,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#1e3a8a',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1e3a8a',
    },
  },

  // DEV ONLY — for live-reload on a real device from your laptop dev server.
  // Uncomment + update IP for development, comment out for production builds.
  // server: {
  //   url: 'http://192.168.1.5:3000',
  //   cleartext: true,
  // },
};

module.exports = config;
