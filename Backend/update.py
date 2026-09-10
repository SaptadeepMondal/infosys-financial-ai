from pymongo import MongoClient
import os
client = MongoClient('mongodb+srv://saptadeepmondal2005_db_user:9mJ8Cqu25kvm5NOF@infosys-finance-researc.axx04tt.mongodb.net/')
db = client['infosys_financial_ai']
docs_col = db['documents']
reports_col = db['reports']
for doc in docs_col.find():
    if not doc.get('title'): continue
    title = doc['title']
    company_name = title.rsplit('.', 1)[0]
    company_name = company_name[0].upper() + company_name[1:]
    docs_col.update_one({'_id': doc['_id']}, {'$set': {'company_name': company_name}})
for rep in reports_col.find():
    if not rep.get('title'): continue
    title = rep['title']
    if '.' in title:
        company_name = title.rsplit('.', 1)[0]
        company_name = company_name[0].upper() + company_name[1:]
        reports_col.update_one({'_id': rep['_id']}, {'$set': {'company_name': company_name}})
print('Updated documents and reports collection')
