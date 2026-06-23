from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
import re

app = Flask(__name__,
    static_folder='static',
    template_folder='templates')
app.secret_key = os.environ.get('SECRET_KEY', 'dev_secret_key')

CORS(app, supports_credentials=True, origins=['http://localhost:3000'])

def get_db_connection():
    try:
        conn = psycopg2.connect(
            dbname=os.environ.get('DB_NAME', 'event_booking'),
            user=os.environ.get('DB_USER', 'postgres'),
            password=os.environ.get('DB_PASSWORD', 'HelloAiman'),
            host=os.environ.get('DB_HOST', 'localhost'),
            port=os.environ.get('DB_PORT', '5432')
        )
        conn.autocommit = False
        print("Successfully connected to database")
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

def init_db():
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to database for initialization")
        return False
    
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' AND table_name = 'users'
                )
            """)
            tables_exist = cur.fetchone()[0]
            
            if not tables_exist:
                print("Creating database tables...")
                with open('schema.sql', 'r') as f:
                    cur.execute(f.read())
                conn.commit()
                print("Database initialized successfully")
            else:
                # Add missing columns if they don't exist
                try:
                    cur.execute("""
                        ALTER TABLE users 
                        ADD COLUMN IF NOT EXISTS registration_number VARCHAR(50) UNIQUE,
                        ADD COLUMN IF NOT EXISTS degree VARCHAR(20),
                        ADD COLUMN IF NOT EXISTS batch_year INTEGER,
                        ADD COLUMN IF NOT EXISTS semester VARCHAR(10),
                        ADD COLUMN IF NOT EXISTS roll_number VARCHAR(10),
                        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    """)
                    conn.commit()
                    print("Added registration number columns to users table")
                except Exception as e:
                    print(f"Note: Registration columns may already exist: {e}")
                
                # Add early bird columns to events if they don't exist
                try:
                    cur.execute("""
                        ALTER TABLE events 
                        ADD COLUMN IF NOT EXISTS early_bird_discount INTEGER DEFAULT 10,
                        ADD COLUMN IF NOT EXISTS early_bird_deadline INTEGER DEFAULT 5,
                        ADD COLUMN IF NOT EXISTS has_early_bird BOOLEAN DEFAULT TRUE,
                        ADD COLUMN IF NOT EXISTS category VARCHAR(100),
                        ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT FALSE,
                        ADD COLUMN IF NOT EXISTS registration_link VARCHAR(500),
                        ADD COLUMN IF NOT EXISTS max_participants INTEGER
                    """)
                    conn.commit()
                    print("Added early bird columns to events table")
                except Exception as e:
                    print(f"Note: Early bird columns may already exist: {e}")
                
                # Add contact_submissions table if not exists
                try:
                    cur.execute("""
                        CREATE TABLE IF NOT EXISTS contact_submissions (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR(100) NOT NULL,
                            email VARCHAR(100) NOT NULL,
                            message TEXT NOT NULL,
                            submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            status VARCHAR(20) DEFAULT 'unread'
                        )
                    """)
                    conn.commit()
                    print("Contact submissions table verified")
                except Exception as e:
                    print(f"Note: Contact submissions table: {e}")
            
            # Check and add artists if needed
            cur.execute("SELECT COUNT(*) FROM artists")
            artist_count = cur.fetchone()[0]
            if artist_count == 0:
                print("Creating artists...")
                cur.execute("""
                    INSERT INTO artists (name, description) VALUES
                    ('John Doe', 'Famous rock artist'),
                    ('Jane Smith', 'Popular pop singer'),
                    ('The Band', 'Indie rock band')
                """)
                conn.commit()
            
            # Check and add events if needed
            cur.execute("SELECT COUNT(*) FROM events")
            event_count = cur.fetchone()[0]
            if event_count == 0:
                print("Creating events...")
                cur.execute("SELECT id FROM artists LIMIT 1")
                artist_id = cur.fetchone()[0]
                
                cur.execute("""
                    INSERT INTO events (name, description, date, venue, price, available_tickets, artist_id, status, category, is_free, early_bird_discount, early_bird_deadline, has_early_bird) VALUES
                    ('Annual Farewell Party', 'Farewell party organized by Software Department', CURRENT_DATE + INTERVAL '10 days', 'Arena', 150.00, 500, %s, 'active', 'Major Festivals & Trips', FALSE, 10, 5, TRUE),
                    ('Beach Party', 'Annual beach party for SSUET students', CURRENT_DATE + INTERVAL '15 days', 'Sea View Karachi', 120.00, 1000, %s, 'active', 'Major Festivals & Trips', FALSE, 10, 5, TRUE),
                    ('DreamWorld Trip', 'Exciting trip to DreamWorld', CURRENT_DATE + INTERVAL '20 days', 'DreamWorld Karachi', 200.00, 300, %s, 'active', 'Major Festivals & Trips', FALSE, 10, 5, TRUE),
                    ('AI Hackathon', 'Artificial Intelligence Hackathon', CURRENT_DATE + INTERVAL '5 days', 'KSBL Pakistan', 50.00, 300, %s, 'active', 'Tech & Academia', FALSE, 10, 5, TRUE),
                    ('ICISCT Conference', 'International Conference', CURRENT_DATE + INTERVAL '7 days', 'SSUET Conference Hall', 250.00, 200, %s, 'active', 'Tech & Academia', FALSE, 10, 5, TRUE),
                    ('IEEE SSUET WIE Seminar', 'Women in Engineering seminar', CURRENT_DATE + INTERVAL '3 days', 'SSUET CS Department', 30.00, 150, %s, 'active', 'Society-Led Events', FALSE, 10, 5, TRUE),
                    ('IEEE Student Branch Workshop', 'Technical workshop', CURRENT_DATE + INTERVAL '4 days', 'SSUET Seminar Hall', 40.00, 200, %s, 'active', 'Society-Led Events', FALSE, 10, 5, TRUE),
                    ('GDG SSUET DevFest', 'Developer Festival', CURRENT_DATE + INTERVAL '6 days', 'SSUET Main Hall', 60.00, 350, %s, 'active', 'Society-Led Events', FALSE, 10, 5, TRUE),
                    ('SSUET Sports Gala', 'Annual sports competition', CURRENT_DATE + INTERVAL '12 days', 'SSUET Sports Complex', 50.00, 800, %s, 'active', 'Sports & Competitions', FALSE, 10, 5, TRUE)
                """, (artist_id, artist_id, artist_id, artist_id, artist_id, artist_id, artist_id, artist_id, artist_id))
                conn.commit()
                print(f"Created events successfully")
            
            # Ensure foreign key has CASCADE delete
            try:
                cur.execute("""
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'bookings_user_id_fkey'
                """)
                if cur.fetchone():
                    cur.execute("""
                        ALTER TABLE bookings 
                        DROP CONSTRAINT IF EXISTS bookings_user_id_fkey,
                        ADD CONSTRAINT bookings_user_id_fkey 
                        FOREIGN KEY (user_id) 
                        REFERENCES users(id) 
                        ON DELETE CASCADE
                    """)
                    conn.commit()
                    print("Updated foreign key constraint with CASCADE DELETE")
            except Exception as e:
                print(f"Note: Foreign key constraint update: {e}")
        
        print("Database initialised successfully.")
        return True
    except Exception as e:
        print(f"Error initializing database: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def ensure_admin_exists():
    """Create admin user if it doesn't exist"""
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to database for admin creation")
        return False
    
    try:
        with conn.cursor() as cur:
            # Check if admin exists
            cur.execute("SELECT id, password FROM users WHERE email = %s", ("admin@example.com",))
            existing_admin = cur.fetchone()
            
            if existing_admin:
                print(f"Admin user already exists with ID: {existing_admin[0]}")
                # Verify and reset password if needed
                test_password = "admin123"
                if check_password_hash(existing_admin[1], test_password):
                    print("Admin password is correct!")
                else:
                    print("Admin password incorrect. Resetting to 'admin123'...")
                    new_hash = generate_password_hash("admin123")
                    cur.execute("UPDATE users SET password = %s WHERE email = 'admin@example.com'", (new_hash,))
                    conn.commit()
                    print("Admin password reset successfully!")
                return True
            
            # Create new admin user
            hashed_password = generate_password_hash("admin123")
            cur.execute("""
                INSERT INTO users (
                    first_name, last_name, email, password, is_admin
                )
                VALUES (%s, %s, %s, %s, %s)
            """, (
                "Admin", "User", "admin@example.com", hashed_password, True
            ))
            
            conn.commit()
            print("=" * 50)
            print("ADMIN USER CREATED SUCCESSFULLY!")
            print("Admin Email: admin@example.com")
            print("Admin Password: admin123")
            print("=" * 50)
            return True
    except Exception as e:
        print(f"Error creating admin user: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

# ============================================
# AUTHENTICATION ENDPOINTS
# ============================================

@app.route('/api/validate-registration', methods=['POST'])
def validate_registration():
    """Validate registration number format and check if exists"""
    data = request.get_json()
    registration_number = data.get('registration_number', '').upper()
    
    pattern = r'^(\d{4})(F|S)-([A-Z]{3,4})-(\d{1,3})$'
    match = re.match(pattern, registration_number)
    
    if not match:
        return jsonify({
            'success': False, 
            'error': 'Invalid registration number format. Example: 2023F-BSE-332'
        }), 400
    
    batch_year, semester, degree, roll_no = match.groups()
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id FROM users WHERE registration_number = %s", 
                (registration_number,)
            )
            exists = cur.fetchone() is not None
            
            return jsonify({
                'success': True,
                'valid': True,
                'exists': exists,
                'parsed': {
                    'batch_year': int(batch_year),
                    'semester': 'Fall' if semester == 'F' else 'Spring',
                    'semester_code': semester,
                    'degree': degree,
                    'roll_number': roll_no
                }
            })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')
    registration_number = data.get('registration_number', '').upper()
    degree = data.get('degree')
    batch_year = data.get('batch_year')
    semester = data.get('semester')
    roll_number = data.get('roll_number')
    
    if not all([first_name, last_name, email, password]):
        return jsonify({'success': False, 'error': 'Please fill all required fields'}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection error'}), 500
    
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                return jsonify({'success': False, 'error': 'Email already registered'}), 400
            
            if registration_number:
                cur.execute("SELECT id FROM users WHERE registration_number = %s", (registration_number,))
                if cur.fetchone():
                    return jsonify({'success': False, 'error': 'Registration number already registered'}), 400
            
            hashed_password = generate_password_hash(password)
            cur.execute("""
                INSERT INTO users (first_name, last_name, email, phone, password, is_admin,
                                   registration_number, degree, batch_year, semester, roll_number)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
            """, (first_name, last_name, email, phone, hashed_password, False,
                  registration_number, degree, batch_year, semester, roll_number))
            
            conn.commit()
            return jsonify({'success': True, 'message': 'Registration successful'})
    except Exception as e:
        conn.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('user_type', 'user')
    
    print(f"Login attempt - Email: {email}, User Type: {user_type}")
    
    if not email or not password:
        return jsonify({'success': False, 'error': 'Please enter both email and password'}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection error'}), 500
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Check if login is by registration number or email
            if re.match(r'^\d{4}[FS]-[A-Z]{3,4}-\d{1,3}$', email.upper()):
                cur.execute("""
                    SELECT id, first_name, last_name, email, password, is_admin,
                           registration_number, degree, batch_year, semester, roll_number, phone
                    FROM users WHERE registration_number = %s
                """, (email.upper(),))
            else:
                cur.execute("""
                    SELECT id, first_name, last_name, email, password, is_admin,
                           registration_number, degree, batch_year, semester, roll_number, phone
                    FROM users WHERE email = %s
                """, (email,))
            
            user = cur.fetchone()
            
            if not user:
                print(f"User not found for: {email}")
                return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
            
            print(f"User found: {user['email']}, is_admin: {user['is_admin']}")
            
            if not check_password_hash(user['password'], password):
                print(f"Password check failed for: {email}")
                return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
            
            # Check user type matches
            if user_type == 'admin' and not user['is_admin']:
                print(f"Non-admin trying to access admin: {email}")
                return jsonify({'success': False, 'error': 'Invalid account type'}), 401
            
            if user_type == 'user' and user['is_admin']:
                print(f"Admin trying to access user area: {email}")
                return jsonify({'success': False, 'error': 'Invalid account type'}), 401
            
            session['user_id'] = user['id']
            session['user_name'] = f"{user['first_name']} {user['last_name']}"
            session['is_admin'] = user['is_admin']
            session['registration_number'] = user['registration_number']
            
            print(f"Login successful for: {email}")
            
            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],
                    'first_name': user['first_name'],
                    'last_name': user['last_name'],
                    'email': user['email'],
                    'phone': user['phone'],
                    'registration_number': user['registration_number'],
                    'degree': user['degree'],
                    'batch_year': user['batch_year'],
                    'semester': user['semester'],
                    'roll_number': user['roll_number'],
                    'is_admin': user['is_admin']
                }
            })
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out'})

