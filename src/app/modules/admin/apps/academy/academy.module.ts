import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_FORMATS, MatRippleModule } from '@angular/material/core';
import * as moment from 'moment';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';
import { academyRoutes } from 'app/modules/admin/apps/academy/academy.routing';
import { AcademyComponent } from 'app/modules/admin/apps/academy/academy.component';
import { AcademyDetailsComponent } from 'app/modules/admin/apps/academy/details/details.component';
import { AcademyListComponent } from 'app/modules/admin/apps/academy/list/list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { CotizacionDialogComponent } from './dialog/cotizacion-dialog/cotizacion-dialog.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { PolizaDialogComponent } from './dialog/poliza-dialog/poliza-dialog.component';

@NgModule({
    declarations: [
        AcademyComponent,
        AcademyDetailsComponent,
        AcademyListComponent,
        CotizacionDialogComponent,
        PolizaDialogComponent
    ],
    imports     : [
        RouterModule.forChild(academyRoutes),
        MatButtonModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatIconModule,
        MatInputModule,
        MatProgressBarModule,
        MatSelectModule,
        MatDialogModule,
        MatMomentDateModule,
        MatPaginatorModule,
        MatSidenavModule,
        MatDividerModule,
        MatSlideToggleModule,
        MatTooltipModule,
        FuseFindByKeyPipeModule,
        SharedModule,
        MatTabsModule
    ],
    providers   : [
        {
            provide : MAT_DATE_FORMATS,
            useValue: {
                parse  : {
                    dateInput: moment.ISO_8601
                },
                display: {
                    dateInput         : 'LL',
                    monthYearLabel    : 'MMM YYYY',
                    dateA11yLabel     : 'LL',
                    monthYearA11yLabel: 'MMMM YYYY'
                }
            }
        }
    ],
    entryComponents: [CotizacionDialogComponent,PolizaDialogComponent]

})
export class AcademyModule
{
}
