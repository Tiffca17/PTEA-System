from fastapi import FastAPI, HTTPException, Depends, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, TypeAdapter 
from typing import List, Annotated, Optional
from datetime import datetime, timedelta, date, time
from fastapi_mail import FastMail, MessageSchema,ConnectionConfig
from starlette.requests import Request
from starlette.responses import JSONResponse
import psycopg
# from psycopg.extras import RealDictCursor
import json
from dotenv import load_dotenv
import os

load_dotenv()

conn = psycopg.connect( dbname=os.getenv("DB_NAME"),
                        host= os.getenv("DB_HOST"),
                        user=os.getenv("DB_USER"),
                        password=os.getenv("DB_PASS"),
                        port=("5432")
    )

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),   
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_PORT=int(os.getenv("MAIL_PORT")),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    MAIL_FROM=os.getenv("MAIL_FROM"),
    USE_CREDENTIALS=True,
)



app = FastAPI()


class monthResponse(BaseModel):
    plant: str
    month_name: str
    month_number: Optional[int] 
    sum: int

class monthMaterialResponse(BaseModel):
    material: str
    month_name: str
    month_number: Optional[int] 
    sum: int

class weekResponse(BaseModel):
    plant: str
    day: str
    total: int

class weekMaterialResponse(BaseModel):
    material: str
    day: str
    total: int  

class recentActivityResponse(BaseModel):
    plant: str
    time: str
    message: str

class actHistRes(BaseModel):
    id: int
    plant: str
    date: date
    time: str
    code: str
    message: str

class prodHistRes(BaseModel):
    plant: str
    date: date
    material: str
    sum: int

class EmailSchema(BaseModel):
   email: List[EmailStr]

class Activity(BaseModel):
    plant: str
    machine: str
    code: str
    message: str

# class Status(BaseModel):
#     plant: str
#     machine: str
#     code: str
#     code: str

async def send_mail(email: EmailSchema, location:str, date: datetime, asset:str):
    template = f"""
            <html>
                <head>
                <meta charset="UTF-8">
                <title>System Alert Notification</title>
                <style>
                    body {{
                    font-family: Arial, sans-serif;
                    background-color: #f5f6fa;
                    padding: 20px;
                    }}
                    .container {{
                    max-width: 600px;
                    margin: auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    padding: 30px;
                    }}
                    .header {{
                    text-align: center;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #eee;
                    }}
                    .header h2 {{
                    margin: 0;
                    color: #e84118;
                    }}
                    .content {{
                    padding: 20px 0;
                    }}
                    .footer {{
                    text-align: center;
                    font-size: 12px;
                    color: #999;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    }}
                    .button {{
                    display: inline-block;
                    padding: 10px 20px;
                    margin-top: 20px;
                    background-color: #e84118;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 4px;
                    }}
                </style>
            </head>
            <body>
            <div class="container">
                <div class="header">
                <h2>🚨 System Alert: Machine has stopped!</h2>
                </div>
                <div class="content">
                <p>Dear Operator,</p>
                <p><strong>Alert Time:</strong> {date}</p>
                <p><strong>Location:</strong> {location}</p>
                <p><strong>Affected Machine:</strong> {asset}</p>
                <p><strong>Status:</strong> <span style="color: red;">Stopped</span></p>
                <p>The control system has automatically shut down associated equipment to prevent further issues. Please inspect the affected machinery as soon as possible.</p>
                <a href="https://p-tea.com" class="button">View Dashboard</a>
                </div>
                <div class="footer">
                This is an automated alert from the Central Monitoring System – Lydford Mining.
                </div>
            </div>
            </body>
        </html>
            """
    
    message = MessageSchema(
       subject="Lydford Mining Alerts",
       recipients=email.get("email"),  # List of recipients, as many as you can pass  
       body=template,
       subtype="html"
       )

    fm = FastMail(conf)
    await fm.send_message(message)

    return JSONResponse(status_code=200, content={"message": "email has been sent"})


