# Frontend Theme Update Guide

## Overview
This guide provides the complete theme system with light/dark mode toggle for your calculator application.

## ✅ Completed Setup

### 1. Theme Context (`/client/src/contexts/ThemeContext.jsx`)
- Created with light/dark mode state
- Persists preference in localStorage
- Manages `dark` class on document root

### 2. Theme Toggle Component (`/client/src/components/ThemeToggle.jsx`)
- Beautiful animated Sun/Moon icon toggle
- Smooth transitions
- Can be placed in any navbar

### 3. App.jsx Updated
- Wrapped with `<ThemeProvider>`
- All routes now have access to theme context

## 🎨 Color Palette

### Dark Mode (default)
```css
Background: from-slate-950 via-indigo-950 to-slate-950
Cards: from-slate-900/90 to-indigo-900/90
Accents: violet-600, fuchsia-600, cyan-600
Text: white, slate-300, slate-400
Borders: white/10
```

### Light Mode
```css
Background: from-slate-50 via-indigo-50 to-slate-50
Cards: from-white/95 to-indigo-50/95
Accents: violet-600, fuchsia-600, cyan-600
Text: slate-900, slate-700, slate-600
Borders: slate-200/50
```

## 📝 Tailwind Class Pattern

Use these patterns for all components:

```jsx
// Background
className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 
           light:from-slate-50 light:via-indigo-50 light:to-slate-50"

// Cards
className="bg-gradient-to-br from-slate-900/90 to-indigo-900/90 dark:from-slate-900/90 dark:to-indigo-900/90
           light:from-white/95 light:to-indigo-50/95"

// Text
className="text-white dark:text-white light:text-slate-900"
className="text-slate-300 dark:text-slate-300 light:text-slate-700"
className="text-slate-400 dark:text-slate-400 light:text-slate-600"

// Borders
className="border border-white/10 dark:border-white/10 light:border-slate-200/50"

// Inputs
className="bg-slate-800 dark:bg-slate-800 light:bg-white
           text-white dark:text-white light:text-slate-900
           border-white/10 dark:border-white/10 light:border-slate-300"

// Buttons (Primary)
className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
// This stays the same in both modes for consistency

// Buttons (Secondary)
className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-white
           text-white dark:text-white light:text-slate-900
           border-white/10 dark:border-white/10 light:border-slate-300"
```

## 🔧 Implementation Steps

### Step 1: Update tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // Your existing theme extensions
    },
  },
  plugins: [],
}
```

### Step 2: Add ThemeToggle to Navbar

In every page with a navbar, add:

```jsx
import ThemeToggle from '../components/ThemeToggle';

// In your navbar:
<div className="flex items-center gap-3">
  <ThemeToggle />
  {/* Other navbar items */}
</div>
```

### Step 3: Update Page Backgrounds

Replace all page backgrounds with:

```jsx
<div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 
                dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950
                light:from-slate-50 light:via-indigo-50 light:to-slate-50">
```

### Step 4: Update Animated Backgrounds

```jsx
{/* Animated mesh gradient background */}
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] 
                  bg-gradient-to-br from-violet-600/20 via-fuchsia-500/20 to-transparent 
                  dark:from-violet-600/20 dark:via-fuchsia-500/20
                  light:from-violet-400/10 light:via-fuchsia-300/10
                  rounded-full blur-3xl animate-pulse"></div>
  <div className="absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] 
                  bg-gradient-to-tl from-cyan-500/20 via-blue-600/20 to-transparent
                  dark:from-cyan-500/20 dark:via-blue-600/20
                  light:from-cyan-300/10 light:via-blue-400/10
                  rounded-full blur-3xl animate-pulse" 
                  style={{ animationDelay: '2s' }}></div>
