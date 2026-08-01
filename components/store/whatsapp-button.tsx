'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const WHATSAPP_NUMBER = '27833061529' // 083 306 1529

interface QuickMessage {
  label: string
  message: string
}

const quickMessages: QuickMessage[] = [
  { label: 'Product Inquiry', message: 'Hi! I would like to inquire about a product.' },
  { label: 'Place an Order', message: 'Hi! I would like to place an order.' },
  { label: 'Track My Order', message: 'Hi! I would like to track my order.' },
  { label: 'Get a Quote', message: 'Hi! I would like to request a quote for bulk ordering.' },
]

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [showPulse, setShowPulse] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Show tooltip after 5 seconds if user hasn't interacted
  useEffect(() => {
    if (hasInteracted) return

    const timer = setTimeout(() => {
      setShowPulse(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [hasInteracted])

  const handleOpen = () => {
    setIsOpen(true)
    setShowPulse(false)
    setHasInteracted(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleQuickMessage = (message: string) => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
    setIsOpen(false)
  }

  const handleCustomChat = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I have a question.')}`
    window.open(url, '_blank')
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-20 right-6 z-50 md:bottom-6">
      {/* Chat Panel */}
      <div
        className={cn(
          'absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl border overflow-hidden transition-all duration-300 origin-bottom-right',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="bg-[#075E54] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Agri Hub SA</p>
                <p className="text-xs text-white/80">Typically replies within minutes</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 bg-[#E5DDD5]">
          {/* Welcome Message Bubble */}
          <div className="bg-white rounded-lg p-3 shadow-sm max-w-[85%] mb-3">
            <p className="text-sm text-gray-800">
              Hello! Welcome to Agri Hub SA. How can we help you today?
            </p>
            <p className="text-[10px] text-gray-500 mt-1 text-right">Just now</p>
          </div>
        </div>

        {/* Quick Messages */}
        <div className="p-4 bg-white border-t">
          <p className="text-xs text-muted-foreground mb-3 font-medium">Quick Messages:</p>
          <div className="space-y-2">
            {quickMessages.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuickMessage(item.message)}
                className="w-full text-left px-3 py-2 rounded-lg border border-[#25D366]/30 text-sm hover:bg-[#25D366]/10 hover:border-[#25D366] transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Custom Chat Button */}
          <Button
            onClick={handleCustomChat}
            className="w-full mt-4 bg-[#25D366] hover:bg-[#20BD5A] text-white"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Start Custom Chat
          </Button>
        </div>
      </div>

      {/* Main Button */}
      <div className="relative">
        {/* Pulse Animation */}
        {showPulse && !isOpen && (
          <>
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75" />
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse opacity-50" />
          </>
        )}

        {/* Tooltip */}
        {!isOpen && !hasInteracted && (
          <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap">
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg animate-bounce">
              Need help? Chat with us!
              <div className="absolute -bottom-1 right-6 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
          </div>
        )}

        {/* Button */}
        <Button
          onClick={isOpen ? handleClose : handleOpen}
          size="lg"
          className={cn(
            'relative h-14 w-14 rounded-full shadow-lg transition-all duration-300',
            isOpen
              ? 'bg-gray-600 hover:bg-gray-700'
              : 'bg-[#25D366] hover:bg-[#20BD5A]',
            'text-white'
          )}
          aria-label={isOpen ? 'Close chat' : 'Chat on WhatsApp'}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  )
}
