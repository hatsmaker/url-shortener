import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { urlsApi, analyticsApi, type Url } from '@/lib/api'
import { copyToClipboard, formatDate, formatNumber } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Copy, ExternalLink, Trash2, Plus } from 'lucide-react'

export function DashboardPage() {
  const [urls, setUrls] = useState<Url[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [urlsResponse, analyticsResponse] = await Promise.all([
        urlsApi.getMyUrls(),
        analyticsApi.getDashboard()
      ])
      
      setUrls(urlsResponse.data)
      setAnalytics(analyticsResponse.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (shortCode: string) => {
    try {
      const shortUrl = `${window.location.origin}/${shortCode}`
      await copyToClipboard(shortUrl)
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this URL?')) return
    
    try {
      await urlsApi.delete(id)
      setUrls(urls.filter(url => url.id !== id))
      toast({
        title: "Success",
        description: "URL deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete URL",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage your shortened URLs and view analytics</p>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total URLs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.totalUrls}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analytics.summary.totalClicks)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Avg Clicks/URL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.averageClicksPerUrl}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* URLs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your URLs</CardTitle>
              <CardDescription>Manage and track your shortened URLs</CardDescription>
            </div>
            <Button asChild>
              <a href="/">
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {urls.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No URLs created yet</p>
              <Button asChild>
                <a href="/">Create your first URL</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {urls.map((url) => (
                <div key={url.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-sm">
                          {url.title || 'Untitled'}
                        </h3>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {url.clicks} clicks
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 truncate">
                        {url.originalUrl}
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {window.location.origin}/{url.shortCode}
                        </code>
                        <span className="text-xs text-gray-500">
                          Created {formatDate(url.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(url.shortCode)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={url.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(url.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 