# ============================================
# EVENT ENDPOINTS
# ============================================

@app.route('/api/events', methods=['GET'])
def api_events():
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection error'}), 500
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT e.id, e.name as eventname, e.available_tickets, e.price,
                a.name as artistname, e.venue, e.status as eventstatus, e.date,
                COALESCE(e.category, 'Society-Led Events') as category,
                COALESCE(e.is_free, FALSE) as is_free,
                e.registration_link, e.description,
                COALESCE(e.early_bird_discount, 10) as early_bird_discount,
                COALESCE(e.early_bird_deadline, 5) as early_bird_deadline,
                COALESCE(e.has_early_bird, TRUE) as has_early_bird
                FROM events e
                JOIN artists a ON e.artist_id = a.id
                WHERE e.status = 'active'
                ORDER BY e.date
            """)
            events = cur.fetchall()
            
            today = datetime.now().date()
            
            for event in events:
                if event['date']:
                    event_date = event['date']
                    days_until_event = (event_date - today).days
                    
                    if (event['has_early_bird'] and 
                        days_until_event >= 3 and 
                        days_until_event <= event['early_bird_deadline'] + 2 and 
                        event['is_free'] == False):
                        discount = event['early_bird_discount']
                        original_price = float(event['price'])
                        discounted_price = original_price * (1 - discount / 100)
                        event['early_bird_price'] = round(discounted_price, 2)
                        event['early_bird_available'] = True
                        event['days_left_for_early_bird'] = days_until_event - 2
                    else:
                        event['early_bird_available'] = False
                        event['early_bird_price'] = None
            
            return jsonify({'success': True, 'events': events})
    except Exception as e:
        print(f"Error in api_events: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/events/available', methods=['GET'])
def api_events_available():
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection error'}), 500
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT id, name, date, venue, price, available_tickets, category, is_free,
                COALESCE(early_bird_discount, 10) as early_bird_discount,
                COALESCE(early_bird_deadline, 5) as early_bird_deadline,
                COALESCE(has_early_bird, TRUE) as has_early_bird
                FROM events
                WHERE date >= CURRENT_DATE AND status = 'active' AND available_tickets > 0
                ORDER BY date
            """)
            events = cur.fetchall()
            
            today = datetime.now().date()
            
            for event in events:
                event_date = event['date']
                days_until_event = (event_date - today).days
                
                if (event['has_early_bird'] and 
                    days_until_event >= 3 and 
                    days_until_event <= event['early_bird_deadline'] + 2 and 
                    event['is_free'] == False):
                    event['early_bird_available'] = True
                    event['days_left_for_early_bird'] = days_until_event - 2
                else:
                    event['early_bird_available'] = False
            
            return jsonify({'success': True, 'events': events})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

