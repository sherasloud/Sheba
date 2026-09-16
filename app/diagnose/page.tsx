"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react"
import { diagnoseAPI } from "../actions/diagnose-api"

export default function DiagnosePage() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const result = await diagnoseAPI()
      setDiagnostics(result)
    } catch (error: any) {
      console.error("[v0] Error running diagnostics:", error)
      setDiagnostics({
        error: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case "PASSED":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "FAILED":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "WARNING":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default:
        return null
    }
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case "PASSED":
        return "border-green-200 bg-green-50"
      case "FAILED":
        return "border-red-200 bg-red-50"
      case "WARNING":
        return "border-yellow-200 bg-yellow-50"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="mx-auto max-w-4xl space-y-6 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">API Diagnostics</h1>
          <p className="mt-2 text-gray-600">Check your recharge API configuration and connectivity</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Run Diagnostics</CardTitle>
            <CardDescription>
              This will test your API configuration, connectivity, and make a test recharge request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runDiagnostics} disabled={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Running Diagnostics...
                </>
              ) : (
                "Run Diagnostics"
              )}
            </Button>
          </CardContent>
        </Card>

        {diagnostics && (
          <>
            {diagnostics.error ? (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{diagnostics.error}</AlertDescription>
              </Alert>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">API URL</p>
                      <p className="mt-1 rounded-md bg-gray-100 p-2 font-mono text-sm">{diagnostics.apiUrl}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">API Key</p>
                      <p className="mt-1 rounded-md bg-gray-100 p-2 font-mono text-sm">{diagnostics.apiKeyPreview}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {diagnostics.apiKeyExists ? "✓ API Key is configured" : "✗ API Key is NOT configured"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Test Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {diagnostics.testResults.map((test: any, index: number) => (
                      <div key={index} className={`rounded-lg border-2 p-4 ${getResultColor(test.result)}`}>
                        <div className="flex items-start gap-3">
                          {getResultIcon(test.result)}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{test.test}</h3>
                            <p className="mt-1 text-sm font-medium">
                              Result: <span className="font-bold">{test.result}</span>
                            </p>
                            {test.details && (
                              <p className="mt-2 whitespace-pre-wrap rounded bg-white/50 p-2 text-sm text-gray-700">
                                {test.details}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    If you see "API returned HTML instead of JSON", it means your API URL is incorrect or the API
                    endpoint doesn't exist. Please check your NEXT_PUBLIC_RECHARGE_API_URL environment variable and make
                    sure it points to the correct iRechargeBD API endpoint.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
