
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- New Audio Synthesis Engine ---

let audioContext: AudioContext;
const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Piano and Organ Synthesis
export const playPianoNote = (frequency: number) => {
  const actx = getAudioContext();
  const oscillator = actx.createOscillator();
  const gainNode = actx.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(frequency, actx.currentTime);
  gainNode.connect(actx.destination);
  oscillator.connect(gainNode);

  const now = actx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.7, now + 0.02); // Attack
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.5); // Decay & Release

  oscillator.start(now);
  oscillator.stop(now + 1.5);
};

export const playOrganNote = (frequency: number) => {
  const actx = getAudioContext();
  const oscillator = actx.createOscillator();
  const gainNode = actx.createGain();

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(frequency, actx.currentTime);

  gainNode.connect(actx.destination);
  oscillator.connect(gainNode);
  
  const now = actx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.4, now + 0.05); // Attack
  
  oscillator.start(now);

  // Return a function to stop the note
  return () => {
    const now = actx.currentTime;
    gainNode.gain.linearRampToValueAtTime(0, now + 0.2); // Release
    oscillator.stop(now + 0.2);
  };
};

// Orchestration Panel Sounds
const playSimpleSound = (type: OscillatorType, frequency: number, duration: number, gain: number) => {
  const actx = getAudioContext();
  const oscillator = actx.createOscillator();
  const gainNode = actx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, actx.currentTime);
  gainNode.gain.setValueAtTime(gain, actx.currentTime);
  gainNode.connect(actx.destination);
  oscillator.connect(gainNode);
  oscillator.start();
  oscillator.stop(actx.currentTime + duration);
}

export const soundBank: { [key: string]: () => void } = {
    // Strings
    'Violin Pizzicato': () => {
        const actx = getAudioContext();
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0, actx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, actx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.3);
        osc.connect(gain).connect(actx.destination);
        osc.start();
        osc.stop(actx.currentTime + 0.5);
    },
    'Cello Sustain': () => {
        const actx = getAudioContext();
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = 220;
        gain.gain.setValueAtTime(0, actx.currentTime);
        gain.gain.linearRampToValueAtTime(0.4, actx.currentTime + 0.2); // Slow attack
        gain.gain.linearRampToValueAtTime(0, actx.currentTime + 1.5); // Slow release
        osc.connect(gain).connect(actx.destination);
        osc.start();
        osc.stop(actx.currentTime + 1.5);
    },
    // Brass
    'Trumpet Fanfare': () => playSimpleSound('square', 600, 0.4, 0.3),
    'Tuba Hit': () => playSimpleSound('square', 80, 0.5, 0.6),
    // Percussion
    'Kick Drum': () => {
        const actx = getAudioContext();
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.frequency.setValueAtTime(150, actx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.2);
        gain.gain.setValueAtTime(1, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.2);
        osc.connect(gain).connect(actx.destination);
        osc.start();
        osc.stop(actx.currentTime + 0.25);
    },
    'Snare Drum': () => {
        const actx = getAudioContext();
        const bufferSize = actx.sampleRate;
        const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (actx.sampleRate * 0.1));
        }
        const noise = actx.createBufferSource();
        noise.buffer = buffer;
        const filter = actx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        noise.connect(filter).connect(actx.destination);
        noise.start();
    },
    // Synths
    'Synth Pad': () => {
        const actx = getAudioContext();
        const osc1 = actx.createOscillator();
        const osc2 = actx.createOscillator();
        const gain = actx.createGain();
        osc1.type = 'sine';
        osc1.frequency.value = 440;
        osc2.type = 'sine';
        osc2.frequency.value = 442; // Detune for chorus effect
        gain.gain.setValueAtTime(0, actx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, actx.currentTime + 0.5);
        gain.gain.linearRampToValueAtTime(0, actx.currentTime + 2.5);
        osc1.connect(gain).connect(actx.destination);
        osc2.connect(gain).connect(actx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(actx.currentTime + 2.5);
        osc2.stop(actx.currentTime + 2.5);
    },
    'Synth Lead': () => playSimpleSound('sawtooth', 880, 0.3, 0.3),
    // FX
    'Sweep Effect': () => {
        const actx = getAudioContext();
        const noise = actx.createBufferSource();
        const bufferSize = actx.sampleRate * 2;
        const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1; }
        noise.buffer = buffer;
        const filter = actx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 15;
        filter.frequency.setValueAtTime(20, actx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(20000, actx.currentTime + 2);
        noise.connect(filter).connect(actx.destination);
        noise.start();
    }
};