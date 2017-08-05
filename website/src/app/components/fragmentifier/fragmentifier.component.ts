import { Component, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { AudioService } from '../../services/audio.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';

import { isDevMode } from '@angular/core';

declare var WaveSurfer: any;

@Component({
  selector: 'fragmentifier',
  templateUrl: './fragmentifier.component.html',
  styleUrls: ['./fragmentifier.component.css'],
})
export class FragmentifierComponent implements OnInit {

  wavesurfer: any;
  slider: any;
  canvas: any;

  downloaded: Boolean = false;
  start: Number;
  end: Number;
  isFragmenting: Boolean = false;
  fragments: Array<any> = [];
  youtube: string = "https://www.youtube.com/watch?v=9-yUbFi7VUY";
  private host: String;

  constructor(private audioService: AudioService, private flashMessagesService: FlashMessagesService, private router: Router) {
    if(isDevMode()) {
      this.host = 'http://localhost:3000';
    }
    else {
      this.host = 'http://bumblebee.mijnproject.nu:3000';
    }


   }

  ngOnInit() {
    var me = this;

    this.wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#2b3e50',
      progressColor: 'white'
    });

    this.slider = document.querySelector('#slider');

    this.slider.oninput = function () {
      var zoomLevel = Number(me.slider.value);
      me.wavesurfer.zoom(zoomLevel);
    };

    //this.wavesurfer.load('http://ia902606.us.archive.org/35/items/shortpoetry_047_librivox/song_cjrg_teasdale_64kb.mp3');

  }

  download() {
    console.log('Downloading from YT url:', this.youtube);
    this.audioService.downloadYouTubeAudio(this.youtube).subscribe(data => {
      console.log('Downloaded YT thing:', data);
      this.wavesurfer.load(this.host + data.url);
        this.downloaded = true;
        this.fragments = data.fragments;
    });
  }

  another() {
    this.downloaded = false;
    this.start = null;
    this.end = null;
    this.isFragmenting = false;
    this.fragments = [];
  }

  play() {
    this.wavesurfer.play();
  }

  pause() {
    this.wavesurfer.pause();
  }

  fragmentStart() {
    if (!this.isFragmenting) {
      this.start = this.wavesurfer.backend.getCurrentTime();
      this.isFragmenting = true;
    }
  }

  fragmentEnd() {
    if (this.isFragmenting) {
      this.end = this.wavesurfer.backend.getCurrentTime();
      this.isFragmenting = false;

      let fragment = {
        start: this.start,
        end: this.end,
        word: "",
      }

      this.fragments.push(fragment);
    }

  }

  removeFragment(fragment) {
    this.fragments.splice(this.fragments.indexOf(fragment), 1);
  }

  playFragment(fragment) {
    var start = Number(fragment.start);
    var end = Number(fragment.end);
    this.wavesurfer.play(start, end);
  }

  save() {
    let id = this.youtube.replace('https://www.youtube.com/watch?v=', '');

    this.audioService.saveFragments(id, this.fragments).subscribe(data => {
      if(data.success) {
        this.flashMessagesService.show('Fragments are submitted for review! Thank you!', {
          cssClass: 'alert-success',
          timeout: 5000
        });
      }
      else {
        this.flashMessagesService.show(data.error, {
          cssClass: 'alert-danger',
          timeout: 5000
        });
      }
    });    

  }
}
