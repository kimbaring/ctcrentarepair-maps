import {axiosReq} from '@/functions.js';
import {ciapi} from '@/js/globals';
import {faker} from '@faker-js/faker';

function randomNumber(min,max){
    return Math.floor(Math.random() * max)+min;
}



export function addDummyCustomer(){
    let counter = 0;
    let roles = ['Technician','Ride Sharer','Tow Truck Operator', 'Delivery'];
    console.log(faker);
    let time = setInterval(()=>{
        let newUser = {
            firstname: faker.name.firstName(),
            lastname:faker.name.lastName(),
            role: roles[randomNumber(0,4)]
        };

        axiosReq({
            method: 'post',
            url: ciapi +'users/register',
            data:{
                ...newUser,
                username:newUser.firstname.toLowerCase()+newUser.lastname.toLowerCase(),
                email:newUser.firstname.toLowerCase()+newUser.lastname.toLowerCase()+'@gmail.com'
            }
        });
        console.log('Request Sent: '+counter+', Role: '+roles[randomNumber(0,4)]);
        if(counter >= 100) clearInterval(time);
        else counter++;  
    },1000)
    
}

