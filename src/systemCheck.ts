import { testYtdl } from './ytdl';

interface SystemRequirements {
    whisper: boolean,
    ffmpeg: boolean,
    ytdl: boolean
}

export async function checkSystemRequirements(): Promise<SystemRequirements> {
    const result = {
        whisper: false,
        ffmpeg: false,
        ytdl: false
    };

    // Test ytdl en premier
    result.ytdl = await testYtdl();
    console.log('Status ytdl:', result.ytdl);

    // On garde les autres tests pour plus tard
    try {
        await import('@xenova/transformers');
        result.whisper = true;
    } catch (error) {
        console.error('Whisper.js non disponible:', error);
    }

    try {
        await import('@ffmpeg/ffmpeg');
        result.ffmpeg = true;
    } catch (error) {
        console.error('FFmpeg.wasm non disponible:', error);
    }

    return result;
} 