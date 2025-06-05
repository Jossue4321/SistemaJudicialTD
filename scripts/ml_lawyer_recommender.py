import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import json
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class LawyerRecommender:
    """
    Sistema de recomendación de abogados especializados basado en ML
    para personas con discapacidad motriz
    """
    
    def __init__(self):
        # Conectar a la base de datos
        self.conn = self.connect_to_db()
        # Cargar datos de abogados
        self.lawyers_df = self.load_lawyers_from_db()
        # Cargar datos de casos
        self.cases_df = self.load_cases_from_db()
        
        # Vectorizar especialidades y casos para análisis de similitud
        self.vectorizer = TfidfVectorizer()
        self.specialty_vectors = self.vectorize_specialties()
        
        # Normalizar ratings y experiencia
        self.scaler = MinMaxScaler()
        if not self.lawyers_df.empty:
            self.lawyers_df[['normalized_rating', 'normalized_experience']] = self.scaler.fit_transform(
                self.lawyers_df[['rating', 'experience_years']])
        
    def connect_to_db(self):
        """Conecta a la base de datos Supabase/PostgreSQL"""
        try:
            conn = psycopg2.connect(
                host=os.getenv("DB_HOST"),
                database=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD"),
                port=os.getenv("DB_PORT")
            )
            return conn
        except Exception as e:
            print(f"Error conectando a la base de datos: {e}")
            # Fallback a datos de ejemplo si no se puede conectar
            return None
    
    def load_lawyers_from_db(self):
        """Carga los datos de abogados desde la base de datos"""
        if self.conn:
            try:
                cursor = self.conn.cursor(cursor_factory=RealDictCursor)
                cursor.execute("""
                    SELECT id, full_name, specialty, experience_years, rating, available, avatar_url 
                    FROM lawyers 
                    WHERE available = true
                """)
                lawyers = cursor.fetchall()
                cursor.close()
                return pd.DataFrame(lawyers)
            except Exception as e:
                print(f"Error cargando abogados: {e}")
        
        # Fallback a datos de ejemplo si hay error
        print("Usando datos de ejemplo para abogados")
        lawyers = [
            {"id": 1, "full_name": "Dra. María González", "specialty": "Derechos de Discapacidad, Accesibilidad, Inclusión", 
             "experience_years": 15, "rating": 4.9, "available": True},
            {"id": 2, "full_name": "Dr. Carlos Rodríguez", "specialty": "Derecho Laboral, Discapacidad, Discriminación", 
             "experience_years": 12, "rating": 4.8, "available": True},
            {"id": 3, "full_name": "Dra. Ana Martínez", "specialty": "Derecho Civil, Herencias, Testamentos, Patrimonio Protegido", 
             "experience_years": 18, "rating": 4.9, "available": True},
            {"id": 4, "full_name": "Dr. Javier López", "specialty": "Pensiones, Seguridad Social, Incapacidad Laboral", 
             "experience_years": 10, "rating": 4.7, "available": True},
            {"id": 5, "full_name": "Dra. Laura Sánchez", "specialty": "Accesibilidad, Derechos Humanos, Litigios", 
             "experience_years": 14, "rating": 4.8, "available": True}
        ]
        return pd.DataFrame(lawyers)
    
    def load_cases_from_db(self):
        """Carga los datos de casos legales desde la base de datos"""
        if self.conn:
            try:
                cursor = self.conn.cursor(cursor_factory=RealDictCursor)
                cursor.execute("""
                    SELECT uq.id, uq.question as description, uq.category, 
                           string_agg(lq.category, ', ') as keywords
                    FROM user_questions uq
                    LEFT JOIN legal_questions lq ON uq.category = lq.category
                    GROUP BY uq.id, uq.question, uq.category
                    ORDER BY uq.created_at DESC
                    LIMIT 100
                """)
                cases = cursor.fetchall()
                cursor.close()
                return pd.DataFrame(cases)
            except Exception as e:
                print(f"Error cargando casos: {e}")
        
        # Fallback a datos de ejemplo si hay error
        print("Usando datos de ejemplo para casos")
        cases = [
            {"id": 1, "description": "Discriminación laboral por discapacidad motriz", 
             "category": "laboral", "keywords": "discriminación, trabajo, adaptaciones"},
            {"id": 2, "description": "Solicitud de pensión por invalidez rechazada", 
             "category": "pensiones", "keywords": "pensión, invalidez, seguridad social"},
            {"id": 3, "description": "Testamento con protección patrimonial para hijo con discapacidad", 
             "category": "herencias", "keywords": "testamento, patrimonio, protección"},
            {"id": 4, "description": "Denuncia por falta de accesibilidad en edificio público", 
             "category": "accesibilidad", "keywords": "accesibilidad, barreras, edificio"}
        ]
        return pd.DataFrame(cases)
    
    def vectorize_specialties(self):
        """Vectoriza las especialidades de los abogados para análisis de similitud"""
        if self.lawyers_df.empty:
            return None
        specialty_texts = self.lawyers_df['specialty'].tolist()
        return self.vectorizer.fit_transform(specialty_texts)
    
    def get_case_vector(self, case_description):
        """Genera un vector para un caso específico"""
        # Transformar la descripción del caso usando el mismo vectorizador
        return self.vectorizer.transform([case_description])
    
    def recommend_lawyers(self, case_description, user_preferences=None, top_n=3):
        """Recomienda abogados basados en la descripción del caso y preferencias del usuario"""
        if self.lawyers_df.empty or self.specialty_vectors is None:
            return []
            
        # Vectorizar la descripción del caso
        case_vector = self.get_case_vector(case_description)
        
        # Calcular similitud entre el caso y las especialidades de los abogados
        similarities = cosine_similarity(case_vector, self.specialty_vectors).flatten()
        
        # Crear DataFrame con similitudes
        recommendations_df = self.lawyers_df.copy()
        recommendations_df['similarity'] = similarities
        
        # Filtrar solo abogados disponibles
        recommendations_df = recommendations_df[recommendations_df['available'] == True]
        
        # Calcular puntuación combinada (similitud + rating + experiencia)
        recommendations_df['score'] = (
            0.5 * recommendations_df['similarity'] + 
            0.3 * recommendations_df['normalized_rating'] + 
            0.2 * recommendations_df['normalized_experience']
        )
        
        # Aplicar preferencias del usuario si existen
        if user_preferences:
            if 'preferred_experience' in user_preferences and user_preferences['preferred_experience'] > 0:
                min_exp = user_preferences['preferred_experience']
                recommendations_df = recommendations_df[recommendations_df['experience_years'] >= min_exp]
            
            if 'preferred_rating' in user_preferences and user_preferences['preferred_rating'] > 0:
                min_rating = user_preferences['preferred_rating']
                recommendations_df = recommendations_df[recommendations_df['rating'] >= min_rating]
        
        # Ordenar por puntuación y obtener los top_n
        recommendations_df = recommendations_df.sort_values('score', ascending=False).head(top_n)
        
        # Convertir a formato de salida
        recommendations = []
        for _, row in recommendations_df.iterrows():
            recommendations.append({
                'id': str(row['id']),
                'full_name': row['full_name'],
                'specialty': row['specialty'],
                'experience_years': int(row['experience_years']),
                'rating': float(row['rating']),
                'similarity_score': float(row['similarity']),
                'overall_score': float(row['score']),
                'avatar_url': row['avatar_url']
            })
            
        return recommendations
    
    def update_lawyer_rating(self, lawyer_id, new_rating):
        """Actualiza la calificación de un abogado en la base de datos"""
        if self.conn:
            try:
                cursor = self.conn.cursor()
                cursor.execute(
                    "UPDATE lawyers SET rating = (rating + %s) / 2 WHERE id = %s RETURNING rating",
                    (new_rating, lawyer_id)
                )
                updated_rating = cursor.fetchone()[0]
                self.conn.commit()
                cursor.close()
                
                # Actualizar también en el DataFrame local
                idx = self.lawyers_df.index[self.lawyers_df['id'] == lawyer_id].tolist()
                if idx:
                    self.lawyers_df.at[idx[0], 'rating'] = updated_rating
                    # Re-normalizar ratings
                    self.lawyers_df[['normalized_rating', 'normalized_experience']] = self.scaler.fit_transform(
                        self.lawyers_df[['rating', 'experience_years']])
                
                return updated_rating
            except Exception as e:
                print(f"Error actualizando calificación: {e}")
                self.conn.rollback()
        return None
    
    def close(self):
        """Cierra la conexión a la base de datos"""
        if self.conn:
            self.conn.close()

