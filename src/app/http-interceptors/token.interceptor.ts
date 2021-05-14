import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor 
{  
  
  constructor(public authService: AuthService) {

  }
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> 
  {
    console.log("in interceptor, wow!");

    // We won't have an auth token on login, so don't try to get it, just send the request
    if(request.url.startsWith("http://localhost:9015/api/spotify/login"))
    {
      console.log("interceptor login");
      return next.handle(request);
    }

    console.log(request.headers);

    // We have to clone the request because it is immutable
    request = request.clone({
      setHeaders: {
        Authorization: `${this.authService.token}`
      }
    });
    
    return next.handle(request);
  }
}