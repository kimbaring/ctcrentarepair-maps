import { createRouter, createWebHistory } from '@ionic/vue-router';
import HomePage from '../views/HomePage.vue'
import PreLoad from '../views/PreLoad.vue'
import LoginPage from '../views/LoginRegisterView/LoginPage.vue'
import RegisterPage from '../views/LoginRegisterView/RegisterPage.vue';
import RegisterCustomer from '../views/LoginRegisterView/RegisterCustomer.vue';
import RegisterTechnician from '../views/LoginRegisterView/RegisterTechnician.vue';
import RegisterRidesharer from '../views/LoginRegisterView/RegisterRideSharer.vue';
import RegisterTowCompany from '../views/LoginRegisterView/RegisterTowCompany.vue';
import RegisterDelivery from '../views/LoginRegisterView/RegisterDelivery.vue';
import ForgotPassword from '../views/LoginRegisterView/ForgotPassword.vue';
import VerifyEmail from '../views/LoginRegisterView/VerifyEmail.vue';
import CustomerTabs from '../views/CustomerView/CustomerTabs.vue';
import TechnicianTabs from '../views/TechnicianView/TechnicianTab.vue';
import TowingTabs from '../views/TowingView/TowingTab.vue';
import RidesharerTabs from '../views/RideSharerView/RideSharerTab.vue';
import CustomerTransactionHistoryView from '../views/TransactionView/TransactionHistoryView.vue';
import CustomerTransactionDetailsView from '../views/TransactionView/TransactionDetailsView.vue';

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
import CustomerNotesToRider from '@/views/CustomerView/CustomerNotesToRider';

import CustomerBookedView from '@/views/CustomerView/CustomerBookedView.vue';
import CustomerTaskFinished from '@/views/CustomerView/CustomerTaskFinished.vue';
import CustomerCarView from '@/views/CustomerView/CustomerCarView.vue';
import CustomerEditCarDetails from '@/views/CustomerView/CustomerEditCarDetails.vue';
import NotificationView from '@/views/NotificationView/NotificationView.vue';
import CustomerAddCarView from '@/views/CustomerView/CustomerAddCarView.vue';

import TechnicianDashboardView from '@/views/TechnicianView/TechnicianDashboardView.vue';
import TechnicianTaskView from '@/views/TechnicianView/TechnicianTaskView.vue';
import TechnicianTaskDetailsView from '@/views/TechnicianView/TechnicianTaskDetailsView.vue';
import TechnicianTaskLocationView from '@/views/TechnicianView/TechnicianTaskLocationView.vue';
import TechnicianAddWalletView from '@/views/TechnicianView/TechnicianAddWalletView.vue';
import TechnicianTaskFinished from '@/views/TechnicianView/TechnicianTaskFinished.vue';

import TowingDashboardView from '@/views/TowingView/TowingDashboardView.vue';
import TowingTaskView from '@/views/TowingView/TowingTaskView.vue';
import TowingTaskDetailsView from '@/views/TowingView/TowingTaskDetailsView.vue';
import TowingTaskLocationView from '@/views/TowingView/TowingTaskLocationView.vue';
import TowingAddWalletView from '@/views/TowingView/TowingAddWalletView.vue';
import TowingTaskFinished from '@/views/TowingView/TowingTaskFinished.vue';

import RideSharerDashboardView from '@/views/RideSharerView/RideSharerDashboardView.vue';






const routes = [
  {
    path: '/map',
    name: 'map',
    component: UserMap
  },
  {
    path: '/preload',
    name:'preload',
    component: PreLoad
  },
  {
    path: '/chat',
    component: ChatRider
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
  {
    path: '/registerdelivery',
    name: 'RegisterDelivery',
    component: RegisterDelivery
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
        component: CustomerTransactionDetailsView
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
        path: "/customer/finished",
        component: CustomerTaskFinished
      },
      {
        path: "/customer/notes",
        component: CustomerNotesToRider
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
        path: '/technician/finished',
        component: TechnicianTaskFinished
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
        path: '/technician/finished',
        component: ProfileView
      },
      {
        path: '/technician/wallet',
        component: TechnicianAddWalletView,
      }
    ]
  },
  {
    path: '/towing',
    component: TowingTabs,
    children: [
      {
        path: '',
        redirect: '/towing/dashboard',
      },
      {
        path: '/towing/dashboard',
        component: TowingDashboardView,
      },
      {
        path: '/towing/tasks',
        component: TowingTaskView,
      },
      {
        path: '/towing/tasks/taskdetails',
        component: TowingTaskDetailsView,
      },
      {
        path: '/towing/tasks/taskdetails/location',
        component: TowingTaskLocationView,
      },
      {
        path: '/towing/tasks/taskdetails/location/chat',
        component: () => import('@/views/ChatRider.vue')
      },
      {
        path: '/towing/transactionhistory',
        component: CustomerTransactionHistoryView
      },
      {
        path: '/towing/finished',
        component: TowingTaskFinished
      },
      {
        path: '/towing/notification',
        component: NotificationView
      },
      {
        path: '/towing/profile',
        component: ProfileView
      },
      {
        path: '/towing/wallet',
        component: TowingAddWalletView,
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