# ============================================
# BOOKING ENDPOINTS
# ============================================

@app.route('/api/booking', methods=['POST'])
def api_booking():
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Please login first'}), 401
    
    data = request.get_json()
    event_id = data.get('event_id')
    num_tickets = data.get('num_tickets', 1)
    payment_method = data.get('payment_method')
    use_early_bird = data.get('use_early_bird', True)
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection error'}), 500
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT id, name, price, available_tickets, date, is_free,
                COALESCE(early_bird_discount, 10) as early_bird_discount,
                COALESCE(early_bird_deadline, 5) as early_bird_deadline,
                COALESCE(has_early_bird, TRUE) as has_early_bird
                FROM events WHERE id = %s AND status = 'active'
            """, (event_id,))
            
            event = cur.fetchone()
            if not event:
                return jsonify({'success': False, 'error': 'Event not found'}), 404
            
            if event['available_tickets'] < num_tickets:
                return jsonify({'success': False, 'error': f'Only {event["available_tickets"]} tickets available'}), 400
            
            original_price = float(event['price'])
            event_date = event['date']
            days_until_event = (event_date - datetime.now().date()).days
            
            if (use_early_bird and event['has_early_bird'] and 
                days_until_event >= 3 and 
                days_until_event <= event['early_bird_deadline'] + 2 and 
                event['is_free'] == False):
                discount = event['early_bird_discount']
                price_per_ticket = original_price * (1 - discount / 100)
                total_price = round(price_per_ticket * num_tickets, 2)
                discount_applied = True
                discount_percentage = discount
            else:
                price_per_ticket = original_price
                total_price = original_price * num_tickets
                discount_applied = False
                discount_percentage = 0
            
            cur.execute("""
                INSERT INTO bookings (user_id, event_id, num_tickets, total_price, status, booking_date, payment_method)
                VALUES (%s, %s, %s, %s, %s, CURRENT_DATE, %s) RETURNING id
            """, (session['user_id'], event_id, num_tickets, total_price, 'active', payment_method))
            
            booking_id = cur.fetchone()['id']
            
            cur.execute("UPDATE events SET available_tickets = available_tickets - %s WHERE id = %s", (num_tickets, event_id))
            
            conn.commit()
            
            return jsonify({
                'success': True, 
                'message': 'Booking successful!',
                'booking_id': booking_id,
                'discount_applied': discount_applied,
                'discount_percentage': discount_percentage,
                'original_price': original_price,
                'final_price': price_per_ticket,
                'total_amount': total_price
            })
    except Exception as e:
        conn.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/user/bookings', methods=['GET'])
def api_user_bookings():
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT b.id, e.name as event_name, b.num_tickets, b.total_price,
                       b.booking_date, e.date as event_date, e.venue as event_venue,
                       b.status, b.payment_method
                FROM bookings b
                JOIN events e ON b.event_id = e.id
                WHERE b.user_id = %s
                ORDER BY b.booking_date DESC
            """, (session['user_id'],))
            bookings = cur.fetchall()
            return jsonify({'success': True, 'bookings': bookings})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/cancel-booking/<int:booking_id>', methods=['POST'])
