import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  // Uses getters and setters to get/set to local storage
  // this should not do this and do something more secure
  get token(): string {
    return localStorage.getItem("token");
  }

  set token(token) {
    localStorage.setItem("token", token);
  }
}
