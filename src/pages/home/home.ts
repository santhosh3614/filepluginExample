import { Component,ViewChild, Renderer } from '@angular/core';
import { NavController,Platform, normalizeURL, Content } from 'ionic-angular';
import { File, IWriteOptions } from '@ionic-native/file';
import { ToastController } from 'ionic-angular';
import { FileOpener } from '@ionic-native/file-opener';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Http } from '@angular/http';
import * as jsPDF from 'jspdf';
import { EmailComposer } from '@ionic-native/email-composer';
import { Printer, PrintOptions } from '@ionic-native/printer';
import { Contacts, Contact, ContactField, ContactName } from '@ionic-native/contacts';
import { MoreproviderProvider } from '../../providers/moreprovider/moreprovider';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('imageCanvas') canvas: any;
  canvasElement: any;
 
  saveX: number;
  saveY: number;

  @ViewChild(Content) content: Content;
  @ViewChild('fixedContainer') fixedContainer: any;
  // Color Stuff
  selectedColor = '#9e2956';
  colors = [ '#9e2956', '#c2281d', '#de722f', '#edbf4c', '#5db37e', '#459cde', '#4250ad', '#802fa3' ];

  constructor(public navCtrl: NavController,private file: File,public renderer: Renderer,
    private plt: Platform,private toastCtrl: ToastController,private fileOpener:FileOpener,
    private localNotifications: LocalNotifications,
    public _http: Http,
    private emailComposer: EmailComposer,
    private printer: Printer,
    private contacts: Contacts,
    private moreProvider:MoreproviderProvider) {}

  ionViewDidEnter() {
    console.log("ionViewDidEnter")
    // https://github.com/ionic-team/ionic/issues/9071#issuecomment-362920591
    // Get the height of the fixed item
    let itemHeight = this.fixedContainer.nativeElement.offsetHeight;
    let scroll = this.content.getScrollElement();
 
    // Add preexisting scroll margin to fixed container size
    itemHeight = Number.parseFloat(scroll.style.marginTop.replace("px", "")) + itemHeight;
    scroll.style.marginTop = itemHeight + 'px';
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad");
    // Set the Canvas Element and its size
    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = this.plt.width() + '';
    this.canvasElement.height = 200;
  }

  selectColor(color) {
    this.selectedColor = color;
  }

  startDrawing(ev) {
    var canvasPosition = this.canvasElement.getBoundingClientRect();
   
    this.saveX = ev.touches[0].pageX - canvasPosition.x;
    this.saveY = ev.touches[0].pageY - canvasPosition.y;
  }

  moved(ev) {
    var canvasPosition = this.canvasElement.getBoundingClientRect();
   
    let ctx = this.canvasElement.getContext('2d');
    let currentX = ev.touches[0].pageX - canvasPosition.x;  
    let currentY = ev.touches[0].pageY - canvasPosition.y;
   
    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.selectedColor;
    ctx.lineWidth = 5;
   
    ctx.beginPath();
    ctx.moveTo(this.saveX, this.saveY);
    ctx.lineTo(currentX, currentY);
    ctx.closePath();
   
    ctx.stroke();
   
    this.saveX = currentX;
    this.saveY = currentY;
  }

  emailCanvasImage(){
    this.moreProvider.disableScreenSaver();

    var dataUrl = this.canvasElement.toDataURL('image/jpeg',1.0);//image/jpeg, image/png
    let ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clears the canvas
   
    let name = new Date().getTime() + '.pdf';
    let path = this.file.externalRootDirectory ;

    let options: IWriteOptions = { replace: true };
    var data = dataUrl.split(',')[1];

    this.emailComposer.isAvailable().then((available: boolean) =>{
      console.log("Email Composer Available:"+available);
      this.emailComposer.hasPermission()
         .then((isPermitted : boolean) =>{
          console.log("Email Composer isPermitted:"+isPermitted);
          let email = {
            to: 'santhosh@gmail.com',
            cc: 'santhoshkumargundavarapu@gmail.com',
            attachments: [
              'base64:icon.png//'+data
            ],
            subject: 'Cordova Icons',
            body: 'Hi XXXX, find your ID card attachment',
            isHtml: true,
            app: 'gmail'
          };

          if(this.plt.is('android')){
            this.emailComposer.addAlias('gmail', 'com.google.android.gm');
          }
                   
          // Send a text message using default options
          this.emailComposer.open(email).then(()=>{
            this.moreProvider.enableScreenSaver();
          },()=>{
            this.moreProvider.enableScreenSaver();
          });
          // this.moreProvider.enableScreenSaver();
         })
     });
  }

  saveCanvasImage() {
    var dataUrl = this.canvasElement.toDataURL('image/jpeg',1.0);//image/jpeg, image/png
    let ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clears the canvas
   
    let name = new Date().getTime() + '.pdf';
    let path = this.file.externalRootDirectory ;

    let options: IWriteOptions = { replace: true };
    var data = dataUrl.split(',')[1];

    this._http.get('../../assets/blob_1538368396450.txt')
          .subscribe(text => {
            data= text;
            // data="gFAKAUB//Z";
            let blob = this.b64toBlob(data, 'application/pdf');

            this.file.checkDir(path, "Download").then((success)=>{
              if(success){
                this.saveFile(path+"Download/",name,blob,options);
              }else{
                this.file.createDir(path, "Download", false).then((success)=>{
                  if(success){
                    this.saveFile(path+"Download/",name,blob,options);
                  }
                });
              }
            });
          });

    // var pdf = new jsPDF();
    // pdf.addImage(dataUrl, 'JPEG', 0, 0);
    // pdf.save("download.pdf");
  }

  printCanvasImage(){
    var dataUrl = this.canvasElement.toDataURL('image/jpeg',1.0);//image/jpeg, image/png
    let ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clears the canvas
   
    let name = new Date().getTime() + '.pdf';
    let path = this.file.externalRootDirectory ;

    let options: IWriteOptions = { replace: true };
    var data = dataUrl.split(',')[1];

    this.printer.isAvailable().then((success)=>{
        console.log("printer success isAvailable");
        let options: PrintOptions = {
          name: 'MyDocument'
        };
    
        let printData= "<img src='"+dataUrl+"'></img>"
        this.printer.print(printData, options).then((success)=>{
          console.log("printer success");
        }, (error)=>{
          console.log("Error in print");
        });
    }, (error)=> {
        console.log("Error in print: isAvailable");
    });
  }

  saveFile(path,name,blob,options){
    this.file.writeFile(path, name, blob, options).then(res => {

      console.log('Success: ', JSON.stringify(res));

      let toast = this.toastCtrl.create({
        message: 'ID saved successfully',
        duration: 5000,
        showCloseButton: true,
        closeButtonText: 'open'
      });

      toast.onDidDismiss(() => {
            console.log('Dismissed toast');
            this.fileOpener.open(path+name, 'application/pdf')
        .then(() => console.log('File is opened'))
        .catch(e => console.log('Error opening file', e));
      });
      toast.present();

      // Schedule a single notification
      this.localNotifications.hasPermission().then((granted)=> { 
        this.localNotifications.schedule({
          id: 1,
          text: 'Download Succesfull',
        })
        this.localNotifications.on("click").subscribe((data) => {
          this.fileOpener.open(path+name, 'application/pdf')
        });
      })
    }, err => {
      console.log('Error: ', JSON.stringify(err));
    });
  }

  b64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];
   
    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);
   
      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
   
      var byteArray = new Uint8Array(byteNumbers);
   
      byteArrays.push(byteArray);
    }
   
    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  saveContact(){
    let contact: Contact = this.contacts.create();

    contact.name = new ContactName(null, 'Smith', 'John');
    contact.phoneNumbers = [new ContactField('mobile', '6471234567')];
    contact.save().then(
      () => console.log('Contact saved!', contact),
      (error: any) => console.error('Error saving contact.', error)
    );
  }

  splash(){
    this.moreProvider.openSplash();
  }

  ionViewWillLeave() {
    console.log("ionViewWillLeave");
  }

  ionViewWillEnter() {
    console.log("ionViewWillEnter");
  }

  ionViewDidLeave() {
    console.log("ionViewDidLeave");
  }

  ionViewWillUnload	() {
    console.log("ionViewWillUnload	");
  }

  ionViewCanEnter() {
    console.log("ionViewCanEnter");
  }

  ionViewCanLeave() {
    console.log("ionViewCanLeave");
  }
}