import boto3
import uuid
from datetime import datetime
from botocore.exceptions import ClientError
from .config import get_dynamodb_table

table = get_dynamodb_table()

def create_item(data):
     # Generar un task_id único y la fecha de creación
    data['task_id'] = str(uuid.uuid4())
    data['created_at'] = datetime.utcnow().isoformat()
    # Verificar y asignar los campos requeridos
    item = {
        'task_id': data['task_id'],
        'title': data.get('title', ''),
        'description': data.get('description', ''),
        'status': data.get('status', 'pendiente'),  # Estado por defecto 'pendiente'
        'created_at': data['created_at']
    }
    
    # Obtener la tabla de DynamoDB
    table = get_dynamodb_table()
    try:
        # Insertar el elemento en DynamoDB
        table.put_item(Item=item)
        return {"message": "Task created successfully", "task_id": item['task_id']}, 201
    except Exception as e:
        return {"error": str(e)}, 500

#bloque de codigo para traer una tarea por el id
#def get_item(task_id):
#    table = get_dynamodb_table()
#    try:
        # Usa 'task_id' exactamente como está en DynamoDB
        #print(f"Fetching task_id: {task_id}")
#        response = table.get_item(Key={'task_id': task_id})
        #print(f"DynamoDB response: {response}")
#        item = response.get('Item')
#        if item:
#           return item, 200
#        else:
#            return {"message": "Item not found"}, 404
#    except ClientError as e:
#        return {"error": str(e)}, 500

def get_all_items():
    try:
        # Escanea la tabla para obtener todos los items
        response = table.scan()
        items = response.get('Items', [])  # Obtiene los items de la respuesta
        status_code = 200
        return items, status_code
    except ClientError as e:
        return {"error": e.response['Error']['Message']}, 500
        
def update_item(task_id, data):
    try:
        # Configura el diccionario de nombres de atributos solo si 'status' está en los datos
        expression_attribute_names = {"#status": "status"} if "status" in data else {}
        
        # Construye la expresión de actualización, usando el alias solo si es necesario
        update_expression = "SET " + ", ".join([
            f"{'#status' if k == 'status' else k} = :{k}" for k in data.keys()
        ])
        
        # Asigna los valores de los atributos
        expression_attribute_values = {f":{k}": v for k, v in data.items()}
        
        # Llamar a DynamoDB para actualizar el ítem
        response = table.update_item(
            Key={'task_id': task_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="UPDATED_NEW"
        )
        return {"message": "Item updated successfully", "updated_attributes": response['Attributes']}, 200
    except ClientError as e:
        return {"error": str(e)}, 500


def delete_item(task_id):
    try:
        table.delete_item(Key={'task_id': task_id})  # Usar 'task_id' como clave primaria
        return {"message": "Item deleted successfully"}, 200
    except ClientError as e:
        return {"error": str(e)}, 500