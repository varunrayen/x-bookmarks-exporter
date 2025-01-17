import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'X Bookmarks Explorer',
  description: 'Search and explore your X bookmarks',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <Header />
        <div className="flex min-h-[calc(100vh-4rem)] pt-16">
          <Sidebar />
          <div className="flex-1 ml-64">
            <main className="min-h-[calc(100vh-12rem)] overflow-auto">
              {children}
            </main>
           
          </div>
        </div>
      </body>
    </html>
  )
}
