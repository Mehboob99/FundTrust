"""
FundTrust - Flask REST API Backend
React Frontend ke liye API
"""
from flask import Flask, request, jsonify, session, send_from_directory, Response
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
from functools import wraps
import sqlite3, os, mimetypes

app = Flask(__name__)
app.secret_key = 'fundtrust_react_2024'
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_HTTPONLY'] = True
CORS(app, supports_credentials=True, origins=[
    'http://localhost:5173',
    'http://localhost:3000',
    'https://capable-cactus-a37953.netlify.app',
    'https://fund-trust.vercel.app'
])

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATABASE   = os.path.join(BASE_DIR, 'database.db')
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
ALLOWED_IMG = {'png','jpg','jpeg','gif','webp'}
ALLOWED_VID = {'mp4','avi','mov','mkv'}
ALLOWED_DOC = {'pdf','png','jpg','jpeg'}

os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── DB HELPERS ────────────────────────────────────────────
def get_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    return db

def qry(sql, args=(), one=False, commit=False):
    db = get_db()
    try:
        cur = db.execute(sql, args)
        if commit:
            db.commit()
            return cur.lastrowid
        return cur.fetchone() if one else cur.fetchall()
    finally:
        db.close()

def now():
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

def allowed(filename, exts):
    return '.' in filename and filename.rsplit('.',1)[1].lower() in exts

def row_to_dict(row):
    if row is None: return None
    return dict(row)

def rows_to_list(rows):
    return [dict(r) for r in rows]

