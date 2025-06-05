"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Send, MessageCircle, Accessibility, Bot, User, Lightbulb } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { marked } from "marked"

marked.setOptions({
  breaks: true,
  gfm: true
})

interface Message {
  id: string
  content: string
  sender: "user" | "bot" | "system"
  timestamp: Date
  type?: "text" | "suggestion"
}

interface Recommendation {
  id: string
  question: string
  category: string
}

export function ChatbotWidget({ isOpen, onClose }: ChatbotWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "¡Hola! Soy tu asistente legal. ¿En qué puedo ayudarte hoy?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [user, setUser] = useState<any>(null)
  const [hasShownInitialRecs, setHasShownInitialRecs] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Cargar usuario y recomendaciones iniciales
  useEffect(() => {
    if (!isOpen || hasShownInitialRecs) return
    
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      loadRecommendations(userData.id)
      setHasShownInitialRecs(true)
    }
  }, [isOpen, hasShownInitialRecs])

  const renderMarkdown = (text: string) => {
    const html = marked(text)
    return <div 
      className="prose prose-sm max-w-none" 
      dangerouslySetInnerHTML={{ __html: html }}
    />
  }

  const loadRecommendations = async (userId: string) => {
    try {
      const response = await fetch(`/api/chatbot/recommendations?userId=${userId}`)
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      if (data.recommendations?.length > 0) {
        setRecommendations(data.recommendations)
        showRecommendations(data.recommendations)
      }
    } catch (error) {
      console.error("Error cargando recomendaciones:", error)
    }
  }

  const showRecommendations = (recs: Recommendation[]) => {
    // Eliminar recomendaciones anteriores si existen
    setMessages(prev => prev.filter(msg => msg.type !== "suggestion"))
    
    const recommendationMessage: Message = {
      id: `rec-${Date.now()}`,
      content: "Preguntas frecuentes que podrían interesarte:",
      sender: "system",
      timestamp: new Date(),
      type: "suggestion"
    }

    setMessages(prev => [...prev, recommendationMessage])
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputValue
    if (!messageContent.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageContent,
          userId: user?.id || null,
        }),
      })

      if (!response.ok) throw new Error()

      const data = await response.json()
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error("Error en chatbot:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar tu consulta",
        variant: "destructive",
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const renderMessageContent = (message: Message) => {
    if (message.type === "suggestion" && recommendations.length > 0) {
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium mb-2">{message.content}</p>
          <div className="grid grid-cols-1 gap-2">
            {recommendations.slice(0, 3).map((rec) => (
              <Button
                key={`rec-${rec.id}`}
                variant="outline"
                className="w-full text-left justify-start h-auto p-2 text-sm whitespace-normal break-words hover:bg-yellow-50"
                onClick={() => handleSendMessage(rec.question)}
              >
                <Lightbulb className="h-4 w-4 mr-2 text-yellow-500 flex-shrink-0" />
                <span className="text-left">{rec.question}</span>
              </Button>
            ))}
          </div>
        </div>
      )
    }
    return renderMarkdown(message.content)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 w-96 h-[600px] z-50 shadow-xl rounded-lg overflow-hidden"
        >
          <Card className="h-full flex flex-col border-0">
            <CardHeader className="bg-blue-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <CardTitle className="text-base font-semibold">Asistente Legal</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose} 
                  className="text-white hover:bg-blue-700 p-1 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${
                      message.sender === "user" 
                        ? "justify-end" 
                        : message.sender === "system" 
                          ? "justify-center" 
                          : "justify-start"
                    }`}
                  >
                    <div className={`max-w-[85%] ${
                      message.sender === "user" ? "flex-row-reverse" : ""
                    }`}>
                      {message.sender !== "system" && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.sender === "user" ? "bg-blue-600" : "bg-gray-200"
                        }`}>
                          {message.sender === "user" ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                      )}
                      <div
                        className={`rounded-lg p-3 mt-2 ${
                          message.sender === "user" 
                            ? "bg-blue-600 text-white" 
                            : message.sender === "system"
                              ? "bg-yellow-50 text-gray-800 border border-yellow-200"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {renderMessageContent(message)}
                        <p className={`text-xs mt-2 ${
                          message.sender === "user" 
                            ? "text-blue-100" 
                            : message.sender === "system"
                              ? "text-yellow-600"
                              : "text-gray-500"
                        }`}>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex space-x-1">
                          {[0, 0.1, 0.2].map((delay) => (
                            <div
                              key={delay}
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: `${delay}s` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu consulta legal..."
                    className="flex-1 text-sm"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isTyping}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-center mt-2">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Accessibility className="h-3 w-3" />
                    <span>Accesibilidad habilitada</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface ChatbotWidgetProps {
  isOpen: boolean
  onClose: () => void
}