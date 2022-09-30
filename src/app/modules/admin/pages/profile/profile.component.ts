import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { ProcesoService } from 'app/services/processs/proceso.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'profile',
    templateUrl: './profile.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    user: User;
    data: any;

    /**
     * Constructor
     */
    constructor(private _userService: UserService, private _procesoService: ProcesoService,private _router: Router) {
    }
    ngOnInit(): void {
        // Subscribe to the user service
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User) => {
                console.log(user);
                this.user = user;
            });

        this._procesoService._procesosPorRenovar.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                console.log("pruebas "+data);
                
                // Store the data
                this.data = data;

            });

    }
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
    redirect(cod_proceso){
        console.log('hilasdsad');
        
        this._router.navigate(['/apps/academy/'+cod_proceso]);

    }
}
