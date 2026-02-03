-- RCI Service Portal - Refined Database Initialization Script
-- Splitting Users into Staff and Clients for better data isolation.

-- 1. Create Branches Table
CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Staff Table (Internal Users)
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- Admin, Manager, etc.
    staff_type VARCHAR(50),    -- Engineer, Sales, Secretary, Driver
    branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Clients Table (External Partners: Dealers & Customers)
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- Company Name or Individual Name
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    client_type VARCHAR(50) NOT NULL, -- Dealer, Customer
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
    credit_limit DECIMAL(15, 2) DEFAULT 0,
    outstanding_balance DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Service Requests Table (Created by Clients)
CREATE TABLE IF NOT EXISTS service_requests (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,      -- Service, Delivery, Quote
    priority VARCHAR(20) DEFAULT 'Medium',
    status VARCHAR(20) DEFAULT 'Pending',
    description TEXT,
    notes TEXT,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
    date_submitted DATE DEFAULT CURRENT_DATE
);

-- 5. Create Service Jobs Table (Assigned to Staff)
CREATE TABLE IF NOT EXISTS service_jobs (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES service_requests(id) ON DELETE CASCADE,
    assigned_staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'Active',
    start_date DATE DEFAULT CURRENT_DATE,
    completion_date DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Job Logs Table (Timeline)
CREATE TABLE IF NOT EXISTS job_logs (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES service_jobs(id) ON DELETE CASCADE,
    log_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create Activities Table (Schedules)
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    activity_date DATE NOT NULL,
    branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
    staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'Scheduled'
);

-- 8. Seed Initial Data
INSERT INTO branches (name, location) VALUES 
('Headquarters', 'Lagos'),
('Lagos Branch', 'Lagos Island'),
('Abuja Branch', 'Central Area')
ON CONFLICT (name) DO NOTHING;
