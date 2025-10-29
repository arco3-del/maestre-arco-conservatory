/**
 * Implements a pitch detection algorithm (AMDF) to find the fundamental frequency.
 * @param buf - The audio buffer (Float32Array).
 * @param sampleRate - The sample rate of the audio context.
 * @returns The detected frequency in Hz, or -1 if not found.
 */
export function getPitch(buf: Float32Array, sampleRate: number): number {
    const SIZE = buf.length;
    const MAX_SAMPLES = Math.floor(SIZE / 2);
    let best_offset = -1;
    let best_correlation = 0;
    let rms = 0;
    let foundGoodCorrelation = false;
    const correlations = new Array(MAX_SAMPLES);

    for (let i = 0; i < SIZE; i++) {
        const val = buf[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) { // not enough signal
        return -1;
    }

    let lastCorrelation = 1;
    for (let offset = 0; offset < MAX_SAMPLES; offset++) {
        let correlation = 0;

        for (let i = 0; i < MAX_SAMPLES; i++) {
            correlation += Math.abs((buf[i]) - (buf[i + offset]));
        }
        correlation = 1 - (correlation / MAX_SAMPLES);
        correlations[offset] = correlation; // store it, for the tweaking we need to do below.
        if ((correlation > 0.9) && (correlation > lastCorrelation)) {
            foundGoodCorrelation = true;
            if (correlation > best_correlation) {
                best_correlation = correlation;
                best_offset = offset;
            }
        } else if (foundGoodCorrelation) {
            // short-circuit - we found a good correlation, then a bad one, so we'd just be seeing harmonics now.
            if (best_offset > 0 && best_offset < correlations.length - 1) {
                 const shift = (correlations[best_offset + 1] - correlations[best_offset - 1]) / correlations[best_offset];
                 return sampleRate / (best_offset + (8 * shift));
            }
            return sampleRate / best_offset;
        }
        lastCorrelation = correlation;
    }
    if (best_correlation > 0.01) {
        return sampleRate / best_offset;
    }
    return -1;
}

// Note names
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const A4 = 440;
const C0 = A4 * Math.pow(2, -4.75);

export function frequencyToNoteName(frequency: number): { name: string, octave: number } {
    if (frequency <= 0) return { name: "", octave: 0 };
    const h = Math.round(12 * Math.log2(frequency / C0));
    const octave = Math.floor(h / 12);
    const noteIndex = h % 12;
    return { name: notes[noteIndex], octave };
}

export function noteToFrequency(noteName: string, octave: number): number {
    const noteIndex = notes.indexOf(noteName);
    const noteNumber = noteIndex + octave * 12;
    return C0 * Math.pow(2, noteNumber / 12);
}

export function getCentsDeviation(frequency: number, targetFrequency: number): number {
    if (frequency <= 0 || targetFrequency <= 0) return 0;
    return 1200 * Math.log2(frequency / targetFrequency);
}