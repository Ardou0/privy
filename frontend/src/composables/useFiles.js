import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

const downloadFile = async (content, fileName) => {
    try {
        // Sur mobile (Android/iOS)
        if (Capacitor.isNativePlatform()) {
            // Écrire le fichier dans le répertoire Documents
            // Écrire dans le dossier Downloads (Android) ou Documents (iOS)
            const directory = Capacitor.getPlatform() === 'android' ? Directory.ExternalStorage : Directory.Documents;
            const path = Capacitor.getPlatform() === 'android' ? `Download/${fileName}` : fileName;

            await Filesystem.writeFile({
                path,
                data: content,
                directory,
                encoding: Encoding.UTF8,
                recursive: true, // Crée le dossier s'il n'existe pas
            });

            return true;
        }
        // Sur le web
        else {
            const blob = new Blob([content], { type: 'application/x-pem-file' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('Téléchargement du fichier échoué:', error);
        throw error;
    }
}

const readFile = async (file) => {
    let content;
    // Sur mobile, lire le fichier via Filesystem
    if (Capacitor.isNativePlatform() && typeof file === 'string') {
        const result = await Filesystem.readFile({
            path: file,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
        });
        content = result.data;
    }
    // Sur le web, utiliser FileReader
    else {
        content = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    }
    return content;
}


export default {
    downloadFile,
    readFile
}