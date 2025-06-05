import sys
import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from collections import defaultdict

def main():
    try:
        # Leer datos de entrada
        input_data = json.loads(sys.argv[1])
        
        # Convertir historial a DataFrame
        user_history = pd.DataFrame(input_data['user_questions'])
        
        # Agrupar preguntas por categoría
        category_questions = defaultdict(list)
        for _, row in user_history.iterrows():
            category_questions[row['category']].append(row['question'])
        
        # Vectorizar texto usando TF-IDF
        vectorizer = TfidfVectorizer(stop_words='spanish')
        
        # Generar recomendaciones para cada categoría
        recommendations = []
        for category, questions in category_questions.items():
            if len(questions) >= 2:  # Necesitamos al menos 2 preguntas para comparar
                tfidf_matrix = vectorizer.fit_transform(questions)
                similarity_matrix = cosine_similarity(tfidf_matrix[-1:], tfidf_matrix[:-1])
                
                # Obtener índices de preguntas más similares
                similar_indices = similarity_matrix.argsort()[0][-2:][::-1]
                
                for idx in similar_indices:
                    recommendations.append({
                        'question': questions[idx],
                        'category': category,
                        'similarity': float(similarity_matrix[0][idx])
                    })
        
        # Ordenar recomendaciones por similitud
        recommendations.sort(key=lambda x: x['similarity'], reverse=True)
        
        # Limitar a 3 recomendaciones
        output = {
            'status': 'success',
            'recommendations': recommendations[:3]
        }
        
        print(json.dumps(output))
        
    except Exception as e:
        error_output = {
            'status': 'error',
            'message': str(e)
        }
        print(json.dumps(error_output))

if __name__ == '__main__':
    main()