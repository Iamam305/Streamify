import React from 'react'
import { AlertCircle } from 'lucide-react' // Import alert icon from Lucide icons
import { cn } from '@/lib/utils' // Import utility for merging class names
import { Button } from './button'

// Props interface for the ErrorUi component
interface ErrorProps {
  message?: string    // Optional error message to display
  className?: string  // Optional additional CSS classes
  onRetry?: () => void // Optional retry handler function
}

export function ErrorUi({ 
  message = 'An error occurred', // Default error message if none provided
  className, 
  onRetry 
}: ErrorProps) {
  return (
    // Container div with destructive styling and optional custom classes
    <div className={cn(
      "flex flex-col gap-3 text-destructive rounded-md p-3 bg-destructive/10",
      className
    )}>
      {/* Error message row with icon */}
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <p className="text-sm font-medium">{message}</p>
      </div>

      {/* Conditionally render retry button if onRetry handler provided */}
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="self-start" // Align button to start of flex container
        >
          Try Again
        </Button>
      )}
    </div>
  )
}
