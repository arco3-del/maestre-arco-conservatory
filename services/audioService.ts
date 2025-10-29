import { decode, decodeAudioData } from '../utils/audio';

class AudioService {
    private static instance: AudioService;
    private audioContext: AudioContext;
    private currentSource: AudioBufferSourceNode | null = null;

    private constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 24000
        });
    }

    public static getInstance(): AudioService {
        if (!AudioService.instance) {
            AudioService.instance = new AudioService();
        }
        return AudioService.instance;
    }

    public async play(base64Audio: string, onEnded?: () => void): Promise<void> {
        this.stop(); // Stop any currently playing audio

        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        try {
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                this.audioContext,
                24000,
                1,
            );
            
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            source.start();

            this.currentSource = source;
            
            source.onended = () => {
                if (this.currentSource === source) {
                    this.currentSource = null;
                }
                onEnded?.();
            };
        } catch (error) {
            console.error("Failed to play audio:", error);
            onEnded?.();
        }
    }

    public stop(): void {
        if (this.currentSource) {
            this.currentSource.onended = null;
            try {
                this.currentSource.stop();
            } catch (error) {
                // Ignore errors if the source has already been stopped
            }
            this.currentSource = null;
        }
    }
}

export const audioService = AudioService.getInstance();