# Función para procesar una solicitud de recomendación
def process_recommendation_request(request_json):
    try:
        # Parsear la solicitud JSON
        request_data = json.loads(request_json)
        case_description = request_data.get('case_description', '')
        user_preferences = request_data.get('user_preferences', {})
        
        # Inicializar el recomendador
        recommender = LawyerRecommender()
        
        # Obtener recomendaciones
        recommendations = recommender.recommend_lawyers(
            case_description=case_description,
            user_preferences=user_preferences,
            top_n=3
        )
        
        # Cerrar conexión
        recommender.close()
        
        # Devolver resultado como JSON
        return json.dumps({
            'status': 'success',
            'recommendations': recommendations
        })
    except Exception as e:
        return json.dumps({
            'status': 'error',
            'message': str(e)
        })

# Punto de entrada para ejecución directa
if __name__ == "__main__":
    # Si se ejecuta directamente, procesar argumentos de línea de comandos
    import sys
    
    if len(sys.argv) > 1:
        # El primer argumento es el JSON de solicitud
        result = process_recommendation_request(sys.argv[1])
        print(result)
    else:
        # Ejemplo de uso
        recommender = LawyerRecommender()
        
        # Ejemplo de caso legal
        case_description = "Necesito ayuda con una reclamación por discriminación en mi trabajo. Me negaron adaptaciones razonables para mi discapacidad motriz."
        
        # Preferencias del usuario
        user_preferences = {
            'preferred_experience': 10,  # Mínimo 10 años de experiencia
            'preferred_rating': 4.5      # Mínimo 4.5 de calificación
        }
        
        # Obtener recomendaciones
        recommendations = recommender.recommend_lawyers(
            case_description=case_description,
            user_preferences=user_preferences
        )
        
        print("=== RECOMENDADOR DE ABOGADOS ESPECIALIZADOS ===")
        print(f"Caso: {case_description}")
        print(f"Preferencias: Experiencia mínima {user_preferences['preferred_experience']} años, " +
              f"Calificación mínima {user_preferences['preferred_rating']}")
        
        print("\nAbogados recomendados:")
        for i, rec in enumerate(recommendations, 1):
            print(f"{i}. {rec['full_name']}")
            print(f"   Especialidad: {rec['specialty']}")
            print(f"   Experiencia: {rec['experience_years']} años")
            print(f"   Calificación: {rec['rating']}/5.0")
            print(f"   Puntuación de relevancia: {rec['similarity_score']:.2f}")
            print(f"   Puntuación general: {rec['overall_score']:.2f}")
            print()
        
        # Cerrar conexión
        recommender.close()
