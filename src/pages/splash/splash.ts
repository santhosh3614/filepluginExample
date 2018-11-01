import { Component } from '@angular/core';
// import { MoreproviderProvider } from '../../providers/moreprovider/moreprovider';

@Component({
  selector: 'page-splash',
  templateUrl: 'splash.html'
})
export class SplashPage {

  ionViewDidLoad() {
    console.log('ionViewDidLoad SplashPage');
  }

  dismiss(){
    console.log('dismiss SplashPage');
    // this.moreProvider.dismissSplash()
  }

}
