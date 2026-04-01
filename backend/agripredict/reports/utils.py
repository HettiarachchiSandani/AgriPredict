from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors
import pandas as pd

def generate_pdf(file_path, data):
    if not data:
        return

    headers = list(data[0].keys())
    table_data = [headers]  

    for row in data:
        table_data.append([str(row.get(h, "")) for h in headers])

    col_widths = [max(len(str(cell)) for cell in col) * 7 for col in zip(*table_data)]

    pdf = SimpleDocTemplate(file_path, pagesize=letter)
    table = Table(table_data, colWidths=col_widths, repeatRows=1)

    style = TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
        ('TEXTCOLOR', (0,0), (-1,0), colors.black),
        ('GRID', (0,0), (-1,-1), 1, colors.black),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8), 
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ])
    table.setStyle(style)

    elems = [table]
    pdf.build(elems)

def generate_excel(file_path, data):
    if not data:
        return
    df = pd.DataFrame(data)
    with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Report')
        worksheet = writer.sheets['Report']

        for idx, col in enumerate(df.columns, 1):
            max_length = max(df[col].astype(str).map(len).max(), len(col))
            worksheet.column_dimensions[worksheet.cell(row=1, column=idx).column_letter].width = max_length + 2