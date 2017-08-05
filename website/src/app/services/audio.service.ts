import { AuthService } from './auth.service';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { isDevMode } from '@angular/core';

@Injectable()
export class AudioService {

  private host: String;

  constructor(private authService: AuthService, private http: Http) {
    if(isDevMode()) {
      this.host = 'http://localhost:3000';
    }
    else {
      this.host = 'http://bumblebee.mijnproject.nu:3000';
    }

   }

  downloadYouTubeAudio(url : string) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.authService.getToken());

    return this.http.post(this.host + '/audio/youtube', { url: url }, { headers: headers }).map(res => res.json());
  }

  // getFragments(id : string,) {
  //   let headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //   headers.append('Authorization', this.authService.getToken());

  //   let params: URLSearchParams = new URLSearchParams();
  //   params.set('id', id);

  //   let requestOptions = new RequestOptions();
  //   requestOptions.headers = headers;
  //   requestOptions.body.id = id;

  //   return this.http.get('http://127.0.0.1:3000/audio/fragments', requestOptions).map(res => res.json());
  // }

  saveFragments(id : string, fragments: Array<any>) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.authService.getToken());

    return this.http.post(this.host + '/audio/fragments', { id: id, fragments: fragments }, { headers: headers }).map(res => res.json());
  }

  tts(text: string) {
    console.log("tts:", text);
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.authService.getToken());

    return this.http.post(this.host + '/audio/tts', { text: text}, { headers: headers }).map(res => res.json());
  }
}
