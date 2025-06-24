# Tailmates - Pet Social Network

A modern web application for connecting pets and their owners, built with HTML, CSS, JavaScript, and Supabase.

## Project Structure

The project is split into two main sections:

### 📱 App Section (`/public/app/`)
Contains the core application functionality:
- **Login** (`/app/login/`) - User authentication
- **Signup** (`/app/signup/`) - User registration  
- **Dashboard** (`/app/dashboard/`) - Main application interface

### 🌐 Website Section (`/public/website/`)
Contains the public-facing website:
- **Landing Page** (`/website/index.html`) - Main landing site
- **Features showcase**
- **About section**
- **Call-to-action pages**

## Features

### App Features
- ✅ User authentication (email/password)
- ✅ Google OAuth integration
- ✅ User registration
- ✅ Session management
- ✅ Responsive dashboard
- ✅ Secure logout functionality

### Website Features
- ✅ Modern landing page design
- ✅ Feature showcase
- ✅ About section
- ✅ Call-to-action buttons
- ✅ Smooth scrolling navigation
- ✅ Responsive design
- ✅ Interactive animations

## Setup Instructions

### 1. Prerequisites
- Node.js (for local server)
- Supabase account and project

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Configuration
1. Create a new Supabase project
2. Enable Authentication in your Supabase dashboard
3. Configure Google OAuth (optional)
4. Copy your project URL and anon key to the config file

### 4. Running the Application

#### Option 1: Using Python (Simple)
```bash
cd public
python3 -m http.server 8001
```

#### Option 2: Using Node.js
```bash
npm install -g live-server
cd public
live-server --port=8001
```

### 5. Access URLs
- **Website**: http://localhost:8001/website/index.html
- **App Login**: http://localhost:8001/app/login/login.html
- **App Signup**: http://localhost:8001/app/signup/signup.html
- **App Dashboard**: http://localhost:8001/app/dashboard/dashboard.html

## File Structure

```
public/
├── index.html                 # Main redirect to website
├── config.js                  # Supabase configuration
├── styles.css                 # Shared styles
├── app/                       # Application section
│   ├── login/
│   │   ├── login.html
│   │   ├── login.css
│   │   └── login.js
│   ├── signup/
│   │   ├── signup.html
│   │   ├── signup.css
│   │   └── signup.js
│   └── dashboard/
│       ├── dashboard.html
│       ├── dashboard.css
│       └── dashboard.js
└── website/                   # Website section
    ├── index.html
    ├── marketing.css (rename to website.css if you wish)
    └── marketing.js (rename to website.js if you wish)
```

## Design System

### Colors
- **Primary**: Black (#000)
- **Secondary**: White (#fff)
- **Background**: Light gray (#f8f9fa)
- **Text**: Dark gray (#333)

### Typography
- **Font Family**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Headings**: Bold weights (600-700)
- **Body**: Regular weight (400)

### Components
- **Buttons**: Rounded corners, hover effects, ripple animations
- **Cards**: Subtle shadows, hover transforms
- **Forms**: Clean inputs with focus states
- **Navigation**: Fixed header with smooth scrolling

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
This project is licensed under the MIT License.

## Support
For support, email hello@tailmates.com or create an issue in the repository. 