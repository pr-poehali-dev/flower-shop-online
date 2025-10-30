'''
Business: API для управления товарами (получение списка, создание, обновление, удаление)
Args: event - dict с httpMethod, body, queryStringParameters, pathParams
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict с товарами или статусом операции
'''

import json
import os
from typing import Dict, Any, List, Optional
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            category = event.get('queryStringParameters', {}).get('category') if event.get('queryStringParameters') else None
            
            if category and category != 'Все':
                cursor.execute(
                    "SELECT * FROM products WHERE category = %s ORDER BY id",
                    (category,)
                )
            else:
                cursor.execute("SELECT * FROM products ORDER BY id")
            
            products = cursor.fetchall()
            
            result = []
            for product in products:
                product_dict = dict(product)
                if product_dict.get('created_at'):
                    product_dict['created_at'] = product_dict['created_at'].isoformat()
                if product_dict.get('updated_at'):
                    product_dict['updated_at'] = product_dict['updated_at'].isoformat()
                result.append(product_dict)
            
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
                """INSERT INTO products (name, category, price, image, description, rating) 
                   VALUES (%s, %s, %s, %s, %s, %s) RETURNING *""",
                (
                    body_data['name'],
                    body_data['category'],
                    body_data['price'],
                    body_data['image'],
                    body_data.get('description', ''),
                    body_data.get('rating', 5)
                )
            )
            
            new_product = cursor.fetchone()
            conn.commit()
            
            product_dict = dict(new_product)
            if product_dict.get('created_at'):
                product_dict['created_at'] = product_dict['created_at'].isoformat()
            if product_dict.get('updated_at'):
                product_dict['updated_at'] = product_dict['updated_at'].isoformat()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps(product_dict, ensure_ascii=False)
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            product_id = body_data.get('id')
            
            cursor.execute(
                """UPDATE products 
                   SET name = %s, category = %s, price = %s, image = %s, 
                       description = %s, rating = %s, updated_at = CURRENT_TIMESTAMP
                   WHERE id = %s RETURNING *""",
                (
                    body_data['name'],
                    body_data['category'],
                    body_data['price'],
                    body_data['image'],
                    body_data.get('description', ''),
                    body_data.get('rating', 5),
                    product_id
                )
            )
            
            updated_product = cursor.fetchone()
            conn.commit()
            
            if not updated_product:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Product not found'})
                }
            
            product_dict = dict(updated_product)
            if product_dict.get('created_at'):
                product_dict['created_at'] = product_dict['created_at'].isoformat()
            if product_dict.get('updated_at'):
                product_dict['updated_at'] = product_dict['updated_at'].isoformat()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps(product_dict, ensure_ascii=False)
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            product_id = params.get('id') if params else None
            
            if not product_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Product ID required'})
                }
            
            cursor.execute("UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = %s", (product_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
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