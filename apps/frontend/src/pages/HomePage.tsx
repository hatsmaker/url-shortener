import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { urlsApi } from '@/lib/api'
import { copyToClipboard } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { Copy, Link, Zap } from 'lucide-react'

export function HomePage() {
  const [url, setUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [shortenedUrl, setShortenedUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setLoading(true)
    try {
      const response = await urlsApi.create({
        originalUrl: url,
        customCode: customCode || undefined,
      })
      
      const shortUrl = `${window.location.origin}/${response.data.shortCode}`
      setShortenedUrl(shortUrl)
      toast({
        title: "Success",
        description: "URL shortened successfully!",
      })
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to shorten URL'
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await copyToClipboard(shortenedUrl)
      toast({
        title: "Success",
        description: "URL copied to clipboard!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Shorten Your URLs with Ease
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create short, memorable links that are perfect for sharing anywhere
          </p>
        </div>

        <Card className="max-w-2xl mx-auto mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="w-5 h-5" />
              URL Shortener
            </CardTitle>
            <CardDescription>
              Enter a long URL to get a shortened version
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!user ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Please log in to create shortened URLs and track analytics
                </p>
                <div className="space-x-4">
                  <Button asChild>
                    <a href="/login">Log In</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/register">Sign Up</a>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="url"
                  placeholder="https://example.com/very-long-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                <Input
                  type="text"
                  placeholder="Custom code (optional)"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Shortening...' : 'Shorten URL'}
                </Button>
              </form>
            )}

            {user && shortenedUrl && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 mb-2">Your shortened URL:</p>
                <div className="flex items-center gap-2">
                  <Input
                    value={shortenedUrl}
                    readOnly
                    className="bg-white"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-600">
              Generate short URLs instantly with optimized system
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Link className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Custom Links</h3>
            <p className="text-gray-600">
              Create memorable custom short codes for your links
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Copy className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
            <p className="text-gray-600">
              One-click copying makes sharing links effortless
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 