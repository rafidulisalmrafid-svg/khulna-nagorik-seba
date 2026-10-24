import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Hind Siliguri"', 'Inter', ...defaultTheme.fontFamily.sans],
                display: ['Outfit', '"Hind Siliguri"', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                gov: {
                    50: '#f0f7ff',
                    100: '#e0effe',
                    200: '#b9ddfd',
                    300: '#7cc2fb',
                    400: '#36a3f7',
                    500: '#0c87eb',
                    600: '#026bc9',
                    700: '#0355a3',
                    800: '#074886',
                    900: '#0c3d70',
                    950: '#08274a',
                },
                navy: {
                    800: '#132238',
                    900: '#0a1626',
                    950: '#050c17',
                },
            },
            boxShadow: {
                'card-hover': '0 20px 35px -10px rgba(12, 61, 112, 0.12), 0 8px 12px -6px rgba(12, 61, 112, 0.08)',
                'premium': '0 10px 30px -5px rgba(2, 107, 201, 0.15)',
            },
        },
    },

    plugins: [forms],
};