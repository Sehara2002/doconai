'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function Home() {
  const router = useRouter()
  const { user,isAuthenticated, loading } = useAuth() 

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner/>
      </div>
    )
  }

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="flex flex-col items-center justify-center flex-1 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Welcome to <span className="text-blue-600">Lawgan</span>
        </h1>
        
        <p className="mt-3 max-w-md text-lg text-gray-600 sm:text-xl md:mt-5 md:max-w-3xl">
          Your AI-powered legal consultation platform
        </p>

        <div className="mt-8 flex gap-4">
          <Button 
            size="lg"
            onClick={handleGetStarted}
          >
            Get Started
          </Button>
          
          {!user && (
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
          )}
        </div>
      </main>

      <footer className="w-full py-6 border-t">
        <div className="container flex items-center justify-between">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Pentagon. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}