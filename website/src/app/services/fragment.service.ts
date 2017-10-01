import { AuthService } from './auth.service';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { isDevMode } from '@angular/core';


@Injectable()
export class FragmentService {

  private host: String;

  constructor(private authService: AuthService, private http: Http) {

    if(isDevMode()) {
      this.host = 'http://localhost:3000';
    }
    else {
      this.host = 'http://bumblebee.mijnproject.nu:3000';
    }
  }

  all(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.authService.getToken());

    return this.http.get(this.host + '/audio/fragments',{headers: headers}).map(res => res.json());
  }

  get( id : string ){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.authService.getToken());
    return this.http.get(this.host + '/audio/fragments?id=' + id, {headers: headers} ).map(res => res.json());
  }

}
