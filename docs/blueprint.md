# **App Name**: Minar Go Connect

## Core Features:

- Secure Authentication: Users can register, log in, and log out with session persistence. Includes basic form validation for a smooth experience.
- Member & Transaction Management: Manage foundation members (add, view, delete) and their financial deposits (select member/category, enter amount/date, save, delete transaction) using Firebase Realtime Database.
- Dynamic Collection Dashboard: View key statistics like Total Collection, Distribution, and Zakat/Fitra Status. Filter transactions by month to see detailed summaries and totals.
- Integrated PDF Reporting: Generate and export professional PDF reports of filtered transaction summaries, including a foundation header and total amount.
- AI-Assisted Demand Letter Composer: A tool that assists in drafting formal demand letters, supporting both Bengali and English content, and exporting the finalized letter as a professional PDF document.
- Document Storage & Management: Upload, list, view, and delete important documents (PNG, JPG, JPEG, PDF), with data stored persistently in LocalStorage.
- Foundation Branding Control: Allows administrators to upload and set a custom foundation logo, which is then displayed consistently across the application, including the login screen and dashboard header.

## Style Guidelines:

- Primary color: #002366. This deep blue evokes trust and professionalism, anchoring the foundation's identity.
- Background color: #F0F2F5. A very light, subtle grey-blue that complements the primary color, providing a clean and understated canvas.
- Accent color: #D4AF37. A rich gold to highlight key actions and achievements, adding a touch of elegance and importance.
- Headline and body font: 'Inter' (sans-serif) for general text, providing a modern and highly readable experience. 'Noto Sans Bengali' (sans-serif) is used specifically for Bengali content, ensuring clarity and proper rendering.
- Utilize a comprehensive set of icons from Font Awesome 6.5.1, ensuring consistent, clear, and professional visual cues throughout the application.
- A mobile-first responsive design featuring a maximum content width of 500px on mobile devices, adaptive card padding, and tables that auto-scroll horizontally on smaller screens for optimal viewing.
- Subtle visual feedback animations, including a light ':active' scale effect on touch-friendly buttons and bottom-center slide-in toast notifications for user actions.