import { Inter } from 'next/font/google'
import { WalletProvider } from './providers/WalletProvider'
import { ToastProvider } from './providers/ToastProvider' 
import Navbar from '@/components/Navbar'
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'VeilCredit - Privacy-Preserving Lending',
  description: 'A revolutionary lending protocol where all operations remain completely unlinkable on-chain',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <ToastProvider>
          <WalletProvider>
            <Navbar />
            <main>
              {children}
            </main>
          </WalletProvider>
        </ToastProvider>
      </body>
    </html>
  )
}