# Privy Mobile (Capacitor)

Instructions de packaging du client web Vue 3 en application mobile hybride via Capacitor.

## Build et Synchronisation

1.  Compiler le client :
    ```sh
    cd ../frontend
    npm run build
    ```
2.  Copier les sources compilees :
    ```sh
    cp -r dist/* ../capacitor/www/
    ```
3.  Synchroniser le projet natif :
    ```sh
    cd ../capacitor
    npx cap sync android
    ```
4.  Compiler avec Android Studio :
    ```sh
    npx cap open android
    ```

## Dette technique et securite

*   Sur-provisionnement de permissions : Le fichier AndroidManifest.xml demande des accès GPS (ACCESS_FINE_LOCATION), camera (CAMERA), et microphone (RECORD_AUDIO) qui ne sont pas utilises par l'application. Cette configuration provenait d'une tentative de resoudre des problemes d'acces aux fichiers locaux lors du developpement en activant l'ensemble des permissions standard.

## Retrospective

*   Principe du moindre privilege : Ne declarer que la permission INTERNET. Les permissions Camera, Audio ou Location doivent etre supprimees car elles entrainent un rejet systematique sur les stores.
*   Permissions au runtime : Pour les besoins reels, interroger l'utilisateur dynamiquement au moment de l'action plutot que de declarer les permissions globalement au niveau du systeme d'exploitation.
*   Automatisation : Configurer webDir sur ../frontend/dist dans la configuration Capacitor pour eviter la copie manuelle des builds.
