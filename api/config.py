import boto3

class Config:
    DYNAMODB_TABLE_NAME = 'Tasks'  
    REGION_NAME = 'us-east-1' 
    
def get_dynamodb_table():
    dynamodb = boto3.resource('dynamodb', region_name=Config.REGION_NAME)
    return dynamodb.Table(Config.DYNAMODB_TABLE_NAME)