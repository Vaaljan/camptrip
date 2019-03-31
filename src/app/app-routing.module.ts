import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path:'', pathMatch:'full', redirectTo:'login'},
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'register', loadChildren: './register/register.module#RegisterPageModule' },
  { path: 'main', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'home', loadChildren: './tabs/home/home.module#HomePageModule' },
  { path: 'trips', loadChildren: './tabs/trips/trips.module#TripsPageModule' },
  { path: 'addtrip', loadChildren: './tabs/addtrip/addtrip.module#AddtripPageModule' },
  { path: 'explore', loadChildren: './tabs/explore/explore.module#ExplorePageModule' },
  { path: 'profile', loadChildren: './tabs/profile/profile.module#ProfilePageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}