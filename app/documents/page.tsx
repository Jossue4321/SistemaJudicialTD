"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Eye, Plus, Clock, CheckCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function DocumentsPage() {
  const [documentType, setDocumentType] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const documentTemplates = [
    {
      id: 1,
      name: "Solicitud de Pensión por Discapacidad",
      description: "Documento para solicitar pensión por invalidez",
      category: "Beneficios Sociales",
      estimatedTime: "5 min",
    },
    {
      id: 2,
      name: "Testamento con Protección Patrimonial",
      description: "Testamento especializado para personas con discapacidad",
      category: "Herencias",
      estimatedTime: "10 min",
    },
    {
      id: 3,
      name: "Solicitud de Adaptaciones Laborales",
      description: "Documento para solicitar adaptaciones en el trabajo",
      category: "Laboral",
      estimatedTime: "7 min",
    },
    {
      id: 4,
      name: "Denuncia por Falta de Accesibilidad",
      description: "Formulario para denunciar barreras arquitectónicas",
      category: "Accesibilidad",
      estimatedTime: "8 min",
    },
  ]

  const generatedDocuments = [
    {
      id: 1,
      name: "Solicitud_Pension_Discapacidad.pdf",
      type: "Beneficios Sociales",
      date: "2024-01-15",
      status: "Completado",
    },
    {
      id: 2,
      name: "Testamento_Proteccion_Patrimonial.pdf",
      type: "Herencias",
      date: "2024-01-10",
      status: "Completado",
    },
  ]

  const handleGenerateDocument = (templateId: number) => {
    setIsGenerating(true)
    // Simulate document generation
    setTimeout(() => {
      setIsGenerating(false)
      console.log("Document generated for template:", templateId)
    }, 3000)
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentos Automatizados</h1>
            <p className="text-xl text-gray-600">Genera documentos legales personalizados de forma automática</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Document Templates */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Plantillas Disponibles</span>
                  </CardTitle>
                  <CardDescription>Selecciona el tipo de documento que necesitas generar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {documentTemplates.map((template) => (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: template.id * 0.1 }}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">{template.category}</Badge>
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>{template.estimatedTime}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleGenerateDocument(template.id)}
                            disabled={isGenerating}
                            className="ml-4"
                          >
                            {isGenerating ? "Generando..." : "Generar"}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Document Generation Form */}
              {isGenerating && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Generando Documento</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="client-name">Nombre Completo</Label>
                        <Input id="client-name" placeholder="Tu nombre completo" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="id-number">Número de Identificación</Label>
                        <Input id="id-number" placeholder="Cédula o DNI" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="disability-type">Tipo de Discapacidad</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="motriz">Motriz</SelectItem>
                            <SelectItem value="visual">Visual</SelectItem>
                            <SelectItem value="auditiva">Auditiva</SelectItem>
                            <SelectItem value="intelectual">Intelectual</SelectItem>
                            <SelectItem value="multiple">Múltiple</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="additional-info">Información Adicional</Label>
                        <Textarea
                          id="additional-info"
                          placeholder="Detalles específicos para el documento..."
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-center">
                        <div className="flex items-center space-x-2 text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span>Procesando información...</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Generated Documents Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Mis Documentos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {generatedDocuments.map((doc) => (
                    <div key={doc.id} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-900 truncate">{doc.name}</h4>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {doc.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{doc.type}</p>
                      <p className="text-xs text-gray-500 mb-3">{doc.date}</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button size="sm" className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black">
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ayuda</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  <p className="mb-2">
                    Los documentos se generan automáticamente basándose en la información que proporciones.
                  </p>
                  <p>Si necesitas ayuda personalizada, puedes agendar una videollamada con nuestros abogados.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
