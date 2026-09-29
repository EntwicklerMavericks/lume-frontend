import { inject } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let authReq = req;

  // Append Bearer token ONLY to our own backend API requests, NEVER to external services (like ViaCEP/BrasilAPI)
  const isInternalApi = req.url.startsWith(environment.apiUrl) || req.url.startsWith('/api') || req.url.includes('localhost:3000');

  if (token && isInternalApi) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle global API errors (e.g. 401 unauthorized)
  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && isInternalApi) {
        if (error.status === 401) {
          authService.logout();
        }
      }
      return throwError(() => error);
    })
  );
};
