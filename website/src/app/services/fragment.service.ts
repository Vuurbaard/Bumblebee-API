import { AuthService } from './auth.service';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';


@Injectable()
export class FragmentService {

  constructor(private authService: AuthService, private http: Http) { }

  all(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.authService.getToken());

    return this.http.get('http://127.0.0.1:3000/audio/fragments',{headers: headers}).map(res => res.json());    
  }

  get( id : string ){
        let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.authService.getToken());
    return this.http.get('http://127.0.0.1:3000/audio/fragments?id=' + id, {headers: headers} ).map(res => res.json());    
  }

}
