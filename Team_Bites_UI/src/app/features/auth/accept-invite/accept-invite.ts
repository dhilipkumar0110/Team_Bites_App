import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard-service';

type State = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-accept-invite',
  imports: [],
  templateUrl: './accept-invite.html',
  styleUrl: './accept-invite.scss',
})


export class AcceptInviteComponent implements OnInit {
 
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private http   = inject(HttpClient);
  private sessionService = inject(DashboardService);
 
  state        = signal<State>('loading');
  userName     = signal<string>('');
  errorMessage = signal<string>('');
 
  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
 
    if (!token) {
      this.state.set('error');
      this.errorMessage.set('No invite token found in the link.');
      return;
    }
 
    this.sessionService.acceptInvite(token).subscribe({
      next: (res) => {
        this.userName.set(res.name);
        this.state.set('success');

        setTimeout(() => {
          this.router.navigate(['/reset-password'], {
            queryParams: { token: res.token }
          });
        }, 2000);
      },

      error: (err) => {
        this.state.set('error');

        this.errorMessage.set(
          err.error?.message ?? 'This invite link is invalid or has expired.'
        );
      }
    });
  }
}
