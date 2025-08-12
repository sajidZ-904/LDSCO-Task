# LDSCO Tasks

This repository contains two separate projects:

1. **Task-1**: A Python application for extracting data from TIAA retirement statements
2. **Task-2**: A React-based retirement calculator web application

## Task-1: TIAA Statement Extractor

### Overview
A Python application that extracts key information from TIAA retirement benefit statements in PDF format. The tool parses account holder information, statement dates, portfolio balances, asset allocations, contributions, and other retirement plan details.

### Requirements
- Python 3.x
- Required packages (install via `pip install -r requirements.txt`):
  - PyPDF2 (3.0.1)
  - pandas (2.0.3)
  - pdfplumber (0.10.2)
  - pymupdf (1.23.3)
  - pdfminer.six (20221105)
  - regex (2023.6.3)
  - openpyxl (3.1.2)
  - xlsxwriter (3.1.2)

### Setup
1. Navigate to the Task-1 directory:
   ```bash
   cd Task-1
   ```

2. Create and activate a virtual environment (recommended):
   ```bash
   python3 -m venv env
   .\env\bin\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Usage
1. Place your TIAA PDF statement in the Task-1 directory
2. Run the main script:
   ```bash
   python3 main.py
   ```
3. The extracted data will be saved to CSV and text files in the same directory

## Task-2: Retirement Calculator

### Overview
A React-based web application that calculates retirement projections based on user inputs. The calculator provides estimates for future portfolio value and monthly retirement income under different market scenarios.

### Features
- Calculate projected retirement savings based on current balance, monthly contributions, expected returns, and time horizon
- View estimated monthly income during retirement
- Compare conservative, base case, and optimistic market scenarios
- Interactive chart visualization of portfolio growth over time

### Technologies
- React (v19.1.1)
- Recharts for data visualization
- Tailwind CSS for styling
- Lucide React for icons

### Setup
1. Navigate to the task-2 directory:
   ```bash
   cd task-2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize Tailwind CSS (if not already done):
   ```bash
   npx tailwindcss init -p
   ```

### Development
To run the application in development mode:
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Building for Production
To build the app for production:
```bash
npm run build
```
The build files will be created in the `build` folder, ready for deployment.

## License
This project is proprietary and confidential.