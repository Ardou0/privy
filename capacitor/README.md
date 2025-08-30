
# Privy Mobile (Capacitor)

Welcome to the mobile packaging guide for Privy! This explains how to turn your Vue 3 frontend into a real Android/iOS app using Capacitor.

---

## 📦 How to Pack the App with Capacitor

1. **Build the Frontend**
	```sh
	cd ../frontend
	npm install
	npm run build
	```
	This creates a production build in `dist/`.

2. **Copy Build to Capacitor**
	```sh
	cp -r dist/* ../capacitor/www/
	```
	(Or use a script to automate this step.)

3. **Sync Capacitor**
	```sh
	cd ../capacitor
	npx cap sync android
    npx capacitor-assets generate
	```

4. **Open in Android Studio**
	```sh
	npx cap open android
	```
	Build and run the app on your device/emulator.

---

## 🛠️ Troubleshooting

- If you only see the background, check that all built files are in `www/` and asset paths are correct.
- Make sure `capacitor.config.json` has `"webDir": "www"`.
- Check router mode and asset paths for compatibility.

---

## 🚧 Next Updates

- Add iOS support and test on multiple devices
- Automate build/copy process with scripts
- Improve asset and font handling for mobile
- Add splash screen

---

## 📝 Final Note

This mobile packaging is part of my learning journey. If you spot any issues or have tips for better mobile integration, let me know!

Thanks for trying Privy on mobile! 🚀
