'''
Business: API для управления заказами (создание, получение списка, обновление статуса)
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict с заказами или статусом операции
'''

import json
import os
from typing import Dict, Any
from datetime import datetime
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
            cursor.execute("""
                SELECT o.*, 
                       json_agg(
                           json_build_object(
                               'id', oi.id,
                               'product_id', oi.product_id,
                               'product_name', oi.product_name,
                               'quantity', oi.quantity,
                               'price', oi.price
                           )
                       ) as items
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                GROUP BY o.id
                ORDER BY o.created_at DESC
            """)
            
            orders = cursor.fetchall()
            
            result = []
            for order in orders:
                order_dict = dict(order)
                if order_dict['created_at']:
                    order_dict['created_at'] = order_dict['created_at'].isoformat()
                if order_dict['delivery_date']:
                    order_dict['delivery_date'] = order_dict['delivery_date'].isoformat()
                result.append(order_dict)
            
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
                """INSERT INTO orders 
                   (customer_name, customer_phone, customer_email, delivery_type, 
                    delivery_date, delivery_time, delivery_address, payment_method, 
                    card_comment, total_amount, status)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
                (
                    body_data['customerName'],
                    body_data['customerPhone'],
                    body_data.get('customerEmail', ''),
                    body_data['deliveryType'],
                    body_data['deliveryDate'],
                    body_data['deliveryTime'],
                    body_data.get('deliveryAddress', ''),
                    body_data['paymentMethod'],
                    body_data.get('cardComment', ''),
                    body_data['totalAmount'],
                    'new'
                )
            )
            
            order_id = cursor.fetchone()['id']
            
            for item in body_data.get('items', []):
                cursor.execute(
                    """INSERT INTO order_items 
                       (order_id, product_id, product_name, quantity, price)
                       VALUES (%s, %s, %s, %s, %s)""",
                    (
                        order_id,
                        item['id'],
                        item['name'],
                        item['quantity'],
                        item['price']
                    )
                )
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'orderId': order_id, 'status': 'created'}, ensure_ascii=False)
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            order_id = body_data.get('id')
            new_status = body_data.get('status')
            
            cursor.execute(
                "UPDATE orders SET status = %s WHERE id = %s RETURNING *",
                (new_status, order_id)
            )
            
            updated_order = cursor.fetchone()
            conn.commit()
            
            if not updated_order:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Order not found'})
                }
            
            order_dict = dict(updated_order)
            if order_dict['created_at']:
                order_dict['created_at'] = order_dict['created_at'].isoformat()
            if order_dict['delivery_date']:
                order_dict['delivery_date'] = order_dict['delivery_date'].isoformat()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps(order_dict, ensure_ascii=False)
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
