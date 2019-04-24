import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ITrip, IMemory } from 'src/app/shared/ITrips.interface';
import { Camera, DestinationType, MediaType, PictureSourceType, CameraOptions } from '@ionic-native/camera/ngx';
import { ToastController, IonSlides } from '@ionic/angular';
import { ToastOptions } from '@ionic/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireAuth } from '@angular/fire/auth';
import {first} from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

declare var google: any;
@Component({
  selector: 'app-addtrip',
  templateUrl: './addtrip.page.html',
  styleUrls: ['./addtrip.page.scss'],
})
export class AddtripPage implements OnInit {
  trip:ITrip;
  showDetails:boolean;
  photos:Array<any> = [];
  dateOptions:any;
  mapOptions: any;

  constructor(
    private camera:Camera,
    private toast:ToastController,
    private firestore:AngularFirestore,
    private firestorage:AngularFireStorage,
    private fireAuth:AngularFireAuth,
    private router:Router,
    public loadingController: LoadingController
    ) {
    this.initTrip();
    this.showDetails = false;
   
  }
  @ViewChild('slides') slides: IonSlides;
  @ViewChild('Map') map :ElementRef;
  @ViewChild('detailForm') detailForm:NgForm;

  ngOnInit() {
    this.dateOptions = {
      fromDateMin:'1970',
      fromDateMax:new Date().getFullYear(),
      toDateMin:'1970',
      toDateMax:new Date().getFullYear()
    };
    
  }

  locationChange() {
    // setTimeout(() => {
    //   var service = new google.maps.places.PlacesService(this.map);
    //   let request = {
    //     query: this.trip.location
    //   }
    //   service.nearbySearch(request, (result, status) => {
    //     console.log("Google Result - ",result)
    //     console.log("Google Status - ",status)
    //   })
    // }, 500)

  }

  parseDate(date:Date | string){
    const year = new Date(date).getFullYear();
    const month = new Date(date).getMonth();
    const day = new Date(date).getDate();
    return new Date(year,month,day,0,0,0,0);
  }

  dateToString(date:Date){
    const year = date.getFullYear();
    const month = date.getMonth()+1;
    const day = date.getDate();
    return year.toString() + '-' + (month<10?'0':'') + (date.getMonth()+1).toString() + '-' +  (day<10?'0':'') + day.toString();
  }

 toDateChange(){
    const diff = this.parseDate(this.trip.toDate).getTime() - this.parseDate(this.trip.fromDate).getTime();
    const oneDay = 1000*60*60*24;
    this.trip.duration = Math.round((diff / oneDay))+1;
 }

 fromDateChange(){
  this.dateOptions.toDateMax = new Date().getFullYear();
  this.dateOptions.toDateMin = this.dateToString(new Date(this.trip.fromDate));

 }


 async presentToast(message) {
  const toast = await this.toast.create({
    message: message,
    duration: 3000,
    color:'orange'
  });
  toast.present();
}

  async addTrip(){
    if(typeof this.detailForm=="undefined"){
      this.presentToast('Tap "Add Details" and fill out the details');
      return;
    }
   if(this.detailForm.invalid){
     this.presentToast("Please complete the fields with a *");
     return;
   }
    let loading = await this.loadingController.create({
      message: 'Creating Trip...'
    });
    loading.present();
    await this.firestore.collection('trips').add(this.trip).then((documentRef:DocumentReference)=>{
      this.trip.key = documentRef.id;
    });
    loading.dismiss();
    loading = await this.loadingController.create({
      message: 'Uploading Photos...'
    });
    loading.present();
    await this.uploadPhotos();
    loading.dismiss();
    loading = await this.loadingController.create({
      message: 'Finishing Trip...'
    });
    loading.present();
    await this.firestore.collection('trips').doc(this.trip.key).update(this.trip);
    loading.dismiss();

    this.initTrip();
    this.router.navigate(['main/tabs/trips']);
  }

  initTrip(){
    this.trip = {};
    this.trip = {
      uid:this.fireAuth.auth.currentUser.uid,
      fromDate:new Date(),
      toDate:new Date(),
      memories:[],
      photos:[]
    };
  }

  async uploadPhotos():Promise<any>{  
     return new Promise((resolve)=>{
          this.photos.map(async (photo,index)=>{
            const path = 'photos/' + this.trip.key +'/' + index;
            await this.firestorage.ref(path).putString(photo.substring(23),'base64');
            this.firestorage.ref(path).getDownloadURL().pipe(first()).subscribe((url)=>{
              this.trip.photos.push(url);
              resolve();
            });
          });
     })
  }


  removePhoto(index:number){
    this.photos.splice(index,1);
    this.slides.slidePrev();
  };

  async addPhoto() {
      const options: CameraOptions = {
        correctOrientation: true,
        destinationType: DestinationType.DATA_URL,
        mediaType: MediaType.PICTURE,
        sourceType: PictureSourceType.PHOTOLIBRARY,
        targetWidth:640
      };
      this.camera.getPicture(options).then(async (picture) => {
        const base64 = `data:image/jpeg;base64,${picture}`;
        this.photos.push(base64);
        setTimeout(()=>{
          this.slides.slideTo(this.photos.length);
        },100);
      });
  }


  addMemory(memory:IMemory){
    console.log("memory",memory)
    this.trip.memories.push({name:"",description:""});
  }


  removeMemory(index:number){
    console.log("removeMemory",index);
    this.trip.memories.splice(index,1);
  }

}
