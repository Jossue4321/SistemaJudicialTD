"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Accessibility, FileText, Video, Lightbulb } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "text" | "suggestion" | "action"
}

interface Recommendation {
  id: string | number;
  question: string;
  category: string;
  count?: number; // Hacemos count opcional ya que no todas las recomendaciones lo tendrán
  similarity?: number; // Para las recomendaciones de ML
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "¡Hola! Soy tu asistente legal especializado en derechos de personas con discapacidad. Estoy aquí para ayudarte con consultas legales reales. ¿En qué puedo ayudarte hoy?",
      sender: "bot",
      timestamp: new Date(),
      type: "text",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [user, setUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [frequentQuestions, setFrequentQuestions] = useState<Recommendation[]>([])
  const { toast } = useToast()

  // Cargar usuario desde localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      loadFrequentQuestions(userData.id)
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadFrequentQuestions = async (userId: string) => {
    try {
      const response = await fetch(`/api/chatbot/recommendations?userId=${userId}`)
      if (!response.ok) {
        throw new Error("Error al cargar preguntas frecuentes")
      }
      const data = await response.json()
      setFrequentQuestions(data.recommendations || [])
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las preguntas frecuentes",
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputValue;
    if (!messageContent.trim()) return;

    // Mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

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
      });

      if (!response.ok) throw new Error("Error al procesar la consulta");

      const data = await response.json();

      // Respuesta del bot
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);

      // Actualizar recomendaciones
      if (data.recommendations?.length > 0) {
        setRecommendations(data.recommendations.map((rec: any) => ({
          id: rec.id || `rec-${Math.random().toString(36).substr(2, 9)}`,
          question: rec.question,
          category: rec.category || "Recomendación",
        })));
      }
    } catch (error) {
      console.error("Error en chatbot:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar tu consulta. Inténtalo de nuevo.",
        variant: "destructive",
      })

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Lo siento, hubo un error al procesar tu consulta. Por favor, inténtalo de nuevo.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
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

  const handleRecommendationClick = (recommendation: Recommendation) => {
    handleSendMessage(recommendation.question)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Chatbot Accesible con IA</h1>
            <p className="text-xl text-gray-600">
              Obtén asesoramiento legal especializado con inteligencia artificial real
            </p>
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Accessibility className="h-3 w-3 mr-1" />
                Accesible
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Bot className="h-3 w-3 mr-1" />
                IA Real - Gemini
              </Badge>
              {user && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <User className="h-3 w-3 mr-1" />
                  Personalizado
                </Badge>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Recomendaciones Sidebar */}
            <div className="lg:col-span-1">
              {recommendations.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5" />
                      <span>Recomendaciones</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {recommendations.map((rec) => (
                      <Button
                        key={rec.id}
                        variant="outline"
                        className="w-full justify-start text-left h-auto p-3"
                        onClick={() => handleRecommendationClick(rec)}
                      >
                        <div className="text-sm">
                          <div className="font-medium mb-1">{rec.question}</div>
                          <Badge variant="secondary" className="text-xs">
                            {rec.category}
                          </Badge>
                        </div>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Preguntas frecuentes del usuario */}
                  {frequentQuestions.length > 0 && (
                    <>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Tus preguntas frecuentes</h3>
                      {frequentQuestions.map((question) => (
                        <Button
                          key={`freq-${question.id}`}
                          variant="outline"
                          className="w-full justify-start text-left h-auto p-3"
                          onClick={() => handleSendMessage(question.question)}
                        >
                          <Send className="h-4 w-4 mr-2 flex-shrink-0" />
                          <div className="text-sm truncate">
                            {question.question}
                            {question.count && ( // Solo muestra el badge si count existe
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {question.count} veces
                              </Badge>
                            )}
                          </div>
                        </Button>
                      ))}
                      <div className="border-t my-2"></div>
                    </>
                  )}

                  {/* Acciones predefinidas */}
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() =>
                      handleSendMessage(
                        "¿Qué derechos tengo como persona con discapacidad motriz en el ámbito laboral?",
                      )
                    }
                  >
                    <Accessibility className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">Derechos laborales</span>
                  </Button>
                  {/* ... otras acciones predefinidas ... */}
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="h-[700px] flex flex-col overflow-hidden">
                <CardHeader className="bg-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Bot className="h-5 w-5" />
                      <span>Asistente Legal IA</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm">En línea</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 w-full">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex items-start space-x-3 max-w-[85%] w-full ${
                          message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.sender === "user" ? "bg-blue-600" : "bg-gray-200"
                          }`}
                        >
                          {message.sender === "user" ? (
                            <User className="h-5 w-5 text-white" />
                          ) : (
                            <Bot className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div
                          className={`rounded-lg p-4 w-full max-w-full break-words overflow-hidden ${
                            message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                          } break-words overflow-hidden`}
                        >
                          {message.content ? (
                            <div 
                              className="prose prose-sm max-w-none" 
                              dangerouslySetInnerHTML={{ __html: message.content }}
                            />
                          ) : (
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          )}
                          <p
                            className={`text-xs mt-2 ${
                              message.sender === "user" ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true
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
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-4">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

                  {/* Input Area */}
                  <div className="border-t p-6">
                    <div className="flex space-x-4">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Escribe tu consulta legal aquí..."
                        className="flex-1"
                        disabled={isTyping}
                      />
                      <Button
                        onClick={() => handleSendMessage()}
                        disabled={!inputValue.trim() || isTyping}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Accessibility className="h-4 w-4" />
                        <span>Interfaz accesible habilitada</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Bot className="h-4 w-4" />
                        <span>Powered by Gemini</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}