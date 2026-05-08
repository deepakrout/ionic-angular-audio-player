import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// ─── Data models ─────────────────────────────────────────────────────────────

export interface AudioSegment {
  start_time: string;   // "HH:MM:SS"
  end_time: string | null;
  speaker?: string;
  text: string;
}

export interface AudioResource {
  Id: string;
  Title: string;
  SubTitle?: string;
  AudioURL: string;
  CaptionURL?: string;
  CaptionLang?: string;
  CaptionLabel?: string;
  Transcript?: string;
  Segments?: AudioSegment[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeToSeconds(t: string): number {
  if (!t) return 0;
  const parts = t.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Number(parts[0]) || 0;
}

function secondsToDisplay(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioPlayerComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input({ required: true }) audio!: AudioResource;

  @ViewChild('audioEl') audioEl!: ElementRef<HTMLAudioElement>;
  @ViewChild('transcriptScroll') transcriptScroll?: ElementRef<HTMLElement>;

  private cdr = inject(ChangeDetectorRef);

  isPlaying      = false;
  currentTime    = 0;
  duration       = 0;
  progressPct    = 0;
  activeSegIndex = -1;
  showTranscript = false;
  playbackSpeed  = 1;

  waveformBars  = [8, 14, 10, 18, 12, 20, 10, 16, 8, 14, 18, 10, 14, 8, 16];
  barDelays     = this.waveformBars.map((_, i) => i * 70);

  private speeds = [1, 1.25, 1.5, 2, 0.75];
  private speedIdx = 0;
  private segStartSeconds: number[] = [];

  ngOnInit(): void {
    if (this.audio.Segments?.length) {
      this.segStartSeconds = this.audio.Segments.map(s => timeToSeconds(s.start_time));
    }
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.pause();
  }

  onLoaded(): void {
    this.duration = this.audioEl.nativeElement.duration;
    this.cdr.markForCheck();
  }

  onPlay(): void {
    this.isPlaying = true;
    this.cdr.markForCheck();
  }

  onPause(): void {
    this.isPlaying = false;
    this.cdr.markForCheck();
  }

  onEnded(): void {
    this.isPlaying = false;
    this.currentTime = 0;
    this.progressPct = 0;
    this.activeSegIndex = -1;
    this.cdr.markForCheck();
  }

  onTimeUpdate(): void {
    const el = this.audioEl.nativeElement;
    this.currentTime = el.currentTime;
    this.duration    = el.duration || this.duration;
    this.progressPct = this.duration ? (this.currentTime / this.duration) * 100 : 0;
    this.updateActiveSegment();
    this.cdr.markForCheck();
  }

  togglePlay(): void {
    const el = this.audioEl.nativeElement;
    el.paused ? el.play() : el.pause();
  }

  private pause(): void {
    try { this.audioEl?.nativeElement?.pause(); } catch { /* noop */ }
  }

  skip(seconds: number): void {
    const el = this.audioEl.nativeElement;
    el.currentTime = Math.max(0, Math.min(el.currentTime + seconds, el.duration || 0));
  }

  seek(event: MouseEvent): void {
    const track = event.currentTarget as HTMLElement;
    const rect  = track.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    this.audioEl.nativeElement.currentTime = ratio * (this.audioEl.nativeElement.duration || 0);
  }

  onProgressKey(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowRight': this.skip(5);  event.preventDefault(); break;
      case 'ArrowLeft':  this.skip(-5); event.preventDefault(); break;
      case ' ':
      case 'Enter':      this.togglePlay(); event.preventDefault(); break;
    }
  }

  cycleSpeed(): void {
    this.speedIdx = (this.speedIdx + 1) % this.speeds.length;
    this.playbackSpeed = this.speeds[this.speedIdx];
    this.audioEl.nativeElement.playbackRate = this.playbackSpeed;
  }

  seekToSegment(seg: AudioSegment): void {
    const el = this.audioEl.nativeElement;
    el.currentTime = timeToSeconds(seg.start_time);
    if (el.paused) el.play();
  }

  toggleTranscript(): void {
    this.showTranscript = !this.showTranscript;
    this.cdr.markForCheck();
  }

  formatTime(s: number): string {
    return secondsToDisplay(s);
  }

  private updateActiveSegment(): void {
    if (!this.segStartSeconds.length) return;
    let lo = 0, hi = this.segStartSeconds.length - 1, idx = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (this.segStartSeconds[mid] <= this.currentTime) { idx = mid; lo = mid + 1; }
      else { hi = mid - 1; }
    }
    if (idx !== this.activeSegIndex) {
      this.activeSegIndex = idx;
      this.scrollActiveSegIntoView(idx);
    }
  }

  private scrollActiveSegIntoView(idx: number): void {
    if (!this.showTranscript || idx < 0) return;
    setTimeout(() => {
      const scrollEl = this.transcriptScroll?.nativeElement;
      if (!scrollEl) return;
      const segEl = scrollEl.querySelector(`#seg-${this.audio.Id}-${idx}`) as HTMLElement | null;
      if (!segEl) return;
      const containerRect = scrollEl.getBoundingClientRect();
      const segRect       = segEl.getBoundingClientRect();
      const segOffsetInContainer = segRect.top - containerRect.top + scrollEl.scrollTop;
      const targetScroll = segOffsetInContainer - scrollEl.clientHeight / 3;
      scrollEl.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
    }, 30);
  }
}
