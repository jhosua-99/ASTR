import { Route } from '@angular/router';
import { ProfileComponent } from 'app/modules/admin/pages/profile/profile.component';
import { ProfileResolver } from './profile.resolvers';

export const profileRoutes: Route[] = [
    {
        path     : '',
        component: ProfileComponent,
        resolve  : {
            data: ProfileResolver
        }
    }
];
