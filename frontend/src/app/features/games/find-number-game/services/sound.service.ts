import { inject, Injectable } from "@angular/core";
import { FindNumberGameService } from "./findnumber.service";

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private readonly findNumberGameService = inject(FindNumberGameService);

  private audioContext?: AudioContext;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    if (!this.audioContext) {
      this.audioContext = new AudioContextClass();
    }

    return this.audioContext;
  }

  
  public async playSound(type: 'correct' | 'wrong' | 'victory') {
    try {
      
      const audioContext = this.getContext();
      
      if (!audioContext) {
        return;
      };

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.connect(gain);
      gain.connect(audioContext.destination);

      if (type === 'correct') {
        osc.type = 'triangle';
        const freqOffset = this.findNumberGameService.curentTargetNumber() * 3.5;
        osc.frequency.setValueAtTime(380 + freqOffset, audioContext.currentTime);
        gain.gain.setValueAtTime(0.12, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
        osc.start();
        osc.stop(audioContext.currentTime + 0.2);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(125, audioContext.currentTime);
        gain.gain.setValueAtTime(0.15, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
        osc.start();
        osc.stop(audioContext.currentTime + 0.3);
      } else if (type === 'victory') {
        const notes = [261.63, 329.63, 392.0, 523.25];
        notes.forEach((freq, idx) => {
          const o = audioContext.createOscillator();
          const g = audioContext.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, audioContext.currentTime + idx * 0.1);
          g.gain.setValueAtTime(0.1, audioContext.currentTime + idx * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + idx * 0.1 + 0.6);
          o.connect(g);
          g.connect(audioContext.destination);
          o.start(audioContext.currentTime + idx * 0.1);
          o.stop(audioContext.currentTime + idx * 0.1 + 0.8);
        });
      }
    } catch (_) {}
  }
}
