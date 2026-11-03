import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { routes } from './app.routes';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { LandingComponent } from './components/landing/landing.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthService } from './services/auth.service';
import { ReportService } from './services/report.service';
import { Report } from './models/report';
import { User } from './models/user';
import { environment } from '../environments/environment';

describe('Resume readiness: entry routes', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));
  for (const url of ['/', '/old-bookmark']) {
    it(`shows the home page at ${url}`, async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl(url, HomeComponent);
      expect(harness.routeNativeElement?.textContent).toContain('Welcome to NeighborNet!');
      expect(TestBed.inject(Router).url).toBe('/home');
    });
  }
});

describe('Resume readiness: authentication and public data', () => {
  let http: HttpTestingController;
  let auth: AuthService;
  beforeEach(() => {
    localStorage.removeItem('credentials');
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });
  afterEach(() => { http.verify(); localStorage.removeItem('credentials'); });

  it('encodes UTF-8 credentials without the Node Buffer package', () => {
    const expected = new TextEncoder().encode('demo:pássword');
    const actual = Uint8Array.from(atob(auth.generateBasicAuthCredentials('demo', 'pássword')), c => c.charCodeAt(0));
    expect(actual).toEqual(expected);
  });
  it('emits an Error when logged out, without sending a request', () => {
    let error: unknown;
    auth.getLoggedInUser().subscribe({ error: e => error = e });
    expect(error).toEqual(jasmine.any(Error));
    http.expectNone(environment.baseUrl + 'authenticate');
  });
  it('authenticates without printing credentials', () => {
    const log = spyOn(console, 'log');
    auth.login('demo', 'test-password').subscribe();
    const request = http.expectOne(environment.baseUrl + 'authenticate');
    expect(request.request.headers.get('Authorization')).toBe('Basic ' + btoa('demo:test-password'));
    request.flush({ username: 'demo' });
    expect(auth.checkLogin()).toBeTrue();
    expect(log).not.toHaveBeenCalled();
    auth.logout();
    expect(auth.checkLogin()).toBeFalse();
  });
  it('loads public map reports without sending Basic null', () => {
    TestBed.inject(ReportService).index().subscribe();
    const request = http.expectOne(environment.baseUrl + 'api/reports');
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush([]);
  });
});

describe('Resume readiness: registration', () => {
  it('keeps form fields distinct and masks the password', async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: {} }],
    }).compileComponents();
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const inputs = Array.from(fixture.nativeElement.querySelectorAll('input')) as HTMLInputElement[];
    const names = inputs.map(input => input.name);
    expect(new Set(names).size).toBe(names.length);
    expect(inputs.find(input => input.name === 'password')?.type).toBe('password');
    for (const field of ['street', 'city', 'state', 'postalCode', 'country']) {
      const input = inputs.find(input => input.name === field)!;
      input.value = 'value-' + field;
      input.dispatchEvent(new Event('input'));
    }
    expect(fixture.componentInstance.newUser.address.street).toBe('value-street');
    expect(fixture.componentInstance.newUser.address.city).toBe('value-city');
    expect(fixture.componentInstance.newUser.address.state).toBe('value-state');
  });

  it('registers, logs in once and navigates to the feed', () => {
    const auth = jasmine.createSpyObj('AuthService', ['register', 'login']);
    const router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    auth.register.and.returnValue(of(new User()));
    auth.login.and.returnValue(of(new User()));
    const component = new RegisterComponent(auth, router);
    component.register(new User());
    expect(auth.register).toHaveBeenCalledTimes(1);
    expect(auth.login).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/landing');
    expect(component.submitting).toBeFalse();
  });

  it('shows a registration failure instead of leaving the form stuck', () => {
    const auth = jasmine.createSpyObj('AuthService', ['register', 'login']);
    auth.register.and.returnValue(throwError(() => new Error('Test failure')));
    const component = new RegisterComponent(auth, {} as Router);
    component.register(new User());
    expect(component.errorMessage).toContain('Registration failed');
    expect(component.submitting).toBeFalse();
    expect(auth.login).not.toHaveBeenCalled();
  });
});

describe('Resume readiness: saving reports', () => {
  for (const screen of ['feed', 'profile']) {
    it(`makes a single update request from the ${screen}`, () => {
      const service = jasmine.createSpyObj('ReportService', ['update']);
      const report = new Report();
      service.update.and.returnValue(of(report));
      const component = screen === 'feed'
        ? new LandingComponent(service, {} as any, {} as any, {} as any)
        : new ProfileComponent({} as any, service, {} as any);
      spyOn(component, 'reload');
      component.editReport = report;
      component.showUpdateForm = report;
      component.updateReport(report);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(component.showUpdateForm).toBeNull();
      expect(component.reload).toHaveBeenCalledTimes(1);
    });
  }
});
