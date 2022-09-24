import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';

@Component({
    selector       : 'settings',
    templateUrl    : './settings.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit, OnDestroy
{
    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: any[] = [];
    selectedPanel: string = 'account';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _userService :UserService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to the user service
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User) => {
                
                if(user.tipo_usuario == null || user.tipo_usuario == 0){
                    this.panels = [
                        {
                            id         : 'account',
                            icon       : 'heroicons_outline:user-circle',
                            title      : 'Cuenta',
                            description: 'Administra tu perfil'
                        }
                    ];
                }else{
                    this.panels = [
                        {
                            id         : 'account',
                            icon       : 'heroicons_outline:user-circle',
                            title      : 'Cuenta',
                            description: 'Administra tu perfil'
                        },
                        {
                            id         : 'security',
                            icon       : 'heroicons_outline:lock-closed',
                            title      : 'Seguridad',
                            description: 'Administra tu contraseña'
                        }
                        /*,
                        {
                            id         : 'plan-billing',
                            icon       : 'heroicons_outline:credit-card',
                            title      : 'Plan & Billing',
                            description: 'Manage your subscription plan, payment method and billing information'
                        },
                        {
                            id         : 'notifications',
                            icon       : 'heroicons_outline:bell',
                            title      : 'Notifications',
                            description: 'Manage when you\'ll be notified on which channels'
                        },
                        {
                            id         : 'team',
                            icon       : 'heroicons_outline:user-group',
                            title      : 'Team',
                            description: 'Manage your existing team and change roles/permissions'
                        }*/
                    ];
                }
            });
        // Setup available panels
       

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Navigate to the panel
     *
     * @param panel
     */
    goToPanel(panel: string): void
    {
        this.selectedPanel = panel;

        // Close the drawer on 'over' mode
        if ( this.drawerMode === 'over' )
        {
            this.drawer.close();
        }
    }

    /**
     * Get the details of the panel
     *
     * @param id
     */
    getPanelInfo(id: string): any
    {
        return this.panels.find(panel => panel.id === id);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
}
