import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  // Uses getters and setters to get/set to local storage
  // this should not do this and do something more secure
  get accessToken(): string {
    return localStorage.getItem("accessToken");
  }

  set accessToken(token: string) {
    localStorage.setItem("accessToken", token);
  }

  get refreshToken(): string {
    return localStorage.getItem("refreshToken");
  }

  set refreshToken(token: string) {
    localStorage.setItem("refreshToken", token);
  }
}
