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


const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/comingsoon',
    component: ()=> import('@/views/ComingSoon.vue'),
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
    component: () => import('@/views/CustomerView/CustomerAddCarViewNewUser.vue'),
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
        component: () => import('@/views/CustomerView/CustomerDashboardView.vue'),
      },
      {
        path: "/customer/transactionhistory",
        component: CustomerTransactionHistoryView,
      },
      {
        path: '/customer/profile',
        component: () => import('@/views/AccountView/ProfileView.vue'),
      },
      {
        path: "/customer/profile/update",
        component: () => import("@/views/AccountView/UpdateProfile.vue")
      },
      {
        path: "/customer/profile/changepassword",
        component: () => import("@/views/AccountView/ChangePassword.vue")
      },
      {
        path: "/customer/transactionhistory/transactiondetails",
        component: () => import("@/views/TransactionView/TransactionDetailsView.vue")
      },
      {
        path: "/customer/mycar/cardetails",
        component: () => import('@/views/CustomerView/CustomerMyCarDetailsVIew.vue')
      },
      {
        path: "/customer/dashboard/location",
        component: () => import("@/views/CustomerView/CustomerLocationView.vue")
      },
      {
        path: "/customer/dashboard/location/cardetails",
        component: () => import("@/views/CustomerView/CustomerCarDetailsView.vue")
      },
      {
        path: "/customer/dashboard/location/cardetails/waiting",
        component: () => import("@/views/CustomerView/CustomerTechnicianWaitingView.vue")
      },
      {
        path: "/customer/dashboard/location/cardetails/booked",
        component: () => import("@/views/CustomerView/CustomerBookedView.vue")
      },
      {
        path:"/customer/mycar",
        component: () => import("@/views/CustomerView/CustomerCarView.vue")
      },
      {
        path: "/customer/dashboard/location/cardetails/booked/chat",
        component: () => import("@/views/ChatView/ChatView.vue")
      },
      {
        path: "/customer/mycar/editcar",
        component: () => import("@/views/CustomerView/CustomerEditCarDetails.vue")
      },
      {
        path: "/notification",
        component: () => import("@/views/NotificationView/NotificationView.vue")
      },
      {
        path: "/customer/mycar/addcar",
        component: () => import("@/views/CustomerView/CustomerAddCarView.vue")
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
        component: () => import('@/views/TechnicianView/TechnicianDashboardView.vue'),
      },
      {
        path: '/technician/tasks',
        component: () => import('@/views/TechnicianView/TechnicianTaskView.vue')
      },
      {
        path: '/technician/tasks/taskdetails',
        component: () => import('@/views/TechnicianView/TechnicianTaskDetailsView.vue')
      },
      {
        path: '/technician/tasks/taskdetails/location',
        component: () => import('@/views/TechnicianView/TechnicianTaskLocationView.vue')
      },
      {
        path: '/technician/transactionhistory',
        component: CustomerTransactionHistoryView
      },
      {
        path: '/technician/notification',
        component: () => import("@/views/NotificationView/NotificationView.vue")
      },
      {
        path: '/technician/profile',
        component: () => import('@/views/AccountView/ProfileView.vue')
      },
      {
        path: '/technician/wallet',
        component: () => import('@/views/TechnicianView/TechnicianAddWalletView.vue')
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
        component: () => import('@/views/RideSharerView/RideSharerDashboardView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
