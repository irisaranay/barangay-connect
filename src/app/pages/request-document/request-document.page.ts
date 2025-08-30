import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, AlertController, ActionSheetController, Platform } from '@ionic/angular';
import { DocumentRequestService } from 'src/app/services/document-request.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { RegistrationService } from 'src/app/services/registration.service';

@Component({
  selector: 'app-request-document',
  templateUrl: './request-document.page.html',
  styleUrls: ['./request-document.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
})
export class RequestDocumentPage implements OnInit {
  documentType = '';
  purpose = '';
  customPurpose = '';
  numberOfCopies: number = 1;
  requirements = '';
  photo: string = '';
  uploadedPhoto: string | null = null;
  requests: any[] = [];
  dateNow: string = '';
  timeNow: string = '';


  documentOptions = [
    'Barangay Clearance',
    'Certificate of Residency',
    'Certificate of Indigency',
  ];

  purposeOptions = [
    'Employment',
    'School Requirement',
    'Financial Assistance',
    'Others',
  ];

  constructor(
    private navCtrl: NavController,
    private requestService: DocumentRequestService,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private platform: Platform,
    private registrationService: RegistrationService
  ) {}

  ngOnInit() {
  const now = new Date();
  this.dateNow = now.toLocaleDateString();
  this.timeNow = now.toLocaleTimeString();

  const currentUser = this.registrationService.getCurrentUser();

  if (currentUser && currentUser.contact) {
    this.requestService.getRequestsByContact(currentUser.contact).then((myRequests) => {
      this.requests = myRequests;
      console.log('📄 My Requests:', this.requests);
    });
  } else {
    console.warn('⚠️ No logged-in user found.');
  }
}


  onCancel() {
    this.navCtrl.back();
  }

  
  async onContinue() {
  if (this.purpose === 'Others' && !this.customPurpose.trim()) {
    alert('Please specify your purpose.');
    return;
  
  }

  if (this.numberOfCopies < 1) {
    alert('Number of copies must be at least 1.');
    return;
  }
  
  const finalPurpose = this.purpose === 'Others' ? this.customPurpose : this.purpose;

  const currentUser = this.registrationService.getCurrentUser();

  if (!currentUser || !currentUser.contact) {
    alert('No logged-in user found.');
    return;
  }

  const requestData = {
    documentType: this.documentType,
    purpose: finalPurpose,
    copies: this.numberOfCopies,
    requirements: this.requirements,
    photo: this.photo,
    timestamp: new Date().toISOString(),
    contact: currentUser.contact, // ✅ Attach the contact here
  };

  await this.requestService.addRequest(requestData);

  const successAlert = await this.alertCtrl.create({
    header: 'Success',
    message: 'Your request has been submitted.',
    buttons: ['OK'],
  });

  await successAlert.present();
  this.resetForm();
}


  async openPhotoOptions() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt  // ✅ Choose camera or gallery
      });

      this.uploadedPhoto = image.dataUrl || null;
      this.photo = image.dataUrl || ''; // ✅ Assign to photo for backend use
    } catch (error) {
      console.error('Failed to get photo', error);
    }
  }

  resetForm() {
    this.documentType = '';
    this.purpose = '';
    this.customPurpose = '';
    this.numberOfCopies = 1;
    this.requirements = '';
    this.photo = '';
    this.uploadedPhoto = null;
  }

  
}
