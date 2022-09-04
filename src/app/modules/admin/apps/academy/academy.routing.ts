import { Route } from '@angular/router';
import { AcademyComponent } from 'app/modules/admin/apps/academy/academy.component';
import { AcademyListComponent } from 'app/modules/admin/apps/academy/list/list.component';
import { AcademyDetailsComponent } from 'app/modules/admin/apps/academy/details/details.component';
import { AcademyCategoriesResolver, AcademyCourseResolver, AcademyCoursesResolver, AnexosResolver, CompaniaResolver, CotizacionesResolver, PolizaResolver, ProductoResolver, RamoResolver } from 'app/modules/admin/apps/academy/academy.resolvers';
import { ModernComponent } from './invoice/modern.component';

export const academyRoutes: Route[] = [
    {
        path     : '',
        component: AcademyComponent,
        resolve  : {
            categories: AcademyCategoriesResolver
        },
        children : [
            {
                path     : '',
                pathMatch: 'full',
                component: AcademyListComponent,
                resolve  : {
                    courses: AcademyCoursesResolver
                }
            },
            {
                path     : ':id',
                component: AcademyDetailsComponent,
                resolve  : {
                    course: AcademyCourseResolver,
                    cotizacion : CotizacionesResolver,
                    producto: ProductoResolver,
                    ramo : RamoResolver,
                    compania: CompaniaResolver,
                    poliza: PolizaResolver,
                    anexos: AnexosResolver
                }
            },
            {
                path     : ':id/invoice',
                component: ModernComponent,
                resolve  : {
                    course: AcademyCourseResolver,
                    cotizacion : CotizacionesResolver,
                    producto: ProductoResolver,
                    ramo : RamoResolver,
                    compania: CompaniaResolver,
                    poliza: PolizaResolver,
                    anexos: AnexosResolver
                }
            }
        ]
    }
];
