import sys
import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from collections import defaultdict
import nltk

# Verificar si las stopwords están descargadas, si no, descargarlas
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

from nltk.corpus import stopwords

def main():
    try:
        # Leer datos de entrada
        input_data = json.loads(sys.argv[1])
        user_history = input_data.get('user_history', [])
        
        # Validación básica
        if not user_history:
            print(json.dumps({
                'status': 'success',
                'recommendations': []
            }))
            return

        # Convertir a DataFrame
        df = pd.DataFrame(user_history)
        
        # Limpieza básica
        df['category'] = df['category'].fillna('general')
        df['question'] = df['question'].str.strip()
        
        # Agrupar por categoría
        category_questions = defaultdict(list)
        for _, row in df.iterrows():
            category_questions[row['category']].append(row['question'])
        
        # Procesamiento NLP usando stopwords de nltk
        spanish_stopwords = stopwords.words('spanish')
        vectorizer = TfidfVectorizer(stop_words=spanish_stopwords)
        
        recommendations = []
        
        for category, questions in category_questions.items():
            if len(questions) >= 2:
                try:
                    # Vectorización y cálculo de similitud
                    tfidf = vectorizer.fit_transform(questions)
                    similarities = cosine_similarity(tfidf[-1:], tfidf[:-1])
                    
                    # Obtener las 2 preguntas más similares
                    top_indices = similarities.argsort()[0][-2:][::-1]
                    
                    for idx in top_indices:
                        recommendations.append({
                            'question': questions[idx],
                            'category': category,
                            'similarity': float(similarities[0][idx])
                        })
                except Exception as e:
                    print(f"Error processing category {category}: {str(e)}", file=sys.stderr)
        
        # Ordenar y limitar resultados
        recommendations.sort(key=lambda x: x['similarity'], reverse=True)
        
        print(json.dumps({
            'status': 'success',
            'recommendations': recommendations[:3]  # Top 3 recomendaciones
        }))
        
    except Exception as e:
        print(json.dumps({
            'status': 'error',
            'message': f"Processing error: {str(e)}"
        }), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()