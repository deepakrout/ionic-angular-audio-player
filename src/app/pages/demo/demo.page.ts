import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AudioPlayerComponent, AudioResource } from 'src/app/shared/audio-player';
import { SAMPLE_AUDIOS } from 'src/assets/data/sample-audio';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.page.html',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, AudioPlayerComponent],
})
export class DemoPage {
  audioList: AudioResource[] = SAMPLE_AUDIOS;
}
