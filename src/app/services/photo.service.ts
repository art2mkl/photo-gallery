import { Injectable } from '@angular/core';
import {
  Plugins, CameraResultType, Capacitor, FilesystemDirectory,
  CameraPhoto, CameraSource
} from '@capacitor/core';

const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos:Photo[] = [];
  private PHOTO_STORAGE: string = "photos";

  constructor() { }

  private async readAsBase64(cameraPhoto: CameraPhoto) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(cameraPhoto.webPath!);
    const blob = await response.blob();
  
    return await this.convertBlobToBase64(blob) as string;  
  }
  
  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  private async savePicture(cameraPhoto: CameraPhoto) { 

// Convert photo to base64 format, required by Filesystem API to save
const base64Data = await this.readAsBase64(cameraPhoto);

// Write the file to the data directory
const fileName = new Date().getTime() + '.jpeg';
const savedFile = await Filesystem.writeFile({
  path: fileName,
  data: base64Data,
  directory: FilesystemDirectory.Data
});

// Use webPath to display the new image instead of base64 since it's
// already loaded into memory
return {
  filepath: fileName,
  webviewPath: cameraPhoto.webPath
};

  }

  public async addNewToGallery() {
    //Take photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100

    });

    // this.photos.unshift({
    //   filepath: "soon...",
    //   webviewPath: capturedPhoto.webPath
    // });

    // Save the picture and add it to photo collection
  const savedImageFile = await this.savePicture(capturedPhoto);
  this.photos.unshift(savedImageFile);

  }

  


}

export interface Photo {
  filepath:string;
  webviewPath:string;
}
