
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Futuristic casino theme colors
				casino: {
					purple: {
						light: '#B197FC',
						DEFAULT: '#9B87F5',
						dark: '#7E69AB'
					},
					pink: {
						light: '#F8A4D8',
						DEFAULT: '#D946EF',
						dark: '#BE4DE8'
					},
					blue: {
						light: '#A5B4FC',
						DEFAULT: '#818CF8',
						dark: '#6366F1'
					},
					dark: {
						light: '#2D3748',
						DEFAULT: '#1A1F2C',
						dark: '#171923'
					},
					neon: {
						purple: '#8B5CF6',
						pink: '#EC4899',
						blue: '#3B82F6',
						teal: '#06B6D4'
					}
				},
				// Purplish space port theme colors
				dark: {
					light: '#3E3559',
					DEFAULT: '#2B2440',
					dark: '#1D1A2F'
				},
				purple: {
					light: '#D6BCFA',
					DEFAULT: '#9F7AEA',
					dark: '#805AD5'
				},
				silver: {
					light: '#E5DEFF',
					DEFAULT: '#C8C8C9',
					dark: '#9F9EA1'
				},
				charcoal: {
					light: '#4A4653',
					DEFAULT: '#403E43',
					dark: '#221F26'
				},
				rose: {
					light: '#F1E0EB',
					DEFAULT: '#E5C3D6',
					dark: '#CBA6BC'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        'gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'neon-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 8px 2px rgba(155, 135, 245, 0.3), 0 0 20px 6px rgba(155, 135, 245, 0.2)'
          },
          '50%': { 
            boxShadow: '0 0 16px 4px rgba(155, 135, 245, 0.5), 0 0 30px 12px rgba(155, 135, 245, 0.3)'
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-8px) rotate(1deg)' },
          '66%': { transform: 'translateY(-4px) rotate(-1deg)' }
        }
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-down': 'slide-down 0.4s ease-out',
        'pulse-soft': 'pulse-soft 1.5s ease-in-out infinite',
        'gentle': 'gentle 5s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'neon-pulse': 'neon-pulse 3s ease-in-out infinite',
        'float': 'float 8s ease-in-out infinite'
			},
      backgroundImage: {
        'gradient-elegant': 'linear-gradient(135deg, #3E3559 0%, #1D1A2F 100%)',
        'gradient-accent': 'linear-gradient(135deg, #9F7AEA 0%, #805AD5 100%)',
        'gradient-soft': 'linear-gradient(135deg, rgba(214, 188, 250, 0.15) 0%, rgba(159, 122, 234, 0.1) 100%)',
        'casino-gradient': 'linear-gradient(135deg, #2B2440 0%, #1D1A2F 90%)',
        'neon-gradient': 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(217, 70, 239, 0.2) 100%)',
        'futuristic-grid': 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'none\'/%3E%3Cpath d=\'M0 0h100v1H0zM0 99h100v1H0zM0 0h1v100H0zM99 0h1v100h-1zM25 0h1v100h-1zM50 0h1v100h-1zM75 0h1v100h-1zM0 25h100v1H0zM0 50h100v1H0zM0 75h100v1H0z\' fill=\'rgba(155, 135, 245, 0.07)\'/%3E%3C/svg%3E")',
        'circuit-pattern': 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23D6BCFA\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'
      }
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