</div>
```

### Step 5: Update Navbar

```jsx
<nav className="relative z-20 border-b border-white/10 dark:border-white/10 light:border-slate-200
                bg-gradient-to-r from-slate-900/80 via-indigo-900/80 to-slate-900/80 
                dark:from-slate-900/80 dark:via-indigo-900/80 dark:to-slate-900/80
                light:from-white/95 light:via-indigo-50/95 light:to-white/95
                backdrop-blur-xl">
```

### Step 6: Update Cards/Panels

```jsx
<div className="bg-gradient-to-br from-slate-900/90 to-indigo-900/90 
                dark:from-slate-900/90 dark:to-indigo-900/90
                light:from-white/95 light:to-indigo-50/95
                backdrop-blur-2xl rounded-2xl p-6 shadow-2xl 
                border border-white/10 dark:border-white/10 light:border-slate-200/50">
```

### Step 7: Update Inputs

```jsx
<input
  className="bg-slate-800 dark:bg-slate-800 light:bg-white
             text-white dark:text-white light:text-slate-900
             border border-white/10 dark:border-white/10 light:border-slate-300
             rounded-xl px-4 py-2
             placeholder:text-slate-500 dark:placeholder:text-slate-500 light:placeholder:text-slate-400
             focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
/>
```

### Step 8: Update Buttons

```jsx
{/* Primary Button - Stays consistent */}
<button className="px-6 py-2.5 rounded-xl 
                   bg-gradient-to-r from-violet-600 to-fuchsia-600 
                   hover:from-violet-500 hover:to-fuchsia-500
                   text-white font-medium transition-all duration-300">

{/* Secondary Button - Theme aware */}
<button className="px-6 py-2.5 rounded-xl font-medium transition-all duration-300
                   bg-slate-800/50 dark:bg-slate-800/50 light:bg-white
                   text-white dark:text-white light:text-slate-900
                   border border-white/10 dark:border-white/10 light:border-slate-300
                   hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-50">
```

## 📄 Pages to Update

Apply the patterns above to these files:

1. ✅ `/client/src/pages/Landing.jsx` - Add ThemeToggle, update colors
2. ✅ `/client/src/pages/Login.jsx` - Add ThemeToggle, update colors
3. ✅ `/client/src/pages/Signup.jsx` - Add ThemeToggle, update colors  
4. ✅ `/client/src/pages/Calculator.jsx` - Add ThemeToggle, update colors
5. ✅ `/client/src/pages/Admin.jsx` - Add ThemeToggle, update colors
6. ✅ `/client/src/pages/ForgotPassword.jsx` - Add ThemeToggle, update colors
7. ✅ `/client/src/pages/ResetPassword.jsx` - Add ThemeToggle, update colors
8. ✅ `/client/src/pages/OtpVerification.jsx` - Add ThemeToggle, update colors

## 🎯 Key Principles

1. **Consistency**: Use the same color palette across all pages
2. **Contrast**: Ensure text is always readable (WCAG AA compliant)
3. **Smooth Transitions**: Add `transition-colors duration-300` to elements that change with theme
4. **Accent Colors Stay**: Violet, fuchsia, cyan accents remain the same in both modes
5. **Glass morphism**: Use backdrop-blur for that modern glassmorphic effect

## 🧪 Testing Checklist

- [ ] Theme toggle works on all pages
- [ ] Theme preference persists on page reload
- [ ] All text is readable in both modes
- [ ] Inputs are clearly visible in both modes
- [ ] Buttons maintain good contrast in both modes
- [ ] Borders are visible but subtle in both modes
- [ ] Animated backgrounds don't overwhelm in light mode
- [ ] Calculator display is clear in both modes

## 🚀 Quick Start

1. Files already created:
   - ✅ `/client/src/contexts/ThemeContext.jsx`
   - ✅ `/client/src/components/ThemeToggle.jsx`
   - ✅ Updated `/client/src/App.jsx`

2. Update `tailwind.config.js` (add darkMode: 'class')

3. Add ThemeToggle to each page's navbar

4. Replace all hardcoded colors with the pattern classes above

5. Test in both light and dark modes!

Done! 🎉
