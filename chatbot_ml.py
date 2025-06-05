import json
import re
from datetime import datetime
from typing import Dict, List, Tuple
import random

class LegalAIChatbot:
    """
    Sistema de chatbot con Machine Learning para asesoría legal 
    especializada en derechos de personas con discapacidad
    """
    
    def __init__(self):
        self.knowledge_base = self._load_legal_knowledge()
        self.conversation_history = []
        self.user_context = {}
        
    def _load_legal_knowledge(self) -> Dict:
        """Carga la base de conocimiento legal especializada"""
        return {
            "discapacidad_derechos": {
                "keywords": ["discapacidad", "derechos", "inclusion", "accesibilidad"],
                "responses": [
                    "Las personas con discapacidad tienen derecho a la igualdad de oportunidades y no discriminación según la Convención de la ONU.",
                    "Tienes derecho a adaptaciones razonables en el trabajo, educación y servicios públicos.",
                    "La accesibilidad universal es un derecho fundamental reconocido internacionalmente."
                ],
                "legal_articles": ["Art. 14 Constitución", "Ley 1346 de 2009", "Decreto 1507 de 2014"]
            },
            "pension_discapacidad": {
                "keywords": ["pension", "invalidez", "incapacidad", "beneficio"],
                "responses": [
                    "Para acceder a pensión por invalidez necesitas tener un grado de pérdida de capacidad laboral igual o superior al 50%.",
                    "El proceso incluye evaluación médica, calificación de pérdida de capacidad laboral y solicitud ante el fondo de pensiones.",
                    "Existen diferentes tipos: pensión de invalidez por enfermedad común, accidente de trabajo o enfermedad profesional."
                ],
                "requirements": ["Certificado médico", "Historia clínica", "Exámenes complementarios", "Formulario de solicitud"]
            },
            "herencias_testamentos": {
                "keywords": ["herencia", "testamento", "sucesion", "patrimonio"],
                "responses": [
                    "Las personas con discapacidad tienen derecho a la legítima ampliada para garantizar su protección patrimonial.",
                    "Es recomendable establecer un fideicomiso o patrimonio autónomo para proteger los bienes del beneficiario.",
                    "El testamento debe incluir disposiciones especiales para garantizar el cuidado y manutención de la persona con discapacidad."
                ],
                "legal_protections": ["Legítima ampliada", "Fideicomiso", "Patrimonio autónomo", "Sustitución fideicomisaria"]
            },
            "derechos_laborales": {
                "keywords": ["trabajo", "empleo", "laboral", "discriminacion"],
                "responses": [
                    "Los empleadores deben realizar adaptaciones razonables del puesto de trabajo sin que esto represente una carga desproporcionada.",
                    "Existe una cuota de empleo del 4% para personas con discapacidad en el sector público.",
                    "La discriminación laboral por motivos de discapacidad está prohibida y es sancionable."
                ],
                "protections": ["Estabilidad laboral reforzada", "Adaptaciones razonables", "Cuota de empleo", "No discriminación"]
            },
            "accesibilidad": {
                "keywords": ["accesibilidad", "barreras", "arquitectonicas", "transporte"],
                "responses": [
                    "Todos los espacios públicos y privados de uso público deben cumplir con normas de accesibilidad universal.",
                    "Puedes presentar una acción de tutela si encuentras barreras arquitectónicas que limiten tu acceso.",
                    "El transporte público debe ser accesible y contar con espacios preferenciales para personas con discapacidad."
                ],
                "regulations": ["NTC 4143", "NTC 4144", "Decreto 1538 de 2005", "Ley 361 de 1997"]
            }
        }
    
    def preprocess_message(self, message: str) -> str:
        """Preprocesa el mensaje del usuario"""
        # Convertir a minúsculas y limpiar
        message = message.lower().strip()
        # Remover caracteres especiales excepto espacios y tildes
        message = re.sub(r'[^\w\sáéíóúñü]', '', message)
        return message
    
    def extract_keywords(self, message: str) -> List[str]:
        """Extrae palabras clave del mensaje"""
        processed_message = self.preprocess_message(message)
        words = processed_message.split()
        
        # Filtrar palabras comunes (stop words)
        stop_words = {'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'como', 'pero', 'sus', 'del', 'al', 'me', 'mi', 'tu', 'si', 'yo', 'he', 'ha', 'mi'}
        
        keywords = [word for word in words if word not in stop_words and len(word) > 2]
        return keywords
    
    def calculate_similarity(self, user_keywords: List[str], topic_keywords: List[str]) -> float:
        """Calcula la similitud entre las palabras clave del usuario y un tema"""
        if not user_keywords or not topic_keywords:
            return 0.0
        
        matches = sum(1 for keyword in user_keywords if any(tk in keyword or keyword in tk for tk in topic_keywords))
        return matches / len(user_keywords)
    
    def find_best_topic(self, message: str) -> Tuple[str, float]:
        """Encuentra el tema más relevante para el mensaje"""
        user_keywords = self.extract_keywords(message)
        best_topic = None
        best_score = 0.0
        
        for topic, data in self.knowledge_base.items():
            score = self.calculate_similarity(user_keywords, data["keywords"])
            if score > best_score:
                best_score = score
                best_topic = topic
        
        return best_topic, best_score
    
    def generate_contextual_response(self, topic: str, confidence: float) -> str:
        """Genera una respuesta contextual basada en el tema identificado"""
        if confidence < 0.3:
            return self._generate_general_response()
        
        topic_data = self.knowledge_base[topic]
        base_response = random.choice(topic_data["responses"])
        
        # Agregar información adicional según el tema
        additional_info = ""
        if "legal_articles" in topic_data:
            additional_info = f"\n\nMarco legal: {', '.join(topic_data['legal_articles'])}"
        elif "requirements" in topic_data:
            additional_info = f"\n\nDocumentos necesarios: {', '.join(topic_data['requirements'])}"
        elif "protections" in topic_data:
            additional_info = f"\n\nProtecciones legales: {', '.join(topic_data['protections'])}"
        elif "regulations" in topic_data:
            additional_info = f"\n\nNormativas aplicables: {', '.join(topic_data['regulations'])}"
        
        return base_response + additional_info
    
    def _generate_general_response(self) -> str:
        """Genera una respuesta general cuando no se identifica un tema específico"""
        general_responses = [
            "Entiendo tu consulta. Para brindarte la mejor asesoría, ¿podrías ser más específico sobre tu situación legal?",
            "Tu consulta es importante. Te recomiendo agendar una videollamada con uno de nuestros abogados especializados para una asesoría personalizada.",
            "Basándome en mi análisis, necesito más información para darte una respuesta precisa. ¿Puedes contarme más detalles sobre tu caso?",
            "Como asistente legal especializado en derechos de discapacidad, puedo ayudarte con temas de pensiones, herencias, derechos laborales y accesibilidad. ¿Cuál es tu consulta específica?"
        ]
        return random.choice(general_responses)
    
    def update_user_context(self, message: str, topic: str):
        """Actualiza el contexto del usuario para mejorar futuras respuestas"""
        if topic not in self.user_context:
            self.user_context[topic] = []
        
        self.user_context[topic].append({
            "message": message,
            "timestamp": datetime.now().isoformat()
        })
    
    def process_message(self, message: str) -> Dict:
        """Procesa un mensaje y genera una respuesta completa"""
        # Encontrar el mejor tema
        topic, confidence = self.find_best_topic(message)
        
        # Generar respuesta
        response = self.generate_contextual_response(topic, confidence)
        
        # Actualizar contexto
        if topic and confidence > 0.3:
            self.update_user_context(message, topic)
        
        # Guardar en historial
        conversation_entry = {
            "user_message": message,
            "bot_response": response,
            "topic": topic,
            "confidence": confidence,
            "timestamp": datetime.now().isoformat()
        }
        self.conversation_history.append(conversation_entry)
        
        return {
            "response": response,
            "topic": topic,
            "confidence": confidence,
            "suggestions": self._generate_suggestions(topic)
        }
    
    def _generate_suggestions(self, topic: str) -> List[str]:
        """Genera sugerencias de seguimiento basadas en el tema"""
        suggestions_map = {
            "discapacidad_derechos": [
                "¿Necesitas información sobre certificación de discapacidad?",
                "¿Te interesa conocer sobre beneficios tributarios?",
                "¿Quieres saber sobre programas de inclusión social?"
            ],
            "pension_discapacidad": [
                "¿Necesitas ayuda con el proceso de calificación?",
                "¿Quieres información sobre pensión de sobrevivientes?",
                "¿Te interesa conocer sobre indemnización sustitutiva?"
            ],
            "herencias_testamentos": [
                "¿Necesitas ayuda para redactar un testamento?",
                "¿Quieres información sobre planificación patrimonial?",
                "¿Te interesa conocer sobre fideicomisos?"
            ],
            "derechos_laborales": [
                "¿Has experimentado discriminación laboral?",
                "¿Necesitas información sobre adaptaciones del puesto?",
                "¿Quieres conocer sobre programas de empleo inclusivo?"
            ],
            "accesibilidad": [
                "¿Necesitas presentar una denuncia por barreras?",
                "¿Quieres información sobre diseño universal?",
                "¿Te interesa conocer sobre tecnologías de apoyo?"
            ]
        }
        
        return suggestions_map.get(topic, [
            "¿Te gustaría agendar una videollamada con un abogado?",
            "¿Necesitas generar algún documento legal?",
            "¿Quieres más información sobre tus derechos?"
        ])

# Ejemplo de uso del sistema
def main():
    chatbot = LegalAIChatbot()
    
    # Casos de prueba
    test_messages = [
        "Necesito información sobre pensión por discapacidad",
        "¿Qué derechos tengo en el trabajo si tengo discapacidad motriz?",
        "Quiero hacer un testamento para proteger a mi hijo con discapacidad",
        "El edificio donde trabajo no tiene rampa de acceso",
        "¿Cómo puedo certificar mi discapacidad?"
    ]
    
    print("=== SISTEMA DE CHATBOT LEGAL CON IA ===")
    print("Especializado en derechos de personas con discapacidad\n")
    
    for i, message in enumerate(test_messages, 1):
        print(f"--- Consulta {i} ---")
        print(f"Usuario: {message}")
        
        result = chatbot.process_message(message)
        
        print(f"Bot: {result['response']}")
        print(f"Tema identificado: {result['topic']}")
        print(f"Confianza: {result['confidence']:.2f}")
        print(f"Sugerencias: {', '.join(result['suggestions'][:2])}")
        print()
    
    # Mostrar estadísticas del historial
    print("=== ESTADÍSTICAS DE CONVERSACIÓN ===")
    topics_count = {}
    for entry in chatbot.conversation_history:
        topic = entry['topic']
        if topic:
            topics_count[topic] = topics_count.get(topic, 0) + 1
    
    print("Temas más consultados:")
    for topic, count in sorted(topics_count.items(), key=lambda x: x[1], reverse=True):
        print(f"- {topic}: {count} consultas")
    
    print(f"\nTotal de consultas procesadas: {len(chatbot.conversation_history)}")
    
    # Análisis de confianza promedio
    avg_confidence = sum(entry['confidence'] for entry in chatbot.conversation_history) / len(chatbot.conversation_history)
    print(f"Confianza promedio del sistema: {avg_confidence:.2f}")

if __name__ == "__main__":
    main()
