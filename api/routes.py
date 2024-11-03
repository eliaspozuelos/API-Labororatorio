from flask import Blueprint, request, jsonify
from .models import create_item, get_all_items, update_item, delete_item

api = Blueprint('api', __name__)

@api.route('/')
def home():
    return "Servidor Flask activo"

@api.route('/items', methods=['POST'])
def create():
    data = request.json
    response, status_code = create_item(data)
    return jsonify(response), status_code


@api.route('/items', methods=['GET'])
def read():
    response, status_code = get_all_items()
    return jsonify(response), status_code


@api.route('/items/<string:task_id>', methods=['PUT'])  # Cambia item_id a id_tarea
def update(task_id):
    data = request.json
    response, status_code = update_item(task_id, data)
    return jsonify(response), status_code

@api.route('/items/<string:task_id>', methods=['DELETE'])  # Cambia item_id a id_tarea
def delete(task_id):
    response, status_code = delete_item(task_id)
    return jsonify(response), status_code
