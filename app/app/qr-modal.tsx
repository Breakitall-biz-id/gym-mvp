'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import QRCode from 'qrcode'
import { useEffect } from 'react'
import { QrCode } from 'lucide-react'

interface QRModalProps {
  memberName: string
  token: string
}

export function QRModal({ memberName, token }: QRModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  useEffect(() => {
    QRCode.toDataURL(token, {
      width: 300,
      margin: 2,
      color: {
        dark: '#B8FF00', // neon-lime
        light: '#0B0B0B'  // dark background
      }
    }).then(setQrDataUrl)
  }, [token])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">
          <QrCode className="h-4 w-4 mr-2" />
          Show QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="text-center space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-1">{memberName}</h2>
            <Badge className="bg-green-600 hover:bg-green-700">Active Member</Badge>
          </div>
          
          {qrDataUrl && (
            <div className="bg-black p-4 rounded-xl">
              <img 
                src={qrDataUrl} 
                alt="Member QR Code" 
                className="mx-auto"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p>Show this QR code to gym staff to check in</p>
            <p className="text-xs mt-1">Code expires in 7 days</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}