def iso_duration_to_str(timestring1, timestring2):
    str1 = timestring1
    str2 = timestring2

    date1,time1 = str1.split(" ")
    date2,time2 = str2.split(" ")

    year1, month1, day1 = date1.split("-")
    year2, month2, day2 = date2.split("-")

    hour1, minute1, second1 = time1.split(":")
    hour2, minute2, second2 = time2.split(":")

    # second2, millis = second2.split(".")

    hour1 = int(hour1)
    minute1 = int(minute1)
    second1 = int(second1)

    hour2 = int(hour2)
    minute2 = int(minute2)
    second2 = int(second2)

    year1 = int(year1)
    month1 = int(month1)
    day1 = int(day1)

    year2 = int(year2)
    month2 = int(month2)
    day2 = int(day2)

    current_date = datetime(year1, month1, day1, hour1, minute1, second1)
    entry_date = datetime(year2, month2, day2, hour2, minute2, second2)
    difference = current_date - entry_date

    days = difference.days
    months = difference.days // 30
    years = months // 12
    remaining_months = months%12
    remaining_days = difference.days % 30

    remaining_seconds = difference.seconds
    hours = remaining_seconds // 3600
    remaining_seconds %= 3600
    minutes = remaining_seconds // 60

    if years == 0:
        if months == 0:
            if days == 0:
                if hours == 0:
                    if minutes == 0:
                        return(f"{remaining_seconds} sec{'s' if remaining_seconds > 1 else ''} ago")
                    else:
                        return(f"{minutes} min{'s' if minutes > 1 else ''} ago")
                else:
                    return(f"{hours} hr{'s' if hours > 1 else ''} ago")
            else:
                return(f"{days} day{'s' if days > 1 else ''} ago")
        else:
            return(f"{months} mth{'s' if months > 1 else ''} ago")
            # if remaining_days == 0:
            #     return(f"{months} mth{'s' if months > 1 else ''}")
            # else:
            #     return(f"{months} mth{'s' if months > 1 else ''} {remaining_days} day{'s' if remaining_days > 1 else ''}") 
    else:
        return(f"{years} yr{'s' if years > 1 else ''} ago")
        # if remaining_months == 0:
        #     return(f"{years} yr{'s' if years > 1 else ''}")
        # else:
        #     return(f"{years} yr{'s' if years > 1 else ''} {remaining_months} mth{'s' if remaining_months > 1 else ''}")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/month-sum/{route}")
async def get_month_sum(route:str):
    cursor = conn.cursor()
    try:
        query = f"""
                WITH monthly_sums AS (
                    SELECT
                        {route},
                        TO_CHAR(DATE_TRUNC('month', time_stamp), 'Month') AS month_name,
                        EXTRACT(MONTH FROM time_stamp) AS month_number,
                        SUM(tonnes) AS sum
                    FROM 
                        products
                    WHERE 
                        date(time_stamp) >= '2025-01-01'
                        AND date(time_stamp) <= '2025-12-31'
                    GROUP BY 
                        {route}, 
                        month_name, 
                        month_number)
                    SELECT *
                    FROM monthly_sums
                    ORDER BY month_number;
            """
        cursor.execute(query)
        faculty = cursor.fetchall()
        if route == "plant":
            response = [monthResponse(plant = item[0], month_name=item[1], month_number=item[2], sum = item[3]) for item in faculty]
        else:
            response = [monthMaterialResponse(material = item[0], month_name=item[1], month_number=item[2], sum = item[3]) for item in faculty]
        
        cursor.close()
        return response
    
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()  # Rollback any failed transaction
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.get("/week-sum/{start_date}/{end_date}/{route}")
async def get_week_sum(start_date: str,end_date: str, route: str):
    cursor = conn.cursor()
    try:
        query = f"""
            SELECT 
                {route},
                date("time_stamp") AS day, 
                SUM(tonnes) AS total
            FROM 
                products
            WHERE 
                date("time_stamp") >= '{start_date}'
                AND date("time_stamp") <= '{end_date}'
            GROUP BY 
                {route},
                day
            ORDER BY 
                day;
        """
        
        cursor.execute(query)
        faculty = cursor.fetchall()
        
        if route == "plant":
            response = [weekResponse(plant=item[0], day=item[1].strftime('%Y-%m-%d'), total=item[2]) for item in faculty]
        else:
            response = [weekMaterialResponse(material=item[0], day=item[1].strftime('%Y-%m-%d'), total=item[2]) for item in faculty]

        cursor.close()
        return response
        
    
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()  # Rollback any failed transaction
        raise HTTPException(status_code=500, detail="Internal Server Error")
 

@app.get("/recent-activity")
async def get_recent_activity():
    cursor = conn.cursor()
    try:
        query = """SELECT plant,time_stamp,message FROM activity ORDER BY "time_stamp" DESC LIMIT 5"""
        cursor.execute(query)
        faculty = cursor.fetchall()
        
        updated_list = []
        for i in faculty:
            entry_time = i[1]
            difference = iso_duration_to_str(datetime.now().strftime("%Y-%m-%d %H:%M:%S"),entry_time.strftime("%Y-%m-%d %H:%M:%S"))
            updated_list.append((i[0], difference, i[2]))

        response = [recentActivityResponse(plant = item[0], time=item[1], message=item[2]) for item in updated_list]
        # return ("Server time:", datetime.now())
        # return entry_time.strftime("%Y-%m-%d %H:%M:%S")
        cursor.close()
        return response
        # return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()  # Rollback any failed transaction
        raise HTTPException(status_code=500, detail="Internal Server Error")
    

