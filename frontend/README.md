# 🚚 byteDrop — Modern Parcel Delivery & Courier Management Platform

**byteDrop** is a premium, modern, full-featured parcel delivery and logistics management web application. It connects Senders, Riders, and Admins in a unified, real-time ecosystem. Senders can easily book parcels and pay securely online, Riders can manage deliveries with interactive maps, and Admins can orchestrate the entire flow, from user roles to rider dispatch.

---

## 🌟 Key Features & User Roles

### 🧑‍💼 1. Sender (User)
* **Smooth Authentication:** Sign up/in securely using email/password or social accounts, powered by **Firebase Auth**.
* **Dynamic Booking Form:** Book parcel deliveries with an interactive form that maps out sender and receiver locations across defined regions and districts.
* **Smart Fee Calculator:** Automatic shipping fee calculation on the client side based on:
  * **Parcel Type:** Document vs. Non-Document
  * **Location:** Same district (local) vs. Different district (inter-district)
  * **Weight:** Multi-tier pricing structure for heavy packages.
* **My Parcels Dashboard:** Track all booked parcels, check booking status (`pending`, `assigned`, `shipped`, `completed`, `cancelled`), and filter or edit pending orders.
* **Online Stripe Payments:** Seamlessly pay for delivery fees online using a secure **Stripe Checkout** session integration.
* **Real-time Tracking:** Public and private parcel tracking interface. Users can search for a parcel using their unique Tracking ID to see exact delivery logs and history.
* **User Profile & Settings:** Update profile details, upload profile pictures, and view personal statistics.

### 🚴 2. Rider
* **Rider Application:** Apply to become a delivery rider by selecting a preferred service center/region.
* **Deliveries Dashboard:** View all assigned delivery tasks.
* **Interactive Mapping:** Built-in **Leaflet Map** integrations displaying delivery coordinates, route coordinates, and addresses to guide the rider directly to destination locations.
* **Delivery Operations:** Easily update parcel status to `shipped` or `completed`, or submit a cancellation request with reason.
* **Performance Logs:** Keep track of completed deliveries, earned delivery logs, and track performance statistics.

### 👑 3. Admin
* **Statistics & Charts:** Rich analytical dashboards showing parcel registration rates, earnings, and rider performance metrics utilizing **Recharts**.
* **Rider Approval:** Review, approve, or reject rider applications and assign them to specific service areas.
* **Smart Rider Dispatch:** Match pending parcel shipments to active and verified riders based on geographic coverage.
* **User Management:** Manage all registered users, search users by name/email, and promote/demote user roles (Sender, Rider, Admin).

---

## 🛠️ Technology Stack

### Frontend Architecture
* **Core:** [React 19](https://react.dev/) + [Vite](https://vite.dev/) for fast builds and hot module replacement (HMR).
* **Routing:** [React Router v7](https://reactrouter.com/) (using protected routes for Private, Rider, and Admin views).
* **State & Query Management:** [TanStack React Query v5](https://tanstack.com/query/latest) for optimized, cached server-state management.
* **HTTP Client:** [Axios](https://axios-http.com/) configured with interceptors (`useAxiosSecure`) for forwarding Firebase JWTs on each request.
* **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/) + [DaisyUI v5](https://daisyui.com/) providing a vibrant, responsive dark/light styling system.
* **Form Handling:** [React Hook Form v7](https://react-hook-form.com/) with field validation and interactive form watch hooks.
* **Geospatial Maps:** [Leaflet](https://leafletjs.com/) and [React Leaflet](https://react-leaflet.js.org/) for loading and showing delivery points.
* **Modals & Indicators:** [SweetAlert2](https://sweetalert2.github.io/) for sleek popups, confirmations, and success/error toasts.
* **Animations & Carousels:** [Lottie React](https://github.com/gamerson/lottie-react) for animations, alongside [Swiper](https://swiperjs.com/) and [React Responsive Carousel](https://github.com/leandrowd/react-responsive-carousel) for customer reviews and banners.

### Backend Infrastructure
* **Runtime:** Node.js + Express.js.
* **Database:** MongoDB Atlas (NoSQL) for highly flexible storage of users, riders, parcels, and payments.
* **Authentication:** Firebase Admin SDK for decoding token headers on private API endpoints.
* **Payments Gateway:** Stripe API Node SDK.

---

## 📂 Frontend Directory Structure

```
frontend/
├── public/                 # Static assets (favicons, service center JSONs, etc.)
└── src/
    ├── assets/             # Global media files, icons, Lottie animations
    ├── components/         # Global shared components (Logo, Loading spinner, Forbidden handler)
    ├── contexts/           # Global state providers (AuthContext with Firebase provider)
    ├── firebase/           # Firebase SDK initialization file
    ├── hooks/              # Custom hooks (e.g. useAuth, useAxiosSecure, useAxiosPublic)
    ├── layouts/            # Page layouts (RootLayout, AuthLayout, DashboardLayout)
    ├── pages/              # Domain-specific page components
    │   ├── Auth/           # Login & Register views
    │   ├── Coverage/       # Delivery coverage area search page
    │   ├── Dashboard/      # Admin, Rider, & User dashboards
    │   ├── Home/           # Landing page with banners, statistics, and reviews
    │   ├── ParcelTrack/    # Live parcel tracking details route
    │   └── sendParcel/     # Parcel booking form with dynamic fee calculator
    ├── routes/             # Route configurations and Route Guards (PrivateRoute, AdminRoute, RiderRoute)
    ├── App.css             # Main component styles
    ├── App.jsx             # Root App wrapper
    ├── index.css           # Global CSS and Tailwind variables configuration
    └── main.jsx            # React client-side entry point
```

---

## 🚀 Getting Started

To run the frontend of byteDrop locally on your machine, follow these steps:

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher is recommended) along with `npm` or `yarn`.

### 2. Clone and Setup Environment Variables
Create a file named `.env` in the root of the `frontend/` directory and configure the following variables using your Firebase and Image hosting settings:

```env
VITE_apiKey=YOUR_FIREBASE_API_KEY
VITE_authDomain=YOUR_FIREBASE_AUTH_DOMAIN
VITE_projectId=YOUR_FIREBASE_PROJECT_ID
VITE_storageBucket=YOUR_FIREBASE_STORAGE_BUCKET
VITE_messagingSenderId=YOUR_FIREBASE_MESSAGING_SENDER_ID
VITE_appId=YOUR_FIREBASE_APP_ID
VITE_image_host_key=YOUR_IMGBB_API_KEY_FOR_UPLOADS
```

### 3. Install Dependencies
Run the following command inside the `frontend/` folder:
```bash
npm install
```

### 4. Start Development Server
Launch the local Vite server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### 5. Build for Production
To generate the optimized production build of the website:
```bash
npm run build
```
The output files will be created in the `dist/` directory, ready to be hosted on Vercel, Firebase Hosting, Netlify, etc.

---

## 🛡️ Route Security & Protection

We enforce strict role-based access control (RBAC) on the frontend:
* **`PrivateRoute`:** Restricts pages (like `/send-parcel` and `/dashboard`) to authenticated users. Unauthenticated visitors are redirected to `/login`.
* **`AdminRoute`:** Restricts page sub-routes (such as User Management, Rider Approvals, and Rider Assignments) to users with the `admin` role.
* **`RiderRoute`:** Restricts Rider-specific dashboards (Assigned Deliveries, Completed Deliveries) to active, approved users with the `rider` role.

---

## 🤝 Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
