// import './jspdf.min.js';
import axios from 'axios';
import {toastController} from '@ionic/vue';

async function axiosReq(params){
    for(let p in params){
        if(p === 'data'){
            params[p] = toFormData(params[p]);
        }
    }
    return await axios(params);
}


function elementLoad(selector){
    return new Promise(resolve=>{
        var check = setInterval(function(){
            if(document.querySelector(selector) != null){
                clearInterval(check);
                resolve(document.querySelector(selector));
            }
        }, 100);
    })
    
}

function optimizeImage(src){
    let cnv = document.createElement('canvas');
    document.body.appendChild(cnv);
    let ctx = cnv.getContext('2d');
    let img = new Image();
    const maxdim = 700;
    img.src = src;

    return new Promise((resolve) => {img.onload = ()=>{
    if(img.width >= img.height){
        cnv.width = maxdim;
        cnv.height = maxdim * (img.height / img.width);
    }else{
        cnv.height = maxdim;
        cnv.width = maxdim * (img.width / img.height);
    }
        ctx.drawImage(img, 0, 0,cnv.width,cnv.height);
        const cdata = cnv.toDataURL();
        cnv.remove();
        resolve(cdata);
    }
});
}





function validateForm(obj,rules){
    let validated = {
        allValid: true
    };
    for(let r in rules){
        if((rules[r] == "required" || rules[r].isRequired ) &&
            obj[r] == undefined || obj[r] == '' ){
                validated[r] = 'empty';
        }else if((rules[r] != "required" || rules[r].isRequired ) &&
            obj[r] == undefined || obj[r] == '' ){
                validated[r] = true;  
        }else if(r != 'callback'){
            let emailregex = /[a-z0-9._]+@[a-z]+\.[a-z]{2,3}/i;
            let intregex = /[0-9]+/;

            validated[r] = true;

            if(rules[r].isEmail &&  obj[r].toLowerCase().match(emailregex))
                validated[r] = true;
            else if (rules[r].isEmail ){
                validated[r] = 'invalid_email';
                break;
            }

            if(rules[r].isInteger && obj[r].match(intregex))
                validated[r] = true;
            else if(rules[r].isInteger) {
                validated[r] = 'invalid_number';
                break;
            }

            if(rules[r].regexMatch != null && obj[r].match(rules[r].regexMatch))
                validated[r] = true;
            else if(rules[r].regexMatch != null) {
                validated[r] = 'value_and_regex_not_match';
                break;
            }

            if(rules[r].equalTo != null &&  obj[r] == rules[r].equalTo)
                validated[r] = true;
            else if(rules[r].equalTo != null) {
                validated[r] = 'values_not_match';
                break;
            }

            if(typeof rules[r].maxChars == 'number' && rules[r].maxChars >= obj[r].length)
                validated[r] = true;
            else if(typeof rules[r].maxChars == 'number') {
                validated[r] = 'invalid_length_max';
                break;
            }

            if(typeof rules[r].minChars == 'number' && rules[r].minChars <= obj[r].length)
                validated[r] = true;
            else if(typeof rules[r].minChars == 'number') {
                validated[r] = 'invalid_length_min';
                break;
            }


        }
    }

    let someEmpty = false;
    if(rules.callback != null){
        for(let v in validated){
            if(validated[v] === 'empty'){
                validated.allValid = false;
                rules.callback();
                someEmpty = true;
                break;
            }
        }
    }
    if(!someEmpty){
        for(let v in validated){
            if(validated[v] != true){
                validated.allValid = false;
                if(rules[v].callback != null){
                    rules[v].callback(validated[v],v);
                    break;
                }

            }
        }
    }

    return validated;
}


// function toPdf(selector,saveAs,marg=undefined) {
//     var pdf = new jsPDF('p', 'pt', 'letter');

//     source = document.querySelector(selector);

//     specialElementHandlers = {

//         '#bypassme': function (element, renderer) {

//             return true
//         }
//     };
//     margins = (marg != undefined) ? marg : {
//         top: 20,
//         bottom: 20,
//         left: 20,
//         width: 500
//     };


//     pdf.fromHTML(
//         source,
//         margins.left,
//         margins.top, {
//             'width': margins.width,
//             'elementHandlers': specialElementHandlers
//         },

//         function (dispose) {       
//             pdf.save(saveAs);
//         }, margins
//     );
// }

