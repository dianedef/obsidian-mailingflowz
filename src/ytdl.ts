import { Notice, Platform, App } from 'obsidian';
import { join } from 'path';
import { net } from '@electron/remote';
import { ProgressBar } from './ProgressBar';
import { Settings } from './Settings';

// Utiliser l'API moderne d'Electron
const electron = require('@electron/remote');
const PLUGIN_DIR = join(electron.app.getPath('userData'), '.obsidian', 'plugins', 'test-whisper');
const BINARY_NAME = Platform.isWin ? 'yt-dlp.exe' : 'yt-dlp';
const BINARY_PATH = join(PLUGIN_DIR, BINARY_NAME);

// En haut du fichier
let app: App;

export function setApp(obsidianApp: App) {
    app = obsidianApp;
}

// Fonction utilitaire pour exécuter yt-dlp
async function execYtDlp(args: string[], onProgress?: (progress: number) => void, onProcess?: (process: any) => void): Promise<string> {
    return new Promise((resolve, reject) => {
        const childProcess = electron.require('child_process');
        let output = '';
        
        const process = childProcess.execFile(BINARY_PATH, args, {
            cwd: PLUGIN_DIR
        });

        process.stdout.on('data', (data: string) => {
            output += data;
            
            // Analyser la progression
            const match = data.match(/\[download\]\s+(\d+\.?\d*)%/);
            if (match && onProgress) {
                const progress = parseFloat(match[1]);
                onProgress(progress);
            }
        });

        process.stderr.on('data', (data: string) => {
            output += data;
        });

        process.on('close', (code: number) => {
            if (code === 0) resolve(output);
            else reject(new Error(`Process exited with code ${code}`));
        });

        if (onProcess) {
            onProcess(process);
        }
    });
}

async function ensureDirectory(dir: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const fs = electron.require('fs');
        fs.access(dir, (err) => {
            if (err) {
                // Le dossier n'existe pas, on le crée
                fs.mkdir(dir, { recursive: true }, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            } else {
                resolve();
            }
        });
    });
}

async function downloadYtDlp(): Promise<boolean> {
    try {
        // S'assurer que le dossier existe
        await ensureDirectory(PLUGIN_DIR);

        // Utiliser l'API net d'Electron pour le téléchargement
        const url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/' + BINARY_NAME;
        
        return new Promise((resolve, reject) => {
            const request = net.request(url);
            const chunks: Buffer[] = [];

            request.on('response', (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`HTTP ${response.statusCode}`));
                    return;
                }

                response.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
                
                response.on('end', async () => {
                    try {
                        const buffer = Buffer.concat(chunks);
                        await electron.require('fs').promises.writeFile(BINARY_PATH, buffer);
                        
                        // Rendre exécutable sur Unix
                        if (!Platform.isWin) {
                            await new Promise((resolve, reject) => {
                                electron.require('child_process').exec(`chmod +x "${BINARY_PATH}"`, (error) => {
                                    if (error) reject(error);
                                    else resolve(null);
                                });
                            });
                        }
                        
                        resolve(true);
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            request.on('error', reject);
            request.end();
        });
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        return false;
    }
}

async function ensureYoutubeDl(): Promise<boolean> {
    try {
        // Vérifier si le binaire existe
        const exists = await new Promise<boolean>(resolve => {
            electron.require('fs').access(BINARY_PATH, (err) => {
                resolve(!err);
            });
        });

        if (!exists) {
            new Notice('Téléchargement de yt-dlp...');
            if (!await downloadYtDlp()) {
                throw new Error('Échec du téléchargement');
            }
        }

        // Tester le binaire
        const version = await execYtDlp(['--version']);
        console.log('yt-dlp version:', version);
        return true;
    } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        return false;
    }
}

export async function testYtdl(url: string = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'): Promise<boolean> {
    try {
        // S'assurer que youtube-dl est disponible
        if (!await ensureYoutubeDl()) {
            new Notice('Impossible d\'installer youtube-dl');
            return false;
        }

        // Tester youtube-dl avec les options correctes
        const output = await execYtDlp([
            url,
            '--dump-json',
            '--no-warnings',
            '--no-call-home',
            '--no-check-certificate',
            '--prefer-free-formats',
            '--youtube-skip-dash-manifest'
        ]);
        
        console.log('Informations de la vidéo:', JSON.parse(output));
        new Notice('Test youtube-dl réussi !');
        return true;
    } catch (error) {
        console.error('Erreur ytdl:', error);
        new Notice('Erreur lors du test youtube-dl');
        return false;
    }
}

export async function downloadVideo(url: string, format?: string): Promise<string> {
    let currentProcess: any = null;

    try {
        // S'assurer que yt-dlp est disponible
        if (!await ensureYoutubeDl()) {
            throw new Error('yt-dlp non disponible');
        }

        // Créer un dossier "downloads" dans le vault
        const vault = app.vault;
        const settings = await Settings.loadSettings();
        const downloadFolder = settings.downloadFolder || 'downloads';
        
        // Vérifier si le dossier existe, sinon le créer
        if (!(await vault.adapter.exists(downloadFolder))) {
            await vault.createFolder(downloadFolder);
        }

        // Obtenir le chemin absolu du dossier downloads dans le vault
        const downloadPath = join(vault.adapter.getBasePath(), downloadFolder);

        // Options de base pour le téléchargement
        const args = [
            url,
            '--no-warnings',
            '--no-call-home',
            '--no-check-certificate',
            '--output', join(downloadPath, '%(title)s.%(ext)s')
        ];

        // Ajouter le format si spécifié
        if (format) {
            args.push('--format', format);
        }

        // Créer une barre de progression avec bouton d'annulation
        const progressBar = new ProgressBar();
        progressBar.show(() => {
            if (currentProcess) {
                currentProcess.kill();
            }
        });

        // Lancer le téléchargement avec suivi de progression
        const output = await execYtDlp(args, (progress) => {
            progressBar.setProgress(progress);
        }, (process) => {
            currentProcess = process;
        });

        progressBar.hide();
        console.log('Téléchargement terminé:', output);
        
        // Extraire le chemin du fichier téléchargé depuis la sortie
        const match = output.match(/\[download\] (.*\.mp4) has already been downloaded|Destination: (.*\.mp4)/);
        if (!match) throw new Error('Impossible de trouver le fichier téléchargé');
        
        // Le chemin sera soit dans le groupe 1 (déjà téléchargé) soit dans le groupe 2 (nouveau téléchargement)
        return match[1] || match[2];
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        throw error;
    }
} 