def api_cancel_booking(booking_id):
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT event_id, num_tickets, user_id, booking_date, status FROM bookings WHERE id = %s", (booking_id,))
            booking = cur.fetchone()
            if not booking or booking[2] != session['user_id']:
                return jsonify({'success': False, 'error': 'Invalid booking'}), 404
            
            if booking[4] != 'active':
                return jsonify({'success': False, 'error': 'Booking already cancelled'}), 400
            
            cancel_deadline = booking[3] + timedelta(days=1)
            if datetime.now().date() > cancel_deadline:
                return jsonify({'success': False, 'error': 'Cancellation period has expired (only 24 hours allowed)'}), 400
            
            cur.execute("UPDATE bookings SET status = 'cancelled' WHERE id = %s", (booking_id,))
            cur.execute("UPDATE events SET available_tickets = available_tickets + %s WHERE id = %s", (booking[1], booking[0]))
            conn.commit()
            return jsonify({'success': True, 'message': 'Booking cancelled successfully'})
    except Exception as e:
        conn.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

# ============================================
# USER PROFILE ENDPOINTS
# ============================================

@app.route('/api/user/profile', methods=['GET'])
def api_user_profile():
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT id, first_name, last_name, email, phone, registration_number, 
                       degree, batch_year, semester, roll_number 
                FROM users WHERE id = %s
            """, (session['user_id'],))
            user = cur.fetchone()
            return jsonify({'success': True, 'user': user})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/user/profile', methods=['PUT'])
def api_update_profile():
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE users 
                SET first_name = %s, last_name = %s, email = %s, phone = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (data['first_name'], data['last_name'], data['email'], data['phone'], session['user_id']))
            conn.commit()
            return jsonify({'success': True, 'message': 'Profile updated successfully'})
    except Exception as e:
        conn.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

# ============================================
# CONTACT ENDPOINTS
# ============================================

@app.route('/api/contact', methods=['POST'])
def api_contact():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')
    
    if not all([name, email, message]):
        return jsonify({'success': False, 'error': 'All fields are required'}), 400
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO contact_submissions (name, email, message, submission_date, status)
                VALUES (%s, %s, %s, CURRENT_TIMESTAMP, 'unread')
            """, (name, email, message))
            conn.commit()
            return jsonify({'success': True, 'message': 'Message sent successfully'})
    except Exception as e:
        conn.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

