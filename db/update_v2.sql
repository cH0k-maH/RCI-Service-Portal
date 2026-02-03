-- Weekly Roster Table for Secretary Dashboard
CREATE TABLE IF NOT EXISTS weekly_roster (
    id SERIAL PRIMARY KEY,
    day_of_week VARCHAR(20) NOT NULL UNIQUE, -- Unique constraint to ensure one row per day
    axis VARCHAR(255),
    staff_text VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Data for Weekly Roster
INSERT INTO weekly_roster (day_of_week, axis, staff_text) VALUES
('Monday', 'Lekki / Ajah', 'Sarah, John'),
('Tuesday', 'Ikeja / Gbagada', 'Peter, Paul'),
('Wednesday', 'Victoria Island', 'Mike, John'),
('Thursday', 'Apapa / Surulere', 'Emmanuel'),
('Friday', 'Office Day', 'All Staff')
ON CONFLICT (day_of_week) DO UPDATE SET
    staff_text = EXCLUDED.staff_text;

-- Add Sales Rep ID to Clients
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS sales_rep_id INTEGER REFERENCES staff(id) ON DELETE SET NULL;
