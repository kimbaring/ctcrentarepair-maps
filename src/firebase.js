// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set} from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth';
import { Capacitor } from "@capacitor/core";
import {firebaseConfig} from '@/js/globals';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConf = JSON.parse(firebaseConfig);


// Initialize Firebase
const app = initializeApp(firebaseConf);
const db = getDatabase();
const storage =  getStorage();
let authN;

if (Capacitor.isNativePlatform()){
  authN = initializeAuth(app, {
    persistence: indexedDBLocalPersistence
  })
}else{
  authN = getAuth()
}

const auth = authN;

function pull(path){return ref(db,path);}
function push(path,value){
    const reference = pull(path);
    set(reference,value);
    return ref(db,path);
}

function spull(path){return ref(db,path);}
function spush(path,value){
  const reference = pull(path);
  set(reference,value);
  return ref(db,path);
}

const firebaseBaseURL = 'https://firebasestorage.googleapis.com/v0/b/rentarepair-b1f2d.appspot.com/o/';




export default app;
export {
    db,
    storage,
    pull,
    push,
    spull,
    spush,
    firebaseBaseURL,
    auth
};