async function openToast(msg, type) {
    try {
        await toastController.dismiss();
    } catch(e) {
        console.log(e);
    }
    
    const toast = await toastController
        .create({
        message: msg,
        color:type,
        duration: 2000,
        position:'top'
        })
    return toast.present();
}

function toFormData(obj){
    var fd = new FormData();
    for(var i in obj){
        fd.append(i,obj[i]);
    }
    return fd;
}


function formatDateString(dateString){
    let digits = dateString.matchAll(/[0-9]+/g);
    let digitsArr = [];
    for (const d of digits) {
        if(new String(d).length == 1) digitsArr.push("0" + d);
        else digitsArr.push(d);
    }
    let newString = '';
    for (let i = 0; i < digitsArr.length; i++) {
        if(i < 2) newString = newString + digitsArr[i] + "-";
        else if(i == 2) newString = newString + digitsArr[i] + " ";
        else if(i > 2 && i != digitsArr.length-1) newString = newString + digitsArr[i] + ":";
        else if(i == digitsArr.length-1) newString = newString + digitsArr[i];
    }
    

    return newString;
}




function dateFormat(stringFormat,dateString){
    let dateParse = dateString.match('[0-9]+-[0-9]+-[0-9]+ [0-9]+:[0-9]+:[0-9]+')[0];
    dateParse = dateParse.replaceAll('-','/');
    let date = new Date(Date.parse(dateParse));
    let months = ['January','February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let dateFormat = stringFormat.replaceAll('%y',date.getFullYear());
    dateFormat = dateFormat.replaceAll('%d',date.getDate());
    dateFormat = dateFormat.replaceAll('%lm',months[date.getMonth() + 1]);
    dateFormat = dateFormat.replaceAll('%m',date.getMonth()+1);
    dateFormat = (date.getMinutes() >= 10) ?  dateFormat.replaceAll('%i',date.getMinutes()) : dateFormat.replaceAll('%i',"0"+date.getMinutes());
    dateFormat = (date.getSeconds() >= 10) ?  dateFormat.replaceAll('%s',date.getSeconds()) : dateFormat.replaceAll('%s',"0"+date.getSeconds());
    let hour = date.getHours();
    if(hour > 12) {
        dateFormat = dateFormat.replaceAll('%h',hour - 12);
        dateFormat = dateFormat.replaceAll('%a','pm');
    }else if(hour == 0){
        dateFormat = dateFormat.replaceAll('%h',12);
        dateFormat = dateFormat.replaceAll('%a','am');
    }else{
        dateFormat = dateFormat.replaceAll('%h',hour);
        dateFormat = dateFormat.replaceAll('%a','am');
    }
    dateFormat = dateFormat.replaceAll('%H',hour);
    return dateFormat;
}

function removeFix(object,fix){
    let newObj = {};
    
    for(let k in object){
        let key = k.toLowerCase().replaceAll(fix,""); 
        newObj[key] = object[k];
    }
    return newObj;
}


class LocalStore{
    set(key,value){localStorage.setItem(key,value);}
    get(key){return localStorage.getItem(key);}
    setObject(key,value){localStorage.setItem(key,JSON.stringify(value));}
    getObject(key){return JSON.parse(localStorage.getItem(key));}
    remove(key){localStorage.removeItem(key);}
    setInObject(parentKey,childKey,value){
        let parentObject = this.getObject(parentKey);
        parentObject[childKey] = value;
        this.setObject(parentKey,parentObject);
    }
    isset(key){
        if(localStorage.getItem(key) == null) return false;
        return true;
    }
    getInObject(parentKey,childKey){
        let parentObject = this.getObject(parentKey);
        return parentObject[childKey];
    }
    objectify(stringObj){
        stringObj = stringObj.replaceAll('&#34;','"');
        stringObj = JSON.parse(stringObj);
        return stringObj;
    }
}

const local = new LocalStore();



function toDataURL(file){
    const filereader = new FileReader();
    filereader.readAsDataURL(file);
    return new Promise((resolve) => {
        filereader.addEventListener('load',() => {
            resolve(filereader.result);
        });
    });
}






export { 
    axiosReq,
    validateForm,
    toFormData,
    openToast,
    local,
    dateFormat,
    removeFix,
    toDataURL,
    optimizeImage,
    elementLoad,
    formatDateString
}; 