# ── DB INIT ───────────────────────────────────────────────
def init_db():
    db = sqlite3.connect(DATABASE)
    db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            name         TEXT NOT NULL,
            email        TEXT UNIQUE NOT NULL,
            password     TEXT NOT NULL,
            role         TEXT NOT NULL,
            organization TEXT,
            phone        TEXT,
            created_at   TEXT
        );
        CREATE TABLE IF NOT EXISTS projects (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            ngo_id        INTEGER NOT NULL,
            title         TEXT NOT NULL,
            description   TEXT NOT NULL,
            location      TEXT NOT NULL,
            category      TEXT,
            goal_amount   REAL NOT NULL,
            amount_raised REAL DEFAULT 0,
            image_url     TEXT,
            status        TEXT DEFAULT 'active',
            created_at    TEXT,
            FOREIGN KEY (ngo_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS donations (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            donor_id   INTEGER NOT NULL,
            project_id INTEGER NOT NULL,
            amount     REAL NOT NULL,
            message    TEXT,
            date       TEXT,
            FOREIGN KEY (donor_id)   REFERENCES users(id),
            FOREIGN KEY (project_id) REFERENCES projects(id)
        );
        CREATE TABLE IF NOT EXISTS proofs (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id  INTEGER NOT NULL,
            file_path   TEXT NOT NULL,
            file_type   TEXT NOT NULL,
            description TEXT,
            upload_date TEXT,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        );
    """)
    db.commit()
    db.close()

def seed_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    if db.execute("SELECT COUNT(*) FROM users").fetchone()[0] > 0:
        db.close(); return
    t = now()
    db.execute("INSERT INTO users(name,email,password,role,organization,phone,created_at) VALUES(?,?,?,?,?,?,?)",
               ('Seva Foundation','ngo@fundtrust.in',generate_password_hash('password123'),'ngo','Seva Foundation India','9876543210',t))
    ngo_id = db.execute("SELECT id FROM users WHERE email='ngo@fundtrust.in'").fetchone()[0]
    db.execute("INSERT INTO users(name,email,password,role,phone,created_at) VALUES(?,?,?,?,?,?)",
               ('Rahul Sharma','donor@fundtrust.in',generate_password_hash('password123'),'donor','9123456789',t))
    donor_id = db.execute("SELECT id FROM users WHERE email='donor@fundtrust.in'").fetchone()[0]
    projects = [
        ('Digital Classrooms for Rural Schools','We are bringing digital education to 50 rural schools in Rajasthan. Tablets, projectors, and internet for children who never used a computer.','Rajasthan','Education',500000,312000,'https://fundtrust.onrender.com/api/uploads/digital-classrooms.png'),
        ('Community Kitchen - Feed 1000 Families','Nutritious meals for underprivileged families in Mumbai slums. Two hot meals a day ensuring no child sleeps hungry.','Mumbai, Maharashtra','Food & Nutrition',300000,187500,'https://fundtrust.onrender.com/api/uploads/community-kitchen.png'),
        ('Mobile Healthcare Camps in Villages','Monthly healthcare camps in remote UP villages — free checkups, medicines, and health awareness for thousands.','Uttar Pradesh','Healthcare',750000,423000,'https://fundtrust.onrender.com/api/uploads/health-care.png'),
        ('Clean Water for 10 Villages','Solar-powered water purification in drought-affected Vidarbha villages. Clean water for 5000+ residents.','Vidarbha, Maharashtra','Water & Sanitation',1200000,890000,'https://fundtrust.onrender.com/api/uploads/water.png'),
        ('Skill Training for Village Women','Empowering 200 rural women in Gujarat through tailoring, handicrafts & digital literacy training.','Gujarat','Women Empowerment',400000,156000,'https://fundtrust.onrender.com/api/uploads/skill-training.png'),
        ('Flood Relief for Bihar Villages','Emergency relief for flood-affected Bihar families — food, medicines, blankets & shelter for 2000+ families.','Bihar','Disaster Relief',800000,650000,'https://fundtrust.onrender.com/api/uploads/flood-relief.png'),
    ]
    for title,desc,loc,cat,goal,raised,img in projects:
        db.execute("INSERT INTO projects(ngo_id,title,description,location,category,goal_amount,amount_raised,image_url,created_at) VALUES(?,?,?,?,?,?,?,?,?)",
                   (ngo_id,title,desc,loc,cat,goal,raised,img,t))
        pid = db.execute("SELECT id FROM projects WHERE title=? AND ngo_id=?",(title,ngo_id)).fetchone()[0]
        db.execute("INSERT INTO donations(donor_id,project_id,amount,message,date) VALUES(?,?,?,?,?)",
                   (donor_id,pid,round(raised*0.3),'Happy to support!',t))
    db.commit(); db.close()
    print('  Sample data seeded!')

# ── GUNICORN KE LIYE - MODULE LEVEL PE INIT ───────────────
init_db()
seed_db()

# ── AUTH DECORATOR ────────────────────────────────────────
def login_required(f):
    @wraps(f)
    def dec(*a,**kw):
        if 'user_id' not in session:
            return jsonify({'error':'Login required'}), 401
        return f(*a,**kw)
    return dec

def ngo_required(f):
    @wraps(f)
    def dec(*a,**kw):
        if 'user_id' not in session:
            return jsonify({'error':'Login required'}), 401
        if session.get('role') != 'ngo':
            return jsonify({'error':'NGO account required'}), 403
        return f(*a,**kw)
    return dec

# ── AUTH ROUTES ───────────────────────────────────────────
@app.route('/api/register', methods=['POST'])
def register():
    d = request.json
    if qry("SELECT id FROM users WHERE email=?",(d['email'].lower(),),one=True):
        return jsonify({'error':'Email already registered'}), 400
    uid = qry("INSERT INTO users(name,email,password,role,organization,phone,created_at) VALUES(?,?,?,?,?,?,?)",
              (d['name'],d['email'].lower(),generate_password_hash(d['password']),
               d['role'],d.get('organization',''),d.get('phone',''),now()),commit=True)
    return jsonify({'message':'Account created','id':uid}), 201

@app.route('/api/login', methods=['POST'])
def login():
    d = request.json
    user = row_to_dict(qry("SELECT * FROM users WHERE email=?",(d['email'].lower(),),one=True))
    if user and check_password_hash(user['password'],d['password']):
        session['user_id']   = user['id']
        session['user_name'] = user['name']
        session['role']      = user['role']
        user.pop('password',None)
        return jsonify({'message':'Login successful','user':user})
    return jsonify({'error':'Invalid email or password'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message':'Logged out'})

@app.route('/api/me')
def me():
    if 'user_id' not in session:
        return jsonify({'user':None})
    user = row_to_dict(qry("SELECT id,name,email,role,organization,phone,created_at FROM users WHERE id=?",(session['user_id'],),one=True))
    return jsonify({'user':user})

# ── PROJECT ROUTES ────────────────────────────────────────
@app.route('/api/projects')
def get_projects():
    category = request.args.get('category','')
    search   = request.args.get('search','')
    sql = """SELECT p.*, u.name AS ngo_name,
             (SELECT COUNT(*) FROM donations d WHERE d.project_id=p.id) AS donor_count
             FROM projects p JOIN users u ON p.ngo_id=u.id WHERE p.status='active'"""
    args = []
    if category: sql += " AND p.category=?"; args.append(category)
    if search:   sql += " AND p.title LIKE ?"; args.append(f'%{search}%')
    sql += " ORDER BY p.created_at DESC"
    return jsonify(rows_to_list(qry(sql,args)))

@app.route('/api/projects/featured')
def featured():
    rows = qry("SELECT p.*, u.name AS ngo_name FROM projects p JOIN users u ON p.ngo_id=u.id WHERE p.status='active' ORDER BY p.created_at DESC LIMIT 6")
    return jsonify(rows_to_list(rows))

@app.route('/api/projects/<int:pid>')
def get_project(pid):
    p = row_to_dict(qry("SELECT p.*, u.name AS ngo_name, u.organization FROM projects p JOIN users u ON p.ngo_id=u.id WHERE p.id=?",(pid,),one=True))
    if not p: return jsonify({'error':'Not found'}),404
    p['proofs']  = rows_to_list(qry("SELECT * FROM proofs WHERE project_id=? ORDER BY upload_date DESC",(pid,)))
    p['donors']  = rows_to_list(qry("SELECT d.*, u.name AS donor_name FROM donations d JOIN users u ON d.donor_id=u.id WHERE d.project_id=? ORDER BY d.date DESC LIMIT 10",(pid,)))
    p['donor_count'] = qry("SELECT COUNT(*) FROM donations WHERE project_id=?",(pid,),one=True)[0]
    return jsonify(p)

@app.route('/api/projects', methods=['POST'])
@ngo_required
def create_project():
    d = request.json
    pid = qry("INSERT INTO projects(ngo_id,title,description,location,category,goal_amount,image_url,created_at) VALUES(?,?,?,?,?,?,?,?)",
              (session['user_id'],d['title'],d['description'],d['location'],d.get('category','General'),float(d['goal_amount']),d.get('image_url',''),now()),commit=True)
    return jsonify({'message':'Campaign created','id':pid}),201

@app.route('/api/projects/<int:pid>', methods=['PUT'])
@ngo_required
def update_project(pid):
    p = qry("SELECT * FROM projects WHERE id=? AND ngo_id=?",(pid,session['user_id']),one=True)
    if not p: return jsonify({'error':'Access denied'}),403
    d = request.json
    qry("UPDATE projects SET title=?,description=?,location=?,category=?,goal_amount=?,status=? WHERE id=?",
        (d['title'],d['description'],d['location'],d.get('category','General'),float(d['goal_amount']),d.get('status','active'),pid),commit=True)
    return jsonify({'message':'Updated'})

@app.route('/api/projects/<int:pid>', methods=['DELETE'])
@ngo_required
def delete_project(pid):
    p = qry("SELECT * FROM projects WHERE id=? AND ngo_id=?",(pid,session['user_id']),one=True)
    if not p: return jsonify({'error':'Access denied'}),403
    qry("DELETE FROM donations WHERE project_id=?",(pid,),commit=True)
    qry("DELETE FROM proofs WHERE project_id=?",(pid,),commit=True)
    qry("DELETE FROM projects WHERE id=?",(pid,),commit=True)
    return jsonify({'message':'Deleted'})

# ── NGO ROUTES ────────────────────────────────────────────
@app.route('/api/ngo/projects')
@ngo_required
def ngo_projects():
    rows = qry("SELECT p.*,(SELECT COUNT(*) FROM donations d WHERE d.project_id=p.id) AS donor_count FROM projects p WHERE p.ngo_id=? ORDER BY p.created_at DESC",(session['user_id'],))
    return jsonify(rows_to_list(rows))

@app.route('/api/ngo/stats')
@ngo_required
def ngo_stats():
    rows = qry("SELECT amount_raised,(SELECT COUNT(*) FROM donations d WHERE d.project_id=p.id) AS dc FROM projects p WHERE p.ngo_id=?",(session['user_id'],))
    total_raised = sum(r['amount_raised'] for r in rows)
    total_donors = sum(r['dc'] for r in rows)
    total_proj   = len(rows)
    return jsonify({'total_raised':total_raised,'total_donors':total_donors,'total_projects':total_proj})

@app.route('/api/ngo/upload-proof/<int:pid>', methods=['POST'])
@ngo_required
def upload_proof(pid):
    p = qry("SELECT * FROM projects WHERE id=? AND ngo_id=?",(pid,session['user_id']),one=True)
    if not p: return jsonify({'error':'Access denied'}),403
    ftype = request.form.get('file_type','image')
    desc  = request.form.get('description','')
    f     = request.files.get('file')
    if not f or not f.filename: return jsonify({'error':'No file'}),400
    exts  = ALLOWED_IMG if ftype=='image' else ALLOWED_VID if ftype=='video' else ALLOWED_DOC
    if not allowed(f.filename,exts): return jsonify({'error':'Invalid file type'}),400
    fname = secure_filename(f"proof_{pid}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{f.filename}")
    f.save(os.path.join(UPLOAD_DIR,fname))
    qry("INSERT INTO proofs(project_id,file_path,file_type,description,upload_date) VALUES(?,?,?,?,?)",
        (pid,fname,ftype,desc,now()),commit=True)
    return jsonify({'message':'Proof uploaded','file':fname}),201

# ── DONATE ────────────────────────────────────────────────
@app.route('/api/donate/<int:pid>', methods=['POST'])
@login_required
def donate(pid):
    if session.get('role') != 'donor':
        return jsonify({'error':'Only donors can donate'}),403
    d = request.json
    try: amount = float(d['amount'])
    except: return jsonify({'error':'Invalid amount'}),400
    if amount < 1: return jsonify({'error':'Minimum Rs.1'}),400
    qry("INSERT INTO donations(donor_id,project_id,amount,message,date) VALUES(?,?,?,?,?)",
        (session['user_id'],pid,amount,d.get('message',''),now()),commit=True)
    qry("UPDATE projects SET amount_raised=amount_raised+? WHERE id=?",(amount,pid),commit=True)
    return jsonify({'message':f'Thank you! Rs.{amount:,.0f} donated!'})

# ── DONOR ROUTES ──────────────────────────────────────────
@app.route('/api/donor/donations')
@login_required
def donor_donations():
    rows = qry("SELECT d.*, p.title AS project_title, p.location, p.id AS project_id FROM donations d JOIN projects p ON d.project_id=p.id WHERE d.donor_id=? ORDER BY d.date DESC",(session['user_id'],))
    return jsonify(rows_to_list(rows))

@app.route('/api/donor/stats')
@login_required
def donor_stats():
    rows = qry("SELECT amount, project_id FROM donations WHERE donor_id=?",(session['user_id'],))
    return jsonify({'total_donated':sum(r['amount'] for r in rows),'projects_supported':len(set(r['project_id'] for r in rows)),'total_donations':len(rows)})

# ── TRANSPARENCY ──────────────────────────────────────────
@app.route('/api/transparency')
def transparency():
    rows = qry("SELECT pr.*, p.title AS project_title, p.id AS project_id, u.name AS ngo_name FROM proofs pr JOIN projects p ON pr.project_id=p.id JOIN users u ON p.ngo_id=u.id ORDER BY pr.upload_date DESC")
    return jsonify(rows_to_list(rows))

# ── STATS ─────────────────────────────────────────────────
@app.route('/api/stats')
def stats():
    total_raised = qry("SELECT COALESCE(SUM(amount),0) FROM donations",one=True)[0]
    total_donors = qry("SELECT COUNT(DISTINCT donor_id) FROM donations",one=True)[0]
    total_proj   = qry("SELECT COUNT(*) FROM projects",one=True)[0]
    return jsonify({'total_raised':total_raised,'total_donors':total_donors,'total_projects':total_proj})

# ── UPLOADS ───────────────────────────────────────────────
@app.route('/api/uploads/<path:filename>')
def serve_upload(filename):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    mime_type, _ = mimetypes.guess_type(filepath)
    file_size = os.path.getsize(filepath)
    range_header = request.headers.get('Range', None)
    if range_header and mime_type and mime_type.startswith('video'):
        byte_start = 0
        byte_end = file_size - 1
        match = range_header.replace('bytes=', '').split('-')
        if match[0]: byte_start = int(match[0])
        if match[1]: byte_end = int(match[1])
        length = byte_end - byte_start + 1
        def generate_chunk():
            with open(filepath, 'rb') as f:
                f.seek(byte_start)
                remaining = length
                while remaining > 0:
                    chunk_size = min(8192, remaining)
                    data = f.read(chunk_size)
                    if not data: break
                    remaining -= len(data)
                    yield data
        return Response(generate_chunk(), 206, headers={
            'Content-Range': f'bytes {byte_start}-{byte_end}/{file_size}',
            'Accept-Ranges': 'bytes',
            'Content-Length': str(length),
            'Content-Type': mime_type or 'video/mp4',
        })
    return send_from_directory(UPLOAD_DIR, filename)

# ── CATEGORIES ────────────────────────────────────────────
@app.route('/api/categories')
def categories():
    cats = [c[0] for c in qry("SELECT DISTINCT category FROM projects WHERE status='active'") if c[0]]
    return jsonify(cats)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)