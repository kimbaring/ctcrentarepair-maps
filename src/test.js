import {axiosReq} from '@/functions.js';
import {ciapi} from '@/js/globals';

export function addDummyCustomer(firstname,lastname,username,email,password){
    return axiosReq({
        method: 'post',
        url: ciapi +'users/register',
        data:{firstname,lastname,username,email,password}
    });
}

export function loginDummyCustomer(email){
    return axiosReq({
        method: 'post',
        url: ciapi +'users/register',
        data:{firstname,lastname,username,email,password}
    });
}   