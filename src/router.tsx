import { createBrowserRouter } from 'react-router'
import { RootLayout } from './components/layout/RootLayout'
import { AboutPage } from './pages/AboutPage'
import { CartPage } from './pages/CartPage'
import { CatalogPage } from './pages/CatalogPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProductPage } from './pages/ProductPage'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'tuotteet', element: <CatalogPage /> },
      { path: 'tuotteet/:category', element: <CatalogPage /> },
      { path: 'tuote/:slug', element: <ProductPage /> },
      { path: 'ostoskori', element: <CartPage /> },
      { path: 'kassa', element: <CheckoutPage /> },
      { path: 'yritys', element: <AboutPage /> },
      { path: 'yhteystiedot', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
], { basename: import.meta.env.BASE_URL })
