import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor 
{  
  
  constructor() { }
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> 
  {
    // We have to clone the request because it is immutable
    request = request.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });

    console.log(`Intercepted at ${request.url}`);
    
    return next.handle(request);
  }
}