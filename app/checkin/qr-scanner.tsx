'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff } from 'lucide-react'

interface QRScannerProps {
  onScan: (token: string) => void
  loading?: boolean
}

export function QRScanner({ onScan, loading = false }: QRScannerProps) {
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear().catch(console.error)
      }
    }
  }, [scanner])

  const startScanner = () => {
    if (!scannerRef.current) return

    const html5QrcodeScanner = new Html5QrcodeScanner(
      'qr-scanner',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    )

    html5QrcodeScanner.render(
      (decodedText) => {
        onScan(decodedText)
        stopScanner()
      },
      (error) => {
        // Ignore scan errors (they're very frequent)
      }
    )

    setScanner(html5QrcodeScanner)
    setIsScanning(true)
  }

  const stopScanner = () => {
    if (scanner) {
      scanner.clear().catch(console.error)
      setScanner(null)
    }
    setIsScanning(false)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {!isScanning ? (
            <>
              <div className="mx-auto w-32 h-32 bg-muted rounded-xl flex items-center justify-center">
                <Camera className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium mb-2">Ready to Scan</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Point your camera at a member's QR code
                </p>
                <Button 
                  onClick={startScanner}
                  disabled={loading}
                  className="w-full"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              </div>
            </>
          ) : (
            <>
              <div id="qr-scanner" ref={scannerRef} className="w-full" />
              <Button 
                onClick={stopScanner}
                variant="outline"
                disabled={loading}
                className="w-full"
              >
                <CameraOff className="h-4 w-4 mr-2" />
                Stop Scanner
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}