import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SplashPage } from '../../pages/splash/splash';
import { App } from 'ionic-angular';

@Injectable()
export class MoreproviderProvider {

  private pauseReference:any;
  private resumeReference:any;

  constructor(private platform:Platform,public appCtrl: App) {
    console.log('Hello MoreproviderProvider Provider');
  }

  enableScreenSaver(){
    this.pauseReference = this.platform.pause.subscribe(() => {
      console.trace("pause called"); 
      this.openSplash();
    });
    this.resumeReference = this.platform.resume.subscribe(() => {
      console.trace("resume called"); 
      this.dismissSplash();
    });
  }

  disableScreenSaver(){
    this.pauseReference.unsubscribe();
    this.resumeReference.unsubscribe();
  }

  openSplash(){
    //  this.nav.push(SplashPage);
    this.appCtrl.getRootNav().push(SplashPage);
  }

  dismissSplash(){
    let view = this.appCtrl.getRootNav().getActive();
    if (view.instance instanceof SplashPage ){
      setTimeout(() => {
        this.appCtrl.getRootNav().pop();
      }, 1000);
    }
  }
}