@app.get("/activity-history/{page}/{order}/{startDate}/{endDate}")
async def get_activity_history(order: str , page:int = 1, limit:int = 20, dir: str = "ASC", startDate:Optional[str] = None, endDate:Optional[str] = None):
    cursor = conn.cursor()
    try:
        offset = (page-1)*limit
        if order == "date" or order == "time":
            order = "time_stamp"
            dir = "DESC"

        query = f"""SELECT id,plant, date(time_stamp) as date, "time_stamp"::time as time,
                code,message FROM activity
                WHERE date(time_stamp) BETWEEN '{startDate}' AND '{endDate}'
                ORDER BY {order} {dir} LIMIT {limit} OFFSET {offset}"""
        
        cursor.execute(query)
        faculty = cursor.fetchall()

        updated_list = []
        for i in faculty:
            time = i[3].strftime("%H:%M")
            time = time.split(":")[0] + ":" + time.split(":")[1]
            updated_list.append((i[0], i[1], i[2], time, i[4], i[5]))

        count_query = f"""SELECT COUNT(*) FROM activity WHERE date(time_stamp) BETWEEN '{startDate}' AND '{endDate}'"""

        cursor.execute(count_query)
        total_count = cursor.fetchone()[0]
        total_pages = (total_count + limit - 1) // limit

        response = [actHistRes(id = item[0], plant = item[1], date=item[2], time=item[3], code=item[4], message=item[5]) for item in updated_list]

        cursor.close()
        return {"data": response, "pages":total_pages}
        # return endDate
        # return faculty
    
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()  # Rollback any failed transaction
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.get("/activity-history/{page}/{order}/{startDate}/{endDate}/{search}")
async def get_activity_history_search(order: str , search:str, page:int = 1, limit:int = 20, dir: str = "ASC", startDate:Optional[str] = None, endDate:Optional[str] = None):
    cursor = conn.cursor()
    try:
        offset = (page-1)*limit
        if order == "date" or order == "time":
            order = "time_stamp"
            dir = "DESC"

        query = f"""SELECT id,plant, date(time_stamp) as date, "time_stamp"::time as time,
                code,message FROM activity
                WHERE 
                    date(time_stamp) BETWEEN '{startDate}' AND '{endDate}' 
                    AND (
                        plant ILIKE '%{search}%' 
                        OR code ILIKE '%{search}%'
                        OR message ILIKE '%{search}%')
                
                ORDER BY {order} {dir} LIMIT {limit} OFFSET {offset}"""
        
        cursor.execute(query)
        faculty = cursor.fetchall()

        updated_list = []
        for i in faculty:
            time = i[3].strftime("%H:%M")
            time = time.split(":")[0] + ":" + time.split(":")[1]
            updated_list.append((i[0], i[1], i[2], time, i[4], i[5]))

        count_query = f"""SELECT COUNT(*) FROM activity 
                            WHERE 
                                date(time_stamp) BETWEEN '{startDate}' AND '{endDate}'
                                AND (
                                    plant ILIKE '%{search}%' 
                                    OR code ILIKE '%{search}%'
                                    OR message ILIKE '%{search}%')
                        """

        cursor.execute(count_query)
        total_count = cursor.fetchone()[0]
        total_pages = (total_count + limit - 1) // limit

        response = [actHistRes(id = item[0], plant = item[1], date=item[2], time=item[3], code=item[4], message=item[5]) for item in updated_list]

        cursor.close()
        return {"data": response, "pages":total_pages}
        # return faculty
    
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()  # Rollback any failed transaction
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/production-history/{page}/{order}/{startDate}/{endDate}")
async def get_production_history(order: str, page:int = 1, limit:int = 20, dir: str = "ASC", startDate:Optional[str] = None, endDate:Optional[str] = None):

    cursor = conn.cursor()
    try:
        offset = (page-1)*limit
        if order == "date":
            # order = "time_stamp"
            dir = "DESC"

        query = f"""SELECT 
                        plant,
                        DATE(time_stamp) AS date,
                        material,
                        SUM(tonnes) AS sum   
                    FROM 
                        products 
                    WHERE 
                        DATE(time_stamp) >= '{startDate}'  
                        AND DATE(time_stamp) <= '{endDate}'
                    GROUP BY 
                        plant, material, DATE(time_stamp)  
                    ORDER BY 
                        {order} {dir}
                    LIMIT {limit} OFFSET {offset};  
                    """
        
        cursor.execute(query)
        faculty = cursor.fetchall()

        count_query = f"""SELECT 
                            COUNT(*) AS total_entries
                        FROM (
                            SELECT 
                        plant,
                        DATE(time_stamp) AS date,
                        material,
                        SUM(tonnes) AS sum   
                        FROM 
                            products 
                        WHERE 
                            DATE(time_stamp) >= '{startDate}'  
                            AND DATE(time_stamp) <= '{endDate}'
                        GROUP BY 
                            plant, material, DATE(time_stamp)  
                        );"""

        cursor.execute(count_query)
        total_count = cursor.fetchone()[0]

        total_pages = (total_count + limit - 1) // limit

        response = [prodHistRes(plant = item[0], date=item[1], material=item[2], sum=item[3]) for item in faculty]

        cursor.close()
        return {"data": response, "pages":total_pages}
        # return updated_list
    
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()  # Rollback any failed transaction
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.get("/production-history/{page}/{order}/{startDate}/{endDate}/{search}")
async def get_production_history_search(order: str, search:str, page:int = 1, limit:int = 20, dir: str = "ASC", startDate:Optional[str] = None, endDate:Optional[str] = None):
    cursor = conn.cursor()
    try:
        offset = (page-1)*limit
        if order == "date":
            # order = "time_stamp"
            dir = "DESC"

        query = f"""SELECT 
                        plant,
                        DATE(time_stamp) AS date,
                        material,
                        SUM(tonnes) AS sum   
                    FROM 
                        products 
                    WHERE 
                        DATE(time_stamp) >= '{startDate}'  
                        AND DATE(time_stamp) <= '{endDate}'
                        AND (
                            plant ILIKE '%{search}%' 
                            OR material ILIKE '%{search}%'
                            )
                    GROUP BY 
                        plant, material, DATE(time_stamp)  
                    ORDER BY 
                        {order} {dir}
                    LIMIT {limit} OFFSET {offset};  
                    """
        
        cursor.execute(query)
        faculty = cursor.fetchall()

        count_query = f"""SELECT 
                            COUNT(*) AS total_entries
                        FROM (
                            SELECT 
                        plant,
                        DATE(time_stamp) AS date,
                        material,
                        SUM(tonnes) AS sum   
                        FROM 
                            products 
                        WHERE 
                            DATE(time_stamp) >= '{startDate}'  
                            AND DATE(time_stamp) <= '{endDate}'
                            AND (
                                plant ILIKE '%{search}%' 
                                OR material ILIKE '%{search}%'
                                )
                        GROUP BY 
                            plant, material, DATE(time_stamp)  
                        );"""

        cursor.execute(count_query)
        total_count = cursor.fetchone()[0]

        total_pages = (total_count + limit - 1) // limit

        response = [prodHistRes(plant = item[0], date=item[1], material=item[2], sum=item[3]) for item in faculty]

        cursor.close()
        return {"data": response, "pages":total_pages}
        # return updated_list
    
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()  # Rollback any failed transaction
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.post("/activity")
async def post_activity(activity:Activity):

    cursor = conn.cursor()
    try:

        plant = activity.plant
        machine = activity.machine
        message = activity.message
        code = activity.code


        query = f"""INSERT INTO activity 
                        (plant, machine, message, code)
                    VALUES
                        ('{plant}', '{machine}','{message}', '{code}')
                    """
        
        cursor.execute(query)
        conn.commit()

        now = datetime.now()
        formatted_time = now.strftime("%B %d, %Y – %I:%M %p")
        await send_mail({"email":["tiffanycampbell1710@gmail.com"]},plant, formatted_time,machine)

        cursor.close()

        return "hi"
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()  # Rollback any failed transaction
        raise HTTPException(status_code=500, detail="Internal Server Error") # 500??? i am very disappoint

    
@app.post("/send-mail")
async def send_file(
    # background_tasks: BackgroundTasks,
    file: UploadFile = Form(...),
    email:EmailStr = Form(...)
    )-> JSONResponse:

    message = MessageSchema(
            subject="Fastapi mail module",
            recipients=[email],
            body="Simple background task",
            subtype="html",
            attachments=[file])

    fm = FastMail(conf)

    await fm.send_message(message)

    return JSONResponse(status_code=200, content={"message": "email has been sent"})

@app.get("/status")
async def get_status():

    cursor = conn.cursor()
    try:
        query = """SELECT DISTINCT ON (plant, machine) plant, machine, code, message
                    FROM activity
                    ORDER BY plant, machine, time_stamp DESC;"""
        cursor.execute(query)
        faculty = cursor.fetchall() 

        response = [Activity(plant = item[0], machine=item[1], code=item[2], message=item[3]) for item in faculty]
        # return ("Server time:", datetime.now())
        # return entry_time.strftime("%Y-%m-%d %H:%M:%S")
        cursor.close()
        return response
        # return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()  # Rollback any failed transaction
        raise HTTPException(status_code=500, detail="Internal Server Error")

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("app:app",host="0.0.0.0")
