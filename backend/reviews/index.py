'''
Business: API для управления отзывами (получение списка, добавление нового)
Args: event - dict с httpMethod, body
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict с отзывами или статусом операции
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            cursor.execute("SELECT * FROM reviews ORDER BY created_at DESC")
            reviews = cursor.fetchall()
            
            result = []
            for review in reviews:
                review_dict = dict(review)
                if review_dict['created_at']:
                    review_dict['created_at'] = review_dict['created_at'].isoformat()
                result.append(review_dict)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps(result, ensure_ascii=False)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            cursor.execute(
                """INSERT INTO reviews (author, rating, text)
                   VALUES (%s, %s, %s) RETURNING *""",
                (
                    body_data['author'],
                    body_data['rating'],
                    body_data['text']
                )
            )
            
            new_review = cursor.fetchone()
            conn.commit()
            
            review_dict = dict(new_review)
            if review_dict['created_at']:
                review_dict['created_at'] = review_dict['created_at'].isoformat()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps(review_dict, ensure_ascii=False)
            }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()