# ============================================
# ADMIN DASHBOARD STATS ENDPOINT
# ============================================

@app.route('/api/admin/stats', methods=['GET'])
def api_admin_stats():
    """Get dashboard statistics for admin"""
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Total events
            cur.execute("SELECT COUNT(*) as total FROM events")
            total_events = cur.fetchone()['total']
            
            # Active events (upcoming)
            cur.execute("SELECT COUNT(*) as active FROM events WHERE status = 'active' AND date >= CURRENT_DATE")
            active_events = cur.fetchone()['active']
            
            # Total users (non-admin)
            cur.execute("SELECT COUNT(*) as total FROM users WHERE is_admin = False")
            total_users = cur.fetchone()['total']
            
            # Total active bookings
            cur.execute("SELECT COUNT(*) as total FROM bookings WHERE status = 'active'")
            total_bookings = cur.fetchone()['total']
            
            # Total revenue from active bookings
            cur.execute("SELECT COALESCE(SUM(total_price), 0) as total FROM bookings WHERE status = 'active'")
            total_revenue = cur.fetchone()['total']
            
            # Pending contacts (unread)
            cur.execute("SELECT COUNT(*) as pending FROM contact_submissions WHERE status = 'unread'")
            pending_contacts = cur.fetchone()['pending']
            
            return jsonify({
                'success': True,
                'stats': {
                    'totalEvents': total_events,
                    'activeEvents': active_events,
                    'totalUsers': total_users,
                    'totalBookings': total_bookings,
                    'totalRevenue': float(total_revenue),
                    'pendingContacts': pending_contacts
                }
            })
    except Exception as e:
        print(f"Error in api_admin_stats: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

# ============================================
# ADMIN EVENT MANAGEMENT ENDPOINTS
# ============================================

@app.route('/api/admin/events', methods=['GET'])
def api_admin_events():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT e.*, a.name as artistname
                FROM events e
                LEFT JOIN artists a ON e.artist_id = a.id
                ORDER BY e.date DESC
            """)
            events = cur.fetchall()
            # Convert date to string for JSON serialization
            for event in events:
                if event.get('date'):
                    event['date'] = event['date'].isoformat()
                if event.get('created_at'):
                    event['created_at'] = event['created_at'].isoformat() if hasattr(event['created_at'], 'isoformat') else event['created_at']
            return jsonify({'success': True, 'events': events})
    except Exception as e:
        print(f"Error in api_admin_events: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/admin/events', methods=['POST'])
def api_admin_add_event():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Get or create default artist
            cur.execute("SELECT id FROM artists LIMIT 1")
            artist = cur.fetchone()
            if not artist:
                cur.execute("""
                    INSERT INTO artists (name, description) 
                    VALUES ('SSUET Event Organizer', 'Default event organizer')
                    RETURNING id
                """)
                artist_id = cur.fetchone()[0]
            else:
                artist_id = artist[0]
            
            cur.execute("""
                INSERT INTO events (name, date, venue, price, available_tickets, description, 
                                   artist_id, status, category, is_free, 
                                   early_bird_discount, early_bird_deadline, has_early_bird,
                                   registration_link, max_participants)
                VALUES (%s, %s, %s, %s, %s, %s, %s, 'active', %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                data['name'], data['date'], data['venue'], 
                data.get('price', 0), data['available_tickets'], 
                data.get('description', ''), artist_id, 
                data.get('category', 'Society-Led Events'), 
                data.get('is_free', False),
                data.get('early_bird_discount', 10), 
                data.get('early_bird_deadline', 5), 
                data.get('has_early_bird', True),
                data.get('registration_link', ''),
                data.get('max_participants', data['available_tickets'])
            ))
            
            conn.commit()
            return jsonify({'success': True, 'message': 'Event added successfully'})
    except Exception as e:
        conn.rollback()
        print(f"Error adding event: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/admin/events/<int:event_id>', methods=['PUT'])
def api_admin_update_event(event_id):
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE events 
                SET name=%s, date=%s, venue=%s, price=%s, available_tickets=%s, 
                    description=%s, category=%s, is_free=%s, 
                    early_bird_discount=%s, early_bird_deadline=%s, has_early_bird=%s,
                    registration_link=%s
                WHERE id=%s
            """, (
                data['name'], data['date'], data['venue'], 
                data.get('price', 0), data['available_tickets'], 
                data.get('description', ''), 
                data.get('category', 'Society-Led Events'), 
                data.get('is_free', False),
                data.get('early_bird_discount', 10), 
                data.get('early_bird_deadline', 5), 
                data.get('has_early_bird', True),
                data.get('registration_link', ''),
                event_id
            ))
            conn.commit()
            return jsonify({'success': True, 'message': 'Event updated successfully'})
    except Exception as e:
        conn.rollback()
        print(f"Error updating event: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/admin/events/<int:event_id>', methods=['DELETE'])
def api_admin_delete_event(event_id):
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Soft delete - just update status to cancelled
            cur.execute("UPDATE events SET status='cancelled' WHERE id=%s", (event_id,))
            conn.commit()
            return jsonify({'success': True, 'message': 'Event deleted successfully'})
    except Exception as e:
        conn.rollback()
        print(f"Error deleting event: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

# ============================================
# ADMIN USER MANAGEMENT ENDPOINTS
# ============================================

@app.route('/api/admin/users', methods=['GET'])
def api_admin_users():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT id, first_name, last_name, email, phone, registration_number, 
                       degree, batch_year, semester, roll_number, created_at
                FROM users 
                WHERE is_admin = False
                ORDER BY id DESC
            """)
            users = cur.fetchall()
            for user in users:
                if user.get('created_at'):
                    user['created_at'] = user['created_at'].isoformat() if hasattr(user['created_at'], 'isoformat') else user['created_at']
            return jsonify({'success': True, 'users': users})
    except Exception as e:
        print(f"Error in api_admin_users: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def api_admin_delete_user(user_id):
    """Delete a user and all their associated bookings"""
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection error'}), 500
    
    try:
        with conn.cursor() as cur:
            # First check if user has any active bookings (not cancelled)
            cur.execute("""
                SELECT COUNT(*) FROM bookings 
                WHERE user_id = %s AND status = 'active'
            """, (user_id,))
            active_count = cur.fetchone()[0]
            
            if active_count > 0:
                return jsonify({
                    'success': False, 
                    'error': f'User has {active_count} active booking(s). Cannot delete.'
                }), 400
            
            # Delete user's bookings first (even cancelled ones)
            cur.execute("DELETE FROM bookings WHERE user_id = %s", (user_id,))
            
            # Then delete the user (ensure not deleting admin)
            cur.execute("""
                DELETE FROM users 
                WHERE id = %s AND is_admin = False 
                RETURNING id
            """, (user_id,))
            
            deleted = cur.fetchone()
            if not deleted:
                return jsonify({
                    'success': False, 
                    'error': 'User not found or is an admin account'
                }), 404
            
            conn.commit()
            return jsonify({'success': True, 'message': 'User deleted successfully'})
            
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database error deleting user: {e}")
        return jsonify({'success': False, 'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        conn.rollback()
        print(f"Error deleting user: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

# ============================================
# ADMIN BOOKINGS MANAGEMENT ENDPOINTS
# ============================================

@app.route('/api/admin/bookings', methods=['GET'])
def api_admin_bookings():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT b.id, u.first_name || ' ' || u.last_name as user_name,
                       u.registration_number, u.email as user_email,
                       e.name as event_name, e.date as event_date, e.venue as event_venue,
                       b.num_tickets, b.total_price, b.status, b.booking_date, 
                       b.payment_method
                FROM bookings b
                JOIN events e ON b.event_id = e.id
                JOIN users u ON b.user_id = u.id
                ORDER BY b.booking_date DESC
            """)
            bookings = cur.fetchall()
            for booking in bookings:
                if booking.get('booking_date'):
                    booking['booking_date'] = booking['booking_date'].isoformat() if hasattr(booking['booking_date'], 'isoformat') else booking['booking_date']
                if booking.get('event_date'):
                    booking['event_date'] = booking['event_date'].isoformat() if hasattr(booking['event_date'], 'isoformat') else booking['event_date']
            return jsonify({'success': True, 'bookings': bookings})
    except Exception as e:
        print(f"Error in api_admin_bookings: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

# ============================================
# ADMIN CONTACT MANAGEMENT ENDPOINTS
# ============================================

@app.route('/api/admin/contacts', methods=['GET'])
def api_admin_contacts():
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT id, name, email, message, submission_date, status 
                FROM contact_submissions 
                ORDER BY 
                    CASE WHEN status = 'unread' THEN 0 ELSE 1 END,
                    submission_date DESC
            """)
            contacts = cur.fetchall()
            for contact in contacts:
                if contact.get('submission_date'):
                    contact['submission_date'] = contact['submission_date'].isoformat() if hasattr(contact['submission_date'], 'isoformat') else contact['submission_date']
            return jsonify({'success': True, 'contacts': contacts})
    except Exception as e:
        print(f"Error in api_admin_contacts: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/admin/contacts/<int:contact_id>/read', methods=['PUT'])
def api_admin_contact_read(contact_id):
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("UPDATE contact_submissions SET status='read' WHERE id=%s", (contact_id,))
            conn.commit()
            return jsonify({'success': True, 'message': 'Marked as read'})
    except Exception as e:
        conn.rollback()
        print(f"Error marking contact as read: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/admin/contacts/<int:contact_id>', methods=['DELETE'])
def api_admin_delete_contact(contact_id):
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM contact_submissions WHERE id=%s", (contact_id,))
            conn.commit()
            return jsonify({'success': True, 'message': 'Contact deleted successfully'})
    except Exception as e:
        conn.rollback()
        print(f"Error deleting contact: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

# ============================================
# ADMIN ATTENDANCE MARKING ENDPOINT
# ============================================

@app.route('/api/admin/attendance/<int:booking_id>', methods=['POST'])
def api_admin_mark_attendance(booking_id):
    """Mark attendance for a booking"""
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Check if attendance table exists, create if not
            cur.execute("""
                CREATE TABLE IF NOT EXISTS attendance (
                    id SERIAL PRIMARY KEY,
                    booking_id INTEGER REFERENCES bookings(id),
                    marked_by INTEGER REFERENCES users(id),
                    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status VARCHAR(20) DEFAULT 'present'
                )
            """)
            conn.commit()
            
            # Check if already marked
            cur.execute("SELECT id FROM attendance WHERE booking_id=%s", (booking_id,))
            if cur.fetchone():
                return jsonify({'success': False, 'error': 'Attendance already marked for this booking'}), 400
            
            # Mark attendance
            cur.execute("""
                INSERT INTO attendance (booking_id, marked_by, marked_at, status)
                VALUES (%s, %s, CURRENT_TIMESTAMP, 'present')
            """, (booking_id, session['user_id']))
            conn.commit()
            
            return jsonify({'success': True, 'message': 'Attendance marked successfully'})
    except Exception as e:
        conn.rollback()
        print(f"Error marking attendance: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/admin/attendance/event/<int:event_id>', methods=['GET'])
def api_admin_event_attendance(event_id):
    """Get attendance for a specific event"""
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT a.id, a.booking_id, a.marked_at, a.status,
                       u.first_name, u.last_name, u.registration_number
                FROM attendance a
                JOIN bookings b ON a.booking_id = b.id
                JOIN users u ON b.user_id = u.id
                WHERE b.event_id = %s
                ORDER BY a.marked_at DESC
            """, (event_id,))
            attendance = cur.fetchall()
            return jsonify({'success': True, 'attendance': attendance})
    except Exception as e:
        print(f"Error getting attendance: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

# ============================================
# MAIN ENTRY POINT
# ============================================

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    # Ensure admin user exists
    ensure_admin_exists()
    
    print("\n" + "="*60)
    print("🚀 SERVER STARTED SUCCESSFULLY!")
    print("="*60)
    print("📍 Backend: http://localhost:5000")
    print("📍 Frontend: http://localhost:3000")
    print("\n👤 ADMIN CREDENTIALS:")
    print("   Email: admin@example.com")
    print("   Password: admin123")
    print("\n👤 STUDENT LOGIN:")
    print("   Use Registration Number (e.g., 2023F-BSE-332)")
    print("   Password: (set during registration)")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)