import { Component, OnInit } from '@angular/core';
import { AudioService } from '../../services/audio.service';

declare var WaveSurfer: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  text: string = "Please let this work";
  wavesurfer: any;

  constructor(private audioService: AudioService) { }

  ngOnInit() {
    var me = this;
    this.wavesurfer = WaveSurfer.create({
      container: '#waveform-tts',
      waveColor: '#2b3e50',
      progressColor: 'white'
    });

    this.wavesurfer.on('ready', function () {
      me.wavesurfer.play();
    });
  }

  tts(text) {
    this.audioService.tts(this.text).subscribe(data => {
      console.log('tts result:', data);
      this.wavesurfer.load("http://127.0.0.1:3000" + data.file);
    });
  }
}
