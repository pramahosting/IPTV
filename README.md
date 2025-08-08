## Prama-dashboard-agent

An AI-powered, modular Streamlit application that generates interactive dashboards from CSV uploads or database tables. It includes secure user authentication, session management, admin user management, modular insights, a schema mapper, and an Ollama LLM client.

### Features
- Secure login and signup with bcrypt (fallback to PBKDF2)
- Session management with encrypted cookies and persistent "Remember Me" tokens
- Admin role and Admin Panel to list/add/delete users
- Data input via CSV upload or database connection wizard (PostgreSQL, MySQL, MSSQL, Hive, Iceberg via Trino)
- Schema inference and data type detection
- Automatic dashboard generation (data preview, summary stats, histograms, bar charts)
- Extendable Business Insight Engine
- Modular Ollama LLM client (localhost:11434)
- Script to set up folders and sample data

### Requirements
- Python 3.10+
- Streamlit
- SQLite (bundled with Python)
- Optional: database drivers installed for your DB type

### Quick Start
1. Create and activate a virtual environment.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Initialize the project structure and database (creates admin user):
   ```bash
   python -m prama_dashboard_agent.utils.setup_project
   ```
4. Run the app:
   ```bash
   streamlit run app.py
   ```

### Default Admin Credentials
- Email: `admin@local`
- Password: `admin123`

You should change this password after first login in Admin Panel by deleting and re-creating the admin user.

### Ollama (optional)
Ensure Ollama is running locally on port 11434. For example, to run a model:
```bash
ollama run llama3.1
```
The app will try to call `http://localhost:11434` for enhanced insights.

### Project Structure
```
app.py
prama_dashboard_agent/
  core/
    auth.py
    db.py
    sessions.py
    schema_mapper.py
    insight_engine.py
    dashboard_generator.py
    data_connectors/
      base.py
      sqlalchemy_connector.py
    llm/
      ollama_client.py
  ui/
    admin_panel.py
    components.py
  utils/
    setup_project.py
sample_data/
  banking_customers.csv
  sample.sql
data/
logs/
output/
requirements.txt
README.md
```

### Security Notes
- Passwords are hashed with bcrypt when available, otherwise PBKDF2-HMAC-SHA256.
- Session tokens are random, stored hashed in the database, and the cookie value is encrypted using a server-side key.
- Due to Streamlit architectural constraints, HttpOnly cookies cannot be set directly. As a mitigation, encrypted cookies and server-side session validation are used. If you need strict HttpOnly cookies, consider running a separate backend (e.g., FastAPI) to manage auth and cookies.

### Database Connection Wizard
- Supports PostgreSQL, MySQL, MSSQL (pyodbc), Hive (PyHive), Iceberg via Trino.
- Provide host, port, username, password, and database/catalog/schema as needed. The wizard constructs the SQLAlchemy URL and fetches the selected table.

### Development
- Code is modular and documented for easy extension.
- Add new LLM clients by implementing the same interface as `ollama_client.py`.
- Add new databases by extending `data_connectors/base.py`.

### License
MIT
