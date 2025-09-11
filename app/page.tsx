import { Card, CardContent } from '@/components/ui/card'
import { Dumbbell } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Dumbbell className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">FitPro Gym</h1>
          <p className="text-muted-foreground">Redirecting...</p>
        </CardContent>
      </Card>
    </div>
  )
}