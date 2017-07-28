import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { tokenNotExpired } from 'angular2-jwt';
import { isDevMode } from '@angular/core';

@Injectable()
export class AuthService {

  private authToken: any;
  user: any;
  private host: String;

  constructor(private http:Http) { 
    if(isDevMode()) {
      this.host = 'http://localhost:3000/';
    }
    else {
      this.host = 'http://zunz,io:3000/';
    }
  }

  registerUser(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this.http.post(this.host + 'users/register', user, {headers: headers}).map(res => res.json());
  }

  authenticateUser(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this.http.post(this.host + 'users/authenticate', user, {headers: headers}).map(res => res.json());
  }

  storeUserData(token, user) {
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  logout() {
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }

  getToken() {
    this.loadToken();
    return this.authToken;
  }

  private loadToken() {
    this.authToken = localStorage.getItem('id_token');
  }

  loggedIn() {
    return tokenNotExpired();
  }

  getProfile() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.getToken());

    return this.http.get(this.host + 'users/profile', {headers: headers}).map(res => res.json());
  }
}
