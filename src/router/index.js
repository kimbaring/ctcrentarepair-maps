import { createRouter, createWebHistory } from '@ionic/vue-router';
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginRegisterView/LoginPage.vue'
import RegisterPage from '../views/LoginRegisterView/RegisterPage.vue';
import RegisterCustomer from '../views/LoginRegisterView/RegisterCustomer.vue';
import RegisterTechnician from '../views/LoginRegisterView/RegisterTechnician.vue';
import RegisterRidesharer from '../views/LoginRegisterView/RegisterRideSharer.vue';
import RegisterTowCompany from '../views/LoginRegisterView/RegisterTowCompany.vue';
import ForgotPassword from '../views/LoginRegisterView/ForgotPassword.vue';
import VerifyEmail from '../views/LoginRegisterView/VerifyEmail.vue';
import CustomerTabs from '../views/CustomerView/CustomerTabs.vue';
import TechnicianTabs from '../views/TechnicianView/TechnicianTab.vue';
import RidesharerTabs from '../views/RideSharerView/RideSharerTab.vue';
import CustomerTransactionHistoryView from '../views/TransactionView/TransactionHistoryView.vue';

import CustomerLocationView from "@/views/CustomerView/CustomerLocationView.vue";
import CustomerCarDetailsView from "@/views/CustomerView/CustomerCarDetailsView.vue";

import UserMap from '@/views/UserMap.vue';
import ChatRider from '@/views/ChatRider.vue';
import ComingSoon from '@/views/ComingSoon.vue';
import CustomerAddCarViewNewUser from '@/views/CustomerView/CustomerAddCarViewNewUser.vue';

import CustomerDashboardView from '@/views/CustomerView/CustomerDashboardView.vue';
import ProfileView from '@/views/AccountView/ProfileView.vue';
import UpdateProfile from '@/views/AccountView/UpdateProfile.vue';
import ChangePassword from '@/views/AccountView/ChangePassword.vue';

import CustomerWaitingView from '@/views/CustomerView/CustomerWaitingView.vue';
import CustomerMyCarDetailsView from '@/views/CustomerView/CustomerMyCarDetailsView.vue';

import CustomerBookedView from '@/views/CustomerView/CustomerBookedView.vue';
import CustomerCarView from '@/views/CustomerView/CustomerCarView.vue';
import CustomerEditCarDetails from '@/views/CustomerView/CustomerEditCarDetails.vue';
import NotificationView from '@/views/NotificationView/NotificationView.vue';
import CustomerAddCarView from '@/views/CustomerView/CustomerAddCarView.vue';

import TechnicianDashboardView from '@/views/TechnicianView/TechnicianDashboardView.vue';
import TechnicianTaskView from '@/views/TechnicianView/TechnicianTaskView.vue';
import TechnicianTaskDetailsView from '@/views/TechnicianView/TechnicianTaskDetailsView.vue';
import TechnicianTaskLocationView from '@/views/TechnicianView/TechnicianTaskLocationView.vue';
import TechnicianAddWalletView from '@/views/TechnicianView/TechnicianAddWalletView.vue';
import RideSharerDashboardView from '@/views/RideSharerView/RideSharerDashboardView.vue';






const routes = [
  {
    path: '/map',
    name: 'map',
    component: ()=> UserMap
  },
  {
    path: '/chat',
    component: () => ChatRider
  },
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/comingsoon',
    component: ComingSoon,
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage
  },
  {
    path: '/registercustomer',
    name: 'RegisterCustomer',
    component: RegisterCustomer
  },
  {
    path: '/registertechnician',
    name: 'RegisterTechnician',
    component: RegisterTechnician
  },
  // {
  //   path: '/map',
  //   name: 'map',
  //   component: () => import('@/views/UserMap.vue'),
  // },
  {
    path: '/registerridesharer',
    name: 'RegisterRidesharer',
    component: RegisterRidesharer
  },
  {
    path: '/registertowcompany',
    name: 'RegisterTowCompany',
    component: RegisterTowCompany
  },
  {
    path: '/forgotpassword',
    name: 'ForgotPassword',
    component: ForgotPassword
  },
  {
    path: '/verify-email',
    name: 'Verify Email',
    component: VerifyEmail
  },
  {
    path: '/addcarnewuser',
    name: 'addcarnewuser',
    component: () => CustomerAddCarViewNewUser,
  },
  {
    path: '/customer',
    component: CustomerTabs,
    children: [
      {
        path: '',
        redirect: '/customer/dashboard',
      },
      {
        path: '/customer/dashboard',
        component: CustomerDashboardView,
      },
      {
        path: "/customer/transactionhistory",
        component: CustomerTransactionHistoryView,
      },
      {
        path: '/customer/profile',
        component: ProfileView,
      },
      {
        path: "/customer/updateprofile",
        component: UpdateProfile
      },
      {
        path: "/customer/changepassword",
        component: ChangePassword
      },
      {
        path: "/customer/transactionhistory/transactiondetails",
        component: CustomerWaitingView
      },
      {
        path: "/customer/cardetails",
        component: CustomerMyCarDetailsView
      },
      {
        path: "/customer/location",
        component: CustomerLocationView
      },
      {
        path: "/customer/requestdetails",
        component: CustomerCarDetailsView
      },
      {
        path: "/customer/waiting",
        component: CustomerWaitingView
      },
      {
        path: "/customer/booked",
        component: CustomerBookedView
      },
      {
        path:"/customer/mycar",
        component: CustomerCarView
      },
      {
        path: "/customer/chat",
        component: ChatRider
      },
      {
        path: "/customer/mycar/editcar",
        component: CustomerEditCarDetails
      },
      {
        path: "/notification",
        component: NotificationView
      },
      {
        path: "/customer/mycar/addcar",
        component: CustomerAddCarView
      }
    ]
  },
  {
    path: '/technician',
    component: TechnicianTabs,
    children: [
      {
        path: '',
        redirect: '/technician/dashboard',
      },
      {
        path: '/technician/dashboard',
        component: TechnicianDashboardView,
      },
      {
        path: '/technician/tasks',
        component: TechnicianTaskView,
      },
      {
        path: '/technician/tasks/taskdetails',
        component: TechnicianTaskDetailsView,
      },
      {
        path: '/technician/tasks/taskdetails/location',
        component: TechnicianTaskLocationView,
      },
      {
        path: '/technician/tasks/taskdetails/location/chat',
        component: () => import('@/views/ChatRider.vue')
      },
      {
        path: '/technician/transactionhistory',
        component: CustomerTransactionHistoryView
      },
      {
        path: '/technician/notification',
        component: NotificationView
      },
      {
        path: '/technician/profile',
        component: ProfileView
      },
      {
        path: '/technician/wallet',
        component: TechnicianAddWalletView,
      }
    ]
  },
  {
    path: '/ridesharer',
    component: RidesharerTabs,
    children:[
      {
        path: '',
        redirect: '/ridesharer/dashboard',
      },
      {
        path: '/ridesharer/dashboard',
        component: RideSharerDashboardView
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

